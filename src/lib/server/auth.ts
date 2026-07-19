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
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [{ productId: env.POLAR_PRODUCT_ID, slug: 'pro' }],
					successUrl: '/success?checkout_id={CHECKOUT_ID}',
					authenticatedUsersOnly: true
				}),
				webhooks({
					secret: POLAR_WEBHOOK_SECRET,
					onCustomerStateChanged: (payload) => {}, // Triggered when anything regarding a customer changes
					onOrderPaid: (payload) => {}, // Triggered when an order was paid (purchase, subscription renewal, etc.)
					onPayload: (payload) => {} // Catch-all for all events
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
