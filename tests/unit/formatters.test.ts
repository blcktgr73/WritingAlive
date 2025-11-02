/**
 * Unit Tests for UI Formatters
 *
 * Tests all formatting functions with edge cases and boundary conditions.
 * Ensures consistent, correct formatting across the UI.
 */

import { describe, it, expect } from 'vitest';
import {
	formatCost,
	formatTokens,
	formatProvider,
	formatStrength,
	formatPercentage,
	pluralize,
} from '../../src/ui/modals/utils/formatters';

describe('formatCost', () => {
	it('should format typical costs correctly', () => {
		expect(formatCost(0.0153)).toBe('$0.015');
		expect(formatCost(0.0001)).toBe('$0.0001');
		expect(formatCost(1.5)).toBe('$1.50');
		expect(formatCost(10)).toBe('$10.00');
	});

	it('should handle zero', () => {
		expect(formatCost(0)).toBe('$0.00');
	});

	it('should handle edge cases', () => {
		expect(formatCost(null as any)).toBe('$0.00');
		expect(formatCost(undefined as any)).toBe('$0.00');
		expect(formatCost(NaN)).toBe('$0.00');
		expect(formatCost(-5)).toBe('$0.00');
	});

	it('should remove trailing zeros for small costs', () => {
		expect(formatCost(0.0100)).toBe('$0.01');
		expect(formatCost(0.0500)).toBe('$0.05');
	});

	it('should handle very small costs', () => {
		expect(formatCost(0.00015)).toBe('$0.0001'); // 4 decimals for very small
		expect(formatCost(0.000001)).toBe('$0');
	});
});

describe('formatTokens', () => {
	it('should format with thousand separators', () => {
		expect(formatTokens(1670)).toBe('1,670');
		expect(formatTokens(1000000)).toBe('1,000,000');
	});

	it('should handle small numbers without separators', () => {
		expect(formatTokens(100)).toBe('100');
		expect(formatTokens(5)).toBe('5');
	});

	it('should handle zero', () => {
		expect(formatTokens(0)).toBe('0');
	});

	it('should handle edge cases', () => {
		expect(formatTokens(null as any)).toBe('0');
		expect(formatTokens(undefined as any)).toBe('0');
		expect(formatTokens(NaN)).toBe('0');
		expect(formatTokens(-100)).toBe('0');
	});

	it('should floor decimal values', () => {
		expect(formatTokens(1670.9)).toBe('1,670');
	});
});

describe('formatProvider', () => {
	it('should format provider names correctly', () => {
		expect(formatProvider('claude')).toBe('Claude 3.5 Sonnet');
		expect(formatProvider('gpt')).toBe('GPT-4 Turbo');
		expect(formatProvider('gemini')).toBe('Gemini Pro');
	});

	it('should handle unknown providers', () => {
		expect(formatProvider('unknown' as any)).toBe('unknown');
	});
});

describe('formatStrength', () => {
	it('should format strength with stars', () => {
		expect(formatStrength('strong')).toBe('⭐⭐⭐ STRONG');
		expect(formatStrength('medium')).toBe('⭐⭐ MEDIUM');
		expect(formatStrength('weak')).toBe('⭐ WEAK');
	});

	it('should handle unknown strengths', () => {
		expect(formatStrength('unknown' as any)).toBe('UNKNOWN');
	});
});

describe('formatPercentage', () => {
	it('should format percentages with default decimals', () => {
		expect(formatPercentage(0.856)).toBe('86%');
		expect(formatPercentage(0.5)).toBe('50%');
		expect(formatPercentage(1.0)).toBe('100%');
	});

	it('should format with custom decimal places', () => {
		expect(formatPercentage(0.856, 1)).toBe('85.6%');
		expect(formatPercentage(0.856, 2)).toBe('85.60%');
	});

	it('should handle edge cases', () => {
		expect(formatPercentage(null as any)).toBe('0%');
		expect(formatPercentage(undefined as any)).toBe('0%');
		expect(formatPercentage(NaN)).toBe('0%');
	});

	it('should handle zero and boundary values', () => {
		expect(formatPercentage(0)).toBe('0%');
		expect(formatPercentage(0.001, 1)).toBe('0.1%');
	});
});

describe('pluralize', () => {
	it('should return singular for count of 1', () => {
		expect(pluralize(1, 'seed')).toBe('seed');
		expect(pluralize(1, 'center')).toBe('center');
	});

	it('should return plural for other counts', () => {
		expect(pluralize(0, 'seed')).toBe('seeds');
		expect(pluralize(2, 'seed')).toBe('seeds');
		expect(pluralize(100, 'seed')).toBe('seeds');
	});

	it('should use custom plural form when provided', () => {
		expect(pluralize(2, 'person', 'people')).toBe('people');
		expect(pluralize(0, 'child', 'children')).toBe('children');
	});

	it('should handle edge cases', () => {
		expect(pluralize(-1, 'seed')).toBe('seeds');
		expect(pluralize(1.5, 'seed')).toBe('seeds');
	});
});
