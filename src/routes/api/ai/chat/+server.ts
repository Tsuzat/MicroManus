import { json, type RequestHandler } from '@sveltejs/kit';
import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { resolveModel } from '$lib/ai/resolve-model.server';
import { db } from '$lib/server/db';
import { messages as messagesTable, chats, usageEvents } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getModelConfig } from '$lib/ai/providers';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const {
		messages,
		model: modelId,
		chatId
	}: { messages: UIMessage[]; model: string; chatId: string } = body;

	if (!messages || !modelId || !chatId) {
		return json({ error: 'Missing required fields: messages, model, chatId' }, { status: 400 });
	}

	// Verify chat ownership
	const [chat] = await db
		.select()
		.from(chats)
		.where(and(eq(chats.id, chatId), eq(chats.userId, locals.user.id)))
		.limit(1);

	if (!chat) {
		return json({ error: 'Chat not found or access denied' }, { status: 404 });
	}

	// Resolve the AI model
	let languageModel;
	try {
		languageModel = await resolveModel(modelId, locals.user.id);
	} catch (err: any) {
		return new Response(err.message || `Failed to resolve model: ${modelId}`, { status: 400 });
	}

	const result = streamText({
		model: languageModel,
		messages: await convertToModelMessages(messages),
		onFinish: async ({ text, usage }) => {
			try {
				// Find the last user message to persist
				const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

				if (lastUserMessage) {
					// Extract text content from the user message parts
					const userText = lastUserMessage.parts
						?.filter((p) => p.type === 'text')
						.map((p) => p.text)
						.join('\n') || '';

					// Persist user message
					await db.insert(messagesTable).values({
						chatId,
						role: 'user',
						content: userText
					});
				}

				// Persist assistant message
				const [assistantMsg] = await db
					.insert(messagesTable)
					.values({
						chatId,
						role: 'assistant',
						content: text
					})
					.returning();

				// Log usage event
				if (usage) {
					const modelConfig = getModelConfig(modelId);
					const inputTokens = usage.inputTokens ?? 0;
					const outputTokens = usage.outputTokens ?? 0;
					const inputCost = modelConfig
						? (inputTokens / 1_000_000) * modelConfig.pricing.inputPerMTok
						: 0;
					const outputCost = modelConfig
						? (outputTokens / 1_000_000) * modelConfig.pricing.outputPerMTok
						: 0;

					await db.insert(usageEvents).values({
						messageId: assistantMsg.id,
						userId: locals.user!.id,
						model: modelId,
						inputTokens,
						outputTokens,
						costUsd: (inputCost + outputCost).toFixed(6)
					});
				}

				// Auto-generate chat title from first user message if still "New Chat"
				if (chat.title === 'New Chat' && lastUserMessage) {
					const userText =
						lastUserMessage.parts
							?.filter((p) => p.type === 'text')
							.map((p) => p.text)
							.join(' ') || '';
					const autoTitle = userText.slice(0, 80) + (userText.length > 80 ? '…' : '');
					if (autoTitle) {
						await db
							.update(chats)
							.set({ title: autoTitle, updatedAt: new Date() })
							.where(eq(chats.id, chatId));
					}
				} else {
					// Update the chat's updatedAt timestamp
					await db
						.update(chats)
						.set({ updatedAt: new Date() })
						.where(eq(chats.id, chatId));
				}
			} catch (err) {
				console.error('[AI Chat] Failed to persist messages:', err);
			}
		}
	});

	return result.toUIMessageStreamResponse();
};
