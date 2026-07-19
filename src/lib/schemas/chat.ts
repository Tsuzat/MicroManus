import { z } from 'zod';

export const createChatSchema = z.object({
	title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional().default('New Chat'),
	isPinned: z.boolean().optional().default(false)
});

export const updateChatSchema = z.object({
	title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
	isPinned: z.boolean().optional(),
	isArchived: z.boolean().optional()
});

export const chatIdParamSchema = z.object({
	id: z.string().min(1, 'Chat ID is required')
});

export type CreateChatInput = z.infer<typeof createChatSchema>;
export type UpdateChatInput = z.infer<typeof updateChatSchema>;
