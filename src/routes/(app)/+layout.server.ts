import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isUserUnlocked } from '$lib/server/unlock';

export const load: LayoutServerLoad = async ({ locals: { user, session } }) => {
	if (!user) {
		return redirect(302, '/signin');
	}

	const unlocked = await isUserUnlocked(user.id);
	if (!unlocked) {
		return redirect(302, '/paywall');
	}

	return { user, session };
};
