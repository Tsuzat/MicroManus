import { json, type RequestHandler } from '@sveltejs/kit';
import {
	type UIMessage,
	ToolLoopAgent,
	isStepCount,
	toUIMessageStream,
	createUIMessageStreamResponse,
	convertToModelMessages
} from 'ai';
import { resolveModel } from '$lib/ai/resolve-model.server';
import { db } from '$lib/server/db';
import { messages as messagesTable, chats, usageEvents } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getModelConfig } from '$lib/ai/providers';
import { webSearch } from '$lib/ai/search-tool.server';

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
		return json({ error: 'Missing required fields' }, { status: 400 });
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

	const modelConfig = getModelConfig(modelId);
	let languageModel;
	try {
		languageModel = await resolveModel(modelId, locals.user.id);
	} catch (err: any) {
		return new Response(err.message || `Failed to resolve model`, { status: 400 });
	}

	// Build provider options for thinking models
	let providerOptions = undefined;
	if (modelConfig?.provider === 'anthropic') {
		providerOptions = {
			anthropic: { thinking: { type: 'enabled', budgetTokens: 10000 } }
		};
	} else if (modelConfig?.provider === 'openai') {
		providerOptions = {
			openai: {
				reasoningSummary: 'auto'
			}
		};
	}

	// --- Agent with webSearch tool always available ---
	const agent = new ToolLoopAgent({
		model: languageModel,
		tools: { webSearch },
		stopWhen: isStepCount(10), // Max 10 loop iterations
		providerOptions
	});

	// --- Stream the agent and persist on completion ---
	const result = await agent.stream({
		messages: await convertToModelMessages(messages),
		onStepStart: () => {},
		onEnd: async ({ text, usage, reasoningText, toolResults }) => {
			try {
				// 1. Persist user message
				const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
				if (lastUserMessage) {
					const userText =
						lastUserMessage.parts
							?.filter((p) => p.type === 'text')
							.map((p) => p.text)
							.join('\n') || '';
					const userFiles =
						lastUserMessage.parts
							?.filter((p) => p.type === 'file')
							.map((p) => ({
								type: 'file',
								mediaType: p.mediaType,
								url: p.url,
								filename: p.filename
							})) ?? [];
					const contentPayload =
						userFiles.length > 0 ? JSON.stringify({ text: userText, files: userFiles }) : userText;
					await db.insert(messagesTable).values({ chatId, role: 'user', content: contentPayload });
				}

				// 2. Extract tool invocations and sources
				const toolInvocations =
					toolResults?.map((tr: any) => ({
						state: 'result',
						toolCallId: tr.toolCallId,
						toolName: tr.toolName,
						args: tr.args || tr.input || {},
						result: tr.result || tr.output || {}
					})) || [];

				const sources: any[] = [];
				for (const t of toolInvocations) {
					if (t.toolName === 'webSearch' && t.result?.results) {
						sources.push(...t.result.results);
					}
				}

				// Handle encrypted reasoning for o1/o3-mini
				let finalReasoning = reasoningText || null;
				if (!finalReasoning && (modelId.includes('o1') || modelId.includes('o3-mini'))) {
					finalReasoning = '_(Reasoning content is encrypted and hidden by the provider)_';
				}

				const assistantContentPayload =
					toolInvocations.length > 0
						? JSON.stringify({ text, toolInvocations })
						: text;

				// 3. Persist assistant message
				const [assistantMsg] = await db
					.insert(messagesTable)
					.values({
						chatId,
						role: 'assistant',
						content: assistantContentPayload,
						reasoning: finalReasoning,
						sources: sources.length > 0 ? sources : null,
						modelId
					})
					.returning();

				// 4. Log usage
				if (usage) {
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

				// 5. Auto-title
				if (chat.title === 'New Chat' && lastUserMessage) {
					const t =
						lastUserMessage.parts
							?.filter((p) => p.type === 'text')
							.map((p: any) => p.text)
							.join(' ') || '';
					const autoTitle = t.slice(0, 80) + (t.length > 80 ? '…' : '');
					if (autoTitle)
						await db
							.update(chats)
							.set({ title: autoTitle, updatedAt: new Date() })
							.where(eq(chats.id, chatId));
				} else {
					await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId));
				}
			} catch (err) {
				console.error('[AI Chat] Failed to persist messages:', err);
			}
		}
	});

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({
			stream: result.stream,
			tools: agent.tools,
			sendReasoning: true,
			sendSources: true
		})
	});
};
