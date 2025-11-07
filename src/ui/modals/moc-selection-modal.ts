/**
 * MOC Selection Modal UI Component
 *
 * Displays available MOCs in the vault and allows users to select one
 * for center discovery analysis.
 *
 * Architecture:
 * - Single Responsibility: Only handles MOC selection UI
 * - Dependency Injection: Receives App and MOCDetector via constructor
 * - User Feedback: Shows MOC info (note count, estimated cost)
 * - Error Handling: Catches all errors and shows user-friendly notices
 *
 * UI Structure:
 * - Title: "Select MOC to Analyze"
 * - Search bar: Filter MOCs by name
 * - MOC list: Each MOC with name, note count, estimated cost
 * - Action buttons: "Analyze Selected MOC", "Cancel"
 *
 * User Flows:
 * 1. Open modal -> See list of all MOCs in vault
 * 2. Search/filter -> See filtered list
 * 3. Click MOC -> Select it (highlight)
 * 4. Click "Analyze" -> Start analysis -> Close modal
 */

import { Modal, App, Notice, ButtonComponent, Setting } from 'obsidian';
import type { MOCDetector } from '../../services/vault/moc-detector';
import type { MOCNote } from '../../services/vault/types';
import type { TFile } from 'obsidian';

/**
 * MOC Selection Result
 */
export interface MOCSelectionResult {
	/**
	 * Selected MOC file
	 */
	mocFile: TFile;

	/**
	 * Parsed MOC structure
	 */
	moc: MOCNote;
}

/**
 * MOC Selection Modal
 *
 * Modal for selecting which MOC to analyze for center discovery.
 */
export class MOCSelectionModal extends Modal {
	/**
	 * MOC detector service
	 */
	private readonly mocDetector: MOCDetector;

	/**
	 * Callback when MOC is selected
	 */
	private readonly onSelect: (result: MOCSelectionResult) => void;

	/**
	 * All detected MOCs
	 */
	private allMOCs: MOCNote[] = [];

	/**
	 * Filtered MOCs (after search)
	 */
	private filteredMOCs: MOCNote[] = [];

	/**
	 * Currently selected MOC
	 */
	private selectedMOC: MOCNote | null = null;

	/**
	 * Search query
	 */
	private searchQuery: string = '';

	/**
	 * Sort option
	 */
	private sortBy: 'name' | 'size' | 'modified' = 'name';

	/**
	 * Constructor
	 *
	 * @param app - Obsidian app instance
	 * @param mocDetector - MOC detector service
	 * @param onSelect - Callback when MOC is selected
	 */
	constructor(
		app: App,
		mocDetector: MOCDetector,
		onSelect: (result: MOCSelectionResult) => void
	) {
		super(app);
		this.mocDetector = mocDetector;
		this.onSelect = onSelect;
	}

	/**
	 * Open modal and load MOCs
	 */
	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('writealive-moc-selection-modal');

		// Title
		contentEl.createEl('h2', { text: 'Select MOC to Analyze' });

		// Description
		contentEl.createEl('p', {
			text: 'Choose a Map of Content to discover writing centers from its linked notes.',
			cls: 'writealive-modal-description',
		});

		// Loading state
		const loadingEl = contentEl.createEl('div', {
			text: 'Loading MOCs...',
			cls: 'writealive-loading',
		});

		try {
			// Detect all MOCs
			const result = await this.mocDetector.detectMOCs();
			this.allMOCs = result.mocs;
			this.filteredMOCs = [...this.allMOCs];

			loadingEl.remove();

			if (this.allMOCs.length === 0) {
				contentEl.createEl('p', {
					text: 'No MOCs found in vault. Create a MOC with "type: moc" in frontmatter, or use #moc tag, or place in MOCs folder.',
					cls: 'writealive-warning',
				});
				return;
			}

			// Render UI
			this.renderSearchBar(contentEl);
			this.renderSortControls(contentEl);
			this.renderMOCList(contentEl);
			this.renderActionButtons(contentEl);
		} catch (error) {
			loadingEl.remove();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			contentEl.createEl('p', {
				text: `Failed to load MOCs: ${errorMessage}`,
				cls: 'writealive-error',
			});
			console.error('[MOCSelectionModal] Failed to load MOCs:', error);
		}
	}

	/**
	 * Render search bar
	 */
	private renderSearchBar(container: HTMLElement): void {
		const searchContainer = container.createDiv('writealive-search-container');

		new Setting(searchContainer)
			.setName('Search MOCs')
			.setDesc('Filter by MOC name')
			.addText((text) =>
				text
					.setPlaceholder('Search...')
					.setValue(this.searchQuery)
					.onChange((value) => {
						this.searchQuery = value;
						this.applyFilters();
					})
			);
	}

	/**
	 * Render sort controls
	 */
	private renderSortControls(container: HTMLElement): void {
		const sortContainer = container.createDiv('writealive-sort-container');

		new Setting(sortContainer)
			.setName('Sort by')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('name', 'Name')
					.addOption('size', 'Note Count')
					.addOption('modified', 'Last Modified')
					.setValue(this.sortBy)
					.onChange((value) => {
						this.sortBy = value as 'name' | 'size' | 'modified';
						this.applySorting();
					})
			);
	}

	/**
	 * Render MOC list
	 */
	private renderMOCList(container: HTMLElement): void {
		// Save scroll position before re-rendering
		const existingList = container.querySelector('.writealive-moc-list') as HTMLElement;
		const scrollTop = existingList ? existingList.scrollTop : 0;

		// Remove existing list
		if (existingList) {
			existingList.remove();
		}

		const listContainer = container.createDiv('writealive-moc-list');

		if (this.filteredMOCs.length === 0) {
			listContainer.createEl('p', {
				text: 'No MOCs match your search.',
				cls: 'writealive-no-results',
			});
			return;
		}

		this.filteredMOCs.forEach((moc) => {
			const mocItem = listContainer.createDiv('writealive-moc-item');

			if (this.selectedMOC?.path === moc.path) {
				mocItem.addClass('selected');
			}

			// MOC title
			const titleEl = mocItem.createDiv('writealive-moc-title');
			titleEl.createEl('strong', { text: moc.title });

			// MOC info (note count, estimated cost, time)
			const infoEl = mocItem.createDiv('writealive-moc-info');

			const noteCount = moc.links.length;
			const estimatedCost = this.estimateCost(noteCount);
			const estimatedTime = this.estimateTime(noteCount);

			infoEl.createEl('span', {
				text: `📝 ${noteCount} notes`,
				cls: 'writealive-moc-stat',
			});

			infoEl.createEl('span', {
				text: `⏱️ ~${estimatedTime}s`,
				cls: 'writealive-moc-stat',
			});

			infoEl.createEl('span', {
				text: `💰 ~$${estimatedCost.toFixed(4)}`,
				cls: 'writealive-moc-stat',
			});

			// MOC path (small, gray)
			mocItem.createEl('div', {
				text: moc.path,
				cls: 'writealive-moc-path',
			});

			// Click to select
			mocItem.addEventListener('click', () => {
				this.selectedMOC = moc;
				this.renderMOCList(container);
				this.updateActionButtons();
			});
		});

		// Restore scroll position after rendering
		// Use setTimeout to ensure DOM is fully rendered
		setTimeout(() => {
			listContainer.scrollTop = scrollTop;
		}, 0);
	}

	/**
	 * Render action buttons
	 */
	private renderActionButtons(container: HTMLElement): void {
		// Remove existing buttons
		const existingButtons = container.querySelector('.writealive-modal-buttons');
		if (existingButtons) {
			existingButtons.remove();
		}

		const buttonContainer = container.createDiv('writealive-modal-buttons');

		// Cancel button
		new ButtonComponent(buttonContainer)
			.setButtonText('Cancel')
			.onClick(() => {
				this.close();
			});

		// Analyze button
		const analyzeButton = new ButtonComponent(buttonContainer)
			.setButtonText('Analyze Selected MOC')
			.setCta()
			.setDisabled(!this.selectedMOC)
			.onClick(async () => {
				if (!this.selectedMOC) {
					new Notice('Please select a MOC first');
					return;
				}

				try {
					// Verify MOC file still exists
					const fileExists = this.app.vault.getAbstractFileByPath(this.selectedMOC.path);
					if (!fileExists) {
						new Notice(`MOC file "${this.selectedMOC.title}" no longer exists. It may have been deleted.`);
						// Refresh the list
						const loadingEl = this.contentEl.createEl('div', {
							text: 'Refreshing MOC list...',
							cls: 'writealive-loading',
						});
						const result = await this.mocDetector.detectMOCs();
						this.allMOCs = result.mocs;
						this.filteredMOCs = [...this.allMOCs];
						this.selectedMOC = null;
						loadingEl.remove();
						this.renderMOCList(this.contentEl);
						this.updateActionButtons();
						return;
					}

					const result: MOCSelectionResult = {
						mocFile: this.selectedMOC.file,
						moc: this.selectedMOC,
					};

					this.close();
					this.onSelect(result);
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					new Notice(`Failed to select MOC: ${errorMessage}`);
					console.error('[MOCSelectionModal] Selection failed:', error);
				}
			});

		// Store button reference for updating
		(buttonContainer as any)._analyzeButton = analyzeButton;
	}

	/**
	 * Update action buttons state
	 */
	private updateActionButtons(): void {
		const buttonContainer = this.contentEl.querySelector('.writealive-modal-buttons');
		if (buttonContainer) {
			const analyzeButton = (buttonContainer as any)._analyzeButton;
			if (analyzeButton) {
				analyzeButton.setDisabled(!this.selectedMOC);
			}
		}
	}

	/**
	 * Apply search filter
	 */
	private applyFilters(): void {
		const query = this.searchQuery.toLowerCase();

		this.filteredMOCs = this.allMOCs.filter((moc) => {
			return moc.title.toLowerCase().includes(query);
		});

		this.applySorting();
	}

	/**
	 * Apply sorting
	 */
	private applySorting(): void {
		this.filteredMOCs.sort((a, b) => {
			switch (this.sortBy) {
				case 'name':
					return a.title.localeCompare(b.title);
				case 'size':
					return b.links.length - a.links.length;
				case 'modified':
					return b.file.stat.mtime - a.file.stat.mtime;
				default:
					return 0;
			}
		});

		this.renderMOCList(this.contentEl);
	}

	/**
	 * Estimate API cost for MOC analysis
	 *
	 * Based on typical note length and Claude 3.5 Sonnet pricing.
	 *
	 * @param noteCount - Number of notes in MOC
	 * @returns Estimated cost in USD
	 */
	private estimateCost(noteCount: number): number {
		// Average tokens per note: ~650
		// System prompt: ~500 tokens
		// Average output: ~800 tokens
		// Claude 3.5 Sonnet: $3/1M input, $15/1M output

		const AVG_TOKENS_PER_NOTE = 650;
		const SYSTEM_PROMPT_TOKENS = 500;
		const AVG_OUTPUT_TOKENS = 800;

		const inputTokens = noteCount * AVG_TOKENS_PER_NOTE + SYSTEM_PROMPT_TOKENS;
		const outputTokens = AVG_OUTPUT_TOKENS;

		const inputCost = (inputTokens / 1_000_000) * 3;
		const outputCost = (outputTokens / 1_000_000) * 15;

		return inputCost + outputCost;
	}

	/**
	 * Estimate analysis time
	 *
	 * @param noteCount - Number of notes in MOC
	 * @returns Estimated time in seconds
	 */
	private estimateTime(noteCount: number): number {
		// Base time: 2s for API call
		// Additional: 0.1s per note for reading/processing
		return 2 + noteCount * 0.1;
	}

	/**
	 * Close modal
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
