import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isUserUnlocked } from '$lib/server/unlock';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals: { user, session } }) => {
	if (!user) {
		return redirect(302, '/signin');
	}

	const unlocked = await isUserUnlocked(user.id);
	if (!unlocked) {
		return redirect(302, '/paywall');
	}

	// load all the chats to load to sidebar
	const chats = await db.query.chats.findMany({
		where: (chats, { eq }) => eq(chats.userId, user.id)
	});

	return { user, session, chats };
};
