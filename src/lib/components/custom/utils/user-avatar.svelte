<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { getInitials } from '$lib/utils';

	interface Props {
		image?: string | null;
		name: string;
		class?: string;
	}
	const { image, name, class: className }: Props = $props();
</script>

<Avatar class={className}>
	<AvatarImage src={image} alt={name} />
	<AvatarFallback>{getInitials(name)}</AvatarFallback>
</Avatar>
