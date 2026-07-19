<script lang="ts">
	import { setChatsContext } from '$lib/hooks/chats.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/custom/sidebar/appbar.svelte';
	import { ConfirmDeleteDialog } from '$lib/components/custom';

	const { data, children } = $props();

	const chatsContext = setChatsContext();

	$effect(() => {
		if (data.chats) {
			chatsContext.chats = data.chats;
		}
	});
</script>

<ConfirmDeleteDialog />

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	{@render children()}
</Sidebar.Provider>
