/**
 * Plugin Settings Data Model
 *
 * Follows Data Transfer Object pattern for clean separation
 * between configuration data and business logic.
 */

/**
 * AI Provider types
 */
export type AIProvider = 'claude' | 'gpt' | 'gemini';

/**
 * WriteAlive Plugin Settings
 *
 * Contains all user-configurable options.
 * New settings should be added with sensible defaults in DEFAULT_SETTINGS.
 */
export interface WriteAliveSettings {
	/**
	 * AI Provider Selection
	 * @default 'claude' - Claude 3.5 Sonnet (MVP)
	 */
	aiProvider: AIProvider;

	/**
	 * Encrypted API Key for selected provider
	 * @default '' - User must configure
	 */
	apiKey: string;

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
}

/**
 * Default Settings
 *
 * Provides sensible defaults for all settings.
 * Used during initial plugin load and for backward compatibility.
 */
export const DEFAULT_SETTINGS: WriteAliveSettings = {
	aiProvider: 'claude',
	apiKey: '',
	seedTags: 'seed,writealive-seed',
	autoSave: true,
	autoSaveInterval: 30,
	showCostWarnings: true,
	language: 'en',
};
