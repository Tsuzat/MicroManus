// Server-side provider resolver
// Maps model IDs to their AI SDK provider instances

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getModelConfig } from '$lib/ai/providers';
import type { LanguageModel } from 'ai';
import { db } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '$lib/server/crypto';

/**
 * Resolves a model ID to its AI SDK LanguageModel instance.
 * Routes to the correct provider based on the model's provider field.
 * Prefers user-provided keys from the database, falling back to server environment variables.
 */
export async function resolveModel(modelId: string, userId: string): Promise<LanguageModel> {
	const config = getModelConfig(modelId);
	if (!config) {
		throw new Error(`Unknown model: ${modelId}`);
	}

	let userKey: string | undefined;

	// Query DB for user keys
	try {
		if (config.provider === 'kimi') {
			const [keyRecord] = await db
				.select()
				.from(apiKeys)
				.where(
					and(
						eq(apiKeys.userId, userId),
						eq(apiKeys.provider, 'custom'),
						eq(apiKeys.baseUrl, 'https://api.moonshot.cn/v1')
					)
				)
				.limit(1);
			if (keyRecord) {
				userKey = decrypt(keyRecord.encryptedKey);
			}
		} else {
			const [keyRecord] = await db
				.select()
				.from(apiKeys)
				.where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, config.provider)))
				.limit(1);
			if (keyRecord) {
				userKey = decrypt(keyRecord.encryptedKey);
			}
		}
	} catch (err) {
		console.error(
			`[ResolveModel] Error retrieving/decrypting key for provider ${config.provider}:`,
			err
		);
	}

	if (!userKey) {
		const providerName =
			config.provider === 'openai'
				? 'OpenAI'
				: config.provider === 'anthropic'
					? 'Anthropic (Claude)'
					: config.provider === 'google'
						? 'Google AI (Gemini)'
						: 'Kimi (Moonshot)';
		throw new Error(
			`Please configure your ${providerName} API Key in the Settings page to use this model.`
		);
	}

	switch (config.provider) {
		case 'openai': {
			const openai = createOpenAI({
				apiKey: userKey
			});
			return openai(config.id);
		}
		case 'anthropic': {
			const anthropic = createAnthropic({
				apiKey: userKey
			});
			return anthropic(config.id);
		}
		case 'google': {
			const google = createGoogleGenerativeAI({
				apiKey: userKey
			});
			return google(config.id);
		}
		case 'kimi': {
			// Kimi uses an OpenAI-compatible API
			const kimi = createOpenAI({
				apiKey: userKey,
				baseURL: 'https://api.moonshot.cn/v1'
			});
			return kimi(config.id);
		}
		default:
			throw new Error(`Unsupported provider: ${config.provider}`);
	}
}
