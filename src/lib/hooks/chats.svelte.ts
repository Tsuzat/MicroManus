import type { Chat } from '$lib/server/db/schema';
import { getContext, setContext } from 'svelte';

class Chats {
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
}

const CHATS_KEY = Symbol('CHATS_KEY');

export const setChatsContext = (chats: Chat[] = []) => {
	return setContext(CHATS_KEY, new Chats(chats));
};

export const useChatsContext = () => {
	return getContext<ReturnType<typeof setChatsContext>>(CHATS_KEY);
};
