<script lang="ts">
	import { getModelConfig, type AIProvider } from '$lib/ai/providers';
	import { OpenAIIcon, GeminiIcon, AnthropicIcon, KimiIcon } from '$lib/components/custom/icons';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Streamdown } from 'svelte-streamdown';
	import Code from 'svelte-streamdown/code';
	import Math from 'svelte-streamdown/math';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import { toast } from 'svelte-sonner';
	import type { Component } from 'svelte';

	interface Props {
		role: 'user' | 'assistant' | 'system';
		content: string;
		modelId?: string;
		messageId?: string;
		onRewrite?: (messageId: string) => void;
	}

	let { role, content, modelId, messageId, onRewrite }: Props = $props();

	let copied = $state(false);
	let proseContainer: HTMLDivElement | undefined = $state();

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
			toast.success('Response copied to clipboard');
		} catch {
			toast.error('Failed to copy text');
		}
	}

	function downloadAsMarkdown() {
		try {
			const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `ai-response-${messageId || 'msg'}.md`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success('Response downloaded as Markdown (.md)');
		} catch {
			toast.error('Failed to download Markdown file');
		}
	}

	function downloadAsPDF() {}
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
			<div bind:this={proseContainer} class="prose prose-sm dark:prose-invert max-w-none text-sm">
				<Streamdown class="render-markdown" {content} components={{ code: Code, math: Math }} />
			</div>

			<!-- Actions (visible on hover) -->
			<div
				class="flex items-center gap-1 pt-1 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<!-- Copy Button -->
				<Button
					variant="ghost"
					size="icon"
					class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
					onclick={copyContent}
					title="Copy Response"
				>
					{#if copied}
						<CheckIcon class="text-emerald-500" />
					{:else}
						<CopyIcon />
					{/if}
				</Button>

				<!-- Download Dropdown -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								variant="ghost"
								size="icon"
								class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
								{...props}
								title="Download Options"
							>
								<DownloadIcon />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="center" class="w-36">
						<DropdownMenu.Item onclick={downloadAsMarkdown}>
							<span>Markdown (.md)</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={downloadAsPDF}>
							<span>PDF (.pdf)</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Rewrite Button -->
				{#if messageId && onRewrite}
					<Button
						variant="ghost"
						size="icon"
						class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
						onclick={() => onRewrite(messageId)}
						title="Regenerate Response"
					>
						<RotateCcwIcon />
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
