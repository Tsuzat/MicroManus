<script lang="ts">
	const { ...rest }: { [key: string]: unknown } = $props();
</script>

<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...rest}>
	<path
		d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.5L7.3 11l1.4-1 2.1 3.5L15.3 8l1.4 1-5.9 7.5z"
	/>
</svg>
