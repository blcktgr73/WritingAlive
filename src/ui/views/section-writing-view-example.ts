/**
 * Section Writing View - Integration Example
 *
 * This file demonstrates how to integrate SectionWritingView into your plugin.
 * Use this as a reference when implementing the ribbon button or command.
 */

import { Plugin, TFile, Notice } from 'obsidian';
import { SectionWritingView } from './section-writing-view';
import { OutcomeManager } from '../../services/outcome/outcome-manager';
import { SectionManager } from '../../services/outcome/section-manager';

/**
 * Example Plugin Integration
 *
 * Shows how to open SectionWritingView from a ribbon button or command.
 */
export class OutcomeDrivenWritingPlugin extends Plugin {
	private outcomeManager!: OutcomeManager;
	private sectionManager!: SectionManager;

	async onload() {
		// Initialize services
		this.outcomeManager = new OutcomeManager(this.app.vault);
		this.sectionManager = new SectionManager(this.app.vault);

		// Add ribbon icon
		this.addRibbonIcon('pencil', 'Write Outcome Document', () => {
			this.openWritingView();
		});

		// Add command
		this.addCommand({
			id: 'open-outcome-writing-view',
			name: 'Open Outcome Writing View',
			callback: () => {
				this.openWritingView();
			},
		});

		// Add command to continue writing active document
		this.addCommand({
			id: 'continue-outcome-writing',
			name: 'Continue Writing Outcome Document',
			checkCallback: (checking) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) return false;

				// Check if file is outcome-driven (async check not possible in checkCallback)
				// So we just check if it's a markdown file
				if (activeFile.extension !== 'md') return false;

				if (!checking) {
					this.continueWriting(activeFile);
				}
				return true;
			},
		});
	}

	/**
	 * Open writing view for new or existing document
	 */
	private async openWritingView() {
		const activeFile = this.app.workspace.getActiveFile();

		if (!activeFile) {
			new Notice('No active file. Create a document first.');
			return;
		}

		// Check if file is outcome-driven
		const metadata = await this.outcomeManager.getOutcome(activeFile);

		if (!metadata) {
			new Notice(
				'This is not an outcome-driven document. Create one using the Outcome Definition modal first.'
			);
			return;
		}

		// Open writing view
		this.openSectionWritingView(activeFile);
	}

	/**
	 * Continue writing existing outcome-driven document
	 */
	private async continueWriting(file: TFile) {
		// Validate it's an outcome-driven document
		const metadata = await this.outcomeManager.getOutcome(file);

		if (!metadata) {
			new Notice('This is not an outcome-driven document.');
			return;
		}

		// Check if already completed
		if (metadata.completedAt) {
			const confirm = await this.confirmReopen();
			if (!confirm) return;
		}

		// Open writing view
		this.openSectionWritingView(file);
	}

	/**
	 * Open section writing view
	 */
	private openSectionWritingView(file: TFile) {
		const view = new SectionWritingView(
			this.app,
			this.outcomeManager,
			this.sectionManager,
			{
				file,
				language: 'ko', // or 'en' based on settings
				onComplete: (completedFile) => {
					this.handleDocumentComplete(completedFile);
				},
			}
		);

		view.open();
	}

	/**
	 * Handle document completion
	 */
	private async handleDocumentComplete(file: TFile) {
		// Show completion notice
		new Notice(`🎉 Document completed: ${file.basename}`);

		// Open completed document in editor
		await this.app.workspace.openLinkText(file.path, '', false);

		// Log completion
		console.log('Document completed:', {
			file: file.path,
			timestamp: new Date().toISOString(),
		});

		// Optional: Export or share
		// await this.exportDocument(file);
	}

	/**
	 * Confirm reopening completed document
	 */
	private async confirmReopen(): Promise<boolean> {
		return new Promise((resolve) => {
			const confirmed = confirm(
				'This document is already completed. Continue editing?'
			);
			resolve(confirmed);
		});
	}

	/**
	 * Export document (example - not currently implemented)
	 */
	// private async exportDocument(_file: TFile) {
	// 	// TODO: Implement export logic
	// 	// - Export to PDF
	// 	// - Export to HTML
	// 	// - Save as template
	// 	// - Share via API
	// }
}

/**
 * Example: Opening view from a specific command
 */
export async function openWritingViewForFile(
	plugin: OutcomeDrivenWritingPlugin,
	file: TFile
) {
	// This is useful if you want to open the view programmatically
	// from other parts of your plugin (e.g., after creating a new document)

	const outcomeManager = new OutcomeManager(plugin.app.vault);
	const sectionManager = new SectionManager(plugin.app.vault);

	const view = new SectionWritingView(
		plugin.app,
		outcomeManager,
		sectionManager,
		{
			file,
			language: 'ko',
			onComplete: async (completedFile) => {
				new Notice(`Document completed: ${completedFile.basename}`);
				await plugin.app.workspace.openLinkText(
					completedFile.path,
					'',
					false
				);
			},
		}
	);

	view.open();
}

/**
 * Example: Settings integration
 */
interface OutcomeDrivenWritingSettings {
	language: 'ko' | 'en';
	autoSaveInterval: number; // seconds
	enableAISuggestions: boolean;
	validationStrictness: 'relaxed' | 'normal' | 'strict';
}

// Example settings structure (not currently used but provided for reference)
// const DEFAULT_SETTINGS: OutcomeDrivenWritingSettings = {
// 	language: 'ko',
// 	autoSaveInterval: 30,
// 	enableAISuggestions: true,
// 	validationStrictness: 'normal',
// };

/**
 * Example: Using settings in view
 */
export async function openWritingViewWithSettings(
	plugin: OutcomeDrivenWritingPlugin,
	file: TFile,
	settings: OutcomeDrivenWritingSettings
) {
	const outcomeManager = new OutcomeManager(plugin.app.vault);
	const sectionManager = new SectionManager(plugin.app.vault);

	const view = new SectionWritingView(
		plugin.app,
		outcomeManager,
		sectionManager,
		{
			file,
			language: settings.language,
			onComplete: async (completedFile) => {
				new Notice(`Document completed: ${completedFile.basename}`);
			},
		}
	);

	view.open();

	// Note: Auto-save interval and other settings would need to be
	// passed to the view or stored in a shared settings object
}
