import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { messages, chats } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { chatIdParamSchema } from '$lib/schemas/chat';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const paramResult = chatIdParamSchema.safeParse(params);
	if (!paramResult.success) {
		return json(
			{ error: 'Validation failed', details: paramResult.error.flatten() },
			{ status: 400 }
		);
	}

	const { id } = paramResult.data;

	// Verify chat ownership
	const [chat] = await db
		.select()
		.from(chats)
		.where(and(eq(chats.id, id), eq(chats.userId, locals.user.id)))
		.limit(1);

	if (!chat) {
		return json({ error: 'Chat not found' }, { status: 404 });
	}

	// Load messages ordered by creation time
	const chatMessages = await db
		.select()
		.from(messages)
		.where(eq(messages.chatId, id))
		.orderBy(asc(messages.createdAt));

	return json({ messages: chatMessages });
};
