import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isUserUnlocked } from '$lib/server/unlock';
import { db } from '$lib/server/db';
import { chats, apiKeys } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals: { user, session } }) => {
	if (!user) {
		return redirect(302, '/signin');
	}

	const unlocked = await isUserUnlocked(user.id);
	if (!unlocked) {
		return redirect(302, '/paywall');
	}

	// 1. Fetch top 5 pinned chats
	const pinnedChats = await db
		.select()
		.from(chats)
		.where(and(eq(chats.userId, user.id), eq(chats.isPinned, true), eq(chats.isArchived, false)))
		.orderBy(desc(chats.updatedAt))
		.limit(5);

	// 2. Fetch top 11 recent non-pinned chats (fetching 11 to check hasMore)
	const recentChatsRaw = await db
		.select()
		.from(chats)
		.where(and(eq(chats.userId, user.id), eq(chats.isPinned, false), eq(chats.isArchived, false)))
		.orderBy(desc(chats.updatedAt))
		.limit(11);

	const hasMore = recentChatsRaw.length > 10;
	const recentChats = recentChatsRaw.slice(0, 10);

	// 3. Fetch user API keys configuration status
	const userKeys = await db
		.select({ provider: apiKeys.provider, baseUrl: apiKeys.baseUrl })
		.from(apiKeys)
		.where(eq(apiKeys.userId, user.id));

	const keysConfigured = {
		openai: userKeys.some((k) => k.provider === 'openai'),
		anthropic: userKeys.some((k) => k.provider === 'anthropic'),
		google: userKeys.some((k) => k.provider === 'google'),
		kimi: userKeys.some((k) => k.provider === 'custom' && k.baseUrl?.includes('moonshot'))
	};

	return {
		user,
		session,
		chats: [...pinnedChats, ...recentChats],
		hasMore,
		keysConfigured
	};
};
