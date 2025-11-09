/**
 * Manual QA Test Suite for Outcome Service Layer
 *
 * Tests edge cases, performance, and user experience scenarios
 * that may not be covered by automated unit tests.
 *
 * Run with: npm test -- outcome-service-qa.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OutcomeManager } from '../../src/services/outcome/outcome-manager';
import type {
	OutcomeDefinition,
	DocumentStructure,
	DocumentSection,
} from '../../src/services/outcome/types';
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
		read: async (file: TFile) => {
			const content = storage.get(file.path);
			if (content === undefined) {
				throw new Error(`File not found: ${file.path}`);
			}
			return content;
		},
		modify: async (file: TFile, content: string) => {
			storage.set(file.path, content);
		},
		create: async (path: string, content: string) => {
			storage.set(path, content);
			return createMockFile(path);
		},
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
 * Create minimal valid structure
 */
function createMinimalStructure(): DocumentStructure {
	const section: DocumentSection = {
		id: 'section-1',
		title: 'Main Section',
		purpose: 'Write the content',
		estimatedWords: 500,
		estimatedMinutes: 15,
		writingPrompt: 'Write about your topic',
		order: 1,
		required: true,
		status: 'not-started',
	};

	return {
		title: 'Test Document',
		sections: [section],
		totalEstimatedWords: 500,
		totalEstimatedMinutes: 15,
		generatedAt: new Date().toISOString(),
		generationCost: 0.005,
	};
}

describe('QA: Edge Cases & Unicode Handling', () => {
	let manager: OutcomeManager;
	let vault: Vault & {
		_setContent: (path: string, content: string) => void;
		_getContent: (path: string) => string | undefined;
	};

	beforeEach(() => {
		vault = createMockVault();
		manager = new OutcomeManager(vault);
	});

	describe('Unicode and Emoji in Descriptions', () => {
		it('should accept descriptions with emojis (US-1)', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective 🚀 for engineering team covering wins 🎯 and challenges 💪',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should accept descriptions with CJK characters', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4製品のレトロスペクティブレポート for engineering team covering wins and challenges',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
		});

		it('should accept descriptions with special characters', () => {
			const outcome: OutcomeDefinition = {
				description:
					'API Specification für REST-Endpoints (v2.0) — comprehensive guide for developers',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
		});

		it('should create document with emoji in description', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective 🚀 for engineering team covering wins and challenges',
			};
			const structure = createMinimalStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('🚀');
		});
	});

	describe('Boundary Conditions (US-1)', () => {
		it('should accept exactly 50 characters', () => {
			const outcome: OutcomeDefinition = {
				description: 'A'.repeat(50),
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should accept exactly 500 characters', () => {
			const outcome: OutcomeDefinition = {
				description: 'A'.repeat(500),
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject 49 characters', () => {
			const outcome: OutcomeDefinition = {
				description: 'A'.repeat(49),
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('too short');
		});

		it('should reject 501 characters', () => {
			const outcome: OutcomeDefinition = {
				description: 'A'.repeat(501),
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('too long');
		});
	});

	describe('Empty and Null Inputs', () => {
		it('should reject empty string description', () => {
			const outcome: OutcomeDefinition = {
				description: '',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('required');
		});

		it('should reject whitespace-only description', () => {
			const outcome: OutcomeDefinition = {
				description: '   \n\t   ',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('required');
		});

		it('should handle undefined optional fields gracefully', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins and challenges',
				audience: undefined,
				topics: undefined,
				lengthPreference: undefined,
				documentType: undefined,
				estimatedTime: undefined,
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
		});
	});

	describe('Malformed Data', () => {
		it('should handle description with only newlines', () => {
			const outcome: OutcomeDefinition = {
				description: '\n\n\n\n\n\n\n\n\n\n',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('required');
		});

		it('should handle description with control characters', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product\x00Retrospective\x1B for team covering wins and challenges',
			};

			const result = manager.validateOutcome(outcome);

			// Should still validate length correctly
			expect(result.valid).toBe(true);
		});
	});
});

describe('QA: Document Type Detection (US-1)', () => {
	let manager: OutcomeManager;

	beforeEach(() => {
		const vault = createMockVault();
		manager = new OutcomeManager(vault);
	});

	describe('Comprehensive Document Type Coverage', () => {
		it('should detect "retrospective" variants', () => {
			const tests = [
				'Q4 retrospective for team',
				'Post-mortem analysis of incident',
				'Lessons learned from project',
				'What went well and what went wrong',
			];

			for (const description of tests) {
				const result = manager.detectDocumentType(description);
				expect(result.documentType).toBe('retrospective');
				expect(result.confidence).toBeGreaterThanOrEqual(0.7);
			}
		});

		it('should detect "proposal" variants', () => {
			const tests = [
				'Product proposal for new feature',
				'Recommendation for architecture change',
				'Pitch for Q4 initiative',
			];

			for (const description of tests) {
				const result = manager.detectDocumentType(description);
				expect(result.documentType).toBe('proposal');
			}
		});

		it('should detect "specification" variants', () => {
			const tests = [
				'Technical specification for API',
				'API spec for endpoints',
				'Requirements document for feature',
			];

			for (const description of tests) {
				const result = manager.detectDocumentType(description);
				expect(result.documentType).toBe('specification');
			}
		});

		it('should detect "documentation" variants', () => {
			const tests = [
				'Tutorial guide for beginners',
				'How-to documentation for API',
				'Reference docs for SDK',
			];

			for (const description of tests) {
				const result = manager.detectDocumentType(description);
				expect(result.documentType).toBe('documentation');
			}
		});

		it('should handle ambiguous descriptions', () => {
			const result = manager.detectDocumentType(
				'General writing about project'
			);

			expect(result.documentType).toBe('unknown');
			expect(result.confidence).toBeLessThan(0.5);
		});
	});

	describe('Confidence Scoring Accuracy', () => {
		it('should give high confidence (0.9) for multiple keyword matches', () => {
			const result = manager.detectDocumentType(
				'Retrospective postmortem covering lessons learned'
			);

			expect(result.confidence).toBeGreaterThanOrEqual(0.9);
			expect(result.keywords.length).toBeGreaterThan(1);
		});

		it('should give medium confidence (0.7) for single keyword match', () => {
			const result = manager.detectDocumentType(
				'Write a proposal for the new feature'
			);

			expect(result.confidence).toBe(0.7);
			expect(result.keywords).toHaveLength(1);
		});

		it('should give low confidence (0.0) for no matches', () => {
			const result = manager.detectDocumentType(
				'Generic document about various topics'
			);

			expect(result.confidence).toBe(0);
			expect(result.keywords).toHaveLength(0);
		});
	});
});

describe('QA: Performance Metrics', () => {
	let manager: OutcomeManager;
	let vault: Vault & {
		_setContent: (path: string, content: string) => void;
		_getContent: (path: string) => string | undefined;
	};

	beforeEach(() => {
		vault = createMockVault();
		manager = new OutcomeManager(vault);
	});

	describe('Validation Performance', () => {
		it('should validate 500-char description in <5ms', () => {
			const outcome: OutcomeDefinition = {
				description:
					'A'.repeat(250) +
					' retrospective for team ' +
					'B'.repeat(237), // 500 chars
			};

			const start = performance.now();
			manager.validateOutcome(outcome);
			const duration = performance.now() - start;

			expect(duration).toBeLessThan(5);
		});

		it('should validate vague keywords in <5ms', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Maybe write something about some things we did in the project for team',
			};

			const start = performance.now();
			manager.validateOutcome(outcome);
			const duration = performance.now() - start;

			expect(duration).toBeLessThan(5);
		});

		it('should detect document type in <5ms', () => {
			const description =
				'Q4 Product Retrospective postmortem covering lessons learned';

			const start = performance.now();
			manager.detectDocumentType(description);
			const duration = performance.now() - start;

			expect(duration).toBeLessThan(5);
		});
	});

	describe('Document Creation Performance', () => {
		it('should create document with minimal structure in <100ms', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins',
			};
			const structure = createMinimalStructure();

			const start = performance.now();
			await manager.createOutcomeDocument(outcome, structure);
			const duration = performance.now() - start;

			expect(duration).toBeLessThan(100);
		});

		it('should create document with 6 sections in <100ms', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins',
			};

			// Create structure with 6 sections
			const sections: DocumentSection[] = Array.from(
				{ length: 6 },
				(_, i) => ({
					id: `section-${i + 1}`,
					title: `Section ${i + 1}`,
					purpose: `Purpose of section ${i + 1}`,
					estimatedWords: 200,
					estimatedMinutes: 5,
					writingPrompt: `Write about section ${i + 1}`,
					order: i + 1,
					required: true,
					status: 'not-started' as const,
				})
			);

			const structure: DocumentStructure = {
				title: 'Test Document',
				sections,
				totalEstimatedWords: 1200,
				totalEstimatedMinutes: 30,
				generatedAt: new Date().toISOString(),
				generationCost: 0.008,
			};

			const start = performance.now();
			await manager.createOutcomeDocument(outcome, structure);
			const duration = performance.now() - start;

			expect(duration).toBeLessThan(100);
		});
	});
});

describe('QA: User Experience & Error Messages', () => {
	let manager: OutcomeManager;

	beforeEach(() => {
		const vault = createMockVault();
		manager = new OutcomeManager(vault);
	});

	describe('Helpful Error Messages', () => {
		it('should provide specific character count in error', () => {
			const outcome: OutcomeDefinition = {
				description: 'Too short', // 9 chars
			};

			const result = manager.validateOutcome(outcome);

			expect(result.errors[0]).toContain('9 chars');
			expect(result.errors[0]).toContain('Minimum: 50 chars');
		});

		it('should provide actionable suggestions for short descriptions', () => {
			const outcome: OutcomeDefinition = {
				description: 'Write doc',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.suggestions.length).toBeGreaterThan(0);
			expect(result.suggestions[0]).toContain('retrospective');
		});

		it('should explain vagueness with specific keywords found', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Write something about stuff for the team to understand things better',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.warnings[0]).toContain('something');
			expect(result.warnings[0]).toContain('stuff');
			expect(result.warnings[0]).toContain('things');
		});

		it('should provide guidance for improving vague outcomes', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Maybe write something about the project for team',
			};

			const result = manager.validateOutcome(outcome);

			const allMessages = [
				...result.warnings,
				...result.suggestions,
			].join(' ');
			expect(allMessages).toContain('specific');
		});
	});

	describe('Clear Validation Feedback', () => {
		it('should clearly indicate valid outcomes', () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins and challenges',
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
			expect(result.warnings).toHaveLength(0);
		});

		it('should distinguish errors from warnings', () => {
			const outcome: OutcomeDefinition = {
				description: 'Write something', // Short + vague
			};

			const result = manager.validateOutcome(outcome);

			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0); // Too short
			expect(result.warnings.length).toBeGreaterThan(0); // Vague
		});

		it('should provide context for document type detection', () => {
			const result = manager.detectDocumentType(
				'Q4 retrospective postmortem'
			);

			expect(result.keywords.length).toBeGreaterThan(0);
			expect(result.keywords).toContain('retrospective');
		});
	});
});

describe('QA: Document Creation & Frontmatter', () => {
	let manager: OutcomeManager;
	let vault: Vault & {
		_setContent: (path: string, content: string) => void;
		_getContent: (path: string) => string | undefined;
	};

	beforeEach(() => {
		vault = createMockVault();
		manager = new OutcomeManager(vault);
	});

	describe('Frontmatter Integrity (US-1)', () => {
		it('should create valid YAML frontmatter', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins',
			};
			const structure = createMinimalStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toMatch(/^---\n/);
			expect(content).toMatch(/\n---\n/);
		});

		it('should include all required metadata fields', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins',
			};
			const structure = createMinimalStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('mode: outcome-driven');
			expect(content).toContain('outcome:');
			expect(content).toContain('structure:');
			expect(content).toContain('progress:');
			expect(content).toContain('createdAt:');
			expect(content).toContain('completedAt:');
			expect(content).toContain('totalCost:');
		});

		it('should create readable frontmatter with proper indentation', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins',
				audience: 'Engineering team',
				topics: ['wins', 'challenges'],
			};
			const structure = createMinimalStructure();

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			// YAML should be properly indented
			expect(content).toMatch(/outcome:\s+description:/);
			expect(content).toMatch(/progress:\s+currentSectionId:/);
		});
	});

	describe('Document Body Generation', () => {
		it('should create section headers in correct order', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins',
			};

			const sections: DocumentSection[] = [
				{
					id: 'section-1',
					title: 'Executive Summary',
					purpose: 'High-level overview',
					estimatedWords: 200,
					estimatedMinutes: 5,
					writingPrompt: 'Summarize...',
					order: 1,
					required: true,
					status: 'not-started',
				},
				{
					id: 'section-2',
					title: 'What Went Well',
					purpose: 'Celebrate successes',
					estimatedWords: 300,
					estimatedMinutes: 10,
					writingPrompt: 'List wins...',
					order: 2,
					required: true,
					status: 'not-started',
				},
			];

			const structure: DocumentStructure = {
				title: 'Q4 Product Retrospective',
				sections,
				totalEstimatedWords: 500,
				totalEstimatedMinutes: 15,
				generatedAt: new Date().toISOString(),
				generationCost: 0.005,
			};

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			const execSummaryIndex = content!.indexOf('## Executive Summary');
			const wentWellIndex = content!.indexOf('## What Went Well');

			expect(execSummaryIndex).toBeGreaterThan(0);
			expect(wentWellIndex).toBeGreaterThan(execSummaryIndex);
		});

		it('should include writing prompts for each section', async () => {
			const outcome: OutcomeDefinition = {
				description:
					'Q4 Product Retrospective for engineering team covering wins',
			};
			const structure = createMinimalStructure();
			structure.sections[0].writingPrompt =
				'Unique prompt for testing';

			const file = await manager.createOutcomeDocument(
				outcome,
				structure
			);

			const content = vault._getContent(file.path);
			expect(content).toContain('Unique prompt for testing');
		});
	});
});
