/**
 * Snapshot Modal UI Component
 *
 * Displays all snapshots for the current file and provides restore/delete actions.
 *
 * Architecture:
 * - Single Responsibility: Only handles snapshot list UI and user interactions
 * - Dependency Injection: Receives App, TFile, and SnapshotManager via constructor
 * - User Feedback: Shows confirmations for destructive actions (restore/delete)
 * - Error Handling: Catches all errors and shows user-friendly notices
 *
 * UI Structure:
 * - Title: "Snapshots for {filename}"
 * - Snapshot list: Each snapshot with metadata, restore/delete buttons
 * - Empty state: Shows "No snapshots yet" message
 *
 * User Flows:
 * 1. Open modal -> See list of snapshots sorted by timestamp (newest first)
 * 2. Click Restore -> Confirm -> Restore snapshot -> Close modal
 * 3. Click Delete -> Confirm -> Delete snapshot -> Refresh list
 */

import { Modal, App, TFile, Notice, ButtonComponent } from 'obsidian';
import type { SnapshotManager } from '../services/storage/snapshot-manager';
import type { SnapshotMetadata } from '../services/storage/types';
import { StorageError } from '../services/storage/types';

/**
 * Snapshot Viewer Modal
 *
 * Modal for viewing, restoring, and deleting snapshots.
 */
export class SnapshotModal extends Modal {
	/**
	 * File being viewed
	 */
	private readonly file: TFile;

	/**
	 * Snapshot manager service
	 */
	private readonly snapshotManager: SnapshotManager;

	/**
	 * Constructor
	 *
	 * @param app - Obsidian app instance
	 * @param file - File to view snapshots for
	 * @param snapshotManager - Snapshot manager service
	 */
	constructor(app: App, file: TFile, snapshotManager: SnapshotManager) {
		super(app);
		this.file = file;
		this.snapshotManager = snapshotManager;
	}

	/**
	 * Open modal and render UI
	 */
	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();

		// Add modal class for styling
		contentEl.addClass('writealive-snapshot-modal');

		// Title
		contentEl.createEl('h2', {
			text: `Snapshots for "${this.file.basename}"`,
		});

		try {
			// Load snapshots
			const snapshots = await this.snapshotManager.listSnapshots(this.file);

			// Empty state
			if (snapshots.length === 0) {
				const emptyDiv = contentEl.createDiv({ cls: 'writealive-empty-state' });
				emptyDiv.createEl('p', {
					text: 'No snapshots yet',
					cls: 'writealive-empty-message',
				});
				emptyDiv.createEl('p', {
					text: 'Create your first snapshot using the "Create Snapshot" command',
					cls: 'writealive-empty-hint',
				});
				return;
			}

			// Snapshot list container
			const listContainer = contentEl.createDiv({
				cls: 'writealive-snapshot-list',
			});

			// Render each snapshot
			for (const snapshot of snapshots) {
				this.renderSnapshot(listContainer, snapshot);
			}
		} catch (error) {
			// Show error state
			const errorDiv = contentEl.createDiv({ cls: 'writealive-error-state' });
			errorDiv.createEl('p', {
				text: 'Failed to load snapshots',
				cls: 'writealive-error-message',
			});

			if (error instanceof StorageError) {
				errorDiv.createEl('p', {
					text: error.message,
					cls: 'writealive-error-details',
				});
			}

			console.error('[SnapshotModal] Failed to load snapshots:', error);
		}
	}

	/**
	 * Render a single snapshot item
	 *
	 * @param container - Container element
	 * @param snapshot - Snapshot metadata to render
	 */
	private renderSnapshot(
		container: HTMLElement,
		snapshot: SnapshotMetadata
	): void {
		// Snapshot item container
		const snapshotDiv = container.createDiv({ cls: 'writealive-snapshot-item' });

		// Header with snapshot name and icon
		const headerDiv = snapshotDiv.createDiv({ cls: 'writealive-snapshot-header' });
		headerDiv.createEl('h3', {
			text: `📷 ${snapshot.name}`,
			cls: 'writealive-snapshot-name',
		});

		// Metadata section
		const metaDiv = snapshotDiv.createDiv({ cls: 'writealive-snapshot-meta' });

		// Timestamp
		const timestampDiv = metaDiv.createDiv({ cls: 'writealive-snapshot-timestamp' });
		timestampDiv.createEl('span', {
			text: this.formatTimestamp(snapshot.timestamp),
			cls: 'writealive-meta-value',
		});

		// Statistics
		const statsDiv = metaDiv.createDiv({ cls: 'writealive-snapshot-stats' });
		statsDiv.createEl('span', {
			text: `${snapshot.wordCount} words, ${snapshot.paragraphCount} paragraphs`,
			cls: 'writealive-meta-value',
		});

		// Centers and wholeness (if available)
		if (snapshot.centerCount > 0 || snapshot.wholenessScore !== null) {
			const analysisDiv = metaDiv.createDiv({
				cls: 'writealive-snapshot-analysis',
			});

			if (snapshot.centerCount > 0) {
				analysisDiv.createEl('span', {
					text: `${snapshot.centerCount} centers`,
					cls: 'writealive-meta-value',
				});
			}

			if (snapshot.wholenessScore !== null) {
				analysisDiv.createEl('span', {
					text: `Wholeness: ${snapshot.wholenessScore.toFixed(1)}/10`,
					cls: 'writealive-meta-value',
				});
			}
		}

		// Source badge
		const sourceDiv = metaDiv.createDiv({ cls: 'writealive-snapshot-source' });
		sourceDiv.createEl('span', {
			text: snapshot.source === 'manual' ? '👤 Manual' : '🤖 Auto',
			cls: 'writealive-source-badge',
		});

		// Action buttons
		const actionsDiv = snapshotDiv.createDiv({ cls: 'writealive-snapshot-actions' });

		// Restore button
		new ButtonComponent(actionsDiv)
			.setButtonText('Restore')
			.setClass('mod-cta')
			.onClick(() => this.handleRestore(snapshot));

		// Delete button
		new ButtonComponent(actionsDiv)
			.setButtonText('Delete')
			.setWarning()
			.onClick(() => this.handleDelete(snapshot));
	}

	/**
	 * Handle restore snapshot action
	 *
	 * Shows confirmation dialog before restoring.
	 *
	 * @param snapshot - Snapshot to restore
	 */
	private async handleRestore(snapshot: SnapshotMetadata): Promise<void> {
		// Confirm with user
		const confirmed = await this.showConfirmDialog(
			'Restore Snapshot',
			`This will replace the current content with "${snapshot.name}". A backup snapshot will be created automatically.\n\nContinue?`,
			'Restore'
		);

		if (!confirmed) {
			return;
		}

		try {
			// Restore snapshot
			await this.snapshotManager.restoreSnapshot(this.file, snapshot.id);

			// Show success message
			new Notice(`Restored snapshot: ${snapshot.name}`);

			// Close modal
			this.close();
		} catch (error) {
			// Show error message
			if (error instanceof StorageError) {
				new Notice(`Failed to restore snapshot: ${error.message}`);
			} else {
				new Notice('Failed to restore snapshot: Unexpected error');
			}

			console.error('[SnapshotModal] Restore failed:', error);
		}
	}

	/**
	 * Handle delete snapshot action
	 *
	 * Shows confirmation dialog before deleting.
	 *
	 * @param snapshot - Snapshot to delete
	 */
	private async handleDelete(snapshot: SnapshotMetadata): Promise<void> {
		// Confirm with user
		const confirmed = await this.showConfirmDialog(
			'Delete Snapshot',
			`Are you sure you want to delete "${snapshot.name}"?\n\nThis action cannot be undone.`,
			'Delete',
			true
		);

		if (!confirmed) {
			return;
		}

		try {
			// Delete snapshot
			await this.snapshotManager.deleteSnapshot(this.file, snapshot.id);

			// Show success message
			new Notice(`Deleted snapshot: ${snapshot.name}`);

			// Refresh modal to show updated list
			await this.onOpen();
		} catch (error) {
			// Show error message
			if (error instanceof StorageError) {
				new Notice(`Failed to delete snapshot: ${error.message}`);
			} else {
				new Notice('Failed to delete snapshot: Unexpected error');
			}

			console.error('[SnapshotModal] Delete failed:', error);
		}
	}

	/**
	 * Show confirmation dialog
	 *
	 * Uses Obsidian's built-in confirm dialog for consistent UX.
	 *
	 * @param title - Dialog title
	 * @param message - Dialog message
	 * @param ctaText - Call-to-action button text
	 * @param isWarning - Whether this is a warning action (destructive)
	 * @returns Promise resolving to true if confirmed, false if cancelled
	 */
	private async showConfirmDialog(
		title: string,
		message: string,
		ctaText: string,
		isWarning = false
	): Promise<boolean> {
		return new Promise((resolve) => {
			// Create confirmation modal
			const modal = new Modal(this.app);

			modal.titleEl.setText(title);
			modal.contentEl.setText(message);

			// Add buttons
			const buttonContainer = modal.contentEl.createDiv({
				cls: 'modal-button-container',
			});

			// Cancel button
			new ButtonComponent(buttonContainer)
				.setButtonText('Cancel')
				.onClick(() => {
					modal.close();
					resolve(false);
				});

			// Confirm button
			const confirmButton = new ButtonComponent(buttonContainer)
				.setButtonText(ctaText)
				.setCta()
				.onClick(() => {
					modal.close();
					resolve(true);
				});

			// Apply warning class if needed
			if (isWarning) {
				confirmButton.setWarning();
			}

			modal.open();
		});
	}

	/**
	 * Format timestamp for display
	 *
	 * Converts ISO timestamp to human-readable format.
	 *
	 * @param timestamp - ISO timestamp string
	 * @returns Formatted timestamp
	 */
	private formatTimestamp(timestamp: string): string {
		try {
			const date = new Date(timestamp);

			// Format: Nov 1, 2025 10:30 AM
			return date.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
			});
		} catch {
			// Fallback to original timestamp if parsing fails
			return timestamp;
		}
	}

	/**
	 * Close modal and cleanup
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
