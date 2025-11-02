/**
 * ErrorState Component for Center Discovery Modal
 *
 * Displays error states with clear messaging and recovery options.
 * Follows Strategy Pattern for error-specific rendering.
 *
 * Design Principles:
 * - User-friendly error messages (no technical jargon)
 * - Actionable recovery options for each error type
 * - Visual consistency with clear icons and structure
 * - Accessibility support (ARIA labels, keyboard navigation)
 *
 * Architecture:
 * - ErrorConfig: Maps error codes to display configurations
 * - ErrorState: Renders configured error UI
 * - Factory pattern: create() method for type-safe instantiation
 */

import type { AIErrorCode } from '../../../services/ai/types';

/**
 * Error Display Configuration
 *
 * Defines how each error type should be displayed to the user.
 */
interface ErrorConfig {
	/**
	 * Error code identifier
	 */
	code: AIErrorCode | 'NO_CENTERS_FOUND' | 'ONLY_WEAK_CENTERS';

	/**
	 * Visual icon (emoji or symbol)
	 */
	icon: string;

	/**
	 * User-friendly title
	 */
	title: string;

	/**
	 * Detailed explanation (1-2 sentences)
	 */
	message: string;

	/**
	 * Recovery actions available to user
	 */
	actions: ErrorAction[];
}

/**
 * Error Recovery Action
 *
 * Represents a button/link for user to recover from error.
 */
interface ErrorAction {
	/**
	 * Button label
	 */
	label: string;

	/**
	 * Action type (determines what happens on click)
	 */
	type: 'retry' | 'settings' | 'help' | 'close' | 'add-seeds';

	/**
	 * Button style variant
	 */
	variant: 'primary' | 'secondary' | 'ghost';
}

/**
 * ErrorState Component
 *
 * Renders error UI with context-specific messaging and recovery options.
 */
export class ErrorState {
	private config: ErrorConfig;
	private onAction?: (action: ErrorAction) => void;

	/**
	 * Private constructor (use factory method create())
	 */
	private constructor(config: ErrorConfig, onAction?: (action: ErrorAction) => void) {
		this.config = config;
		this.onAction = onAction;
	}

	/**
	 * Factory method: Create ErrorState from error code
	 *
	 * Maps error codes to appropriate configurations.
	 *
	 * @param code - Error code from AIService
	 * @param onAction - Optional callback for action button clicks
	 * @returns ErrorState instance
	 */
	static create(
		code: AIErrorCode | 'NO_CENTERS_FOUND' | 'ONLY_WEAK_CENTERS',
		onAction?: (action: ErrorAction) => void
	): ErrorState {
		const config = ERROR_CONFIGS[code] || ERROR_CONFIGS['NETWORK_ERROR'];
		return new ErrorState(config, onAction);
	}

	/**
	 * Render error state into container
	 *
	 * Creates semantic HTML structure:
	 * - Icon for visual identification
	 * - Title for quick scanning
	 * - Message for detailed explanation
	 * - Action buttons for recovery
	 *
	 * @param container - DOM element to render into
	 */
	render(container: HTMLElement): void {
		container.empty();
		container.addClass('center-discovery-error');

		// Create error card
		const errorCard = container.createDiv('error-card');
		errorCard.setAttribute('role', 'alert');
		errorCard.setAttribute('aria-live', 'assertive');

		// Icon
		const icon = errorCard.createDiv('error-card__icon');
		icon.setText(this.config.icon);

		// Content
		const content = errorCard.createDiv('error-card__content');

		// Title
		content.createEl('h3', {
			cls: 'error-card__title',
			text: this.config.title,
		});

		// Message
		content.createEl('p', {
			cls: 'error-card__message',
			text: this.config.message,
		});

		// Actions
		if (this.config.actions.length > 0) {
			const actionsContainer = errorCard.createDiv('error-card__actions');

			for (const action of this.config.actions) {
				const button = actionsContainer.createEl('button', {
					cls: `error-card__action error-card__action--${action.variant}`,
					text: action.label,
				});

				button.setAttribute('type', 'button');

				// Add click handler
				button.addEventListener('click', () => {
					if (this.onAction) {
						this.onAction(action);
					}
				});
			}
		}
	}
}

/**
 * Error Configurations
 *
 * Maps each error code to its display configuration.
 * Centralized for easy maintenance and consistency.
 */
const ERROR_CONFIGS: Record<string, ErrorConfig> = {
	/**
	 * Insufficient seeds provided (< 2 seeds)
	 */
	INSUFFICIENT_SEEDS: {
		code: 'INSUFFICIENT_SEEDS',
		icon: '📝',
		title: 'Not Enough Seeds',
		message:
			'You need at least 2 seed notes to discover centers. Select more seed notes and try again.',
		actions: [
			{ label: 'Add More Seeds', type: 'add-seeds', variant: 'primary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * AI found no centers in the provided seeds
	 */
	NO_CENTERS_FOUND: {
		code: 'NO_CENTERS_FOUND',
		icon: '🔍',
		title: 'No Centers Found',
		message:
			'The AI couldn\'t identify any connecting themes in your seeds. Try selecting seeds from different topics or add more seeds.',
		actions: [
			{ label: 'Try Different Seeds', type: 'add-seeds', variant: 'primary' },
			{ label: 'Learn About Centers', type: 'help', variant: 'secondary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * Only weak centers found (no strong or medium)
	 */
	ONLY_WEAK_CENTERS: {
		code: 'ONLY_WEAK_CENTERS',
		icon: '⚠️',
		title: 'Only Weak Centers Found',
		message:
			'The AI found some possible centers, but they\'re all weak connections. Consider adding more diverse seeds or seeds with emotional resonance.',
		actions: [
			{ label: 'Add More Seeds', type: 'add-seeds', variant: 'primary' },
			{ label: 'Retry', type: 'retry', variant: 'secondary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * API rate limit exceeded
	 */
	RATE_LIMIT_EXCEEDED: {
		code: 'RATE_LIMIT_EXCEEDED',
		icon: '⏱️',
		title: 'Rate Limit Exceeded',
		message:
			'You\'ve made too many requests in a short time. Please wait a few moments and try again.',
		actions: [
			{ label: 'Retry', type: 'retry', variant: 'primary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * Invalid or missing API key
	 */
	INVALID_API_KEY: {
		code: 'INVALID_API_KEY',
		icon: '🔑',
		title: 'Invalid API Key',
		message:
			'Your AI provider API key is invalid or missing. Please check your plugin settings and add a valid API key.',
		actions: [
			{ label: 'Open Settings', type: 'settings', variant: 'primary' },
			{ label: 'Help', type: 'help', variant: 'secondary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * Network connection error
	 */
	NETWORK_ERROR: {
		code: 'NETWORK_ERROR',
		icon: '🌐',
		title: 'Connection Failed',
		message:
			'Unable to connect to the AI service. Please check your internet connection and try again.',
		actions: [
			{ label: 'Retry', type: 'retry', variant: 'primary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * Request timeout
	 */
	TIMEOUT: {
		code: 'TIMEOUT',
		icon: '⏰',
		title: 'Request Timeout',
		message:
			'The AI service took too long to respond. This might be due to a large number of seeds. Try again with fewer seeds.',
		actions: [
			{ label: 'Retry', type: 'retry', variant: 'primary' },
			{ label: 'Try Fewer Seeds', type: 'add-seeds', variant: 'secondary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * Invalid or malformed AI response
	 */
	INVALID_RESPONSE: {
		code: 'INVALID_RESPONSE',
		icon: '❌',
		title: 'Invalid Response',
		message:
			'The AI service returned an unexpected response. This is usually temporary - please try again.',
		actions: [
			{ label: 'Retry', type: 'retry', variant: 'primary' },
			{ label: 'Help', type: 'help', variant: 'secondary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * API quota exceeded (monthly limit)
	 */
	QUOTA_EXCEEDED: {
		code: 'QUOTA_EXCEEDED',
		icon: '💳',
		title: 'Quota Exceeded',
		message:
			'You\'ve reached your monthly usage limit for the AI service. Please check your API account or try again next month.',
		actions: [
			{ label: 'Check API Account', type: 'help', variant: 'primary' },
			{ label: 'Settings', type: 'settings', variant: 'secondary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * Generic provider error
	 */
	PROVIDER_ERROR: {
		code: 'PROVIDER_ERROR',
		icon: '⚠️',
		title: 'AI Service Error',
		message:
			'The AI service encountered an error. This is usually temporary - please try again in a few moments.',
		actions: [
			{ label: 'Retry', type: 'retry', variant: 'primary' },
			{ label: 'Help', type: 'help', variant: 'secondary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},

	/**
	 * Invalid request (shouldn't happen in normal use)
	 */
	INVALID_REQUEST: {
		code: 'INVALID_REQUEST',
		icon: '❌',
		title: 'Invalid Request',
		message:
			'The request to the AI service was invalid. This might be a bug - please report it to the plugin developer.',
		actions: [
			{ label: 'Help', type: 'help', variant: 'primary' },
			{ label: 'Close', type: 'close', variant: 'ghost' },
		],
	},
};

/**
 * Export action types for use by modal
 */
export type { ErrorAction };
