/**
 * Tag Statistics Service
 *
 * Analyzes seed notes to extract tag metadata including:
 * - Tag frequency counts
 * - Tag co-occurrence patterns
 * - Date ranges per tag
 * - Related tag suggestions
 *
 * Performance target: <100ms for 1000 seeds
 * Complexity: O(n*m) where n=seeds, m=avg tags per seed
 *
 * Part of T-20251103-011a: Enhanced Gather Seeds with Tag Filtering
 */

import type { SeedNote } from './types';

/**
 * Tag Statistics Data Model
 *
 * Contains all metadata about a single tag across seed notes.
 */
export interface TagStats {
	/**
	 * Tag name (normalized: lowercase, no # prefix)
	 */
	tag: string;

	/**
	 * Number of seeds containing this tag
	 */
	count: number;

	/**
	 * File paths of seeds with this tag
	 * Used for quick filtering
	 */
	seedPaths: string[];

	/**
	 * Co-occurrence map: other tags that appear with this one
	 * Maps tag name → count of co-occurrences
	 *
	 * Example: tag "practice" might have:
	 * - "guitar" → 6 (appears together in 6 seeds)
	 * - "creativity" → 4 (appears together in 4 seeds)
	 */
	coOccurrence: Map<string, number>;

	/**
	 * Date range of seeds with this tag
	 * Useful for showing "last used" info
	 */
	dateRange: {
		/**
		 * Earliest created date (Unix timestamp)
		 */
		earliest: number;

		/**
		 * Latest modified date (Unix timestamp)
		 */
		latest: number;
	};
}

/**
 * Tag Filter Options
 *
 * Configuration for filtering seeds by tags.
 */
export interface TagFilterOptions {
	/**
	 * Tags to filter by
	 * Empty array = no tag filter (show all)
	 */
	tags: string[];

	/**
	 * Filter mode:
	 * - 'any': Seed has at least one of the selected tags (OR logic)
	 * - 'all': Seed has all of the selected tags (AND logic)
	 *
	 * @default 'any'
	 */
	mode: 'any' | 'all';
}

/**
 * Tag Statistics Service
 *
 * Static utility class for analyzing tag patterns across seeds.
 * All methods are pure functions (no side effects).
 */
export class TagStatistics {
	/**
	 * Extract tag statistics from seed notes
	 *
	 * Performance: O(n*m) where n=seeds, m=avg tags per seed
	 * Target: <100ms for 1000 seeds
	 *
	 * @param seeds - Array of seed notes to analyze
	 * @returns Array of tag statistics sorted by frequency (most common first)
	 *
	 * @example
	 * ```typescript
	 * const seeds = await seedGatherer.gatherSeeds();
	 * const stats = TagStatistics.extractFromSeeds(seeds);
	 *
	 * // Show top 10 most common tags
	 * stats.slice(0, 10).forEach(tagStat => {
	 *   console.log(`${tagStat.tag}: ${tagStat.count} seeds`);
	 * });
	 * ```
	 */
	static extractFromSeeds(seeds: SeedNote[]): TagStats[] {
		// Performance optimization: Use Map for O(1) lookups
		const tagMap = new Map<string, TagStats>();

		// Single pass through all seeds
		for (const seed of seeds) {
			// Process each tag in the seed
			for (const tag of seed.tags) {
				// Initialize tag stats if first occurrence
				if (!tagMap.has(tag)) {
					tagMap.set(tag, {
						tag,
						count: 0,
						seedPaths: [],
						coOccurrence: new Map(),
						dateRange: {
							earliest: Infinity,
							latest: 0,
						},
					});
				}

				const stats = tagMap.get(tag)!;

				// Update count and paths
				stats.count++;
				stats.seedPaths.push(seed.path);

				// Update date range
				stats.dateRange.earliest = Math.min(
					stats.dateRange.earliest,
					seed.createdAt
				);
				stats.dateRange.latest = Math.max(
					stats.dateRange.latest,
					seed.modifiedAt
				);

				// Track co-occurrence with other tags in same seed
				for (const otherTag of seed.tags) {
					if (otherTag !== tag) {
						const coCount = stats.coOccurrence.get(otherTag) || 0;
						stats.coOccurrence.set(otherTag, coCount + 1);
					}
				}
			}
		}

		// Convert map to array and sort by frequency (descending)
		return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
	}

	/**
	 * Get top N most frequently co-occurring tags
	 *
	 * @param tagStats - Tag statistics to analyze
	 * @param limit - Maximum number of related tags to return
	 * @returns Array of [tag, count] tuples sorted by co-occurrence frequency
	 *
	 * @example
	 * ```typescript
	 * const practiceTagStats = stats.find(s => s.tag === 'practice');
	 * const relatedTags = TagStatistics.getRelatedTags(practiceTagStats, 5);
	 *
	 * // Result: [['guitar', 6], ['creativity', 4], ['music', 3], ...]
	 * ```
	 */
	static getRelatedTags(
		tagStats: TagStats,
		limit: number = 5
	): Array<[string, number]> {
		return Array.from(tagStats.coOccurrence.entries())
			.sort(([, countA], [, countB]) => countB - countA)
			.slice(0, limit);
	}

	/**
	 * Get co-occurrence percentage for a related tag
	 *
	 * @param tagStats - Tag statistics to analyze
	 * @param relatedTag - Tag to check co-occurrence with
	 * @returns Percentage (0-100) of seeds with both tags
	 *
	 * @example
	 * ```typescript
	 * const practiceStats = stats.find(s => s.tag === 'practice');
	 * const guitarPercentage = TagStatistics.getCoOccurrencePercentage(
	 *   practiceStats,
	 *   'guitar'
	 * );
	 * // Result: 60 (60% of practice seeds also have #guitar)
	 * ```
	 */
	static getCoOccurrencePercentage(
		tagStats: TagStats,
		relatedTag: string
	): number {
		const coCount = tagStats.coOccurrence.get(relatedTag) || 0;
		if (tagStats.count === 0) return 0;
		return Math.round((coCount / tagStats.count) * 100);
	}

	/**
	 * Filter seeds by selected tags
	 *
	 * @param seeds - Seeds to filter
	 * @param options - Filter configuration (tags and mode)
	 * @returns Filtered array of seeds
	 *
	 * @example
	 * ```typescript
	 * // Find seeds with BOTH #practice AND #creativity
	 * const filtered = TagStatistics.filterSeedsByTags(seeds, {
	 *   tags: ['practice', 'creativity'],
	 *   mode: 'all'
	 * });
	 *
	 * // Find seeds with EITHER #practice OR #creativity
	 * const filtered = TagStatistics.filterSeedsByTags(seeds, {
	 *   tags: ['practice', 'creativity'],
	 *   mode: 'any'
	 * });
	 * ```
	 */
	static filterSeedsByTags(
		seeds: SeedNote[],
		options: TagFilterOptions
	): SeedNote[] {
		// No filter if no tags selected
		if (options.tags.length === 0) {
			return seeds;
		}

		return seeds.filter((seed) => {
			if (options.mode === 'all') {
				// AND logic: seed must have ALL selected tags
				return options.tags.every((tag) => seed.tags.includes(tag));
			} else {
				// OR logic: seed must have at least ONE selected tag
				return options.tags.some((tag) => seed.tags.includes(tag));
			}
		});
	}

	/**
	 * Get human-readable date range string
	 *
	 * @param dateRange - Date range to format
	 * @returns Formatted string like "Used from Oct 15 to Nov 3"
	 *
	 * @example
	 * ```typescript
	 * const range = TagStatistics.formatDateRange(tagStats.dateRange);
	 * // Result: "Used from 2025-10-15 to 2025-11-03"
	 * ```
	 */
	static formatDateRange(dateRange: TagStats['dateRange']): string {
		if (dateRange.earliest === Infinity || dateRange.latest === 0) {
			return 'No dates available';
		}

		const startDate = new Date(dateRange.earliest).toLocaleDateString(
			'en-US',
			{
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			}
		);

		const endDate = new Date(dateRange.latest).toLocaleDateString(
			'en-US',
			{
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			}
		);

		if (startDate === endDate) {
			return `Used on ${startDate}`;
		}

		return `Used from ${startDate} to ${endDate}`;
	}

	/**
	 * Get suggested tag filter combinations
	 *
	 * Analyzes co-occurrence patterns to suggest useful tag combinations.
	 * Suggests pairs/triples of tags that frequently appear together.
	 *
	 * @param stats - All tag statistics
	 * @param minCoOccurrence - Minimum co-occurrence count to suggest
	 * @returns Array of suggested tag combinations
	 *
	 * @example
	 * ```typescript
	 * const suggestions = TagStatistics.getSuggestedCombinations(stats, 3);
	 * // Result: [
	 * //   ['practice', 'guitar'],
	 * //   ['creativity', 'idea'],
	 * //   ['programming', 'practice']
	 * // ]
	 * ```
	 */
	static getSuggestedCombinations(
		stats: TagStats[],
		minCoOccurrence: number = 3
	): string[][] {
		const suggestions: string[][] = [];
		const seen = new Set<string>();

		for (const tagStat of stats) {
			const relatedTags = this.getRelatedTags(tagStat, 3);

			for (const [relatedTag, count] of relatedTags) {
				if (count >= minCoOccurrence) {
					// Create sorted combination key to avoid duplicates
					const combo = [tagStat.tag, relatedTag].sort();
					const key = combo.join('|');

					if (!seen.has(key)) {
						seen.add(key);
						suggestions.push(combo);
					}
				}
			}
		}

		// Sort by combined frequency (tags that appear most often)
		return suggestions
			.map((combo) => {
				const totalCount = combo.reduce((sum, tag) => {
					const stat = stats.find((s) => s.tag === tag);
					return sum + (stat?.count || 0);
				}, 0);
				return { combo, totalCount };
			})
			.sort((a, b) => b.totalCount - a.totalCount)
			.map(({ combo }) => combo)
			.slice(0, 10); // Top 10 suggestions
	}
}
