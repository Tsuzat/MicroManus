<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ModelSelector from './model-selector.svelte';
	import SendIcon from '@lucide/svelte/icons/send-horizontal';
	import SquareIcon from '@lucide/svelte/icons/square';

	interface Props {
		selectedModelId: string;
		onModelSelect: (modelId: string) => void;
		onSubmit: (text: string) => void;
		isStreaming?: boolean;
		onStop?: () => void;
		placeholder?: string;
		autofocus?: boolean;
	}

	let {
		selectedModelId,
		onModelSelect,
		onSubmit,
		isStreaming = false,
		onStop,
		placeholder = 'Ask anything...',
		autofocus = false
	}: Props = $props();

	let inputText = $state('');
	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	const canSubmit = $derived(inputText.trim().length > 0 && !isStreaming);

	function handleSubmit() {
		if (!canSubmit) return;
		const text = inputText.trim();
		inputText = '';
		// Reset textarea height
		if (textareaEl) {
			textareaEl.style.height = 'auto';
		}
		onSubmit(text);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (isStreaming && onStop) {
				onStop();
			} else {
				handleSubmit();
			}
		}
	}

	function autoResize(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		target.style.height = 'auto';
		target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
	}

	/** Allow parent to set the input text programmatically */
	export function setText(text: string) {
		inputText = text;
		// Trigger resize on next tick
		requestAnimationFrame(() => {
			if (textareaEl) {
				textareaEl.style.height = 'auto';
				textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, 200)}px`;
			}
		});
	}

	/** Focus the textarea */
	export function focus() {
		textareaEl?.focus();
	}
</script>

<div class="mx-auto w-full max-w-3xl px-4 pb-4">
	<div class="flex flex-col gap-2 rounded-2xl border bg-background p-2 shadow-sm transition-shadow">
		<textarea
			bind:this={textareaEl}
			bind:value={inputText}
			onkeydown={handleKeydown}
			oninput={autoResize}
			{placeholder}
			rows={1}
			disabled={isStreaming}
			class="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
			{...autofocus ? { autofocus: true } : {}}></textarea>

		<!-- Toolbar -->
		<div class="flex items-center justify-between px-1">
			<ModelSelector {selectedModelId} onSelect={onModelSelect} disabled={isStreaming} />

			<div class="flex items-center gap-1">
				{#if isStreaming}
					<Button
						variant="ghost"
						size="sm"
						class="size-8 rounded-full p-0"
						onclick={() => onStop?.()}
					>
						<SquareIcon class="size-4" />
						<span class="sr-only">Stop generating</span>
					</Button>
				{:else}
					<Button
						variant="default"
						size="sm"
						class="size-8 rounded-full p-0"
						onclick={handleSubmit}
						disabled={!canSubmit}
					>
						<SendIcon class="size-4" />
						<span class="sr-only">Send message</span>
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<p class="mt-2 text-center text-xs text-muted-foreground">
		AI can make mistakes. Consider checking important info.
	</p>
</div>
