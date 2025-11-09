/**
 * Outcome Manager Unit Tests
 *
 * Tests the OutcomeManager service for outcome-driven writing operations.
 *
 * Test Coverage:
 * - Outcome validation (length, vagueness, specificity)
 * - Document type detection (keyword matching, confidence scoring)
 * - Document creation (frontmatter, structure, metadata)
 * - Progress tracking (reading, updating)
 * - Error handling (validation failures, invalid structures)
 * - Edge cases (empty outcomes, unknown types, malformed metadata)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OutcomeManager } from '../../src/services/outcome/outcome-manager';
import type {
	OutcomeDefinition,
	DocumentStructure,
	DocumentSection,
} from '../../src/services/outcome/types';
import { OutcomeError } from '../../src/services/outcome/types';
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
		create: vi.fn(async (path: string, content: string) => {
			storage.set(path, content);
			return createMockFile(path);
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


/**
 * Create sample outcome definition
 */
function createSampleOutcome(): OutcomeDefinition {
	return {
		description:
			'Q4 Product Retrospective for engineering team and leadership',
		audience: 'Engineering team and leadership',
		topics: ['wins', 'challenges', 'lessons', 'actions'],
		lengthPreference: 'medium',
		documentType: 'retrospective',
		estimatedTime: 35,
	};
}

/**
 * Create sample document structure
 */
function createSampleStructure(): DocumentStructure {
	const sections: DocumentSection[] = [
		{
			id: 'section-1',
			title: 'Executive Summary',
			purpose: 'High-level outcomes for leadership',
			estimatedWords: 200,
			estimatedMinutes: 5,
			writingPrompt: 'Summarize key achievement in 1-2 sentences...',
			order: 1,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-2',
			title: 'What Went Well',
			purpose: 'Celebrate successes and show impact',
			estimatedWords: 400,
			estimatedMinutes: 10,
			writingPrompt: 'List 3-5 major wins with impact...',
			order: 2,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-3',
			title: 'Challenges & Solutions',
			purpose: 'Honest reflection on obstacles',
			estimatedWords: 400,
			estimatedMinutes: 10,
			writingPrompt: 'Identify 2-3 major obstacles...',
			order: 3,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-4',
			title: 'Lessons & Action Items',
			purpose: 'Forward-looking insights',
			estimatedWords: 300,
			estimatedMinutes: 10,
			writingPrompt: 'What will you do differently next time?',
			order: 4,
			required: true,
			status: 'not-started',
		},
	];

	return {
		title: 'Q4 Product Retrospective',
		sections,
		totalEstimatedWords: 1300,
		totalEstimatedMinutes: 35,
		generatedAt: '2025-11-08T14:30:00Z',
		generationCost: 0.008,
	};
}

describe('OutcomeManager', () => {
	let manager: OutcomeManager;
	let vault: Vault & {
		_setContent: (path: string, content: string) => void;
		_getContent: (path: string) => string | undefined;
	};

	beforeEach(() => {
		vault = createMockVault();
		manager = new OutcomeManager(vault);
	});

	describe('validateOutcome', () => {
		it('should accept valid outcome with good description', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins and challenges',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject outcome with missing description', () => {
			const outcome: OutcomeDefinition = {
				description: '',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Outcome description is required.');
		});

		it('should reject outcome with too short description', () => {
			const outcome: OutcomeDefinition = {
				description: 'Write a document', // < 50 chars
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('too short');
			expect(result.errors[0]).toContain('Minimum: 50 chars');
		});

		it('should reject outcome with too long description', () => {
			const outcome: OutcomeDefinition = {
				description: 'A'.repeat(501), // > 500 chars
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('too long');
			expect(result.errors[0]).toContain('Maximum: 500 chars');
		});

		it('should warn about vague keywords - "something"', () => {
			const outcome: OutcomeDefinition = {
				description:
					'I want to write something about product development for the team to read',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true); // Warnings don't fail validation
			expect(result.warnings.length).toBeGreaterThan(0);
			expect(result.warnings[0]).toContain("'something'");
		});

		it('should warn about vague keywords - "stuff"', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Write some stuff about the project for our team to understand better',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.warnings.length).toBeGreaterThan(0);
			expect(result.warnings[0]).toContain("'stuff'");
		});

		it('should warn about vague keywords - multiple', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Maybe write something about some things we did in the project',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.warnings.length).toBeGreaterThan(0);
			// Should detect: maybe, something, some, things
			expect(result.warnings[0]).toContain('maybe');
			expect(result.warnings[0]).toContain('something');
		});

		it('should not flag vague keywords in compound words', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Write a comprehensive report about the something-specific feature for team',
			};

			const result = manager.validateOutcome(outcome);

			// "something-specific" should not trigger "something" warning
			// because it's part of a compound word
			expect(result.valid).toBe(true);
		});

		it('should provide helpful suggestions for short outcomes', () => {
			const outcome: OutcomeDefinition = {
				description: 'Write a doc', // Too short
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.suggestions.length).toBeGreaterThan(0);
			expect(result.suggestions[0]).toContain('retrospective');
		});

		it('should warn about very brief outcomes lacking substance', () => {
			const outcome: OutcomeDefinition = {
				description: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z A B C D E F G H I J K', // 50+ chars but meaningless
			};

			const result = manager.validateOutcome(outcome);

			expect(result.warnings.length).toBeGreaterThan(0);
		});
	});

	describe('detectDocumentType', () => {
		it('should detect "retrospective" with high confidence', () => {
			const result = manager.detectDocumentType(
				'Q4 retrospective for team covering wins and challenges'
			);

			expect(result.documentType).toBe('retrospective');
			expect(result.confidence).toBeGreaterThanOrEqual(0.7);
			expect(result.keywords).toContain('retrospective');
		});

		it('should detect "proposal" with high confidence', () => {
			const result = manager.detectDocumentType(
				'Product proposal for new feature recommendation'
			);

			expect(result.documentType).toBe('proposal');
			expect(result.confidence).toBeGreaterThanOrEqual(0.7);
		});

		it('should detect "specification" from "spec" keyword', () => {
			const result = manager.detectDocumentType(
				'Technical spec for API endpoints and requirements'
			);

			expect(result.documentType).toBe('specification');
			expect(result.confidence).toBeGreaterThanOrEqual(0.7);
		});

		it('should detect "documentation" from "tutorial" keyword', () => {
			const result = manager.detectDocumentType(
				'Tutorial guide for beginners using our API'
			);

			expect(result.documentType).toBe('documentation');
			expect(result.confidence).toBeGreaterThanOrEqual(0.7);
		});

		it('should detect "meeting-summary" from multiple keywords', () => {
			const result = manager.detectDocumentType(
				'Meeting summary with action items and notes'
			);

			expect(result.documentType).toBe('meeting-summary');
			expect(result.confidence).toBeGreaterThanOrEqual(0.7);
		});

		it('should return "unknown" for unclear descriptions', () => {
			const result = manager.detectDocumentType(
				'General writing about various topics'
			);

			expect(result.documentType).toBe('unknown');
			expect(result.confidence).toBeLessThan(0.5);
			expect(result.keywords).toHaveLength(0);
		});

		it('should have higher confidence with multiple keyword matches', () => {
			const result = manager.detectDocumentType(
				'Retrospective postmortem covering lessons learned'
			);

			expect(result.documentType).toBe('retrospective');
			expect(result.confidence).toBeGreaterThanOrEqual(0.9); // Multiple matches
			expect(result.keywords.length).toBeGreaterThan(1);
		});

		it('should be case-insensitive', () => {
			const result = manager.detectDocumentType(
				'RETROSPECTIVE FOR Q4 TEAM'
			);

			expect(result.documentType).toBe('retrospective');
			expect(result.confidence).toBeGreaterThanOrEqual(0.7);
		});
	});

	describe('createOutcomeDocument', () => {
		it('should create document with valid outcome and structure', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			expect(file).toBeDefined();
			expect(file.path).toContain('.md');

			// Verify file content
			const content = vault._getContent(file.path);
			expect(content).toBeDefined();
			expect(content).toContain('---'); // Frontmatter
			expect(content).toContain('mode: outcome-driven');
			expect(content).toContain('Q4 Product Retrospective');
		});

		it('should create document in specified folder', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure,
				{ folder: 'Drafts' }
			);

			expect(file.path).toContain('Drafts/');
		});

		it('should use custom filename if provided', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure,
				{ filename: 'Custom-Filename' }
			);

			expect(file.path).toContain('Custom-Filename');
		});

		it('should reject invalid outcome', async () => {
			const outcome: OutcomeDefinition = {
				description: 'Too short', // < 50 chars
			};
			const structure = createSampleStructure();

			await expect(
				manager.createOutcomeDocument(outcome, structure)
			).rejects.toThrow(OutcomeError);
		});

		it('should reject structure with no sections', async () => {
			const outcome = createSampleOutcome();
			const structure: DocumentStructure = {
				title: 'Empty Structure',
				sections: [],
				totalEstimatedWords: 0,
				totalEstimatedMinutes: 0,
				generatedAt: new Date().toISOString(),
				generationCost: 0,
			};

			await expect(
				manager.createOutcomeDocument(outcome, structure)
			).rejects.toThrow(OutcomeError);
			await expect(
				manager.createOutcomeDocument(outcome, structure)
			).rejects.toThrow('at least one section');
		});

		it('should include outcome metadata in frontmatter', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('outcome:');
			expect(content).toContain(outcome.description);
			expect(content).toContain('retrospective');
		});

		it('should include progress tracking in frontmatter', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('progress:');
			expect(content).toContain('totalSections: 4');
			expect(content).toContain('completedSections: 0');
			expect(content).toContain('wordsWritten: 0');
		});

		it('should include section placeholders in body', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('## Executive Summary');
			expect(content).toContain('## What Went Well');
			expect(content).toContain('## Challenges & Solutions');
			expect(content).toContain('## Lessons & Action Items');
			expect(content).toContain('[Section 1: Start writing here...]');
		});

		it('should include section purposes and prompts', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('*Purpose: High-level outcomes for leadership*');
			expect(content).toContain('**Writing Prompt:** Summarize key achievement');
		});

		it('should track generation cost in metadata', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('totalCost: 0.008');
		});
	});

	describe('getOutcome', () => {
		it('should return null for non-outcome document', async () => {
			const file = createMockFile('test.md');
			vault._setContent('test.md', '# Regular Document\n\nContent here.');

			const outcome = await manager.getOutcome(file);

			expect(outcome).toBeNull();
		});

		it('should return null for document with frontmatter but no outcome', async () => {
			const file = createMockFile('test.md');
			const content = `---
title: Regular Document
tags: [essay]
---

Content here.`;
			vault._setContent('test.md', content);

			const outcome = await manager.getOutcome(file);

			expect(outcome).toBeNull();
		});

		it('should read outcome metadata from outcome-driven document', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			// Create document
			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			// Read it back
			const readOutcome = await manager.getOutcome(file);

			expect(readOutcome).toBeDefined();
			expect(readOutcome?.mode).toBe('outcome-driven');
			expect(readOutcome?.outcome.description).toBe(outcome.description);
			expect(readOutcome?.structure.title).toBe(structure.title);
		});

		it('should throw OutcomeError for malformed frontmatter', async () => {
			const file = createMockFile('test.md');
			const content = `---
invalid yaml: [unclosed
---

Content.`;
			vault._setContent('test.md', content);

			await expect(manager.getOutcome(file)).rejects.toThrow(
				OutcomeError
			);
		});
	});

	describe('updateProgress', () => {
		it('should update progress in outcome document', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			// Create document
			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			// Update progress
			await manager.updateProgress(file, {
				currentSectionId: 'section-1',
				completedSections: 1,
				wordsWritten: 200,
				timeSpent: 5,
				completionPercentage: 25,
			});

			// Read back and verify
			const readOutcome = await manager.getOutcome(file);

			expect(readOutcome?.progress.currentSectionId).toBe('section-1');
			expect(readOutcome?.progress.completedSections).toBe(1);
			expect(readOutcome?.progress.wordsWritten).toBe(200);
			expect(readOutcome?.progress.timeSpent).toBe(5);
		});

		it('should update lastSavedAt timestamp', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const beforeUpdate = await manager.getOutcome(file);
			const oldTimestamp = beforeUpdate?.progress.lastSavedAt;

			// Wait a bit to ensure timestamp difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			await manager.updateProgress(file, {
				wordsWritten: 100,
			});

			const afterUpdate = await manager.getOutcome(file);
			const newTimestamp = afterUpdate?.progress.lastSavedAt;

			expect(newTimestamp).not.toBe(oldTimestamp);
		});

		it('should throw error for non-outcome document', async () => {
			const file = createMockFile('test.md');
			vault._setContent('test.md', '# Regular Document\n\nContent.');

			await expect(
				manager.updateProgress(file, { wordsWritten: 100 })
			).rejects.toThrow(OutcomeError);
		});
	});

	describe('edge cases', () => {
		it('should handle outcome with only required field', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins and challenges',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
		});

		it('should handle outcome with all optional fields', () => {
			const outcome = createSampleOutcome();

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
		});

		it('should generate unique filenames', async () => {
			const outcome = createSampleOutcome();
			const structure = createSampleStructure();

			const file1 = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			// Wait 1ms to ensure different timestamp with milliseconds
			await new Promise((resolve) => setTimeout(resolve, 1));

			const file2 = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			expect(file1.path).not.toBe(file2.path);
		});

		it('should handle very long outcome descriptions', () => {
			const outcome: OutcomeDefinition = {
				description:
					'This is a detailed outcome description that explains exactly what needs to be written including all the context and background information that might be relevant to the writing process and the intended audience who will read this document'.substring(
						0,
						500
					), // Exactly 500 chars
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should handle outcome at minimum length boundary', () => {
			const outcome: OutcomeDefinition = {
				description: 'A'.repeat(50), // Exactly 50 chars
			};

			const result = manager.validateOutcome(outcome);

			// Should pass length check but warn about lack of substance
			expect(result.errors).toHaveLength(0);
		});
	});
});
