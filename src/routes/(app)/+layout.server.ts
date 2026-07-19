import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isUserUnlocked } from '$lib/server/unlock';
import type { Chat } from '$lib/server/db/schema';

export const load: LayoutServerLoad = async ({ locals: { user, session } }) => {
	if (!user) {
		return redirect(302, '/signin');
	}

	const unlocked = await isUserUnlocked(user.id);
	if (!unlocked) {
		return redirect(302, '/paywall');
	}

	// 5 dummy chats for UI testing
	const dummyChats: Chat[] = [
		{
			id: '1',
			userId: user.id,
			title: 'AI Agent Architecture Plan',
			isPinned: true,
			isArchived: false,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: '2',
			userId: user.id,
			title: 'Next.js 15 Migration & Best Practices',
			isPinned: true,
			isArchived: false,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: '3',
			userId: user.id,
			title: 'Tailwind v4 Setup Guidance',
			isPinned: false,
			isArchived: false,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: '4',
			userId: user.id,
			title: 'Drizzle ORM Schema Optimization',
			isPinned: false,
			isArchived: false,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: '5',
			userId: user.id,
			title: 'Polar Payment Integration Notes',
			isPinned: false,
			isArchived: false,
			createdAt: new Date(),
			updatedAt: new Date()
		}
	];

	return { user, session, chats: dummyChats };
};
