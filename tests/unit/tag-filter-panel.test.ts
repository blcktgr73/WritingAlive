/**
 * Tag Filter Panel Tests
 *
 * Unit tests for Tag Filter Panel UI component including:
 * - Rendering and DOM structure
 * - Tag selection interaction
 * - Mode toggle (ANY/ALL)
 * - Session storage persistence
 * - Keyboard accessibility
 * - State management
 *
 * Part of T-20251103-011b
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TagFilterPanel } from '../../src/ui/components/tag-filter-panel';
import type { TagStats } from '../../src/services/vault/tag-statistics';

// Mock session storage
const sessionStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock,
});

describe('TagFilterPanel', () => {
	let containerEl: HTMLElement;
	let mockTagStats: TagStats[];
	let onChangeSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Create container
		containerEl = document.createElement('div');
		document.body.appendChild(containerEl);

		// Create mock tag stats
		mockTagStats = [
			{
				tag: 'practice',
				count: 12,
				seedPaths: [],
				coOccurrence: new Map([
					['guitar', 6],
					['creativity', 4],
				]),
				dateRange: { earliest: Date.now(), latest: Date.now() },
			},
			{
				tag: 'creativity',
				count: 8,
				seedPaths: [],
				coOccurrence: new Map([['idea', 5]]),
				dateRange: { earliest: Date.now(), latest: Date.now() },
			},
			{
				tag: 'programming',
				count: 15,
				seedPaths: [],
				coOccurrence: new Map(),
				dateRange: { earliest: Date.now(), latest: Date.now() },
			},
		];

		// Create spy for onChange callback
		onChangeSpy = vi.fn();

		// Clear session storage
		sessionStorage.clear();
	});

	afterEach(() => {
		// Clean up
		document.body.removeChild(containerEl);
		sessionStorage.clear();
	});

	describe('Rendering', () => {
		it('should render panel with title', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const title = containerEl.querySelector('.tag-filter-title');
			expect(title).toBeDefined();
			expect(title?.textContent).toBe('🏷️ Filter by Tags');
		});

		it('should render all tag chips', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const chips = containerEl.querySelectorAll('.tag-chip');
			expect(chips.length).toBe(3); // 3 tags in mockTagStats
		});

		it('should display tag names and counts', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const firstChip = containerEl.querySelector('.tag-chip');
			const tagName = firstChip?.querySelector('.tag-name')?.textContent;
			const tagCount = firstChip?.querySelector('.tag-count')?.textContent;

			expect(tagName).toBe('#practice');
			expect(tagCount).toBe('12');
		});

		it('should render mode toggle buttons', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const modeToggle = containerEl.querySelector('.filter-mode-toggle');
			const buttons = modeToggle?.querySelectorAll('.mode-btn');

			expect(buttons?.length).toBe(2); // ANY and ALL buttons
		});

		it('should limit visible tags when maxVisibleTags specified', () => {
			// Create many tags
			const manyTags: TagStats[] = Array.from({ length: 20 }, (_, i) => ({
				tag: `tag${i}`,
				count: i + 1,
				seedPaths: [],
				coOccurrence: new Map(),
				dateRange: { earliest: Date.now(), latest: Date.now() },
			}));

			const panel = new TagFilterPanel(containerEl, {
				tagStats: manyTags,
				onChange: onChangeSpy,
				maxVisibleTags: 10,
			});

			panel.render();

			const chips = containerEl.querySelectorAll('.tag-chip');
			expect(chips.length).toBe(10); // Limited to 10

			// Should have "Show all tags" button
			const showAllBtn = containerEl.querySelector('.show-all-tags-btn');
			expect(showAllBtn).toBeDefined();
		});

		it('should render empty state when no tags', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: [],
				onChange: onChangeSpy,
			});

			panel.render();

			const emptyState = containerEl.querySelector('.tag-chips-empty');
			expect(emptyState).toBeDefined();
			expect(emptyState?.textContent).toContain('No tags found');
		});
	});

	describe('Tag Selection', () => {
		it('should toggle tag selection on click', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;
			firstChip.click();

			// Should be selected
			expect(firstChip.classList.contains('selected')).toBe(true);
			expect(firstChip.getAttribute('aria-pressed')).toBe('true');
		});

		it('should call onChange when tag selected', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;
			firstChip.click();

			expect(onChangeSpy).toHaveBeenCalledWith({
				selectedTags: ['practice'],
				mode: 'any',
			});
		});

		it('should deselect tag on second click', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;

			// First click - select
			firstChip.click();
			expect(firstChip.classList.contains('selected')).toBe(true);

			// Second click - deselect
			firstChip.click();
			expect(firstChip.classList.contains('selected')).toBe(false);
		});

		it('should support multi-select', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const chips = containerEl.querySelectorAll(
				'.tag-chip'
			) as NodeListOf<HTMLElement>;

			chips[0].click(); // Select practice
			chips[1].click(); // Select creativity

			// Both should be selected
			expect(chips[0].classList.contains('selected')).toBe(true);
			expect(chips[1].classList.contains('selected')).toBe(true);

			// onChange should have been called with both tags
			expect(onChangeSpy).toHaveBeenLastCalledWith({
				selectedTags: ['practice', 'creativity'],
				mode: 'any',
			});
		});
	});

	describe('Mode Toggle', () => {
		it('should default to ANY mode', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const anyBtn = containerEl.querySelector(
				'.mode-btn:first-child'
			) as HTMLElement;
			expect(anyBtn.classList.contains('active')).toBe(true);
		});

		it('should toggle to ALL mode on click', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const allBtn = containerEl.querySelector(
				'.mode-btn:last-child'
			) as HTMLElement;
			allBtn.click();

			// ALL button should be active
			expect(allBtn.classList.contains('active')).toBe(true);

			// onChange should be called with mode: 'all'
			expect(onChangeSpy).toHaveBeenCalledWith({
				selectedTags: [],
				mode: 'all',
			});
		});

		it('should update header text based on mode', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			// Select a tag
			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;
			firstChip.click();

			// Check info text (ANY mode)
			let infoText = containerEl.querySelector('.tag-filter-info')
				?.textContent;
			expect(infoText).toContain('practice OR');

			// Toggle to ALL mode
			const allBtn = containerEl.querySelector(
				'.mode-btn:last-child'
			) as HTMLElement;
			allBtn.click();

			// Check info text (ALL mode)
			infoText = containerEl.querySelector('.tag-filter-info')
				?.textContent;
			expect(infoText).toContain('practice'); // Only one tag, so no AND
		});
	});

	describe('Clear Filters', () => {
		it('should show clear button when tags selected', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			// Initially no clear button
			let clearBtn = containerEl.querySelector('.clear-filters-btn');
			expect(clearBtn).toBeNull();

			// Select a tag
			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;
			firstChip.click();

			// Clear button should appear
			clearBtn = containerEl.querySelector('.clear-filters-btn');
			expect(clearBtn).toBeDefined();
		});

		it('should clear all selections on click', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			// Select multiple tags
			const chips = containerEl.querySelectorAll(
				'.tag-chip'
			) as NodeListOf<HTMLElement>;
			chips[0].click();
			chips[1].click();

			// Click clear button
			const clearBtn = containerEl.querySelector(
				'.clear-filters-btn'
			) as HTMLElement;
			clearBtn.click();

			// All chips should be deselected
			chips.forEach((chip) => {
				expect(chip.classList.contains('selected')).toBe(false);
			});

			// onChange should be called with empty array
			expect(onChangeSpy).toHaveBeenLastCalledWith({
				selectedTags: [],
				mode: 'any',
			});
		});
	});

	describe('Session Storage Persistence', () => {
		it('should save state to session storage on change', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
				enablePersistence: true,
			});

			panel.render();

			// Select a tag
			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;
			firstChip.click();

			// Check session storage
			const saved = sessionStorage.getItem('writealive-tag-filter');
			expect(saved).toBeDefined();

			const state = JSON.parse(saved!);
			expect(state.tags).toEqual(['practice']);
			expect(state.mode).toBe('any');
		});

		it('should restore state from session storage on init', () => {
			// Pre-populate session storage
			sessionStorage.setItem(
				'writealive-tag-filter',
				JSON.stringify({
					tags: ['practice', 'creativity'],
					mode: 'all',
				})
			);

			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
				enablePersistence: true,
			});

			panel.render();

			// Check that state was restored
			const state = panel.getState();
			expect(state.selectedTags).toEqual(['practice', 'creativity']);
			expect(state.mode).toBe('all');

			// Visual state should reflect this
			const selectedChips =
				containerEl.querySelectorAll('.tag-chip.selected');
			expect(selectedChips.length).toBe(2);
		});

		it('should clear session storage on reset', () => {
			// Pre-populate session storage
			sessionStorage.setItem(
				'writealive-tag-filter',
				JSON.stringify({
					tags: ['practice'],
					mode: 'all',
				})
			);

			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
				enablePersistence: true,
			});

			panel.render();
			panel.reset();

			// Session storage should be cleared
			const saved = sessionStorage.getItem('writealive-tag-filter');
			expect(saved).toBeNull();
		});
	});

	describe('Keyboard Accessibility', () => {
		it('should toggle tag on Enter key', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;

			// Simulate Enter key
			const event = new KeyboardEvent('keydown', { key: 'Enter' });
			firstChip.dispatchEvent(event);

			expect(firstChip.classList.contains('selected')).toBe(true);
		});

		it('should toggle tag on Space key', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;

			// Simulate Space key
			const event = new KeyboardEvent('keydown', { key: ' ' });
			firstChip.dispatchEvent(event);

			expect(firstChip.classList.contains('selected')).toBe(true);
		});

		it('should have proper ARIA attributes', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const firstChip = containerEl.querySelector(
				'.tag-chip'
			) as HTMLElement;

			expect(firstChip.getAttribute('role')).toBe('button');
			expect(firstChip.getAttribute('aria-pressed')).toBe('false');
			expect(firstChip.getAttribute('tabindex')).toBe('0');
			expect(firstChip.getAttribute('aria-label')).toBeDefined();
		});
	});

	describe('State Management', () => {
		it('should get current state', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			const state = panel.getState();
			expect(state).toEqual({
				selectedTags: [],
				mode: 'any',
			});
		});

		it('should set state programmatically', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			panel.setState(['practice', 'creativity'], 'all');

			const state = panel.getState();
			expect(state.selectedTags).toEqual(['practice', 'creativity']);
			expect(state.mode).toBe('all');

			// Visual state should update
			const selectedChips =
				containerEl.querySelectorAll('.tag-chip.selected');
			expect(selectedChips.length).toBe(2);
		});

		it('should reset to initial state', () => {
			const panel = new TagFilterPanel(containerEl, {
				tagStats: mockTagStats,
				onChange: onChangeSpy,
			});

			panel.render();

			// Select some tags
			const chips = containerEl.querySelectorAll(
				'.tag-chip'
			) as NodeListOf<HTMLElement>;
			chips[0].click();
			chips[1].click();

			// Reset
			panel.reset();

			// State should be cleared
			const state = panel.getState();
			expect(state.selectedTags).toEqual([]);
			expect(state.mode).toBe('any');
		});
	});
});
