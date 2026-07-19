import { json, type RequestHandler } from '@sveltejs/kit';
import { isUserUnlocked, unlockUser } from '$lib/server/unlock';
import { COUPON_CODE } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userId = locals.user.id;

	// Check if already unlocked
	const alreadyUnlocked = await isUserUnlocked(userId);
	if (alreadyUnlocked) {
		return json({ success: true, message: 'Already unlocked' });
	}

	let body: { code?: string } = {};
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const inputCode = body.code?.trim();
	if (!inputCode) {
		return json({ error: 'Coupon code is required' }, { status: 400 });
	}

	const validCode = COUPON_CODE.trim();

	if (inputCode.toUpperCase() !== validCode.toUpperCase()) {
		return json({ error: 'Invalid coupon code' }, { status: 400 });
	}

	// Unlock user and grant 5 credits
	await unlockUser(userId, 'coupon');

	return json({
		success: true,
		message: 'Paywall unlocked! 5 credits granted.'
	});
};
