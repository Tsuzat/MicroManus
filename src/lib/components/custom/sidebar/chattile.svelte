<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Chat } from '$lib/server/db/schema';
	import { useChatsContext } from '$lib/hooks/chats.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { confirmDelete } from '$lib/components/custom';
	import { toast } from 'svelte-sonner';

	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import PinIcon from '@lucide/svelte/icons/pin';
	import PinOffIcon from '@lucide/svelte/icons/pin-off';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	let { chat }: { chat: Chat } = $props();

	const sidebar = useSidebar();
	const chatsContext = useChatsContext();

	const chatUrl = $derived(`/chat/${chat.id}`);
	const isActive = $derived(page.url.pathname.includes(chatUrl));

	const handleCopyLink = async () => {
		try {
			const fullUrl = `${window.location.origin}${chatUrl}`;
			await navigator.clipboard.writeText(fullUrl);
			toast.success('Link copied to clipboard');
		} catch {
			toast.error('Failed to copy link');
		}
	};

	const handleTogglePin = async () => {
		const willBePinned = !chat.isPinned;
		toast.success(willBePinned ? 'Chat pinned' : 'Chat unpinned');
		await chatsContext.togglePin(chat.id);
	};

	const handleDelete = () => {
		confirmDelete({
			title: 'Delete Chat',
			description: 'Are you sure you want to delete this chat? This action cannot be undone.',
			input: {
				confirmationText: 'DELETE'
			},
			confirm: {
				text: 'Delete Chat'
			},
			onConfirm: async () => {
				if (isActive) {
					goto(resolve('/(app)/chat/new'));
				}
				await chatsContext.deleteChat(chat.id);
			}
		});
	};
</script>

<Sidebar.MenuItem>
	<Sidebar.MenuButton {isActive} class={isActive ? 'bg-muted font-medium text-foreground' : ''}>
		{#snippet child({ props })}
			<a href={resolve('/(app)/chat/[id]', { id: chat.id })} title={chat.title} {...props}>
				<span class="truncate">{chat.title || 'Untitled Chat'}</span>
			</a>
		{/snippet}
	</Sidebar.MenuButton>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Sidebar.MenuAction showOnHover {...props}>
					<EllipsisIcon />
					<span class="sr-only">More</span>
				</Sidebar.MenuAction>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="w-fit"
			side={sidebar.isMobile ? 'bottom' : 'right'}
			align={sidebar.isMobile ? 'end' : 'start'}
		>
			<DropdownMenu.Item onclick={handleTogglePin}>
				{#if chat.isPinned}
					<PinOffIcon class="text-muted-foreground" />
					<span>Unpin Chat</span>
				{:else}
					<PinIcon class="text-muted-foreground" />
					<span>Pin Chat</span>
				{/if}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={handleCopyLink}>
				<LinkIcon class="text-muted-foreground" />
				<span>Copy Link</span>
			</DropdownMenu.Item>
			<a
				href={resolve('/(app)/chat/[id]', { id: chat.id })}
				target="_blank"
				rel="noopener noreferrer"
			>
				<DropdownMenu.Item>
					<ArrowUpRightIcon class="text-muted-foreground" />
					<span>Open in New Tab</span>
				</DropdownMenu.Item>
			</a>
			<DropdownMenu.Separator />
			<DropdownMenu.Item variant="destructive" onclick={handleDelete}>
				<Trash2Icon class="size-4" />
				<span>Delete Chat</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Sidebar.MenuItem>
