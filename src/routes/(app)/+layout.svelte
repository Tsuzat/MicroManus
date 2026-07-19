<script lang="ts">
	import { setChatsContext } from '$lib/hooks/chats.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import AppSidebar from '$lib/components/custom/sidebar/appbar.svelte';

	const { data, children } = $props();

	const chatsContext = setChatsContext(data.chats ?? []);

	$effect(() => {
		if (data.chats) {
			chatsContext.chats = data.chats;
		}
	});
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	<Sidebar.Inset>
		<header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="me-2 h-4" />
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
