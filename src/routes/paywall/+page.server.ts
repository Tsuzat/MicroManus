import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isUserUnlocked } from '$lib/server/unlock';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (!user) {
		return redirect(302, '/signin');
	}

	const unlocked = await isUserUnlocked(user.id);
	if (unlocked) {
		return redirect(302, '/chat/new');
	}

	return { user };
};
