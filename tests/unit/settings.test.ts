import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS } from '@/settings/settings';

/**
 * Settings Test Suite
 *
 * Validates that default settings are properly configured
 * and meet expected constraints.
 */
describe('Settings', () => {
	describe('DEFAULT_SETTINGS', () => {
		it('should have Claude as default AI provider', () => {
			expect(DEFAULT_SETTINGS.aiProvider).toBe('claude');
		});

		it('should have empty API key by default', () => {
			expect(DEFAULT_SETTINGS.apiKey).toBe('');
		});

		it('should have seed tags configured', () => {
			expect(DEFAULT_SETTINGS.seedTags).toBe('seed,writealive-seed');
			expect(DEFAULT_SETTINGS.seedTags.split(',').length).toBeGreaterThan(0);
		});

		it('should enable auto-save by default', () => {
			expect(DEFAULT_SETTINGS.autoSave).toBe(true);
		});

		it('should have valid auto-save interval', () => {
			expect(DEFAULT_SETTINGS.autoSaveInterval).toBeGreaterThan(0);
			expect(DEFAULT_SETTINGS.autoSaveInterval).toBeLessThanOrEqual(300);
		});

		it('should show cost warnings by default', () => {
			expect(DEFAULT_SETTINGS.showCostWarnings).toBe(true);
		});

		it('should have English as default language', () => {
			expect(DEFAULT_SETTINGS.language).toBe('en');
		});
	});
});
