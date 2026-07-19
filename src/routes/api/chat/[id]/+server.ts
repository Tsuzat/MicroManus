import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateChatSchema, chatIdParamSchema } from '$lib/schemas/chat';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const paramResult = chatIdParamSchema.safeParse(params);
	if (!paramResult.success) {
		return json({ error: 'Validation failed', details: paramResult.error.flatten() }, { status: 400 });
	}

	const { id } = paramResult.data;

	const [chat] = await db
		.select()
		.from(chats)
		.where(and(eq(chats.id, id), eq(chats.userId, locals.user.id)))
		.limit(1);

	if (!chat) {
		return json({ error: 'Chat not found' }, { status: 404 });
	}

	return json({ chat });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const paramResult = chatIdParamSchema.safeParse(params);
	if (!paramResult.success) {
		return json({ error: 'Validation failed', details: paramResult.error.flatten() }, { status: 400 });
	}

	const { id } = paramResult.data;

	let rawBody: unknown;
	try {
		rawBody = await request.json();
	} catch {
		return json({ error: 'Invalid JSON request body' }, { status: 400 });
	}

	const bodyResult = updateChatSchema.safeParse(rawBody);
	if (!bodyResult.success) {
		return json({ error: 'Validation failed', details: bodyResult.error.flatten() }, { status: 400 });
	}

	const { title, isPinned, isArchived } = bodyResult.data;

	const updateData: Partial<typeof chats.$inferInsert> = {
		updatedAt: new Date()
	};

	if (title !== undefined) updateData.title = title;
	if (isPinned !== undefined) updateData.isPinned = isPinned;
	if (isArchived !== undefined) updateData.isArchived = isArchived;

	const [updatedChat] = await db
		.update(chats)
		.set(updateData)
		.where(and(eq(chats.id, id), eq(chats.userId, locals.user.id)))
		.returning();

	if (!updatedChat) {
		return json({ error: 'Chat not found or access denied' }, { status: 404 });
	}

	return json({ success: true, chat: updatedChat });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const paramResult = chatIdParamSchema.safeParse(params);
	if (!paramResult.success) {
		return json({ error: 'Validation failed', details: paramResult.error.flatten() }, { status: 400 });
	}

	const { id } = paramResult.data;

	const [deletedChat] = await db
		.delete(chats)
		.where(and(eq(chats.id, id), eq(chats.userId, locals.user.id)))
		.returning();

	if (!deletedChat) {
		return json({ error: 'Chat not found or access denied' }, { status: 404 });
	}

	return json({ success: true, message: 'Chat deleted successfully' });
};
