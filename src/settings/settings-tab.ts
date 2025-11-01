import type { App } from 'obsidian';
import { PluginSettingTab, Setting } from 'obsidian';
import type WriteAlivePlugin from '../main';

/**
 * WriteAlive Settings Tab
 *
 * Provides user interface for plugin configuration.
 * Follows Open/Closed Principle: Easy to extend with new settings
 * without modifying existing code structure.
 */
export class WriteAliveSettingTab extends PluginSettingTab {
	plugin: WriteAlivePlugin;

	constructor(app: App, plugin: WriteAlivePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		containerEl.createEl('h2', { text: 'WriteAlive Settings' });
		containerEl.createEl('p', {
			text: 'Configure AI providers, seed gathering, and writing preferences.',
			cls: 'setting-item-description',
		});

		// AI Provider Section
		this.addAIProviderSettings(containerEl);

		// Seed Gathering Section
		this.addSeedGatheringSettings(containerEl);

		// General Settings Section
		this.addGeneralSettings(containerEl);
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
						this.plugin.settings.aiProvider = value as 'claude' | 'gpt' | 'gemini';
						await this.plugin.saveSettings();
					})
			);

		// API Key
		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Your AI provider API key (stored encrypted)')
			.addText((text) =>
				text
					.setPlaceholder('Enter your API key')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

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
