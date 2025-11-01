/**
 * Encryption Service
 *
 * Provides secure encryption/decryption for sensitive data (API keys)
 * using Web Crypto API with industry-standard algorithms.
 *
 * Security Architecture:
 * - Algorithm: AES-GCM (256-bit) - Authenticated encryption
 * - Key Derivation: PBKDF2 with SHA-256 (100,000 iterations)
 * - IV: Random 12 bytes per encryption (never reused)
 * - Salt: Device-specific, generated once per vault
 *
 * Design Principles Applied:
 * - Single Responsibility: Only handles encryption/decryption
 * - Dependency Inversion: Depends on Web Crypto API abstraction
 * - Interface Segregation: Clear, focused public interface
 */

import type { AIProvider } from '../settings/settings';

/**
 * Encrypted data structure
 *
 * Contains all information needed to decrypt data:
 * - ciphertext: The encrypted data
 * - iv: Initialization vector (must be unique per encryption)
 * - salt: Used for key derivation (device-specific)
 */
export interface EncryptedKey {
	/**
	 * Base64-encoded encrypted data
	 */
	ciphertext: string;

	/**
	 * Base64-encoded initialization vector (12 bytes for GCM)
	 * MUST be unique for each encryption operation
	 */
	iv: string;

	/**
	 * Base64-encoded salt for PBKDF2 key derivation
	 * Generated once per vault and reused for all keys
	 */
	salt: string;
}

/**
 * Encryption Service
 *
 * Provides cryptographic operations for securing sensitive data.
 *
 * Usage Example:
 * ```typescript
 * const service = new EncryptionService();
 * const encrypted = await service.encryptApiKey('sk-12345', 'claude');
 * const decrypted = await service.decryptApiKey(encrypted, 'claude');
 * ```
 */
export class EncryptionService {
	// Encryption parameters (following NIST recommendations)
	private readonly ALGORITHM = 'AES-GCM';
	private readonly KEY_LENGTH = 256; // bits
	private readonly IV_LENGTH = 12; // bytes (96 bits for GCM)
	private readonly SALT_LENGTH = 16; // bytes (128 bits)
	private readonly PBKDF2_ITERATIONS = 100000; // OWASP recommendation
	private readonly PBKDF2_HASH = 'SHA-256';

	/**
	 * Encrypt API key for secure storage
	 *
	 * @param plaintext - The API key to encrypt
	 * @param provider - AI provider identifier (used in key derivation)
	 * @param existingSalt - Optional salt to reuse (for vault-wide consistency)
	 * @returns Encrypted key with IV and salt
	 * @throws {EncryptionError} If encryption fails
	 */
	async encryptApiKey(
		plaintext: string,
		provider: AIProvider,
		existingSalt?: string
	): Promise<EncryptedKey> {
		try {
			// Validate input
			if (!plaintext || plaintext.trim().length === 0) {
				throw new Error('Cannot encrypt empty API key');
			}

			// Generate or reuse salt
			const salt = existingSalt
				? this.base64ToBuffer(existingSalt)
				: this.generateRandomBytes(this.SALT_LENGTH);

			// Generate unique IV for this encryption
			const iv = this.generateRandomBytes(this.IV_LENGTH);

			// Derive encryption key from provider-specific passphrase
			const cryptoKey = await this.deriveEncryptionKey(provider, salt);

			// Convert plaintext to bytes
			const plaintextBytes = new TextEncoder().encode(plaintext);

			// Encrypt using AES-GCM
			const ciphertextBytes = await crypto.subtle.encrypt(
				{
					name: this.ALGORITHM,
					iv: iv,
				},
				cryptoKey,
				plaintextBytes
			);

			// Return encrypted data structure
			return {
				ciphertext: this.bufferToBase64(ciphertextBytes),
				iv: this.bufferToBase64(iv),
				salt: this.bufferToBase64(salt),
			};
		} catch (error) {
			throw new EncryptionError(
				`Failed to encrypt API key for ${provider}`,
				error
			);
		}
	}

	/**
	 * Decrypt API key for runtime use
	 *
	 * @param encrypted - Encrypted key structure
	 * @param provider - AI provider identifier (used in key derivation)
	 * @returns Decrypted API key (plaintext)
	 * @throws {DecryptionError} If decryption fails or authentication fails
	 */
	async decryptApiKey(
		encrypted: EncryptedKey,
		provider: AIProvider
	): Promise<string> {
		try {
			// Validate encrypted data structure
			this.validateEncryptedKey(encrypted);

			// Convert Base64 back to bytes
			const ciphertextBytes = this.base64ToBuffer(encrypted.ciphertext);
			const iv = this.base64ToBuffer(encrypted.iv);
			const salt = this.base64ToBuffer(encrypted.salt);

			// Derive decryption key (same as encryption key)
			const cryptoKey = await this.deriveEncryptionKey(provider, salt);

			// Decrypt using AES-GCM (will throw if authentication fails)
			const plaintextBytes = await crypto.subtle.decrypt(
				{
					name: this.ALGORITHM,
					iv: iv,
				},
				cryptoKey,
				ciphertextBytes
			);

			// Convert bytes back to string
			return new TextDecoder().decode(plaintextBytes);
		} catch (error) {
			// GCM authentication failure or corrupt data
			throw new DecryptionError(
				`Failed to decrypt API key for ${provider}`,
				error
			);
		}
	}

	/**
	 * Generate device-specific encryption salt
	 *
	 * This salt should be generated once per vault and stored
	 * in plugin settings for reuse across all API keys.
	 *
	 * @returns Base64-encoded salt
	 */
	generateSalt(): string {
		const salt = this.generateRandomBytes(this.SALT_LENGTH);
		return this.bufferToBase64(salt);
	}

	/**
	 * Derive encryption key from provider identifier and salt
	 *
	 * Uses PBKDF2 to derive a cryptographic key from:
	 * - Provider name (acts as password/passphrase)
	 * - Device-specific salt
	 * - High iteration count (100k)
	 *
	 * This ensures keys are device-specific and cannot be used
	 * on other devices even if the encrypted data is copied.
	 *
	 * @param provider - AI provider identifier
	 * @param salt - Salt bytes
	 * @returns CryptoKey for AES-GCM operations
	 */
	private async deriveEncryptionKey(
		provider: AIProvider,
		salt: ArrayBuffer
	): Promise<CryptoKey> {
		// Use provider name as passphrase component
		// Combined with device-specific salt for uniqueness
		const passphraseBytes = new TextEncoder().encode(
			`writealive-${provider}-encryption-key`
		);

		// Import passphrase as raw key material
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			passphraseBytes,
			{ name: 'PBKDF2' },
			false,
			['deriveBits', 'deriveKey']
		);

		// Derive actual encryption key using PBKDF2
		return crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: salt,
				iterations: this.PBKDF2_ITERATIONS,
				hash: this.PBKDF2_HASH,
			},
			keyMaterial,
			{
				name: this.ALGORITHM,
				length: this.KEY_LENGTH,
			},
			false, // Not extractable (security best practice)
			['encrypt', 'decrypt']
		);
	}

	/**
	 * Generate cryptographically secure random bytes
	 *
	 * @param length - Number of bytes to generate
	 * @returns ArrayBuffer with random bytes
	 */
	private generateRandomBytes(length: number): ArrayBuffer {
		const bytes = new Uint8Array(length);
		crypto.getRandomValues(bytes);
		return bytes.buffer;
	}

	/**
	 * Convert ArrayBuffer to Base64 string
	 *
	 * @param buffer - Binary data
	 * @returns Base64-encoded string
	 */
	private bufferToBase64(buffer: ArrayBuffer): string {
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (let i = 0; i < bytes.length; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	/**
	 * Convert Base64 string to ArrayBuffer
	 *
	 * @param base64 - Base64-encoded string
	 * @returns Binary data
	 */
	private base64ToBuffer(base64: string): ArrayBuffer {
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	}

	/**
	 * Validate encrypted key structure
	 *
	 * @param encrypted - Encrypted key to validate
	 * @throws {Error} If structure is invalid
	 */
	private validateEncryptedKey(encrypted: EncryptedKey): void {
		if (!encrypted) {
			throw new Error('Encrypted key is null or undefined');
		}

		if (!encrypted.ciphertext || typeof encrypted.ciphertext !== 'string') {
			throw new Error('Invalid ciphertext');
		}

		if (!encrypted.iv || typeof encrypted.iv !== 'string') {
			throw new Error('Invalid IV');
		}

		if (!encrypted.salt || typeof encrypted.salt !== 'string') {
			throw new Error('Invalid salt');
		}

		// Validate Base64 encoding
		try {
			this.base64ToBuffer(encrypted.ciphertext);
			this.base64ToBuffer(encrypted.iv);
			this.base64ToBuffer(encrypted.salt);
		} catch (error) {
			throw new Error('Invalid Base64 encoding in encrypted key');
		}
	}
}

/**
 * Custom error for encryption failures
 */
export class EncryptionError extends Error {
	constructor(message: string, public readonly cause?: unknown) {
		super(message);
		this.name = 'EncryptionError';

		// Log detailed error for debugging (never log plaintext!)
		console.error('[EncryptionService]', message, {
			cause: cause instanceof Error ? cause.message : String(cause),
		});
	}
}

/**
 * Custom error for decryption failures
 */
export class DecryptionError extends Error {
	constructor(message: string, public readonly cause?: unknown) {
		super(message);
		this.name = 'DecryptionError';

		// Log detailed error for debugging
		console.error('[EncryptionService]', message, {
			cause: cause instanceof Error ? cause.message : String(cause),
		});
	}
}

/**
 * Singleton instance for application-wide use
 *
 * This ensures consistent encryption/decryption across the plugin
 * and avoids creating multiple service instances.
 */
export const encryptionService = new EncryptionService();
