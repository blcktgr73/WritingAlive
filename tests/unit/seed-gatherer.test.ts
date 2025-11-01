/**
 * Seed Gatherer Unit Tests
 *
 * Tests for vault seed gathering functionality including:
 * - Tag parsing and normalization
 * - File tag detection (inline and frontmatter)
 * - Date filtering
 * - Sorting
 * - Excerpt creation
 * - Backlinks extraction
 * - Korean and emoji tag support
 * - Performance with large vaults
 */

import { describe, it, expect, vi } from 'vitest';
import { SeedGatherer } from '../../src/services/vault/seed-gatherer';

/**
 * Mock Obsidian Types
 */
interface MockTFile {
	basename: string;
	path: string;
	stat: {
		ctime: number;
		mtime: number;
	};
}

interface MockCachedMetadata {
	frontmatter?: {
		tags?: string | string[];
		tag?: string | string[];
		[key: string]: any;
	};
	tags?: Array<{ tag: string; position: any }>;
	links?: Array<{ link: string; position: any }>;
}

interface MockBacklinks {
	data: Map<string, any>;
}

/**
 * Mock Obsidian App
 */
function createMockApp(files: MockTFile[], metadata: Map<MockTFile, MockCachedMetadata>, contents: Map<MockTFile, string>, backlinks: Map<MockTFile, MockBacklinks>) {
	return {
		vault: {
			getMarkdownFiles: vi.fn(() => files),
			read: vi.fn((file: MockTFile) => Promise.resolve(contents.get(file) || '')),
		},
		metadataCache: {
			getFileCache: vi.fn((file: MockTFile) => metadata.get(file) || null),
			getBacklinksForFile: vi.fn((file: MockTFile) => backlinks.get(file) || { data: new Map() }),
		},
	} as any;
}

/**
 * Helper: Create mock file
 */
function createFile(basename: string, path: string, ctime: number, mtime: number): MockTFile {
	return {
		basename,
		path,
		stat: { ctime, mtime },
	};
}

/**
 * Helper: Create date timestamp
 */
function daysAgo(days: number): number {
	return Date.now() - days * 24 * 60 * 60 * 1000;
}

describe('SeedGatherer', () => {
	describe('Tag Parsing and Normalization', () => {
		it('should normalize tags to lowercase', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tags: ['SEED'] },
			});
			contents.set(file1, 'Test content');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
			expect(result.seeds[0].tags).toContain('seed');
		});

		it('should remove # prefix from tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				tags: [{ tag: '#seed', position: {} }],
			});
			contents.set(file1, 'Test content');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['#seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
		});

		it('should handle Korean tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('한글노트', '한글노트.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tags: ['씨앗'] },
			});
			contents.set(file1, 'Christopher Alexander의 Nature of Order에서 설명하는 Centers 개념은...');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['씨앗']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
			expect(result.seeds[0].tags).toContain('씨앗');
		});

		it('should handle emoji tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Idea', 'Idea.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				tags: [{ tag: '#💡', position: {} }],
			});
			contents.set(file1, 'Brilliant idea!');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['💡']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
			expect(result.seeds[0].tags).toContain('💡');
		});

		it('should handle comma-separated tags with spaces', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			const file2 = createFile('Note2', 'Note2.md', Date.now(), Date.now());
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['idea'] } });
			contents.set(file1, 'Content 1');
			contents.set(file2, 'Content 2');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			// Simulating settings: "seed, idea , 💡"
			const gatherer = new SeedGatherer(app, () => ['seed', ' idea ', ' 💡']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(2);
		});
	});

	describe('Tag Detection', () => {
		it('should find inline tags in content', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				tags: [{ tag: '#seed', position: {} }],
			});
			contents.set(file1, 'This is a #seed for a great article.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
			expect(result.seeds[0].tags).toContain('seed');
		});

		it('should find frontmatter tags (array)', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tags: ['seed', 'idea', 'draft'] },
			});
			contents.set(file1, '---\ntags: [seed, idea, draft]\n---\n\nContent here.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
			expect(result.seeds[0].tags).toContain('seed');
			expect(result.seeds[0].tags).toContain('idea');
			expect(result.seeds[0].tags).toContain('draft');
		});

		it('should find frontmatter tags (string)', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tags: 'seed' },
			});
			contents.set(file1, '---\ntags: seed\n---\n\nContent here.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
		});

		it('should find frontmatter tag field (singular)', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tag: 'seed' },
			});
			contents.set(file1, '---\ntag: seed\n---\n\nContent here.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
		});

		it('should combine inline and frontmatter tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tags: ['seed'] },
				tags: [{ tag: '#idea', position: {} }],
			});
			contents.set(file1, '---\ntags: [seed]\n---\n\nThis is an #idea.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed', 'idea']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
			expect(result.seeds[0].tags).toContain('seed');
			expect(result.seeds[0].tags).toContain('idea');
		});

		it('should handle multiple target tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			const file2 = createFile('Note2', 'Note2.md', Date.now(), Date.now());
			const file3 = createFile('Note3', 'Note3.md', Date.now(), Date.now());
			files.push(file1, file2, file3);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['idea'] } });
			metadata.set(file3, { frontmatter: { tags: ['draft'] } }); // Not a seed tag
			contents.set(file1, 'Content 1');
			contents.set(file2, 'Content 2');
			contents.set(file3, 'Content 3');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });
			backlinks.set(file3, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed', 'idea']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(2);
			expect(result.totalCount).toBe(2);
		});
	});

	describe('Date Filtering', () => {
		it('should filter by "today"', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const now = Date.now();
			const today = new Date(now);
			today.setHours(10, 0, 0, 0);

			const file1 = createFile('Today', 'Today.md', today.getTime(), today.getTime());
			const file2 = createFile('Yesterday', 'Yesterday.md', daysAgo(1), daysAgo(1));
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'Today note');
			contents.set(file2, 'Yesterday note');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ dateFilter: 'today' });

			expect(result.filteredCount).toBe(1);
			expect(result.seeds[0].title).toBe('Today');
		});

		it('should filter by "week"', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Recent', 'Recent.md', daysAgo(3), daysAgo(3));
			const file2 = createFile('Old', 'Old.md', daysAgo(10), daysAgo(10));
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'Recent note');
			contents.set(file2, 'Old note');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ dateFilter: 'week' });

			expect(result.filteredCount).toBe(1);
			expect(result.seeds[0].title).toBe('Recent');
		});

		it('should filter by "month"', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Recent', 'Recent.md', daysAgo(20), daysAgo(20));
			const file2 = createFile('Old', 'Old.md', daysAgo(40), daysAgo(40));
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'Recent note');
			contents.set(file2, 'Old note');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ dateFilter: 'month' });

			expect(result.filteredCount).toBe(1);
			expect(result.seeds[0].title).toBe('Recent');
		});

		it('should return all when filter is "all"', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('New', 'New.md', daysAgo(1), daysAgo(1));
			const file2 = createFile('Old', 'Old.md', daysAgo(100), daysAgo(100));
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'New note');
			contents.set(file2, 'Old note');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ dateFilter: 'all' });

			expect(result.filteredCount).toBe(2);
		});
	});

	describe('Sorting', () => {
		it('should sort by created date (desc)', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Old', 'Old.md', daysAgo(10), daysAgo(5));
			const file2 = createFile('New', 'New.md', daysAgo(1), daysAgo(1));
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'Old');
			contents.set(file2, 'New');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ sortBy: 'created', sortOrder: 'desc' });

			expect(result.seeds[0].title).toBe('New');
			expect(result.seeds[1].title).toBe('Old');
		});

		it('should sort by modified date (asc)', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('A', 'A.md', daysAgo(10), daysAgo(1));
			const file2 = createFile('B', 'B.md', daysAgo(10), daysAgo(5));
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'A');
			contents.set(file2, 'B');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ sortBy: 'modified', sortOrder: 'asc' });

			expect(result.seeds[0].title).toBe('B');
			expect(result.seeds[1].title).toBe('A');
		});

		it('should sort by title (asc)', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Zebra', 'Zebra.md', Date.now(), Date.now());
			const file2 = createFile('Apple', 'Apple.md', Date.now(), Date.now());
			const file3 = createFile('Mango', 'Mango.md', Date.now(), Date.now());
			files.push(file1, file2, file3);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			metadata.set(file3, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'Z');
			contents.set(file2, 'A');
			contents.set(file3, 'M');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });
			backlinks.set(file3, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ sortBy: 'title', sortOrder: 'asc' });

			expect(result.seeds[0].title).toBe('Apple');
			expect(result.seeds[1].title).toBe('Mango');
			expect(result.seeds[2].title).toBe('Zebra');
		});
	});

	describe('Limit', () => {
		it('should limit results', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			for (let i = 0; i < 10; i++) {
				const file = createFile(`Note${i}`, `Note${i}.md`, Date.now(), Date.now());
				files.push(file);
				metadata.set(file, { frontmatter: { tags: ['seed'] } });
				contents.set(file, `Content ${i}`);
				backlinks.set(file, { data: new Map() });
			}

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ limit: 5 });

			expect(result.seeds.length).toBe(5);
			expect(result.totalCount).toBe(10);
			expect(result.filteredCount).toBe(10);
		});
	});

	describe('Excerpt Creation', () => {
		it('should remove frontmatter', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note', 'Note.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, '---\ntags: [seed]\n---\n\nThis is the actual content.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].excerpt).toBe('This is the actual content.');
			expect(result.seeds[0].excerpt).not.toContain('---');
		});

		it('should remove headers', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note', 'Note.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, '## Header\n\nContent here.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].excerpt).toBe('Content here.');
			expect(result.seeds[0].excerpt).not.toContain('##');
		});

		it('should remove wikilinks', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note', 'Note.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'This is about [[Christopher Alexander]] and his work.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].excerpt).toBe('This is about Christopher Alexander and his work.');
			expect(result.seeds[0].excerpt).not.toContain('[[');
		});

		it('should remove inline tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note', 'Note.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tags: ['seed'] },
				tags: [{ tag: '#philosophy', position: {} }],
			});
			contents.set(file1, 'This is a #philosophy note about centers.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].excerpt).toBe('This is a note about centers.');
			expect(result.seeds[0].excerpt).not.toContain('#');
		});

		it('should truncate to 150 chars', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const longContent = 'A'.repeat(200);

			const file1 = createFile('Note', 'Note.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, longContent);
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].excerpt.length).toBeLessThanOrEqual(154); // 150 + "..."
			expect(result.seeds[0].excerpt).toContain('...');
		});

		it('should handle Korean content in excerpts', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('한글노트', '한글노트.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['씨앗'] } });
			contents.set(file1, 'Christopher Alexander의 Nature of Order에서 설명하는 Centers 개념은 건축과 소프트웨어 디자인에 모두 적용 가능합니다.');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['씨앗']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].excerpt).toContain('Christopher Alexander');
			expect(result.seeds[0].excerpt).toContain('Centers 개념');
		});
	});

	describe('Backlinks', () => {
		it('should extract backlinks', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const seedFile = createFile('Seed', 'Seed.md', Date.now(), Date.now());
			const note1 = createFile('Note1', 'Note1.md', Date.now(), Date.now());
			const note2 = createFile('Note2', 'Note2.md', Date.now(), Date.now());
			files.push(seedFile, note1, note2);

			// Seed file has seed tag
			metadata.set(seedFile, { frontmatter: { tags: ['seed'] } });
			contents.set(seedFile, 'Seed content');
			backlinks.set(seedFile, { data: new Map() });

			// Note1 links to Seed
			metadata.set(note1, {
				frontmatter: { tags: ['note'] },
				links: [{ link: 'Seed', position: {} }],
			});
			contents.set(note1, 'This links to [[Seed]]');
			backlinks.set(note1, { data: new Map() });

			// Note2 also links to Seed
			metadata.set(note2, {
				frontmatter: { tags: ['note'] },
				links: [{ link: 'Seed', position: {} }],
			});
			contents.set(note2, 'Another link to [[Seed]]');
			backlinks.set(note2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].backlinks.length).toBe(2);
			expect(result.seeds[0].backlinks).toContain('Note1.md');
			expect(result.seeds[0].backlinks).toContain('Note2.md');
		});

		it('should handle notes with no backlinks', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Seed', 'Seed.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'Seed content');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds[0].backlinks.length).toBe(0);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty vault', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(0);
			expect(result.totalCount).toBe(0);
			expect(result.filteredCount).toBe(0);
		});

		it('should handle vault with no seed tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Note', 'Note.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['draft'] } });
			contents.set(file1, 'Content');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(0);
			expect(result.totalCount).toBe(0);
		});

		it('should handle files with no metadata', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Empty', 'Empty.md', Date.now(), Date.now());
			files.push(file1);
			// No metadata for file1
			contents.set(file1, 'Just plain content');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(0);
		});

		it('should handle files with empty content', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('Empty', 'Empty.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, '');
			backlinks.set(file1, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds();

			expect(result.seeds.length).toBe(1);
			expect(result.seeds[0].content).toBe('');
			expect(result.seeds[0].excerpt).toBe('');
		});
	});

	describe('Performance', () => {
		it('should handle 1000 files efficiently', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			// Create 1000 files, 100 with seed tags
			for (let i = 0; i < 1000; i++) {
				const file = createFile(`Note${i}`, `Note${i}.md`, daysAgo(i), daysAgo(i));
				files.push(file);

				if (i % 10 === 0) {
					metadata.set(file, { frontmatter: { tags: ['seed'] } });
				} else {
					metadata.set(file, { frontmatter: { tags: ['draft'] } });
				}

				contents.set(file, `Content for note ${i}`);
				backlinks.set(file, { data: new Map() });
			}

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const startTime = Date.now();
			const result = await gatherer.gatherSeeds();
			const endTime = Date.now();

			const duration = endTime - startTime;

			expect(result.seeds.length).toBe(100);
			expect(duration).toBeLessThan(1000); // Should complete in <1s
		});
	});

	describe('Result Metadata', () => {
		it('should return correct totalCount and filteredCount', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const file1 = createFile('New', 'New.md', daysAgo(1), daysAgo(1));
			const file2 = createFile('Old', 'Old.md', daysAgo(10), daysAgo(10));
			files.push(file1, file2);

			metadata.set(file1, { frontmatter: { tags: ['seed'] } });
			metadata.set(file2, { frontmatter: { tags: ['seed'] } });
			contents.set(file1, 'New');
			contents.set(file2, 'Old');
			backlinks.set(file1, { data: new Map() });
			backlinks.set(file2, { data: new Map() });

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed']);

			const result = await gatherer.gatherSeeds({ dateFilter: 'week' });

			expect(result.totalCount).toBe(2);
			expect(result.filteredCount).toBe(1);
			expect(result.seeds.length).toBe(1);
		});

		it('should return searched tags', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();
			const backlinks = new Map<MockTFile, MockBacklinks>();

			const app = createMockApp(files, metadata, contents, backlinks);
			const gatherer = new SeedGatherer(app, () => ['seed', 'idea', '💡']);

			const result = await gatherer.gatherSeeds();

			expect(result.tags).toEqual(['seed', 'idea', '💡']);
		});
	});
});
