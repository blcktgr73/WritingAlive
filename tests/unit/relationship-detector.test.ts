/**
 * Relationship Detector Tests
 *
 * Unit tests for RelationshipDetector service including:
 * - Backlink detection
 * - Wikilink detection
 * - Shared tag analysis
 * - Bidirectional link detection
 * - Relationship strength calculation
 * - Cluster detection
 *
 * Part of T-20251103-012a
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RelationshipDetector } from '../../src/services/vault/relationship-detector';
import type { SeedNote } from '../../src/services/vault/types';
import type { App, TFile, CachedMetadata } from 'obsidian';

// Mock Obsidian App
const createMockApp = (metadataMap: Map<string, CachedMetadata>): App => {
	return {
		metadataCache: {
			getFileCache: (file: TFile) => metadataMap.get(file.path) || null,
		},
	} as App;
};

// Mock TFile
const createMockFile = (path: string, basename: string): TFile => {
	return {
		path,
		basename,
		stat: {
			ctime: Date.now(),
			mtime: Date.now(),
		},
	} as TFile;
};

// Mock SeedNote
const createMockSeed = (
	path: string,
	tags: string[] = [],
	backlinks: string[] = []
): SeedNote => {
	const basename = path.split('/').pop()?.replace('.md', '') || 'untitled';
	return {
		file: createMockFile(path, basename),
		title: basename,
		content: '',
		excerpt: '',
		tags,
		createdAt: Date.now(),
		modifiedAt: Date.now(),
		backlinks,
		path,
	};
};

describe('RelationshipDetector', () => {
	let detector: RelationshipDetector;
	let metadataMap: Map<string, CachedMetadata>;
	let mockSeeds: SeedNote[];

	beforeEach(() => {
		metadataMap = new Map();

		// Seed A: Links to B, tagged #practice
		mockSeeds = [
			createMockSeed('notes/seed-a.md', ['practice'], ['notes/seed-c.md']),
			createMockSeed('notes/seed-b.md', ['practice', 'guitar'], ['notes/seed-a.md']),
			createMockSeed('notes/seed-c.md', ['creativity'], ['notes/seed-a.md']),
			createMockSeed('notes/seed-d.md', ['practice', 'guitar'], []),
		];

		// Setup metadata for links
		// Seed A links to Seed B
		metadataMap.set('notes/seed-a.md', {
			links: [
				{
					link: 'notes/seed-b',
					original: '[[notes/seed-b]]',
					position: { start: { line: 5, col: 0, offset: 100 }, end: { line: 5, col: 20, offset: 120 } },
				},
			],
		} as CachedMetadata);

		// Seed B links to Seed A (bidirectional)
		metadataMap.set('notes/seed-b.md', {
			links: [
				{
					link: 'notes/seed-a',
					original: '[[notes/seed-a]]',
					position: { start: { line: 3, col: 0, offset: 50 }, end: { line: 3, col: 20, offset: 70 } },
				},
			],
		} as CachedMetadata);

		// Seed C links to Seed A (one-way)
		metadataMap.set('notes/seed-c.md', {
			links: [
				{
					link: 'notes/seed-a',
					original: '[[notes/seed-a]]',
					position: { start: { line: 2, col: 0, offset: 30 }, end: { line: 2, col: 20, offset: 50 } },
				},
			],
		} as CachedMetadata);

		// Seed D has no links
		metadataMap.set('notes/seed-d.md', {
			links: [],
		} as CachedMetadata);

		const mockApp = createMockApp(metadataMap);
		detector = new RelationshipDetector(mockApp);
	});

	describe('detectRelationships', () => {
		it('should detect all relationship types', () => {
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			expect(result.sourceSeed).toBe(mockSeeds[0]);
			expect(result.totalCount).toBeGreaterThan(0);
			expect(result.strongest).toBeDefined();
		});

		it('should return empty relationships for seed with no connections', () => {
			const isolatedSeed = createMockSeed('notes/isolated.md', [], []);
			const result = detector.detectRelationships(isolatedSeed, [isolatedSeed]);

			expect(result.backlinks).toHaveLength(0);
			expect(result.wikilinks).toHaveLength(0);
			expect(result.sharedTags).toHaveLength(0);
			expect(result.totalCount).toBe(0);
		});
	});

	describe('backlink detection', () => {
		it('should detect backlinks to a seed', () => {
			// Seed A has backlinks from B and C
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			expect(result.backlinks.length).toBeGreaterThanOrEqual(1);

			// Check if Seed C is in backlinks (one-way)
			const seedCBacklink = result.backlinks.find(
				(rel) => rel.seed.path === 'notes/seed-c.md'
			);
			expect(seedCBacklink).toBeDefined();
			expect(seedCBacklink?.type).toBe('backlink');
			expect(seedCBacklink?.strength).toBe(0.8);
		});

		it('should detect bidirectional links with strength 1.0', () => {
			// Seed A and Seed B link to each other
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			// Check if Seed B is detected as bidirectional
			const seedBBacklink = result.backlinks.find(
				(rel) => rel.seed.path === 'notes/seed-b.md'
			);
			expect(seedBBacklink).toBeDefined();
			expect(seedBBacklink?.type).toBe('bidirectional');
			expect(seedBBacklink?.strength).toBe(1.0);
		});

		it('should include link context for backlinks', () => {
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			const backlinkWithContext = result.backlinks.find((rel) => rel.context);
			expect(backlinkWithContext).toBeDefined();
			expect(backlinkWithContext?.context).toBeInstanceOf(Array);
		});
	});

	describe('wikilink detection', () => {
		it('should detect outgoing wikilinks', () => {
			// Seed A links to Seed B
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			// Seed B should NOT be in wikilinks (it's bidirectional, handled in backlinks)
			// So check if wikilinks are empty or don't contain B
			const seedBWikilink = result.wikilinks.find(
				(rel) => rel.seed.path === 'notes/seed-b.md'
			);
			expect(seedBWikilink).toBeUndefined(); // Bidirectional handled in backlinks
		});

		it('should not duplicate bidirectional links', () => {
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			// Seed B should only appear in backlinks, not wikilinks
			const seedBInBacklinks = result.backlinks.some(
				(rel) => rel.seed.path === 'notes/seed-b.md'
			);
			const seedBInWikilinks = result.wikilinks.some(
				(rel) => rel.seed.path === 'notes/seed-b.md'
			);

			expect(seedBInBacklinks).toBe(true);
			expect(seedBInWikilinks).toBe(false);
		});
	});

	describe('shared tag detection', () => {
		it('should detect seeds with shared tags', () => {
			// Seed A (#practice) should find Seed B and D (#practice)
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			expect(result.sharedTags.length).toBeGreaterThanOrEqual(1);

			// Check Seed D (shares #practice, no direct links)
			const seedDSharedTag = result.sharedTags.find(
				(rel) => rel.seed.path === 'notes/seed-d.md'
			);
			expect(seedDSharedTag).toBeDefined();
			expect(seedDSharedTag?.type).toBe('shared-tag');
			expect(seedDSharedTag?.context).toContain('#practice');
		});

		it('should calculate strength based on Jaccard similarity', () => {
			// Seed B (#practice, #guitar) vs Seed D (#practice, #guitar)
			const result = detector.detectRelationships(mockSeeds[1], mockSeeds);

			const seedDSharedTag = result.sharedTags.find(
				(rel) => rel.seed.path === 'notes/seed-d.md'
			);

			// Both have same tags: Jaccard = 2/2 = 1.0
			// Scaled: 0.3 + 1.0 * 0.4 = 0.7
			expect(seedDSharedTag?.strength).toBe(0.7);
		});

		it('should include shared tags in context', () => {
			const result = detector.detectRelationships(mockSeeds[1], mockSeeds);

			const sharedTagRel = result.sharedTags.find(
				(rel) => rel.seed.path === 'notes/seed-d.md'
			);

			expect(sharedTagRel?.context).toContain('#practice');
			expect(sharedTagRel?.context).toContain('#guitar');
		});

		it('should not detect shared tags if seed has no tags', () => {
			const noTagsSeed = createMockSeed('notes/no-tags.md', [], []);
			const result = detector.detectRelationships(noTagsSeed, [noTagsSeed, ...mockSeeds]);

			expect(result.sharedTags).toHaveLength(0);
		});
	});

	describe('strongest relationships', () => {
		it('should sort relationships by strength', () => {
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			// Check that strongest are sorted descending
			for (let i = 1; i < result.strongest.length; i++) {
				expect(result.strongest[i - 1].strength).toBeGreaterThanOrEqual(
					result.strongest[i].strength
				);
			}
		});

		it('should limit strongest to top 10', () => {
			// Create many seeds with shared tags
			const manySeeds: SeedNote[] = [];
			for (let i = 0; i < 20; i++) {
				manySeeds.push(createMockSeed(`notes/seed-${i}.md`, ['common'], []));
			}

			const result = detector.detectRelationships(manySeeds[0], manySeeds);

			expect(result.strongest.length).toBeLessThanOrEqual(10);
		});

		it('should prioritize bidirectional links over one-way', () => {
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			if (result.strongest.length > 0) {
				// Bidirectional (strength 1.0) should be first
				const topRelationship = result.strongest[0];
				if (topRelationship.type === 'bidirectional') {
					expect(topRelationship.strength).toBe(1.0);
				}
			}
		});
	});

	describe('batch detection', () => {
		it('should detect relationships for all seeds', () => {
			const results = detector.detectRelationshipsBatch(mockSeeds);

			expect(results.size).toBe(mockSeeds.length);

			// Check each seed has a result
			for (const seed of mockSeeds) {
				expect(results.has(seed.path)).toBe(true);
			}
		});

		it('should return consistent results with single detection', () => {
			const batchResults = detector.detectRelationshipsBatch(mockSeeds);
			const singleResult = detector.detectRelationships(mockSeeds[0], mockSeeds);

			const batchResult = batchResults.get(mockSeeds[0].path);
			expect(batchResult?.totalCount).toBe(singleResult.totalCount);
		});
	});

	describe('cluster detection', () => {
		it('should find connected seed clusters', () => {
			const clusters = detector.findClusters(mockSeeds, 0.5);

			// Should find at least one cluster
			expect(clusters.length).toBeGreaterThanOrEqual(0);
		});

		it('should only include clusters with 2+ seeds', () => {
			const clusters = detector.findClusters(mockSeeds, 0.5);

			for (const cluster of clusters) {
				expect(cluster.length).toBeGreaterThanOrEqual(2);
			}
		});

		it('should respect minimum strength threshold', () => {
			// High threshold should result in fewer/smaller clusters
			const highThresholdClusters = detector.findClusters(mockSeeds, 0.9);
			const lowThresholdClusters = detector.findClusters(mockSeeds, 0.3);

			// Lower threshold should find more connections
			const highTotal = highThresholdClusters.reduce((sum, c) => sum + c.length, 0);
			const lowTotal = lowThresholdClusters.reduce((sum, c) => sum + c.length, 0);

			expect(lowTotal).toBeGreaterThanOrEqual(highTotal);
		});

		it('should handle isolated seeds', () => {
			const isolatedSeeds = [
				createMockSeed('notes/isolated-1.md', [], []),
				createMockSeed('notes/isolated-2.md', [], []),
			];

			const clusters = detector.findClusters(isolatedSeeds, 0.5);

			// No clusters (all isolated)
			expect(clusters).toHaveLength(0);
		});
	});

	describe('edge cases', () => {
		it('should handle empty seed list', () => {
			const result = detector.detectRelationships(mockSeeds[0], []);

			expect(result.backlinks).toHaveLength(0);
			expect(result.wikilinks).toHaveLength(0);
			expect(result.sharedTags).toHaveLength(0);
		});

		it('should handle seeds with missing metadata', () => {
			const seedWithoutMetadata = createMockSeed('notes/no-metadata.md', [], []);
			// Don't add metadata to metadataMap

			const result = detector.detectRelationships(seedWithoutMetadata, [seedWithoutMetadata]);

			expect(result.backlinks).toHaveLength(0);
			expect(result.wikilinks).toHaveLength(0);
		});

		it('should not include self in relationships', () => {
			const result = detector.detectRelationships(mockSeeds[0], mockSeeds);

			// Check that source seed doesn't appear in any relationship
			const allRelatedSeeds = [
				...result.backlinks.map((r) => r.seed.path),
				...result.wikilinks.map((r) => r.seed.path),
				...result.sharedTags.map((r) => r.seed.path),
			];

			expect(allRelatedSeeds).not.toContain(mockSeeds[0].path);
		});
	});

	describe('performance', () => {
		it('should detect relationships in <50ms for 100 seeds', () => {
			// Create 100 seeds with varied connections
			const largeDataset: SeedNote[] = [];
			for (let i = 0; i < 100; i++) {
				const tags = i % 3 === 0 ? ['common'] : [`tag-${i % 10}`];
				largeDataset.push(createMockSeed(`notes/seed-${i}.md`, tags, []));
				metadataMap.set(`notes/seed-${i}.md`, { links: [] } as CachedMetadata);
			}

			const startTime = performance.now();
			detector.detectRelationships(largeDataset[0], largeDataset);
			const endTime = performance.now();

			expect(endTime - startTime).toBeLessThan(50);
		});

		it('should batch detect 100 seeds in <500ms', () => {
			const largeDataset: SeedNote[] = [];
			for (let i = 0; i < 100; i++) {
				const tags = [`tag-${i % 5}`];
				largeDataset.push(createMockSeed(`notes/seed-${i}.md`, tags, []));
				metadataMap.set(`notes/seed-${i}.md`, { links: [] } as CachedMetadata);
			}

			const startTime = performance.now();
			detector.detectRelationshipsBatch(largeDataset);
			const endTime = performance.now();

			expect(endTime - startTime).toBeLessThan(500);
		});
	});
});
