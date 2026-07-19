// AI Provider & Model Registry
// Central configuration for all supported LLM providers and models

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'kimi';

export interface ModelConfig {
	id: string; // wire-format model ID sent to the API
	label: string; // display label
	provider: AIProvider;
	contextWindow: number; // tokens
	pricing: {
		inputPerMTok: number; // $ per 1M input tokens
		outputPerMTok: number; // $ per 1M output tokens
		cachedInputPerMTok?: number; // $ per 1M cache-read tokens (if supported)
	};
}

export const PROVIDERS: Record<AIProvider, { label: string }> = {
	openai: { label: 'OpenAI' },
	anthropic: { label: 'Claude' },
	google: { label: 'Gemini' },
	kimi: { label: 'Kimi' }
};

export const MODELS: ModelConfig[] = [
	// --- OpenAI: GPT-5.6 family (Sol/Terra/Luna), released July 2026 ---
	{
		id: 'gpt-5.6',
		label: 'GPT-5.6 Sol',
		provider: 'openai',
		contextWindow: 1_050_000,
		pricing: { inputPerMTok: 5, outputPerMTok: 30 }
	},
	{
		id: 'gpt-5.6-terra',
		label: 'GPT-5.6 Terra',
		provider: 'openai',
		contextWindow: 1_050_000,
		pricing: { inputPerMTok: 2.5, outputPerMTok: 15 }
	},
	{
		id: 'gpt-5.6-luna',
		label: 'GPT-5.6 Luna',
		provider: 'openai',
		contextWindow: 1_050_000,
		pricing: { inputPerMTok: 1, outputPerMTok: 6 }
	},

	// --- Anthropic: Claude Sonnet 5 / Opus 4.8 / Haiku 4.5 ---
	{
		id: 'claude-sonnet-5',
		label: 'Claude Sonnet 5',
		provider: 'anthropic',
		contextWindow: 200_000,
		pricing: { inputPerMTok: 3, outputPerMTok: 15, cachedInputPerMTok: 0.3 }
	},
	{
		id: 'claude-opus-4-8',
		label: 'Claude Opus 4.8',
		provider: 'anthropic',
		contextWindow: 200_000,
		pricing: { inputPerMTok: 15, outputPerMTok: 75, cachedInputPerMTok: 1.5 }
	},
	{
		id: 'claude-haiku-4-5-20251001',
		label: 'Claude Haiku 4.5',
		provider: 'anthropic',
		contextWindow: 200_000,
		pricing: { inputPerMTok: 1, outputPerMTok: 5, cachedInputPerMTok: 0.1 }
	},

	// --- Google: Gemini 3.1 Pro / 3.5 Flash ---
	{
		id: 'gemini-3.1-pro',
		label: 'Gemini 3.1 Pro',
		provider: 'google',
		contextWindow: 1_000_000,
		pricing: { inputPerMTok: 2, outputPerMTok: 12, cachedInputPerMTok: 0.2 }
	},
	{
		id: 'gemini-3.5-flash',
		label: 'Gemini 3.5 Flash',
		provider: 'google',
		contextWindow: 1_000_000,
		pricing: { inputPerMTok: 0.3, outputPerMTok: 2.5 }
	},

	// --- Kimi (Moonshot): K3 / K2.7 Code ---
	{
		id: 'kimi-k3',
		label: 'Kimi K3',
		provider: 'kimi',
		contextWindow: 1_000_000,
		pricing: { inputPerMTok: 0.6, outputPerMTok: 3 }
	},
	{
		id: 'kimi-k2.7-code',
		label: 'Kimi K2.7 Code',
		provider: 'kimi',
		contextWindow: 256_000,
		pricing: { inputPerMTok: 0.6, outputPerMTok: 3 }
	}
];

/** Get a model config by ID */
export function getModelConfig(modelId: string): ModelConfig | undefined {
	return MODELS.find((m) => m.id === modelId);
}

/** Get models grouped by provider */
export function getModelsByProvider(): Record<AIProvider, ModelConfig[]> {
	return MODELS.reduce(
		(acc, model) => {
			if (!acc[model.provider]) acc[model.provider] = [];
			acc[model.provider].push(model);
			return acc;
		},
		{} as Record<AIProvider, ModelConfig[]>
	);
}

/** Default model to use when none is selected */
export const DEFAULT_MODEL_ID = 'gemini-3.5-flash';
