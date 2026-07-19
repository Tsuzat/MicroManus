import type { Chat } from '$lib/server/db/schema';
import { getContext, setContext } from 'svelte';

export class Chats {
	#chats = $state<Chat[]>([]);

	constructor(chats: Chat[] = []) {
		this.#chats = chats;
	}

	get chats() {
		return this.#chats;
	}

	set chats(newChats: Chat[]) {
		this.#chats = newChats;
	}

	get pinnedChats() {
		return this.#chats.filter((c) => c.isPinned && !c.isArchived);
	}

	get otherChats() {
		return this.#chats.filter((c) => !c.isPinned && !c.isArchived);
	}

	togglePin(chatId: string) {
		const target = this.#chats.find((c) => c.id === chatId);
		if (target) {
			target.isPinned = !target.isPinned;
		}
	}

	deleteChat(chatId: string) {
		this.#chats = this.#chats.filter((c) => c.id !== chatId);
	}

	addChat(newChat: Chat) {
		this.#chats = [newChat, ...this.#chats];
	}
}

const CHATS_KEY = Symbol('CHATS_KEY');

export const setChatsContext = (chats: Chat[] = []) => {
	return setContext(CHATS_KEY, new Chats(chats));
};

export const useChatsContext = () => {
	return getContext<Chats>(CHATS_KEY);
};
