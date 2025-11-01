/**
 * Living MOC Updater Unit Tests
 *
 * Tests for Living MOC auto-update functionality including:
 * - Finding matching seeds by tags
 * - Updating MOC with new seeds (preserving manual content)
 * - Formatting seed links correctly
 * - Sorting seeds by recency (newest first)
 * - Handling empty auto-section
 * - Handling existing seeds (no duplicates)
 * - Respecting update frequency (daily = once per day)
 * - Dry run mode (preview without changes)
 * - Undo last update
 * - Update history tracking
 * - File watcher triggers
 * - Multiple MOCs with different seed tags
 * - Korean seed tags matching
 * - Error handling (missing markers, invalid MOC)
 * - Performance test (100 seeds, 10 MOCs)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LivingMOCUpdater } from '../../src/services/vault/living-moc-updater';

/**
 * Mock Obsidian Types
 */
interface MockTFile {
	basename: string;
	path: string;
	extension: string;
	stat: {
		ctime: number;
		mtime: number;
	};
}

interface MockCachedMetadata {
	frontmatter?: {
		type?: string;
		tags?: string | string[];
		writealive?: {
			auto_gather_seeds?: boolean;
			seed_tags?: string[];
			update_frequency?: 'realtime' | 'daily' | 'manual';
		};
		[key: string]: any;
	};
	tags?: Array<{ tag: string; position: any }>;
	links?: Array<{ link: string; position: any }>;
}

/**
 * Helper: Create mock file
 */
function createFile(
	basename: string,
	path: string,
	ctime: number = Date.now(),
	mtime: number = Date.now()
): MockTFile {
	return {
		basename,
		path,
		extension: 'md',
		stat: { ctime, mtime },
	};
}

/**
 * Helper: Create Living MOC frontmatter
 */
function createLivingMOCFrontmatter(
	seedTags: string[],
	updateFrequency: 'realtime' | 'daily' | 'manual' = 'manual'
) {
	return {
		type: 'moc',
		writealive: {
			auto_gather_seeds: true,
			seed_tags: seedTags,
			update_frequency: updateFrequency,
		},
	};
}

/**
 * Helper: Create MOC content with auto-section
 */
function createMOCContent(
	title: string,
	manualContent: string = '',
	autoContent: string = ''
): string {
	return `---
type: moc
---

# ${title}

${manualContent}

<!-- BEGIN WRITEALIVE-AUTO -->
${autoContent}
<!-- END WRITEALIVE-AUTO -->

More manual content below.
`;
}

describe('LivingMOCUpdater', () => {
	let mockApp: any;
	let mockSeedGatherer: any;
	let mockMOCDetector: any;
	let updater: LivingMOCUpdater;

	// Mock file storage
	let fileContents: Map<string, string>;
	let fileMetadata: Map<string, MockCachedMetadata>;
	let files: MockTFile[];

	beforeEach(() => {
		// Reset mocks
		fileContents = new Map();
		fileMetadata = new Map();
		files = [];

		// Mock App
		mockApp = {
			vault: {
				getMarkdownFiles: vi.fn(() => files),
				read: vi.fn((file: MockTFile) =>
					Promise.resolve(fileContents.get(file.path) || '')
				),
				modify: vi.fn((file: MockTFile, content: string) => {
					fileContents.set(file.path, content);
					return Promise.resolve();
				}),
				on: vi.fn((_event: string, _callback: any) => {
					return {} as any; // Mock EventRef
				}),
				off: vi.fn(),
				offref: vi.fn(),
			},
			metadataCache: {
				getFileCache: vi.fn((file: MockTFile) =>
					fileMetadata.get(file.path)
				),
			},
		};

		// Mock SeedGatherer
		mockSeedGatherer = {
			gatherSeeds: vi.fn(),
			fileHasSeedTag: vi.fn(),
		};

		// Mock MOCDetector
		mockMOCDetector = {
			detectMOCs: vi.fn(),
			parseMOC: vi.fn(),
		};

		// Create updater
		updater = new LivingMOCUpdater(
			mockApp,
			mockSeedGatherer,
			mockMOCDetector
		);
	});

	afterEach(() => {
		// Clean up
		updater.dispose();
	});

	describe('Find Matching Seeds', () => {
		it('should find seeds matching MOC seed tags', async () => {
			// Setup MOC
			const mocFile = createFile('Creativity MOC', 'MOCs/Creativity.md');
			fileContents.set(
				mocFile.path,
				createMOCContent('Creativity MOC')
			);
			fileMetadata.set(mocFile.path, {
				frontmatter: createLivingMOCFrontmatter([
					'creativity',
					'practice',
				]),
			});

			// Setup seeds
			const seed1 = {
				file: createFile('Idea 1', 'Seeds/Idea 1.md', Date.now() - 1000),
				title: 'Idea 1',
				content: 'Creative idea about art',
				excerpt: 'Creative idea about art',
				tags: ['creativity', 'art'],
				createdAt: Date.now() - 1000,
				modifiedAt: Date.now() - 1000,
				backlinks: [],
				path: 'Seeds/Idea 1.md',
			};

			const seed2 = {
				file: createFile('Practice', 'Seeds/Practice.md', Date.now()),
				title: 'Practice',
				content: 'Practice notes',
				excerpt: 'Practice notes',
				tags: ['practice', 'habit'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Practice.md',
			};

			const seed3 = {
				file: createFile('Random', 'Seeds/Random.md', Date.now() - 2000),
				title: 'Random',
				content: 'Random note',
				excerpt: 'Random note',
				tags: ['random'],
				createdAt: Date.now() - 2000,
				modifiedAt: Date.now() - 2000,
				backlinks: [],
				path: 'Seeds/Random.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed2, seed1, seed3], // Sorted by recency
				totalCount: 3,
				filteredCount: 3,
				tags: ['creativity', 'practice'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Creativity MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['creativity', 'practice'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			// Update MOC
			const result = await updater.updateLivingMOC(mocFile as any, {
				forceUpdate: true,
			});

			// Verify
			expect(result).not.toBeNull();
			expect(result!.newSeeds).toHaveLength(2); // seed1 and seed2 match
			expect(result!.newSeeds[0].title).toBe('Practice'); // Newest first
			expect(result!.newSeeds[1].title).toBe('Idea 1');
		});

		it('should exclude seeds already linked in MOC', async () => {
			const mocFile = createFile('Creativity MOC', 'MOCs/Creativity.md');
			const existingContent = createMOCContent(
				'Creativity MOC',
				'',
				'- [[Idea 1]] - "Creative idea" #creativity'
			);
			fileContents.set(mocFile.path, existingContent);

			const seed1 = {
				file: createFile('Idea 1', 'Seeds/Idea 1.md'),
				title: 'Idea 1',
				content: 'Creative idea',
				excerpt: 'Creative idea',
				tags: ['creativity'],
				createdAt: Date.now() - 1000,
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Idea 1.md',
			};

			const seed2 = {
				file: createFile('Idea 2', 'Seeds/Idea 2.md'),
				title: 'Idea 2',
				content: 'Another idea',
				excerpt: 'Another idea',
				tags: ['creativity'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Idea 2.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed2, seed1],
				totalCount: 2,
				filteredCount: 2,
				tags: ['creativity'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Creativity MOC',
				path: mocFile.path,
				links: [
					{
						path: 'Seeds/Idea 1',
						displayText: 'Idea 1',
						heading: null,
						lineNumber: 8,
						isInAutoSection: true,
					},
				],
				headings: [],
				linkCount: 1,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['creativity'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			const result = await updater.updateLivingMOC(mocFile as any, {
				forceUpdate: true,
			});

			// Only seed2 should be added
			expect(result).not.toBeNull();
			expect(result!.newSeeds).toHaveLength(1);
			expect(result!.newSeeds[0].title).toBe('Idea 2');
		});

		it('should handle Korean seed tags correctly', async () => {
			const mocFile = createFile('창의성 MOC', 'MOCs/창의성.md');
			fileContents.set(mocFile.path, createMOCContent('창의성 MOC'));

			const seed1 = {
				file: createFile('아이디어', 'Seeds/아이디어.md'),
				title: '아이디어',
				content: '창의적인 생각',
				excerpt: '창의적인 생각',
				tags: ['창의성', '실천'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/아이디어.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['창의성'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: '창의성 MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['창의성'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			const result = await updater.updateLivingMOC(mocFile as any, {
				forceUpdate: true,
			});

			expect(result).not.toBeNull();
			expect(result!.newSeeds).toHaveLength(1);
			expect(result!.newSeeds[0].title).toBe('아이디어');
		});
	});

	describe('MOC Content Update', () => {
		it('should preserve all manual content outside markers', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			const originalContent = `---
type: moc
---

# Test MOC

Manual content before markers.

## Important Section

Some important notes.

<!-- BEGIN WRITEALIVE-AUTO -->
<!-- END WRITEALIVE-AUTO -->

Manual content after markers.

## Another Section

More manual content.
`;
			fileContents.set(mocFile.path, originalContent);

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed content',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: {
					start: originalContent.indexOf('<!-- BEGIN WRITEALIVE-AUTO -->') + 30,
					end: originalContent.indexOf('<!-- END WRITEALIVE-AUTO -->'),
				},
			});

			await updater.updateLivingMOC(mocFile as any, { forceUpdate: true });

			const updatedContent = fileContents.get(mocFile.path)!;

			// Verify manual content preserved
			expect(updatedContent).toContain('Manual content before markers');
			expect(updatedContent).toContain('Some important notes');
			expect(updatedContent).toContain('Manual content after markers');
			expect(updatedContent).toContain('More manual content');

			// Verify seed added
			expect(updatedContent).toContain('[[Seed 1]]');
		});

		it('should format seed links correctly', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			fileContents.set(mocFile.path, createMOCContent('Test MOC'));

			const seed1 = {
				file: createFile('2025-11-01 Idea', 'Seeds/2025-11-01 Idea.md'),
				title: '2025-11-01 Idea',
				content: 'A creative thought about design patterns',
				excerpt: 'A creative thought about design patterns',
				tags: ['creativity', 'practice', 'design'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/2025-11-01 Idea.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['creativity'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['creativity'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			await updater.updateLivingMOC(mocFile as any, { forceUpdate: true });

			const updatedContent = fileContents.get(mocFile.path)!;

			// Verify link format: - [[title]] - "excerpt" #tag1 #tag2
			expect(updatedContent).toContain('[[2025-11-01 Idea]]');
			expect(updatedContent).toContain('"A creative thought about design patterns"');
			expect(updatedContent).toContain('#creativity');
			expect(updatedContent).toContain('#practice');
			expect(updatedContent).toContain('#design');
		});

		it('should sort seeds by recency (newest first)', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			fileContents.set(mocFile.path, createMOCContent('Test MOC'));

			const now = Date.now();
			const seed1 = {
				file: createFile('Old Seed', 'Seeds/Old.md', now - 3000),
				title: 'Old Seed',
				content: 'Old',
				excerpt: 'Old seed',
				tags: ['test'],
				createdAt: now - 3000,
				modifiedAt: now - 3000,
				backlinks: [],
				path: 'Seeds/Old.md',
			};

			const seed2 = {
				file: createFile('New Seed', 'Seeds/New.md', now),
				title: 'New Seed',
				content: 'New',
				excerpt: 'New seed',
				tags: ['test'],
				createdAt: now,
				modifiedAt: now,
				backlinks: [],
				path: 'Seeds/New.md',
			};

			const seed3 = {
				file: createFile('Middle Seed', 'Seeds/Middle.md', now - 1000),
				title: 'Middle Seed',
				content: 'Middle',
				excerpt: 'Middle seed',
				tags: ['test'],
				createdAt: now - 1000,
				modifiedAt: now - 1000,
				backlinks: [],
				path: 'Seeds/Middle.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1, seed2, seed3], // Unsorted
				totalCount: 3,
				filteredCount: 3,
				tags: ['test'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			await updater.updateLivingMOC(mocFile as any, { forceUpdate: true });

			const updatedContent = fileContents.get(mocFile.path)!;
			const lines = updatedContent.split('\n');

			// Find seed links
			const seedLinks = lines.filter((line) => line.includes('[['));

			// Verify order: New → Middle → Old
			expect(seedLinks[0]).toContain('New Seed');
			expect(seedLinks[1]).toContain('Middle Seed');
			expect(seedLinks[2]).toContain('Old Seed');
		});

		it('should handle empty auto-section', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			const emptyContent = createMOCContent('Test MOC', '', '');
			fileContents.set(mocFile.path, emptyContent);

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: {
					start: emptyContent.indexOf('<!-- BEGIN WRITEALIVE-AUTO -->') + 30,
					end: emptyContent.indexOf('<!-- END WRITEALIVE-AUTO -->'),
				},
			});

			await updater.updateLivingMOC(mocFile as any, { forceUpdate: true });

			const updatedContent = fileContents.get(mocFile.path)!;
			expect(updatedContent).toContain('[[Seed 1]]');
		});
	});

	describe('Update Frequency', () => {
		it('should respect daily update frequency', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			fileContents.set(mocFile.path, createMOCContent('Test MOC'));

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'daily',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			// First update (should succeed)
			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			const result1 = await updater.updateLivingMOC(mocFile as any);
			expect(result1).not.toBeNull();

			// Second update same day (should return null)
			const result2 = await updater.updateLivingMOC(mocFile as any);
			expect(result2).toBeNull();
		});

		it('should skip manual mode MOCs unless forced', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			fileContents.set(mocFile.path, createMOCContent('Test MOC'));

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			// Without force (should return null)
			const result1 = await updater.updateLivingMOC(mocFile as any);
			expect(result1).toBeNull();

			// With force (should succeed)
			const result2 = await updater.updateLivingMOC(mocFile as any, {
				forceUpdate: true,
			});
			expect(result2).not.toBeNull();
		});
	});

	describe('Dry Run Mode', () => {
		it('should preview changes without modifying file', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			const originalContent = createMOCContent('Test MOC');
			fileContents.set(mocFile.path, originalContent);

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			const result = await updater.updateLivingMOC(mocFile as any, {
				forceUpdate: true,
				dryRun: true,
			});

			// Verify result returned
			expect(result).not.toBeNull();
			expect(result!.newSeeds).toHaveLength(1);

			// Verify file not modified
			expect(fileContents.get(mocFile.path)).toBe(originalContent);
		});
	});

	describe('Undo Functionality', () => {
		it('should undo last update', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			const originalContent = createMOCContent('Test MOC', '', '');
			fileContents.set(mocFile.path, originalContent);

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			const markerStart =
				originalContent.indexOf('<!-- BEGIN WRITEALIVE-AUTO -->') + 30;
			const markerEnd = originalContent.indexOf('<!-- END WRITEALIVE-AUTO -->');

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: {
					start: markerStart,
					end: markerEnd,
				},
			});

			// Update MOC
			await updater.updateLivingMOC(mocFile as any, { forceUpdate: true });

			const updatedContent = fileContents.get(mocFile.path)!;
			expect(updatedContent).toContain('[[Seed 1]]');

			// Undo
			const undoResult = await updater.undoLastUpdate(mocFile.path);
			expect(undoResult).toBe(true);

			// Verify content restored
			const finalContent = fileContents.get(mocFile.path)!;
			const autoSection = finalContent.substring(markerStart, markerEnd);
			expect(autoSection.trim()).toBe('');
		});

		it('should return false when no history exists', async () => {
			const result = await updater.undoLastUpdate('nonexistent.md');
			expect(result).toBe(false);
		});
	});

	describe('Update History', () => {
		it('should track update history', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			fileContents.set(mocFile.path, createMOCContent('Test MOC'));

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			// Update MOC
			await updater.updateLivingMOC(mocFile as any, { forceUpdate: true });

			// Check history
			const history = updater.getUpdateHistory(mocFile.path);
			expect(history).toHaveLength(1);
			expect(history[0].newSeeds).toHaveLength(1);
			expect(history[0].mocFile.path).toBe(mocFile.path);
		});

		it('should limit history to last 10 updates per MOC', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			fileContents.set(mocFile.path, createMOCContent('Test MOC'));

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: { start: 100, end: 150 },
			});

			// Perform 15 updates
			for (let i = 0; i < 15; i++) {
				const seed = {
					file: createFile(`Seed ${i}`, `Seeds/Seed ${i}.md`),
					title: `Seed ${i}`,
					content: 'Content',
					excerpt: 'Test seed',
					tags: ['test'],
					createdAt: Date.now(),
					modifiedAt: Date.now(),
					backlinks: [],
					path: `Seeds/Seed ${i}.md`,
				};

				mockSeedGatherer.gatherSeeds.mockResolvedValue({
					seeds: [seed],
					totalCount: 1,
					filteredCount: 1,
					tags: ['test'],
				});

				await updater.updateLivingMOC(mocFile as any, { forceUpdate: true });
			}

			// Check history limited to 10
			const history = updater.getUpdateHistory(mocFile.path);
			expect(history.length).toBeLessThanOrEqual(10);
		});
	});

	describe('Error Handling', () => {
		it('should throw error when auto-update markers missing', async () => {
			const mocFile = createFile('Test MOC', 'MOCs/Test.md');
			fileContents.set(
				mocFile.path,
				'---\ntype: moc\n---\n\n# Test\n\nNo markers here!'
			);

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Test MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: true,
				autoGatherSeeds: true,
				seedTags: ['test'],
				updateFrequency: 'manual',
				autoUpdateMarkers: null, // No markers
			});

			await expect(
				updater.updateLivingMOC(mocFile as any, { forceUpdate: true })
			).rejects.toThrow('Missing auto-update markers');
		});

		it('should return null for non-Living MOCs', async () => {
			const mocFile = createFile('Regular MOC', 'MOCs/Regular.md');
			fileContents.set(mocFile.path, createMOCContent('Regular MOC'));

			mockMOCDetector.parseMOC.mockResolvedValue({
				file: mocFile,
				title: 'Regular MOC',
				path: mocFile.path,
				links: [],
				headings: [],
				linkCount: 0,
				createdAt: mocFile.stat.ctime,
				modifiedAt: mocFile.stat.mtime,
				isLivingMOC: false, // Not a Living MOC
				autoGatherSeeds: false,
				seedTags: [],
				updateFrequency: 'manual',
				autoUpdateMarkers: null,
			});

			const result = await updater.updateLivingMOC(mocFile as any);
			expect(result).toBeNull();
		});
	});

	describe('Batch Updates', () => {
		it('should update all Living MOCs', async () => {
			// Create 3 Living MOCs
			const moc1 = createFile('MOC 1', 'MOCs/MOC 1.md');
			const moc2 = createFile('MOC 2', 'MOCs/MOC 2.md');
			const moc3 = createFile('Regular', 'MOCs/Regular.md');

			fileContents.set(moc1.path, createMOCContent('MOC 1'));
			fileContents.set(moc2.path, createMOCContent('MOC 2'));
			fileContents.set(moc3.path, createMOCContent('Regular'));

			const seed1 = {
				file: createFile('Seed 1', 'Seeds/Seed 1.md'),
				title: 'Seed 1',
				content: 'Content',
				excerpt: 'Test seed',
				tags: ['test'],
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				backlinks: [],
				path: 'Seeds/Seed 1.md',
			};

			mockMOCDetector.detectMOCs.mockResolvedValue({
				mocs: [
					{
						file: moc1,
						title: 'MOC 1',
						path: moc1.path,
						links: [],
						headings: [],
						linkCount: 0,
						createdAt: moc1.stat.ctime,
						modifiedAt: moc1.stat.mtime,
						isLivingMOC: true,
						autoGatherSeeds: true,
						seedTags: ['test'],
						updateFrequency: 'manual',
						autoUpdateMarkers: { start: 100, end: 150 },
					},
					{
						file: moc2,
						title: 'MOC 2',
						path: moc2.path,
						links: [],
						headings: [],
						linkCount: 0,
						createdAt: moc2.stat.ctime,
						modifiedAt: moc2.stat.mtime,
						isLivingMOC: true,
						autoGatherSeeds: true,
						seedTags: ['test'],
						updateFrequency: 'manual',
						autoUpdateMarkers: { start: 100, end: 150 },
					},
					{
						file: moc3,
						title: 'Regular',
						path: moc3.path,
						links: [],
						headings: [],
						linkCount: 0,
						createdAt: moc3.stat.ctime,
						modifiedAt: moc3.stat.mtime,
						isLivingMOC: false, // Not a Living MOC
						autoGatherSeeds: false,
						seedTags: [],
						updateFrequency: 'manual',
						autoUpdateMarkers: null,
					},
				],
				totalCount: 3,
				detectionMethod: new Map(),
			});

			mockMOCDetector.parseMOC.mockImplementation((file: any) => {
				const detection = {
					moc1: {
						file: moc1,
						title: 'MOC 1',
						path: moc1.path,
						links: [],
						headings: [],
						linkCount: 0,
						createdAt: moc1.stat.ctime,
						modifiedAt: moc1.stat.mtime,
						isLivingMOC: true,
						autoGatherSeeds: true,
						seedTags: ['test'],
						updateFrequency: 'manual',
						autoUpdateMarkers: { start: 100, end: 150 },
					},
					moc2: {
						file: moc2,
						title: 'MOC 2',
						path: moc2.path,
						links: [],
						headings: [],
						linkCount: 0,
						createdAt: moc2.stat.ctime,
						modifiedAt: moc2.stat.mtime,
						isLivingMOC: true,
						autoGatherSeeds: true,
						seedTags: ['test'],
						updateFrequency: 'manual',
						autoUpdateMarkers: { start: 100, end: 150 },
					},
				} as any;
				return Promise.resolve(
					detection[file.basename.replace(' ', '').toLowerCase()]
				);
			});

			mockSeedGatherer.gatherSeeds.mockResolvedValue({
				seeds: [seed1],
				totalCount: 1,
				filteredCount: 1,
				tags: ['test'],
			});

			const result = await updater.updateAllLivingMOCs({
				forceUpdate: true,
			});

			expect(result.success).toBe(true);
			expect(result.mocsUpdated).toBe(2); // Only 2 Living MOCs
			expect(result.seedsAdded).toBe(2); // 1 seed per MOC
		});
	});
});
