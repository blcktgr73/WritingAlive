/**
 * Center Discovery Modal
 *
 * Main modal for displaying AI-discovered centers and enabling writing.
 * Part of T-011: Center Discovery Modal feature (Phase 2).
 *
 * Design Principles:
 * - Composition: Uses smaller components (CenterCard, CostDisplay, ErrorState)
 * - Single Responsibility: Only handles modal display and user interaction
 * - Dependency Inversion: Accepts dependencies via constructor
 * - Event-driven: Uses callbacks for actions (onStartWriting)
 *
 * User Flow:
 * 1. User selects seeds and triggers center discovery
 * 2. AI returns discovered centers
 * 3. Modal displays centers grouped by strength
 * 4. User browses centers, expands details
 * 5. User clicks "Start Writing" on chosen center
 * 6. DocumentCreator creates note, modal closes
 * 7. Success notice shown to user
 *
 * Features:
 * - Grouped centers by strength (strong, medium, weak)
 * - Collapsible weak centers section
 * - Cost information in footer
 * - Error handling with recovery options
 * - Accessibility support (ARIA, keyboard navigation)
 */

import { Modal, App, Notice } from 'obsidian';
import type { DiscoveredCenter } from '../../services/ai/types';
import type { SeedNote } from '../../services/vault/types';
import { CenterCard } from './components/center-card';
import { CostDisplay } from './components/cost-display';
import { ErrorState, type ErrorAction } from './components/error-state';
import { DocumentCreator } from '../../services/vault/document-creator';
import { pluralize } from './utils/formatters';

/**
 * Center Finding Result (Extended)
 *
 * This extends the base CenterFindingResult with grouped centers.
 * Note: The actual AIService should return this structure.
 */
export interface CenterFindingResult {
	/**
	 * All discovered centers
	 */
	centers: DiscoveredCenter[];

	/**
	 * Centers grouped by strength
	 */
	centersByStrength: {
		strong: DiscoveredCenter[];
		medium: DiscoveredCenter[];
		weak: DiscoveredCenter[];
	};

	/**
	 * Token usage statistics
	 */
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};

	/**
	 * Estimated cost in USD
	 */
	estimatedCost: number;

	/**
	 * Provider used
	 */
	provider: 'claude' | 'gpt' | 'gemini';

	/**
	 * Whether this was a cached request
	 */
	cached?: boolean;

	/**
	 * Timestamp
	 */
	timestamp?: string;
}

/**
 * CenterDiscoveryModal
 *
 * Main modal for displaying discovered centers and initiating writing.
 */
export class CenterDiscoveryModal extends Modal {
	private result: CenterFindingResult;
	private seeds: SeedNote[];
	private onStartWriting?: (center: DiscoveredCenter) => void;
	private documentCreator: DocumentCreator;
	private weakCentersExpanded: boolean = false;

	/**
	 * Constructor
	 *
	 * @param app - Obsidian App instance
	 * @param result - AI center discovery results
	 * @param seeds - Original seed notes that were analyzed
	 * @param onStartWriting - Optional callback when user starts writing
	 */
	constructor(
		app: App,
		result: CenterFindingResult,
		seeds: SeedNote[],
		onStartWriting?: (center: DiscoveredCenter) => void
	) {
		super(app);
		this.result = result;
		this.seeds = seeds;
		this.onStartWriting = onStartWriting;
		this.documentCreator = new DocumentCreator(app);
	}

	/**
	 * Open modal and render content
	 *
	 * Called automatically when modal.open() is invoked.
	 */
	onOpen(): void {
		const { contentEl } = this;

		// Add modal class for styling
		this.modalEl.addClass('center-discovery-modal');

		// Check if we have centers to display
		if (!this.result.centers || this.result.centers.length === 0) {
			this.renderError(contentEl, 'NO_CENTERS_FOUND');
			return;
		}

		// Check if only weak centers
		const { strong, medium, weak } = this.result.centersByStrength;
		if (strong.length === 0 && medium.length === 0 && weak.length > 0) {
			this.renderError(contentEl, 'ONLY_WEAK_CENTERS');
			return;
		}

		// Render normal modal with centers
		this.renderHeader(contentEl);
		this.renderCenters(contentEl);
		this.renderFooter(contentEl);
	}

	/**
	 * Close modal and cleanup
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Render modal header
	 *
	 * Shows title with seed count.
	 */
	private renderHeader(container: HTMLElement): void {
		const header = container.createDiv('center-discovery-modal__header');

		const seedCount = this.seeds.length;
		header.createEl('h2', {
			cls: 'center-discovery-modal__title',
			text: `🎯 Centers Discovered (from ${seedCount} ${pluralize(
				seedCount,
				'seed'
			)})`,
		});
	}

	/**
	 * Render centers grouped by strength
	 *
	 * Shows:
	 * - Strong centers (always visible)
	 * - Medium centers (always visible)
	 * - Weak centers (collapsible)
	 */
	private renderCenters(container: HTMLElement): void {
		const centersContainer = container.createDiv('center-discovery-modal__body');

		const { strong, medium, weak } = this.result.centersByStrength;

		// Render strong centers
		if (strong.length > 0) {
			this.renderCenterGroup(
				centersContainer,
				'Strong Centers',
				strong,
				'strong',
				true
			);
		}

		// Render medium centers
		if (medium.length > 0) {
			this.renderCenterGroup(
				centersContainer,
				'Medium Centers',
				medium,
				'medium',
				true
			);
		}

		// Render weak centers (collapsible)
		if (weak.length > 0) {
			this.renderCenterGroup(
				centersContainer,
				'Weak Centers',
				weak,
				'weak',
				false
			);
		}
	}

	/**
	 * Render a group of centers with heading
	 *
	 * @param container - Container to render into
	 * @param title - Group heading
	 * @param centers - Centers in this group
	 * @param strength - Strength level
	 * @param expanded - Whether initially expanded (for weak centers)
	 */
	private renderCenterGroup(
		container: HTMLElement,
		title: string,
		centers: DiscoveredCenter[],
		strength: 'strong' | 'medium' | 'weak',
		expanded: boolean
	): void {
		const group = container.createDiv(
			`center-discovery-modal__group center-discovery-modal__group--${strength}`
		);

		// Group header
		const header = group.createDiv('center-discovery-modal__group-header');

		header.createEl('h3', {
			cls: 'center-discovery-modal__group-title',
			text: title,
		});

		header.createSpan({
			cls: 'center-discovery-modal__group-count',
			text: `${centers.length}`,
		});

		// For weak centers, add toggle
		if (strength === 'weak') {
			const toggleButton = header.createEl('button', {
				cls: 'center-discovery-modal__group-toggle',
				text: expanded ? 'Hide' : 'Show',
				attr: {
					type: 'button',
					'aria-expanded': String(expanded),
					'aria-controls': 'weak-centers-list',
				},
			});

			const centersContainer = group.createDiv({
				cls: 'center-discovery-modal__group-centers',
				attr: { id: 'weak-centers-list' },
			});

			centersContainer.style.display = expanded ? 'block' : 'none';

			// Render centers
			this.renderCenterCards(centersContainer, centers);

			// Toggle handler
			toggleButton.addEventListener('click', () => {
				this.weakCentersExpanded = !this.weakCentersExpanded;
				centersContainer.style.display = this.weakCentersExpanded
					? 'block'
					: 'none';
				toggleButton.setText(this.weakCentersExpanded ? 'Hide' : 'Show');
				toggleButton.setAttribute(
					'aria-expanded',
					String(this.weakCentersExpanded)
				);
			});
		} else {
			// For strong/medium, always show
			const centersContainer = group.createDiv(
				'center-discovery-modal__group-centers'
			);
			this.renderCenterCards(centersContainer, centers);
		}
	}

	/**
	 * Render individual center cards
	 *
	 * @param container - Container to render into
	 * @param centers - Centers to render
	 * @param strength - Strength level
	 */
	private renderCenterCards(
		container: HTMLElement,
		centers: DiscoveredCenter[]
	): void {
		// Find strongest center (first strong center, or first if no strong)
		const strongestCenter =
			this.result.centersByStrength.strong[0] || this.result.centers[0];

		for (const center of centers) {
			// Get connected seed titles
			const connectedSeedTitles = this.getConnectedSeedTitles(center);

			// Determine if this is the strongest/recommended center
			const isStrongest = center === strongestCenter;

			// Create card
			const card = new CenterCard(
				center,
				connectedSeedTitles,
				isStrongest,
				(selectedCenter) => this.handleStartWriting(selectedCenter)
			);

			card.render(container);
		}
	}

	/**
	 * Get titles of seeds connected to this center
	 *
	 * @param center - Center to get connected seeds for
	 * @returns Array of seed titles
	 */
	private getConnectedSeedTitles(center: DiscoveredCenter): string[] {
		const titles: string[] = [];

		for (const seedId of center.connectedSeeds) {
			// Find seed by ID (seed IDs are indices in the seeds array)
			// Format: 'seed-0', 'seed-1', etc.
			const index = parseInt(seedId.replace('seed-', ''), 10);
			if (!isNaN(index) && index >= 0 && index < this.seeds.length) {
				titles.push(this.seeds[index].title);
			}
		}

		return titles;
	}

	/**
	 * Render modal footer
	 *
	 * Shows cost information and action buttons.
	 */
	private renderFooter(container: HTMLElement): void {
		const footer = container.createDiv('center-discovery-modal__footer');

		// Cost display
		const costDisplay = CostDisplay.fromResult(
			this.result.usage,
			this.result.estimatedCost,
			this.result.provider,
			this.result.cached || false
		);

		costDisplay.render(footer);

		// Action buttons
		const actions = footer.createDiv('center-discovery-modal__actions');

		// Cancel button
		const cancelButton = actions.createEl('button', {
			cls: 'center-discovery-modal__action center-discovery-modal__action--secondary',
			text: 'Cancel',
			attr: { type: 'button' },
		});

		cancelButton.addEventListener('click', () => {
			this.close();
		});

		// Optional: Save centers to note (future feature)
		// For now, we'll keep it simple with just Cancel
	}

	/**
	 * Handle "Start Writing" action
	 *
	 * Creates a new note from the selected center.
	 *
	 * @param center - Center to start writing from
	 */
	private async handleStartWriting(center: DiscoveredCenter): Promise<void> {
		try {
			// Call custom callback if provided
			if (this.onStartWriting) {
				this.onStartWriting(center);
			}

			// Create note using DocumentCreator
			const file = await this.documentCreator.createNoteFromCenter(
				center,
				this.seeds
			);

			// Show success notice
			new Notice(`Created: ${file.basename}`);

			// Close modal
			this.close();
		} catch (error) {
			console.error('Failed to create note from center:', error);

			// Show error notice
			new Notice(
				`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Render error state
	 *
	 * @param container - Container to render into
	 * @param code - Error code
	 */
	private renderError(
		container: HTMLElement,
		code: 'NO_CENTERS_FOUND' | 'ONLY_WEAK_CENTERS'
	): void {
		const errorState = ErrorState.create(code, (action) =>
			this.handleErrorAction(action)
		);

		errorState.render(container);
	}

	/**
	 * Handle error recovery actions
	 *
	 * @param action - Action to perform
	 */
	private handleErrorAction(action: ErrorAction): void {
		switch (action.type) {
			case 'close':
				this.close();
				break;

			case 'retry':
				// Close and let user try again
				this.close();
				new Notice('Please try again with different seeds');
				break;

			case 'add-seeds':
				// Close and return to seed selection
				this.close();
				new Notice('Please select more or different seeds');
				break;

			case 'help':
				// Open help documentation
				window.open(
					'https://github.com/yourusername/writealive#centers',
					'_blank'
				);
				break;

			case 'settings':
				// Close modal and open settings
				this.close();
				// Note: Settings opening should be handled by the plugin
				// This is just a placeholder
				new Notice('Please check plugin settings');
				break;

			default:
				console.warn('Unknown error action:', action.type);
		}
	}
}
