<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, type UIMessage } from 'ai';
	import { DEFAULT_MODEL_ID } from '$lib/ai/providers';
	import { ChatInput, MessageBubble } from '$lib/components/custom/chat';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import { Button } from '$lib/components/ui/button';

	const { data } = $props();

	let selectedModelId = $state(
		(typeof window !== 'undefined' && localStorage.getItem('micromanus:selectedModel')) ||
			DEFAULT_MODEL_ID
	);

	let messagesContainer: HTMLDivElement | undefined = $state();
	let showScrollButton = $state(false);
	let hasInitialMessageBeenSent = $state(false);

	// Initialize Chat instance from AI SDK
	const chat = new Chat({
		transport: new DefaultChatTransport({
			api: '/api/ai/chat',
			body: () => ({
				model: selectedModelId,
				chatId: data.chat?.id ?? ''
			})
		}),
		messages: [],
		onError: (error) => {
			if (error.message.includes('API Key') || error.message.includes('Settings')) {
				toast.error(error.message, {
					action: {
						label: 'Add Key',
						onClick: () => goto(resolve('/(app)/settings'))
					}
				});
			} else {
				toast.error(error.message || 'An error occurred while streaming.');
			}
		}
	});

	$effect(() => {
		chat.messages = convertDbMessagesToUIMessages(data.messages ?? []);
	});

	/**
	 * Convert DB messages (role + content) to AI SDK UIMessage format.
	 */
	function convertDbMessagesToUIMessages(
		dbMessages: Array<{ id: string; role: string; content: string; createdAt: Date }>
	): UIMessage[] {
		return dbMessages.map((msg) => ({
			id: msg.id,
			role: msg.role as 'user' | 'assistant',
			parts: [{ type: 'text' as const, text: msg.content }],
			createdAt: new Date(msg.createdAt)
		}));
	}

	function handleModelSelect(modelId: string) {
		selectedModelId = modelId;
		if (typeof window !== 'undefined') {
			localStorage.setItem('micromanus:selectedModel', modelId);
		}
	}

	function handleSubmit(text: string) {
		chat.sendMessage({ text });
		scrollToBottom();
	}

	function handleStop() {
		chat.stop();
	}

	function scrollToBottom() {
		requestAnimationFrame(() => {
			if (messagesContainer) {
				messagesContainer.scrollTo({
					top: messagesContainer.scrollHeight,
					behavior: 'smooth'
				});
			}
		});
	}

	function handleScroll() {
		if (!messagesContainer) return;
		const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
		showScrollButton = scrollHeight - scrollTop - clientHeight > 100;
	}

	// Auto-scroll when new messages arrive or stream content updates
	$effect(() => {
		// Auto-scroll if the user is already near the bottom (within 150px) or if streaming is active
		if (messagesContainer) {
			const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
			if (isNearBottom || chat.status === 'streaming') {
				scrollToBottom();
			}
		}
	});

	// Handle initial message from /chat/new redirect
	onMount(async () => {
		const url = new URL(window.location.href);
		const initialMessage = url.searchParams.get('initial');
		const initialModel = url.searchParams.get('model');

		if (initialMessage && !hasInitialMessageBeenSent) {
			hasInitialMessageBeenSent = true;

			if (initialModel) {
				selectedModelId = initialModel;
				localStorage.setItem('micromanus:selectedModel', initialModel);
			}

			// Clean URL params
			const cleanUrl = url.pathname;
			window.history.replaceState({}, '', cleanUrl);

			// Send the initial message
			await tick();
			chat.sendMessage({ text: decodeURIComponent(initialMessage) });
		}
	});

	// Derive display title
	const chatTitle = $derived(data.chat?.title || 'Chat');
</script>

<svelte:head>
	<title>{chatTitle} — MicroManus</title>
	<meta name="description" content="AI conversation on MicroManus" />
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="flex items-center gap-2 p-4">
		<h1 class="truncate text-sm font-medium">{chatTitle}</h1>
	</div>

	<!-- Messages area container -->
	<div class="relative min-h-0 flex-1">
		<div
			bind:this={messagesContainer}
			onscroll={handleScroll}
			class="h-full w-full overflow-y-auto"
		>
			<div class="mx-auto max-w-4xl px-4 pb-20">
				{#if chat.messages.length === 0}
					<div
						class="flex h-full items-center justify-center py-20 text-center text-muted-foreground"
					>
						<p class="text-sm">Send a message to start the conversation.</p>
					</div>
				{:else}
					{#each chat.messages as message (message.id)}
						{@const textParts = message.parts?.filter((p) => p.type === 'text') ?? []}
						{@const content = textParts.map((p) => p.text).join('\n')}
						<MessageBubble
							role={message.role as 'user' | 'assistant'}
							{content}
							modelId={message.role === 'assistant' ? selectedModelId : undefined}
							messageId={message.id}
							onRewrite={(id) => chat.regenerate({ messageId: id })}
						/>
					{/each}

					{#if chat.status === 'streaming' || chat.status === 'submitted'}
						<div class="flex items-center gap-2 py-4">
							<div class="flex gap-1">
								<span class="size-2 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]"
								></span>
								<span
									class="size-2 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]"
								></span>
								<span
									class="size-2 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]"
								></span>
							</div>
							<span class="text-xs text-muted-foreground">Thinking...</span>
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Floating Scroll to bottom button -->
		{#if showScrollButton}
			<Button onclick={scrollToBottom} class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
				<ArrowDownIcon class="size-3" />
				<span>Scroll to bottom</span>
			</Button>
		{/if}
	</div>

	<!-- Input -->
	<ChatInput
		{selectedModelId}
		onModelSelect={handleModelSelect}
		onSubmit={handleSubmit}
		isStreaming={chat.status === 'streaming' || chat.status === 'submitted'}
		onStop={handleStop}
	/>
</div>
