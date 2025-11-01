/**
 * Diff Service Unit Tests
 *
 * Comprehensive test coverage for snapshot comparison and diff generation.
 *
 * Test Coverage:
 * - Snapshot-to-snapshot comparison
 * - Snapshot-to-current comparison
 * - Text change detection (added/removed/modified lines)
 * - Metadata change detection (centers, wholeness score)
 * - Statistics calculation (word count, paragraph count)
 * - Human-readable summary generation
 * - Edge cases (empty content, identical snapshots, large diffs)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiffService } from '../../src/services/storage/diff-service';
import { SnapshotManager } from '../../src/services/storage/snapshot-manager';
import { MetadataManager } from '../../src/services/storage/metadata-manager';
import type { Snapshot, DocumentMetadata } from '../../src/services/storage/types';
import type { TFile, Vault } from 'obsidian';

// Helper: Create mock snapshot
const createMockSnapshot = (
	id: string,
	content: string,
	metadata: Partial<DocumentMetadata> = {}
): Snapshot => ({
	metadata: {
		id,
		name: `Snapshot ${id}`,
		timestamp: new Date().toISOString(),
		wordCount: content.split(/\s+/).filter((w) => w.length > 0).length,
		paragraphCount: content.split(/\n\n+/).filter((p) => p.trim().length > 0).length,
		wholenessScore: metadata.lastWholenessScore || null,
		centerCount: metadata.centers?.length || 0,
		source: 'manual',
	},
	content,
	documentMetadata: {
		version: 1,
		centers: metadata.centers || [],
		snapshots: [],
		lastWholenessScore: metadata.lastWholenessScore || null,
		lastAnalyzedAt: null,
		totalCost: 0,
		stats: {
			analysisCount: 0,
			centerFindCount: 0,
			snapshotCount: 0,
			firstEditedAt: null,
			lastEditedAt: null,
		},
	},
	wholenessAnalysis: null,
});

// Mock Vault
const createMockVault = (): Vault => ({
	read: vi.fn(),
	modify: vi.fn(),
	adapter: {
		exists: vi.fn(),
		mkdir: vi.fn(),
		write: vi.fn(),
		read: vi.fn(),
		remove: vi.fn(),
	} as any,
} as any);

// Mock TFile
const createMockFile = (path: string): TFile => ({
	path,
	basename: path.replace('.md', ''),
	parent: null,
} as TFile);

describe('DiffService', () => {
	let diffService: DiffService;
	let snapshotManager: SnapshotManager;
	let metadataManager: MetadataManager;
	let vault: Vault;

	beforeEach(() => {
		vault = createMockVault();
		metadataManager = new MetadataManager(vault);
		snapshotManager = new SnapshotManager(vault, metadataManager);
		diffService = new DiffService(snapshotManager);
	});

	describe('compareSnapshots', () => {
		it('should detect no changes for identical snapshots', () => {
			const content = 'This is a test document.\n\nWith two paragraphs.';
			const snapshot1 = createMockSnapshot('snap-1', content);
			const snapshot2 = createMockSnapshot('snap-2', content);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.textChanges).toHaveLength(0);
			expect(diff.stats.linesAdded).toBe(0);
			expect(diff.stats.linesRemoved).toBe(0);
			expect(diff.stats.linesModified).toBe(0);
			expect(diff.stats.wordCountChange).toBe(0);
		});

		it('should detect added lines', () => {
			const content1 = 'Line 1\nLine 2';
			const content2 = 'Line 1\nLine 2\nLine 3';
			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.stats.linesAdded).toBe(1);
			expect(diff.stats.linesRemoved).toBe(0);
			expect(diff.textChanges.some((c) => c.type === 'added' && c.content === 'Line 3')).toBe(true);
		});

		it('should detect removed lines', () => {
			const content1 = 'Line 1\nLine 2\nLine 3';
			const content2 = 'Line 1\nLine 2';
			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.stats.linesAdded).toBe(0);
			expect(diff.stats.linesRemoved).toBe(1);
			expect(diff.textChanges.some((c) => c.type === 'removed' && c.content === 'Line 3')).toBe(true);
		});

		it('should detect modified lines', () => {
			const content1 = 'Line 1\nOriginal Line\nLine 3';
			const content2 = 'Line 1\nModified Line\nLine 3';
			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.stats.linesModified).toBe(1);
			expect(diff.textChanges.some((c) => c.type === 'removed' && c.content === 'Original Line')).toBe(true);
			expect(diff.textChanges.some((c) => c.type === 'added' && c.content === 'Modified Line')).toBe(true);
		});

		it('should calculate word count change correctly', () => {
			const content1 = 'Hello world';
			const content2 = 'Hello world this is a test';
			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.stats.wordCountChange).toBe(4); // Added 4 words
			expect(diff.stats.previousWordCount).toBe(2);
			expect(diff.stats.currentWordCount).toBe(6);
		});

		it('should calculate paragraph count change correctly', () => {
			const content1 = 'Paragraph 1\n\nParagraph 2';
			const content2 = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.stats.paragraphCountChange).toBe(1);
			expect(diff.stats.previousParagraphCount).toBe(2);
			expect(diff.stats.currentParagraphCount).toBe(3);
		});

		it('should detect wholeness score change', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Content', {
				lastWholenessScore: 6.5,
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Content', {
				lastWholenessScore: 7.8,
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.metadataChanges.wholenessScoreChange).toBeCloseTo(1.3, 1);
			expect(diff.metadataChanges.previousWholenessScore).toBe(6.5);
			expect(diff.metadataChanges.currentWholenessScore).toBe(7.8);
		});

		it('should detect added centers', () => {
			const center1 = {
				id: 'center-1',
				text: 'Test center',
				position: { start: 0, end: 10 },
				paragraph: 0,
				confidence: 0.9,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested' as const,
				accepted: true,
			};

			const snapshot1 = createMockSnapshot('snap-1', 'Content', {
				centers: [],
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Content', {
				centers: [center1],
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.metadataChanges.centersAdded).toHaveLength(1);
			expect(diff.metadataChanges.centersAdded[0].id).toBe('center-1');
			expect(diff.metadataChanges.centersRemoved).toHaveLength(0);
		});

		it('should detect removed centers', () => {
			const center1 = {
				id: 'center-1',
				text: 'Test center',
				position: { start: 0, end: 10 },
				paragraph: 0,
				confidence: 0.9,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested' as const,
				accepted: true,
			};

			const snapshot1 = createMockSnapshot('snap-1', 'Content', {
				centers: [center1],
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Content', {
				centers: [],
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.metadataChanges.centersAdded).toHaveLength(0);
			expect(diff.metadataChanges.centersRemoved).toHaveLength(1);
			expect(diff.metadataChanges.centersRemoved[0]).toBe('center-1');
		});

		it('should handle content with frontmatter', () => {
			const content1 = `---
title: Test
---

Body content here`;
			const content2 = `---
title: Test Modified
---

Body content modified`;

			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			// Should only compare body, not frontmatter
			expect(diff.stats.linesModified).toBe(1);
			expect(diff.textChanges.some((c) => c.content.includes('title'))).toBe(false);
		});

		it('should handle empty content', () => {
			const snapshot1 = createMockSnapshot('snap-1', '');
			const snapshot2 = createMockSnapshot('snap-2', 'Some content');

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.stats.linesAdded).toBe(1);
			expect(diff.stats.wordCountChange).toBe(2);
		});

		it('should include timestamps in diff result', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Content');
			const snapshot2 = createMockSnapshot('snap-2', 'Content');

			const beforeDiff = new Date();
			const diff = diffService.compareSnapshots(snapshot1, snapshot2);
			const afterDiff = new Date();

			expect(diff.fromSnapshotId).toBe('snap-1');
			expect(diff.toSnapshotId).toBe('snap-2');
			expect(new Date(diff.timestamp).getTime()).toBeGreaterThanOrEqual(beforeDiff.getTime());
			expect(new Date(diff.timestamp).getTime()).toBeLessThanOrEqual(afterDiff.getTime());
		});
	});

	describe('generateDiffSummary', () => {
		it('should generate summary for text changes', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Line 1\nLine 2');
			const snapshot2 = createMockSnapshot('snap-2', 'Line 1\nModified Line 2\nLine 3');

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);
			const summary = diffService.generateDiffSummary(diff);

			expect(summary).toContain('+1 lines');
			expect(summary).toContain('~1 modified');
		});

		it('should generate summary for word count changes', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Hello');
			const snapshot2 = createMockSnapshot('snap-2', 'Hello world test');

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);
			const summary = diffService.generateDiffSummary(diff);

			expect(summary).toContain('Words: +2');
		});

		it('should generate summary for wholeness score improvement', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Content', {
				lastWholenessScore: 6.0,
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Content', {
				lastWholenessScore: 7.5,
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);
			const summary = diffService.generateDiffSummary(diff);

			expect(summary).toContain('Wholeness: +1.5');
		});

		it('should generate summary for center changes', () => {
			const center = {
				id: 'center-1',
				text: 'Test',
				position: { start: 0, end: 10 },
				paragraph: 0,
				confidence: 0.9,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested' as const,
				accepted: true,
			};

			const snapshot1 = createMockSnapshot('snap-1', 'Content', {
				centers: [],
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Content', {
				centers: [center],
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);
			const summary = diffService.generateDiffSummary(diff);

			expect(summary).toContain('Centers: +1/-0');
		});

		it('should return "No changes" for identical snapshots', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Content');
			const snapshot2 = createMockSnapshot('snap-2', 'Content');

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);
			const summary = diffService.generateDiffSummary(diff);

			expect(summary).toBe('No changes');
		});

		it('should combine multiple types of changes in summary', () => {
			const center = {
				id: 'center-1',
				text: 'Test',
				position: { start: 0, end: 10 },
				paragraph: 0,
				confidence: 0.9,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested' as const,
				accepted: true,
			};

			const snapshot1 = createMockSnapshot('snap-1', 'Hello', {
				lastWholenessScore: 5.0,
				centers: [],
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Hello world test', {
				lastWholenessScore: 7.5,
				centers: [center],
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);
			const summary = diffService.generateDiffSummary(diff);

			expect(summary).toContain('Words');
			expect(summary).toContain('Wholeness');
			expect(summary).toContain('Centers');
			expect(summary.includes('|')).toBe(true); // Pipe separator
		});
	});

	describe('edge cases', () => {
		it('should handle very large diffs', () => {
			const content1 = Array(1000).fill('Line').join('\n');
			const content2 = Array(2000).fill('Line').join('\n');

			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.stats.linesAdded).toBe(1000);
		});

		it('should handle content with only whitespace changes', () => {
			const content1 = 'Line 1\nLine 2';
			const content2 = 'Line 1  \nLine 2  '; // Added trailing spaces

			const snapshot1 = createMockSnapshot('snap-1', content1);
			const snapshot2 = createMockSnapshot('snap-2', content2);

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			// Trailing spaces should be detected as modifications
			expect(diff.stats.linesModified).toBeGreaterThan(0);
		});

		it('should handle negative wholeness score changes', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Content', {
				lastWholenessScore: 8.0,
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Content', {
				lastWholenessScore: 6.5,
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.metadataChanges.wholenessScoreChange).toBeCloseTo(-1.5, 1);
		});

		it('should handle null wholeness scores', () => {
			const snapshot1 = createMockSnapshot('snap-1', 'Content', {
				lastWholenessScore: null,
			});
			const snapshot2 = createMockSnapshot('snap-2', 'Content', {
				lastWholenessScore: 7.0,
			});

			const diff = diffService.compareSnapshots(snapshot1, snapshot2);

			expect(diff.metadataChanges.wholenessScoreChange).toBeNull();
			expect(diff.metadataChanges.previousWholenessScore).toBeNull();
			expect(diff.metadataChanges.currentWholenessScore).toBe(7.0);
		});
	});
});
