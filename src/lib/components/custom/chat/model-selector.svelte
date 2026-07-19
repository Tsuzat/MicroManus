<script lang="ts">
	import {
		PROVIDERS,
		getModelsByProvider,
		getModelConfig,
		type AIProvider
	} from '$lib/ai/providers';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { OpenAIIcon, GoogleIcon, AnthropicIcon, KimiIcon } from '$lib/components/custom/icons';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { Component } from 'svelte';

	interface Props {
		selectedModelId: string;
		onSelect: (modelId: string) => void;
		disabled?: boolean;
	}

	let { selectedModelId, onSelect, disabled = false }: Props = $props();

	const modelsByProvider = getModelsByProvider();
	const selectedModel = $derived(getModelConfig(selectedModelId));

	const providerIcons: Record<AIProvider, Component> = {
		openai: OpenAIIcon,
		anthropic: AnthropicIcon,
		google: GoogleIcon,
		kimi: KimiIcon
	};

	const providerOrder: AIProvider[] = ['openai', 'anthropic', 'google', 'kimi'];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger {disabled}>
		{#snippet child({ props })}
			<Button variant="ghost" size="sm" class="gap-1.5 text-xs text-muted-foreground" {...props}>
				{#if selectedModel}
					{@const Icon = providerIcons[selectedModel.provider]}
					<Icon class="size-3.5" />
					<span class="max-w-24 truncate sm:max-w-none">{selectedModel.label}</span>
				{:else}
					<span>Select Model</span>
				{/if}
				<ChevronDownIcon class="size-3" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-64" align="start">
		{#each providerOrder as provider (provider)}
			{@const models = modelsByProvider[provider] ?? []}
			{#if models.length > 0}
				<DropdownMenu.Group>
					<DropdownMenu.GroupHeading class="flex items-center gap-2">
						{@const Icon = providerIcons[provider]}
						<Icon class="size-3.5" />
						<span>{PROVIDERS[provider].label}</span>
					</DropdownMenu.GroupHeading>
					{#each models as model (model.id)}
						<DropdownMenu.Item
							class="flex items-center justify-between"
							onclick={() => onSelect(model.id)}
						>
							<div class="flex flex-col">
								<span class="text-sm">{model.label}</span>
								<span class="text-xs text-muted-foreground">
									{(model.contextWindow / 1000).toFixed(0)}K ctx · ${model.pricing
										.inputPerMTok}/${model.pricing.outputPerMTok}
									per 1M tok
								</span>
							</div>
							{#if model.id === selectedModelId}
								<CheckIcon class="size-4 text-primary" />
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Group>
				{#if provider !== providerOrder[providerOrder.length - 1]}
					<DropdownMenu.Separator />
				{/if}
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
