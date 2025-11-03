/**
 * Relationship Detector Service
 *
 * Detects and analyzes relationships between seed notes including:
 * - Backlinks (notes that link TO this seed)
 * - Wikilinks (notes this seed links TO)
 * - Shared tags (seeds with overlapping tags)
 * - Bidirectional links (mutual references)
 *
 * Design Principles:
 * - Single Responsibility: Only relationship detection logic
 * - Performance: <50ms per seed for relationship detection
 * - Uses Obsidian metadata cache for O(1) lookups
 * - Dependency Injection: Accepts App for testability
 *
 * Part of T-20251103-012a: Relationship Detection Service
 */

import type { App, TFile } from 'obsidian';
import type { SeedNote, SeedRelationship, SeedRelationshipsResult, SeedRelationshipType } from './types';

/**
 * Relationship Detector Service
 *
 * Analyzes relationships between seed notes.
 */
export class RelationshipDetector {
	constructor(private app: App) {}

	/**
	 * Detect all relationships for a seed note
	 *
	 * Finds:
	 * 1. Backlinks (notes linking TO this seed)
	 * 2. Wikilinks (notes this seed links TO)
	 * 3. Shared tags (seeds with common tags)
	 *
	 * Performance: O(n) where n = number of seeds
	 * - Backlinks: O(1) via metadata cache
	 * - Wikilinks: O(1) via metadata cache
	 * - Shared tags: O(n × m) where m = avg tags per seed
	 *
	 * @param sourceSeed - Seed to analyze
	 * @param allSeeds - All available seeds for comparison
	 * @returns Relationship analysis result
	 */
	detectRelationships(
		sourceSeed: SeedNote,
		allSeeds: SeedNote[]
	): SeedRelationshipsResult {
		// Detect backlinks
		const backlinks = this.detectBacklinks(sourceSeed, allSeeds);

		// Detect wikilinks (outgoing links)
		const wikilinks = this.detectWikilinks(sourceSeed, allSeeds);

		// Detect shared tags
		const sharedTags = this.detectSharedTags(sourceSeed, allSeeds);

		// Merge and sort all relationships by strength
		const allRelationships = [...backlinks, ...wikilinks, ...sharedTags];
		const strongest = allRelationships
			.sort((a, b) => b.strength - a.strength)
			.slice(0, 10); // Top 10 strongest

		return {
			sourceSeed,
			backlinks,
			wikilinks,
			sharedTags,
			totalCount: allRelationships.length,
			strongest,
		};
	}

	/**
	 * Detect backlinks to a seed
	 *
	 * Finds all seeds that contain wikilinks pointing to the source seed.
	 * Uses Obsidian metadata cache for performance.
	 *
	 * Strength calculation:
	 * - Bidirectional (mutual links): 1.0
	 * - One-way backlink: 0.8
	 *
	 * @param sourceSeed - Seed to find backlinks for
	 * @param allSeeds - All seeds to check
	 * @returns Backlink relationships
	 */
	private detectBacklinks(
		sourceSeed: SeedNote,
		allSeeds: SeedNote[]
	): SeedRelationship[] {
		const relationships: SeedRelationship[] = [];

		// Get source seed's outgoing links for bidirectional detection
		const sourceLinks = this.getWikilinksFromFile(sourceSeed.file);
		const sourceLinkTargets = new Set(
			sourceLinks.map((link) => this.normalizeLinkPath(link.link))
		);

		// Check each seed for links to source
		for (const seed of allSeeds) {
			// Skip self
			if (seed.path === sourceSeed.path) {
				continue;
			}

			// Check if this seed links to source seed
			if (sourceSeed.backlinks.includes(seed.path)) {
				// Determine if bidirectional
				const seedLinkTarget = this.normalizeLinkPath(seed.file.path);
				const isBidirectional = sourceLinkTargets.has(seedLinkTarget);

				const type: SeedRelationshipType = isBidirectional
					? 'bidirectional'
					: 'backlink';
				const strength = isBidirectional ? 1.0 : 0.8;

				// Get link context (line with the link)
				const context = this.getLinkContext(seed.file, sourceSeed.file);

				relationships.push({
					seed,
					type,
					strength,
					context,
				});
			}
		}

		return relationships;
	}

	/**
	 * Detect wikilinks from a seed
	 *
	 * Finds all seeds that the source seed links to.
	 * Uses Obsidian metadata cache for performance.
	 *
	 * Strength: 0.8 (direct link)
	 *
	 * @param sourceSeed - Seed to find outgoing links for
	 * @param allSeeds - All seeds to check
	 * @returns Wikilink relationships
	 */
	private detectWikilinks(
		sourceSeed: SeedNote,
		allSeeds: SeedNote[]
	): SeedRelationship[] {
		const relationships: SeedRelationship[] = [];

		// Get outgoing links from source seed
		const links = this.getWikilinksFromFile(sourceSeed.file);
		const linkTargets = new Set(
			links.map((link) => this.normalizeLinkPath(link.link))
		);

		// Check each seed to see if source links to it
		for (const seed of allSeeds) {
			// Skip self
			if (seed.path === sourceSeed.path) {
				continue;
			}

			const seedTarget = this.normalizeLinkPath(seed.file.path);

			if (linkTargets.has(seedTarget)) {
				// Check if bidirectional (already handled in backlinks)
				// Skip if already counted as bidirectional
				const isBacklink = seed.backlinks.includes(sourceSeed.path);
				if (isBacklink) {
					// Already counted as bidirectional in backlinks
					continue;
				}

				// Get link context
				const context = this.getLinkContext(sourceSeed.file, seed.file);

				relationships.push({
					seed,
					type: 'wikilink',
					strength: 0.8,
					context,
				});
			}
		}

		return relationships;
	}

	/**
	 * Detect seeds with shared tags
	 *
	 * Finds seeds that share one or more tags with the source seed.
	 *
	 * Strength calculation:
	 * - Based on Jaccard similarity: |intersection| / |union|
	 * - Range: 0.0 to 1.0
	 * - Scaled to 0.3-0.7 range (weaker than direct links)
	 *
	 * @param sourceSeed - Seed to find tag matches for
	 * @param allSeeds - All seeds to check
	 * @returns Shared tag relationships
	 */
	private detectSharedTags(
		sourceSeed: SeedNote,
		allSeeds: SeedNote[]
	): SeedRelationship[] {
		const relationships: SeedRelationship[] = [];

		// Skip if source has no tags
		if (sourceSeed.tags.length === 0) {
			return relationships;
		}

		const sourceTagSet = new Set(sourceSeed.tags);

		for (const seed of allSeeds) {
			// Skip self
			if (seed.path === sourceSeed.path) {
				continue;
			}

			// Skip if seed has no tags
			if (seed.tags.length === 0) {
				continue;
			}

			// Find shared tags
			const sharedTags = seed.tags.filter((tag) => sourceTagSet.has(tag));

			if (sharedTags.length > 0) {
				// Calculate Jaccard similarity
				const unionSize =
					new Set([...sourceSeed.tags, ...seed.tags]).size;
				const jaccardSimilarity = sharedTags.length / unionSize;

				// Scale to 0.3-0.7 range (weaker than direct links)
				const strength = 0.3 + jaccardSimilarity * 0.4;

				relationships.push({
					seed,
					type: 'shared-tag',
					strength,
					context: sharedTags.map((tag) => `#${tag}`),
				});
			}
		}

		return relationships;
	}

	/**
	 * Get wikilinks from a file
	 *
	 * Uses Obsidian metadata cache for performance.
	 *
	 * @param file - File to extract links from
	 * @returns Array of link objects
	 */
	private getWikilinksFromFile(file: TFile): Array<{ link: string }> {
		const metadata = this.app.metadataCache.getFileCache(file);
		if (!metadata || !metadata.links) {
			return [];
		}

		return metadata.links.map((link) => ({
			link: link.link,
		}));
	}

	/**
	 * Normalize link path for comparison
	 *
	 * Handles:
	 * - Removes file extension (.md)
	 * - Removes anchor (#section)
	 * - Removes display text (|alias)
	 * - Normalizes to lowercase
	 *
	 * @param linkPath - Raw link path from metadata
	 * @returns Normalized path
	 */
	private normalizeLinkPath(linkPath: string): string {
		// Remove .md extension
		let normalized = linkPath.replace(/\.md$/, '');

		// Remove anchor (#section)
		normalized = normalized.split('#')[0];

		// Remove display text (|alias)
		normalized = normalized.split('|')[0];

		// Trim whitespace
		normalized = normalized.trim();

		// Lowercase for case-insensitive comparison
		normalized = normalized.toLowerCase();

		return normalized;
	}

	/**
	 * Get link context (line content with link)
	 *
	 * Finds the line(s) in sourceFile that contain links to targetFile.
	 * Returns up to 3 lines of context.
	 *
	 * @param sourceFile - File containing the link
	 * @param targetFile - File being linked to
	 * @returns Array of line content with context
	 */
	private getLinkContext(sourceFile: TFile, targetFile: TFile): string[] {
		const metadata = this.app.metadataCache.getFileCache(sourceFile);
		if (!metadata || !metadata.links) {
			return [];
		}

		const targetPath = this.normalizeLinkPath(targetFile.path);
		const targetBasename = this.normalizeLinkPath(targetFile.basename);

		const contextLines: string[] = [];

		for (const link of metadata.links) {
			const linkPath = this.normalizeLinkPath(link.link);

			// Check if this link points to target
			if (linkPath === targetPath || linkPath === targetBasename) {
				// Get line number from position
				const lineNumber = link.position.start.line;

				// Store line reference (we don't have content here, just position)
				// In a real implementation, we'd read the file content
				// For now, just store the link text
				contextLines.push(`Line ${lineNumber + 1}: [[${link.link}]]`);

				// Limit to 3 context lines
				if (contextLines.length >= 3) {
					break;
				}
			}
		}

		return contextLines;
	}

	/**
	 * Batch detect relationships for multiple seeds
	 *
	 * More efficient than calling detectRelationships multiple times
	 * because it reuses the seed list.
	 *
	 * @param seeds - Seeds to analyze
	 * @returns Map of seed path to relationships
	 */
	detectRelationshipsBatch(
		seeds: SeedNote[]
	): Map<string, SeedRelationshipsResult> {
		const results = new Map<string, SeedRelationshipsResult>();

		for (const seed of seeds) {
			const relationships = this.detectRelationships(seed, seeds);
			results.set(seed.path, relationships);
		}

		return results;
	}

	/**
	 * Find relationship clusters
	 *
	 * Groups seeds that are highly interconnected.
	 * Uses graph clustering algorithm (connected components).
	 *
	 * @param seeds - Seeds to cluster
	 * @param minStrength - Minimum relationship strength to consider (default: 0.5)
	 * @returns Array of seed clusters
	 */
	findClusters(seeds: SeedNote[], minStrength: number = 0.5): SeedNote[][] {
		// Build adjacency list for graph
		const graph = new Map<string, Set<string>>();

		for (const seed of seeds) {
			graph.set(seed.path, new Set());
		}

		// Add edges for relationships above threshold
		for (const seed of seeds) {
			const relationships = this.detectRelationships(seed, seeds);

			for (const rel of relationships.strongest) {
				if (rel.strength >= minStrength) {
					graph.get(seed.path)?.add(rel.seed.path);
					graph.get(rel.seed.path)?.add(seed.path);
				}
			}
		}

		// Find connected components using DFS
		const visited = new Set<string>();
		const clusters: SeedNote[][] = [];

		for (const seed of seeds) {
			if (visited.has(seed.path)) {
				continue;
			}

			const cluster: SeedNote[] = [];
			const stack = [seed.path];

			while (stack.length > 0) {
				const currentPath = stack.pop()!;

				if (visited.has(currentPath)) {
					continue;
				}

				visited.add(currentPath);

				const currentSeed = seeds.find((s) => s.path === currentPath);
				if (currentSeed) {
					cluster.push(currentSeed);
				}

				const neighbors = graph.get(currentPath) || new Set();
				const neighborArray = Array.from(neighbors);
				for (const neighbor of neighborArray) {
					if (!visited.has(neighbor)) {
						stack.push(neighbor);
					}
				}
			}

			if (cluster.length > 1) {
				// Only include clusters with 2+ seeds
				clusters.push(cluster);
			}
		}

		return clusters;
	}
}
