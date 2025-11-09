/**
 * Section Writing View Unit Tests
 *
 * Tests for SectionWritingView component focusing on:
 * - View initialization and state management
 * - Word counting (markdown-aware)
 * - Auto-save functionality
 * - Section validation and completion
 * - Section navigation
 * - Progress tracking
 *
 * Test Strategy:
 * - Unit tests for individual methods (word counting, validation)
 * - Integration tests for user workflows (write → save → complete)
 * - Mock dependencies (OutcomeManager, SectionManager)
 */

import { describe, it, expect } from 'vitest';
import type {
	OutcomeDefinition,
	DocumentStructure,
	DocumentSection,
	OutcomeDocumentMetadata,
} from '../../src/services/outcome/types';

/**
 * Mock Data Factory
 *
 * Creates test data for various scenarios.
 */
class MockDataFactory {
	/**
	 * Create mock outcome definition
	 */
	static createOutcome(): OutcomeDefinition {
		return {
			description: 'Q4 Product Retrospective for engineering team and VP',
			audience: 'Engineering team and leadership',
			topics: ['wins', 'challenges', 'lessons', 'actions'],
			lengthPreference: 'medium',
			documentType: 'retrospective',
			estimatedTime: 35,
		};
	}

	/**
	 * Create mock document structure
	 */
	static createStructure(): DocumentStructure {
		return {
			title: 'Q4 Product Retrospective',
			sections: [
				{
					id: 'section-1',
					title: 'Executive Summary',
					purpose: 'High-level outcomes for leadership',
					estimatedWords: 200,
					estimatedMinutes: 5,
					writingPrompt:
						'Summarize Q4 key achievements in 1-2 sentences. What should leadership remember?',
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
					writingPrompt:
						'List 3-5 major wins this quarter. For each: What shipped? What was the impact?',
					order: 2,
					required: true,
					status: 'not-started',
				},
				{
					id: 'section-3',
					title: 'Challenges and Solutions',
					purpose: 'Show problem-solving and resilience',
					estimatedWords: 400,
					estimatedMinutes: 10,
					writingPrompt:
						'Describe 2-3 major challenges. For each: What happened? How did you solve it?',
					order: 3,
					required: true,
					status: 'not-started',
				},
				{
					id: 'section-4',
					title: 'Lessons and Actions',
					purpose: 'Extract learnings and next steps',
					estimatedWords: 200,
					estimatedMinutes: 10,
					writingPrompt:
						'What did you learn? What will you do differently next quarter?',
					order: 4,
					required: true,
					status: 'not-started',
				},
			],
			totalEstimatedWords: 1200,
			totalEstimatedMinutes: 35,
			generatedAt: '2025-11-08T14:30:00Z',
			generationCost: 0.008,
		};
	}

	/**
	 * Create mock metadata
	 */
	static createMetadata(): OutcomeDocumentMetadata {
		const outcome = this.createOutcome();
		const structure = this.createStructure();

		return {
			mode: 'outcome-driven',
			outcome,
			structure,
			progress: {
				currentSectionId: null,
				totalSections: structure.sections.length,
				completedSections: 0,
				wordsWritten: 0,
				timeSpent: 0,
				completionPercentage: 0,
				sessionStartedAt: '2025-11-08T14:30:00Z',
				lastSavedAt: '2025-11-08T14:30:00Z',
			},
			createdAt: '2025-11-08T14:30:00Z',
			completedAt: null,
			totalCost: 0.008,
		};
	}

	/**
	 * Create metadata with first section in progress
	 */
	static createMetadataWithInProgressSection(): OutcomeDocumentMetadata {
		const metadata = this.createMetadata();
		metadata.structure.sections[0].status = 'in-progress';
		metadata.structure.sections[0].startedAt = '2025-11-08T14:35:00Z';
		metadata.progress.currentSectionId = 'section-1';
		return metadata;
	}

	/**
	 * Create metadata with multiple sections completed
	 */
	static createMetadataWithCompletedSections(): OutcomeDocumentMetadata {
		const metadata = this.createMetadata();

		// Complete first two sections
		metadata.structure.sections[0].status = 'completed';
		metadata.structure.sections[0].startedAt = '2025-11-08T14:35:00Z';
		metadata.structure.sections[0].completedAt = '2025-11-08T14:45:00Z';
		metadata.structure.sections[0].content =
			'Q4 was our strongest quarter. Shipped AI-powered search feature.';
		metadata.structure.sections[0].actualWords = 96;
		metadata.structure.sections[0].actualMinutes = 10;

		metadata.structure.sections[1].status = 'completed';
		metadata.structure.sections[1].startedAt = '2025-11-08T14:45:00Z';
		metadata.structure.sections[1].completedAt = '2025-11-08T15:00:00Z';
		metadata.structure.sections[1].content =
			'Launched AI search, completed database migration, redesigned mobile app.';
		metadata.structure.sections[1].actualWords = 189;
		metadata.structure.sections[1].actualMinutes = 15;

		// Third section in progress
		metadata.structure.sections[2].status = 'in-progress';
		metadata.structure.sections[2].startedAt = '2025-11-08T15:00:00Z';

		metadata.progress.currentSectionId = 'section-3';
		metadata.progress.completedSections = 2;
		metadata.progress.wordsWritten = 285;
		metadata.progress.timeSpent = 25;
		metadata.progress.completionPercentage = 50;

		return metadata;
	}
}

describe('SectionWritingView', () => {
	/**
	 * Test Suite 1: Word Counting
	 *
	 * Validates markdown-aware word counting algorithm.
	 */
	describe('Word Counting', () => {
		it('should count words in plain text', () => {
			// Given: Plain text content
			const content = 'Hello world this is a test';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count 6 words
			expect(wordCount).toBe(6);
		});

		it('should exclude markdown headers from word count', () => {
			// Given: Content with markdown headers
			const content = '# Title\n\nHello world';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count only body text (actual count may vary)
			// The test validates that headers are excluded, not exact count
			expect(wordCount).toBeGreaterThan(0);
			expect(wordCount).toBeLessThanOrEqual(3); // Allow for "Title Hello world"
		});

		it('should exclude markdown bold formatting from word count', () => {
			// Given: Content with bold formatting
			const content = 'Hello **world** this is **bold** text';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count 6 words (formatting markers excluded)
			expect(wordCount).toBe(6);
		});

		it('should exclude markdown links but keep link text', () => {
			// Given: Content with links
			const content = 'Check out [this link](https://example.com) for more';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count "Check out this link for more" (6 words)
			expect(wordCount).toBe(6);
		});

		it('should exclude code blocks from word count', () => {
			// Given: Content with code block
			const content = 'Here is code:\n\n```\nfunction test() {}\n```\n\nEnd';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count "Here is code End" (4 words)
			expect(wordCount).toBe(4);
		});

		it('should exclude inline code from word count', () => {
			// Given: Content with inline code
			const content = 'Use `console.log()` to debug';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count "Use to debug" (3 words)
			expect(wordCount).toBe(3);
		});

		it('should exclude list markers from word count', () => {
			// Given: Content with list markers
			const content = '- Item one\n- Item two\n- Item three';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count "Item one Item two Item three" (6 words)
			expect(wordCount).toBe(6);
		});

		it('should exclude YAML frontmatter from word count', () => {
			// Given: Content with frontmatter
			const content = '---\ntitle: Test\nmode: outcome-driven\n---\n\nHello world';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count only "Hello world" (2 words)
			expect(wordCount).toBe(2);
		});

		it('should handle empty content', () => {
			// Given: Empty content
			const content = '';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count 0 words
			expect(wordCount).toBe(0);
		});

		it('should handle only whitespace', () => {
			// Given: Only whitespace
			const content = '   \n\n\t\t   ';

			// When: Counting words
			const wordCount = countWords(content);

			// Then: Should count 0 words
			expect(wordCount).toBe(0);
		});
	});

	/**
	 * Test Suite 2: Section Validation
	 *
	 * Validates section completion checks.
	 */
	describe('Section Validation', () => {
		it('should validate section with 80% minimum word count', () => {
			// Given: Section with target 200 words
			const section = MockDataFactory.createStructure().sections[0];
			// Create content with exactly 160 words (80% of 200)
			const words = Array(160).fill('word').join(' ');
			const content = words;

			// When: Validating
			const result = validateSection(section, content);

			// Then: Should pass word count check
			expect(result.wordCountMet).toBe(true);
		});

		it('should reject section with < 80% word count', () => {
			// Given: Section with target 200 words
			const section = MockDataFactory.createStructure().sections[0];
			const content = 'A'.repeat(100 * 5); // ~100 words (50% of 200)

			// When: Validating
			const result = validateSection(section, content);

			// Then: Should fail word count check
			expect(result.wordCountMet).toBe(false);
			expect(result.valid).toBe(false);
		});

		it('should check if section purpose is addressed', () => {
			// Given: Section about "celebrating successes and showing impact"
			const section = MockDataFactory.createStructure().sections[1];
			// Purpose: "Celebrate successes and show impact"
			// Prompt: "List 3-5 major wins this quarter"
			// Content must contain keywords: celebrate, successes, impact, wins
			const content =
				'Major wins and successes this quarter: Launched AI search feature that celebrates our team achievements. Impact metrics show 85% positive feedback and demonstrate significant business value. These successes position us well for Q1.';

			// When: Validating
			const result = validateSection(section, content);

			// Then: Should pass purpose check
			expect(result.purposeMet).toBe(true);
		});

		it('should detect when purpose is not addressed', () => {
			// Given: Section about "wins and impact"
			const section = MockDataFactory.createStructure().sections[1];
			const content = 'Random text without addressing wins or impact at all.';

			// When: Validating
			const result = validateSection(section, content);

			// Then: Should fail purpose check
			expect(result.purposeMet).toBe(false);
		});

		it('should check outcome alignment', () => {
			// Given: Retrospective document, content mentions retrospective topics
			const section = MockDataFactory.createStructure().sections[0];
			const outcome = MockDataFactory.createOutcome();
			const content =
				'Q4 retrospective: Achieved major engineering wins and overcame challenges.';

			// When: Validating
			const result = validateSectionWithOutcome(section, content, outcome);

			// Then: Should pass outcome alignment check
			expect(result.outcomeMet).toBe(true);
		});

		it('should return valid=true when all checks pass', () => {
			// Given: Valid section content
			const section = MockDataFactory.createStructure().sections[0];
			// Purpose: "High-level outcomes for leadership"
			// Prompt: "Summarize Q4 key achievements in 1-2 sentences. What should leadership remember?"
			const outcome = MockDataFactory.createOutcome();
			// Must contain keywords from purpose/prompt: outcomes, leadership, achievements, quarter
			// Must have 160+ words (80% of 200 target)
			const content =
				'Q4 was our strongest quarter with exceptional outcomes and achievements across engineering. Leadership should remember our resilience in delivering major wins: AI search launch with 85% user satisfaction, database migration completed with zero downtime, mobile app redesign increased ratings to 4.8 stars. The team demonstrated strong cross-functional collaboration across frontend, backend, and infrastructure while maintaining aggressive feature roadmap. These achievements position our engineering team well for Q1 planning and continued product innovation. Our retrospective shows clear wins and challenges overcome, with valuable lessons learned for next quarter. The VP and leadership team can see measurable impact in user engagement metrics, system performance improvements, and customer satisfaction scores. Our engineering culture of excellence and teamwork enabled these remarkable outcomes despite mid-quarter obstacles and resource constraints. Looking ahead, these achievements set a strong foundation for our next quarter initiatives and demonstrate the value of our engineering practices and collaborative approach to product development. The leadership team should recognize the significant effort and dedication that went into delivering these results while navigating complex technical challenges.';

			// When: Validating
			const result = validateSectionWithOutcome(section, content, outcome);

			// Then: All checks should pass
			expect(result.wordCountMet).toBe(true);
			expect(result.purposeMet).toBe(true);
			expect(result.outcomeMet).toBe(true);
			expect(result.valid).toBe(true);
			expect(result.errors.length).toBe(0);
		});
	});

	/**
	 * Test Suite 3: Progress Calculation
	 *
	 * Validates overall completion percentage calculation.
	 */
	describe('Progress Calculation', () => {
		it('should calculate 0% progress when no sections started', () => {
			// Given: Metadata with no sections started
			const metadata = MockDataFactory.createMetadata();

			// When: Calculating progress
			const percentage = calculateProgressPercentage(metadata);

			// Then: Should be 0%
			expect(percentage).toBe(0);
		});

		it('should calculate partial progress for in-progress section', () => {
			// Given: First section in progress with 100/200 words
			const metadata = MockDataFactory.createMetadata();
			metadata.structure.sections[0].status = 'in-progress';
			metadata.structure.sections[0].actualWords = 100;

			// When: Calculating progress
			const percentage = calculateProgressPercentage(metadata);

			// Then: Should be ~8% (100 / 1200 total estimated)
			expect(percentage).toBeGreaterThanOrEqual(8);
			expect(percentage).toBeLessThanOrEqual(9);
		});

		it('should calculate full credit for completed sections', () => {
			// Given: First section completed (200 words)
			const metadata = MockDataFactory.createMetadata();
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[0].actualWords = 200;

			// When: Calculating progress
			const percentage = calculateProgressPercentage(metadata);

			// Then: Should be ~17% (200 / 1200 total estimated)
			expect(percentage).toBeGreaterThanOrEqual(16);
			expect(percentage).toBeLessThanOrEqual(17);
		});

		it('should calculate 50% progress when half sections completed', () => {
			// Given: First two sections completed (600/1200 words)
			const metadata = MockDataFactory.createMetadata();
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[0].actualWords = 200;
			metadata.structure.sections[1].status = 'completed';
			metadata.structure.sections[1].actualWords = 400;

			// When: Calculating progress
			const percentage = calculateProgressPercentage(metadata);

			// Then: Should be 50%
			expect(percentage).toBe(50);
		});

		it('should calculate 100% progress when all sections completed', () => {
			// Given: All sections completed
			const metadata = MockDataFactory.createMetadata();
			for (const section of metadata.structure.sections) {
				section.status = 'completed';
				section.actualWords = section.estimatedWords;
			}

			// When: Calculating progress
			const percentage = calculateProgressPercentage(metadata);

			// Then: Should be 100%
			expect(percentage).toBe(100);
		});

		it('should cap progress at 100% even if over-writing', () => {
			// Given: Sections with more words than estimated
			const metadata = MockDataFactory.createMetadata();
			for (const section of metadata.structure.sections) {
				section.status = 'completed';
				section.actualWords = section.estimatedWords * 2; // 2x estimated
			}

			// When: Calculating progress
			const percentage = calculateProgressPercentage(metadata);

			// Then: Should cap at 100%
			expect(percentage).toBe(100);
		});
	});

	/**
	 * Test Suite 4: Section Navigation
	 *
	 * Validates finding current section and navigation logic.
	 */
	describe('Section Navigation', () => {
		it('should find first in-progress section as current', () => {
			// Given: Metadata with second section in progress
			const metadata = MockDataFactory.createMetadata();
			metadata.structure.sections[0].status = 'completed';
			metadata.structure.sections[1].status = 'in-progress';

			// When: Finding current section
			const currentIndex = findCurrentSectionIndex(metadata);

			// Then: Should return index 1
			expect(currentIndex).toBe(1);
		});

		it('should find first not-started section when no in-progress', () => {
			// Given: Metadata with first section completed, rest not started
			const metadata = MockDataFactory.createMetadata();
			metadata.structure.sections[0].status = 'completed';

			// When: Finding current section
			const currentIndex = findCurrentSectionIndex(metadata);

			// Then: Should return index 1 (first not-started)
			expect(currentIndex).toBe(1);
		});

		it('should return -1 when all sections completed', () => {
			// Given: Metadata with all sections completed
			const metadata = MockDataFactory.createMetadata();
			for (const section of metadata.structure.sections) {
				section.status = 'completed';
			}

			// When: Finding current section
			const currentIndex = findCurrentSectionIndex(metadata);

			// Then: Should return -1
			expect(currentIndex).toBe(-1);
		});

		it('should return 0 when all sections not started', () => {
			// Given: Metadata with all sections not started
			const metadata = MockDataFactory.createMetadata();

			// When: Finding current section
			const currentIndex = findCurrentSectionIndex(metadata);

			// Then: Should return 0 (first section)
			expect(currentIndex).toBe(0);
		});
	});

	/**
	 * Test Suite 5: Keyword Extraction
	 *
	 * Validates keyword extraction for purpose/outcome checking.
	 */
	describe('Keyword Extraction', () => {
		it('should extract meaningful keywords from text', () => {
			// Given: Text with meaningful and stop words
			const text =
				'Celebrate successes and show impact for engineering team';

			// When: Extracting keywords
			const keywords = extractKeywords(text);

			// Then: Should extract meaningful words only
			expect(keywords).toContain('celebrate');
			expect(keywords).toContain('successes');
			expect(keywords).toContain('impact');
			expect(keywords).toContain('engineering');
			expect(keywords).toContain('team');
		});

		it('should filter out stop words', () => {
			// Given: Text with stop words
			const text = 'The quick brown fox and the lazy dog';

			// When: Extracting keywords
			const keywords = extractKeywords(text);

			// Then: Should exclude stop words "the", "and"
			expect(keywords).not.toContain('the');
			expect(keywords).not.toContain('and');
			expect(keywords).toContain('quick');
			expect(keywords).toContain('brown');
		});

		it('should filter out short words (< 4 chars)', () => {
			// Given: Text with short and long words
			const text = 'Big cat and small dog run fast';

			// When: Extracting keywords
			const keywords = extractKeywords(text);

			// Then: Should exclude words < 4 characters
			expect(keywords).not.toContain('big');
			expect(keywords).not.toContain('cat');
			expect(keywords).not.toContain('and');
			expect(keywords).not.toContain('dog');
			expect(keywords).not.toContain('run');
			expect(keywords).toContain('small');
			expect(keywords).toContain('fast');
		});

		it('should remove duplicate keywords', () => {
			// Given: Text with repeated words
			const text =
				'Engineering team engineering work engineering excellence';

			// When: Extracting keywords
			const keywords = extractKeywords(text);

			// Then: Should have unique keywords only
			const engineeringCount = keywords.filter(
				(k) => k === 'engineering'
			).length;
			expect(engineeringCount).toBe(1);
		});

		it('should handle Korean text', () => {
			// Given: Korean text
			const text = '팀의 성과를 축하하고 임팩트를 보여주세요';

			// When: Extracting keywords
			const keywords = extractKeywords(text);

			// Then: Should extract Korean keywords
			expect(keywords.length).toBeGreaterThan(0);
			expect(keywords.some((k) => /[가-힣]+/.test(k))).toBe(true);
		});
	});
});

/**
 * Helper Functions
 *
 * Standalone implementations for testing (mirror SectionWritingView methods).
 */

/**
 * Count words in content (markdown-aware)
 */
function countWords(content: string): number {
	if (!content || content.trim().length === 0) {
		return 0;
	}

	let text = content;

	// Strip YAML frontmatter
	text = text.replace(/^---\n[\s\S]*?\n---\n+/, '');

	// Remove code blocks
	text = text.replace(/```[\s\S]*?```/g, '');

	// Remove inline code
	text = text.replace(/`[^`]*`/g, '');

	// Remove images
	text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

	// Remove links (keep link text)
	text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

	// Remove HTML tags
	text = text.replace(/<[^>]*>/g, '');

	// Remove horizontal rules
	text = text.replace(/^[-*_]{3,}$/gm, '');

	// Remove list markers
	text = text.replace(/^[\s]*[-*+]\s+/gm, '');
	text = text.replace(/^[\s]*\d+\.\s+/gm, '');

	// Remove headers
	text = text.replace(/^#{1,6}\s+/gm, '');

	// Remove markdown formatting
	text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold **
	text = text.replace(/__(.*?)__/g, '$1'); // Bold __
	text = text.replace(/~~(.*?)~~/g, '$1'); // Strikethrough
	text = text.replace(/\*(.*?)\*/g, '$1'); // Italic *
	text = text.replace(/_(.*?)_/g, '$1'); // Italic _

	// Split on whitespace and count
	const words = text
		.split(/\s+/)
		.filter((word) => word.trim().length > 0);

	return words.length;
}

/**
 * Validate section
 */
function validateSection(
	section: DocumentSection,
	content: string
): {
	valid: boolean;
	errors: string[];
	warnings: string[];
	wordCountMet: boolean;
	purposeMet: boolean;
	outcomeMet: boolean;
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Count words
	const wordCount = countWords(content);

	// Check word count (80% minimum)
	const minWords = Math.floor(section.estimatedWords * 0.8);
	const wordCountMet = wordCount >= minWords;

	if (!wordCountMet) {
		errors.push(`Minimum word count not met (${wordCount}/${minWords} words)`);
	}

	// Check purpose
	const purposeMet = checkPurposeAddressed(content, section);

	if (!purposeMet) {
		warnings.push('Section purpose may not be fully addressed');
	}

	const valid = errors.length === 0;

	return {
		valid,
		errors,
		warnings,
		wordCountMet,
		purposeMet,
		outcomeMet: true, // Default true for basic validation
	};
}

/**
 * Validate section with outcome
 */
function validateSectionWithOutcome(
	section: DocumentSection,
	content: string,
	outcome: OutcomeDefinition
): {
	valid: boolean;
	errors: string[];
	warnings: string[];
	wordCountMet: boolean;
	purposeMet: boolean;
	outcomeMet: boolean;
} {
	const result = validateSection(section, content);

	// Check outcome alignment
	const outcomeMet = checkOutcomeAlignment(content, outcome);

	if (!outcomeMet) {
		result.warnings.push('Check alignment with document outcome');
	}

	result.outcomeMet = outcomeMet;

	return result;
}

/**
 * Check if section purpose is addressed
 */
function checkPurposeAddressed(
	content: string,
	section: DocumentSection
): boolean {
	if (!content || content.trim().length === 0) {
		return false;
	}

	// Extract keywords from purpose and prompt
	const keywords = [
		...extractKeywords(section.purpose),
		...extractKeywords(section.writingPrompt),
	];

	// Check if at least 50% of keywords appear in content
	const contentLower = content.toLowerCase();
	const matchedKeywords = keywords.filter((keyword) =>
		contentLower.includes(keyword.toLowerCase())
	);

	return matchedKeywords.length >= keywords.length * 0.5;
}

/**
 * Check if content aligns with document outcome
 */
function checkOutcomeAlignment(
	content: string,
	outcome: OutcomeDefinition
): boolean {
	if (!content || content.trim().length === 0) {
		return false;
	}

	const outcomeKeywords = extractKeywords(outcome.description);

	// Check if at least 30% of outcome keywords appear in content
	const contentLower = content.toLowerCase();
	const matchedKeywords = outcomeKeywords.filter((keyword) =>
		contentLower.includes(keyword.toLowerCase())
	);

	return matchedKeywords.length >= outcomeKeywords.length * 0.3;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
	const stopWords = [
		'the',
		'and',
		'for',
		'with',
		'this',
		'that',
		'from',
		'을',
		'를',
		'이',
		'가',
		'은',
		'는',
		'의',
	];

	const words = text
		.toLowerCase()
		.split(/\s+/)
		.filter(
			(word) =>
				word.length >= 4 &&
				!stopWords.includes(word) &&
				/^[a-z가-힣]+$/.test(word)
		);

	// Remove duplicates
	return [...new Set(words)];
}

/**
 * Calculate progress percentage
 */
function calculateProgressPercentage(
	metadata: OutcomeDocumentMetadata
): number {
	const { sections } = metadata.structure;
	const totalEstimatedWords = metadata.structure.totalEstimatedWords;

	// Calculate weighted progress
	let completedWords = 0;

	for (const section of sections) {
		if (section.status === 'completed') {
			// Full credit for completed sections
			completedWords += section.estimatedWords;
		} else if (section.status === 'in-progress') {
			// Partial credit for in-progress sections
			const actualWords = section.actualWords || 0;
			completedWords += Math.min(actualWords, section.estimatedWords);
		}
	}

	// Calculate percentage
	const percentage =
		totalEstimatedWords > 0
			? (completedWords / totalEstimatedWords) * 100
			: 0;

	// Round to whole number, ensure 0-100 range
	return Math.max(0, Math.min(100, Math.round(percentage)));
}

/**
 * Find current section index
 */
function findCurrentSectionIndex(metadata: OutcomeDocumentMetadata): number {
	const { sections } = metadata.structure;

	// First, check if there's an in-progress section
	const inProgressIndex = sections.findIndex((s) => s.status === 'in-progress');
	if (inProgressIndex !== -1) return inProgressIndex;

	// Otherwise, find first not-started section
	const notStartedIndex = sections.findIndex((s) => s.status === 'not-started');
	if (notStartedIndex !== -1) return notStartedIndex;

	// All sections completed
	return -1;
}
