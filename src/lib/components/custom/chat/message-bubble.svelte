<script lang="ts">
	import { getModelConfig, type AIProvider } from '$lib/ai/providers';
	import { OpenAIIcon, AnthropicIcon, KimiIcon } from '$lib/components/custom/icons';
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
	import BarChartIcon from '@lucide/svelte/icons/bar-chart-2';
	import * as ChainOfThought from '$lib/components/ai-elements/chain-of-thought';
	import * as Dialog from '$lib/components/ui/dialog';
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
		isStreaming?: boolean;
		usage?: {
			inputTokens: number;
			outputTokens: number;
			cacheReadTokens: number;
			cacheWriteTokens: number;
			inputCostUsd: string | null;
			outputCostUsd: string | null;
			cacheCostUsd: string | null;
			costUsd: string | null;
		};
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
		toolInvocations = [],
		isStreaming = false,
		usage
	}: Props = $props();

	let copied = $state(false);
	let showAnalytics = $state(false);

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
		kimi: KimiIcon
	};

	const model = $derived(modelId ? getModelConfig(modelId) : undefined);

	async function copyContent() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	async function handleExport(format: 'pdf' | 'md') {
		if (!messageId) {
			toast.error('Cannot export message without an ID');
			return;
		}

		const id = toast.loading(`Generating ${format.toUpperCase()}...`);
		try {
			const res = await fetch(`/api/message/${messageId}/export?format=${format}`);
			if (!res.ok) throw new Error('Failed to generate export');

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `message_${messageId}_export.${format}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success(`Response downloaded as ${format.toUpperCase()}`, { id });
		} catch {
			toast.error(`Failed to download ${format.toUpperCase()} file`, { id });
		}
	}

	function downloadAsMarkdown() {
		handleExport('md');
	}

	function downloadAsPDF() {
		handleExport('pdf');
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
			<div
				class="flex items-center justify-end gap-1 pr-1 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<Button variant="ghost" size="icon-sm" onclick={copyContent} title="Copy Message">
					{#if copied}
						<CheckIcon class="size-3.5 text-emerald-500" />
					{:else}
						<CopyIcon class="size-3.5" />
					{/if}
				</Button>
			</div>
		{:else}
			{#if reasoning || (toolInvocations && toolInvocations.length > 0)}
				<ChainOfThought.Root class="mb-3">
					<ChainOfThought.Header />
					<ChainOfThought.Content>
						{#if reasoning}
							<ChainOfThought.Step icon={LightbulbIcon} label="Thinking..." status="active">
								<Streamdown baseTheme="shadcn" content={reasoning} />
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

			<Streamdown
				{content}
				baseTheme="shadcn"
				theme={{
					code: {
						container: 'dark:bg-muted/20',
						pre: 'bg-transparent!'
					}
				}}
				components={{ code: Code, math: Math }}
			/>

			{#if !isStreaming}
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

						<!-- Analytics Button -->
						{#if usage}
							<Button
								variant="ghost"
								size="icon"
								class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
								onclick={() => (showAnalytics = true)}
								title="Message Analytics & Cost"
							>
								<BarChartIcon />
							</Button>
						{/if}
					</div>
				</div>
			{/if}
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
									class="max-h-48 max-w-60 rounded-lg object-contain"
								/>
							</a>
						</div>
					{:else}
						<a
							href={attachment.url}
							rel="external"
							download={attachment.filename || 'file'}
							class="flex max-w-60 min-w-30 items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
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

<Dialog.Root bind:open={showAnalytics}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Message Analytics</Dialog.Title>
			<Dialog.Description>Cost and token distribution for this AI response.</Dialog.Description>
		</Dialog.Header>

		{#if usage}
			<div class="space-y-4 py-4 text-sm">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1">
						<p class="text-sm leading-none font-medium text-muted-foreground">Model</p>
						<p>{model?.label || modelId}</p>
					</div>
					<div class="space-y-1">
						<p class="text-sm leading-none font-medium text-muted-foreground">Total Cost</p>
						<p class="font-bold">${usage.costUsd || '0.000000'}</p>
					</div>
				</div>

				<div class="rounded-md border p-4">
					<p class="mb-3 text-sm font-medium text-muted-foreground">Token Usage</p>
					<div class="grid grid-cols-3 gap-4">
						<div class="flex flex-col gap-1">
							<span class="text-xs text-muted-foreground">Input</span>
							<span class="font-medium">{usage.inputTokens}</span>
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-xs text-muted-foreground">Cached</span>
							<span class="font-medium">{usage.cacheReadTokens + usage.cacheWriteTokens}</span>
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-xs text-muted-foreground">Output</span>
							<span class="font-medium">{usage.outputTokens}</span>
						</div>
					</div>
				</div>

				<div class="rounded-md border p-4">
					<p class="mb-3 text-sm font-medium text-muted-foreground">Cost Breakdown</p>
					<div class="space-y-2">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Input Cost</span>
							<span>${usage.inputCostUsd || '0.000000'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Cache Cost</span>
							<span>${usage.cacheCostUsd || '0.000000'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Output Cost</span>
							<span>${usage.outputCostUsd || '0.000000'}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
