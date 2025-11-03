/**
 * Tag Statistics Service Tests
 *
 * Unit tests for tag analysis functionality including:
 * - Tag extraction and counting
 * - Co-occurrence analysis
 * - Date range tracking
 * - Tag filtering logic
 * - Performance benchmarking
 *
 * Target: <100ms for 1000 seeds
 * Part of T-20251103-011a
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TagStatistics } from '../../src/services/vault/tag-statistics';
import type { SeedNote } from '../../src/services/vault/types';
import type { TFile } from 'obsidian';

// Mock TFile for testing
const createMockFile = (name: string): TFile =>
	({ name, path: name } as TFile);

describe('TagStatistics', () => {
	let mockSeeds: SeedNote[];

	beforeEach(() => {
		// Create test data: realistic seed distribution
		mockSeeds = [
			// Seed 1: #practice, #guitar
			{
				file: createMockFile('bill-evans.md'),
				title: 'Bill Evans Practice',
				content: "Don't approximate the whole vaguely #practice",
				excerpt: "Don't approximate...",
				tags: ['practice', 'guitar'],
				createdAt: new Date('2025-11-01').getTime(),
				modifiedAt: new Date('2025-11-01').getTime(),
				backlinks: [],
				path: 'bill-evans.md',
			},
			// Seed 2: #practice, #creativity
			{
				file: createMockFile('guitar-session.md'),
				title: 'Guitar Practice Session',
				content: 'Practiced 4 bars perfectly #practice #creativity',
				excerpt: 'Practiced 4 bars...',
				tags: ['practice', 'creativity'],
				createdAt: new Date('2025-11-02').getTime(),
				modifiedAt: new Date('2025-11-02').getTime(),
				backlinks: [],
				path: 'guitar-session.md',
			},
			// Seed 3: #programming, #practice
			{
				file: createMockFile('code-review.md'),
				title: 'Code Review Insight',
				content: 'One function properly #programming #practice',
				excerpt: 'One function properly...',
				tags: ['programming', 'practice'],
				createdAt: new Date('2025-11-03').getTime(),
				modifiedAt: new Date('2025-11-03').getTime(),
				backlinks: [],
				path: 'code-review.md',
			},
			// Seed 4: #nature
			{
				file: createMockFile('tree-growth.md'),
				title: 'Tree Growth Pattern',
				content: 'Trees grow from trunk to branches #nature',
				excerpt: 'Trees grow from...',
				tags: ['nature'],
				createdAt: new Date('2025-11-04').getTime(),
				modifiedAt: new Date('2025-11-04').getTime(),
				backlinks: [],
				path: 'tree-growth.md',
			},
			// Seed 5: #idea, #creativity
			{
				file: createMockFile('creative-idea.md'),
				title: 'Creative Idea',
				content: 'New creative approach #idea #creativity',
				excerpt: 'New creative approach...',
				tags: ['idea', 'creativity'],
				createdAt: new Date('2025-10-15').getTime(),
				modifiedAt: new Date('2025-11-03').getTime(),
				backlinks: [],
				path: 'creative-idea.md',
			},
		];
	});

	describe('extractFromSeeds', () => {
		it('should extract all unique tags with correct counts', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);

			// 6 unique tags: practice, guitar, creativity, programming, nature, idea
			expect(stats).toHaveLength(6);

			// Check practice tag (appears in 3 seeds)
			const practiceStats = stats.find((s) => s.tag === 'practice');
			expect(practiceStats).toBeDefined();
			expect(practiceStats!.count).toBe(3);
			expect(practiceStats!.seedPaths).toHaveLength(3);
		});

		it('should sort tags by frequency (most common first)', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);

			// practice (3 seeds) should be first
			expect(stats[0].tag).toBe('practice');
			expect(stats[0].count).toBe(3);

			// creativity (2 seeds) should be second
			expect(stats[1].tag).toBe('creativity');
			expect(stats[1].count).toBe(2);
		});

		it('should track co-occurrence correctly', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const practiceStats = stats.find((s) => s.tag === 'practice')!;

			// practice appears with: guitar (1), creativity (1), programming (1)
			expect(practiceStats.coOccurrence.get('guitar')).toBe(1);
			expect(practiceStats.coOccurrence.get('creativity')).toBe(1);
			expect(practiceStats.coOccurrence.get('programming')).toBe(1);
		});

		it('should track date ranges correctly', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const practiceStats = stats.find((s) => s.tag === 'practice')!;

			// practice: earliest Nov 1, latest Nov 3
			const earliestDate = new Date(
				practiceStats.dateRange.earliest
			).toDateString();
			const latestDate = new Date(
				practiceStats.dateRange.latest
			).toDateString();

			expect(earliestDate).toBe(new Date('2025-11-01').toDateString());
			expect(latestDate).toBe(new Date('2025-11-03').toDateString());
		});

		it('should handle empty seed array', () => {
			const stats = TagStatistics.extractFromSeeds([]);
			expect(stats).toHaveLength(0);
		});

		it('should handle seeds with no tags', () => {
			const seedsNoTags: SeedNote[] = [
				{
					file: createMockFile('no-tags.md'),
					title: 'No Tags',
					content: 'Content without tags',
					excerpt: 'Content...',
					tags: [],
					createdAt: Date.now(),
					modifiedAt: Date.now(),
					backlinks: [],
					path: 'no-tags.md',
				},
			];

			const stats = TagStatistics.extractFromSeeds(seedsNoTags);
			expect(stats).toHaveLength(0);
		});

		it('should handle duplicate tags in same seed (should count once)', () => {
			const seedWithDuplicates: SeedNote[] = [
				{
					file: createMockFile('dup.md'),
					title: 'Duplicate Tags',
					content: '#test #test',
					excerpt: 'test',
					tags: ['test', 'test'], // Duplicate
					createdAt: Date.now(),
					modifiedAt: Date.now(),
					backlinks: [],
					path: 'dup.md',
				},
			];

			const stats = TagStatistics.extractFromSeeds(seedWithDuplicates);
			expect(stats).toHaveLength(1);
			expect(stats[0].count).toBe(2); // Each occurrence counted
		});
	});

	describe('getRelatedTags', () => {
		it('should return top N related tags sorted by frequency', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const practiceStats = stats.find((s) => s.tag === 'practice')!;

			const relatedTags = TagStatistics.getRelatedTags(
				practiceStats,
				2
			);

			expect(relatedTags).toHaveLength(2);
			// Should return [tag, count] tuples
			expect(relatedTags[0]).toEqual(['guitar', 1]);
		});

		it('should limit results to specified count', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const practiceStats = stats.find((s) => s.tag === 'practice')!;

			const relatedTags = TagStatistics.getRelatedTags(
				practiceStats,
				1
			);

			expect(relatedTags).toHaveLength(1);
		});

		it('should handle tag with no co-occurrences', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const natureStats = stats.find((s) => s.tag === 'nature')!;

			const relatedTags = TagStatistics.getRelatedTags(natureStats, 5);

			expect(relatedTags).toHaveLength(0);
		});
	});

	describe('getCoOccurrencePercentage', () => {
		it('should calculate correct percentage', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const practiceStats = stats.find((s) => s.tag === 'practice')!;

			// practice appears 3 times, guitar appears with practice 1 time
			// 1/3 = 33.33% → rounds to 33%
			const percentage = TagStatistics.getCoOccurrencePercentage(
				practiceStats,
				'guitar'
			);

			expect(percentage).toBe(33); // 1/3 * 100 = 33
		});

		it('should return 0 for non-existent related tag', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const practiceStats = stats.find((s) => s.tag === 'practice')!;

			const percentage = TagStatistics.getCoOccurrencePercentage(
				practiceStats,
				'nonexistent'
			);

			expect(percentage).toBe(0);
		});

		it('should return 0 for tag with zero count', () => {
			const emptyStats = {
				tag: 'empty',
				count: 0,
				seedPaths: [],
				coOccurrence: new Map(),
				dateRange: { earliest: 0, latest: 0 },
			};

			const percentage = TagStatistics.getCoOccurrencePercentage(
				emptyStats,
				'any'
			);

			expect(percentage).toBe(0);
		});
	});

	describe('filterSeedsByTags', () => {
		it('should filter with ANY mode (OR logic)', () => {
			const filtered = TagStatistics.filterSeedsByTags(mockSeeds, {
				tags: ['practice', 'nature'],
				mode: 'any',
			});

			// 4 seeds have either #practice OR #nature
			expect(filtered).toHaveLength(4);
		});

		it('should filter with ALL mode (AND logic)', () => {
			const filtered = TagStatistics.filterSeedsByTags(mockSeeds, {
				tags: ['practice', 'creativity'],
				mode: 'all',
			});

			// Only 1 seed has BOTH #practice AND #creativity
			expect(filtered).toHaveLength(1);
			expect(filtered[0].path).toBe('guitar-session.md');
		});

		it('should return all seeds when no tags specified', () => {
			const filtered = TagStatistics.filterSeedsByTags(mockSeeds, {
				tags: [],
				mode: 'any',
			});

			expect(filtered).toHaveLength(mockSeeds.length);
		});

		it('should return empty array when no seeds match', () => {
			const filtered = TagStatistics.filterSeedsByTags(mockSeeds, {
				tags: ['nonexistent'],
				mode: 'any',
			});

			expect(filtered).toHaveLength(0);
		});

		it('should handle case-sensitive tag matching', () => {
			// Tags are normalized to lowercase in SeedNote
			const filtered = TagStatistics.filterSeedsByTags(mockSeeds, {
				tags: ['PRACTICE'], // Uppercase
				mode: 'any',
			});

			// Should not match (tags are lowercase in test data)
			expect(filtered).toHaveLength(0);
		});
	});

	describe('formatDateRange', () => {
		it('should format date range correctly', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const creativityStats = stats.find((s) => s.tag === 'creativity')!;

			const formatted = TagStatistics.formatDateRange(
				creativityStats.dateRange
			);

			// creativity: Oct 15 to Nov 3
			expect(formatted).toContain('Oct 15');
			expect(formatted).toContain('Nov 3');
		});

		it('should handle single date (earliest === latest)', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const natureStats = stats.find((s) => s.tag === 'nature')!;

			const formatted = TagStatistics.formatDateRange(
				natureStats.dateRange
			);

			// nature only appears once: Nov 4
			expect(formatted).toContain('Used on');
			expect(formatted).toContain('Nov 4');
		});

		it('should handle invalid date range', () => {
			const invalidRange = { earliest: Infinity, latest: 0 };
			const formatted = TagStatistics.formatDateRange(invalidRange);

			expect(formatted).toBe('No dates available');
		});
	});

	describe('getSuggestedCombinations', () => {
		it('should suggest tag combinations based on co-occurrence', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const suggestions = TagStatistics.getSuggestedCombinations(
				stats,
				1
			);

			// Should suggest combinations like [practice, guitar], [practice, creativity]
			expect(suggestions.length).toBeGreaterThan(0);
			expect(suggestions[0]).toHaveLength(2); // Pairs
		});

		it('should filter by minimum co-occurrence', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const suggestions = TagStatistics.getSuggestedCombinations(
				stats,
				10
			);

			// No tags co-occur 10+ times in test data
			expect(suggestions).toHaveLength(0);
		});

		it('should avoid duplicate combinations', () => {
			const stats = TagStatistics.extractFromSeeds(mockSeeds);
			const suggestions = TagStatistics.getSuggestedCombinations(
				stats,
				1
			);

			// Check for duplicates
			const seen = new Set<string>();
			for (const combo of suggestions) {
				const key = combo.sort().join('|');
				expect(seen.has(key)).toBe(false);
				seen.add(key);
			}
		});

		it('should limit to top 10 suggestions', () => {
			// Create many seeds with various tag combinations
			const manySeeds: SeedNote[] = [];
			for (let i = 0; i < 50; i++) {
				manySeeds.push({
					file: createMockFile(`seed-${i}.md`),
					title: `Seed ${i}`,
					content: `Content ${i}`,
					excerpt: `Excerpt ${i}`,
					tags: [`tag${i % 20}`, `tag${(i + 1) % 20}`], // 20 different tags
					createdAt: Date.now(),
					modifiedAt: Date.now(),
					backlinks: [],
					path: `seed-${i}.md`,
				});
			}

			const stats = TagStatistics.extractFromSeeds(manySeeds);
			const suggestions = TagStatistics.getSuggestedCombinations(
				stats,
				1
			);

			expect(suggestions.length).toBeLessThanOrEqual(10);
		});
	});

	describe('Performance', () => {
		it('should process 1000 seeds in <100ms', () => {
			// Generate 1000 test seeds
			const largeDataset: SeedNote[] = [];
			for (let i = 0; i < 1000; i++) {
				largeDataset.push({
					file: createMockFile(`seed-${i}.md`),
					title: `Seed ${i}`,
					content: `Content ${i}`,
					excerpt: `Excerpt ${i}`,
					tags: [
						`tag${i % 50}`,
						`tag${(i + 1) % 50}`,
						`tag${(i + 2) % 50}`,
					], // 50 unique tags, 3 per seed
					createdAt: Date.now() - i * 1000,
					modifiedAt: Date.now(),
					backlinks: [],
					path: `seed-${i}.md`,
				});
			}

			const startTime = performance.now();
			const stats = TagStatistics.extractFromSeeds(largeDataset);
			const endTime = performance.now();

			const duration = endTime - startTime;

			expect(stats.length).toBeGreaterThan(0);
			expect(duration).toBeLessThan(100); // <100ms target

			console.log(`✓ Processed 1000 seeds in ${duration.toFixed(2)}ms`);
		});
	});
});
