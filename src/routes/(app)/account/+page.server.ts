import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { creditsLedger, usageEvents, unlockStatus } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.session) {
		return redirect(302, '/signin');
	}

	const userId = locals.user.id;

	// 1. Fetch available credits (sum of delta from creditsLedger)
	const [creditsResult] = await db
		.select({
			balance: sql<number>`COALESCE(sum(${creditsLedger.delta}), 0)::int`
		})
		.from(creditsLedger)
		.where(eq(creditsLedger.userId, userId));

	// 2. Fetch usage cost and tokens
	const [usageResult] = await db
		.select({
			totalCost: sql<number>`COALESCE(sum(cast(${usageEvents.costUsd} as numeric)), 0.0)::float`,
			totalInputTokens: sql<number>`COALESCE(sum(${usageEvents.inputTokens}), 0)::int`,
			totalOutputTokens: sql<number>`COALESCE(sum(${usageEvents.outputTokens}), 0)::int`
		})
		.from(usageEvents)
		.where(eq(usageEvents.userId, userId));

	// 3. Fetch recent ledger history (last 20)
	const history = await db
		.select()
		.from(creditsLedger)
		.where(eq(creditsLedger.userId, userId))
		.orderBy(desc(creditsLedger.createdAt))
		.limit(20);

	// 4. Fetch unlock status
	const [status] = await db
		.select()
		.from(unlockStatus)
		.where(eq(unlockStatus.userId, userId))
		.limit(1);

	return {
		user: locals.user,
		sessionToken: locals.session.token,
		credits: {
			balance: creditsResult?.balance ?? 0,
			totalCost: usageResult?.totalCost ?? 0,
			totalInputTokens: usageResult?.totalInputTokens ?? 0,
			totalOutputTokens: usageResult?.totalOutputTokens ?? 0
		},
		creditsHistory: history,
		unlockStatus: status || null
	};
};
