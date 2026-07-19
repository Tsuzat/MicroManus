import { redis } from 'bun';

export const CacheKeys = {
	userUnlock: (userId: string) => `unlock:${userId}`
} as const;

export const CACHE_TTL = {
	USER_UNLOCK: 86400 // 24 hours
} as const;

export const cache = {
	async get<T = string>(key: string): Promise<T | null> {
		try {
			const value = await redis.get(key);
			if (value === null || value === undefined) return null;
			try {
				return JSON.parse(value) as T;
			} catch {
				return value as T;
			}
		} catch (err) {
			console.error(`[Cache GET Error] key: ${key}`, err);
			return null;
		}
	},

	async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		try {
			const serialized = typeof value === 'string' ? value : JSON.stringify(value);
			if (ttlSeconds) {
				await redis.set(key, serialized, 'EX', ttlSeconds);
			} else {
				await redis.set(key, serialized);
			}
		} catch (err) {
			console.error(`[Cache SET Error] key: ${key}`, err);
		}
	},

	async del(key: string): Promise<void> {
		try {
			await redis.del(key);
		} catch (err) {
			console.error(`[Cache DEL Error] key: ${key}`, err);
		}
	},

	// Specific helpers
	async getUserUnlock(userId: string): Promise<boolean | null> {
		const val = await this.get<string>(CacheKeys.userUnlock(userId));
		if (val === 'true') return true;
		if (val === 'false') return false;
		return null;
	},

	async setUserUnlock(userId: string, unlocked: boolean): Promise<void> {
		await this.set(
			CacheKeys.userUnlock(userId),
			unlocked ? 'true' : 'false',
			CACHE_TTL.USER_UNLOCK
		);
	},

	async invalidateUserUnlock(userId: string): Promise<void> {
		await this.del(CacheKeys.userUnlock(userId));
	}
};
