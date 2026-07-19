<script lang="ts">
	import { setChatsContext } from '$lib/hooks/chats.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/custom/sidebar/appbar.svelte';
	import { ConfirmDeleteDialog } from '$lib/components/custom';
	import { onMount } from 'svelte';
	const { data, children } = $props();
	const chatsContext = setChatsContext();

	onMount(() => {
		chatsContext.init(data.chats, data.hasMore);
	});
</script>

<ConfirmDeleteDialog />

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	<Sidebar.Inset>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
