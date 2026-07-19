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
	import FileIcon from '@lucide/svelte/icons/file';
	import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as ChainOfThought from '$lib/components/ai-elements/chain-of-thought';
	import SourceCitations from './source-citations.svelte';
	import type { Component } from 'svelte';

	interface Props {
		role: 'user' | 'assistant' | 'system';
		content: string;
		attachments?: Array<{ type: string; mediaType: string; url: string; filename?: string }>;
		modelId?: string;
		messageId?: string;
		onRewrite?: (messageId: string) => void;
		sources?: Array<{ title: string; url: string; snippet: string }>;
		reasoning?: string;
		toolInvocations?: any[];
	}

	let {
		role,
		content,
		attachments = [],
		modelId,
		messageId,
		onRewrite,
		sources = [],
		reasoning,
		toolInvocations = []
	}: Props = $props();

	let copied = $state(false);
	let proseContainer: HTMLDivElement | undefined = $state();

	function getHostname(url: string) {
		try {
			return new URL(url).hostname;
		} catch {
			return url;
		}
	}

	const allSources = $derived.by(() => {
		if (sources && sources.length > 0) return sources;
		if (toolInvocations && toolInvocations.length > 0) {
			const found: any[] = [];
			for (const t of toolInvocations) {
				const res = t.result || (t as any).output;
				if (res?.results && Array.isArray(res.results)) {
					found.push(...res.results);
				}
			}
			return found;
		}
		return [];
	});

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
			{#if reasoning || (toolInvocations && toolInvocations.length > 0)}
				<ChainOfThought.Root class="mb-3">
					<ChainOfThought.Header />
					<ChainOfThought.Content>
						{#if reasoning}
							<ChainOfThought.Step icon={LightbulbIcon} label="Thinking..." status="active">
								<div
									class="px-1 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground"
								>
									{reasoning}
								</div>
							</ChainOfThought.Step>
						{/if}
						{#if toolInvocations}
							{#each toolInvocations as tool, idx (idx)}
								{#if tool.toolName === 'webSearch'}
									{@const toolArgs = tool.args || (tool as any).input || {}}
									{@const toolRes = tool.result || (tool as any).output}
									{@const isComplete =
										tool.state === 'result' || (tool as any).state === 'output-available'}
									<ChainOfThought.Step
										icon={SearchIcon}
										label={`Searching for "${toolArgs.query || ''}"`}
										status={isComplete ? 'complete' : 'active'}
									>
										{#if isComplete && toolRes && toolRes.results}
											<ChainOfThought.SearchResults>
												{#each toolRes.results as res (res.url)}
													<ChainOfThought.SearchResult>
														<a
															href={res.url}
															target="_blank"
															rel="noopener noreferrer"
															class="text-primary hover:underline"
														>
															{new URL(res.url).hostname}
														</a>
													</ChainOfThought.SearchResult>
												{/each}
											</ChainOfThought.SearchResults>
										{:else if isComplete && toolRes && toolRes.error}
											<div class="text-xs text-destructive">{toolRes.error}</div>
										{/if}
									</ChainOfThought.Step>
								{/if}
							{/each}
						{/if}
					</ChainOfThought.Content>
				</ChainOfThought.Root>
			{/if}

			<div bind:this={proseContainer} class="prose prose-sm dark:prose-invert max-w-none text-sm">
				<Streamdown class="render-markdown" {content} components={{ code: Code, math: Math }} />
			</div>

			{#if allSources && allSources.length > 0}
				<SourceCitations sources={allSources} />
			{/if}

			<!-- Actions & Web Sources Toolbar -->
			<div class="flex flex-wrap items-center gap-2 pt-1">
				<!-- Action Buttons (Copy, Download, Regenerate) -->
				<div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
			</div>
		{/if}

		<!-- Render Attachments -->
		{#if attachments && attachments.length > 0}
			<div class="mt-2 flex flex-wrap gap-2 {role === 'user' ? 'justify-end' : 'justify-start'}">
				{#each attachments as attachment, idx (idx)}
					{@const isImage = attachment.mediaType.startsWith('image/')}
					{#if isImage}
						<div class="relative overflow-hidden rounded-lg border bg-muted/25">
							<a
								href={attachment.url}
								target="_blank"
								rel="noopener external noreferrer"
								title="View full image"
							>
								<img
									src={attachment.url}
									alt={attachment.filename || 'Image Attachment'}
									class="max-h-48 max-w-[240px] rounded-lg object-contain"
								/>
							</a>
						</div>
					{:else}
						<a
							href={attachment.url}
							rel="external"
							download={attachment.filename || 'file'}
							class="flex max-w-[240px] min-w-[120px] items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
							title="Download attachment"
						>
							<FileIcon class="size-4 shrink-0 text-muted-foreground" />
							<div class="flex min-w-0 flex-col">
								<span class="truncate font-medium">{attachment.filename || 'Attachment'}</span>
								<span class="text-[9px] text-muted-foreground uppercase"
									>{attachment.mediaType.split('/')[1] || 'File'}</span
								>
							</div>
						</a>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
