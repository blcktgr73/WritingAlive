/**
 * Metadata Manager Unit Tests
 *
 * Tests the MetadataManager service for YAML frontmatter operations.
 *
 * Test Coverage:
 * - Reading metadata from files (with/without frontmatter)
 * - Updating metadata (partial updates, preserving user data)
 * - Creating frontmatter when none exists
 * - Clearing metadata
 * - Error handling (invalid YAML, file errors)
 * - Edge cases (empty files, malformed frontmatter)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetadataManager } from '../../src/services/storage/metadata-manager';
import type { DocumentMetadata } from '../../src/services/storage/types';
import { DEFAULT_DOCUMENT_METADATA, StorageError } from '../../src/services/storage/types';
import type { TFile, Vault } from 'obsidian';

/**
 * Mock TFile
 */
function createMockFile(path: string): TFile {
	return {
		path,
		name: path.split('/').pop() || '',
		basename: path.split('/').pop()?.replace(/\.md$/, '') || '',
		extension: 'md',
	} as TFile;
}

/**
 * Mock Vault
 */
function createMockVault() {
	const storage = new Map<string, string>();

	return {
		read: vi.fn(async (file: TFile) => {
			const content = storage.get(file.path);
			if (content === undefined) {
				throw new Error(`File not found: ${file.path}`);
			}
			return content;
		}),
		modify: vi.fn(async (file: TFile, content: string) => {
			storage.set(file.path, content);
		}),
		// Helper for tests
		_setContent: (path: string, content: string) => {
			storage.set(path, content);
		},
		_getContent: (path: string) => storage.get(path),
	} as unknown as Vault & {
		_setContent: (path: string, content: string) => void;
		_getContent: (path: string) => string | undefined;
	};
}

describe('MetadataManager', () => {
	let manager: MetadataManager;
	let vault: Vault & {
		_setContent: (path: string, content: string) => void;
		_getContent: (path: string) => string | undefined;
	};

	beforeEach(() => {
		vault = createMockVault();
		manager = new MetadataManager(vault);
	});

	describe('readMetadata', () => {
		it('should return default metadata for file without frontmatter', async () => {
			const file = createMockFile('test.md');
			vault._setContent('test.md', 'Just some content without frontmatter.');

			const metadata = await manager.readMetadata(file);

			expect(metadata).toEqual(DEFAULT_DOCUMENT_METADATA);
		});

		it('should return default metadata for file with frontmatter but no writeAlive section', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: My Document
tags: [essay, draft]
---

Content here.`;
			vault._setContent('test.md', content);

			const metadata = await manager.readMetadata(file);

			expect(metadata).toEqual(DEFAULT_DOCUMENT_METADATA);
		});

		it('should read metadata from file with writeAlive section', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: My Document
writeAlive:
  version: 1
  centers: []
  snapshots: []
  lastWholenessScore: 7.5
  lastAnalyzedAt: "2025-11-01T10:00:00Z"
  totalCost: 0.05
  stats:
    analysisCount: 2
    centerFindCount: 1
    snapshotCount: 0
    firstEditedAt: "2025-11-01T09:00:00Z"
    lastEditedAt: "2025-11-01T10:00:00Z"
---

Content here.`;
			vault._setContent('test.md', content);

			const metadata = await manager.readMetadata(file);

			expect(metadata.version).toBe(1);
			expect(metadata.lastWholenessScore).toBe(7.5);
			expect(metadata.lastAnalyzedAt).toBe('2025-11-01T10:00:00Z');
			expect(metadata.totalCost).toBe(0.05);
			expect(metadata.stats?.analysisCount).toBe(2);
			expect(metadata.stats?.centerFindCount).toBe(1);
		});

		it('should handle partial writeAlive section (merge with defaults)', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: My Document
writeAlive:
  version: 1
  lastWholenessScore: 8.0
---

Content here.`;
			vault._setContent('test.md', content);

			const metadata = await manager.readMetadata(file);

			expect(metadata.version).toBe(1);
			expect(metadata.lastWholenessScore).toBe(8.0);
			expect(metadata.centers).toEqual([]);
			expect(metadata.snapshots).toEqual([]);
			expect(metadata.totalCost).toBe(0);
		});

		it('should throw StorageError for file read failure', async () => {
			const file = createMockFile('nonexistent.md');

			await expect(manager.readMetadata(file)).rejects.toThrow(StorageError);

			try {
				await manager.readMetadata(file);
			} catch (error) {
				expect(error).toBeInstanceOf(StorageError);
				expect((error as StorageError).code).toBe('READ_ERROR');
			}
		});

		it('should handle empty file', async () => {
			const file = createMockFile('empty.md');
			vault._setContent('empty.md', '');

			const metadata = await manager.readMetadata(file);

			expect(metadata).toEqual(DEFAULT_DOCUMENT_METADATA);
		});

		it('should handle file with only frontmatter', async () => {
			const file = createMockFile('frontmatter-only.md');
			const content = `---
title: Only Frontmatter
---`;
			vault._setContent('frontmatter-only.md', content);

			const metadata = await manager.readMetadata(file);

			expect(metadata).toEqual(DEFAULT_DOCUMENT_METADATA);
		});
	});

	describe('updateMetadata', () => {
		it('should add frontmatter to file without frontmatter', async () => {
			const file = createMockFile('test.md');
			vault._setContent('test.md', 'Original content.');

			const update: Partial<DocumentMetadata> = {
				lastWholenessScore: 7.5,
				lastAnalyzedAt: '2025-11-01T10:00:00Z',
			};

			await manager.updateMetadata(file, update);

			const newContent = vault._getContent('test.md');
			expect(newContent).toContain('---');
			expect(newContent).toContain('writeAlive:');
			expect(newContent).toContain('lastWholenessScore: 7.5');
			expect(newContent).toContain('Original content.');
		});

		it('should preserve user frontmatter when adding writeAlive section', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: My Document
tags: [essay, draft]
author: John Doe
---

Content here.`;
			vault._setContent('test.md', content);

			const update: Partial<DocumentMetadata> = {
				lastWholenessScore: 8.0,
			};

			await manager.updateMetadata(file, update);

			const newContent = vault._getContent('test.md');
			expect(newContent).toContain('title: My Document');
			expect(newContent).toContain('author: John Doe');
			expect(newContent).toContain('writeAlive:');
			expect(newContent).toContain('lastWholenessScore: 8');
			expect(newContent).toContain('Content here.');
		});

		it('should merge partial updates with existing metadata', async () => {
			const file = createMockFile('test.md');
			const content = `---
writeAlive:
  version: 1
  centers: []
  snapshots: []
  lastWholenessScore: 7.0
  lastAnalyzedAt: "2025-11-01T09:00:00Z"
  totalCost: 0.03
  stats:
    analysisCount: 1
    centerFindCount: 1
    snapshotCount: 0
    firstEditedAt: null
    lastEditedAt: null
---

Content.`;
			vault._setContent('test.md', content);

			const update: Partial<DocumentMetadata> = {
				lastWholenessScore: 8.5,
				totalCost: 0.08,
			};

			await manager.updateMetadata(file, update);

			const metadata = await manager.readMetadata(file);

			expect(metadata.lastWholenessScore).toBe(8.5);
			expect(metadata.totalCost).toBe(0.08);
			expect(metadata.lastAnalyzedAt).toBe('2025-11-01T09:00:00Z'); // Preserved
			expect(metadata.stats?.analysisCount).toBe(1); // Preserved
		});

		it('should update centers array', async () => {
			const file = createMockFile('test.md');
			vault._setContent('test.md', 'Content.');

			const update: Partial<DocumentMetadata> = {
				centers: [
					{
						id: 'center-1',
						text: 'The main point',
						position: { start: 0, end: 14 },
						paragraph: 0,
						confidence: 0.9,
						timestamp: '2025-11-01T10:00:00Z',
						source: 'ai-suggested',
						accepted: true,
					},
				],
			};

			await manager.updateMetadata(file, update);

			const metadata = await manager.readMetadata(file);

			expect(metadata.centers).toHaveLength(1);
			expect(metadata.centers[0].text).toBe('The main point');
			expect(metadata.centers[0].confidence).toBe(0.9);
		});

		it('should throw StorageError for invalid YAML frontmatter', async () => {
			const file = createMockFile('invalid.md');
			// Use truly malformed YAML that js-yaml will reject
			const content = `---
title: Invalid
	bad indentation without colon
		more bad indentation
---

Content.`;
			vault._setContent('invalid.md', content);

			const update: Partial<DocumentMetadata> = {
				lastWholenessScore: 7.0,
			};

			await expect(manager.updateMetadata(file, update)).rejects.toThrow(
				StorageError
			);

			try {
				await manager.updateMetadata(file, update);
			} catch (error) {
				expect(error).toBeInstanceOf(StorageError);
				expect((error as StorageError).code).toBe('PARSE_ERROR');
			}
		});
	});

	describe('clearMetadata', () => {
		it('should remove writeAlive section while preserving user frontmatter', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: My Document
tags: [essay]
writeAlive:
  version: 1
  centers: []
  snapshots: []
  lastWholenessScore: 7.5
  lastAnalyzedAt: null
  totalCost: 0
  stats:
    analysisCount: 0
    centerFindCount: 0
    snapshotCount: 0
    firstEditedAt: null
    lastEditedAt: null
---

Content.`;
			vault._setContent('test.md', content);

			await manager.clearMetadata(file);

			const newContent = vault._getContent('test.md');
			expect(newContent).toContain('title: My Document');
			expect(newContent).toContain('tags:');
			expect(newContent).not.toContain('writeAlive');
			expect(newContent).toContain('Content.');
		});

		it('should remove frontmatter entirely if only writeAlive existed', async () => {
			const file = createMockFile('test.md');
			const content = `---
writeAlive:
  version: 1
  centers: []
  snapshots: []
  lastWholenessScore: null
  lastAnalyzedAt: null
  totalCost: 0
  stats:
    analysisCount: 0
    centerFindCount: 0
    snapshotCount: 0
    firstEditedAt: null
    lastEditedAt: null
---

Content.`;
			vault._setContent('test.md', content);

			await manager.clearMetadata(file);

			const newContent = vault._getContent('test.md');
			expect(newContent).not.toContain('---');
			expect(newContent).not.toContain('writeAlive');
			expect(newContent).toContain('Content.');
		});

		it('should handle file without frontmatter (no-op)', async () => {
			const file = createMockFile('test.md');
			vault._setContent('test.md', 'Just content.');

			await manager.clearMetadata(file);

			const newContent = vault._getContent('test.md');
			expect(newContent).toBe('Just content.');
		});

		it('should handle file without writeAlive section (no-op)', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: My Document
---

Content.`;
			vault._setContent('test.md', content);

			await manager.clearMetadata(file);

			const newContent = vault._getContent('test.md');
			expect(newContent).toContain('title: My Document');
			expect(newContent).toContain('Content.');
		});
	});

	describe('hasMetadata', () => {
		it('should return true for file with writeAlive section', async () => {
			const file = createMockFile('test.md');
			const content = `---
writeAlive:
  version: 1
  centers: []
  snapshots: []
  lastWholenessScore: null
  lastAnalyzedAt: null
  totalCost: 0
  stats:
    analysisCount: 0
    centerFindCount: 0
    snapshotCount: 0
    firstEditedAt: null
    lastEditedAt: null
---

Content.`;
			vault._setContent('test.md', content);

			const result = await manager.hasMetadata(file);

			expect(result).toBe(true);
		});

		it('should return false for file without frontmatter', async () => {
			const file = createMockFile('test.md');
			vault._setContent('test.md', 'Just content.');

			const result = await manager.hasMetadata(file);

			expect(result).toBe(false);
		});

		it('should return false for file with frontmatter but no writeAlive section', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: My Document
---

Content.`;
			vault._setContent('test.md', content);

			const result = await manager.hasMetadata(file);

			expect(result).toBe(false);
		});

		it('should return false for nonexistent file', async () => {
			const file = createMockFile('nonexistent.md');

			const result = await manager.hasMetadata(file);

			expect(result).toBe(false);
		});
	});

	describe('Edge Cases', () => {
		it('should handle malformed frontmatter (no closing ---)', async () => {
			const file = createMockFile('malformed.md');
			const content = `---
title: Malformed

Content without closing frontmatter delimiter.`;
			vault._setContent('malformed.md', content);

			const metadata = await manager.readMetadata(file);

			// Should treat as no frontmatter
			expect(metadata).toEqual(DEFAULT_DOCUMENT_METADATA);
		});

		it('should handle frontmatter not at start of file', async () => {
			const file = createMockFile('not-at-start.md');
			const content = `
---
title: Not at start
---

Content.`;
			vault._setContent('not-at-start.md', content);

			const metadata = await manager.readMetadata(file);

			// Should treat as no frontmatter (must start at beginning)
			expect(metadata).toEqual(DEFAULT_DOCUMENT_METADATA);
		});

		it('should handle Unicode in metadata', async () => {
			const file = createMockFile('unicode.md');
			vault._setContent('unicode.md', 'Content.');

			const update: Partial<DocumentMetadata> = {
				centers: [
					{
						id: 'center-1',
						text: '中文内容 with émojis 🚀',
						position: { start: 0, end: 20 },
						paragraph: 0,
						confidence: 0.8,
						timestamp: '2025-11-01T10:00:00Z',
						source: 'user-identified',
						accepted: true,
					},
				],
			};

			await manager.updateMetadata(file, update);

			const metadata = await manager.readMetadata(file);

			expect(metadata.centers[0].text).toBe('中文内容 with émojis 🚀');
		});

		it('should preserve content spacing and formatting', async () => {
			const file = createMockFile('formatting.md');
			const originalContent = `---
title: Test
---

# Heading

Paragraph 1.

Paragraph 2.`;
			vault._setContent('formatting.md', originalContent);

			const update: Partial<DocumentMetadata> = {
				lastWholenessScore: 7.0,
			};

			await manager.updateMetadata(file, update);

			const newContent = vault._getContent('formatting.md');

			// Body should be preserved exactly
			expect(newContent).toContain('# Heading\n\nParagraph 1.\n\nParagraph 2.');
		});
	});
});
