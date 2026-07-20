import crypto from 'crypto';
import { env } from '$env/dynamic/private';

// AES-256-GCM algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
	// Fall back to BETTER_AUTH_SECRET or a derived safe secret if API_KEY_ENCRYPTION_SECRET is not set
	const secret = env.API_KEY_ENCRYPTION_SECRET;

	// Derive a stable 32-byte key from the secret
	return crypto.pbkdf2Sync(secret, 'micromanus-crypto-salt', 100000, 32, 'sha256');
}

/**
 * Encrypts a plain-text string using AES-256-GCM.
 * Returns a string formatted as "iv:authTag:encryptedText" in hex.
 */
export function encrypt(text: string): string {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const tag = cipher.getAuthTag();

	return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a formatted cipher-text string using AES-256-GCM.
 */
export function decrypt(encryptedText: string): string {
	const parts = encryptedText.split(':');
	if (parts.length !== 3) {
		throw new Error('Invalid encrypted format');
	}

	const iv = Buffer.from(parts[0], 'hex');
	const tag = Buffer.from(parts[1], 'hex');
	const encrypted = parts[2];

	const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
	decipher.setAuthTag(tag);

	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}
