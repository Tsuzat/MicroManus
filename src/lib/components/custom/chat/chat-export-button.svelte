<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import FileIcon from '@lucide/svelte/icons/file';
	import { toast } from 'svelte-sonner';

	interface Props {
		chatId: string;
		chatTitle: string;
	}

	let { chatId, chatTitle }: Props = $props();
	let isExporting = $state(false);

	async function handleExport(format: 'pdf' | 'md') {
		if (isExporting) return;
		isExporting = true;

		const id = toast.loading(`Generating ${format.toUpperCase()} export...`);

		try {
			const res = await fetch(`/api/chat/${chatId}/export?format=${format}`);

			if (!res.ok) {
				throw new Error('Failed to generate export');
			}

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${chatTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.${format}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success(`Exported chat as ${format.toUpperCase()}`, { id });
		} catch (error) {
			console.error('[Export Error]', error);
			toast.error('Failed to export chat', { id });
		} finally {
			isExporting = false;
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button
			variant="ghost"
			size="sm"
			class="h-8 gap-1.5 text-muted-foreground"
			disabled={isExporting}
		>
			<DownloadIcon class="size-3.5" />
			<span class="hidden sm:inline">Export</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-fit">
		<DropdownMenu.Item onclick={() => handleExport('pdf')} class="gap-2">
			<FileIcon class="size-4" />
			<span>Download as PDF</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => handleExport('md')} class="gap-2">
			<FileTextIcon class="size-4" />
			<span>Download as Markdown</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
