import type { Chat } from '$lib/server/db/schema';
import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { toast } from 'svelte-sonner';

export class Chats {
	#chats = $state<Chat[]>([]);
	#loading = $state(false);
	#hasMore = $state(false);
	#loadingMore = $state(false);

	constructor(chats: Chat[] = [], hasMore = false) {
		this.#chats = chats;
		this.#hasMore = hasMore;
	}

	get chats() {
		return this.#chats;
	}

	set chats(newChats: Chat[]) {
		this.#chats = newChats;
	}

	get loading() {
		return this.#loading;
	}

	get hasMore() {
		return this.#hasMore;
	}

	set hasMore(val: boolean) {
		this.#hasMore = val;
	}

	get loadingMore() {
		return this.#loadingMore;
	}

	get pinnedChats() {
		return this.#chats.filter((c) => c.isPinned && !c.isArchived);
	}

	get otherChats() {
		return this.#chats.filter((c) => !c.isPinned && !c.isArchived);
	}

	/**
	 * Re-hydrates chats state and pagination flags
	 */
	init(initialChats: Chat[], hasMore = false) {
		this.#chats = initialChats;
		this.#hasMore = hasMore;
	}

	/**
	 * Fetches all chats from GET /api/chat
	 */
	async fetchChats() {
		try {
			this.#loading = true;
			const res = await fetch('/api/chat?type=all&limit=50');
			if (!res.ok) throw new Error('Failed to fetch chats');
			const data = await res.json();
			if (data.chats) {
				this.#chats = data.chats;
				this.#hasMore = Boolean(data.hasMore);
			}
		} catch (err) {
			console.error('[Chats] fetchChats error:', err);
		} finally {
			this.#loading = false;
		}
	}

	/**
	 * Loads next batch of recent non-pinned chats
	 */
	async loadMore() {
		if (this.#loadingMore || !this.#hasMore) return;

		try {
			this.#loadingMore = true;
			const currentRecentCount = this.otherChats.length;
			const res = await fetch(`/api/chat?type=recent&limit=10&offset=${currentRecentCount}`);
			if (!res.ok) throw new Error('Failed to load more chats');

			const data = await res.json();
			if (data.chats && data.chats.length > 0) {
				const existingIds = new SvelteSet(this.#chats.map((c) => c.id));
				const newUnique = data.chats.filter((c: Chat) => !existingIds.has(c.id));
				this.#chats = [...this.#chats, ...newUnique];
			}
			this.#hasMore = Boolean(data.hasMore);
		} catch (err) {
			console.error('[Chats] loadMore error:', err);
			toast.error('Failed to load more chats');
		} finally {
			this.#loadingMore = false;
		}
	}

	/**
	 * Creates a new chat via POST /api/chat
	 */
	async createChat(title?: string, isPinned = false): Promise<Chat | null> {
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title, isPinned })
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to create chat');
			}

			const data = await res.json();
			if (data.chat) {
				this.#chats = [data.chat, ...this.#chats];
				return data.chat;
			}
			return null;
		} catch (err: any) {
			console.error('[Chats] createChat error:', err);
			toast.error(err.message || 'Could not create chat');
			return null;
		}
	}

	/**
	 * Toggles pin status for a chat via PATCH /api/chat/[id]
	 */
	async togglePin(chatId: string) {
		const targetIndex = this.#chats.findIndex((c) => c.id === chatId);
		if (targetIndex === -1) return;

		const previousState = this.#chats[targetIndex].isPinned;
		const newState = !previousState;

		// Optimistic update
		this.#chats[targetIndex].isPinned = newState;

		try {
			const res = await fetch(`/api/chat/${chatId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isPinned: newState })
			});

			if (!res.ok) {
				throw new Error('Failed to update pin state');
			}
		} catch (err) {
			console.error('[Chats] togglePin error:', err);
			// Rollback on error
			this.#chats[targetIndex].isPinned = previousState;
			toast.error('Failed to update pin status');
		}
	}

	/**
	 * Deletes a chat via DELETE /api/chat/[id]
	 */
	async deleteChat(chatId: string) {
		const targetIndex = this.#chats.findIndex((c) => c.id === chatId);
		if (targetIndex === -1) return;

		const deletedChat = this.#chats[targetIndex];

		// Optimistic removal
		this.#chats = this.#chats.filter((c) => c.id !== chatId);

		try {
			const res = await fetch(`/api/chat/${chatId}`, {
				method: 'DELETE'
			});

			if (!res.ok) {
				throw new Error('Failed to delete chat');
			}
		} catch (err) {
			console.error('[Chats] deleteChat error:', err);
			// Rollback on error
			this.#chats = [
				...this.#chats.slice(0, targetIndex),
				deletedChat,
				...this.#chats.slice(targetIndex)
			];
			toast.error('Failed to delete chat');
		}
	}

	/**
	 * Updates a chat's title or state via PATCH /api/chat/[id]
	 */
	async updateChat(
		chatId: string,
		updates: { title?: string; isPinned?: boolean; isArchived?: boolean }
	) {
		const target = this.#chats.find((c) => c.id === chatId);
		if (!target) return;

		const snapshot = { ...target };

		// Optimistic update
		Object.assign(target, updates);

		try {
			const res = await fetch(`/api/chat/${chatId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});

			if (!res.ok) {
				throw new Error('Failed to update chat');
			}
		} catch (err) {
			console.error('[Chats] updateChat error:', err);
			// Rollback on error
			Object.assign(target, snapshot);
			toast.error('Failed to update chat');
		}
	}

	/**
	 * Adds a chat to local state (for manual insertion when received from server load)
	 */
	addChat(newChat: Chat) {
		if (!this.#chats.some((c) => c.id === newChat.id)) {
			this.#chats = [newChat, ...this.#chats];
		}
	}
}

const CHATS_KEY = Symbol('CHATS_KEY');

export const setChatsContext = (chats: Chat[] = [], hasMore = false) => {
	return setContext(CHATS_KEY, new Chats(chats, hasMore));
};

export const useChatsContext = () => {
	return getContext<Chats>(CHATS_KEY);
};
