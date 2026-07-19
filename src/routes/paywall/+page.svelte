<script lang="ts">
	import { goto } from '$app/navigation';
	import { AppLogo, Particles } from '$lib/components/custom';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { BarSpinner } from '$lib/components/spell/bar-spinner';
	import { authClient } from '$lib/authClient';
	import { toast } from 'svelte-sonner';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Ticket from '@lucide/svelte/icons/ticket';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';

	let couponCode = $state('');
	let isSubmittingCoupon = $state(false);
	let isInitiatingPayment = $state(false);

	const handlePayWithPolar = async () => {
		try {
			isInitiatingPayment = true;
			const res = await authClient.checkout({
				slug: 'pro'
			});
			if (res?.error) {
				toast.error(res.error.message || 'Failed to initiate payment');
			}
		} catch (err: any) {
			toast.error(err.message || 'Payment initiation failed');
		} finally {
			isInitiatingPayment = false;
		}
	};

	const handleApplyCoupon = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!couponCode.trim()) {
			toast.error('Please enter a coupon code');
			return;
		}

		try {
			isSubmittingCoupon = true;
			const res = await fetch('/api/paywall/coupon', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code: couponCode.trim() })
			});

			const body = await res.json();

			if (!res.ok) {
				toast.error(body.error || 'Failed to apply coupon code');
				return;
			}

			toast.success(body.message || 'Paywall unlocked! 5 credits granted.');
			setTimeout(() => {
				goto(resolve('/(app)/chat/new'));
			}, 800);
		} catch (err: unknown) {
			toast.error(err.message || 'An unexpected error occurred');
		} finally {
			isSubmittingCoupon = false;
		}
	};
</script>

<svelte:head>
	<title>Unlock Access | MicroManus</title>
</svelte:head>

<Particles class="fixed top-0 left-0 -z-10 h-screen w-screen bg-transparent!" />

<main class="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
	<div class="my-8 flex w-full max-w-4xl flex-col items-center gap-8">
		<AppLogo class="z-50 mx-auto" />

		<div class="max-w-xl space-y-3 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase"
			>
				<Sparkles class="size-3.5" />
				Welcome to MicroManus
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight md:text-5xl">
				Unlock Full Platform Access
			</h1>
			<p class="text-sm text-muted-foreground md:text-base">
				Choose how you want to unlock access. Either option grants you <span
					class="font-bold text-foreground">5 starting credits</span
				> to explore all AI models.
			</p>
		</div>

		<!-- Cards Container -->
		<div class="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Option 1: Polar Payment -->
			<Card.Root
				class="relative flex flex-col justify-between overflow-hidden border bg-background/50 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-primary/50"
			>
				<div
					class="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-primary/10 blur-2xl"
				></div>

				<Card.Header class="space-y-3">
					<div
						class="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
					>
						<CreditCard class="size-6" />
					</div>
					<div>
						<Card.Title class="text-xl">One-Time Payment</Card.Title>
						<Card.Description>Pay once via Polar & credit card</Card.Description>
					</div>
				</Card.Header>

				<Card.Content class="space-y-4">
					<div class="flex items-baseline gap-2">
						<span class="text-4xl font-extrabold">$5</span>
						<span class="text-sm text-muted-foreground">USD / one-time</span>
					</div>

					<ul class="space-y-2.5 text-sm">
						<li class="flex items-center gap-2.5 text-muted-foreground">
							<CheckCircle2 class="size-4 shrink-0 text-primary" />
							<span>Instant unlock for all app features</span>
						</li>
						<li class="flex items-center gap-2.5 text-muted-foreground">
							<CheckCircle2 class="size-4 shrink-0 text-primary" />
							<span><strong class="text-foreground">5 Credits</strong> added to your balance</span>
						</li>
						<li class="flex items-center gap-2.5 text-muted-foreground">
							<ShieldCheck class="size-4 shrink-0 text-primary" />
							<span>Secure checkout via Polar</span>
						</li>
					</ul>
				</Card.Content>

				<Card.Footer class="pt-4">
					<Button
						onclick={handlePayWithPolar}
						disabled={isInitiatingPayment}
						class="w-full gap-2 font-semibold shadow-lg"
						size="lg"
					>
						{#if isInitiatingPayment}
							<BarSpinner />
							Redirecting to Checkout...
						{:else}
							Pay $5 USD & Unlock
							<ArrowRight class="size-4" />
						{/if}
					</Button>
				</Card.Footer>
			</Card.Root>

			<!-- Option 2: Coupon Code -->
			<Card.Root
				class="relative flex flex-col justify-between overflow-hidden border bg-background/50 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-primary/50"
			>
				<div
					class="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-secondary/30 blur-2xl"
				></div>

				<Card.Header class="space-y-3">
					<div
						class="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
					>
						<Ticket class="size-6" />
					</div>
					<div>
						<Card.Title class="text-xl">Redeem Coupon</Card.Title>
						<Card.Description>Have an access code or invite coupon?</Card.Description>
					</div>
				</Card.Header>

				<Card.Content class="space-y-4">
					<div class="flex items-baseline gap-2">
						<span class="text-4xl font-extrabold">Free</span>
						<span class="text-sm text-muted-foreground">with valid promo code</span>
					</div>

					<ul class="space-y-2.5 text-sm">
						<li class="flex items-center gap-2.5 text-muted-foreground">
							<CheckCircle2 class="size-4 shrink-0 text-primary" />
							<span>Instant unlock without credit card</span>
						</li>
						<li class="flex items-center gap-2.5 text-muted-foreground">
							<CheckCircle2 class="size-4 shrink-0 text-primary" />
							<span><strong class="text-foreground">5 Credits</strong> credited immediately</span>
						</li>
					</ul>

					<form onsubmit={handleApplyCoupon} id="coupon-form" class="space-y-2 pt-2">
						<div class="space-y-1">
							<Input
								type="text"
								placeholder="Enter coupon code"
								bind:value={couponCode}
								disabled={isSubmittingCoupon}
							/>
						</div>
					</form>
				</Card.Content>

				<Card.Footer class="pt-4">
					<Button
						type="submit"
						form="coupon-form"
						disabled={isSubmittingCoupon || !couponCode.trim()}
						variant="secondary"
						class="w-full gap-2 font-semibold"
						size="lg"
					>
						{#if isSubmittingCoupon}
							<BarSpinner />
							Verifying Code...
						{:else}
							Apply Coupon Code
							<ArrowRight class="size-4" />
						{/if}
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>

		<p class="max-w-md text-center text-xs text-muted-foreground">
			Need help with access? Contact us at <a
				href="mailto:contact@tsuzat.com"
				class="text-primary hover:underline">contact@tsuzat.com</a
			>
		</p>
	</div>
</main>
