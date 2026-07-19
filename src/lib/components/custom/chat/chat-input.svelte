<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ModelSelector from './model-selector.svelte';
	import FilePreview from './file-preview.svelte';
	import SendIcon from '@lucide/svelte/icons/send-horizontal';
	import SquareIcon from '@lucide/svelte/icons/square';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import { toast } from 'svelte-sonner';

	interface AttachedFile {
		id: string;
		name: string;
		type: string;
		url: string;
	}

	interface Props {
		selectedModelId: string;
		onModelSelect: (modelId: string) => void;
		onSubmit: (text: string, files?: Array<{ name: string; type: string; url: string }>) => void;
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
	let fileInputEl = $state<HTMLInputElement | null>(null);
	let attachedFiles = $state<AttachedFile[]>([]);
	let isDragging = $state(false);

	const canSubmit = $derived((inputText.trim().length > 0 || attachedFiles.length > 0) && !isStreaming);

	function handleSubmit() {
		if (!canSubmit) return;
		const text = inputText.trim();
		const filesToSend = attachedFiles.map(f => ({
			name: f.name,
			type: f.type,
			url: f.url
		}));

		inputText = '';
		attachedFiles = [];
		// Reset textarea height
		if (textareaEl) {
			textareaEl.style.height = 'auto';
		}
		onSubmit(text, filesToSend);
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

	function triggerFileInput() {
		fileInputEl?.click();
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		processFiles(target.files);
		// Reset file input value so same file can be uploaded again
		target.value = '';
	}

	function processFiles(fileList: FileList | null) {
		if (!fileList) return;
		for (let i = 0; i < fileList.length; i++) {
			const file = fileList[i];
			// Limit file size to 8MB per file
			if (file.size > 8 * 1024 * 1024) {
				toast.error(`File ${file.name} exceeds the 8MB size limit.`);
				continue;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const dataUrl = e.target?.result as string;
				attachedFiles.push({
					id: crypto.randomUUID(),
					name: file.name,
					type: file.type || 'application/octet-stream',
					url: dataUrl
				});
			};
			reader.onerror = () => {
				toast.error(`Failed to read file: ${file.name}`);
			};
			reader.readAsDataURL(file);
		}
	}

	function handleRemoveFile(id: string) {
		attachedFiles = attachedFiles.filter(f => f.id !== id);
	}

	// Paste handler (e.g. paste screenshots)
	function handlePaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (!items) return;
		const filesToProcess: File[] = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (item.kind === 'file') {
				const file = item.getAsFile();
				if (file) filesToProcess.push(file);
			}
		}
		if (filesToProcess.length > 0) {
			e.preventDefault();
			const dataTransfer = new DataTransfer();
			filesToProcess.forEach(f => dataTransfer.items.add(f));
			processFiles(dataTransfer.files);
		}
	}

	// Drag & Drop handlers
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			processFiles(e.dataTransfer.files);
		}
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

<div class="mx-auto w-full max-w-3xl bg-transparent px-4 pb-4">
	<!-- Drag and drop zone overlay style -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex flex-col gap-2 rounded-2xl border bg-background p-2 shadow-sm transition-all {isDragging ? 'border-primary ring-2 ring-primary/20 bg-muted/20' : ''}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<!-- Hidden File Input -->
		<input
			bind:this={fileInputEl}
			type="file"
			multiple
			class="hidden"
			onchange={handleFileChange}
		/>

		<!-- File Previews -->
		<FilePreview files={attachedFiles} onRemove={handleRemoveFile} />

		<textarea
			bind:this={textareaEl}
			bind:value={inputText}
			onkeydown={handleKeydown}
			oninput={autoResize}
			onpaste={handlePaste}
			{placeholder}
			rows={1}
			disabled={isStreaming}
			class="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
			{...autofocus ? { autofocus: true } : {}}
		></textarea>

		<!-- Toolbar -->
		<div class="flex items-center justify-between px-1">
			<div class="flex items-center gap-1.5">
				<ModelSelector {selectedModelId} onSelect={onModelSelect} disabled={isStreaming} />
				
				<!-- Paperclip Attachment button -->
				<Button
					variant="ghost"
					size="icon"
					class="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
					onclick={triggerFileInput}
					disabled={isStreaming}
					title="Attach files or images"
				>
					<PaperclipIcon class="size-4" />
				</Button>
			</div>

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
