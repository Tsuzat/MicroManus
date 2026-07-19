import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { chats, messages } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals: { user } }) => {
	if (!user) {
		return redirect(302, '/signin');
	}

	const { id } = params;

	// Load chat and verify ownership
	const [chat] = await db
		.select()
		.from(chats)
		.where(and(eq(chats.id, id), eq(chats.userId, user.id)))
		.limit(1);

	if (!chat) {
		return redirect(302, '/chat/new');
	}

	// Load messages
	const chatMessages = await db
		.select()
		.from(messages)
		.where(eq(messages.chatId, id))
		.orderBy(asc(messages.createdAt));

	return {
		chat,
		messages: chatMessages
	};
};
