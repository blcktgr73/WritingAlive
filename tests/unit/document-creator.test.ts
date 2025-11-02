/**
 * DocumentCreator Service Tests
 *
 * Tests for note creation from AI-discovered centers.
 * Covers frontmatter generation, content generation, filename sanitization,
 * and error handling.
 *
 * Test Strategy:
 * - Unit tests for individual methods (frontmatter, content, filename)
 * - Integration tests for full note creation flow
 * - Edge cases: special characters, empty seeds, long names
 * - Error handling: file creation failures, invalid inputs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DocumentCreator } from '../../src/services/vault/document-creator';
import type { App, TFile } from 'obsidian';
import type { DiscoveredCenter } from '../../src/services/ai/types';
import type { SeedNote } from '../../src/services/vault/types';

// Mock Obsidian App
function createMockApp(): App {
	return {
		vault: {
			create: vi.fn().mockResolvedValue({
				path: 'test-note.md',
				basename: 'test-note',
			} as TFile),
		},
		workspace: {
			getLeaf: vi.fn().mockReturnValue({
				openFile: vi.fn().mockResolvedValue(undefined),
			}),
		},
	} as unknown as App;
}

// Mock DiscoveredCenter
function createMockCenter(
	overrides?: Partial<DiscoveredCenter>
): DiscoveredCenter {
	return {
		name: 'Test Center',
		explanation: 'This is a test center explanation.',
		strength: 'strong' as const,
		connectedSeeds: ['seed-1', 'seed-2'],
		confidence: 0.9,
		assessment: {
			crossDomain: true,
			emotionalResonance: true,
			hasConcrete: true,
			structuralPivot: true,
		},
		...overrides,
	};
}

// Mock SeedNote
function createMockSeed(overrides?: Partial<SeedNote>): SeedNote {
	return {
		file: {} as TFile,
		title: 'Test Seed',
		content: 'This is test seed content.',
		excerpt: 'This is test seed content.',
		tags: ['seed'],
		createdAt: Date.now(),
		modifiedAt: Date.now(),
		backlinks: [],
		path: 'seeds/test-seed.md',
		...overrides,
	};
}

describe('DocumentCreator', () => {
	let app: App;
	let creator: DocumentCreator;

	beforeEach(() => {
		app = createMockApp();
		creator = new DocumentCreator(app);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('createNoteFromCenter', () => {
		it('should create a note with correct filename format', async () => {
			const center = createMockCenter({ name: 'Completeness vs Approximation' });
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			// Check vault.create was called
			expect(app.vault.create).toHaveBeenCalled();

			// Check filename format (should be "Completeness vs Approximation - YYYY-MM-DD.md")
			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filename = createCall[0];

			expect(filename).toMatch(/^Completeness vs Approximation - \d{4}-\d{2}-\d{2}\.md$/);
		});

		it('should create note in specified folder', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds, {
				folder: 'Centers',
			});

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filepath = createCall[0];

			expect(filepath).toMatch(/^Centers\//);
		});

		it('should generate valid frontmatter', async () => {
			const center = createMockCenter();
			const seeds = [
				createMockSeed({ path: 'seeds/seed-1.md' }),
				createMockSeed({ path: 'seeds/seed-2.md' }),
			];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Check frontmatter structure
			expect(content).toContain('---');
			expect(content).toContain('writealive:');
			expect(content).toContain('gathered_seeds:');
			expect(content).toContain('seeds/seed-1.md');
			expect(content).toContain('seeds/seed-2.md');
			expect(content).toContain('selected_center:');
			expect(content).toContain('name: "Test Center"');
			expect(content).toContain('strength: "strong"');
			expect(content).toContain('gathered_at:');
		});

		it('should generate content with center explanation', async () => {
			const center = createMockCenter({
				name: 'Test Center',
				explanation: 'This is a test explanation.',
			});
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Check content structure
			expect(content).toContain('# Test Center');
			expect(content).toContain('> This is a test explanation.');
			expect(content).toContain('What does this center mean to me?');
			expect(content).toContain('[Cursor positioned here]');
		});

		it('should include seeds reference section', async () => {
			const center = createMockCenter();
			const seeds = [
				createMockSeed({
					path: 'seeds/seed-1.md',
					excerpt: 'First seed excerpt.',
				}),
				createMockSeed({
					path: 'seeds/seed-2.md',
					excerpt: 'Second seed excerpt.',
				}),
			];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Check seeds section
			expect(content).toContain('## Gathered Seeds (Reference)');
			expect(content).toContain('> First seed excerpt.');
			expect(content).toContain('[[seeds/seed-1]]');
			expect(content).toContain('> Second seed excerpt.');
			expect(content).toContain('[[seeds/seed-2]]');
		});

		it('should open file after creation', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			expect(app.workspace.getLeaf).toHaveBeenCalled();
			const leaf = app.workspace.getLeaf(false);
			expect(leaf.openFile).toHaveBeenCalled();
		});

		it('should open in new pane when requested', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds, {
				openInNewPane: true,
			});

			expect(app.workspace.getLeaf).toHaveBeenCalledWith('tab');
		});

		it('should throw error on file creation failure', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			vi.mocked(app.vault.create).mockRejectedValueOnce(
				new Error('File already exists')
			);

			await expect(
				creator.createNoteFromCenter(center, seeds)
			).rejects.toThrow('Failed to create note from center');
		});
	});

	describe('filename sanitization', () => {
		it('should sanitize filename with special characters', async () => {
			const center = createMockCenter({
				name: 'What/is/this?',
			});
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filename = createCall[0];

			// Should replace / with - and remove ?
			expect(filename).toMatch(/^What-is-this - \d{4}-\d{2}-\d{2}\.md$/);
		});

		it('should preserve Unicode characters', async () => {
			const center = createMockCenter({
				name: '완전성 vs 근사',
			});
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filename = createCall[0];

			expect(filename).toContain('완전성 vs 근사');
		});

		it('should handle very long center names', async () => {
			const longName = 'A'.repeat(300);
			const center = createMockCenter({ name: longName });
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filename = createCall[0];

			// Filename should be long (not truncated by our code)
			// OS/filesystem will handle length limits
			expect(filename.length).toBeGreaterThan(100);
		});

		it('should handle names with leading/trailing spaces', async () => {
			const center = createMockCenter({
				name: '  Test Center  ',
			});
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filename = createCall[0];

			// Should trim spaces
			expect(filename).toMatch(/^Test Center - \d{4}-\d{2}-\d{2}\.md$/);
		});

		it('should handle names with multiple consecutive spaces', async () => {
			const center = createMockCenter({
				name: 'Test    Center',
			});
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filename = createCall[0];

			// Should collapse spaces
			expect(filename).toMatch(/^Test Center - \d{4}-\d{2}-\d{2}\.md$/);
		});
	});

	describe('frontmatter generation', () => {
		it('should generate valid YAML frontmatter', async () => {
			const center = createMockCenter({
				name: 'Test Center',
				strength: 'strong',
				connectedSeeds: ['seed-1', 'seed-2'],
			});
			const seeds = [
				createMockSeed({ path: 'path/to/seed-1.md' }),
				createMockSeed({ path: 'path/to/seed-2.md' }),
			];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Extract frontmatter
			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
			expect(frontmatterMatch).toBeTruthy();

			const frontmatter = frontmatterMatch![1];

			// Check structure
			expect(frontmatter).toContain('writealive:');
			expect(frontmatter).toContain('gathered_seeds:');
			expect(frontmatter).toContain('- "path/to/seed-1.md"');
			expect(frontmatter).toContain('- "path/to/seed-2.md"');
			expect(frontmatter).toContain('selected_center:');
			expect(frontmatter).toContain('name: "Test Center"');
			expect(frontmatter).toContain('strength: "strong"');
			expect(frontmatter).toContain('connectedSeeds:');
			expect(frontmatter).toContain('- "seed-1"');
			expect(frontmatter).toContain('- "seed-2"');
			expect(frontmatter).toContain('gathered_at:');
		});

		it('should handle empty seeds array', async () => {
			const center = createMockCenter();
			const seeds: SeedNote[] = [];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Should have empty gathered_seeds array
			expect(content).toContain('gathered_seeds:');
			// No seed paths in the array (empty array in YAML doesn't list items)
		});

		it('should escape special characters in YAML values', async () => {
			const center = createMockCenter({
				name: 'Test "Center" with quotes',
			});
			const seeds = [createMockSeed({ path: 'path/with spaces.md' })];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Should escape quotes
			expect(content).toContain('name: "Test \\"Center\\" with quotes"');
		});

		it('should include ISO timestamp', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Should have ISO timestamp format
			expect(content).toMatch(/gathered_at: "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);
		});
	});

	describe('content generation', () => {
		it('should include all content sections', async () => {
			const center = createMockCenter({
				name: 'Test Center',
				explanation: 'Test explanation.',
			});
			const seeds = [createMockSeed({ excerpt: 'Seed excerpt.' })];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Check all sections
			expect(content).toContain('# Test Center'); // Title
			expect(content).toContain('> Test explanation.'); // Explanation
			expect(content).toContain('What does this center mean to me?'); // Prompt
			expect(content).toContain('[Cursor positioned here]'); // Placeholder
			expect(content).toContain('---'); // Separator
			expect(content).toContain('## Gathered Seeds (Reference)'); // Seeds section
			expect(content).toContain('> Seed excerpt.'); // Seed content
		});

		it('should handle seeds without excerpts', async () => {
			const center = createMockCenter();
			const seeds = [
				createMockSeed({
					path: 'test.md',
					excerpt: '', // Empty excerpt
					content: 'Full content here.',
				}),
			];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Should use first line of content
			expect(content).toContain('> Full content here.');
		});

		it('should handle seeds with frontmatter in content', async () => {
			const center = createMockCenter();
			const seeds = [
				createMockSeed({
					path: 'test.md',
					excerpt: '', // Will use content
					content: '---\ntags: [seed]\n---\n\nActual content.',
				}),
			];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Should skip frontmatter and use actual content
			expect(content).toContain('> Actual content.');
			expect(content).not.toContain('tags: [seed]');
		});

		it('should convert seed paths to wikilinks', async () => {
			const center = createMockCenter();
			const seeds = [
				createMockSeed({
					path: 'folder/subfolder/note.md',
					excerpt: 'Test excerpt.',
				}),
			];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Should remove .md extension in wikilink
			expect(content).toContain('[[folder/subfolder/note]]');
		});

		it('should handle multiple seeds correctly', async () => {
			const center = createMockCenter();
			const seeds = [
				createMockSeed({
					path: 'seed-1.md',
					excerpt: 'First excerpt.',
				}),
				createMockSeed({
					path: 'seed-2.md',
					excerpt: 'Second excerpt.',
				}),
				createMockSeed({
					path: 'seed-3.md',
					excerpt: 'Third excerpt.',
				}),
			];

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const content = createCall[1];

			// Should include all seeds
			expect(content).toContain('> First excerpt.');
			expect(content).toContain('[[seed-1]]');
			expect(content).toContain('> Second excerpt.');
			expect(content).toContain('[[seed-2]]');
			expect(content).toContain('> Third excerpt.');
			expect(content).toContain('[[seed-3]]');
		});
	});

	describe('error handling', () => {
		it('should handle file creation errors gracefully', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			vi.mocked(app.vault.create).mockRejectedValueOnce(
				new Error('Disk full')
			);

			await expect(
				creator.createNoteFromCenter(center, seeds)
			).rejects.toThrow('Failed to create note from center: Disk full');
		});

		it('should handle file opening errors gracefully', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			const mockLeaf = {
				openFile: vi.fn().mockRejectedValueOnce(new Error('Editor not ready')),
			};
			vi.mocked(app.workspace.getLeaf).mockReturnValueOnce(mockLeaf as any);

			await expect(
				creator.createNoteFromCenter(center, seeds)
			).rejects.toThrow('Failed to open file: Editor not ready');
		});

		it('should log errors to console', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			vi.mocked(app.vault.create).mockRejectedValueOnce(
				new Error('Test error')
			);

			await expect(
				creator.createNoteFromCenter(center, seeds)
			).rejects.toThrow();

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[DocumentCreator] Failed to create note:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
		});
	});

	describe('date formatting', () => {
		it('should format dates correctly', async () => {
			const center = createMockCenter();
			const seeds = [createMockSeed()];

			// Mock Date to return a specific date
			const mockDate = new Date('2025-11-03T10:30:00Z');
			vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

			await creator.createNoteFromCenter(center, seeds);

			const createCall = vi.mocked(app.vault.create).mock.calls[0];
			const filename = createCall[0];

			expect(filename).toContain('2025-11-03');

			vi.restoreAllMocks();
		});
	});
});
