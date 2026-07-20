import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { redis } from 'bun';
import { checkout, polar, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import { POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET } from '$env/static/private';

const polarClient = new Polar({
	accessToken: POLAR_ACCESS_TOKEN,
	server: 'production'
});

export const auth = betterAuth({
	appName: 'MicroManus',
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	secondaryStorage: {
		get: async (key) => {
			const value = await redis.get(key);
			if (value === 'owner') {
				console.error(`[DEBUG] Redis key "${key}" has value "owner"!`);
			}
			return value;
		},
		set: async (key, value, ttl) => {
			if (ttl) {
				await redis.set(key, value, 'EX', ttl);
			} else {
				await redis.set(key, value);
			}
		},
		delete: async (key) => {
			await redis.del(key);
		}
	},

	emailAndPassword: { enabled: false },
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	},
	plugins: [
		polar({
			client: polarClient,
			createCustomerOnSignUp: false,
			use: [
				checkout({
					products: [{ productId: env.POLAR_PRODUCT_ID, slug: 'pro' }],
					successUrl: '/success?checkout_id={CHECKOUT_ID}',
					authenticatedUsersOnly: true
				}),
				webhooks({
					secret: POLAR_WEBHOOK_SECRET,
					onOrderPaid: async (payload) => {
						try {
							// Extract userId from metadata or order payload if present
							const data = payload?.data as any;
							const userId =
								data?.customer?.metadata?.userId || data?.metadata?.userId || data?.customer_id;
							const email = data?.customer?.email || data?.customer_email;
							if (userId) {
								const { unlockUser } = await import('$lib/server/unlock');
								await unlockUser(userId, 'payment');
							} else if (email) {
								const { db } = await import('$lib/server/db');
								const { user } = await import('$lib/server/db/schema');
								const { eq } = await import('drizzle-orm');
								const [foundUser] = await db
									.select()
									.from(user)
									.where(eq(user.email, email))
									.limit(1);
								if (foundUser) {
									const { unlockUser } = await import('$lib/server/unlock');
									await unlockUser(foundUser.id, 'payment');
								}
							}
						} catch (err) {
							console.error('[Polar Webhook onOrderPaid Error]', err);
						}
					}
				})
			]
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	advanced: {
		cookiePrefix: 'micromanus',
		ipAddress: {
			ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for']
		}
	}
});
