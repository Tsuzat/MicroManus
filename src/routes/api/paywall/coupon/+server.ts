import { json, type RequestHandler } from '@sveltejs/kit';
import { isUserUnlocked, unlockUser } from '$lib/server/unlock';
import { COUPON_CODE } from '$env/static/private';
import { couponSchema } from '$lib/schemas/paywall';

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

	let rawBody: unknown;
	try {
		rawBody = await request.json();
	} catch {
		return json({ error: 'Invalid JSON request body' }, { status: 400 });
	}

	const parseResult = couponSchema.safeParse(rawBody);
	if (!parseResult.success) {
		return json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 });
	}

	const inputCode = parseResult.data.code;
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
