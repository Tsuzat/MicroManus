<script lang="ts">
	import { goto } from '$app/navigation';
	import { useChatsContext } from '$lib/hooks/chats.svelte';
	import { DEFAULT_MODEL_ID } from '$lib/ai/providers';
	import { WelcomeScreen, ChatInput } from '$lib/components/custom/chat';

	const chatsContext = useChatsContext();

	let selectedModelId = $state(
		(typeof window !== 'undefined' && localStorage.getItem('micromanus:selectedModel')) ||
			DEFAULT_MODEL_ID
	);

	function handleModelSelect(modelId: string) {
		selectedModelId = modelId;
		if (typeof window !== 'undefined') {
			localStorage.setItem('micromanus:selectedModel', modelId);
		}
	}

	let chatInputRef: ChatInput | undefined = $state();

	function handleSuggestionClick(text: string) {
		chatInputRef?.setText(text);
		chatInputRef?.focus();
	}

	async function handleSubmit(
		text: string,
		files?: Array<{ name: string; type: string; url: string }>
	) {
		// 1. Create a new chat
		const newChat = await chatsContext.createChat();
		if (!newChat) return;

		// Save files to global window state temporarily
		if (files && files.length > 0 && typeof window !== 'undefined') {
			(window as any).__micromanus_pending_files = files;
		}

		// 2. Navigate to the new chat page with the initial message as a search param
		const encoded = encodeURIComponent(text);
		const modelEncoded = encodeURIComponent(selectedModelId);
		await goto(`/chat/${newChat.id}?initial=${encoded}&model=${modelEncoded}`, {
			replaceState: true
		});
	}
</script>

<svelte:head>
	<title>New Chat — MicroManus</title>
	<meta name="description" content="Start a new AI conversation with MicroManus" />
</svelte:head>

<div class="flex h-full flex-col">
	<div class="flex items-center gap-2 p-4">
		<h1 class="text-sm font-medium">New Chat</h1>
	</div>

	<WelcomeScreen onSuggestionClick={handleSuggestionClick} />

	<ChatInput
		bind:this={chatInputRef}
		{selectedModelId}
		onModelSelect={handleModelSelect}
		onSubmit={handleSubmit}
		autofocus
	/>
</div>
