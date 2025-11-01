import { Plugin } from 'obsidian';
import type { WriteAliveSettings } from './settings/settings';
import { DEFAULT_SETTINGS } from './settings/settings';
import { WriteAliveSettingTab } from './settings/settings-tab';

/**
 * WriteAlive Plugin
 *
 * AI-assisted writing tool based on Saligo Writing methodology.
 * Enables writers to start small with seeds and grow naturally through
 * center-based development, inspired by Christopher Alexander's "The Nature of Order"
 * and Bill Evans' step-by-step mastery philosophy.
 *
 * Core Principles:
 * - Low-energy writing initiation (start with seeds, no outlines required)
 * - AI-assisted center discovery (identify structural pivots)
 * - Iterative refinement (evolve through generative sequences)
 * - Wholeness analysis (measure and improve document coherence)
 *
 * Architecture:
 * - Service-oriented design with clear separation of concerns
 * - Dependency Inversion: Plugin depends on service abstractions
 * - Single Responsibility: Each service handles one domain
 */
export default class WriteAlivePlugin extends Plugin {
	settings!: WriteAliveSettings;

	/**
	 * Plugin initialization
	 *
	 * Follows lifecycle pattern:
	 * 1. Load persisted settings
	 * 2. Initialize services (future: AIService, StorageManager)
	 * 3. Register commands
	 * 4. Register UI components
	 */
	async onload(): Promise<void> {
		console.log('Loading WriteAlive plugin');

		// Load settings from Obsidian's data store
		await this.loadSettings();

		// Register settings tab
		this.addSettingTab(new WriteAliveSettingTab(this.app, this));

		// Future: Initialize services
		// this.aiService = new AIServiceLayer(this.settings.aiProvider);
		// this.storageManager = new StorageManager(this.app.vault);

		// Future: Register commands
		// this.registerCommands();

		console.log('WriteAlive plugin loaded successfully');
	}

	/**
	 * Plugin cleanup
	 *
	 * Ensures graceful shutdown:
	 * - Dispose of service resources
	 * - Clear event listeners
	 * - Save any pending state
	 */
	onunload(): void {
		console.log('Unloading WriteAlive plugin');

		// Future: Cleanup services
		// this.aiService?.dispose();
	}

	/**
	 * Load plugin settings
	 *
	 * Merges persisted settings with defaults to ensure
	 * backward compatibility as new settings are added
	 */
	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * Save plugin settings
	 *
	 * Persists settings to Obsidian's data store
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
