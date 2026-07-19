<script lang="ts">
	import { resolve } from '$app/paths';
	import { AppLogo, Multistream, Particles, Spotlight, UserAvatar } from '$lib/components/custom';
	import { AnimatedThemeToggler } from '$lib/components/magic/animated-theme-toggler';
	import * as Dropdown from '$lib/components/ui/dropdown-menu';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Users from '@lucide/svelte/icons/users';
	import Rocket from '@lucide/svelte/icons/rocket';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Menu from '@lucide/svelte/icons/menu';
	import LayoutPanelTop from '@lucide/svelte/icons/layout-panel-top';
	import { onMount } from 'svelte';
	import Logout from '@lucide/svelte/icons/log-out';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { BorderBeam } from '$lib/components/magic/border-beam';

	let showFirstSection = $state(false);
	let activeSection = $state('');
	// import full_app_light from '$lib/assets/static/full_app_light.webp';
	// import full_app_dark from '$lib/assets/static/full_app_dark.webp';
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
			url: '#solutions',
			title: 'Solution'
		},
		{
			url: '#pricing',
			title: 'Pricing'
		},
		{
			url: '#faqs',
			title: 'FAQs'
		}
	];

	const features = [
		{
			name: 'Intuitive Kanban Boards',
			description:
				'Visualize your work with clean, customizable Kanban boards designed for effortless task management.',
			icon: LayoutPanelTop
		},
		{
			name: 'Seamless Team Collaboration',
			description:
				'Invite teammates, assign tasks, and track progress — all in real-time, with role-based access control.',
			icon: Users
		},
		{
			name: 'Pro Tools for Power Users',
			description:
				'Unlock recurring tasks, private boards, analytics, and more with KanFlow Pro — built for productivity.',
			icon: Rocket
		},
		{
			name: 'Secure by Design',
			description:
				'All your boards and data are encrypted and protected. You’re in control of your workflow and privacy.',
			icon: ShieldCheck
		}
	];

	const faqItems = [
		{
			id: 'item-1',
			question: 'Can I upgrade, downgrade, or cancel anytime?',
			answer:
				'Yes, you can change your plan at any time from your workspace settings. Upgrades take effect immediately, and billing changes are prorated automatically.'
		},
		{
			id: 'item-2',
			question: 'What is Realtime Collaboration?',
			answer:
				'Available on Pro and Teams, realtime collaboration allows multiple members to work on the same board simultaneously. You’ll see live task updates, and state changes instantly.'
		},
		{
			id: 'item-3',
			question: 'How does the Task Blocker Analysis work?',
			answer:
				'Our algorithm analyzes task movement patterns across your board. It automatically highlights items that have been stagnant, helping you quickly identify and resolve potential bottlenecks.'
		},
		{
			id: 'item-4',
			question: 'What is a Board Preview?',
			answer:
				'Board Previews allow you to share a read-only snapshot of your board. It is perfect for securely sharing project progress with external stakeholders or clients without granting them edit access.'
		},
		{
			id: 'item-5',
			question: 'Who can access my Board Preview?',
			answer:
				'If your board is set to Public, anyone with the secure preview link can view it. If the board is Private, only explicitly invited workspace members can access the preview.'
		},
		{
			id: 'item-6',
			question: 'Can I restrict members to specific boards?',
			answer:
				'Yes. Once you invite users to your Workspace, you have full control over their access. Members can only see and interact with the specific boards they are added to.'
		},
		{
			id: 'item-7',
			question: 'What permissions can I set for my team?',
			answer:
				'Pro plans offer standard Read and Write permissions. The Teams plan unlocks an advanced Admin role, providing comprehensive governance, audit logs, and workspace-wide control.'
		},
		{
			id: 'item-8',
			question: 'Do my collaborators need their own paid subscription?',
			answer:
				'No. Billing is tied to the Workspace, not the individual. You can invite members up to your plan’s limit, and they will enjoy the workspace’s premium features at no extra cost.'
		},
		{
			id: 'item-9',
			question: 'Is MicroManus suitable for personal use?',
			answer:
				'Absolutely! Our Free tier is specifically designed for personal workflows, offering robust task management and unlimited items without requiring a subscription.'
		},
		{
			id: 'item-10',
			question: 'What does Activity Tracking include?',
			answer:
				'Activity Tracking provides a detailed, chronological audit log of all board actions—including task creation, status changes, assignments, and comments—ensuring your team stays aligned.'
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
	<title>MicroManus | Collab and manage projects with ease</title>
	<meta
		name="description"
		content="Discover MicroManus—a dynamic, premium Kanban board that transforms the way you and your team visualize tasks, streamline workflows, and drive continuous improvement."
	/>
	<link rel="canonical" href="https://MicroManus.pro/" />

	<!-- Open Graph overrides -->
	<meta property="og:title" content="MicroManus — Collaborate and manage projects with ease" />
	<meta
		property="og:description"
		content="A dynamic, premium Kanban board that transforms the way you and your team visualize tasks and streamline workflows."
	/>
	<meta property="og:url" content="https://MicroManus.pro/" />

	<!-- X/Twitter overrides -->
	<meta name="twitter:title" content="MicroManus — Collaborate and manage projects with ease" />
	<meta
		name="twitter:description"
		content="A dynamic, premium Kanban board that transforms the way you and your team visualize tasks and streamline workflows."
	/>

	<!-- Structured Data (JSON-LD) -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "MicroManus",
			"operatingSystem": "All",
			"applicationCategory": "BusinessApplication",
			"offers": {
				"@type": "Offer",
				"price": "0.00",
				"priceCurrency": "USD"
			},
			"description": "Discover MicroManus—a dynamic Kanban board that transforms the way you and your team visualize tasks, streamline workflows, and drive continuous improvement."
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
						<Dropdown.Label class="text-xs text-muted-foreground">
							{user.email}
						</Dropdown.Label>
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
				>✨ Use code <span class="font-bold">EARLY10</span> for 10% off ✨</span
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
		<h1 class="text-balance">Collab and manage projects with ease</h1>
		<p class="text-balance text-muted-foreground">
			Discover MicroManus—a dynamic Kanban board that transforms the way you and your team
			visualizes tasks, streamlines workflows, and drives continuous improvement.
		</p>
		<div class="flex items-center justify-center gap-4">
			<Button class="nodefault">Get Started</Button>
			<Button class="nodefault" variant="outline" href="#pricing">See Pricing</Button>
		</div>

		<!-- <div
			class="relative h-full w-full rounded-xl shadow-lg inset-shadow-2xs shadow-zinc-950/15 dark:inset-shadow-white/20"
		>
			<BorderBeam size={150} borderWidth={2} duration={15} />
			<img
				src={full_app_light}
				alt="KanFlow Light"
				class="block h-full w-full rounded-xl border object-cover dark:hidden"
			/>
			<img
				src={full_app_dark}
				alt="KanFlow Dark"
				class="hidden h-full w-full rounded-xl border object-cover dark:block"
			/>
		</div> -->
	</section>
	<section id="features">
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-bold">Features That'll help your workflow</h1>
			<span class="text-lg text-muted-foreground"
				>Everything you need to create an amazing kanban workflow
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
			<h1 class="text-4xl font-bold">Multi-Stream Workflows and Projects</h1>
			<span class="text-lg text-balance text-muted-foreground"
				>Manage Project across streams with ease and collabate with full control
			</span>
		</div>
		<div class="relative mx-auto mt-4 w-2xl max-w-full rounded-2xl">
			<BorderBeam />
			<Multistream class="mx-auto rounded-2xl" />
		</div>
	</section>

	<!-- <section id="solutions">
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-bold">Solutions for your workflow</h1>
			<span class="text-lg text-balance text-muted-foreground">
				KanFlow is a versatile tool that can be used for a variety of workflows. Whether you're a
				<span class="highlight">Freelancer</span>, or a
				<span class="highlight">Business</span>
			</span>
		</div>
		<div class="my-8">
			<h3>Minimal yet feature rich by design</h3>
			<div class="my-8 grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
				<div class="relative mb-6 flex w-96 items-center justify-center sm:mb-0">
					<SampleTask />
				</div>
				<div class="space-y-8">
					KanFlow Cards are the core of your workflow — built to capture tasks, context, and
					collaboration in one place.
				</div>
			</div>
		</div>
		<div class="my-8">
			<h3>Keep your workflow organized with Tags</h3>
			<div class="my-8 grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
				<div class="relative mb-6 flex w-96 items-center justify-center sm:mb-0">
					<TiltCard class="rounded-xl" scale={1.0125} tiltLimit={2}>
						<SampleBoardTags />
					</TiltCard>
				</div>
				<div class="relative space-y-4">
					<p>
						Board Tags are a great way to keep your workflow organized. They are a great way to
						categorize your boards and make them easier to find.
					</p>
				</div>
			</div>
		</div>
	</section> -->

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
						href="mailto:contact@kanflow.pro"
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
		© 2026 KanFlow. All rights reserved •
		<a href={resolve('/terms')} title="Open Terms of Use" class="text-primary">Terms of Use</a>
		•
		<a href={resolve('/privacy')} title="Open Privacy Policy" class="text-primary">Privacy Policy</a
		>
		•
		<a href="mailto:contact@kanflow.pro" title="Contact Us" class="text-primary">Contact Us</a>
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
