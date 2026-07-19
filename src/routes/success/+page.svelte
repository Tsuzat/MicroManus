<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { AppLogo, Particles } from '$lib/components/custom';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Coins from '@lucide/svelte/icons/coins';
	import { resolve } from '$app/paths';

	const { data } = $props();

	let countdown = $state(3);

	onMount(() => {
		const timer = setInterval(() => {
			if (countdown > 1) {
				countdown -= 1;
			} else {
				clearInterval(timer);
				goto(resolve('/(app)/chat/new'));
			}
		}, 1000);

		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>Payment Successful | MicroManus</title>
</svelte:head>

<Particles class="fixed top-0 left-0 -z-10 h-screen w-screen bg-transparent!" />

<main class="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
	<div class="my-8 flex w-full max-w-lg flex-col items-center gap-8">
		<AppLogo class="z-50 mx-auto" />

		<Card.Root
			class="relative w-full overflow-hidden border bg-background/60 p-6 text-center shadow-2xl backdrop-blur-2xl transition-all duration-300 md:p-8"
		>
			<!-- Glow Effects -->
			<div
				class="pointer-events-none absolute -top-16 -left-16 size-44 rounded-full bg-primary/20 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -right-16 -bottom-16 size-44 rounded-full bg-green-500/20 blur-3xl"
			></div>

			<Card.Header class="items-center space-y-4 pb-4">
				<div class="relative">
					<div
						class="flex size-20 animate-bounce items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-lg"
					>
						<CheckCircle2 class="size-10" />
					</div>
					<div class="absolute -top-1 -right-1">
						<Sparkles class="size-6 animate-pulse text-amber-400" />
					</div>
				</div>

				<div class="space-y-1">
					<Card.Title class="text-2xl font-extrabold tracking-tight md:text-3xl">
						Payment Confirmed!
					</Card.Title>
					<Card.Description class="text-base">
						Thank you, <span class="font-medium text-foreground">{data.user.name || 'User'}</span>!
						Your account is now fully unlocked.
					</Card.Description>
				</div>
			</Card.Header>

			<Card.Content class="space-y-6 py-4">
				<!-- Credit Badge Banner -->
				<div
					class="flex items-center justify-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-primary"
				>
					<Coins class="size-6 shrink-0" />
					<div class="text-left">
						<div class="text-sm font-semibold">5 Credits Granted</div>
						<div class="text-xs text-muted-foreground">
							Ready to use across all supported AI models
						</div>
					</div>
				</div>

				<p class="text-xs text-muted-foreground">
					Redirecting to application in <span class="font-bold text-foreground">{countdown}</span> seconds...
				</p>
			</Card.Content>

			<Card.Footer class="pt-2">
				<Button
					onclick={() => goto(resolve('/(app)/chat/new'))}
					class="w-full gap-2 font-semibold shadow-lg"
					size="lg"
				>
					Go to Dashboard Now
					<ArrowRight class="size-4" />
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</main>
