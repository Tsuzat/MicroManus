<script lang="ts">
	import { setChatsContext } from '$lib/hooks/chats.svelte';
	import { onMount } from 'svelte';
	const { data, children } = $props();
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';

	const chats = setChatsContext();

	onMount(() => {
		chats.chats = data.chats;
	});
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="me-2 h-4" />
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
