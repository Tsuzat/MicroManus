<script lang="ts">
	import { AppLogo } from '$lib/components/custom';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import CodeIcon from '@lucide/svelte/icons/code';
	import PenIcon from '@lucide/svelte/icons/pen-line';
	import LightbulbIcon from '@lucide/svelte/icons/lightbulb';

	interface Props {
		onSuggestionClick: (text: string) => void;
	}

	let { onSuggestionClick }: Props = $props();

	const suggestions = [
		{
			icon: PenIcon,
			title: 'Help me write',
			description: 'a professional email to my team',
			prompt: 'Help me write a professional email to my team about an upcoming project deadline'
		},
		{
			icon: CodeIcon,
			title: 'Explain how',
			description: 'async/await works in JavaScript',
			prompt: 'Explain how async/await works in JavaScript with clear examples'
		},
		{
			icon: LightbulbIcon,
			title: 'Give me ideas',
			description: 'for a weekend side project',
			prompt: 'Give me creative ideas for a weekend side project that I can build to learn something new'
		},
		{
			icon: SparklesIcon,
			title: 'Summarize',
			description: 'the key concepts of machine learning',
			prompt: 'Summarize the key concepts of machine learning in simple terms'
		}
	];
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-8 px-4">
	<!-- Logo & Greeting -->
	<div class="flex flex-col items-center gap-4">
		<div class="flex items-center justify-center rounded-2xl border bg-background p-3 shadow-sm">
			<AppLogo showLogo={false} size={3} />
		</div>
		<div class="text-center">
			<h2 class="mt-0 pb-0 text-2xl font-semibold tracking-tight">
				What can I help you with?
			</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Choose a suggestion below or type your own message
			</p>
		</div>
	</div>

	<!-- Suggestion Cards -->
	<div class="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
		{#each suggestions as suggestion (suggestion.title)}
			<button
				onclick={() => onSuggestionClick(suggestion.prompt)}
				class="group flex flex-col gap-1.5 rounded-xl border bg-background p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
			>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-primary/10 p-1.5">
						<suggestion.icon class="size-4 text-primary" />
					</div>
					<span class="text-sm font-medium">{suggestion.title}</span>
				</div>
				<span class="text-xs text-muted-foreground">
					{suggestion.description}
				</span>
			</button>
		{/each}
	</div>
</div>
