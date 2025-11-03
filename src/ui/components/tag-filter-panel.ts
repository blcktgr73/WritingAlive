/**
 * Tag Filter Panel UI Component
 *
 * Interactive tag filtering panel for Gather Seeds Modal.
 * Allows users to filter seeds by selecting multiple tags with AND/OR logic.
 *
 * Features:
 * - Tag chips with counts (e.g., "#practice (12)")
 * - Multi-select interaction (click to toggle)
 * - AND/OR mode toggle
 * - Session storage persistence
 * - Keyboard accessible (WCAG 2.1 AA)
 * - Responsive design (mobile-friendly)
 *
 * Part of T-20251103-011b: Tag Filter UI Component
 */

import type { TagStats } from '../../services/vault/tag-statistics';

/**
 * Tag Filter Change Event
 *
 * Emitted when user changes tag selection or mode.
 */
export interface TagFilterChangeEvent {
	/**
	 * Selected tag names (normalized, lowercase)
	 */
	selectedTags: string[];

	/**
	 * Filter mode (any = OR, all = AND)
	 */
	mode: 'any' | 'all';
}

/**
 * Tag Filter Panel Options
 *
 * Configuration for the tag filter panel.
 */
export interface TagFilterPanelOptions {
	/**
	 * Tag statistics to display
	 */
	tagStats: TagStats[];

	/**
	 * Callback when filter changes
	 */
	onChange: (event: TagFilterChangeEvent) => void;

	/**
	 * Maximum tags to show initially
	 * @default 15
	 */
	maxVisibleTags?: number;

	/**
	 * Enable session storage persistence
	 * @default true
	 */
	enablePersistence?: boolean;

	/**
	 * Session storage key
	 * @default 'writealive-tag-filter'
	 */
	storageKey?: string;
}

/**
 * Persisted Filter State
 */
interface FilterState {
	tags: string[];
	mode: 'any' | 'all';
}

/**
 * Tag Filter Panel Component
 *
 * Self-contained UI component for tag-based filtering.
 * Can be embedded in any parent container.
 *
 * @example
 * ```typescript
 * const panel = new TagFilterPanel(containerEl, {
 *   tagStats: stats,
 *   onChange: (event) => {
 *     console.log('Selected tags:', event.selectedTags);
 *     console.log('Mode:', event.mode);
 *   }
 * });
 *
 * panel.render();
 * ```
 */
export class TagFilterPanel {
	/**
	 * Parent container element
	 */
	private readonly containerEl: HTMLElement;

	/**
	 * Tag statistics
	 */
	private readonly tagStats: TagStats[];

	/**
	 * Change callback
	 */
	private readonly onChange: (event: TagFilterChangeEvent) => void;

	/**
	 * Maximum visible tags
	 */
	private readonly maxVisibleTags: number;

	/**
	 * Enable persistence
	 */
	private readonly enablePersistence: boolean;

	/**
	 * Storage key
	 */
	private readonly storageKey: string;

	/**
	 * Currently selected tags
	 */
	private selectedTags: Set<string> = new Set();

	/**
	 * Current filter mode
	 */
	private filterMode: 'any' | 'all' = 'any';

	/**
	 * Show all tags (expanded state)
	 */
	private showAllTags: boolean = false;

	/**
	 * Constructor
	 *
	 * @param containerEl - Parent container element
	 * @param options - Panel configuration options
	 */
	constructor(containerEl: HTMLElement, options: TagFilterPanelOptions) {
		this.containerEl = containerEl;
		this.tagStats = options.tagStats;
		this.onChange = options.onChange;
		this.maxVisibleTags = options.maxVisibleTags ?? 15;
		this.enablePersistence = options.enablePersistence ?? true;
		this.storageKey = options.storageKey ?? 'writealive-tag-filter';

		// Restore state from session storage
		if (this.enablePersistence) {
			this.restoreState();
		}
	}

	/**
	 * Render the tag filter panel
	 *
	 * Clears existing content and renders fresh UI.
	 */
	render(): void {
		// Clear existing content
		this.containerEl.innerHTML = '';

		// Add panel class for styling
		this.containerEl.classList.add('writealive-tag-filter-panel');

		// Create panel container
		const panel = this.containerEl.createDiv({ cls: 'tag-filter-panel' });

		// Render header
		this.renderHeader(panel);

		// Render mode toggle
		this.renderModeToggle(panel);

		// Render tag chips
		this.renderTagChips(panel);

		// Render footer (clear button, show all button)
		this.renderFooter(panel);
	}

	/**
	 * Render panel header
	 */
	private renderHeader(panel: HTMLElement): void {
		const header = panel.createDiv({ cls: 'tag-filter-header' });

		// Title with icon
		header.createEl('h4', {
			text: '🏷️ Filter by Tags',
			cls: 'tag-filter-title',
		});

		// Info text (selected count)
		if (this.selectedTags.size > 0) {
			const infoText =
				this.filterMode === 'all'
					? `Selected: ${Array.from(this.selectedTags).join(' AND ')}`
					: `Selected: ${Array.from(this.selectedTags).join(' OR ')}`;

			header.createDiv({
				text: infoText,
				cls: 'tag-filter-info',
			});
		}
	}

	/**
	 * Render AND/OR mode toggle
	 */
	private renderModeToggle(panel: HTMLElement): void {
		const modeToggle = panel.createDiv({ cls: 'filter-mode-toggle' });

		// ANY button (OR logic)
		const anyBtn = modeToggle.createEl('button', {
			text: 'ANY tag',
			cls: this.filterMode === 'any' ? 'mode-btn active' : 'mode-btn',
		});

		anyBtn.setAttribute('aria-pressed', (this.filterMode === 'any').toString());
		anyBtn.setAttribute('title', 'Show seeds with at least ONE selected tag (OR)');

		anyBtn.addEventListener('click', () => {
			this.filterMode = 'any';
			this.render();
			this.notifyChange();
		});

		// ALL button (AND logic)
		const allBtn = modeToggle.createEl('button', {
			text: 'ALL tags',
			cls: this.filterMode === 'all' ? 'mode-btn active' : 'mode-btn',
		});

		allBtn.setAttribute('aria-pressed', (this.filterMode === 'all').toString());
		allBtn.setAttribute('title', 'Show seeds with ALL selected tags (AND)');

		allBtn.addEventListener('click', () => {
			this.filterMode = 'all';
			this.render();
			this.notifyChange();
		});
	}

	/**
	 * Render tag chips
	 */
	private renderTagChips(panel: HTMLElement): void {
		const tagsContainer = panel.createDiv({ cls: 'tag-chips-container' });

		// Determine which tags to show
		const tagsToShow = this.showAllTags
			? this.tagStats
			: this.tagStats.slice(0, this.maxVisibleTags);

		// Render each tag chip
		for (const tagStat of tagsToShow) {
			const isSelected = this.selectedTags.has(tagStat.tag);

			const chip = tagsContainer.createDiv({
				cls: isSelected ? 'tag-chip selected' : 'tag-chip',
			});

			// Tag name
			chip.createSpan({
				text: `#${tagStat.tag}`,
				cls: 'tag-name',
			});

			// Count badge
			chip.createSpan({
				text: `${tagStat.count}`,
				cls: 'tag-count',
			});

			// Click handler
			chip.addEventListener('click', () => {
				this.toggleTag(tagStat.tag);
			});

			// Accessibility
			chip.setAttribute('role', 'button');
			chip.setAttribute('aria-pressed', isSelected.toString());
			chip.setAttribute('aria-label', `Filter by ${tagStat.tag} tag (${tagStat.count} seeds)`);
			chip.setAttribute('tabindex', '0');

			// Keyboard navigation
			chip.addEventListener('keydown', (e: KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					this.toggleTag(tagStat.tag);
				}
			});

			// Tooltip with co-occurrence info
			if (tagStat.coOccurrence.size > 0) {
				const topRelated = Array.from(tagStat.coOccurrence.entries())
					.sort(([, a], [, b]) => b - a)
					.slice(0, 3)
					.map(([tag]) => `#${tag}`)
					.join(', ');

				chip.setAttribute('title', `Often paired with: ${topRelated}`);
			}
		}

		// Empty state
		if (tagsToShow.length === 0) {
			tagsContainer.createDiv({
				text: 'No tags found in seeds',
				cls: 'tag-chips-empty',
			});
		}
	}

	/**
	 * Render footer with action buttons
	 */
	private renderFooter(panel: HTMLElement): void {
		const footer = panel.createDiv({ cls: 'tag-filter-footer' });

		// Clear filters button (only if tags selected)
		if (this.selectedTags.size > 0) {
			const clearBtn = footer.createEl('button', {
				text: 'Clear filters',
				cls: 'clear-filters-btn',
			});

			clearBtn.addEventListener('click', () => {
				this.clearFilters();
			});
		}

		// Show all tags button (only if more tags available)
		if (this.tagStats.length > this.maxVisibleTags) {
			const showAllBtn = footer.createEl('button', {
				text: this.showAllTags
					? `Show top ${this.maxVisibleTags} tags ▲`
					: `Show all ${this.tagStats.length} tags ▼`,
				cls: 'show-all-tags-btn',
			});

			showAllBtn.addEventListener('click', () => {
				this.showAllTags = !this.showAllTags;
				this.render();
			});
		}
	}

	/**
	 * Toggle tag selection
	 *
	 * @param tag - Tag to toggle
	 */
	private toggleTag(tag: string): void {
		if (this.selectedTags.has(tag)) {
			this.selectedTags.delete(tag);
		} else {
			this.selectedTags.add(tag);
		}

		// Re-render and notify
		this.render();
		this.notifyChange();
	}

	/**
	 * Clear all selected tags
	 */
	clearFilters(): void {
		this.selectedTags.clear();
		this.render();
		this.notifyChange();
	}

	/**
	 * Notify parent of filter change
	 */
	private notifyChange(): void {
		// Emit change event
		this.onChange({
			selectedTags: Array.from(this.selectedTags),
			mode: this.filterMode,
		});

		// Persist to session storage
		if (this.enablePersistence) {
			this.saveState();
		}
	}

	/**
	 * Save state to session storage
	 */
	private saveState(): void {
		const state: FilterState = {
			tags: Array.from(this.selectedTags),
			mode: this.filterMode,
		};

		try {
			sessionStorage.setItem(this.storageKey, JSON.stringify(state));
		} catch (error) {
			console.warn('Failed to save tag filter state:', error);
		}
	}

	/**
	 * Restore state from session storage
	 */
	private restoreState(): void {
		try {
			const saved = sessionStorage.getItem(this.storageKey);
			if (saved) {
				const state: FilterState = JSON.parse(saved);
				this.selectedTags = new Set(state.tags);
				this.filterMode = state.mode;
			}
		} catch (error) {
			console.warn('Failed to restore tag filter state:', error);
		}
	}

	/**
	 * Get current filter state
	 *
	 * @returns Current filter configuration
	 */
	getState(): TagFilterChangeEvent {
		return {
			selectedTags: Array.from(this.selectedTags),
			mode: this.filterMode,
		};
	}

	/**
	 * Set filter state programmatically
	 *
	 * @param tags - Tags to select
	 * @param mode - Filter mode
	 */
	setState(tags: string[], mode: 'any' | 'all'): void {
		this.selectedTags = new Set(tags);
		this.filterMode = mode;
		this.render();
		this.notifyChange();
	}

	/**
	 * Reset to initial state
	 */
	reset(): void {
		this.selectedTags.clear();
		this.filterMode = 'any';
		this.showAllTags = false;

		// Clear session storage
		if (this.enablePersistence) {
			try {
				sessionStorage.removeItem(this.storageKey);
			} catch (error) {
				console.warn('Failed to clear tag filter state:', error);
			}
		}

		this.render();
		this.notifyChange();
	}
}
