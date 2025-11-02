/**
 * CostDisplay Component for Center Discovery Modal
 *
 * Displays AI usage cost information with expandable breakdown.
 * Follows Component Pattern with progressive disclosure.
 *
 * Design Principles:
 * - Transparency: Show all cost information clearly
 * - Progressive disclosure: Summary visible, details on-demand
 * - User education: Help users understand AI costs
 * - Visual feedback: Smooth animations for expand/collapse
 *
 * Features:
 * - Summary line with key metrics (tokens, cost, provider)
 * - Cached indicator (when using cached results)
 * - Expandable breakdown (input/output token split)
 * - Smooth expand/collapse animation
 */

import { formatCost, formatTokens, formatProvider } from '../utils/formatters';

/**
 * CostDisplay Component
 *
 * Renders AI cost information with expandable details.
 */
export class CostDisplay {
	private promptTokens: number;
	private completionTokens: number;
	private totalTokens: number;
	private estimatedCost: number;
	private provider: 'claude' | 'gpt' | 'gemini';
	private isCached: boolean;
	private isExpanded: boolean = false;
	private displayElement?: HTMLElement;

	/**
	 * Constructor
	 *
	 * @param promptTokens - Input tokens used
	 * @param completionTokens - Output tokens generated
	 * @param totalTokens - Total tokens (prompt + completion)
	 * @param estimatedCost - Estimated cost in USD
	 * @param provider - AI provider used
	 * @param isCached - Whether this was a cached request
	 */
	constructor(
		promptTokens: number,
		completionTokens: number,
		totalTokens: number,
		estimatedCost: number,
		provider: 'claude' | 'gpt' | 'gemini',
		isCached: boolean = false
	) {
		this.promptTokens = promptTokens;
		this.completionTokens = completionTokens;
		this.totalTokens = totalTokens;
		this.estimatedCost = estimatedCost;
		this.provider = provider;
		this.isCached = isCached;
	}

	/**
	 * Factory method: Create from CenterFindingResult
	 *
	 * Convenience method for creating from AI result object.
	 *
	 * @param usage - Usage data from AI result
	 * @param provider - Provider used
	 * @param isCached - Whether cached
	 * @returns CostDisplay instance
	 */
	static fromResult(
		usage: {
			promptTokens: number;
			completionTokens: number;
			totalTokens: number;
		},
		estimatedCost: number,
		provider: 'claude' | 'gpt' | 'gemini',
		isCached: boolean = false
	): CostDisplay {
		return new CostDisplay(
			usage.promptTokens,
			usage.completionTokens,
			usage.totalTokens,
			estimatedCost,
			provider,
			isCached
		);
	}

	/**
	 * Render cost display into container
	 *
	 * Creates:
	 * - Summary line (always visible)
	 * - Cached indicator (if applicable)
	 * - Expandable breakdown (hidden by default)
	 *
	 * @param container - DOM element to render into
	 * @returns The created display element
	 */
	render(container: HTMLElement): HTMLElement {
		const display = container.createDiv('cost-display');
		this.displayElement = display;

		// Summary line
		this.renderSummary(display);

		// Cached indicator
		if (this.isCached) {
			this.renderCachedIndicator(display);
		}

		// Expandable breakdown
		this.renderBreakdown(display);

		return display;
	}

	/**
	 * Render summary line
	 *
	 * Format: "Used 1,670 tokens • $0.015 • Claude 3.5 Sonnet"
	 */
	private renderSummary(display: HTMLElement): void {
		const summary = display.createDiv('cost-display__summary');
		summary.setAttribute('role', 'button');
		summary.setAttribute('tabindex', '0');
		summary.setAttribute('aria-expanded', 'false');
		summary.setAttribute('aria-label', 'AI usage cost information. Click to see breakdown.');

		// Build summary text
		const parts = [
			`Used ${formatTokens(this.totalTokens)} tokens`,
			formatCost(this.estimatedCost),
			formatProvider(this.provider),
		];

		summary.setText(parts.join(' • '));

		// Add expand icon
		const icon = summary.createSpan('cost-display__icon');
		icon.setText('▼');

		// Click handler for expand/collapse
		summary.addEventListener('click', () => {
			this.toggleExpanded();
		});

		// Keyboard accessibility
		summary.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.toggleExpanded();
			}
		});

		// Hover effect
		summary.addClass('cost-display__summary--interactive');
	}

	/**
	 * Render cached indicator
	 *
	 * Shows when results were cached (no cost).
	 */
	private renderCachedIndicator(display: HTMLElement): void {
		const indicator = display.createDiv('cost-display__cached');
		indicator.setText('✅ Cached (no cost)');
		indicator.setAttribute(
			'aria-label',
			'This request used cached results and did not incur any cost'
		);
	}

	/**
	 * Render expandable breakdown
	 *
	 * Shows detailed token and cost breakdown.
	 * Initially hidden, revealed on click.
	 */
	private renderBreakdown(display: HTMLElement): void {
		const breakdown = display.createDiv('cost-display__breakdown');
		breakdown.style.display = 'none';
		breakdown.setAttribute('aria-hidden', 'true');

		// Calculate individual costs
		const inputCost = this.estimatedCost * (this.promptTokens / this.totalTokens);
		const outputCost = this.estimatedCost * (this.completionTokens / this.totalTokens);

		// Create table structure
		const table = breakdown.createEl('table', {
			cls: 'cost-display__table',
		});

		// Table body
		const tbody = table.createEl('tbody');

		// Input tokens row
		const inputRow = tbody.createEl('tr');
		inputRow.createEl('td', {
			text: 'Input tokens',
			cls: 'cost-display__label',
		});
		inputRow.createEl('td', {
			text: formatTokens(this.promptTokens),
			cls: 'cost-display__value',
		});
		inputRow.createEl('td', {
			text: formatCost(inputCost),
			cls: 'cost-display__cost',
		});

		// Output tokens row
		const outputRow = tbody.createEl('tr');
		outputRow.createEl('td', {
			text: 'Output tokens',
			cls: 'cost-display__label',
		});
		outputRow.createEl('td', {
			text: formatTokens(this.completionTokens),
			cls: 'cost-display__value',
		});
		outputRow.createEl('td', {
			text: formatCost(outputCost),
			cls: 'cost-display__cost',
		});

		// Total row (bold)
		const totalRow = tbody.createEl('tr', {
			cls: 'cost-display__total',
		});
		totalRow.createEl('td', {
			text: 'Total',
			cls: 'cost-display__label',
		});
		totalRow.createEl('td', {
			text: formatTokens(this.totalTokens),
			cls: 'cost-display__value',
		});
		totalRow.createEl('td', {
			text: formatCost(this.estimatedCost),
			cls: 'cost-display__cost',
		});
	}

	/**
	 * Toggle expanded/collapsed state
	 *
	 * Animates the breakdown section with smooth transition.
	 */
	private toggleExpanded(): void {
		this.isExpanded = !this.isExpanded;

		if (!this.displayElement) {
			return;
		}

		const breakdown = this.displayElement.querySelector(
			'.cost-display__breakdown'
		) as HTMLElement;
		const summary = this.displayElement.querySelector(
			'.cost-display__summary'
		) as HTMLElement;
		const icon = summary?.querySelector('.cost-display__icon') as HTMLElement;

		if (breakdown && summary) {
			if (this.isExpanded) {
				// Expand
				breakdown.style.display = 'block';
				breakdown.setAttribute('aria-hidden', 'false');
				summary.setAttribute('aria-expanded', 'true');

				if (icon) {
					icon.setText('▲');
				}

				// Animate in (fade + slide)
				breakdown.style.opacity = '0';
				breakdown.style.transform = 'translateY(-10px)';

				// Trigger animation
				requestAnimationFrame(() => {
					breakdown.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
					breakdown.style.opacity = '1';
					breakdown.style.transform = 'translateY(0)';
				});
			} else {
				// Collapse
				breakdown.style.opacity = '0';
				breakdown.style.transform = 'translateY(-10px)';

				// Hide after animation
				setTimeout(() => {
					breakdown.style.display = 'none';
					breakdown.setAttribute('aria-hidden', 'true');
				}, 200);

				summary.setAttribute('aria-expanded', 'false');

				if (icon) {
					icon.setText('▼');
				}
			}
		}
	}

	/**
	 * Get total cost
	 *
	 * @returns Estimated cost in USD
	 */
	getCost(): number {
		return this.estimatedCost;
	}

	/**
	 * Get total tokens
	 *
	 * @returns Total token count
	 */
	getTokens(): number {
		return this.totalTokens;
	}
}
