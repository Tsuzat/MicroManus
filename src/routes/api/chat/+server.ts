import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chats } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createChatSchema } from '$lib/schemas/chat';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const limitParam = parseInt(url.searchParams.get('limit') || '10', 10);
	const offsetParam = parseInt(url.searchParams.get('offset') || '0', 10);
	const typeParam = url.searchParams.get('type') || 'recent';

	const limit = Math.min(Math.max(isNaN(limitParam) ? 10 : limitParam, 1), 50);
	const offset = Math.max(isNaN(offsetParam) ? 0 : offsetParam, 0);

	let whereClause;
	if (typeParam === 'pinned') {
		whereClause = and(
			eq(chats.userId, locals.user.id),
			eq(chats.isPinned, true),
			eq(chats.isArchived, false)
		);
	} else if (typeParam === 'recent') {
		whereClause = and(
			eq(chats.userId, locals.user.id),
			eq(chats.isPinned, false),
			eq(chats.isArchived, false)
		);
	} else {
		whereClause = and(eq(chats.userId, locals.user.id), eq(chats.isArchived, false));
	}

	const rawChats = await db
		.select()
		.from(chats)
		.where(whereClause)
		.orderBy(desc(chats.updatedAt))
		.limit(limit + 1)
		.offset(offset);

	const hasMore = rawChats.length > limit;
	const resultChats = rawChats.slice(0, limit);

	return json({
		chats: resultChats,
		hasMore,
		nextOffset: offset + limit
	});
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
		return json(
			{ error: 'Validation failed', details: parseResult.error.flatten() },
			{ status: 400 }
		);
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
