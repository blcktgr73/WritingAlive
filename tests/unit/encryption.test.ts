/**
 * Encryption Service Unit Tests
 *
 * Tests the EncryptionService implementation following security best practices.
 *
 * Test Coverage:
 * - Encryption/decryption round-trip
 * - Unique IVs per encryption
 * - Key derivation consistency
 * - Error handling (invalid data, corrupt ciphertext)
 * - Edge cases (empty strings, special characters)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EncryptionService, EncryptionError, DecryptionError } from '../../src/services/encryption';
import type { EncryptedKey } from '../../src/services/encryption';
import type { AIProvider } from '../../src/settings/settings';

describe('EncryptionService', () => {
	let service: EncryptionService;

	beforeEach(() => {
		service = new EncryptionService();
	});

	describe('Basic Encryption/Decryption', () => {
		it('should encrypt and decrypt API key successfully', async () => {
			const plaintext = 'sk-ant-test-key-12345';
			const provider: AIProvider = 'claude';

			// Encrypt
			const encrypted = await service.encryptApiKey(plaintext, provider);

			// Verify encrypted structure
			expect(encrypted).toBeDefined();
			expect(encrypted.ciphertext).toBeTruthy();
			expect(encrypted.iv).toBeTruthy();
			expect(encrypted.salt).toBeTruthy();

			// Decrypt
			const decrypted = await service.decryptApiKey(encrypted, provider);

			// Verify round-trip
			expect(decrypted).toBe(plaintext);
		});

		it('should handle different providers correctly', async () => {
			const plaintext = 'test-api-key-xyz';
			const providers: AIProvider[] = ['claude', 'gpt', 'gemini'];

			for (const provider of providers) {
				const encrypted = await service.encryptApiKey(plaintext, provider);
				const decrypted = await service.decryptApiKey(encrypted, provider);

				expect(decrypted).toBe(plaintext);
			}
		});

		it('should handle long API keys', async () => {
			// Simulate a very long API key
			const plaintext = 'sk-ant-' + 'a'.repeat(500);
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(plaintext, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			expect(decrypted).toBe(plaintext);
		});

		it('should handle special characters in API keys', async () => {
			const plaintext = 'sk-ant-test!@#$%^&*()_+-={}[]|:;<>?,./~`';
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(plaintext, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			expect(decrypted).toBe(plaintext);
		});

		it('should handle Unicode characters', async () => {
			const plaintext = 'sk-ant-테스트-키-🔑-中文';
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(plaintext, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			expect(decrypted).toBe(plaintext);
		});
	});

	describe('Security Properties', () => {
		it('should generate unique IVs for each encryption', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			// Encrypt same plaintext multiple times
			const encrypted1 = await service.encryptApiKey(plaintext, provider);
			const encrypted2 = await service.encryptApiKey(plaintext, provider);
			const encrypted3 = await service.encryptApiKey(plaintext, provider);

			// IVs should all be different
			expect(encrypted1.iv).not.toBe(encrypted2.iv);
			expect(encrypted2.iv).not.toBe(encrypted3.iv);
			expect(encrypted1.iv).not.toBe(encrypted3.iv);

			// Ciphertexts should also be different (due to different IVs)
			expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
			expect(encrypted2.ciphertext).not.toBe(encrypted3.ciphertext);

			// But all should decrypt to same plaintext
			const decrypted1 = await service.decryptApiKey(encrypted1, provider);
			const decrypted2 = await service.decryptApiKey(encrypted2, provider);
			const decrypted3 = await service.decryptApiKey(encrypted3, provider);

			expect(decrypted1).toBe(plaintext);
			expect(decrypted2).toBe(plaintext);
			expect(decrypted3).toBe(plaintext);
		});

		it('should reuse salt for consistency', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			// First encryption generates salt
			const encrypted1 = await service.encryptApiKey(plaintext, provider);
			const salt = encrypted1.salt;

			// Reuse same salt for second encryption
			const encrypted2 = await service.encryptApiKey(plaintext, provider, salt);

			// Salts should match
			expect(encrypted2.salt).toBe(salt);

			// Both should decrypt correctly
			const decrypted1 = await service.decryptApiKey(encrypted1, provider);
			const decrypted2 = await service.decryptApiKey(encrypted2, provider);

			expect(decrypted1).toBe(plaintext);
			expect(decrypted2).toBe(plaintext);
		});

		it('should fail decryption with wrong provider', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			// Encrypt with Claude
			const encrypted = await service.encryptApiKey(plaintext, provider);

			// Try to decrypt with wrong provider (different key derivation)
			await expect(
				service.decryptApiKey(encrypted, 'gpt')
			).rejects.toThrow(DecryptionError);
		});

		it('should fail decryption with corrupted ciphertext', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(plaintext, provider);

			// Corrupt the ciphertext
			const corrupted: EncryptedKey = {
				...encrypted,
				ciphertext: encrypted.ciphertext.slice(0, -5) + 'XXXXX',
			};

			// Should fail authentication (GCM)
			await expect(
				service.decryptApiKey(corrupted, provider)
			).rejects.toThrow(DecryptionError);
		});

		it('should fail decryption with corrupted IV', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(plaintext, provider);

			// Corrupt the IV
			const corrupted: EncryptedKey = {
				...encrypted,
				iv: encrypted.iv.slice(0, -5) + 'XXXXX',
			};

			// Should fail decryption
			await expect(
				service.decryptApiKey(corrupted, provider)
			).rejects.toThrow(DecryptionError);
		});

		it('should fail decryption with corrupted salt', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(plaintext, provider);

			// Corrupt the salt
			const corrupted: EncryptedKey = {
				...encrypted,
				salt: encrypted.salt.slice(0, -5) + 'XXXXX',
			};

			// Should fail decryption (different key derivation)
			await expect(
				service.decryptApiKey(corrupted, provider)
			).rejects.toThrow(DecryptionError);
		});
	});

	describe('Salt Generation', () => {
		it('should generate unique salts', () => {
			const salt1 = service.generateSalt();
			const salt2 = service.generateSalt();
			const salt3 = service.generateSalt();

			expect(salt1).not.toBe(salt2);
			expect(salt2).not.toBe(salt3);
			expect(salt1).not.toBe(salt3);
		});

		it('should generate Base64-encoded salts', () => {
			const salt = service.generateSalt();

			// Should be valid Base64
			expect(() => atob(salt)).not.toThrow();

			// Should have reasonable length (16 bytes = ~24 Base64 chars)
			expect(salt.length).toBeGreaterThan(20);
		});
	});

	describe('Error Handling', () => {
		it('should reject empty API key', async () => {
			const provider: AIProvider = 'claude';

			await expect(
				service.encryptApiKey('', provider)
			).rejects.toThrow(EncryptionError);
		});

		it('should reject whitespace-only API key', async () => {
			const provider: AIProvider = 'claude';

			await expect(
				service.encryptApiKey('   ', provider)
			).rejects.toThrow(EncryptionError);
		});

		it('should reject null encrypted key', async () => {
			const provider: AIProvider = 'claude';

			await expect(
				service.decryptApiKey(null as any, provider)
			).rejects.toThrow();
		});

		it('should reject invalid encrypted key structure', async () => {
			const provider: AIProvider = 'claude';

			const invalid: EncryptedKey = {
				ciphertext: '',
				iv: '',
				salt: '',
			};

			await expect(
				service.decryptApiKey(invalid, provider)
			).rejects.toThrow();
		});

		it('should reject non-Base64 ciphertext', async () => {
			const provider: AIProvider = 'claude';

			const invalid: EncryptedKey = {
				ciphertext: 'not-valid-base64!!!',
				iv: service.generateSalt(),
				salt: service.generateSalt(),
			};

			await expect(
				service.decryptApiKey(invalid, provider)
			).rejects.toThrow();
		});
	});

	describe('Base64 Encoding/Decoding', () => {
		it('should correctly encode and decode binary data', async () => {
			// This is tested implicitly through encryption/decryption
			// But we verify it works with various data patterns

			const testCases = [
				'simple-key',
				'key-with-numbers-123',
				'key!@#$%^&*()',
				'🔑🔐🔒',
				'a'.repeat(100),
			];

			for (const plaintext of testCases) {
				const encrypted = await service.encryptApiKey(plaintext, 'claude');
				const decrypted = await service.decryptApiKey(encrypted, 'claude');

				expect(decrypted).toBe(plaintext);
			}
		});
	});

	describe('Performance', () => {
		it('should encrypt/decrypt within reasonable time', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			const startEncrypt = Date.now();
			const encrypted = await service.encryptApiKey(plaintext, provider);
			const encryptTime = Date.now() - startEncrypt;

			const startDecrypt = Date.now();
			await service.decryptApiKey(encrypted, provider);
			const decryptTime = Date.now() - startDecrypt;

			// Should complete within 1 second each
			// (PBKDF2 with 100k iterations may take ~100-500ms)
			expect(encryptTime).toBeLessThan(1000);
			expect(decryptTime).toBeLessThan(1000);
		});

		it('should handle multiple encryptions efficiently', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			const start = Date.now();

			// Encrypt 10 keys
			const promises = [];
			for (let i = 0; i < 10; i++) {
				promises.push(service.encryptApiKey(plaintext + i, provider));
			}

			await Promise.all(promises);

			const elapsed = Date.now() - start;

			// Should complete all within 5 seconds
			expect(elapsed).toBeLessThan(5000);
		});
	});

	describe('Edge Cases', () => {
		it('should handle encryption with existing salt', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			// Generate salt
			const salt = service.generateSalt();

			// Encrypt multiple keys with same salt
			const encrypted1 = await service.encryptApiKey(plaintext + '1', provider, salt);
			const encrypted2 = await service.encryptApiKey(plaintext + '2', provider, salt);

			// Both should use the same salt
			expect(encrypted1.salt).toBe(salt);
			expect(encrypted2.salt).toBe(salt);

			// Both should decrypt correctly
			const decrypted1 = await service.decryptApiKey(encrypted1, provider);
			const decrypted2 = await service.decryptApiKey(encrypted2, provider);

			expect(decrypted1).toBe(plaintext + '1');
			expect(decrypted2).toBe(plaintext + '2');
		});

		it('should handle single character API key', async () => {
			const plaintext = 'a';
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(plaintext, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			expect(decrypted).toBe(plaintext);
		});

		it('should trim whitespace from API keys', async () => {
			const plaintext = '  test-key-with-spaces  ';
			const provider: AIProvider = 'claude';

			// Should reject whitespace-only, but this has content
			const encrypted = await service.encryptApiKey(plaintext, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			// Should preserve the exact input (including spaces)
			expect(decrypted).toBe(plaintext);
		});
	});

	describe('Real-World Scenarios', () => {
		it('should handle Claude API key format', async () => {
			const claudeKey = 'sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz';
			const provider: AIProvider = 'claude';

			const encrypted = await service.encryptApiKey(claudeKey, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			expect(decrypted).toBe(claudeKey);
		});

		it('should handle OpenAI API key format', async () => {
			const openaiKey = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
			const provider: AIProvider = 'gpt';

			const encrypted = await service.encryptApiKey(openaiKey, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			expect(decrypted).toBe(openaiKey);
		});

		it('should handle Gemini API key format', async () => {
			const geminiKey = 'AIzaSy1234567890abcdefghijklmnopqrstuvwx';
			const provider: AIProvider = 'gemini';

			const encrypted = await service.encryptApiKey(geminiKey, provider);
			const decrypted = await service.decryptApiKey(encrypted, provider);

			expect(decrypted).toBe(geminiKey);
		});

		it('should maintain encryption across multiple sessions', async () => {
			const plaintext = 'test-key';
			const provider: AIProvider = 'claude';

			// Session 1: Encrypt and save
			const encrypted = await service.encryptApiKey(plaintext, provider);

			// Simulate saving to disk and reloading
			const serialized = JSON.stringify(encrypted);
			const deserialized: EncryptedKey = JSON.parse(serialized);

			// Session 2: Load and decrypt
			const newService = new EncryptionService();
			const decrypted = await newService.decryptApiKey(deserialized, provider);

			expect(decrypted).toBe(plaintext);
		});
	});
});
