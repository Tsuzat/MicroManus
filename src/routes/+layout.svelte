<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster richColors closeButton class="z-100" />

<Tooltip.Provider delayDuration={0}>
	{@render children()}
</Tooltip.Provider>
