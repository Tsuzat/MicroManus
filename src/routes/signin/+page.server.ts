import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isUserUnlocked } from '$lib/server/unlock';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const unlocked = await isUserUnlocked(event.locals.user.id);
		if (unlocked) {
			return redirect(302, '/chat/new');
		}
		return redirect(302, '/paywall');
	}
	return {};
};
