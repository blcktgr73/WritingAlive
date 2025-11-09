/**
 * Section Manager Service Tests
 *
 * Comprehensive test suite for SectionManager service.
 * Tests cover all core operations, edge cases, and error handling.
 *
 * Test Coverage:
 * 1. Session State Retrieval
 *    - Valid outcome document
 *    - Non-outcome document
 *    - Current section identification
 * 2. Section Status Updates
 *    - Start section (not-started → in-progress)
 *    - Complete section (in-progress → completed)
 *    - Section not found errors
 * 3. Progress Calculation
 *    - Weighted by word estimates
 *    - Partial credit for in-progress
 *    - All completed = 100%
 * 4. Word Counting
 *    - Plain text
 *    - With frontmatter
 *    - With markdown formatting
 *    - Edge cases (empty, only frontmatter)
 * 5. Auto-save
 *    - Content updates
 *    - Word count updates
 *    - Timestamp updates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { TFile, Vault } from 'obsidian';
import { stringifyYaml } from 'obsidian';
import { SectionManager } from '../../src/services/outcome/section-manager';
import type {
	OutcomeDocumentMetadata,
	DocumentSection,
	SectionProgress,
} from '../../src/services/outcome/types';
import { OutcomeError } from '../../src/services/outcome/types';

/**
 * Mock Vault
 *
 * Simulates Obsidian vault for testing.
 * Stores file content in memory.
 */
class MockVault {
	private files: Map<string, string> = new Map();

	async read(file: TFile): Promise<string> {
		const content = this.files.get(file.path);
		if (!content) {
			throw new Error(`File not found: ${file.path}`);
		}
		return content;
	}

	async modify(file: TFile, content: string): Promise<void> {
		this.files.set(file.path, content);
	}

	async create(path: string, content: string): Promise<TFile> {
		this.files.set(path, content);
		return { path, name: path.split('/').pop() || path } as TFile;
	}

	setFileContent(path: string, content: string): void {
		this.files.set(path, content);
	}

	getFileContent(path: string): string | undefined {
		return this.files.get(path);
	}
}

/**
 * Test Helpers
 */

/**
 * Create mock TFile
 */
function createMockFile(path: string): TFile {
	return {
		path,
		name: path.split('/').pop() || path,
		basename: path.split('/').pop()?.replace('.md', '') || path,
		extension: 'md',
	} as TFile;
}

/**
 * Create test outcome metadata
 */
function createTestOutcomeMetadata(
	overrides?: Partial<OutcomeDocumentMetadata>
): OutcomeDocumentMetadata {
	const sections: DocumentSection[] = [
		{
			id: 'section-1',
			title: 'Executive Summary',
			purpose: 'High-level overview',
			estimatedWords: 200,
			estimatedMinutes: 5,
			writingPrompt: 'Summarize key outcomes',
			order: 1,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-2',
			title: 'What Went Well',
			purpose: 'Celebrate wins',
			estimatedWords: 400,
			estimatedMinutes: 10,
			writingPrompt: 'List 3-5 wins',
			order: 2,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-3',
			title: 'Challenges',
			purpose: 'Document obstacles',
			estimatedWords: 400,
			estimatedMinutes: 10,
			writingPrompt: 'List 3-5 challenges',
			order: 3,
			required: true,
			status: 'not-started',
		},
	];

	const progress: SectionProgress = {
		currentSectionId: null,
		totalSections: 3,
		completedSections: 0,
		wordsWritten: 0,
		timeSpent: 0,
		completionPercentage: 0,
		sessionStartedAt: '2025-11-08T14:30:00Z',
		lastSavedAt: '2025-11-08T14:30:00Z',
	};

	return {
		mode: 'outcome-driven',
		outcome: {
			description: 'Q4 Product Retrospective',
		},
		structure: {
			title: 'Q4 Retrospective',
			sections,
			totalEstimatedWords: 1000,
			totalEstimatedMinutes: 25,
			generatedAt: '2025-11-08T14:30:00Z',
			generationCost: 0.008,
		},
		progress,
		createdAt: '2025-11-08T14:30:00Z',
		completedAt: null,
		totalCost: 0.008,
		...overrides,
	};
}

/**
 * Create document content with frontmatter
 */
function createDocumentContent(
	metadata: OutcomeDocumentMetadata,
	body: string = ''
): string {
	const frontmatter = {
		title: metadata.structure.title,
		...metadata,
	};

	// Use Obsidian's YAML stringification
	const yaml = stringifyYaml(frontmatter);

	return `---\n${yaml.trim()}\n---\n\n${body}`;
}

/**
 * Tests
 */

describe('SectionManager', () => {
	let vault: MockVault;
	let sectionManager: SectionManager;
	let testFile: TFile;

	beforeEach(() => {
		vault = new MockVault();
		sectionManager = new SectionManager(vault as unknown as Vault);
		testFile = createMockFile('test-retrospective.md');
	});

	describe('getSessionState', () => {
		it('should retrieve session state for outcome-driven document', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.progress.currentSectionId = 'section-2';
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const state = await sectionManager.getSessionState(testFile);

			// Assert
			expect(state).not.toBeNull();
			expect(state?.currentSection?.id).toBe('section-2');
			expect(state?.currentSection?.title).toBe('What Went Well');
			expect(state?.sections).toHaveLength(3);
			expect(state?.progress.currentSectionId).toBe('section-2');
			expect(state?.metadata.mode).toBe('outcome-driven');
		});

		it('should return null for non-outcome document', async () => {
			// Arrange
			const content = '# Regular Document\n\nJust some content.';
			vault.setFileContent(testFile.path, content);

			// Act
			const state = await sectionManager.getSessionState(testFile);

			// Assert
			expect(state).toBeNull();
		});

		it('should handle document with no current section', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.progress.currentSectionId = null;
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const state = await sectionManager.getSessionState(testFile);

			// Assert
			expect(state).not.toBeNull();
			expect(state?.currentSection).toBeNull();
			expect(state?.sections).toHaveLength(3);
		});

		it('should throw error for invalid metadata', async () => {
			// Arrange
			const content = '---\ninvalid: yaml: syntax:\n---\n';
			vault.setFileContent(testFile.path, content);

			// Act & Assert
			await expect(
				sectionManager.getSessionState(testFile)
			).rejects.toThrow(OutcomeError);
		});
	});

	describe('startSection', () => {
		it('should start a section successfully', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			await sectionManager.startSection(testFile, 'section-2');

			// Verify
			const state = await sectionManager.getSessionState(testFile);
			const section = state?.sections.find((s) => s.id === 'section-2');

			expect(section?.status).toBe('in-progress');
			expect(section?.startedAt).toBeDefined();
			expect(state?.progress.currentSectionId).toBe('section-2');
		});

		it('should throw error for non-existent section', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act & Assert
			await expect(
				sectionManager.startSection(testFile, 'section-999')
			).rejects.toThrow(OutcomeError);
		});

		it('should throw error for non-outcome document', async () => {
			// Arrange
			const content = '# Regular Document';
			vault.setFileContent(testFile.path, content);

			// Act & Assert
			await expect(
				sectionManager.startSection(testFile, 'section-1')
			).rejects.toThrow(OutcomeError);
		});
	});

	describe('completeSection', () => {
		it('should complete section with content', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.structure.sections[1].status = 'in-progress';
			metadata.structure.sections[1].startedAt = '2025-11-08T14:35:00Z';
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			const sectionContent = `## What Went Well

1. Launched new API successfully
2. Improved performance by 50%
3. Excellent team collaboration`;

			// Act
			await sectionManager.completeSection(
				testFile,
				'section-2',
				sectionContent
			);

			// Verify
			const state = await sectionManager.getSessionState(testFile);
			const section = state?.sections.find((s) => s.id === 'section-2');

			expect(section?.status).toBe('completed');
			expect(section?.completedAt).toBeDefined();
			expect(section?.content).toBe(sectionContent);
			expect(section?.actualWords).toBeGreaterThan(0);
			expect(section?.actualMinutes).toBeDefined();
		});

		it('should update overall progress after completion', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[0].actualWords = 200;
			metadata.progress.completedSections = 1;
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			await sectionManager.completeSection(
				testFile,
				'section-2',
				'Content for section 2'
			);

			// Verify
			const state = await sectionManager.getSessionState(testFile);

			expect(state?.progress.completedSections).toBe(2);
			expect(state?.progress.wordsWritten).toBeGreaterThan(0);
		});

		it('should set currentSectionId to null when all sections completed', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			// Complete first two sections
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[1].status = 'completed';
			metadata.progress.currentSectionId = 'section-3';
			metadata.progress.completedSections = 2;
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act - Complete last section
			await sectionManager.completeSection(
				testFile,
				'section-3',
				'Final section content'
			);

			// Verify
			const state = await sectionManager.getSessionState(testFile);

			expect(state?.progress.completedSections).toBe(3);
			expect(state?.progress.currentSectionId).toBeNull();
			expect(state?.progress.completionPercentage).toBe(100);
		});
	});

	describe('autoSaveSection', () => {
		it('should auto-save section content', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.structure.sections[1].status = 'in-progress';
			metadata.progress.currentSectionId = 'section-2';
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			const partialContent = 'Work in progress...';

			// Act
			await sectionManager.autoSaveSection(
				testFile,
				'section-2',
				partialContent
			);

			// Verify
			const state = await sectionManager.getSessionState(testFile);
			const section = state?.sections.find((s) => s.id === 'section-2');

			expect(section?.content).toBe(partialContent);
			expect(section?.actualWords).toBe(3); // "Work in progress"
			expect(state?.progress.lastSavedAt).toBeDefined();
		});

		it('should update total word count on auto-save', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[0].actualWords = 200;
			metadata.structure.sections[1].status = 'in-progress';
			metadata.progress.wordsWritten = 200;
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			await sectionManager.autoSaveSection(
				testFile,
				'section-2',
				'New content with ten words here for testing purposes'
			);

			// Verify
			const state = await sectionManager.getSessionState(testFile);

			// 200 (section-1) + 9 (section-2: "New content with ten words here for testing purposes") = 209
			expect(state?.progress.wordsWritten).toBe(209);
		});

		it('should not change section status on auto-save', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.structure.sections[1].status = 'in-progress';
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			await sectionManager.autoSaveSection(
				testFile,
				'section-2',
				'Auto-saved content'
			);

			// Verify
			const state = await sectionManager.getSessionState(testFile);
			const section = state?.sections.find((s) => s.id === 'section-2');

			expect(section?.status).toBe('in-progress');
			expect(section?.completedAt).toBeUndefined();
		});
	});

	describe('calculateProgress', () => {
		it('should return 0% for no progress', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const progress = await sectionManager.calculateProgress(testFile);

			// Assert
			expect(progress).toBe(0);
		});

		it('should calculate weighted progress correctly', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();

			// Section 1: 200 words, completed
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[0].actualWords = 200;

			// Section 2: 400 words, not started
			// Section 3: 400 words, not started

			// Total estimated: 1000 words
			// Completed: 200 words
			// Expected: 20%

			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const progress = await sectionManager.calculateProgress(testFile);

			// Assert
			expect(progress).toBe(20);
		});

		it('should give partial credit for in-progress sections', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();

			// Section 1: 200 words, completed
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[0].actualWords = 200;

			// Section 2: 400 words, in-progress with 150 words
			metadata.structure.sections[1].status = 'in-progress';
			metadata.structure.sections[1].actualWords = 150;

			// Total estimated: 1000 words
			// Completed: 200 (section-1) + 150 (section-2) = 350
			// Expected: 35%

			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const progress = await sectionManager.calculateProgress(testFile);

			// Assert
			expect(progress).toBe(35);
		});

		it('should cap in-progress partial credit at estimated words', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();

			// Section 2: 400 words estimated, but 600 words written
			// Should only count 400 words (estimated cap)
			metadata.structure.sections[1].status = 'in-progress';
			metadata.structure.sections[1].actualWords = 600;

			// Total estimated: 1000 words
			// Completed: 400 (capped)
			// Expected: 40%

			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const progress = await sectionManager.calculateProgress(testFile);

			// Assert
			expect(progress).toBe(40);
		});

		it('should return 100% when all sections completed', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();

			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[1].status = 'completed';
			metadata.structure.sections[2].status = 'completed';

			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const progress = await sectionManager.calculateProgress(testFile);

			// Assert
			expect(progress).toBe(100);
		});

		it('should handle edge case of zero total estimated words', async () => {
			// Arrange
			const metadata = createTestOutcomeMetadata();
			metadata.structure.totalEstimatedWords = 0;
			metadata.structure.sections[0].estimatedWords = 0;
			metadata.structure.sections[1].estimatedWords = 0;
			metadata.structure.sections[2].estimatedWords = 0;

			const content = createDocumentContent(metadata);
			vault.setFileContent(testFile.path, content);

			// Act
			const progress = await sectionManager.calculateProgress(testFile);

			// Assert
			expect(progress).toBe(0);
		});
	});

	describe('countWords', () => {
		it('should count plain text words', () => {
			// Access private method via instance
			const content = 'Hello world this is a test';
			const manager = sectionManager as any;

			const count = manager.countWords(content);

			expect(count).toBe(6);
		});

		it('should exclude YAML frontmatter', () => {
			const content = `---
title: My Document
tags: [essay, draft]
---

This is the actual content with five words.`;

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			expect(count).toBe(8); // "This is the actual content with five words"
		});

		it('should exclude markdown headers', () => {
			const content = `# Main Title
## Subsection
### Sub-subsection

Content here`;

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			expect(count).toBe(6); // "Main Title Subsection Sub-subsection Content here"
		});

		it('should exclude markdown formatting', () => {
			const content =
				'This is **bold** and *italic* and ~~strikethrough~~ text';

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			// "This is bold and italic and strikethrough text" = 8 words (and appears twice)
			expect(count).toBe(8);
		});

		it('should exclude links but keep link text', () => {
			const content = 'Check [this link](https://example.com) out';

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			expect(count).toBe(4); // "Check this link out"
		});

		it('should exclude images', () => {
			const content = 'Here is an image ![alt text](image.png) embedded';

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			expect(count).toBe(5); // "Here is an embedded" (no "image")
		});

		it('should exclude code blocks', () => {
			const content = `Some text before

\`\`\`typescript
const x = 10;
console.log(x);
\`\`\`

Some text after`;

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			expect(count).toBe(6); // "Some text before Some text after"
		});

		it('should exclude inline code', () => {
			const content = 'Use the `console.log()` function here';

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			expect(count).toBe(4); // "Use the function here"
		});

		it('should handle list markers', () => {
			const content = `- Item one
- Item two
* Item three
1. Numbered item`;

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			// "Item one Item two Item three Numbered item" = 8 words
			expect(count).toBe(8);
		});

		it('should return 0 for empty content', () => {
			const manager = sectionManager as any;

			expect(manager.countWords('')).toBe(0);
			expect(manager.countWords('   ')).toBe(0);
			expect(manager.countWords('\n\n\n')).toBe(0);
		});

		it('should return 0 for content with only frontmatter', () => {
			const content = `---
title: My Document
tags: [essay]
---
`;

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			expect(count).toBe(0);
		});

		it('should handle complex markdown document', () => {
			const content = `---
title: Test Document
mode: outcome-driven
---

# Q4 Retrospective

## What Went Well

1. **Launched new API** - [Documentation](https://docs.example.com)
2. *Improved performance* by 50%
3. Excellent team \`collaboration\`

\`\`\`typescript
const result = calculateMetrics();
\`\`\`

This was a great quarter with ten words here.`;

			const manager = sectionManager as any;
			const count = manager.countWords(content);

			// Expected words: "Q4 Retrospective What Went Well Launched new API Documentation
			// Improved performance by 50% Excellent team collaboration
			// This was a great quarter with ten words here"
			expect(count).toBeGreaterThan(20);
		});
	});
});
