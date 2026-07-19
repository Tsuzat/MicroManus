// AI Provider & Model Registry
// Central configuration for all supported LLM providers and models
// Pricing verified against official provider pages, July 20, 2026

export type AIProvider = 'openai' | 'anthropic' | 'kimi';

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
	kimi: { label: 'Kimi' }
};

export const MODELS: ModelConfig[] = [
	{
		id: 'gpt-5.6',
		label: 'GPT-5.6 Sol',
		provider: 'openai',
		contextWindow: 1_050_000,
		pricing: { inputPerMTok: 5, outputPerMTok: 30, cachedInputPerMTok: 0.5 }
	},
	{
		id: 'gpt-5.6-terra',
		label: 'GPT-5.6 Terra',
		provider: 'openai',
		contextWindow: 1_050_000,
		pricing: { inputPerMTok: 2.5, outputPerMTok: 15, cachedInputPerMTok: 0.25 }
	},
	{
		id: 'gpt-5.6-luna',
		label: 'GPT-5.6 Luna',
		provider: 'openai',
		contextWindow: 1_050_000,
		pricing: { inputPerMTok: 1, outputPerMTok: 6, cachedInputPerMTok: 0.1 }
	},
	{
		id: 'gpt-5.5',
		label: 'GPT-5.5',
		provider: 'openai',
		contextWindow: 1_050_000, // was listed as 512k — actual is ~1.05M (922k in / 128k out)
		pricing: { inputPerMTok: 5, outputPerMTok: 30, cachedInputPerMTok: 0.5 }
	},
	{
		id: 'gpt-5.4-nano',
		label: 'GPT-5.4 Nano',
		provider: 'openai',
		contextWindow: 256_000,
		pricing: { inputPerMTok: 0.2, outputPerMTok: 1.25, cachedInputPerMTok: 0.02 }
	},

	{
		id: 'claude-sonnet-5',
		label: 'Claude Sonnet 5',
		provider: 'anthropic',
		contextWindow: 200_000,
		pricing: { inputPerMTok: 2, outputPerMTok: 10, cachedInputPerMTok: 0.2 }
	},
	{
		id: 'claude-opus-4-8',
		label: 'Claude Opus 4.8',
		provider: 'anthropic',
		contextWindow: 200_000,
		pricing: { inputPerMTok: 5, outputPerMTok: 25, cachedInputPerMTok: 0.5 }
	},
	{
		id: 'claude-haiku-4-5-20251001',
		label: 'Claude Haiku 4.5',
		provider: 'anthropic',
		contextWindow: 200_000,
		pricing: { inputPerMTok: 1, outputPerMTok: 5, cachedInputPerMTok: 0.1 }
	},

	{
		id: 'kimi-k3',
		label: 'Kimi K3',
		provider: 'kimi',
		contextWindow: 1_048_576,
		pricing: { inputPerMTok: 3, outputPerMTok: 15, cachedInputPerMTok: 0.3 }
	},
	{
		id: 'kimi-k2.7-code',
		label: 'Kimi K2.7 Code',
		provider: 'kimi',
		contextWindow: 256_000,
		pricing: { inputPerMTok: 0.95, outputPerMTok: 4, cachedInputPerMTok: 0.19 }
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
export const DEFAULT_MODEL_ID = 'gpt-5.4-nano';
