/**
 * CenterCard Component for Center Discovery Modal
 *
 * Displays a discovered center with all metadata, assessment, and actions.
 * Follows Component Pattern with encapsulated state and rendering.
 *
 * Design Principles:
 * - Self-contained component (manages own DOM and state)
 * - Progressive disclosure (expandable sections)
 * - Visual hierarchy (strength-based styling)
 * - Accessibility (ARIA labels, keyboard navigation)
 *
 * Features:
 * - Strength badges with visual differentiation
 * - Expandable connected seeds list
 * - Expandable assessment criteria
 * - Recommendation badge for strongest center
 * - Action buttons (Start Writing, Learn More)
 *
 * Styling:
 * - Strong centers: Gold border, larger, drop shadow
 * - Medium centers: Blue-gray border
 * - Weak centers: Gray border, 80% opacity
 * - Hover effects for interactivity
 */

import type { DiscoveredCenter } from '../../../services/ai/types';
import { formatStrength, pluralize } from '../utils/formatters';

/**
 * CenterCard Component
 *
 * Renders a single discovered center with all UI elements.
 */
export class CenterCard {
	private center: DiscoveredCenter;
	private connectedSeedTitles: string[];
	private isStrongest: boolean;
	private onStartWriting: (center: DiscoveredCenter) => void;
	private isExpanded: boolean = false;
	private cardElement?: HTMLElement;

	/**
	 * Constructor
	 *
	 * @param center - Discovered center data
	 * @param connectedSeedTitles - Titles of connected seed notes
	 * @param isStrongest - Whether this is the strongest/recommended center
	 * @param onStartWriting - Callback when "Start Writing" clicked
	 */
	constructor(
		center: DiscoveredCenter,
		connectedSeedTitles: string[],
		isStrongest: boolean,
		onStartWriting: (center: DiscoveredCenter) => void
	) {
		this.center = center;
		this.connectedSeedTitles = connectedSeedTitles;
		this.isStrongest = isStrongest;
		this.onStartWriting = onStartWriting;
	}

	/**
	 * Render center card into container
	 *
	 * Creates complete card structure with all UI elements.
	 *
	 * @param container - DOM element to render into
	 * @returns The created card element
	 */
	render(container: HTMLElement): HTMLElement {
		const card = container.createDiv(
			`center-card center-card--${this.center.strength}`
		);
		this.cardElement = card;

		// Add data attribute for testing/debugging
		card.setAttribute('data-center-id', this.center.name);
		card.setAttribute('role', 'article');
		card.setAttribute('aria-label', `Center: ${this.center.name}`);

		// Header section (badges + name)
		this.renderHeader(card);

		// Explanation
		this.renderExplanation(card);

		// Connected seeds
		this.renderConnectedSeeds(card);

		// Assessment criteria (initially hidden)
		this.renderAssessment(card);

		// Action buttons
		this.renderActions(card);

		return card;
	}

	/**
	 * Render header section
	 *
	 * Includes:
	 * - Strength badge
	 * - Recommendation badge (if applicable)
	 * - Center name
	 */
	private renderHeader(card: HTMLElement): void {
		const header = card.createDiv('center-card__header');

		// Badges container
		const badges = header.createDiv('center-card__badges');

		// Strength badge
		const strengthBadge = badges.createDiv(
			`center-card__badge center-card__badge--strength-${this.center.strength}`
		);
		strengthBadge.setText(formatStrength(this.center.strength));
		strengthBadge.setAttribute('aria-label', `Strength: ${this.center.strength}`);

		// Recommendation badge (only for strongest)
		if (this.isStrongest) {
			const recBadge = badges.createDiv(
				'center-card__badge center-card__badge--recommendation'
			);
			recBadge.setText('💡 Start Here');
			recBadge.setAttribute('aria-label', 'Recommended starting point');
		}

		// Center name
		header.createEl('h3', {
			cls: 'center-card__name',
			text: this.center.name,
		});
	}

	/**
	 * Render explanation section
	 */
	private renderExplanation(card: HTMLElement): void {
		card.createEl('p', {
			cls: 'center-card__explanation',
			text: this.center.explanation,
		});
	}

	/**
	 * Render connected seeds section
	 *
	 * Shows seed count with expandable list.
	 */
	private renderConnectedSeeds(card: HTMLElement): void {
		const seedsSection = card.createDiv('center-card__seeds');

		// Summary line (always visible)
		const seedsSummary = seedsSection.createDiv('center-card__seeds-summary');

		const seedCount = this.connectedSeedTitles.length;
		const seedText = `Connects ${seedCount} ${pluralize(seedCount, 'seed')}`;

		seedsSummary.createSpan({
			cls: 'center-card__seeds-count',
			text: seedText,
		});

		// Toggle button
		if (seedCount > 0) {
			const toggleButton = seedsSummary.createEl('button', {
				cls: 'center-card__toggle',
				text: 'Show',
				attr: {
					type: 'button',
					'aria-expanded': 'false',
					'aria-controls': `seeds-list-${this.center.name}`,
				},
			});

			// Seeds list (initially hidden)
			const seedsList = seedsSection.createDiv('center-card__seeds-list');
			seedsList.setAttribute('id', `seeds-list-${this.center.name}`);
			seedsList.style.display = 'none';

			const list = seedsList.createEl('ul');
			for (const seedTitle of this.connectedSeedTitles) {
				list.createEl('li', { text: seedTitle });
			}

			// Toggle handler
			toggleButton.addEventListener('click', () => {
				const isExpanded = seedsList.style.display !== 'none';
				seedsList.style.display = isExpanded ? 'none' : 'block';
				toggleButton.setText(isExpanded ? 'Show' : 'Hide');
				toggleButton.setAttribute('aria-expanded', String(!isExpanded));
			});
		}
	}

	/**
	 * Render assessment criteria section
	 *
	 * Shows the 4 structural assessment criteria with checkmarks.
	 * Initially hidden, expandable via "Learn More" button.
	 */
	private renderAssessment(card: HTMLElement): void {
		const assessment = card.createDiv('center-card__assessment');
		assessment.style.display = 'none';
		assessment.setAttribute('id', `assessment-${this.center.name}`);

		assessment.createEl('h4', {
			cls: 'center-card__assessment-title',
			text: 'Assessment Criteria',
		});

		const criteria = assessment.createDiv('center-card__criteria');

		// Define criteria with labels
		const criteriaItems = [
			{
				key: 'crossDomain' as const,
				label: 'Cross-domain presence',
				description: 'Appears across multiple contexts',
			},
			{
				key: 'emotionalResonance' as const,
				label: 'Emotional resonance',
				description: 'You express emotional connection',
			},
			{
				key: 'hasConcrete' as const,
				label: 'Concrete experience',
				description: 'You have lived experience with this',
			},
			{
				key: 'structuralPivot' as const,
				label: 'Structural pivot',
				description: 'Can expand in multiple directions',
			},
		];

		for (const item of criteriaItems) {
			const criterionEl = criteria.createDiv('center-card__criterion');

			const value = this.center.assessment[item.key];
			const icon = value ? '✅' : '❌';

			criterionEl.createSpan({
				cls: 'center-card__criterion-icon',
				text: icon,
				attr: { 'aria-label': value ? 'Yes' : 'No' },
			});

			criterionEl.createSpan({
				cls: 'center-card__criterion-label',
				text: item.label,
			});

			// Add tooltip/description
			criterionEl.setAttribute('title', item.description);
		}
	}

	/**
	 * Render action buttons
	 *
	 * - "Start Writing" (primary action)
	 * - "Learn More" (toggle assessment section)
	 */
	private renderActions(card: HTMLElement): void {
		const actions = card.createDiv('center-card__actions');

		// "Start Writing" button
		const startButton = actions.createEl('button', {
			cls: 'center-card__action center-card__action--primary',
			text: 'Start Writing',
			attr: {
				type: 'button',
				'aria-label': `Start writing about ${this.center.name}`,
			},
		});

		startButton.addEventListener('click', () => {
			this.onStartWriting(this.center);
		});

		// "Learn More" button (toggles assessment)
		const learnMoreButton = actions.createEl('button', {
			cls: 'center-card__action center-card__action--secondary',
			text: 'Learn More',
			attr: {
				type: 'button',
				'aria-expanded': 'false',
				'aria-controls': `assessment-${this.center.name}`,
			},
		});

		learnMoreButton.addEventListener('click', () => {
			this.isExpanded = !this.isExpanded;
			this.setExpanded(this.isExpanded);
		});
	}

	/**
	 * Toggle expanded state
	 *
	 * Shows/hides assessment criteria section.
	 *
	 * @param expanded - Whether to expand or collapse
	 */
	setExpanded(expanded: boolean): void {
		this.isExpanded = expanded;

		if (!this.cardElement) {
			return;
		}

		const assessmentSection = this.cardElement.querySelector(
			'.center-card__assessment'
		) as HTMLElement;
		const learnMoreButton = this.cardElement.querySelector(
			'.center-card__action--secondary'
		) as HTMLElement;

		if (assessmentSection && learnMoreButton) {
			assessmentSection.style.display = expanded ? 'block' : 'none';
			learnMoreButton.setText(expanded ? 'Show Less' : 'Learn More');
			learnMoreButton.setAttribute('aria-expanded', String(expanded));
		}
	}

	/**
	 * Get center data
	 *
	 * @returns The center this card represents
	 */
	getCenter(): DiscoveredCenter {
		return this.center;
	}
}
