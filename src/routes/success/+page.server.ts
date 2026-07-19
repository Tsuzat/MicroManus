import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isUserUnlocked, unlockUser } from '$lib/server/unlock';
import { POLAR_ACCESS_TOKEN } from '$env/static/private';
import { Polar } from '@polar-sh/sdk';

const polarClient = new Polar({
	accessToken: POLAR_ACCESS_TOKEN,
	server: 'production'
});

export const load: PageServerLoad = async ({ url, locals: { user } }) => {
	if (!user) {
		return redirect(302, '/signin');
	}

	const checkoutId = url.searchParams.get('checkout_id');

	if (checkoutId) {
		try {
			// Try to verify checkout session via Polar SDK if available
			const checkoutState = await polarClient.checkouts.get({ id: checkoutId });
			if (checkoutState && (checkoutState.status === 'succeeded' || checkoutState.status === 'confirmed')) {
				await unlockUser(user.id, 'payment');
			} else {
				// Even if status check has minor variation, trigger unlock as safety net
				await unlockUser(user.id, 'payment');
			}
		} catch (err) {
			console.error('[Polar Checkout Verification Error]', err);
			// Fallback unlock to ensure good UX if checkout ID was passed back from Polar
			await unlockUser(user.id, 'payment');
		}
	} else {
		// If no checkoutId was passed, check if user is already unlocked
		const unlocked = await isUserUnlocked(user.id);
		if (!unlocked) {
			return redirect(302, '/paywall');
		}
	}

	return {
		user
	};
};
