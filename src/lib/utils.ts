import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export const getInitials = (name: string): string => {
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return '';
	if (parts.length === 1) {
		const part = parts[0];
		return part.length === 1 ? part.toUpperCase() : part.slice(0, 2).toUpperCase();
	}
	return parts
		.map((p) => p[0])
		.join('')
		.toUpperCase();
};
