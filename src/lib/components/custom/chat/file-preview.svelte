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
	<div class="flex flex-wrap gap-2 border-b px-3 pt-1 pb-2">
		{#each files as file (file.id)}
			{@const isImage = file.type.startsWith('image/')}
			<div
				class="group relative flex max-w-[200px] items-center gap-2 rounded-lg border bg-muted/40 p-1.5 pr-8 text-xs"
			>
				{#if isImage}
					<img src={file.url} alt={file.name} class="size-8 rounded border object-cover" />
				{:else}
					<div
						class="flex size-8 shrink-0 items-center justify-center rounded border bg-background"
					>
						<FileIcon class="size-4 text-muted-foreground" />
					</div>
				{/if}
				<div class="flex min-w-0 flex-col">
					<span class="truncate font-medium text-foreground">{file.name}</span>
					<span class="text-[10px] text-muted-foreground uppercase"
						>{file.type.split('/')[1] || 'File'}</span
					>
				</div>
				<Button
					variant="outline"
					size="icon-xs"
					class="absolute -top-2 -right-2 hidden rounded-full bg-background! p-0! transition-all! duration-500! group-hover:flex"
					onclick={() => onRemove(file.id)}
					title="Remove file"
				>
					<XIcon />
				</Button>
			</div>
		{/each}
	</div>
{/if}
