import type { App } from 'obsidian';
import { PluginSettingTab, Setting, Notice } from 'obsidian';
import type WriteAlivePlugin from '../main';
import { encryptionService } from '../services/encryption';
import type { AIProvider } from './settings';

/**
 * WriteAlive Settings Tab
 *
 * Provides user interface for plugin configuration with secure
 * API key handling.
 *
 * Security Features:
 * - Encrypts API keys before saving
 * - Masks displayed keys (shows "••••••••")
 * - Never logs plaintext keys
 * - Provides show/hide toggle for verification
 *
 * Follows Open/Closed Principle: Easy to extend with new settings
 * without modifying existing code structure.
 */
export class WriteAliveSettingTab extends PluginSettingTab {
	plugin: WriteAlivePlugin;

	// Track API key visibility state per provider
	private apiKeyVisible: Record<AIProvider, boolean> = {
		claude: false,
		gpt: false,
		gemini: false,
	};

	// Cache decrypted API keys temporarily for display
	private decryptedKeys: Record<AIProvider, string> = {
		claude: '',
		gpt: '',
		gemini: '',
	};

	constructor(app: App, plugin: WriteAlivePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		containerEl.createEl('h2', { text: 'WriteAlive Settings' });
		containerEl.createEl('p', {
			text: 'Configure AI providers, seed gathering, and writing preferences.',
			cls: 'setting-item-description',
		});

		// Decrypt API keys for current provider (for display only)
		await this.loadDecryptedKeys();

		// AI Provider Section
		this.addAIProviderSettings(containerEl);

		// Seed Gathering Section
		this.addSeedGatheringSettings(containerEl);

		// General Settings Section
		this.addGeneralSettings(containerEl);
	}

	/**
	 * Load decrypted API keys for display
	 *
	 * Only decrypts the current provider's key to minimize exposure.
	 * Keys are kept in memory only for the duration of settings display.
	 */
	private async loadDecryptedKeys(): Promise<void> {
		const provider = this.plugin.settings.aiProvider;
		const encryptedKey = this.plugin.settings.encryptedApiKeys[provider];

		if (encryptedKey) {
			try {
				this.decryptedKeys[provider] = await encryptionService.decryptApiKey(
					encryptedKey,
					provider
				);
			} catch (error) {
				console.error('Failed to decrypt API key for display:', error);
				this.decryptedKeys[provider] = '';
			}
		}
	}

	/**
	 * Clear decrypted keys from memory
	 *
	 * Called when settings tab is closed to minimize security exposure.
	 */
	hide(): void {
		// Clear all decrypted keys from memory
		this.decryptedKeys = {
			claude: '',
			gpt: '',
			gemini: '',
		};

		// Reset visibility state
		this.apiKeyVisible = {
			claude: false,
			gpt: false,
			gemini: false,
		};
	}

	/**
	 * AI Provider Settings
	 *
	 * Single Responsibility: Configure AI-related settings only
	 */
	private addAIProviderSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'AI Provider' });

		// AI Provider Selection
		new Setting(containerEl)
			.setName('AI Provider')
			.setDesc('Choose your AI provider (MVP: Claude only)')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('claude', 'Claude 3.5 Sonnet')
					.addOption('gpt', 'GPT-4 (Coming Soon)')
					.addOption('gemini', 'Gemini Pro (Coming Soon)')
					.setValue(this.plugin.settings.aiProvider)
					.onChange(async (value) => {
						const newProvider = value as AIProvider;
						this.plugin.settings.aiProvider = newProvider;
						await this.plugin.saveSettings();

						// Reload decrypted key for new provider
						await this.loadDecryptedKeys();

						// Refresh display
						this.display();
					})
			);

		// API Key with encryption
		this.addApiKeyInput(containerEl);

		// Cost Warnings
		new Setting(containerEl)
			.setName('Show Cost Warnings')
			.setDesc('Display estimated costs before AI operations')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showCostWarnings)
					.onChange(async (value) => {
						this.plugin.settings.showCostWarnings = value;
						await this.plugin.saveSettings();
					})
			);
	}

	/**
	 * Add secure API key input with show/hide toggle
	 *
	 * Security Features:
	 * - Encrypts before saving
	 * - Masks by default (shows "••••••••")
	 * - Show/Hide button for verification
	 * - Never logs plaintext
	 */
	private addApiKeyInput(containerEl: HTMLElement): void {
		const provider = this.plugin.settings.aiProvider;
		const hasKey = this.plugin.settings.encryptedApiKeys[provider] !== null;

		const setting = new Setting(containerEl)
			.setName('API Key')
			.setDesc(
				'Your AI provider API key (stored encrypted with AES-256). Never shared or logged.'
			);

		let textComponent: any = null;

		// Add text input
		setting.addText((text) => {
			textComponent = text;

			// Show masked value by default
			const displayValue = hasKey
				? this.apiKeyVisible[provider]
					? this.decryptedKeys[provider]
					: '••••••••••••••••'
				: '';

			text.setPlaceholder('Enter your API key (e.g., sk-ant-...)')
				.setValue(displayValue)
				.onChange(async (value) => {
					// Only process if not showing masked placeholder
					if (value && value !== '••••••••••••••••') {
						await this.saveApiKey(provider, value);
					}
				});

			// Input type for security
			text.inputEl.type = this.apiKeyVisible[provider] ? 'text' : 'password';
		});

		// Add Show/Hide button
		if (hasKey) {
			setting.addButton((button) => {
				button
					.setButtonText(this.apiKeyVisible[provider] ? 'Hide' : 'Show')
					.onClick(async () => {
						this.apiKeyVisible[provider] = !this.apiKeyVisible[provider];

						// Update input value and type
						if (textComponent) {
							const displayValue = this.apiKeyVisible[provider]
								? this.decryptedKeys[provider]
								: '••••••••••••••••';

							textComponent.setValue(displayValue);
							textComponent.inputEl.type = this.apiKeyVisible[provider]
								? 'text'
								: 'password';
						}

						// Refresh display
						this.display();
					});
			});
		}

		// Add Clear button if key exists
		if (hasKey) {
			setting.addButton((button) => {
				button
					.setButtonText('Clear')
					.setWarning()
					.onClick(async () => {
						// Clear the encrypted key
						this.plugin.settings.encryptedApiKeys[provider] = null;
						this.decryptedKeys[provider] = '';
						await this.plugin.saveSettings();

						new Notice(`${provider} API key cleared`);

						// Refresh display
						this.display();
					});
			});
		}
	}

	/**
	 * Save API key with encryption
	 *
	 * @param provider - AI provider
	 * @param plaintext - Plaintext API key
	 */
	private async saveApiKey(provider: AIProvider, plaintext: string): Promise<void> {
		try {
			// Validate key format (basic check)
			if (!plaintext || plaintext.trim().length < 10) {
				new Notice('API key seems too short. Please check and try again.');
				return;
			}

			// Generate salt if this is the first key
			if (!this.plugin.settings.encryptionSalt) {
				this.plugin.settings.encryptionSalt = encryptionService.generateSalt();
			}

			// Encrypt the API key
			const encrypted = await encryptionService.encryptApiKey(
				plaintext.trim(),
				provider,
				this.plugin.settings.encryptionSalt
			);

			// Store encrypted key
			this.plugin.settings.encryptedApiKeys[provider] = encrypted;

			// Update decrypted cache for display
			this.decryptedKeys[provider] = plaintext.trim();

			// Save settings
			await this.plugin.saveSettings();

			new Notice(`${provider} API key saved securely`);
		} catch (error) {
			console.error('Failed to save API key:', error);
			new Notice('Failed to save API key. Please try again.');
		}
	}

	/**
	 * Seed Gathering Settings
	 *
	 * Single Responsibility: Configure seed-related settings only
	 */
	private addSeedGatheringSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Seed Gathering' });

		new Setting(containerEl)
			.setName('Seed Tags')
			.setDesc('Comma-separated tags for identifying seeds (e.g., seed,idea,💡)')
			.addText((text) =>
				text
					.setPlaceholder('seed,writealive-seed')
					.setValue(this.plugin.settings.seedTags)
					.onChange(async (value) => {
						this.plugin.settings.seedTags = value;
						await this.plugin.saveSettings();
					})
			);
	}

	/**
	 * General Settings
	 *
	 * Single Responsibility: Configure general preferences
	 */
	private addGeneralSettings(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'General' });

		// Auto-save
		new Setting(containerEl)
			.setName('Auto-save')
			.setDesc('Automatically save document changes')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoSave)
					.onChange(async (value) => {
						this.plugin.settings.autoSave = value;
						await this.plugin.saveSettings();
					})
			);

		// Auto-save interval
		new Setting(containerEl)
			.setName('Auto-save Interval')
			.setDesc('Auto-save interval in seconds')
			.addText((text) =>
				text
					.setPlaceholder('30')
					.setValue(String(this.plugin.settings.autoSaveInterval))
					.onChange(async (value) => {
						const numValue = parseInt(value);
						if (!isNaN(numValue) && numValue > 0) {
							this.plugin.settings.autoSaveInterval = numValue;
							await this.plugin.saveSettings();
						}
					})
			);

		// Language
		new Setting(containerEl)
			.setName('Language')
			.setDesc('Plugin interface language')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('en', 'English')
					.addOption('ko', '한국어')
					.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						this.plugin.settings.language = value as 'en' | 'ko';
						await this.plugin.saveSettings();
					})
			);
	}
}
