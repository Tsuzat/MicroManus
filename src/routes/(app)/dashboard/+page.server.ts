import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usageEvents, chats, messages } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getModelConfig } from '$lib/ai/providers';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/signin');
	}

	const userId = locals.user.id;

	// Total usage
	const [totals] = await db
		.select({
			totalCost: sql<number>`sum(cast(${usageEvents.costUsd} as numeric))`,
			totalInputTokens: sql<number>`sum(${usageEvents.inputTokens})`,
			totalOutputTokens: sql<number>`sum(${usageEvents.outputTokens})`
		})
		.from(usageEvents)
		.where(eq(usageEvents.userId, userId));

	// Get total chats
	const [chatStats] = await db
		.select({
			totalChats: sql<number>`count(distinct ${chats.id})`
		})
		.from(chats)
		.where(eq(chats.userId, userId));

	// Get recent chats and join with usage
	const allChats = await db
		.select({
			id: chats.id,
			title: chats.title,
			createdAt: chats.createdAt
		})
		.from(chats)
		.where(eq(chats.userId, userId))
		.orderBy(desc(chats.createdAt));

	// Usage per chat requires a join through messages
	// Let's get usage per message and join with messages to map back to chat
	const usageByMsg = await db
		.select({
			chatId: messages.chatId,
			model: usageEvents.model,
			costUsd: usageEvents.costUsd,
			inputTokens: usageEvents.inputTokens,
			outputTokens: usageEvents.outputTokens,
			createdAt: usageEvents.createdAt
		})
		.from(usageEvents)
		.innerJoin(messages, eq(messages.id, usageEvents.messageId))
		.where(eq(usageEvents.userId, userId))
		.orderBy(desc(usageEvents.createdAt));

	// Map usage per chat
	const chatUsageMap = new Map();

	// Map usage per model for charts
	const modelUsageMap = new Map();

	for (const usage of usageByMsg) {
		const chatId = usage.chatId;
		if (!chatUsageMap.has(chatId)) {
			chatUsageMap.set(chatId, {
				id: chatId,
				title: '',
				costUsd: 0,
				inputTokens: 0,
				outputTokens: 0,
				models: new Set()
			});
		}

		const chatEntry = chatUsageMap.get(chatId);
		chatEntry.costUsd += Number(usage.costUsd || 0);
		chatEntry.inputTokens += usage.inputTokens || 0;
		chatEntry.outputTokens += usage.outputTokens || 0;
		chatEntry.models.add(getModelConfig(usage.model)?.label || usage.model);

		// Model map
		const model = usage.model;
		const modelLabel = getModelConfig(usage.model)?.label || model;
		if (!modelUsageMap.has(modelLabel)) {
			modelUsageMap.set(modelLabel, {
				name: modelLabel,
				costUsd: 0,
				tokens: 0
			});
		}
		const modelEntry = modelUsageMap.get(modelLabel);
		modelEntry.costUsd += Number(usage.costUsd || 0);
		modelEntry.tokens += (usage.inputTokens || 0) + (usage.outputTokens || 0);
	}

	// Merge chat titles
	const enrichedChatUsage = allChats
		.map((c) => {
			const usage = chatUsageMap.get(c.id);
			return {
				id: c.id,
				title: c.title,
				createdAt: c.createdAt,
				costUsd: usage?.costUsd || 0,
				inputTokens: usage?.inputTokens || 0,
				outputTokens: usage?.outputTokens || 0,
				models: Array.from(usage?.models || [])
			};
		})
		.filter((c) => c.costUsd > 0);

	return {
		stats: {
			totalCost: Number(totals?.totalCost || 0),
			totalInputTokens: Number(totals?.totalInputTokens || 0),
			totalOutputTokens: Number(totals?.totalOutputTokens || 0),
			totalChats: Number(chatStats?.totalChats || 0)
		},
		chatUsage: enrichedChatUsage,
		modelUsage: Array.from(modelUsageMap.values()).sort((a, b) => b.costUsd - a.costUsd)
	};
};
