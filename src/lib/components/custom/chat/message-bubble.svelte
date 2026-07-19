<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { getModelConfig, type AIProvider } from '$lib/ai/providers';
	import { OpenAIIcon, GeminiIcon, AnthropicIcon, KimiIcon } from '$lib/components/custom/icons';
	import { Streamdown } from 'svelte-streamdown';
	import Code from 'svelte-streamdown/code';
	import Math from 'svelte-streamdown/math';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { Component } from 'svelte';

	interface Props {
		role: 'user' | 'assistant' | 'system';
		content: string;
		modelId?: string;
	}

	let { role, content, modelId }: Props = $props();

	let copied = $state(false);

	const providerIcons: Record<AIProvider, Component> = {
		openai: OpenAIIcon,
		anthropic: AnthropicIcon,
		google: GeminiIcon,
		kimi: KimiIcon
	};

	const model = $derived(modelId ? getModelConfig(modelId) : undefined);

	async function copyContent() {
		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Silently fail
		}
	}
</script>

<div class="group flex gap-3 py-4 {role === 'user' ? 'flex-row-reverse' : ''}">
	<!-- Avatar -->
	{#if role === 'assistant'}
		<div class="flex shrink-0 items-start pt-0.5">
			{#if model}
				{@const Icon = providerIcons[model.provider]}
				<Icon class="size-4" />
			{:else}
				<div class="flex size-full items-center justify-center"></div>
			{/if}
		</div>
	{/if}

	<!-- Content -->
	<div class="flex max-w-[85%] flex-col gap-1 {role === 'user' ? 'items-end' : 'items-start'}">
		{#if role === 'user'}
			<div class="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
				<p class="whitespace-pre-wrap">{content}</p>
			</div>
		{:else}
			<div class="prose prose-sm dark:prose-invert max-w-none text-sm">
				<Streamdown class="render-markdown" {content} components={{ code: Code, math: Math }} />
			</div>

			<!-- Actions (visible on hover) -->
			<div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					onclick={copyContent}
					class="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					{#if copied}
						<CheckIcon class="size-3" />
						<span>Copied</span>
					{:else}
						<CopyIcon class="size-3" />
						<span>Copy</span>
					{/if}
				</button>
			</div>
		{/if}
	</div>
</div>
