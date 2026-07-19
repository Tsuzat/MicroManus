<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import KeyIcon from '@lucide/svelte/icons/key';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { OpenAIIcon, GoogleIcon, AnthropicIcon, KimiIcon } from '$lib/components/custom/icons';

	const { data, form } = $props();

	let isSubmitting = $state(false);

	// Visibility states for keys
	let showKeys = $state({
		openai: false,
		anthropic: false,
		google: false,
		kimi: false
	});

	// Local input states initialized from page load
	let keys = $state({
		openai: data.keys.openai?.masked || '',
		anthropic: data.keys.anthropic?.masked || '',
		google: data.keys.google?.masked || '',
		kimi: data.keys.kimi?.masked || ''
	});

	// Trigger toast on form action result
	$effect(() => {
		if (form?.success) {
			toast.success(form.message || 'API keys saved successfully');
		} else if (form?.error) {
			toast.error(form.error || 'Failed to save API keys');
		}
	});

	function clearKey(provider: 'openai' | 'anthropic' | 'google' | 'kimi') {
		keys[provider] = '';
		toast.success(`Cleared ${provider} key (save to apply changes)`);
	}
</script>

<svelte:head>
	<title>API Key Settings — MicroManus</title>
	<meta name="description" content="Manage your AI provider API keys securely on MicroManus" />
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="flex items-center gap-2 border-b px-6 py-4">
		<Sidebar.Trigger class="size-8 md:hidden" />
		<div class="flex items-center gap-2">
			<KeyIcon class="size-5 text-muted-foreground" />
			<h1 class="text-lg font-medium tracking-tight">API Key Configuration</h1>
		</div>
	</div>

	<!-- Form area -->
	<div class="flex-1 overflow-y-auto px-6 py-8">
		<div class="mx-auto max-w-2xl">
			<div class="flex flex-col gap-1.5 pb-6">
				<h2 class="mt-0 pb-0 text-xl font-semibold">Bring Your Own Keys</h2>
				<p class="text-sm text-muted-foreground">
					Configure your private API keys. Keys are encrypted at rest with AES-256-GCM. When set,
					these will be preferred over default system keys. Leave empty to delete.
				</p>
			</div>

			<form
				method="POST"
				action="?/saveKeys"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="flex flex-col gap-6"
			>
				<!-- OpenAI Key Card -->
				<div class="rounded-xl border bg-card p-5 shadow-sm">
					<div class="flex items-center gap-3 pb-4">
						<div class="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
							<OpenAIIcon class="size-5" />
						</div>
						<div>
							<h3 class="mt-0 text-sm font-semibold leading-none">OpenAI (ChatGPT)</h3>
							<p class="mt-1 text-xs text-muted-foreground">
								Used for GPT-5.6 Sol, Terra, and Luna models.
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<div class="relative flex-1">
							<Input
								type={showKeys.openai ? 'text' : 'password'}
								name="openai"
								placeholder="Enter OpenAI API Key (sk-...)"
								bind:value={keys.openai}
								class="pr-10 font-mono text-xs"
							/>
							<button
								type="button"
								onclick={() => (showKeys.openai = !showKeys.openai)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{#if showKeys.openai}
									<EyeOffIcon class="size-4" />
								{:else}
									<EyeIcon class="size-4" />
								{/if}
							</button>
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onclick={() => clearKey('openai')}
							disabled={!keys.openai}
							title="Clear Key"
						>
							<Trash2Icon class="size-4" />
						</Button>
					</div>
				</div>

				<!-- Anthropic Key Card -->
				<div class="rounded-xl border bg-card p-5 shadow-sm">
					<div class="flex items-center gap-3 pb-4">
						<div class="rounded-lg bg-orange-500/10 p-2 text-orange-500">
							<AnthropicIcon class="size-5" />
						</div>
						<div>
							<h3 class="mt-0 text-sm font-semibold leading-none">Anthropic (Claude)</h3>
							<p class="mt-1 text-xs text-muted-foreground">
								Used for Claude Sonnet 5, Opus 4.8, and Haiku 4.5.
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<div class="relative flex-1">
							<Input
								type={showKeys.anthropic ? 'text' : 'password'}
								name="anthropic"
								placeholder="Enter Anthropic API Key (sk-ant-...)"
								bind:value={keys.anthropic}
								class="pr-10 font-mono text-xs"
							/>
							<button
								type="button"
								onclick={() => (showKeys.anthropic = !showKeys.anthropic)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{#if showKeys.anthropic}
									<EyeOffIcon class="size-4" />
								{:else}
									<EyeIcon class="size-4" />
								{/if}
							</button>
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onclick={() => clearKey('anthropic')}
							disabled={!keys.anthropic}
							title="Clear Key"
						>
							<Trash2Icon class="size-4" />
						</Button>
					</div>
				</div>

				<!-- Google Key Card -->
				<div class="rounded-xl border bg-card p-5 shadow-sm">
					<div class="flex items-center gap-3 pb-4">
						<div class="rounded-lg bg-blue-500/10 p-2 text-blue-500">
							<GoogleIcon class="size-5" />
						</div>
						<div>
							<h3 class="mt-0 text-sm font-semibold leading-none">Google AI (Gemini)</h3>
							<p class="mt-1 text-xs text-muted-foreground">
								Used for Gemini 3.1 Pro and Gemini 3.5 Flash models.
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<div class="relative flex-1">
							<Input
								type={showKeys.google ? 'text' : 'password'}
								name="google"
								placeholder="Enter Google AI API Key"
								bind:value={keys.google}
								class="pr-10 font-mono text-xs"
							/>
							<button
								type="button"
								onclick={() => (showKeys.google = !showKeys.google)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{#if showKeys.google}
									<EyeOffIcon class="size-4" />
								{:else}
									<EyeIcon class="size-4" />
								{/if}
							</button>
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onclick={() => clearKey('google')}
							disabled={!keys.google}
							title="Clear Key"
						>
							<Trash2Icon class="size-4" />
						</Button>
					</div>
				</div>

				<!-- Kimi Key Card -->
				<div class="rounded-xl border bg-card p-5 shadow-sm">
					<div class="flex items-center gap-3 pb-4">
						<div class="rounded-lg bg-purple-500/10 p-2 text-purple-500">
							<KimiIcon class="size-5" />
						</div>
						<div>
							<h3 class="mt-0 text-sm font-semibold leading-none">Kimi (Moonshot)</h3>
							<p class="mt-1 text-xs text-muted-foreground">
								Used for Kimi K3 and Kimi K2.7 Code models.
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<div class="relative flex-1">
							<Input
								type={showKeys.kimi ? 'text' : 'password'}
								name="kimi"
								placeholder="Enter Kimi API Key"
								bind:value={keys.kimi}
								class="pr-10 font-mono text-xs"
							/>
							<button
								type="button"
								onclick={() => (showKeys.kimi = !showKeys.kimi)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{#if showKeys.kimi}
									<EyeOffIcon class="size-4" />
								{:else}
									<EyeIcon class="size-4" />
								{/if}
							</button>
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onclick={() => clearKey('kimi')}
							disabled={!keys.kimi}
							title="Clear Key"
						>
							<Trash2Icon class="size-4" />
						</Button>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex justify-end gap-3 pt-4">
					<Button type="submit" disabled={isSubmitting} class="w-28">
						{#if isSubmitting}
							Saving...
						{:else}
							Save Keys
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
</div>
