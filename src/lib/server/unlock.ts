import { db } from '$lib/server/db';
import { unlockStatus, creditsLedger } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from '$lib/server/cache';

/**
 * Checks if a user has unlocked the paywall.
 * Checks Redis cache first; falls back to database query and caches the result.
 */
export async function isUserUnlocked(userId: string): Promise<boolean> {
	if (!userId) return false;

	// 1. Check Redis cache first
	const cachedStatus = await cache.getUserUnlock(userId);
	if (cachedStatus !== null) {
		return cachedStatus;
	}

	// 2. DB fallback
	const [status] = await db
		.select()
		.from(unlockStatus)
		.where(eq(unlockStatus.userId, userId))
		.limit(1);

	const isUnlocked = Boolean(status?.unlocked);

	// 3. Cache the result in Redis
	await cache.setUserUnlock(userId, isUnlocked);

	return isUnlocked;
}

/**
 * Unlocks access for a user and grants 5 credits.
 * Safe against duplicate unlocks (idempotent).
 */
export async function unlockUser(
	userId: string,
	method: 'coupon' | 'payment'
): Promise<{ success: boolean; alreadyUnlocked: boolean }> {
	if (!userId) return { success: false, alreadyUnlocked: false };

	// Check existing unlock status
	const existingUnlocked = await isUserUnlocked(userId);
	if (existingUnlocked) {
		return { success: true, alreadyUnlocked: true };
	}

	const now = new Date();

	// Use transaction to ensure both unlock status and credits ledger update atomically
	await db.transaction(async (tx) => {
		// Upsert unlock_status
		await tx
			.insert(unlockStatus)
			.values({
				userId,
				unlocked: true,
				method,
				unlockedAt: now
			})
			.onConflictDoUpdate({
				target: unlockStatus.userId,
				set: {
					unlocked: true,
					method,
					unlockedAt: now
				}
			});

		// Add 5 credits ledger entry
		await tx.insert(creditsLedger).values({
			userId,
			delta: 5,
			reason: method === 'coupon' ? 'Unlock via Coupon Code' : 'Unlock via Payment'
		});
	});

	// Cache the updated status in Redis
	await cache.setUserUnlock(userId, true);

	return { success: true, alreadyUnlocked: false };
}
