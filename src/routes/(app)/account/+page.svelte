<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/authClient';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import { getInitials } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	import UserIcon from '@lucide/svelte/icons/user';
	import MailIcon from '@lucide/svelte/icons/mail';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import CoinsIcon from '@lucide/svelte/icons/coins';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import CpuIcon from '@lucide/svelte/icons/cpu';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import LaptopIcon from '@lucide/svelte/icons/laptop';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import ActivityIcon from '@lucide/svelte/icons/activity';

	const { data } = $props();

	// Sessions client state
	let sessions = $state<any[]>([]);
	let loadingSessions = $state(true);

	async function loadSessions() {
		loadingSessions = true;
		try {
			const res = await authClient.listSessions();
			if (res && res.data) {
				sessions = res.data;
			}
		} catch (err) {
			console.error('Failed to load sessions:', err);
			toast.error('Failed to load active sessions');
		} finally {
			loadingSessions = false;
		}
	}

	async function handleRevoke(token: string) {
		try {
			const { error } = await authClient.revokeSession({ token });
			if (error) {
				toast.error(error.message || 'Failed to revoke session');
			} else {
				toast.success('Session revoked successfully');
				await loadSessions();
			}
		} catch (err) {
			toast.error('Failed to revoke session');
		}
	}

	async function handleRevokeOthers() {
		try {
			const { error } = await authClient.revokeOtherSessions();
			if (error) {
				toast.error(error.message || 'Failed to revoke other sessions');
			} else {
				toast.success('Other sessions revoked successfully');
				await loadSessions();
			}
		} catch (err) {
			toast.error('Failed to revoke other sessions');
		}
	}

	// Browser / Device Parsing Helper
	function parseUserAgent(uaString: string) {
		if (!uaString) return { device: 'Unknown Device', browser: 'Unknown Browser' };
		const ua = uaString.toLowerCase();

		let device = 'Desktop';
		let deviceIcon = LaptopIcon;
		if (ua.includes('iphone') || ua.includes('ipod')) {
			device = 'iPhone';
			deviceIcon = SmartphoneIcon;
		} else if (ua.includes('ipad')) {
			device = 'iPad';
			deviceIcon = SmartphoneIcon;
		} else if (ua.includes('android')) {
			device = 'Android Device';
			deviceIcon = SmartphoneIcon;
		} else if (ua.includes('mobile')) {
			device = 'Mobile Device';
			deviceIcon = SmartphoneIcon;
		}

		let browser = 'Unknown Browser';
		if (ua.includes('firefox')) {
			browser = 'Firefox';
		} else if (ua.includes('chrome') && !ua.includes('chromium')) {
			browser = 'Chrome';
		} else if (ua.includes('safari') && !ua.includes('chrome')) {
			browser = 'Safari';
		} else if (ua.includes('edge') || ua.includes('edg/')) {
			browser = 'Edge';
		} else if (ua.includes('opera') || ua.includes('opr/')) {
			browser = 'Opera';
		} else if (ua.includes('chromium')) {
			browser = 'Chromium';
		}

		return { device, browser, deviceIcon };
	}

	onMount(() => {
		loadSessions();
	});

	// Date formatting helpers
	function formatDate(d: string | Date) {
		if (!d) return '';
		return new Date(d).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatTime(d: string | Date) {
		if (!d) return '';
		return new Date(d).toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>My Account — MicroManus</title>
	<meta name="description" content="Manage your user profile, active sessions, and available credits on MicroManus" />
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="flex items-center gap-2 border-b px-6 py-4">
		<Sidebar.Trigger class="size-8 md:hidden" />
		<div class="flex items-center gap-2">
			<UserIcon class="size-5 text-muted-foreground" />
			<h1 class="text-lg font-medium tracking-tight">Account Settings</h1>
		</div>
	</div>

	<!-- Content Area -->
	<div class="flex-1 overflow-y-auto p-6">
		<div class="mx-auto max-w-3xl space-y-8 pb-12">
			<!-- Section 1: Profile Overview -->
			<Card.Root class="overflow-hidden">
				<div class="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-secondary/20"></div>
				<Card.Content class="relative pt-0">
					<!-- Profile Photo Container -->
					<div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 px-2 pb-6">
						<Avatar.Root class="size-20 rounded-2xl border-4 border-background shadow-md">
							<Avatar.Image src={data.user.image ?? ''} alt={data.user.name} />
							<Avatar.Fallback class="rounded-xl text-xl font-bold bg-muted">
								{getInitials(data.user.name ?? 'User')}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex-1 space-y-1">
							<div class="flex flex-wrap items-center gap-2">
								<h2 class="m-0 pb-0 text-xl font-bold tracking-tight">{data.user.name}</h2>
								{#if data.unlockStatus?.unlocked}
									<Badge variant="default" class="bg-amber-500 hover:bg-amber-500/90 text-white font-medium flex gap-1 items-center">
										<SparklesIcon class="size-3" />
										Pro Tier
									</Badge>
								{:else}
									<Badge variant="secondary" class="font-medium text-xs">Free Tier</Badge>
								{/if}
							</div>
							<p class="text-sm text-muted-foreground flex items-center gap-1.5">
								<MailIcon class="size-4 shrink-0" />
								{data.user.email}
							</p>
						</div>
					</div>

					<Separator />

					<!-- Profile Details List -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-sm">
						<div class="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
							<CalendarIcon class="size-5 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground font-medium">Joined On</p>
								<p class="font-semibold text-foreground">{formatDate(data.user.createdAt)}</p>
							</div>
						</div>

						<div class="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
							{#if data.user.emailVerified}
								<ShieldCheckIcon class="size-5 text-emerald-500" />
								<div>
									<p class="text-xs text-muted-foreground font-medium">Email Verification</p>
									<p class="font-semibold text-emerald-500">Verified</p>
								</div>
							{:else}
								<ShieldAlertIcon class="size-5 text-amber-500" />
								<div>
									<p class="text-xs text-muted-foreground font-medium">Email Verification</p>
									<p class="font-semibold text-amber-500">Unverified</p>
								</div>
							{/if}
						</div>

						{#if data.unlockStatus?.unlocked}
							<div class="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 md:col-span-2">
								<SparklesIcon class="size-5 text-amber-500 animate-pulse" />
								<div>
									<p class="text-xs text-muted-foreground font-medium">Subscription Unlock Method</p>
									<p class="font-semibold text-foreground">
										Unlocked via {data.unlockStatus.method === 'payment' ? 'Payment' : 'Coupon Code'} 
										{#if data.unlockStatus.unlockedAt}
											on {formatDate(data.unlockStatus.unlockedAt)}
										{/if}
									</p>
								</div>
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Section 2: Credits & Spend Dashboard -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="m-0 text-md font-semibold tracking-tight">Credits & Usage</h3>
					<Badge variant="outline" class="font-normal text-xs text-muted-foreground">Updated in real-time</Badge>
				</div>

				<div class="grid gap-4 sm:grid-cols-3">
					<Card.Root class="bg-card">
						<Card.Header class="flex flex-row items-center justify-between pb-2">
							<Card.Title class="text-sm font-medium">Available Credits</Card.Title>
							<CoinsIcon class="size-4 text-amber-500" />
						</Card.Header>
						<Card.Content>
							<div class="text-3xl font-bold tracking-tight text-amber-500">
								{data.credits.balance}
							</div>
							<p class="text-xs text-muted-foreground mt-1">Ready for custom generations</p>
						</Card.Content>
					</Card.Root>

					<Card.Root class="bg-card">
						<Card.Header class="flex flex-row items-center justify-between pb-2">
							<Card.Title class="text-sm font-medium">Total Cost Used</Card.Title>
							<CreditCardIcon class="size-4 text-muted-foreground" />
						</Card.Header>
						<Card.Content>
							<div class="text-3xl font-bold tracking-tight">
								${data.credits.totalCost.toFixed(4)}
							</div>
							<p class="text-xs text-muted-foreground mt-1">All-time API spend</p>
						</Card.Content>
					</Card.Root>

					<Card.Root class="bg-card">
						<Card.Header class="flex flex-row items-center justify-between pb-2">
							<Card.Title class="text-sm font-medium">Tokens Transacted</Card.Title>
							<CpuIcon class="size-4 text-muted-foreground" />
						</Card.Header>
						<Card.Content>
							<div class="text-2xl font-bold tracking-tight truncate">
								{new Intl.NumberFormat().format(data.credits.totalInputTokens + data.credits.totalOutputTokens)}
							</div>
							<p class="text-xs text-muted-foreground mt-1 font-mono text-[10px]">
								{new Intl.NumberFormat().format(data.credits.totalInputTokens)} IN / {new Intl.NumberFormat().format(data.credits.totalOutputTokens)} OUT
							</p>
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Credits History -->
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-sm font-semibold">Credit Transaction History</Card.Title>
						<Card.Description class="text-xs">Recent modifications to your credit ledger balance</Card.Description>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="overflow-x-auto">
							<table class="w-full text-sm border-t">
								<thead>
									<tr class="bg-muted/40 text-muted-foreground text-xs border-b">
										<th class="py-2.5 px-4 text-left font-medium">Reason</th>
										<th class="py-2.5 px-4 text-right font-medium">Change</th>
										<th class="py-2.5 px-4 text-right font-medium">Date</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#if data.creditsHistory.length === 0}
										<tr>
											<td colspan="3" class="py-6 text-center text-muted-foreground text-xs italic">
												No credit transactions recorded yet
											</td>
										</tr>
									{:else}
										{#each data.creditsHistory as item (item.id)}
											<tr class="hover:bg-muted/10 transition-colors">
												<td class="py-2.5 px-4 font-medium text-xs">{item.reason || 'Manual Update'}</td>
												<td class="py-2.5 px-4 text-right font-mono text-xs font-semibold">
													{#if item.delta > 0}
														<span class="text-emerald-600 dark:text-emerald-500">+{item.delta}</span>
													{:else if item.delta < 0}
														<span class="text-destructive">{item.delta}</span>
													{:else}
														<span class="text-muted-foreground">0</span>
													{/if}
												</td>
												<td class="py-2.5 px-4 text-right text-muted-foreground text-xs font-mono">
													{formatDate(item.createdAt)}
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Section 3: Active Sessions -->
			<div class="space-y-4">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
					<div>
						<h3 class="m-0 text-md font-semibold tracking-tight">Active Sessions</h3>
						<p class="text-xs text-muted-foreground">Devices currently logged into your account</p>
					</div>
					{#if sessions.length > 1}
						<Button variant="outline" size="sm" onclick={handleRevokeOthers} class="text-xs h-8">
							Log Out Other Devices
						</Button>
					{/if}
				</div>

				<div class="space-y-3">
					{#if loadingSessions}
						<div class="space-y-3">
							{#each Array(2) as _}
								<div class="h-20 rounded-xl border bg-card animate-pulse"></div>
							{/each}
						</div>
					{:else if sessions.length === 0}
						<Card.Root>
							<Card.Content class="py-8 text-center text-muted-foreground text-sm italic">
								Could not retrieve active sessions
							</Card.Content>
						</Card.Root>
					{:else}
						{#each sessions as session (session.id)}
							{@const parsed = parseUserAgent(session.userAgent)}
							{@const isCurrent = session.token === data.sessionToken || session.id === data.sessionToken}
							<div class="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
								<div class="flex items-center gap-3">
									<div class="rounded-lg bg-primary/10 p-2 text-primary">
										<svelte:component this={parsed.deviceIcon} class="size-5" />
									</div>
									<div class="space-y-0.5">
										<div class="flex items-center gap-2">
											<span class="text-sm font-semibold">{parsed.device}</span>
											<span class="text-xs text-muted-foreground">•</span>
											<span class="text-xs font-medium text-muted-foreground">{parsed.browser}</span>
											{#if isCurrent}
												<Badge variant="default" class="text-[10px] h-4 px-1.5 bg-primary font-medium">This Device</Badge>
											{/if}
										</div>
										<p class="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
											<span>IP: <code class="font-mono">{session.ipAddress || 'Unknown'}</code></span>
											<span>•</span>
											<span>Created: {formatDate(session.createdAt)} {formatTime(session.createdAt)}</span>
										</p>
									</div>
								</div>

								{#if !isCurrent}
									<Button
										variant="outline"
										size="icon"
										onclick={() => handleRevoke(session.token)}
										title="Revoke session"
										class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
									>
										<Trash2Icon class="size-4" />
									</Button>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Section 4: Danger Zone -->
			<Card.Root class="border-destructive/30 bg-destructive/[0.02]">
				<Card.Header class="pb-3">
					<Card.Title class="text-sm font-semibold text-destructive flex items-center gap-2">
						<LogOutIcon class="size-4" />
						Danger Zone
					</Card.Title>
					<Card.Description class="text-xs">Manage your session authentication state and account</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div class="space-y-0.5">
							<p class="text-sm font-medium text-foreground">Sign Out of MicroManus</p>
							<p class="text-xs text-muted-foreground">Properly end your authentication session on this browser.</p>
						</div>
						<Button href="/signout" variant="destructive" class="w-full sm:w-auto font-medium">
							Sign Out
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
