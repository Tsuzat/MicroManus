<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { AppLogo } from '$lib/components/custom';
	import ChatTile from './chattile.svelte';
	import { useChatsContext } from '$lib/hooks/chats.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { BarSpinner } from '$lib/components/spell/bar-spinner';

	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import PinIcon from '@lucide/svelte/icons/pin';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	interface Props {
		user?: {
			name: string;
			email: string;
			image?: string | null;
		};
	}

	let { user }: Props = $props();

	const sidebar = useSidebar();
	const chatsContext = useChatsContext();

	const isDashboardActive = $derived(page.url.pathname === '/dashboard');
	const isNewChatActive = $derived(page.url.pathname.includes('/chat/new'));

	const userInitials = $derived(
		user?.name
			? user.name
					.split(' ')
					.map((n) => n[0])
					.join('')
					.toUpperCase()
					.slice(0, 2)
			: 'U'
	);
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem class="flex items-center justify-between">
				{#if !sidebar.open}
					<div class="group relative flex size-8 items-center justify-center">
						<div class="flex items-center justify-center group-hover:hidden">
							<AppLogo showLogo={false} size={2} />
						</div>
						<div class="hidden items-center justify-center group-hover:flex">
							<Sidebar.Trigger class="size-8" />
						</div>
					</div>
				{:else}
					<Sidebar.MenuButton size="default" class="hover:bg-transparent">
						<AppLogo showLogo={false} size={2} />
					</Sidebar.MenuButton>
					<Sidebar.Trigger class="ms-auto" />
				{/if}
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu class="gap-1">
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isDashboardActive}>
						{#snippet child({ props })}
							<a href={resolve('/(app)/chat/new')} title="Dashboard" {...props}>
								<LayoutDashboardIcon class="size-4 shrink-0 text-muted-foreground" />
								<span>Dashboard</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="#" title="Search Chats" {...props}>
								<SearchIcon class="size-4 shrink-0 text-muted-foreground" />
								<span>Search Chats</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>

				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isNewChatActive}>
						{#snippet child({ props })}
							<a href={resolve('/(app)/chat/new')} title="New Chat" {...props}>
								<PlusIcon class="size-4 shrink-0 text-muted-foreground" />
								<span>New Chat</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>

		<!-- 3. Group of Pinned Chats -->
		{#if chatsContext && chatsContext.pinnedChats.length > 0}
			<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
				<Sidebar.GroupLabel class="flex items-center gap-1.5">
					<PinIcon />
					<span>Pinned Chats</span>
				</Sidebar.GroupLabel>
				<Sidebar.Menu class="gap-0.5">
					{#each chatsContext.pinnedChats as chat (chat.id)}
						<ChatTile {chat} />
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/if}

		<!-- 4. Group of All Other Chats -->
		<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
			<Sidebar.GroupLabel class="flex items-center gap-1.5">
				<span>Recent Chats</span>
			</Sidebar.GroupLabel>
			<Sidebar.Menu>
				{#if chatsContext && chatsContext.otherChats.length > 0}
					{#each chatsContext.otherChats as chat (chat.id)}
						<ChatTile {chat} />
					{/each}

					{#if chatsContext.hasMore}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								onclick={() => chatsContext.loadMore()}
								disabled={chatsContext.loadingMore}
								class="text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								{#if chatsContext.loadingMore}
									<BarSpinner />
									<span>Loading...</span>
								{:else}
									<ChevronDownIcon class="size-3.5" />
									<span>Load more chats</span>
								{/if}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/if}
				{:else}
					<Sidebar.MenuItem class="px-2 py-1.5 text-xs text-muted-foreground italic">
						No chats yet
					</Sidebar.MenuItem>
				{/if}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<!-- 5. Footer: User Menu -->
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								size="lg"
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image src={user?.image ?? ''} alt={user?.name ?? 'User'} />
									<Avatar.Fallback class="rounded-lg">{userInitials}</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-start text-sm leading-tight">
									<span class="truncate font-medium">{user?.name ?? 'User'}</span>
									<span class="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
								</div>
								<ChevronsUpDownIcon class="ms-auto size-4" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
						side={sidebar.isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Label class="p-0 font-normal">
							<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image src={user?.image ?? ''} alt={user?.name ?? 'User'} />
									<Avatar.Fallback class="rounded-lg">{userInitials}</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-start text-sm leading-tight">
									<span class="truncate font-medium">{user?.name ?? 'User'}</span>
									<span class="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
								</div>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item>
								<BadgeCheckIcon />
								<span>Account</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<CreditCardIcon />
								<span>Billing</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<BellIcon />
								<span>Notifications</span>
							</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => goto(resolve('/signout'))} class="text-destructive">
							<LogOutIcon class="size-4" />
							<span>Sign Out</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
