/**
 * Gather Seeds Modal UI Component
 *
 * Displays seed notes from the vault and allows users to select seeds
 * to start writing with.
 *
 * Architecture:
 * - Single Responsibility: Only handles seed gathering UI and user interactions
 * - Dependency Injection: Receives App and SeedGatherer via constructor
 * - User Feedback: Shows loading states, filter options, preview pane
 * - Error Handling: Catches all errors and shows user-friendly notices
 *
 * UI Structure:
 * - Title: "Gather Seeds"
 * - Filter controls: Date filter dropdown, tag filter
 * - Seed list: Each seed with checkbox, title, excerpt, tags, date
 * - Preview pane: Shows full content of selected seed
 * - Action buttons: "Start Writing with Selected Seeds", "Cancel"
 *
 * User Flows:
 * 1. Open modal -> See list of seeds filtered by configured tags
 * 2. Apply filters -> See updated list
 * 3. Select seeds (checkbox) -> See selection count
 * 4. Click "Start Writing" -> Create new note with seeds -> Close modal
 */

import { Modal, App, Notice, ButtonComponent, DropdownComponent, Setting } from 'obsidian';
import type { SeedGatherer } from '../services/vault/seed-gatherer';
import type { SeedNote, SeedGatherOptions } from '../services/vault/types';
import type { AIService } from '../services/ai/ai-service';
import { CenterDiscoveryModal } from './modals/center-discovery-modal';
import { TagStatistics } from '../services/vault/tag-statistics';
import { TagFilterPanel } from './components/tag-filter-panel';
import type { TagFilterChangeEvent } from './components/tag-filter-panel';

/**
 * Gather Seeds Modal
 *
 * Modal for discovering and selecting seed notes from vault.
 */
export class GatherSeedsModal extends Modal {
	/**
	 * Seed gatherer service
	 */
	private readonly seedGatherer: SeedGatherer;

	/**
	 * AI service for center discovery
	 */
	private readonly aiService: AIService | null;

	/**
	 * Currently loaded seeds (all from vault)
	 */
	private seeds: SeedNote[] = [];

	/**
	 * Filtered seeds (after tag filter applied)
	 */
	private filteredSeeds: SeedNote[] = [];

	/**
	 * Selected seeds (by path)
	 */
	private selectedSeeds: Set<string> = new Set();

	/**
	 * Current filter options
	 */
	private filterOptions: SeedGatherOptions = {
		dateFilter: 'all',
		sortBy: 'created',
		sortOrder: 'desc',
	};

	/**
	 * Tag filter panel instance
	 */
	private tagFilterPanel: TagFilterPanel | null = null;

	/**
	 * Currently selected tag filter tags
	 */
	private selectedTagFilters: string[] = [];

	/**
	 * Tag filter mode (any/all)
	 */
	private tagFilterMode: 'any' | 'all' = 'any';

	/**
	 * Constructor
	 *
	 * @param app - Obsidian app instance
	 * @param seedGatherer - Seed gatherer service
	 * @param aiService - AI service for center discovery (optional)
	 */
	constructor(app: App, seedGatherer: SeedGatherer, aiService: AIService | null = null) {
		super(app);
		this.seedGatherer = seedGatherer;
		this.aiService = aiService;
	}

	/**
	 * Open modal and render UI
	 */
	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();

		// Add modal class for styling
		contentEl.addClass('writealive-gather-seeds-modal');

		// Title
		contentEl.createEl('h2', {
			text: '🌱 Gather Seeds',
		});

		// Render filter controls
		await this.renderFilters(contentEl);

		// Container for seeds list (will be populated by loadSeeds)
		const seedsContainer = contentEl.createDiv({
			cls: 'writealive-seeds-container'
		});

		// Load and display seeds
		await this.loadSeeds(seedsContainer);

		// Action buttons
		this.renderActionButtons(contentEl);
	}

	/**
	 * Render filter controls
	 *
	 * @param container - Container element
	 */
	private async renderFilters(container: HTMLElement): Promise<void> {
		const filtersDiv = container.createDiv({ cls: 'writealive-seeds-filters' });

		// Tag filter panel (rendered first if seeds are available)
		// This will be populated after initial seed load
		const tagFilterContainer = filtersDiv.createDiv({ cls: 'tag-filter-container' });
		tagFilterContainer.id = 'writealive-tag-filter-container';

		// Date filter dropdown
		new Setting(filtersDiv)
			.setName('Date Range')
			.setDesc('Filter seeds by creation date')
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown
					.addOption('all', 'All Time')
					.addOption('today', 'Today')
					.addOption('week', 'This Week')
					.addOption('month', 'This Month')
					.setValue(this.filterOptions.dateFilter || 'all')
					.onChange(async (value) => {
						this.filterOptions.dateFilter = value as 'all' | 'today' | 'week' | 'month';
						await this.refreshSeeds();
					});
			});

		// Sort by dropdown
		new Setting(filtersDiv)
			.setName('Sort By')
			.setDesc('Order seeds by field')
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown
					.addOption('created', 'Created Date')
					.addOption('modified', 'Modified Date')
					.addOption('title', 'Title')
					.setValue(this.filterOptions.sortBy || 'created')
					.onChange(async (value) => {
						this.filterOptions.sortBy = value as 'created' | 'modified' | 'title';
						await this.refreshSeeds();
					});
			});
	}

	/**
	 * Load seeds from vault
	 *
	 * @param container - Container element for seeds list
	 */
	private async loadSeeds(container: HTMLElement): Promise<void> {
		// Show loading state
		container.empty();
		const loadingDiv = container.createDiv({ cls: 'writealive-loading' });
		loadingDiv.createEl('p', { text: 'Loading seeds...' });

		try {
			// Gather seeds with current filters
			const result = await this.seedGatherer.gatherSeeds(this.filterOptions);
			this.seeds = result.seeds;

			// Initialize filtered seeds (no tag filter applied yet)
			this.filteredSeeds = this.seeds;

			// Clear loading state
			container.empty();

			// Empty state
			if (this.seeds.length === 0) {
				const emptyDiv = container.createDiv({ cls: 'writealive-empty-state' });
				emptyDiv.createEl('p', {
					text: 'No seeds found',
					cls: 'writealive-empty-message',
				});
				emptyDiv.createEl('p', {
					text: `Create notes with tags: ${result.tags.map(t => '#' + t).join(', ')}`,
					cls: 'writealive-empty-hint',
				});
				return;
			}

			// Render tag filter panel now that we have seeds
			this.renderTagFilterPanel();

			// Show count
			const headerDiv = container.createDiv({ cls: 'writealive-seeds-header' });
			this.updateSeedCount(headerDiv);

			// "Select All" button
			const selectAllButton = new ButtonComponent(headerDiv)
				.setButtonText('Select All')
				.onClick(() => {
					// Toggle all selections for FILTERED seeds
					if (this.selectedSeeds.size === this.filteredSeeds.length) {
						// Deselect all
						this.selectedSeeds.clear();
						selectAllButton.setButtonText('Select All');
					} else {
						// Select all filtered seeds
						this.filteredSeeds.forEach(seed => this.selectedSeeds.add(seed.path));
						selectAllButton.setButtonText('Deselect All');
					}
					this.refreshSeedList(container);
				});

			// Seed list
			const listDiv = container.createDiv({ cls: 'writealive-seeds-list' });
			this.renderSeedList(listDiv);

		} catch (error) {
			// Show error state
			container.empty();
			const errorDiv = container.createDiv({ cls: 'writealive-error-state' });
			errorDiv.createEl('p', {
				text: 'Failed to load seeds',
				cls: 'writealive-error-message',
			});

			if (error instanceof Error) {
				errorDiv.createEl('p', {
					text: error.message,
					cls: 'writealive-error-details',
				});
			}

			console.error('[GatherSeedsModal] Failed to load seeds:', error);
		}
	}

	/**
	 * Render tag filter panel
	 *
	 * Creates or updates the tag filter panel with current seeds.
	 */
	private renderTagFilterPanel(): void {
		// Find tag filter container
		const container = this.contentEl.querySelector('#writealive-tag-filter-container') as HTMLElement;
		if (!container) {
			return;
		}

		// Extract tag statistics from all seeds
		const tagStats = TagStatistics.extractFromSeeds(this.seeds);

		// Clear existing panel
		container.empty();

		// Create new tag filter panel
		this.tagFilterPanel = new TagFilterPanel(container, {
			tagStats: tagStats,
			onChange: (event: TagFilterChangeEvent) => {
				this.selectedTagFilters = event.selectedTags;
				this.tagFilterMode = event.mode;
				this.applyTagFilter();
			},
		});

		// Render the panel
		this.tagFilterPanel.render();
	}

	/**
	 * Apply tag filter to seeds
	 *
	 * Filters the seed list based on selected tags and updates the UI.
	 */
	private applyTagFilter(): void {
		// Apply tag filter
		this.filteredSeeds = TagStatistics.filterSeedsByTags(this.seeds, {
			tags: this.selectedTagFilters,
			mode: this.tagFilterMode,
		});

		// Update seed count display
		const headerDiv = this.contentEl.querySelector('.writealive-seeds-header') as HTMLElement;
		if (headerDiv) {
			this.updateSeedCount(headerDiv);
		}

		// Re-render seed list
		const listDiv = this.contentEl.querySelector('.writealive-seeds-list') as HTMLElement;
		if (listDiv) {
			this.renderSeedList(listDiv);
		}

		// Update action buttons
		this.updateActionButtons();
	}

	/**
	 * Update seed count display
	 *
	 * @param container - Header container element
	 */
	private updateSeedCount(container: HTMLElement): void {
		// Find or create count element
		let countEl = container.querySelector('.writealive-seeds-count') as HTMLElement;
		if (!countEl) {
			countEl = container.createEl('p', { cls: 'writealive-seeds-count' });
		}

		// Update text based on filter state
		if (this.selectedTagFilters.length > 0) {
			countEl.textContent = `🌱 Seeds: ${this.filteredSeeds.length} of ${this.seeds.length} (filtered by ${this.selectedTagFilters.length} tag${this.selectedTagFilters.length !== 1 ? 's' : ''})`;
		} else {
			countEl.textContent = `🌱 Seeds Found: ${this.seeds.length}`;
		}
	}

	/**
	 * Render the list of seeds
	 *
	 * @param container - Container element
	 */
	private renderSeedList(container: HTMLElement): void {
		container.empty();

		// Render filtered seeds
		for (const seed of this.filteredSeeds) {
			this.renderSeed(container, seed);
		}

		// Empty state for filtered results
		if (this.filteredSeeds.length === 0 && this.seeds.length > 0) {
			const emptyDiv = container.createDiv({ cls: 'writealive-empty-state' });
			emptyDiv.createEl('p', {
				text: 'No seeds match the selected tags',
				cls: 'writealive-empty-message',
			});
			emptyDiv.createEl('p', {
				text: 'Try selecting different tags or clearing the filter',
				cls: 'writealive-empty-hint',
			});
		}
	}

	/**
	 * Render a single seed item
	 *
	 * @param container - Container element
	 * @param seed - Seed note to render
	 */
	private renderSeed(container: HTMLElement, seed: SeedNote): void {
		const seedDiv = container.createDiv({ cls: 'writealive-seed-item' });

		// Make the seed item clickable
		seedDiv.addClass('writealive-seed-clickable');
		const isSelected = this.selectedSeeds.has(seed.path);
		if (isSelected) {
			seedDiv.addClass('writealive-seed-selected');
		}

		// Checkbox
		const checkboxDiv = seedDiv.createDiv({ cls: 'writealive-seed-checkbox' });
		const checkbox = checkboxDiv.createEl('input', {
			type: 'checkbox',
			cls: 'task-list-item-checkbox',
		});
		checkbox.checked = isSelected;
		checkbox.addEventListener('change', () => {
			if (checkbox.checked) {
				this.selectedSeeds.add(seed.path);
				seedDiv.addClass('writealive-seed-selected');
			} else {
				this.selectedSeeds.delete(seed.path);
				seedDiv.removeClass('writealive-seed-selected');
			}
			this.updateActionButtons();
		});

		// Content container
		const contentDiv = seedDiv.createDiv({ cls: 'writealive-seed-content' });

		// Title
		contentDiv.createEl('h3', {
			text: seed.title,
			cls: 'writealive-seed-title',
		});

		// Excerpt
		if (seed.excerpt) {
			contentDiv.createEl('p', {
				text: seed.excerpt,
				cls: 'writealive-seed-excerpt',
			});
		}

		// Metadata row
		const metaDiv = contentDiv.createDiv({ cls: 'writealive-seed-meta' });

		// Date
		const dateSpan = metaDiv.createEl('span', {
			cls: 'writealive-seed-date',
		});
		dateSpan.textContent = this.formatDate(seed.createdAt);

		// Tags
		if (seed.tags.length > 0) {
			const tagsDiv = metaDiv.createDiv({ cls: 'writealive-seed-tags' });
			seed.tags.slice(0, 3).forEach(tag => {
				tagsDiv.createEl('span', {
					text: '#' + tag,
					cls: 'writealive-seed-tag',
				});
			});
			if (seed.tags.length > 3) {
				tagsDiv.createEl('span', {
					text: `+${seed.tags.length - 3} more`,
					cls: 'writealive-seed-tag-more',
				});
			}
		}

		// Backlinks count
		if (seed.backlinks.length > 0) {
			metaDiv.createEl('span', {
				text: `🔗 ${seed.backlinks.length}`,
				cls: 'writealive-seed-backlinks',
			});
		}

		// Make entire seed item clickable to toggle selection
		seedDiv.addEventListener('click', (e) => {
			// Skip if clicking the checkbox directly
			if (e.target === checkbox) {
				return;
			}
			checkbox.checked = !checkbox.checked;
			checkbox.dispatchEvent(new Event('change'));
		});
	}

	/**
	 * Render action buttons
	 *
	 * @param container - Container element
	 */
	private renderActionButtons(container: HTMLElement): void {
		const actionsDiv = container.createDiv({ cls: 'writealive-seeds-actions' });

		// Cancel button
		new ButtonComponent(actionsDiv)
			.setButtonText('Cancel')
			.onClick(() => {
				this.close();
			});

		// Find Centers button (only shown if AI service is available)
		if (this.aiService) {
			this.findCentersButton = new ButtonComponent(actionsDiv)
				.setButtonText('🎯 Find Centers')
				.setDisabled(true)
				.onClick(async () => {
					await this.handleFindCenters();
				});
		}

		// Start Writing button
		this.startWritingButton = new ButtonComponent(actionsDiv)
			.setButtonText(`Start Writing (0 seeds)`)
			.setCta()
			.setDisabled(true)
			.onClick(async () => {
				await this.handleStartWriting();
			});
	}

	/**
	 * Start Writing button reference
	 */
	private startWritingButton: ButtonComponent | null = null;

	/**
	 * Find Centers button reference
	 */
	private findCentersButton: ButtonComponent | null = null;

	/**
	 * Update action buttons based on selection
	 */
	private updateActionButtons(): void {
		const count = this.selectedSeeds.size;

		// Update Start Writing button
		if (this.startWritingButton) {
			this.startWritingButton.setButtonText(`Start Writing (${count} seed${count !== 1 ? 's' : ''})`);
			this.startWritingButton.setDisabled(count === 0);
		}

		// Update Find Centers button (requires 2+ seeds and AI service)
		if (this.findCentersButton) {
			const hasEnoughSeeds = count >= 2;
			const hasAIService = this.aiService !== null;
			this.findCentersButton.setDisabled(!hasEnoughSeeds || !hasAIService);
		}
	}

	/**
	 * Handle Start Writing action
	 *
	 * Creates a new note with selected seeds.
	 */
	private async handleStartWriting(): Promise<void> {
		if (this.selectedSeeds.size === 0) {
			new Notice('Please select at least one seed');
			return;
		}

		try {
			// Get selected seed notes
			const selectedSeedNotes = this.seeds.filter(seed =>
				this.selectedSeeds.has(seed.path)
			);

			// Create new note with seeds
			await this.createDocumentFromSeeds(selectedSeedNotes);

			// Close modal
			this.close();

		} catch (error) {
			// Show error message
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`Failed to create document: ${errorMessage}`);
			console.error('[GatherSeedsModal] Failed to create document:', error);
		}
	}

	/**
	 * Handle Find Centers action
	 *
	 * Calls AI service to discover centers from selected seeds,
	 * then opens CenterDiscoveryModal with results.
	 */
	private async handleFindCenters(): Promise<void> {
		// Validate AI service is available
		if (!this.aiService) {
			new Notice('AI service not available. Please configure API key in settings.');
			return;
		}

		// Validate seed selection
		if (this.selectedSeeds.size < 2) {
			new Notice('Please select at least 2 seeds to find centers');
			return;
		}

		// Get selected seed notes
		const selectedSeedNotes = this.seeds.filter(seed =>
			this.selectedSeeds.has(seed.path)
		);

		// Show loading notice
		const loadingNotice = new Notice('🎯 Discovering centers... (3-5 seconds)', 0);

		// Disable buttons during processing
		if (this.findCentersButton) {
			this.findCentersButton.setDisabled(true);
		}
		if (this.startWritingButton) {
			this.startWritingButton.setDisabled(true);
		}

		try {
			// Call AI service to find centers
			const result = await this.aiService.findCentersFromSeeds(
				selectedSeedNotes,
				this.app
			);

			// Hide loading notice
			loadingNotice.hide();

			// Group centers by strength for the modal
			const centersByStrength = {
				strong: result.centers.filter(c => c.strength === 'strong'),
				medium: result.centers.filter(c => c.strength === 'medium'),
				weak: result.centers.filter(c => c.strength === 'weak'),
			};

			// Create extended result for CenterDiscoveryModal
			const extendedResult = {
				...result,
				centersByStrength,
			};

			// Open CenterDiscoveryModal with results
			const modal = new CenterDiscoveryModal(
				this.app,
				extendedResult,
				selectedSeedNotes
			);
			modal.open();

			// Close this modal (gather seeds modal)
			this.close();

		} catch (error) {
			// Hide loading notice
			loadingNotice.hide();

			// Re-enable buttons
			this.updateActionButtons();

			// Show error message
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`❌ Failed to find centers: ${errorMessage}`, 5000);

			console.error('[GatherSeedsModal] Center discovery failed:', error);
		}
	}

	/**
	 * Create new document from selected seeds
	 *
	 * Creates a new markdown file with seeds as quoted content.
	 *
	 * @param seeds - Selected seed notes
	 */
	private async createDocumentFromSeeds(seeds: SeedNote[]): Promise<void> {
		// Generate document title
		const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		const title = `Writing from Seeds - ${timestamp}`;

		// Build document content
		let content = '---\n';
		content += 'writealive:\n';
		content += '  gathered_seeds:\n';
		seeds.forEach(seed => {
			content += `    - "${seed.path}"\n`;
		});
		content += `  gathered_at: "${new Date().toISOString()}"\n`;
		content += '---\n\n';
		content += `# ${title}\n\n`;
		content += '## Gathered Seeds\n\n';

		// Add each seed as a blockquote
		seeds.forEach(seed => {
			content += `> ${seed.excerpt || seed.title}\n`;
			content += `> — [[${seed.title}]]\n\n`;
		});

		content += '## Writing\n\n';
		content += 'What center do you see across these ideas?\n\n';

		// Create file
		const fileName = `${title}.md`;
		const file = await this.app.vault.create(fileName, content);

		// Open the new file
		const leaf = this.app.workspace.getLeaf();
		await leaf.openFile(file);

		// Show success message
		new Notice(`Created: ${title}`);
	}

	/**
	 * Refresh seeds list (reload with current filters)
	 */
	private async refreshSeeds(): Promise<void> {
		const container = this.contentEl.querySelector('.writealive-seeds-container') as HTMLElement;
		if (container) {
			await this.loadSeeds(container);
		}
	}

	/**
	 * Refresh seed list UI only (no reload)
	 */
	private refreshSeedList(container: HTMLElement): void {
		const listContainer = container.querySelector('.writealive-seeds-list') as HTMLElement;
		if (listContainer) {
			this.renderSeedList(listContainer);
		}
		this.updateActionButtons();
	}

	/**
	 * Format date for display
	 *
	 * @param timestamp - Unix timestamp
	 * @returns Formatted date string
	 */
	private formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return 'Today';
		} else if (diffDays === 1) {
			return 'Yesterday';
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else {
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
			});
		}
	}

	/**
	 * Close modal and cleanup
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.selectedSeeds.clear();
		this.seeds = [];
		this.filteredSeeds = [];
		this.tagFilterPanel = null;
		this.selectedTagFilters = [];
		this.tagFilterMode = 'any';
	}
}
