/**
 * MOC Detector Unit Tests
 *
 * Tests for MOC detection and parsing functionality including:
 * - Detection by YAML frontmatter (type: moc)
 * - Detection by tag (#moc)
 * - Detection by folder pattern (MOCs/, Maps/, etc.)
 * - Heading hierarchy parsing
 * - Link extraction with context
 * - Living MOC configuration parsing
 * - Auto-update marker detection
 * - Cache functionality
 * - Performance with large MOCs
 */

import { describe, it, expect, vi } from 'vitest';
import { MOCDetector } from '../../src/services/vault/moc-detector';

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
		type?: string;
		tags?: string | string[];
		tag?: string | string[];
		writealive?: {
			auto_gather_seeds?: boolean;
			seed_tags?: string[];
			update_frequency?: 'realtime' | 'daily' | 'manual';
		};
		[key: string]: any;
	};
	tags?: Array<{ tag: string; position: any }>;
	links?: Array<{ link: string; position: any }>;
	embeds?: Array<{ link: string; position: any }>;
	headings?: Array<{ level: number; heading: string; position: any }>;
}

/**
 * Mock Obsidian App
 */
function createMockApp(
	files: MockTFile[],
	metadata: Map<MockTFile, MockCachedMetadata>,
	contents: Map<MockTFile, string>
) {
	return {
		vault: {
			getMarkdownFiles: vi.fn(() => files),
			read: vi.fn((file: MockTFile) =>
				Promise.resolve(contents.get(file) || '')
			),
		},
		metadataCache: {
			getFileCache: vi.fn((file: MockTFile) => metadata.get(file) || null),
		},
	} as any;
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
		stat: { ctime, mtime },
	};
}

describe('MOCDetector', () => {
	describe('Detection by YAML Frontmatter', () => {
		it('should detect MOC by type: moc in frontmatter', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('My MOC', 'Notes/My MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
			});
			contents.set(
				file1,
				'---\ntype: moc\n---\n\n# My MOC\n\n[[Note 1]]\n[[Note 2]]'
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should detect MOC with case-insensitive type match', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'MOC' }, // Uppercase
			});
			contents.set(file1, '---\ntype: MOC\n---\n\n# MOC');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should not detect MOC if type is different', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Note', 'Note.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'article' },
			});
			contents.set(file1, '---\ntype: article\n---\n\n# Note');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(false);
		});
	});

	describe('Detection by Tag', () => {
		it('should detect MOC by #moc inline tag', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('My MOC', 'My MOC.md');
			files.push(file1);
			metadata.set(file1, {
				tags: [{ tag: '#moc', position: {} as any }],
			});
			contents.set(file1, '# My MOC #moc\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should detect MOC by moc tag in frontmatter tags array', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('My MOC', 'My MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tags: ['moc', 'index'] },
			});
			contents.set(
				file1,
				'---\ntags: [moc, index]\n---\n\n# My MOC\n\n[[Note 1]]'
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should detect MOC by moc tag in frontmatter tag string', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('My MOC', 'My MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { tag: 'moc' },
			});
			contents.set(file1, '---\ntag: moc\n---\n\n# My MOC\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should use custom tag filter option', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Index', 'Index.md');
			files.push(file1);
			metadata.set(file1, {
				tags: [{ tag: '#index', position: {} as any }],
			});
			contents.set(file1, '# Index #index\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any, { tagFilter: 'index' });
			expect(isMOC).toBe(true);
		});
	});

	describe('Detection by Folder Pattern', () => {
		it('should detect MOC in MOCs/ folder', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Index', 'MOCs/Index.md');
			files.push(file1);
			metadata.set(file1, {});
			contents.set(file1, '# Index\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should detect MOC in Maps/ folder', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Index', 'Maps/Index.md');
			files.push(file1);
			metadata.set(file1, {});
			contents.set(file1, '# Index\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should detect MOC in 00 Maps/ folder', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Index', '00 Maps/Index.md');
			files.push(file1);
			metadata.set(file1, {});
			contents.set(file1, '# Index\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any);
			expect(isMOC).toBe(true);
		});

		it('should use custom folder patterns', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Index', 'MyMaps/Index.md');
			files.push(file1);
			metadata.set(file1, {});
			contents.set(file1, '# Index\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any, {
				includeFolderPatterns: ['MyMaps/'],
			});
			expect(isMOC).toBe(true);
		});

		it('should exclude folders by pattern', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Index', 'MOCs/.trash/Index.md');
			files.push(file1);
			metadata.set(file1, {});
			contents.set(file1, '# Index\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const isMOC = await detector.isMOC(file1 as any, {
				excludeFolderPatterns: ['.trash/'],
			});
			expect(isMOC).toBe(false);
		});
	});

	describe('Detection Priority', () => {
		it('should prioritize YAML over tag', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Note', 'Note.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				tags: [{ tag: '#other', position: {} as any }],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# Note #other');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const result = await detector.detectMOCs();
			expect(result.mocs.length).toBe(1);
			expect(result.detectionMethod.get(file1.path)).toBe('yaml');
		});

		it('should prioritize tag over folder', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Note', 'Random/Note.md');
			files.push(file1);
			metadata.set(file1, {
				tags: [{ tag: '#moc', position: {} as any }],
			});
			contents.set(file1, '# Note #moc');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const result = await detector.detectMOCs();
			expect(result.mocs.length).toBe(1);
			expect(result.detectionMethod.get(file1.path)).toBe('tag');
		});
	});

	describe('Heading Parsing', () => {
		it('should parse flat headings', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(
				file1,
				'---\ntype: moc\n---\n\n# Heading 1\n\n# Heading 2\n\n# Heading 3'
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.headings.length).toBe(3);
			expect(moc.headings[0].text).toBe('Heading 1');
			expect(moc.headings[1].text).toBe('Heading 2');
			expect(moc.headings[2].text).toBe('Heading 3');
			expect(moc.headings[0].level).toBe(1);
		});

		it('should parse nested heading hierarchy', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(
				file1,
				`---
type: moc
---

# Level 1
## Level 2a
### Level 3
## Level 2b`
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);

			// Check top level
			expect(moc.headings.length).toBe(1);
			expect(moc.headings[0].text).toBe('Level 1');
			expect(moc.headings[0].level).toBe(1);

			// Check second level
			expect(moc.headings[0].children.length).toBe(2);
			expect(moc.headings[0].children[0].text).toBe('Level 2a');
			expect(moc.headings[0].children[0].level).toBe(2);
			expect(moc.headings[0].children[1].text).toBe('Level 2b');
			expect(moc.headings[0].children[1].level).toBe(2);

			// Check third level
			expect(moc.headings[0].children[0].children.length).toBe(1);
			expect(moc.headings[0].children[0].children[0].text).toBe('Level 3');
			expect(moc.headings[0].children[0].children[0].level).toBe(3);
		});

		it('should handle MOC with no headings', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\nJust some text.');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.headings.length).toBe(0);
		});
	});

	describe('Link Extraction', () => {
		it('should extract simple wikilinks', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [
					{
						link: 'Note 1',
						position: { start: { line: 4, col: 0 }, end: { line: 4, col: 10 } },
					},
					{
						link: 'Note 2',
						position: { start: { line: 5, col: 0 }, end: { line: 5, col: 10 } },
					},
				],
			});
			contents.set(
				file1,
				'---\ntype: moc\n---\n\n[[Note 1]]\n[[Note 2]]'
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(2);
			expect(moc.links[0].path).toBe('Note 1');
			expect(moc.links[0].displayText).toBe('Note 1');
			expect(moc.links[1].path).toBe('Note 2');
			expect(moc.links[1].displayText).toBe('Note 2');
			expect(moc.linkCount).toBe(2);
		});

		it('should extract links with aliases', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [
					{
						link: 'Note 1|My Note',
						position: { start: { line: 4, col: 0 }, end: { line: 4, col: 20 } },
					},
				],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n[[Note 1|My Note]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(1);
			expect(moc.links[0].path).toBe('Note 1');
			expect(moc.links[0].displayText).toBe('My Note');
		});

		it('should extract links with section anchors', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [
					{
						link: 'Note 1#Section',
						position: { start: { line: 4, col: 0 }, end: { line: 4, col: 20 } },
					},
				],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n[[Note 1#Section]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(1);
			expect(moc.links[0].path).toBe('Note 1');
			expect(moc.links[0].displayText).toBe('Note 1');
		});

		it('should extract links with section and alias', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [
					{
						link: 'Note 1#Section|My Link',
						position: { start: { line: 4, col: 0 }, end: { line: 4, col: 30 } },
					},
				],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n[[Note 1#Section|My Link]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(1);
			expect(moc.links[0].path).toBe('Note 1');
			expect(moc.links[0].displayText).toBe('My Link');
		});

		it('should extract embedded notes as links', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
				embeds: [
					{
						link: 'Note 1',
						position: { start: { line: 4, col: 0 }, end: { line: 4, col: 11 } },
					},
				],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n![[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(1);
			expect(moc.links[0].path).toBe('Note 1');
		});

		it('should associate links with parent headings', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [
					{
						link: 'Note 1',
						position: { start: { line: 5, col: 0 }, end: { line: 5, col: 10 } },
					},
					{
						link: 'Note 2',
						position: { start: { line: 8, col: 0 }, end: { line: 8, col: 10 } },
					},
				],
			});
			contents.set(
				file1,
				`---
type: moc
---

## Section A
[[Note 1]]

## Section B
[[Note 2]]`
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(2);
			expect(moc.links[0].heading).toBe('Section A');
			expect(moc.links[1].heading).toBe('Section B');
		});

		it('should handle MOC with no links', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# Empty MOC');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(0);
			expect(moc.linkCount).toBe(0);
		});
	});

	describe('Living MOC Configuration', () => {
		it('should detect Living MOC from frontmatter', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Living MOC', 'MOCs/Living.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: {
					type: 'moc',
					writealive: {
						auto_gather_seeds: true,
						seed_tags: ['creativity', 'practice'],
						update_frequency: 'daily',
					},
				},
				links: [],
			});
			contents.set(
				file1,
				`---
type: moc
writealive:
  auto_gather_seeds: true
  seed_tags: [creativity, practice]
  update_frequency: daily
---

# Living MOC`
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.isLivingMOC).toBe(true);
			expect(moc.autoGatherSeeds).toBe(true);
			expect(moc.seedTags).toEqual(['creativity', 'practice']);
			expect(moc.updateFrequency).toBe('daily');
		});

		it('should handle non-Living MOC', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Regular MOC', 'MOCs/Regular.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# Regular MOC');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.isLivingMOC).toBe(false);
			expect(moc.autoGatherSeeds).toBe(false);
			expect(moc.seedTags).toEqual([]);
			expect(moc.updateFrequency).toBe('manual');
		});

		it('should normalize seed tags to lowercase', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Living MOC', 'MOCs/Living.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: {
					type: 'moc',
					writealive: {
						auto_gather_seeds: true,
						seed_tags: ['CREATIVITY', 'Practice', '창의성'],
					},
				},
				links: [],
			});
			contents.set(
				file1,
				'---\ntype: moc\nwritealive:\n  auto_gather_seeds: true\n  seed_tags: [CREATIVITY, Practice, 창의성]\n---'
			);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.seedTags).toEqual(['creativity', 'practice', '창의성']);
		});

		it('should default to manual update frequency', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Living MOC', 'MOCs/Living.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: {
					type: 'moc',
					writealive: {
						auto_gather_seeds: true,
						seed_tags: ['idea'],
						// No update_frequency specified
					},
				},
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.updateFrequency).toBe('manual');
		});
	});

	describe('Auto-Update Markers', () => {
		it('should find auto-update markers', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Living MOC', 'MOCs/Living.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			const content = `---
type: moc
---

# Recent Seeds

<!-- BEGIN WRITEALIVE-AUTO -->
- [[Seed 1]]
- [[Seed 2]]
<!-- END WRITEALIVE-AUTO -->`;

			contents.set(file1, content);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.autoUpdateMarkers).not.toBeNull();
			expect(moc.autoUpdateMarkers?.start).toBeGreaterThan(0);
			expect(moc.autoUpdateMarkers?.end).toBeGreaterThan(
				moc.autoUpdateMarkers?.start || 0
			);
		});

		it('should return null when no markers found', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# MOC\n\n[[Note 1]]');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.autoUpdateMarkers).toBeNull();
		});

		it('should mark links as isInAutoSection correctly', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Living MOC', 'MOCs/Living.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [
					{
						link: 'Manual Link',
						position: { start: { line: 4, col: 0 }, end: { line: 4, col: 16 } },
					},
					{
						link: 'Auto Link',
						position: { start: { line: 7, col: 2 }, end: { line: 7, col: 15 } },
					},
				],
			});
			const content = `---
type: moc
---

[[Manual Link]]

<!-- BEGIN WRITEALIVE-AUTO -->
- [[Auto Link]]
<!-- END WRITEALIVE-AUTO -->`;

			contents.set(file1, content);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const moc = await detector.parseMOC(file1 as any);
			expect(moc.links.length).toBe(2);
			expect(moc.links[0].isInAutoSection).toBe(false);
			expect(moc.links[1].isInAutoSection).toBe(true);
		});
	});

	describe('Cache Functionality', () => {
		it('should cache parsed MOCs', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# MOC');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			// First parse
			await detector.parseMOC(file1 as any);

			// Check cache
			const cached = detector.getCachedMOC(file1.path);
			expect(cached).not.toBeUndefined();
			expect(cached?.moc.title).toBe('MOC');
		});

		it('should use cached MOC on second parse', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# MOC');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			// First parse
			const moc1 = await detector.parseMOC(file1 as any);

			// Second parse (should use cache)
			const moc2 = await detector.parseMOC(file1 as any);

			// Should be same object reference
			expect(moc1).toBe(moc2);
		});

		it('should invalidate cache when file is modified', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md', Date.now(), Date.now());
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# MOC v1');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			// First parse
			const moc1 = await detector.parseMOC(file1 as any);
			expect(moc1.title).toBe('MOC');

			// Simulate file modification
			file1.stat.mtime = Date.now() + 1000;
			contents.set(file1, '---\ntype: moc\n---\n\n# MOC v2');

			// Second parse (should re-parse)
			const moc2 = await detector.parseMOC(file1 as any);

			// Should be different object
			expect(moc1).not.toBe(moc2);
		});

		it('should clear cache on clearCache()', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('MOC', 'MOCs/MOC.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# MOC');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			// Parse and cache
			await detector.parseMOC(file1 as any);

			// Clear cache
			detector.clearCache();

			// Check cache is empty
			const cached = detector.getCachedMOC(file1.path);
			expect(cached).toBeUndefined();
		});
	});

	describe('Vault-Wide Detection', () => {
		it('should detect all MOCs in vault', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			// MOC 1: YAML
			const file1 = createFile('MOC1', 'MOC1.md');
			files.push(file1);
			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links: [],
			});
			contents.set(file1, '---\ntype: moc\n---\n\n# MOC 1');

			// MOC 2: Tag
			const file2 = createFile('MOC2', 'MOC2.md');
			files.push(file2);
			metadata.set(file2, {
				tags: [{ tag: '#moc', position: {} as any }],
				links: [],
			});
			contents.set(file2, '# MOC 2 #moc');

			// MOC 3: Folder
			const file3 = createFile('MOC3', 'MOCs/MOC3.md');
			files.push(file3);
			metadata.set(file3, { links: [] });
			contents.set(file3, '# MOC 3');

			// Non-MOC
			const file4 = createFile('Note', 'Note.md');
			files.push(file4);
			metadata.set(file4, { links: [] });
			contents.set(file4, '# Regular Note');

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const result = await detector.detectMOCs();
			expect(result.mocs.length).toBe(3);
			expect(result.totalCount).toBe(3);
			expect(result.detectionMethod.get(file1.path)).toBe('yaml');
			expect(result.detectionMethod.get(file2.path)).toBe('tag');
			expect(result.detectionMethod.get(file3.path)).toBe('folder');
		});
	});

	describe('Performance', () => {
		it('should handle large MOC with many links efficiently', async () => {
			const files: MockTFile[] = [];
			const metadata = new Map<MockTFile, MockCachedMetadata>();
			const contents = new Map<MockTFile, string>();

			const file1 = createFile('Large MOC', 'MOCs/Large.md');
			files.push(file1);

			// Generate 100 links
			const links = [];
			let content = '---\ntype: moc\n---\n\n# Large MOC\n\n';
			for (let i = 0; i < 100; i++) {
				links.push({
					link: `Note ${i}`,
					position: {
						start: { line: 5 + i, col: 0 },
						end: { line: 5 + i, col: 15 },
					},
				});
				content += `- [[Note ${i}]]\n`;
			}

			metadata.set(file1, {
				frontmatter: { type: 'moc' },
				links,
			});
			contents.set(file1, content);

			const app = createMockApp(files, metadata, contents);
			const detector = new MOCDetector(app);

			const startTime = Date.now();
			const moc = await detector.parseMOC(file1 as any);
			const duration = Date.now() - startTime;

			expect(moc.links.length).toBe(100);
			expect(duration).toBeLessThan(100); // Should parse in <100ms
		});
	});
});
