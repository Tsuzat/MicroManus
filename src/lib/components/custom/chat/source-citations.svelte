<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';

	interface Source {
		title: string;
		url: string;
		snippet: string;
	}

	interface Props {
		sources: Source[];
	}

	let { sources }: Props = $props();

	function getHostname(url: string) {
		try {
			return new URL(url).hostname;
		} catch {
			return url;
		}
	}

	let showAll = $state(false);
	let visibleSources = $derived(showAll ? sources : sources.slice(0, 5));
</script>

{#if sources && sources.length > 0}
	<div class="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
		<span class="mr-1 text-xs font-medium text-muted-foreground">Sources</span>
		<Tooltip.Provider delayDuration={150}>
			{#each visibleSources as source, index (index)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<a
								href={source.url}
								target="_blank"
								rel="noopener noreferrer external"
								class="flex items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-xs transition-colors hover:bg-muted/60"
								{...props}
							>
								<span class="text-[10px] font-semibold text-muted-foreground">
									[{index + 1}]
								</span>
								<img
									src={`https://www.google.com/s2/favicons?domain=${getHostname(source.url)}`}
									alt={getHostname(source.url)}
									class="size-3 rounded-sm"
								/>
								<span class="max-w-[120px] truncate">{getHostname(source.url)}</span>
							</a>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content
						side="top"
						align="center"
						class="flex max-w-[320px] flex-col items-start gap-1.5 p-3"
					>
						<p class="text-sm leading-tight font-semibold">{source.title}</p>
						<p class="line-clamp-4 text-xs leading-relaxed">
							{source.snippet}
						</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</Tooltip.Provider>

		{#if sources.length > 5 && !showAll}
			<button
				class="rounded-full bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
				onclick={() => (showAll = true)}
			>
				+ {sources.length - 5} more...
			</button>
		{/if}
		{#if showAll}
			<button
				class="rounded-full bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
				onclick={() => (showAll = false)}
			>
				Hide
			</button>
		{/if}
	</div>
{/if}
