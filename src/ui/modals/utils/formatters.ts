/**
 * UI Formatters for Center Discovery Modal
 *
 * Utility functions for formatting data for display in the UI.
 * Follows Single Responsibility Principle - each formatter handles one type.
 *
 * Design principles:
 * - Pure functions (no side effects)
 * - Defensive programming (handle edge cases)
 * - Consistent formatting across UI
 * - Localization-ready (uses Intl API where possible)
 */

/**
 * Format cost in USD with appropriate precision
 *
 * Rules:
 * - Costs >= $0.01: Show 2-3 decimal places
 * - Costs < $0.01: Show up to 4 decimal places
 * - Always include $ prefix
 * - Handle edge cases: 0, null, negative
 *
 * Examples:
 * - 0.0153 → "$0.015"
 * - 0.0001 → "$0.0001"
 * - 1.50 → "$1.50"
 * - 0 → "$0.00"
 *
 * @param usd - Cost in USD (decimal number)
 * @returns Formatted cost string
 */
export function formatCost(usd: number): string {
	// Handle edge cases
	if (usd === null || usd === undefined || isNaN(usd)) {
		return '$0.00';
	}

	// Handle negative (shouldn't happen, but defensive)
	if (usd < 0) {
		return '$0.00';
	}

	// Handle zero
	if (usd === 0) {
		return '$0.00';
	}

	// For very small costs, show up to 4 decimal places
	if (usd < 0.01) {
		// Remove trailing zeros after decimal point
		let formatted = usd.toFixed(4);
		// Remove trailing zeros but keep at least one decimal place
		formatted = formatted.replace(/(\.\d*?[1-9])0+$/, '$1');
		// If all decimals are zeros, show 0
		if (formatted === '0.0000') {
			formatted = '0';
		}
		return '$' + formatted;
	}

	// For normal costs (0.01 - 0.1), show up to 3 decimal places
	if (usd < 0.1) {
		let formatted = usd.toFixed(3);
		// Remove trailing zeros after decimal point
		formatted = formatted.replace(/(\.\d*?[1-9])0+$/, '$1');
		return '$' + formatted;
	}

	// For larger costs, show 2 decimal places
	return '$' + usd.toFixed(2);
}

/**
 * Format token count with thousand separators
 *
 * Uses locale-aware formatting for readability.
 *
 * Examples:
 * - 1670 → "1,670"
 * - 100 → "100"
 * - 1000000 → "1,000,000"
 * - 0 → "0"
 *
 * @param count - Token count (integer)
 * @returns Formatted token count
 */
export function formatTokens(count: number): string {
	// Handle edge cases
	if (count === null || count === undefined || isNaN(count)) {
		return '0';
	}

	// Handle negative (shouldn't happen, but defensive)
	if (count < 0) {
		return '0';
	}

	// Use Intl.NumberFormat for locale-aware formatting
	// This will use system locale for thousand separators
	return new Intl.NumberFormat('en-US').format(Math.floor(count));
}

/**
 * Format AI provider name for display
 *
 * Maps provider IDs to user-friendly display names.
 *
 * Examples:
 * - 'claude' → "Claude 3.5 Sonnet"
 * - 'gpt' → "GPT-4 Turbo"
 * - 'gemini' → "Gemini Pro"
 *
 * @param provider - Provider identifier
 * @returns User-friendly provider name
 */
export function formatProvider(provider: 'claude' | 'gpt' | 'gemini'): string {
	const providerNames: Record<string, string> = {
		claude: 'Claude 3.5 Sonnet',
		gpt: 'GPT-4 Turbo',
		gemini: 'Gemini Pro',
	};

	return providerNames[provider] || provider;
}

/**
 * Format strength rating with stars
 *
 * Visual representation of center strength.
 *
 * Examples:
 * - 'strong' → "⭐⭐⭐ STRONG"
 * - 'medium' → "⭐⭐ MEDIUM"
 * - 'weak' → "⭐ WEAK"
 *
 * @param strength - Strength rating
 * @returns Formatted strength with stars
 */
export function formatStrength(
	strength: 'strong' | 'medium' | 'weak'
): string {
	const strengthMap: Record<string, string> = {
		strong: '⭐⭐⭐ STRONG',
		medium: '⭐⭐ MEDIUM',
		weak: '⭐ WEAK',
	};

	return strengthMap[strength] || strength.toUpperCase();
}

/**
 * Format percentage with specified decimal places
 *
 * Helper for formatting confidence scores and other percentages.
 *
 * Examples:
 * - (0.856, 0) → "86%"
 * - (0.856, 1) → "85.6%"
 * - (0.5, 0) → "50%"
 *
 * @param value - Decimal value (0.0 - 1.0)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
	if (value === null || value === undefined || isNaN(value)) {
		return '0%';
	}

	const percentage = value * 100;
	return percentage.toFixed(decimals) + '%';
}

/**
 * Pluralize a word based on count
 *
 * Helper for grammatically correct pluralization.
 *
 * Examples:
 * - (1, 'seed') → "seed"
 * - (3, 'seed') → "seeds"
 * - (0, 'center', 'centers') → "centers"
 *
 * @param count - Item count
 * @param singular - Singular form
 * @param plural - Optional custom plural form
 * @returns Singular or plural form
 */
export function pluralize(
	count: number,
	singular: string,
	plural?: string
): string {
	if (count === 1) {
		return singular;
	}

	return plural || singular + 's';
}
