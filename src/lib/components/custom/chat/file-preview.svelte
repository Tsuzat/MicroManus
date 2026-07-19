<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import XIcon from '@lucide/svelte/icons/x';
	import FileIcon from '@lucide/svelte/icons/file';

	interface AttachedFile {
		id: string;
		name: string;
		type: string;
		url: string;
	}

	interface Props {
		files: AttachedFile[];
		onRemove: (id: string) => void;
	}

	let { files, onRemove }: Props = $props();
</script>

{#if files.length > 0}
	<div class="flex flex-wrap gap-2 px-3 pb-2 pt-1 border-b">
		{#each files as file (file.id)}
			{@const isImage = file.type.startsWith('image/')}
			<div class="group relative flex items-center gap-2 rounded-lg border bg-muted/40 p-1.5 pr-8 text-xs max-w-[200px]">
				{#if isImage}
					<img
						src={file.url}
						alt={file.name}
						class="size-8 rounded object-cover border"
					/>
				{:else}
					<div class="flex size-8 shrink-0 items-center justify-center rounded border bg-background">
						<FileIcon class="size-4 text-muted-foreground" />
					</div>
				{/if}
				<div class="flex flex-col min-w-0">
					<span class="truncate font-medium text-foreground">{file.name}</span>
					<span class="text-[10px] text-muted-foreground uppercase">{file.type.split('/')[1] || 'File'}</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="absolute right-1 top-1/2 -translate-y-1/2 size-5 rounded-full p-0 text-muted-foreground/60 hover:bg-muted hover:text-foreground opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
					onclick={() => onRemove(file.id)}
					title="Remove file"
				>
					<XIcon class="size-3" />
				</Button>
			</div>
		{/each}
	</div>
{/if}
