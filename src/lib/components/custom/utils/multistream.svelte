<script lang="ts">
	import { AnimatedBeam, Circle } from '$lib/components/magic/animated-beam';
	import User from '@lucide/svelte/icons/user';
	import { cn } from '$lib/utils';
	import { AppLogo } from '$lib/components/custom';
	const { class: className }: { class: string } = $props();

	let containerRef: HTMLDivElement | null = $state(null);
	let div1Ref: HTMLDivElement | null = $state(null);
	let div2Ref: HTMLDivElement | null = $state(null);
	let div3Ref: HTMLDivElement | null = $state(null);
	let div4Ref: HTMLDivElement | null = $state(null);
	let div5Ref: HTMLDivElement | null = $state(null);
	let div6Ref: HTMLDivElement | null = $state(null);
</script>

<div
	class={cn(
		'relative flex h-96 w-full items-center justify-center overflow-hidden border p-10',
		className
	)}
	bind:this={containerRef}
>
	<div class="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
		<div class="flex flex-col justify-center gap-2">
			<Circle bind:ref={div1Ref} content="Claude">
				<img src="https://svgl.app/library/claude-ai-icon.svg" alt="claude" />
			</Circle>
			<Circle bind:ref={div2Ref} content="Kimi">
				<img src="https://svgl.app/library/kimi-icon.svg" alt="kimi" />
			</Circle>
			<Circle bind:ref={div3Ref} content="OpenAI">
				<img src="https://svgl.app/library/openai_dark.svg" alt="openai" />
			</Circle>
			<Circle bind:ref={div4Ref} content="Gemini">
				<img src="https://svgl.app/library/gemini.svg" alt="gemini" />
			</Circle>
		</div>
		<div class="flex flex-col justify-center">
			<Circle bind:ref={div5Ref} content="MicroManus">
				<AppLogo showLogo={false} />
			</Circle>
		</div>
		<div class="flex flex-col justify-center">
			<Circle bind:ref={div6Ref} content="You">
				<User />
			</Circle>
		</div>
	</div>

	<AnimatedBeam {containerRef} fromRef={div1Ref} toRef={div5Ref} />
	<AnimatedBeam {containerRef} fromRef={div2Ref} toRef={div5Ref} />
	<AnimatedBeam {containerRef} fromRef={div3Ref} toRef={div5Ref} />
	<AnimatedBeam {containerRef} fromRef={div4Ref} toRef={div5Ref} />
	<AnimatedBeam {containerRef} fromRef={div5Ref} toRef={div6Ref} />
</div>
