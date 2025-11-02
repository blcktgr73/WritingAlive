/**
 * Snapshot Manager Unit Tests
 *
 * Comprehensive test coverage for snapshot CRUD operations.
 *
 * Test Coverage:
 * - Snapshot creation (custom name, auto-generated name)
 * - Snapshot listing (sorting, empty state)
 * - Snapshot retrieval (found, not found)
 * - Snapshot deletion (found, not found)
 * - Snapshot restoration (with backup)
 * - Performance warnings (>10 snapshots)
 * - Error handling (file not found, storage errors)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SnapshotManager } from '../../src/services/storage/snapshot-manager';
import { MetadataManager } from '../../src/services/storage/metadata-manager';
import { StorageError } from '../../src/services/storage/types';
import type { TFile, Vault } from 'obsidian';

// Mock Vault
const createMockVault = (): Vault => {
	const storage: Record<string, string> = {};

	return {
		read: vi.fn(async (file: TFile) => {
			const content = storage[file.path];
			if (!content) {
				throw new Error('File not found');
			}
			return content;
		}),
		modify: vi.fn(async (file: TFile, data: string) => {
			storage[file.path] = data;
		}),
		adapter: {
			exists: vi.fn(async (path: string) => {
				return storage[path] !== undefined;
			}),
			mkdir: vi.fn(async () => {}),
			write: vi.fn(async (path: string, data: string) => {
				storage[path] = data;
			}),
			read: vi.fn(async (path: string) => {
				const content = storage[path];
				if (!content) {
					throw new Error('File not found');
				}
				return content;
			}),
			remove: vi.fn(async (path: string) => {
				delete storage[path];
			}),
		} as any,
	} as any;
};

// Mock TFile
const createMockFile = (path: string, basename: string): TFile => ({
	path,
	basename,
	parent: null,
	vault: {} as Vault,
	stat: {
		ctime: Date.now(),
		mtime: Date.now(),
		size: 0,
	},
	extension: 'md',
	name: `${basename}.md`,
} as TFile);

// Test fixture: Sample document content
const SAMPLE_CONTENT = `---
title: Test Document
tags: [essay, draft]
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

This is a test document.

It has multiple paragraphs.

And some content to analyze.`;

describe('SnapshotManager', () => {
	let vault: Vault;
	let metadataManager: MetadataManager;
	let snapshotManager: SnapshotManager;
	let testFile: TFile;

	beforeEach(() => {
		vault = createMockVault();
		metadataManager = new MetadataManager(vault);
		snapshotManager = new SnapshotManager(vault, metadataManager);
		testFile = createMockFile('test.md', 'test');

		// Initialize test file with sample content
		(vault as any).read.mockImplementation(async (file: TFile) => {
			if (file.path === 'test.md') {
				return SAMPLE_CONTENT;
			}
			throw new Error('File not found');
		});
	});

	describe('createSnapshot', () => {
		it('should create snapshot with custom name', async () => {
			const snapshot = await snapshotManager.createSnapshot(
				testFile,
				'Initial Draft'
			);

			expect(snapshot).toBeDefined();
			expect(snapshot.metadata.name).toBe('Initial Draft');
			expect(snapshot.metadata.id).toMatch(/^snap-\d+-[a-z0-9]+$/);
			expect(snapshot.metadata.source).toBe('manual');
			expect(snapshot.content).toBe(SAMPLE_CONTENT);
			expect(snapshot.metadata.wordCount).toBeGreaterThan(0);
			expect(snapshot.metadata.paragraphCount).toBeGreaterThan(0);
		});

		it('should create snapshot with auto-generated name', async () => {
			const snapshot = await snapshotManager.createSnapshot(testFile);

			expect(snapshot).toBeDefined();
			expect(snapshot.metadata.name).toMatch(/^Snapshot \d{2}\/\d{2}\/\d{4}/);
			expect(snapshot.metadata.source).toBe('auto');
		});

		it('should calculate word count correctly', async () => {
			const snapshot = await snapshotManager.createSnapshot(testFile);

			// "This is a test document. It has multiple paragraphs. And some content to analyze."
			// = 14 words (excluding frontmatter)
			expect(snapshot.metadata.wordCount).toBe(14);
		});

		it('should calculate paragraph count correctly', async () => {
			const snapshot = await snapshotManager.createSnapshot(testFile);

			// 3 paragraphs separated by double newlines
			expect(snapshot.metadata.paragraphCount).toBe(3);
		});

		it('should store snapshot metadata in frontmatter', async () => {
			await snapshotManager.createSnapshot(testFile, 'Test Snapshot');

			const metadata = await metadataManager.readMetadata(testFile);

			expect(metadata.snapshots).toHaveLength(1);
			expect(metadata.snapshots[0].name).toBe('Test Snapshot');
			expect(metadata.stats!.snapshotCount).toBe(1);
		});

		it('should store snapshot content in .writealive/ folder', async () => {
			const snapshot = await snapshotManager.createSnapshot(testFile);

			const snapshotPath = `.writealive/snapshots/test/${snapshot.metadata.id}.md`;

			// Verify content was written
			expect(vault.adapter.write).toHaveBeenCalledWith(
				snapshotPath,
				SAMPLE_CONTENT
			);
		});

		it('should preserve existing snapshots when creating new one', async () => {
			await snapshotManager.createSnapshot(
				testFile,
				'Snapshot 1'
			);
			await snapshotManager.createSnapshot(
				testFile,
				'Snapshot 2'
			);

			const metadata = await metadataManager.readMetadata(testFile);

			expect(metadata.snapshots).toHaveLength(2);
			expect(metadata.snapshots[0].name).toBe('Snapshot 2'); // Newest first
			expect(metadata.snapshots[1].name).toBe('Snapshot 1');
		});

		it('should warn when creating more than 10 snapshots', async () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn');

			// Create 11 snapshots
			for (let i = 0; i < 11; i++) {
				await snapshotManager.createSnapshot(testFile, `Snapshot ${i}`);
			}

			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('10 snapshots')
			);

			consoleWarnSpy.mockRestore();
		});

		it('should include wholeness score if available', async () => {
			// Update metadata with wholeness score
			await metadataManager.updateMetadata(testFile, {
				lastWholenessScore: 7.5,
			});

			const snapshot = await snapshotManager.createSnapshot(testFile);

			expect(snapshot.metadata.wholenessScore).toBe(7.5);
		});

		it('should include center count', async () => {
			// Update metadata with centers
			await metadataManager.updateMetadata(testFile, {
				centers: [
					{
						id: 'center-1',
						text: 'Test center',
						position: { start: 0, end: 10 },
						paragraph: 0,
						confidence: 0.9,
						timestamp: new Date().toISOString(),
						source: 'ai-suggested' as const,
						accepted: false,
					},
				],
			});

			const snapshot = await snapshotManager.createSnapshot(testFile);

			expect(snapshot.metadata.centerCount).toBe(1);
		});

		it('should handle file read error', async () => {
			const errorFile = createMockFile('error.md', 'error');

			await expect(
				snapshotManager.createSnapshot(errorFile)
			).rejects.toThrow(StorageError);
		});
	});

	describe('listSnapshots', () => {
		it('should return empty array when no snapshots exist', async () => {
			const snapshots = await snapshotManager.listSnapshots(testFile);

			expect(snapshots).toEqual([]);
		});

		it('should list all snapshots', async () => {
			await snapshotManager.createSnapshot(testFile, 'Snapshot 1');
			await snapshotManager.createSnapshot(testFile, 'Snapshot 2');
			await snapshotManager.createSnapshot(testFile, 'Snapshot 3');

			const snapshots = await snapshotManager.listSnapshots(testFile);

			expect(snapshots).toHaveLength(3);
		});

		it('should return snapshots sorted by timestamp (newest first)', async () => {
			// Create snapshots with small delays to ensure different timestamps
			await snapshotManager.createSnapshot(
				testFile,
				'Oldest'
			);
			await new Promise((resolve) => setTimeout(resolve, 10));

			await snapshotManager.createSnapshot(
				testFile,
				'Middle'
			);
			await new Promise((resolve) => setTimeout(resolve, 10));

			await snapshotManager.createSnapshot(
				testFile,
				'Newest'
			);

			const snapshots = await snapshotManager.listSnapshots(testFile);

			expect(snapshots[0].name).toBe('Newest');
			expect(snapshots[1].name).toBe('Middle');
			expect(snapshots[2].name).toBe('Oldest');
		});

		it('should handle metadata read error', async () => {
			const errorFile = createMockFile('error.md', 'error');

			await expect(
				snapshotManager.listSnapshots(errorFile)
			).rejects.toThrow(StorageError);
		});
	});

	describe('getSnapshot', () => {
		it('should retrieve snapshot by ID', async () => {
			const created = await snapshotManager.createSnapshot(
				testFile,
				'Test Snapshot'
			);

			const retrieved = await snapshotManager.getSnapshot(
				testFile,
				created.metadata.id
			);

			expect(retrieved).toBeDefined();
			expect(retrieved!.metadata.id).toBe(created.metadata.id);
			expect(retrieved!.metadata.name).toBe('Test Snapshot');
			expect(retrieved!.content).toBe(SAMPLE_CONTENT);
		});

		it('should return null when snapshot not found', async () => {
			const snapshot = await snapshotManager.getSnapshot(
				testFile,
				'non-existent-id'
			);

			expect(snapshot).toBeNull();
		});

		it('should throw error when snapshot content file missing', async () => {
			// Create snapshot metadata but delete content file
			const created = await snapshotManager.createSnapshot(testFile);

			// Mock content file as missing
			(vault.adapter.exists as any).mockResolvedValue(false);

			await expect(
				snapshotManager.getSnapshot(testFile, created.metadata.id)
			).rejects.toThrow(StorageError);
		});
	});

	describe('deleteSnapshot', () => {
		it('should delete snapshot by ID', async () => {
			const snapshot = await snapshotManager.createSnapshot(
				testFile,
				'To Delete'
			);

			await snapshotManager.deleteSnapshot(testFile, snapshot.metadata.id);

			const snapshots = await snapshotManager.listSnapshots(testFile);

			expect(snapshots).toHaveLength(0);
		});

		it('should delete snapshot content file', async () => {
			const snapshot = await snapshotManager.createSnapshot(testFile);

			await snapshotManager.deleteSnapshot(testFile, snapshot.metadata.id);

			const snapshotPath = `.writealive/snapshots/test/${snapshot.metadata.id}.md`;

			expect(vault.adapter.remove).toHaveBeenCalledWith(snapshotPath);
		});

		it('should preserve other snapshots when deleting one', async () => {
			await snapshotManager.createSnapshot(
				testFile,
				'Keep 1'
			);
			const snap2 = await snapshotManager.createSnapshot(
				testFile,
				'Delete'
			);
			await snapshotManager.createSnapshot(
				testFile,
				'Keep 2'
			);

			await snapshotManager.deleteSnapshot(testFile, snap2.metadata.id);

			const snapshots = await snapshotManager.listSnapshots(testFile);

			expect(snapshots).toHaveLength(2);
			expect(snapshots.map((s) => s.name)).toEqual(['Keep 2', 'Keep 1']);
		});

		it('should throw error when snapshot not found', async () => {
			await expect(
				snapshotManager.deleteSnapshot(testFile, 'non-existent-id')
			).rejects.toThrow(StorageError);
		});
	});

	describe('restoreSnapshot', () => {
		it('should restore document to snapshot state', async () => {
			// Create original snapshot
			const originalSnapshot = await snapshotManager.createSnapshot(
				testFile,
				'Original'
			);

			// Modify document
			const modifiedContent = SAMPLE_CONTENT.replace(
				'test document',
				'modified document'
			);
			await vault.modify(testFile, modifiedContent);

			// Restore to original
			await snapshotManager.restoreSnapshot(
				testFile,
				originalSnapshot.metadata.id
			);

			const restoredContent = await vault.read(testFile);

			expect(restoredContent).toBe(SAMPLE_CONTENT);
		});

		it('should create backup snapshot before restoring', async () => {
			const snapshot = await snapshotManager.createSnapshot(testFile);

			await snapshotManager.restoreSnapshot(testFile, snapshot.metadata.id);

			const snapshots = await snapshotManager.listSnapshots(testFile);

			// Should have original + backup
			expect(snapshots.length).toBeGreaterThanOrEqual(2);
			expect(snapshots[0].name).toContain('Backup before restore');
		});

		it('should throw error when snapshot not found', async () => {
			await expect(
				snapshotManager.restoreSnapshot(testFile, 'non-existent-id')
			).rejects.toThrow(StorageError);
		});
	});

	describe('edge cases', () => {
		it('should handle document without frontmatter', async () => {
			const noFrontmatterContent = 'Simple document without frontmatter.';

			(vault as any).read.mockResolvedValue(noFrontmatterContent);

			const snapshot = await snapshotManager.createSnapshot(testFile);

			expect(snapshot.content).toBe(noFrontmatterContent);
			expect(snapshot.metadata.wordCount).toBe(4);
			expect(snapshot.metadata.paragraphCount).toBe(1);
		});

		it('should handle empty document', async () => {
			(vault as any).read.mockResolvedValue('');

			const snapshot = await snapshotManager.createSnapshot(testFile);

			expect(snapshot.content).toBe('');
			expect(snapshot.metadata.wordCount).toBe(0);
			expect(snapshot.metadata.paragraphCount).toBe(0);
		});

		it('should handle document with only whitespace', async () => {
			(vault as any).read.mockResolvedValue('   \n\n   \n   ');

			const snapshot = await snapshotManager.createSnapshot(testFile);

			expect(snapshot.metadata.wordCount).toBe(0);
			expect(snapshot.metadata.paragraphCount).toBe(0);
		});

		it('should generate unique snapshot IDs', async () => {
			const snap1 = await snapshotManager.createSnapshot(testFile);
			const snap2 = await snapshotManager.createSnapshot(testFile);
			const snap3 = await snapshotManager.createSnapshot(testFile);

			expect(snap1.metadata.id).not.toBe(snap2.metadata.id);
			expect(snap2.metadata.id).not.toBe(snap3.metadata.id);
			expect(snap1.metadata.id).not.toBe(snap3.metadata.id);
		});
	});
});
