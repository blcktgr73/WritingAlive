/**
 * Related Seeds Panel UI Component
 *
 * Displays relationship information for a selected seed note.
 * Shows backlinks, wikilinks, and shared tag connections.
 *
 * Features:
 * - Desktop: Sidebar panel (30% width, always visible)
 * - Mobile: Inline expansion (tap to show/hide)
 * - Lazy loading (only process visible seeds)
 * - Relationship strength indicators
 * - Click to highlight related seeds in main list
 * - Keyboard accessible (WCAG 2.1 AA)
 *
 * Part of T-20251103-012b: Related Seeds UI
 */

import type { SeedNote, SeedRelationshipsResult, SeedRelationship } from '../../services/vault/types';
import type { RelationshipDetector } from '../../services/vault/relationship-detector';

/**
 * Related Seeds Panel Options
 *
 * Configuration for the related seeds panel.
 */
export interface RelatedSeedsPanelOptions {
	/**
	 * Relationship detector service
	 */
	relationshipDetector: RelationshipDetector;

	/**
	 * All available seeds for relationship detection
	 */
	allSeeds: SeedNote[];

	/**
	 * Callback when a related seed is clicked
	 * Can be used to highlight or navigate to the seed
	 */
	onRelatedSeedClick?: (seed: SeedNote) => void;

	/**
	 * Display mode
	 * - 'sidebar': Desktop sidebar (always visible)
	 * - 'inline': Mobile inline (expandable)
	 * @default 'sidebar'
	 */
	displayMode?: 'sidebar' | 'inline';

	/**
	 * Maximum relationships to show per type
	 * @default 10
	 */
	maxRelationshipsPerType?: number;
}

/**
 * Related Seeds Panel Component
 *
 * Self-contained UI component for displaying seed relationships.
 * Can be embedded in GatherSeedsModal or other containers.
 *
 * @example
 * ```typescript
 * const panel = new RelatedSeedsPanel(containerEl, {
 *   relationshipDetector: detector,
 *   allSeeds: seeds,
 *   onRelatedSeedClick: (seed) => {
 *     highlightSeed(seed.path);
 *   }
 * });
 *
 * panel.showRelationships(selectedSeed);
 * ```
 */
export class RelatedSeedsPanel {
	/**
	 * Parent container element
	 */
	private readonly containerEl: HTMLElement;

	/**
	 * Relationship detector service
	 */
	private readonly relationshipDetector: RelationshipDetector;

	/**
	 * All available seeds
	 */
	private allSeeds: SeedNote[];

	/**
	 * Click callback
	 */
	private readonly onRelatedSeedClick?: (seed: SeedNote) => void;

	/**
	 * Display mode
	 */
	private readonly displayMode: 'sidebar' | 'inline';

	/**
	 * Maximum relationships per type
	 */
	private readonly maxRelationshipsPerType: number;

	/**
	 * Currently displayed relationships
	 */
	private currentRelationships: SeedRelationshipsResult | null = null;

	/**
	 * Expanded state (for inline mode)
	 */
	private isExpanded: boolean = false;

	/**
	 * Constructor
	 *
	 * @param containerEl - Parent container element
	 * @param options - Panel configuration options
	 */
	constructor(containerEl: HTMLElement, options: RelatedSeedsPanelOptions) {
		this.containerEl = containerEl;
		this.relationshipDetector = options.relationshipDetector;
		this.allSeeds = options.allSeeds;
		this.onRelatedSeedClick = options.onRelatedSeedClick;
		this.displayMode = options.displayMode ?? 'sidebar';
		this.maxRelationshipsPerType = options.maxRelationshipsPerType ?? 10;
	}

	/**
	 * Show relationships for a seed
	 *
	 * Detects and displays all relationships for the given seed.
	 *
	 * @param seed - Seed to show relationships for
	 */
	showRelationships(seed: SeedNote): void {
		// Detect relationships
		this.currentRelationships = this.relationshipDetector.detectRelationships(
			seed,
			this.allSeeds
		);

		// Render panel
		this.render();
	}

	/**
	 * Update available seeds
	 *
	 * Call this when the seed list changes (e.g., after filtering).
	 *
	 * @param seeds - Updated seed list
	 */
	updateSeeds(seeds: SeedNote[]): void {
		this.allSeeds = seeds;

		// Re-detect relationships if currently showing
		if (this.currentRelationships) {
			this.showRelationships(this.currentRelationships.sourceSeed);
		}
	}

	/**
	 * Hide the panel
	 *
	 * Clears the display and resets state.
	 */
	hide(): void {
		this.currentRelationships = null;
		this.isExpanded = false;
		this.containerEl.empty();
	}

	/**
	 * Render the panel
	 *
	 * Renders based on display mode (sidebar or inline).
	 */
	private render(): void {
		// Clear existing content
		this.containerEl.empty();

		// No relationships to show
		if (!this.currentRelationships) {
			return;
		}

		// Add panel class
		this.containerEl.classList.add('writealive-related-seeds-panel');
		this.containerEl.classList.add(`mode-${this.displayMode}`);

		// Create panel container
		const panel = this.containerEl.createDiv({ cls: 'related-seeds-panel' });

		// Render header
		this.renderHeader(panel);

		// Render content (only if expanded in inline mode, or always in sidebar mode)
		if (this.displayMode === 'sidebar' || this.isExpanded) {
			this.renderContent(panel);
		}
	}

	/**
	 * Render panel header
	 */
	private renderHeader(panel: HTMLElement): void {
		const header = panel.createDiv({ cls: 'related-seeds-header' });

		// Title
		const titleDiv = header.createDiv({ cls: 'related-seeds-title' });

		titleDiv.createEl('h4', {
			text: '🔗 Related Seeds',
		});

		// Count badge
		const count = this.currentRelationships?.totalCount ?? 0;
		if (count > 0) {
			titleDiv.createSpan({
				text: `${count}`,
				cls: 'related-count-badge',
			});
		}

		// Expand/collapse button (inline mode only)
		if (this.displayMode === 'inline') {
			const toggleBtn = header.createEl('button', {
				cls: 'toggle-expand-btn',
				attr: {
					'aria-expanded': this.isExpanded.toString(),
					'aria-label': this.isExpanded ? 'Collapse related seeds' : 'Expand related seeds',
				},
			});

			toggleBtn.textContent = this.isExpanded ? '▲' : '▼';

			toggleBtn.addEventListener('click', () => {
				this.isExpanded = !this.isExpanded;
				this.render();
			});
		}
	}

	/**
	 * Render panel content
	 */
	private renderContent(panel: HTMLElement): void {
		if (!this.currentRelationships) {
			return;
		}

		const content = panel.createDiv({ cls: 'related-seeds-content' });

		// Empty state
		if (this.currentRelationships.totalCount === 0) {
			content.createDiv({
				text: 'No relationships found',
				cls: 'related-seeds-empty',
			});
			return;
		}

		// Render relationship sections
		this.renderRelationshipSection(
			content,
			'Backlinks',
			'🔙',
			this.currentRelationships.backlinks,
			'Notes that link TO this seed'
		);

		this.renderRelationshipSection(
			content,
			'Outgoing Links',
			'🔗',
			this.currentRelationships.wikilinks,
			'Notes this seed links TO'
		);

		this.renderRelationshipSection(
			content,
			'Shared Tags',
			'🏷️',
			this.currentRelationships.sharedTags,
			'Seeds with common tags'
		);
	}

	/**
	 * Render a relationship section
	 *
	 * @param container - Container element
	 * @param title - Section title
	 * @param icon - Section icon
	 * @param relationships - Relationships to display
	 * @param description - Section description
	 */
	private renderRelationshipSection(
		container: HTMLElement,
		title: string,
		icon: string,
		relationships: SeedRelationship[],
		description: string
	): void {
		// Skip empty sections
		if (relationships.length === 0) {
			return;
		}

		const section = container.createDiv({ cls: 'relationship-section' });

		// Section header
		const sectionHeader = section.createDiv({ cls: 'section-header' });

		sectionHeader.createEl('h5', {
			text: `${icon} ${title} (${relationships.length})`,
		});

		sectionHeader.createDiv({
			text: description,
			cls: 'section-description',
		});

		// Relationship list
		const listContainer = section.createDiv({ cls: 'relationship-list' });

		// Limit to max per type
		const displayRelationships = relationships.slice(0, this.maxRelationshipsPerType);

		for (const rel of displayRelationships) {
			this.renderRelationshipItem(listContainer, rel);
		}

		// Show more indicator
		if (relationships.length > this.maxRelationshipsPerType) {
			const moreCount = relationships.length - this.maxRelationshipsPerType;
			listContainer.createDiv({
				text: `+ ${moreCount} more`,
				cls: 'show-more-indicator',
			});
		}
	}

	/**
	 * Render a single relationship item
	 *
	 * @param container - Container element
	 * @param relationship - Relationship to render
	 */
	private renderRelationshipItem(
		container: HTMLElement,
		relationship: SeedRelationship
	): void {
		const item = container.createDiv({ cls: 'relationship-item' });

		// Make clickable
		item.classList.add('clickable');
		item.setAttribute('role', 'button');
		item.setAttribute('tabindex', '0');
		item.setAttribute('aria-label', `Related seed: ${relationship.seed.title}`);

		// Strength indicator
		const strengthBar = item.createDiv({ cls: 'strength-indicator' });
		const strengthPercent = Math.round(relationship.strength * 100);
		strengthBar.style.width = `${strengthPercent}%`;

		// Strength class for color
		if (relationship.strength >= 0.8) {
			strengthBar.classList.add('strength-high');
		} else if (relationship.strength >= 0.5) {
			strengthBar.classList.add('strength-medium');
		} else {
			strengthBar.classList.add('strength-low');
		}

		// Content area
		const contentArea = item.createDiv({ cls: 'item-content' });

		// Title
		contentArea.createEl('div', {
			text: relationship.seed.title,
			cls: 'item-title',
		});

		// Relationship type badge
		contentArea.createSpan({
			text: this.getTypeLabel(relationship.type),
			cls: `type-badge type-${relationship.type}`,
		});

		// Context (if available)
		if (relationship.context && relationship.context.length > 0) {
			const contextDiv = contentArea.createDiv({ cls: 'item-context' });
			const contextText = relationship.context.join(', ');
			contextDiv.textContent = contextText;
		}

		// Excerpt
		if (relationship.seed.excerpt) {
			contentArea.createDiv({
				text: relationship.seed.excerpt,
				cls: 'item-excerpt',
			});
		}

		// Click handler
		item.addEventListener('click', () => {
			if (this.onRelatedSeedClick) {
				this.onRelatedSeedClick(relationship.seed);
			}
		});

		// Keyboard handler
		item.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (this.onRelatedSeedClick) {
					this.onRelatedSeedClick(relationship.seed);
				}
			}
		});
	}

	/**
	 * Get human-readable label for relationship type
	 *
	 * @param type - Relationship type
	 * @returns Label text
	 */
	private getTypeLabel(type: string): string {
		switch (type) {
			case 'bidirectional':
				return '↔️ Mutual';
			case 'backlink':
				return '← Links here';
			case 'wikilink':
				return '→ Links to';
			case 'shared-tag':
				return '🏷️ Tags';
			default:
				return type;
		}
	}

	/**
	 * Get current state
	 *
	 * @returns Current relationships or null
	 */
	getState(): SeedRelationshipsResult | null {
		return this.currentRelationships;
	}

	/**
	 * Check if panel is currently showing relationships
	 *
	 * @returns true if showing relationships
	 */
	isShowing(): boolean {
		return this.currentRelationships !== null;
	}
}
