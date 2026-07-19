import {
	pgTable,
	integer,
	text,
	boolean,
	timestamp,
	jsonb,
	numeric,
	pgEnum
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

// Enums
export const unlockMethodEnum = pgEnum('unlock_method', ['coupon', 'payment']);
export const apiKeyProviderEnum = pgEnum('api_key_provider', [
	'openai',
	'anthropic',
	'google',
	'openrouter',
	'groq',
	'together',
	'deepseek',
	'custom',
	'other'
]);

// 1. unlock_status (user_id FK, unlocked bool, method: 'coupon'|'payment', unlocked_at)
export const unlockStatus = pgTable('unlock_status', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	unlocked: boolean('unlocked').default(false).notNull(),
	method: unlockMethodEnum('method'),
	unlockedAt: timestamp('unlocked_at')
});

// 2. credits_ledger (id, user_id FK, delta int, reason text, created_at) — event-sourced
export const creditsLedger = pgTable('credits_ledger', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	delta: integer('delta').notNull(),
	reason: text('reason'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 3. api_keys (id, user_id FK, provider enum, label, base_url, encrypted_key, default_model, is_active, created_at)
export const apiKeys = pgTable('api_keys', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	provider: apiKeyProviderEnum('provider').notNull(),
	label: text('label'),
	baseUrl: text('base_url'),
	encryptedKey: text('encrypted_key').notNull(),
	defaultModel: text('default_model'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 4. chats (id, user_id FK, title, is_archived, created_at, updated_at)
export const chats = pgTable('chats', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull().default('New Chat'),
	isPinned: boolean('is_pinned').default(false).notNull(),
	isArchived: boolean('is_archived').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

// 5. messages (id, chat_id FK, role, content text, tool_calls jsonb, created_at)
export const messages = pgTable('messages', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	chatId: text('chat_id')
		.notNull()
		.references(() => chats.id, { onDelete: 'cascade' }),
	role: text('role').$type<'user' | 'assistant' | 'system' | 'tool'>().notNull(),
	content: text('content').notNull(),
	toolCalls: jsonb('tool_calls'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// 6. usage_events (id, message_id FK, user_id FK, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, created_at)
export const usageEvents = pgTable('usage_events', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	messageId: text('message_id').references(() => messages.id, { onDelete: 'set null' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	model: text('model').notNull(),
	inputTokens: integer('input_tokens').default(0).notNull(),
	outputTokens: integer('output_tokens').default(0).notNull(),
	cacheReadTokens: integer('cache_read_tokens').default(0),
	cacheWriteTokens: integer('cache_write_tokens').default(0),
	costUsd: numeric('cost_usd', { precision: 12, scale: 6 }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// TypeScript Interfaces & Types
export type UnlockStatus = typeof unlockStatus.$inferSelect;
export type NewUnlockStatus = typeof unlockStatus.$inferInsert;

export type CreditsLedger = typeof creditsLedger.$inferSelect;
export type NewCreditsLedger = typeof creditsLedger.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type UsageEvent = typeof usageEvents.$inferSelect;
export type NewUsageEvent = typeof usageEvents.$inferInsert;

export * from './auth.schema';
