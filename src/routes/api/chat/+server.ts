import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createChatSchema } from '$lib/schemas/chat';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userChats = await db
		.select()
		.from(chats)
		.where(eq(chats.userId, locals.user.id))
		.orderBy(desc(chats.updatedAt));

	return json({ chats: userChats });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let rawBody: unknown = {};
	try {
		rawBody = await request.json();
	} catch {
		// body optional
	}

	const parseResult = createChatSchema.safeParse(rawBody);
	if (!parseResult.success) {
		return json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
	}

	const { title, isPinned } = parseResult.data;

	const [newChat] = await db
		.insert(chats)
		.values({
			userId: locals.user.id,
			title,
			isPinned
		})
		.returning();

	return json({ success: true, chat: newChat }, { status: 201 });
};
