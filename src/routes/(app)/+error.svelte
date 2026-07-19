<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Sidebar from '$lib/components/ui/sidebar';

	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import HomeIcon from '@lucide/svelte/icons/home';
	import MessageSquarePlusIcon from '@lucide/svelte/icons/message-square-plus';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Something went wrong');

	const statusConfig = $derived.by(() => {
		if (status === 404) {
			return {
				title: 'Page Not Found',
				description: "The page you're looking for doesn't exist or has been moved.",
				gradient: 'from-amber-500/15 via-orange-500/10 to-red-500/5',
				iconBg: 'bg-amber-500/10 border-amber-500/20',
				iconColor: 'text-amber-500',
				statusGradient: 'from-amber-400 to-orange-500'
			};
		}
		if (status === 403) {
			return {
				title: 'Access Denied',
				description: "You don't have permission to view this resource.",
				gradient: 'from-violet-500/15 via-purple-500/10 to-fuchsia-500/5',
				iconBg: 'bg-violet-500/10 border-violet-500/20',
				iconColor: 'text-violet-500',
				statusGradient: 'from-violet-400 to-purple-500'
			};
		}
		if (status >= 500) {
			return {
				title: 'Server Error',
				description: 'An unexpected error occurred on our end. Please try again later.',
				gradient: 'from-red-500/15 via-rose-500/10 to-pink-500/5',
				iconBg: 'bg-red-500/10 border-red-500/20',
				iconColor: 'text-red-500',
				statusGradient: 'from-red-400 to-rose-500'
			};
		}
		return {
			title: 'Something Went Wrong',
			description: message,
			gradient: 'from-primary/15 via-primary/5 to-secondary/10',
			iconBg: 'bg-destructive/10 border-destructive/20',
			iconColor: 'text-destructive',
			statusGradient: 'from-foreground to-muted-foreground'
		};
	});
</script>

<svelte:head>
	<title>Error {status} — MicroManus</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="flex items-center gap-2 border-b px-6 py-4">
		<Sidebar.Trigger class="size-8 md:hidden" />
		<div class="flex items-center gap-2">
			<TriangleAlertIcon class="size-5 text-muted-foreground" />
			<h1 class="text-lg font-medium tracking-tight">Error</h1>
		</div>
	</div>

	<!-- Content -->
	<div class="flex flex-1 items-center justify-center overflow-y-auto p-6">
		<div class="flex max-w-md flex-col items-center gap-8 text-center">
			<!-- Glowing Icon -->
			<div class="relative">
				<div
					class="absolute -inset-6 rounded-full bg-linear-to-br {statusConfig.gradient} blur-2xl"
				></div>
				<div
					class="relative flex size-24 items-center justify-center rounded-full border {statusConfig.iconBg}"
				>
					<TriangleAlertIcon class="size-10 {statusConfig.iconColor}" strokeWidth={1.5} />
				</div>
			</div>

			<!-- Status Code + Message -->
			<div class="space-y-3">
				<h2
					class="m-0 bg-linear-to-b {statusConfig.statusGradient} bg-clip-text pb-0 text-7xl font-black tracking-tighter text-transparent"
				>
					{status}
				</h2>
				<p class="text-base font-semibold text-foreground">{statusConfig.title}</p>
				<p class="max-w-sm text-sm leading-relaxed text-balance text-muted-foreground">
					{statusConfig.description}
				</p>
				{#if message && message !== statusConfig.description}
					<p
						class="mx-auto max-w-xs rounded-lg border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground"
					>
						{message}
					</p>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-wrap justify-center gap-3">
				<Button variant="outline" onclick={() => history.back()} class="gap-2">
					<ArrowLeftIcon class="size-4" />
					Go Back
				</Button>

				{#if status >= 500}
					<Button onclick={() => location.reload()} class="gap-2">
						<RefreshCwIcon class="size-4" />
						Retry
					</Button>
				{:else}
					<Button href={resolve('/(app)/chat/new')} class="gap-2">
						<MessageSquarePlusIcon class="size-4" />
						New Chat
					</Button>
				{/if}

				<Button variant="ghost" href="/" class="gap-2 text-muted-foreground">
					<HomeIcon class="size-4" />
					Home
				</Button>
			</div>
		</div>
	</div>
</div>
