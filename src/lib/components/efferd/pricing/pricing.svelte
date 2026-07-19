<script lang="ts">
	import { CircleCheck, Star } from '@lucide/svelte';
	import { AnimatePresence, createLayoutMotion } from 'motion-sv';
	import FrequencyToggle, { type FREQUENCY } from './frequency-toggle.svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { BorderBeam } from '$lib/components/magic/border-beam';

	import { onMount } from 'svelte';

	let NumberFlow: typeof import('@number-flow/svelte').default | undefined = $state(undefined);

	onMount(async () => {
		const mod = await import('@number-flow/svelte');
		NumberFlow = mod.default;
	});

	interface Props {
		onClick?: (plan: 'pro-monthly' | 'pro-yearly' | 'teams-monthly' | 'teams-yearly') => void;
	}
	const { onClick }: Props = $props();

	type Plan = {
		name: string;
		info: string;
		price: {
			monthly: number;
			yearly: number;
		};
		features: string[];
		btn: {
			text: string;
			onclick?: () => void;
		};
		highlighted?: boolean;
	};

	type PlanBadge =
		| {
				id: 'popular';
				label: string;
				variant: 'neutral';
		  }
		| {
				id: 'discount';
				label: string;
				variant: 'primary';
		  };

	const plans: Plan[] = [
		{
			name: 'Free',
			info: 'For most individuals',
			price: {
				monthly: 0,
				yearly: 0
			},
			features: [
				'A Personal Free Workspace',
				'10 Boards & 40 Sections',
				'Unlimited Tasks & Todo',
				'Basic Customization',
				'Single User Focus',
				'Advanced Account Security'
			],
			btn: {
				text: 'Get Started',
				onclick: () => {}
			}
		},
		{
			highlighted: true,
			name: 'Pro',
			info: 'For Pros & small teams',
			price: {
				monthly: 5,
				yearly: 50
			},
			features: [
				'Unlimited Boards & Sections',
				'Unlimited Tasks & Todo',
				'Up to 5 Workspace Members',
				'1 Team in Workspace',
				'1 GB File Storage',
				'Public & Private Board Preview',
				'Realtime Collaboration',
				'Task Blockers Analysis',
				'Task Assignees & Comments',
				'Advanced Notifications'
			],
			btn: {
				text: 'Get started',
				onclick: async () => {
					onClick?.(`pro-${frequency}`);
				}
			}
		},
		{
			name: 'Teams',
			info: 'For growing teams and startups',
			price: {
				monthly: 50,
				yearly: 500
			},
			features: [
				'Everything in Pro',
				'Unlimited Members & Teams',
				'5 GB File Storage',
				'Advanced Permissions',
				'Enterprise Security Logs',
				'Dedicated Account Manager'
			],
			btn: {
				text: 'Get Started',
				onclick: async () => {
					onClick?.(`teams-${frequency}`);
				}
			}
		}
	];

	const layout = createLayoutMotion();

	let frequency = $state<FREQUENCY>('monthly');

	const setFrequency = layout.update.with((nextFrequency: FREQUENCY) => {
		frequency = nextFrequency;
	});

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			notation: 'compact'
		}).format(value);
	}

	function getDiscount(plan: Plan) {
		if (plan.price.monthly == 0 || plan.price.yearly == 0) {
			return 0;
		}
		const defaultYearly = plan.price.monthly * 12;
		return Math.round(((defaultYearly - plan.price.yearly) / defaultYearly) * 100);
	}

	function getBadges(plan: Plan, activeFrequency: FREQUENCY): PlanBadge[] {
		const badges: PlanBadge[] = [];

		if (plan.highlighted) {
			badges.push({
				id: 'popular',
				label: 'Popular',
				variant: 'neutral'
			});
		}

		if (activeFrequency === 'yearly') {
			const discount = getDiscount(plan);

			if (discount >= 0) {
				badges.push({
					id: 'discount',
					label: `${discount}% off`,
					variant: 'primary'
				});
			}
		}

		return badges;
	}
</script>

<section class="flex w-full flex-col items-center justify-center space-y-7 p-4">
	<div class="mx-auto max-w-xl space-y-2">
		<h1>
			Plans that <span
				class="animate-pulse bg-linear-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-size-[var(--bg-size)_100%] bg-clip-text text-transparent"
				>Scale</span
			> with You
		</h1>

		<p class="text-center text-sm text-muted-foreground md:text-base">
			Start for Free, Upgrade Anytime
		</p>
	</div>

	<FrequencyToggle {frequency} {setFrequency} />

	<div class="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
		{#each plans as plan (plan.name)}
			<div class={cn('relative flex w-full flex-col overflow-hidden rounded-lg border shadow-xs')}>
				{#if plan.highlighted}
					<BorderBeam />
				{/if}
				<div class={cn('border-b px-4 py-2', plan.highlighted && 'bg-card dark:bg-card/80')}>
					<layout.div
						class="absolute top-2 right-2 z-10 flex items-center gap-2"
						layout
						layoutDependency={frequency}
					>
						<AnimatePresence initial={false}>
							{@const badges = getBadges(plan, frequency)}
							{#each badges as badge (badge.id)}
								<layout.div
									animate={{ opacity: 1, scale: 1, y: 0 }}
									class={cn(
										'z-10 flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs',
										badge.variant === 'primary'
											? 'bg-primary text-primary-foreground'
											: 'bg-background'
									)}
									exit={{ opacity: 0, scale: 0.95, y: -4 }}
									initial={{ opacity: 0, scale: 0.95, y: -4 }}
									layout
									transition={{ duration: badge.id === 'popular' ? 0.1 : 0.15 }}
								>
									{#if badge.id === 'popular'}
										<Star class="size-3 fill-current" />
									{/if}
									{badge.label}
								</layout.div>
							{/each}
						</AnimatePresence>
					</layout.div>

					<div class="text-lg font-medium">{plan.name}</div>
					<p class="text-sm font-normal text-muted-foreground">{plan.info}</p>

					<h3 class="my-1 flex w-max items-end gap-1">
						{#if NumberFlow}
							<NumberFlow
								class="text-3xl font-extrabold [&::part(suffix)]:text-base [&::part(suffix)]:font-normal [&::part(suffix)]:text-muted-foreground"
								format={{
									style: 'currency',
									currency: 'USD',
									notation: 'compact'
								}}
								suffix={frequency === 'yearly' ? '/year' : '/month'}
								value={plan.price[frequency]}
							/>
						{:else}
							<span class="text-3xl font-extrabold">
								{formatPrice(plan.price[frequency])}
								<span class="text-base font-normal text-muted-foreground">
									{frequency === 'yearly' ? '/year' : '/month'}
								</span>
							</span>
						{/if}
					</h3>

					<p class="text-xs font-normal text-muted-foreground">billed {frequency}</p>
				</div>

				<div
					class={cn(
						'space-y-3 px-4 py-2 text-sm text-muted-foreground',
						plan.highlighted && 'bg-muted/10'
					)}
				>
					{#each plan.features as feature, idx (idx)}
						<div class="flex items-center gap-2">
							<CircleCheck class="size-3.5 text-foreground" />
							<p>{feature}</p>
						</div>
					{/each}
				</div>

				<div class={cn('mt-auto w-full p-3')}>
					<Button
						class="nodefault w-full"
						onclick={plan.btn.onclick}
						variant={plan.highlighted ? 'default' : 'outline'}
					>
						{plan.btn.text}
					</Button>
				</div>
			</div>
		{/each}
	</div>
</section>
