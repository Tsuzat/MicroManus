<script lang="ts">
	import { resolve } from '$app/paths';
	import { AppLogo, Multistream, Particles, Spotlight, UserAvatar } from '$lib/components/custom';
	import { AnimatedThemeToggler } from '$lib/components/magic/animated-theme-toggler';
	import * as Dropdown from '$lib/components/ui/dropdown-menu';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Bot from '@lucide/svelte/icons/bot';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Zap from '@lucide/svelte/icons/zap';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Menu from '@lucide/svelte/icons/menu';
	import User from '@lucide/svelte/icons/user';
	import { onMount } from 'svelte';
	import Logout from '@lucide/svelte/icons/log-out';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { BorderBeam } from '$lib/components/magic/border-beam';

	let showFirstSection = $state(false);
	let activeSection = $state('');
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '$lib/components/ui/accordion';
	import { fade } from 'svelte/transition';
	const { data } = $props();
	const { user } = $derived(data);

	let y = $state(0);
	let isScrolled = $derived(y > 20);
	const tabItems = [
		{
			url: '#features',
			title: 'Features'
		},
		{
			url: '#how-it-works',
			title: 'How It Works'
		},
		{
			url: '#faqs',
			title: 'FAQs'
		}
	];

	const features = [
		{
			name: 'AI-Powered Chat Agents',
			description:
				'Interact with powerful AI models through an intuitive chat interface. Run multi-turn conversations with tool-calling capabilities.',
			icon: Bot
		},
		{
			name: 'Bring Your Own Key',
			description:
				'Connect your own API keys from OpenAI, Anthropic, Google, and more. Full control over which models and endpoints you use.',
			icon: KeyRound
		},
		{
			name: 'Transparent Usage Tracking',
			description:
				'Track every token with event-sourced billing. Monitor input, output, and cache tokens per conversation — down to the cent.',
			icon: Zap
		},
		{
			name: 'Secure by Design',
			description:
				'Your API keys are encrypted at rest with AES-256-GCM. All data stays in your control with enterprise-grade security.',
			icon: ShieldCheck
		}
	];

	const faqItems = [
		{
			id: 'item-1',
			question: 'What is MicroManus?',
			answer:
				'MicroManus is an advanced AI chat platform built on the "Bring Your Own Key" (BYOK) philosophy. It allows you to interact with the most powerful language models in the world without paying marked-up subscription fees.'
		},
		{
			id: 'item-2',
			question: 'What does "Bring Your Own Key" (BYOK) mean?',
			answer:
				'Instead of paying us a monthly fee for AI access, you connect your own API keys directly from providers like OpenAI, Anthropic, or Google. This means you pay the wholesale API cost directly to the provider for exactly what you use, saving you money while giving you full control over rate limits and model selection.'
		},
		{
			id: 'item-3',
			question: 'Which AI providers are supported?',
			answer:
				'We support OpenAI, Anthropic, Google, OpenRouter, Groq, Together AI, DeepSeek, and any custom OpenAI-compatible endpoint. You can seamlessly switch between models from different providers in the middle of a conversation.'
		},
		{
			id: 'item-4',
			question: 'Are there any usage limits or credit systems?',
			answer:
				'No! Because you bring your own keys, there are no artificial credits, usage caps, or message limits imposed by MicroManus. Your only limits are the ones set on your API provider accounts.'
		},
		{
			id: 'item-5',
			question: 'Are my API keys secure?',
			answer:
				'Absolutely. All API keys are encrypted at rest using AES-256-GCM encryption. Keys are never stored in plain text and are only decrypted momentarily on the server when making API calls to your chosen provider.'
		},
		{
			id: 'item-6',
			question: 'Can I use multiple API keys?',
			answer:
				'Yes. You can add multiple API keys from different providers and manage them centrally. Each key can have a custom label and can be toggled on or off instantly.'
		},
		{
			id: 'item-7',
			question: 'Can I track how much I am spending?',
			answer:
				'Yes! MicroManus logs detailed token metrics for every single interaction. You can view granular cost breakdowns including input tokens, output tokens, and cache hits, giving you complete visibility into your wholesale AI spending per conversation.'
		},
		{
			id: 'item-8',
			question: 'Is there a free tier?',
			answer:
				'Yes! New users receive starter credits upon sign-up. You can also unlock full access via a coupon code or a one-time payment to get started immediately.'
		},
		{
			id: 'item-9',
			question: 'Do I need to create an account?',
			answer:
				'Yes, sign in with your GitHub or Google account to get started. We use secure OAuth — no passwords to remember.'
		},
		{
			id: 'item-10',
			question: 'Can I export my conversations?',
			answer:
				'Your conversations are stored securely and can be accessed anytime. Export functionality is on our roadmap and will be available soon.'
		}
	];

	onMount(() => {
		setTimeout(() => {
			showFirstSection = true;
		}, 500);

		// Intersection observer for section visibility (animations)
		const sections = document.querySelectorAll('section:not(#landing)');
		const animationObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('show');
				}
			});
		});
		sections.forEach((section) => {
			section.classList.add('hide');
			animationObserver.observe(section);
		});

		// Intersection observer for active nav item
		const navObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeSection = entry.target.id;
					}
				});
			},
			{ rootMargin: '-20% 0px -60% 0px' }
		);
		const allSections = document.querySelectorAll('section');
		allSections.forEach((section) => navObserver.observe(section));

		// Radiant card mouse effect
		const radiantCards = document.querySelectorAll('.radiant-card');
		radiantCards.forEach((card) => {
			card.addEventListener('mousemove', (ev) => {
				const e = ev as MouseEvent;
				const rect = (card as HTMLElement).getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				(card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
				(card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
			});
		});
	});
</script>

<svelte:window bind:scrollY={y} />
<svelte:head>
	<title>MicroManus | AI Agent Platform — Bring Your Own Key</title>
	<meta
		name="description"
		content="MicroManus is an AI agent platform where you bring your own API keys, chat with powerful language models, and track every token — all with transparent, event-sourced billing."
	/>

	<!-- Open Graph overrides -->
	<meta property="og:title" content="MicroManus — Your AI agents, your keys, your rules" />
	<meta
		property="og:description"
		content="An AI agent platform with BYOK support, multi-model chat, and transparent token usage tracking."
	/>

	<!-- X/Twitter overrides -->
	<meta name="twitter:title" content="MicroManus — Your AI agents, your keys, your rules" />
	<meta
		name="twitter:description"
		content="An AI agent platform with BYOK support, multi-model chat, and transparent token usage tracking."
	/>

	<!-- Structured Data (JSON-LD) -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "MicroManus",
			"operatingSystem": "All",
			"applicationCategory": "DeveloperApplication",
			"offers": {
				"@type": "Offer",
				"price": "0.00",
				"priceCurrency": "USD"
			},
			"description": "MicroManus is an AI agent platform where you bring your own API keys, chat with powerful language models, and track every token with transparent billing."
		}
	</script>
</svelte:head>

<Particles class="fixed top-0 left-0 -z-10 h-screen w-screen bg-transparent!" />
<Spotlight />

<header
	class={cn(
		'sticky z-50 mx-auto flex items-center justify-between gap-8 rounded-xl px-2 backdrop-blur-sm transition-all duration-500',
		isScrolled
			? 'max-w-4xl border bg-background/60 p-2 shadow-lg sm:top-2'
			: 'top-0 max-w-full bg-background/20 px-2 py-2 sm:px-12'
	)}
>
	<AppLogo showLogo={!isScrolled} />
	<!-- Desktop Navigation -->
	<div class="hidden items-center gap-8 md:flex">
		{#each tabItems as item, idx (idx)}
			<a
				href={item.url}
				rel="external"
				title="Open Nav"
				class="nodefault relative py-1 text-muted-foreground capitalize transition-all duration-500 hover:text-primary {activeSection ===
				item.url.substring(1)
					? 'font-medium text-primary'
					: ''}"
			>
				{item.title}
				{#if activeSection === item.url.substring(1)}
					<div
						transition:fade={{ duration: 300 }}
						// layoutId="nav-underline"
						class="absolute -bottom-1 left-0 h-0.5 w-full bg-primary"
					></div>
				{/if}
			</a>
		{/each}
	</div>

	<div class="flex items-center gap-2">
		<!-- Mobile Navigation -->
		<div class="md:hidden">
			<Dropdown.Root>
				<Dropdown.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
					<Menu />
					<span class="sr-only">Links</span>
				</Dropdown.Trigger>
				<Dropdown.Content class="w-fit md:hidden">
					{#each tabItems as item, idx (idx)}
						<a
							rel="external"
							href={item.url}
							title="Open Nav"
							class="nodefault block w-full capitalize"
						>
							<Dropdown.Item>
								{item.title}
							</Dropdown.Item>
						</a>
					{/each}
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
		<AnimatedThemeToggler />
		{#if user}
			<Dropdown.Root>
				<Dropdown.Trigger>
					<UserAvatar image={user.image} name={user.name} />
				</Dropdown.Trigger>
				<Dropdown.Content class="w-fit">
					<Dropdown.Group>
						<Dropdown.Label>{user.name}</Dropdown.Label>
						<a href={resolve('/(app)/account')}>
							<Dropdown.Item>
								<User />
								Account</Dropdown.Item
							>
						</a>
						<Dropdown.Item variant="destructive" onclick={() => goto(resolve('/signout'))}>
							<Logout />
							Sign Out
						</Dropdown.Item>
					</Dropdown.Group>
				</Dropdown.Content>
			</Dropdown.Root>
		{:else}
			<Button class="nodefault" href={resolve('/signin')}>Sign In</Button>
		{/if}
	</div>
</header>
<main class="mx-auto max-w-4xl px-2 text-center sm:px-0">
	<section
		id="landing"
		class="transition-all duration-1000 *:my-8 {showFirstSection
			? 'translate-y-0 opacity-100'
			: 'translate-y-10 opacity-0'}"
	>
		<a
			class="group nodefault relative z-10 mx-auto flex w-fit items-center gap-4 rounded-2xl border bg-primary/30 p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 hover:bg-background dark:border-t-white/5 dark:hover:border-t-border"
			href="#pricing"
			title="Open Pricing"
		>
			<span class="text-sm text-foreground"
				>✨ Supporting <span class="font-bold">3 Major AI providers</span> with BYOK ✨</span
			>
			<span class="block h-4 w-0.5 border-l bg-muted-foreground dark:border-background"></span>
			<div
				class="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-primary"
			>
				<div class="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
					<span class="flex size-6">
						<ArrowRight class="m-auto size-4 text-foreground!" />
					</span>
					<span class="flex size-6">
						<ArrowRight class="m-auto size-4 text-foreground!" />
					</span>
				</div>
			</div>
		</a>
		<h1 class="text-balance">Your AI agents, your keys, your rules</h1>
		<p class="text-balance text-muted-foreground">
			MicroManus is an open AI agent platform. Bring your own API keys, chat with the best models,
			and track every token — with full transparency and zero lock-in.
		</p>
		<div class="flex items-center justify-center gap-4">
			{#if user}
				<Button class="nodefault" href={resolve('/(app)/chat/new')}>Start New Chat</Button>
			{:else}
				<Button class="nodefault" href={resolve('/signin')}>Get Started</Button>
			{/if}
			<Button class="nodefault" variant="outline" href="#features">See Features</Button>
		</div>
	</section>
	<section id="features">
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-bold">Built for the AI-First Developer</h1>
			<span class="text-lg text-muted-foreground"
				>Everything you need to interact with AI models on your terms
			</span>
		</div>
		<dl class="my-20 grid grid-cols-2 gap-10">
			{#each features as item, idx (idx)}
				{@const Icon = item.icon}
				<div class="col-span-full sm:col-span-2 lg:col-span-1">
					<div
						class="mx-auto flex w-fit rounded-lg p-2 shadow-md ring-1 shadow-primary/50 ring-black/5 dark:ring-white/5"
					>
						<Icon aria-hidden="true" class="size-6 text-muted-foreground" />
					</div>
					<dt class="mt-6 text-center font-semibold text-gray-900 dark:text-gray-50">
						{item.name}
					</dt>
					<dd class="mt-2 text-center leading-7 text-gray-600 dark:text-gray-400">
						{item.description}
					</dd>
				</div>
			{/each}
		</dl>
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-bold">Multi-Model, Multi-Provider</h1>
			<span class="text-lg text-balance text-muted-foreground"
				>Switch between AI providers and models seamlessly within a single platform
			</span>
		</div>
		<div class="relative mx-auto mt-4 w-2xl max-w-full rounded-2xl">
			<BorderBeam />
			<Multistream class="mx-auto rounded-2xl" />
		</div>
	</section>

	<section id="faqs" class="my-4">
		<div class="mx-auto px-4 md:px-6">
			<div class="mx-auto max-w-2xl text-center text-balance">
				<h1>Frequently Asked Questions</h1>
				<p class="mt-4 text-balance text-muted-foreground">
					Discover quick and comprehensive answers to common questions about our platform, services,
					and features.
				</p>
			</div>

			<div class="mx-auto mt-12 max-w-2xl">
				<Accordion
					type="single"
					class="w-full rounded-xl border bg-background px-8 py-3 shadow-sm ring-4 ring-muted dark:ring-0"
				>
					{#each faqItems as item, index (index)}
						<AccordionItem
							value={item.id}
							class={[faqItems.length - 1 !== index ? 'border-dashed' : 'border-none']}
						>
							<AccordionTrigger class="cursor-pointer text-base font-semibold hover:no-underline"
								>{item.question}</AccordionTrigger
							>
							<AccordionContent>
								<p class="text-base">{item.answer}</p>
							</AccordionContent>
						</AccordionItem>
					{/each}
				</Accordion>

				<p class="mt-6 px-4 text-muted-foreground">
					Can't find what you're looking for?
					<a
						href="mailto:contact@tsuzat.com"
						title="Contact Us"
						class="font-medium text-primary hover:underline"
					>
						Contact Us
					</a>
				</p>
			</div>
		</div>
	</section>
	<footer class="flex items-center justify-center gap-2 border-t py-4 text-sm">
		© 2026 MicroManus. All rights reserved •
		<a href={resolve('/terms')} title="Open Terms of Use" class="text-primary">Terms of Use</a>
		•
		<a href={resolve('/privacy')} title="Open Privacy Policy" class="text-primary">Privacy Policy</a
		>
		•
		<a href="mailto:contact@tsuzat.com" title="Contact Us" class="text-primary">Contact Us</a>
	</footer>
</main>

<style>
	section {
		padding-top: 5rem;
	}

	.highlight {
		background-color: var(--color-primary);
		padding: 0 4px;
		border-radius: 4px;
		color: var(--color-foreground);
	}

	:global(section.hide) {
		opacity: 0;
		filter: blur(4px);
		transform: translateY(4rem);
		transition: all 500ms ease-in-out;
		transition-delay: 300ms;
	}

	:global(section.show) {
		opacity: 1;
		filter: blur(0px);
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		:global(section.hide) {
			transition: none;
		}
	}
</style>
