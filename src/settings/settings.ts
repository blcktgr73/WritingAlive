/**
 * Plugin Settings Data Model
 *
 * Follows Data Transfer Object pattern for clean separation
 * between configuration data and business logic.
 */

import type { EncryptedKey } from '../services/encryption';

/**
 * AI Provider types
 */
export type AIProvider = 'claude' | 'gpt' | 'gemini';

/**
 * Document output location types
 */
export type DocumentOutputLocation = 'vault-root' | 'same-folder' | 'custom-folder';

/**
 * WriteAlive Plugin Settings
 *
 * Contains all user-configurable options.
 * New settings should be added with sensible defaults in DEFAULT_SETTINGS.
 *
 * Security Note:
 * - API keys are stored encrypted using AES-GCM (256-bit)
 * - Never store plaintext API keys in this interface
 * - Use EncryptionService to encrypt before saving
 */
export interface WriteAliveSettings {
	/**
	 * AI Provider Selection
	 * @default 'claude' - Claude 3.5 Sonnet (MVP)
	 */
	aiProvider: AIProvider;

	/**
	 * Encrypted API Keys (one per provider)
	 *
	 * Keys are encrypted using Web Crypto API with:
	 * - AES-GCM (256-bit)
	 * - PBKDF2 key derivation (100k iterations)
	 * - Random IV per encryption
	 *
	 * @security NEVER store plaintext API keys
	 */
	encryptedApiKeys: {
		claude: EncryptedKey | null;
		gpt: EncryptedKey | null;
		gemini: EncryptedKey | null;
	};

	/**
	 * Encryption salt for key derivation
	 *
	 * Generated once per vault and reused for all API keys.
	 * This makes encryption device-specific.
	 *
	 * @default '' - Generated on first API key save
	 */
	encryptionSalt: string;

	/**
	 * Seed tags for vault-wide gathering
	 * Comma-separated list of tags to identify seeds
	 * @default 'seed,writealive-seed' - Standard seed markers
	 */
	seedTags: string;

	/**
	 * Enable auto-save
	 * @default true - Saves document every 30 seconds
	 */
	autoSave: boolean;

	/**
	 * Auto-save interval in seconds
	 * @default 30
	 */
	autoSaveInterval: number;

	/**
	 * Show AI cost warnings
	 * @default true - Warn before expensive operations
	 */
	showCostWarnings: boolean;

	/**
	 * Language preference
	 * @default 'en' - English
	 */
	language: 'en' | 'ko';

	/**
	 * Document output location
	 * @default 'vault-root' - Save to vault root
	 */
	documentOutputLocation: DocumentOutputLocation;

	/**
	 * Custom folder path for document output
	 * Only used when documentOutputLocation is 'custom-folder'
	 * @default '' - Empty string
	 */
	customOutputFolder: string;
}

/**
 * Default Settings
 *
 * Provides sensible defaults for all settings.
 * Used during initial plugin load and for backward compatibility.
 */
export const DEFAULT_SETTINGS: WriteAliveSettings = {
	aiProvider: 'claude',
	encryptedApiKeys: {
		claude: null,
		gpt: null,
		gemini: null,
	},
	encryptionSalt: '',
	seedTags: 'seed,writealive-seed',
	autoSave: true,
	autoSaveInterval: 30,
	showCostWarnings: true,
	language: 'en',
	documentOutputLocation: 'vault-root',
	customOutputFolder: '',
};

/**
 * Legacy Settings Interface
 *
 * For backward compatibility with T-001 settings that used
 * plaintext apiKey field. This helps with migration.
 */
export interface LegacySettings {
	aiProvider: AIProvider;
	apiKey?: string; // Old plaintext key
	seedTags: string;
	autoSave: boolean;
	autoSaveInterval: number;
	showCostWarnings: boolean;
	language: 'en' | 'ko';
}

/**
 * Check if settings need migration from legacy format
 *
 * @param settings - Settings object to check
 * @returns true if migration is needed
 */
export function needsMigration(settings: any): settings is LegacySettings {
	return (
		settings &&
		typeof settings.apiKey === 'string' &&
		!settings.encryptedApiKeys &&
		!settings.encryptionSalt
	);
}
