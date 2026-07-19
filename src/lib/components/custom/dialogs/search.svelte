<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Command from '$lib/components/ui/command/index.js';
	import { useChatsContext } from '$lib/hooks/chats.svelte';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';

	interface Props {
		open?: boolean;
	}
	let { open = $bindable(false) }: Props = $props();

	const chats = $derived(useChatsContext().chats);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open>
	<Command.Input placeholder="Search chat history..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Chat History">
			{#each chats as chat (chat.id)}
				<Command.Item
					onSelect={() => goto(resolve('/(app)/chat/[id]', { id: chat.id }))}
					value={chat.title || ''}
				>
					<MessageSquareIcon class="me-2 size-4 shrink-0" />
					<div class="flex flex-col gap-0.5 overflow-hidden">
						<span class="truncate text-sm">{chat.title}</span>
					</div>
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
