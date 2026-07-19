<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import CoinsIcon from '@lucide/svelte/icons/coins';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import CpuIcon from '@lucide/svelte/icons/cpu';
	import { resolve } from '$app/paths';

	const { data } = $props();

	// Calculate total tokens
	const totalTokens = $derived(data.stats.totalInputTokens + data.stats.totalOutputTokens);

	// Prepare chart data (simple representation of model usage)
	const maxModelCost = $derived(Math.max(...data.modelUsage.map((m) => m.costUsd), 0.0001));
</script>

<svelte:head>
	<title>Usage Dashboard — MicroManus</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="flex items-center gap-2 border-b px-6 py-4">
		<Sidebar.Trigger class="size-8 md:hidden" />
		<div class="flex items-center gap-2">
			<ActivityIcon class="size-5 text-muted-foreground" />
			<h1 class="text-lg font-medium tracking-tight">Usage Dashboard</h1>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto p-6">
		<div class="mx-auto max-w-5xl space-y-8">
			<!-- Stats Grid -->
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between pb-2">
						<Card.Title class="text-sm font-medium">Total Cost</Card.Title>
						<CoinsIcon class="size-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">${data.stats.totalCost.toFixed(4)}</div>
						<p class="text-xs text-muted-foreground">All time AI generation cost</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between pb-2">
						<Card.Title class="text-sm font-medium">Tokens Used</Card.Title>
						<CpuIcon class="size-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{new Intl.NumberFormat().format(totalTokens)}</div>
						<p class="text-xs text-muted-foreground">
							{new Intl.NumberFormat().format(data.stats.totalInputTokens)} input / {new Intl.NumberFormat().format(
								data.stats.totalOutputTokens
							)} output
						</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between pb-2">
						<Card.Title class="text-sm font-medium">Total Chats</Card.Title>
						<MessageSquareIcon class="size-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{data.stats.totalChats}</div>
						<p class="text-xs text-muted-foreground">Active conversations</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between pb-2">
						<Card.Title class="text-sm font-medium">Model Distribution</Card.Title>
						<ActivityIcon class="size-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{data.modelUsage.length}</div>
						<p class="text-xs text-muted-foreground">Unique AI models used</p>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="grid gap-4 md:grid-cols-7">
				<!-- Model Breakdown Chart (CSS-based since shadcn-svelte chart might not be generated yet) -->
				<Card.Root class="md:col-span-3">
					<Card.Header>
						<Card.Title>Model Cost Breakdown</Card.Title>
						<Card.Description>Spend distribution across different AI models</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							{#if data.modelUsage.length === 0}
								<div
									class="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground"
								>
									No usage data yet
								</div>
							{:else}
								{#each data.modelUsage as model, idx (idx)}
									<div class="space-y-1.5">
										<div class="flex items-center justify-between text-sm">
											<span class="truncate pr-4 font-medium">{model.name}</span>
											<span class="font-mono text-muted-foreground"
												>${model.costUsd.toFixed(4)}</span
											>
										</div>
										<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
											<div
												class="h-full bg-primary transition-all duration-500 ease-in-out"
												style={`width: ${(model.costUsd / maxModelCost) * 100}%`}
											></div>
										</div>
										<div class="text-[10px] text-muted-foreground">
											{new Intl.NumberFormat().format(model.tokens)} tokens
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Recent Chats Table -->
				<Card.Root class="flex flex-col md:col-span-4">
					<Card.Header>
						<Card.Title>Chat Usage</Card.Title>
						<Card.Description>Detailed breakdown per conversation</Card.Description>
					</Card.Header>
					<Card.Content class="min-h-0 flex-1 px-0 pb-0">
						<div class="relative w-full overflow-auto">
							<table class="w-full caption-bottom text-sm">
								<thead class="[&_tr]:border-b">
									<tr
										class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									>
										<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
											>Chat Title</th
										>
										<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
											>Models</th
										>
										<th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground"
											>Tokens</th
										>
										<th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground"
											>Cost</th
										>
									</tr>
								</thead>
								<tbody class="[&_tr:last-child]:border-0">
									{#if data.chatUsage.length === 0}
										<tr>
											<td colspan="4" class="p-4 text-center text-muted-foreground"
												>No usage logged yet.</td
											>
										</tr>
									{:else}
										{#each data.chatUsage as chat, idx (idx)}
											<tr
												class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
											>
												<td class="p-4 align-middle font-medium">
													<a
														href={resolve('/(app)/chat/[id]', { id: chat.id })}
														class="hover:underline">{chat.title || 'Untitled Chat'}</a
													>
												</td>
												<td class="p-4 align-middle">
													<div class="flex flex-wrap gap-1">
														{#each chat.models as m, idx (idx)}
															<span
																class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
																>{m}</span
															>
														{/each}
													</div>
												</td>
												<td class="p-4 text-right align-middle font-mono text-xs">
													{new Intl.NumberFormat().format(chat.inputTokens + chat.outputTokens)}
												</td>
												<td
													class="p-4 text-right align-middle font-mono text-xs text-muted-foreground"
												>
													${chat.costUsd.toFixed(4)}
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
		</div>
	</div>
</div>
