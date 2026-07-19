<script lang="ts">
	import { setChatsContext } from '$lib/hooks/chats.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/custom/sidebar/appbar.svelte';
	import { ConfirmDeleteDialog } from '$lib/components/custom';
	import { onMount } from 'svelte';
	const { data, children } = $props();
	const chatsContext = setChatsContext();

	let open = $state(false);

	onMount(() => {
		chatsContext.init(data.chats, data.hasMore);
		if (localStorage.getItem('sidebar:state') === 'true') {
			open = true;
		} else {
			open = false;
		}
	});
</script>

<ConfirmDeleteDialog />

<Sidebar.Provider
	class="h-screen w-screen bg-muted/10!"
	id="sidebar-wrapper"
	{open}
	onOpenChange={(op) => {
		localStorage.setItem('sidebar:state', op.toString());
	}}
>
	<AppSidebar user={data.user} />
	<Sidebar.Inset class="overflow-hidden rounded-xl border p-0.5">
		{@render children()}
	</Sidebar.Inset>
	<!-- <Sidebar.Inset>
		{@render children()}
	</Sidebar.Inset> -->
</Sidebar.Provider>
