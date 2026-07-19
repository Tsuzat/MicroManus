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
</script>

{#if sources && sources.length > 0}
	<div class="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
		<span class="mr-1 text-xs font-medium text-muted-foreground">Sources</span>
		<Tooltip.Provider>
			{#each sources as source, index (index)}
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
					<Tooltip.Content side="top" align="center" class="max-w-xs space-y-1">
						<p class="text-sm leading-tight font-medium">{source.title}</p>
						<p class="line-clamp-3 text-xs text-muted-foreground">{source.snippet}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</Tooltip.Provider>
	</div>
{/if}
