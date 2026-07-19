<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { AppLogo, GithubIcon, GoogleIcon, Particles } from '$lib/components/custom';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { authClient } from '$lib/authClient';
	import { BarSpinner } from '$lib/components/spell/bar-spinner';
	import type { SocialProvider } from 'better-auth';

	const redirectTo = $derived(page.url.searchParams.get('redirectTo') ?? '/');

	let loadingProvider = $state<string | null>(null);

	const lastLoginMethod = authClient.getLastUsedLoginMethod();

	const handleSocialSignIn = async (provider: SocialProvider) => {
		loadingProvider = provider;
		await authClient.signIn.social({
			provider,
			callbackURL: redirectTo
		});
		loadingProvider = null;
	};
</script>

<svelte:head>
	<title>Sign In | MicroManus</title>
</svelte:head>

{#snippet LastLogin()}
	<span
		class="absolute inset-e-0 top-1.75 right-1 rounded-md bg-primary px-1 py-0.5 text-xs font-semibold text-foreground"
		>Last</span
	>
{/snippet}

<Particles class="fixed top-0 left-0 -z-10 h-screen w-screen bg-transparent!" />
<main class="inset-0 flex h-screen w-screen flex-col items-center justify-center gap-8">
	<AppLogo class="z-50 mx-auto" />

	<Card.Root class="w-full max-w-md bg-transparent! backdrop-blur-2xl">
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Sign In to MicroManus</Card.Title>
			<Card.Description>Welcome back! Please sign in to continue.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4 px-8">
			<div class="flex flex-col gap-3">
				<Button
					onclick={() => handleSocialSignIn('github')}
					type="button"
					variant="outline"
					size="lg"
					class="relative w-full"
					disabled={loadingProvider !== null}
				>
					{#if loadingProvider === 'github'}
						<BarSpinner />
					{:else}
						<GithubIcon />
					{/if}
					Sign In with GitHub
					{#if lastLoginMethod === 'github'}
						{@render LastLogin()}
					{/if}
				</Button>

				<Button
					onclick={() => handleSocialSignIn('google')}
					type="button"
					variant="outline"
					size="lg"
					class="relative w-full"
					disabled={loadingProvider !== null}
				>
					{#if loadingProvider === 'google'}
						<BarSpinner />
					{:else}
						<GoogleIcon />
					{/if}
					Sign In with Google
					{#if lastLoginMethod === 'google'}
						{@render LastLogin()}
					{/if}
				</Button>
			</div>
		</Card.Content>
		<Card.Footer class="flex flex-col items-center border-t-0! pt-0">
			<div class="mt-4 text-center text-sm text-muted-foreground">
				By signing in, you agree to our <a
					class="underline hover:text-foreground"
					href={resolve('/terms')}>Terms of Service</a
				>
				and <a class="underline hover:text-foreground" href={resolve('/privacy')}>Privacy Policy</a>
			</div>
		</Card.Footer>
	</Card.Root>
</main>
