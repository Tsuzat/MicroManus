import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { encrypt, decrypt } from '$lib/server/crypto';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/signin');
	}

	// Fetch all keys for the user
	const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, locals.user.id));

	// Group keys by provider or base_url for display
	const openaiKey = keys.find((k) => k.provider === 'openai');
	const anthropicKey = keys.find((k) => k.provider === 'anthropic');
	const googleKey = keys.find((k) => k.provider === 'google');
	const kimiKey = keys.find((k) => k.provider === 'custom' && k.baseUrl?.includes('moonshot'));

	const maskKey = (encrypted: string) => {
		try {
			const raw = decrypt(encrypted);
			if (!raw) return '';
			return raw.slice(0, 4) + '•'.repeat(Math.max(8, raw.length - 8)) + raw.slice(-4);
		} catch {
			return '••••••••••••';
		}
	};

	return {
		keys: {
			openai: openaiKey ? { id: openaiKey.id, masked: maskKey(openaiKey.encryptedKey) } : null,
			anthropic: anthropicKey
				? { id: anthropicKey.id, masked: maskKey(anthropicKey.encryptedKey) }
				: null,
			google: googleKey ? { id: googleKey.id, masked: maskKey(googleKey.encryptedKey) } : null,
			kimi: kimiKey ? { id: kimiKey.id, masked: maskKey(kimiKey.encryptedKey) } : null
		}
	};
};

export const actions: Actions = {
	saveKeys: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const openai = data.get('openai') as string;
		const anthropic = data.get('anthropic') as string;
		const google = data.get('google') as string;
		const kimi = data.get('kimi') as string;

		const userId = locals.user.id;

		const saveKey = async (
			provider: 'openai' | 'anthropic' | 'google' | 'custom',
			value: string,
			baseUrl?: string,
			label?: string
		) => {
			const clean = value.trim();
			if (!clean) {
				// If empty, delete key
				if (provider === 'custom' && baseUrl) {
					await db
						.delete(apiKeys)
						.where(
							and(
								eq(apiKeys.userId, userId),
								eq(apiKeys.provider, provider),
								eq(apiKeys.baseUrl, baseUrl)
							)
						);
				} else {
					await db
						.delete(apiKeys)
						.where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)));
				}
				return;
			}

			// If it contains mask characters (e.g. • or *), user didn't change it
			if (clean.includes('•') || clean.includes('*')) {
				return;
			}

			const encrypted = encrypt(clean);

			// Check if key already exists
			let existing;
			if (provider === 'custom' && baseUrl) {
				[existing] = await db
					.select()
					.from(apiKeys)
					.where(
						and(
							eq(apiKeys.userId, userId),
							eq(apiKeys.provider, provider),
							eq(apiKeys.baseUrl, baseUrl)
						)
					)
					.limit(1);
			} else {
				[existing] = await db
					.select()
					.from(apiKeys)
					.where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)))
					.limit(1);
			}

			if (existing) {
				await db
					.update(apiKeys)
					.set({
						encryptedKey: encrypted,
						label: label || existing.label,
						createdAt: new Date() // track update
					})
					.where(eq(apiKeys.id, existing.id));
			} else {
				await db.insert(apiKeys).values({
					userId,
					provider,
					encryptedKey: encrypted,
					label: label || provider,
					baseUrl: baseUrl || null,
					isActive: true
				});
			}
		};

		try {
			await saveKey('openai', openai);
			await saveKey('anthropic', anthropic);
			await saveKey('google', google);
			await saveKey('custom', kimi, 'https://api.moonshot.cn/v1', 'Kimi');

			return { success: true, message: 'API keys updated successfully' };
		} catch (err: any) {
			console.error('[Settings] Save keys failed:', err);
			return fail(500, { error: err.message || 'Failed to save API keys' });
		}
	}
};
