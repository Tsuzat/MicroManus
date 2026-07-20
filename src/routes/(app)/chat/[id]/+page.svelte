<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, type UIMessage } from 'ai';
	import { DEFAULT_MODEL_ID } from '$lib/ai/providers';
	import { ChatInput, MessageBubble, ChatExportButton } from '$lib/components/custom/chat';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import { Button } from '$lib/components/ui/button';
	import { Shimmer } from '$lib/components/ai-elements/shimmer/index.js';
	import Search from '$lib/components/custom/dialogs/search.svelte';

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
		dbMessages: Array<{
			id: string;
			role: string;
			content: string;
			createdAt: Date;
			reasoning?: string | null;
			sources?: any;
			modelId?: string | null;
			usage?: any;
		}>
	): UIMessage[] {
		return dbMessages.map((msg) => {
			let text = msg.content;
			let fileParts: any[] = [];
			let toolInvocations: any[] | undefined = undefined;

			if (msg.content.startsWith('{') && msg.content.endsWith('}')) {
				try {
					const parsed = JSON.parse(msg.content);
					if (
						parsed &&
						typeof parsed === 'object' &&
						('text' in parsed || 'files' in parsed || 'toolInvocations' in parsed)
					) {
						text = parsed.text || '';
						if (parsed.files && Array.isArray(parsed.files)) {
							fileParts = parsed.files.map((f: any) => ({
								type: 'file',
								mediaType: f.mediaType,
								url: f.url,
								filename: f.filename
							}));
						}
						if (parsed.toolInvocations && Array.isArray(parsed.toolInvocations)) {
							toolInvocations = parsed.toolInvocations;
						}
					}
				} catch {
					// Fallback to text
				}
			}

			return {
				id: msg.id,
				role: msg.role as 'user' | 'assistant',
				parts: [{ type: 'text' as const, text }, ...fileParts],
				createdAt: new Date(msg.createdAt),
				reasoning: msg.reasoning || undefined,
				annotations: msg.sources ? [{ type: 'sources', data: msg.sources }] : undefined,
				toolInvocations,
				usage: msg.usage
			} as UIMessage & { usage?: any };
		});
	}

	function handleModelSelect(modelId: string) {
		selectedModelId = modelId;
		if (typeof window !== 'undefined') {
			localStorage.setItem('micromanus:selectedModel', modelId);
		}
	}

	function handleSubmit(
		text: string,
		attachedFiles?: Array<{ name: string; type: string; url: string }>
	) {
		if (attachedFiles && attachedFiles.length > 0) {
			const files = attachedFiles.map((f) => ({
				type: 'file' as const,
				mediaType: f.type,
				url: f.url,
				filename: f.name
			}));
			chat.sendMessage({ text, files });
		} else {
			chat.sendMessage({ text });
		}
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
		const hasKeys = Object.values(data.keysConfigured || {}).some(Boolean);
		if (!hasKeys) {
			toast.warning('No API keys configured', {
				description: 'Your request will fail. Please set your API keys.',
				action: {
					label: 'Settings',
					onClick: () => goto(resolve('/(app)/settings'))
				},
				duration: 8000
			});
		}

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
			const text = decodeURIComponent(initialMessage);
			const pendingFiles = (window as any).__micromanus_pending_files;
			if (pendingFiles) {
				delete (window as any).__micromanus_pending_files;
				handleSubmit(text, pendingFiles);
			} else {
				handleSubmit(text);
			}
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
	<div class="flex items-center justify-between p-4 pb-2">
		<h1 class="truncate text-sm font-medium">{chatTitle}</h1>
		<ChatExportButton chatId={data.chat.id} {chatTitle} />
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
					{#each chat.messages as message, i (message.id)}
						{@const textParts = message.parts?.filter((p) => p.type === 'text') ?? []}
						{@const content =
							textParts.length > 0 ? textParts.map((p: any) => p.text).join('\n') : message.content}
						{@const attachments =
							message.parts
								?.filter((p) => p.type === 'file')
								.map((p: any) => ({
									type: p.type,
									mediaType: p.mediaType,
									url: p.url,
									filename: p.filename
								})) ?? []}
						{@const reasoningParts = message.parts?.filter((p) => p.type === 'reasoning') ?? []}
						{@const reasoning =
							reasoningParts.length > 0
								? reasoningParts
										.map((p: any) => {
											if (p.reasoning || p.text) return p.reasoning || p.text;
											if (p.providerMetadata?.openai?.reasoningEncryptedContent) {
												return '_(Reasoning content is encrypted and hidden by the provider)_';
											}
											return '';
										})
										.filter(Boolean)
										.join('\n')
								: message.reasoning}
						{@const toolInvocationParts =
							message.parts
								?.filter((p) => p.type === 'tool-invocation' || p.type.startsWith('tool-'))
								.map((p: any) => {
									if (p.type === 'tool-invocation') return p.toolInvocation;
									if (p.type.startsWith('tool-')) {
										return {
											state: 'result',
											toolCallId: p.toolCallId,
											toolName: p.toolName,
											args: p.input || p.args,
											result: p.output || p.result
										};
									}
									return undefined;
								})
								.filter(Boolean) ?? []}
						{@const toolInvocations =
							toolInvocationParts.length > 0
								? toolInvocationParts
								: (message.toolInvocations ?? [])}

						{@const sourcesAnnotation = message.annotations?.find(
							(a) => (a as any).type === 'sources'
						)}
						{@const sources = sourcesAnnotation ? (sourcesAnnotation as any).data : []}

						<div id={`message-${message.id}`} class="scroll-mt-4 transition-colors duration-500">
							<MessageBubble
								role={message.role as 'user' | 'assistant'}
								{content}
								{attachments}
								{reasoning}
								{toolInvocations}
								{sources}
								usage={message.usage}
								modelId={message.role === 'assistant' ? selectedModelId : undefined}
								messageId={message.id}
								isStreaming={chat.status === 'streaming' &&
									message.id === chat.messages[chat.messages.length - 1].id}
								onRewrite={(id) => chat.regenerate({ messageId: id })}
							/>
						</div>
					{/each}

					{#if chat.status === 'streaming' || chat.status === 'submitted'}
						<div class="flex items-center gap-2 py-4">
							<Shimmer class="text-sm" content_length={11}>Thinking...</Shimmer>
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
		userHistory={chat.messages
			.filter((m) => m.role === 'user')
			.map((m) => {
				const textParts = m.parts?.filter((p) => p.type === 'text') ?? [];
				return textParts.length > 0 ? textParts.map((p: any) => p.text).join('\n') : m.content;
			})
			.filter(Boolean)}
	/>
</div>

<Search messages={chat.messages} />
