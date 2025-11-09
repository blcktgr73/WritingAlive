/**
 * Outcome Manager Service
 *
 * Manages outcome-driven writing operations including validation,
 * document type detection, and document creation.
 *
 * Architecture:
 * - Single Responsibility: Only handles outcome operations
 * - Dependency Injection: Receives Vault and MetadataManager via constructor
 * - Error Handling: Clear error messages with OutcomeError
 * - Validation: Comprehensive checks for outcome quality
 *
 * Core Operations:
 * 1. validateOutcome() - Validate outcome definition quality
 * 2. detectDocumentType() - Auto-detect document type from description
 * 3. createOutcomeDocument() - Create new outcome-driven document
 * 4. getOutcome() - Read outcome metadata from document
 * 5. updateProgress() - Update writing progress in document
 *
 * Design Principles (SOLID):
 * - Single Responsibility: Outcome validation and persistence only
 * - Open/Closed: Extensible through DocumentTypeDetector strategy
 * - Liskov Substitution: Follows same interface pattern as MetadataManager
 * - Interface Segregation: Small, focused public API
 * - Dependency Inversion: Depends on Vault and MetadataManager abstractions
 *
 * @see OutcomeDefinition for outcome structure
 * @see MetadataManager for metadata persistence
 */

import type { TFile, Vault } from 'obsidian';
import { parseYaml, stringifyYaml } from 'obsidian';
import type {
	OutcomeDefinition,
	OutcomeValidationResult,
	DocumentTypeDetectionResult,
	OutcomeDocumentMetadata,
	DocumentStructure,
	SectionProgress,
} from './types';
import { OutcomeError } from './types';

/**
 * Options for creating outcome-driven document
 */
export interface CreateOutcomeDocumentOptions {
	/**
	 * Folder path to create document in
	 * @default vault root
	 */
	folder?: string;

	/**
	 * Open document after creation
	 * @default true
	 */
	openAfterCreate?: boolean;

	/**
	 * Custom filename (without .md extension)
	 * @default Generated from outcome description
	 */
	filename?: string;
}

/**
 * Outcome Manager
 *
 * Service for managing outcome-driven writing operations.
 */
export class OutcomeManager {
	/**
	 * Obsidian vault instance
	 */
	private readonly vault: Vault;

	/**
	 * Vague keywords that indicate unclear outcomes
	 * Used in validation to detect low-quality outcome definitions
	 */
	private readonly VAGUE_KEYWORDS = [
		'something',
		'stuff',
		'things',
		'anything',
		'everything',
		'some',
		'maybe',
		'kind of',
		'sort of',
	];

	/**
	 * Document type keyword mappings
	 * Maps document types to their identifying keywords
	 *
	 * Strategy: Keyword-based detection with confidence scoring
	 * - Multiple keyword matches = higher confidence
	 * - Specific keywords (e.g., "retrospective") = high weight
	 * - Generic keywords (e.g., "document") = low weight
	 */
	private readonly DOCUMENT_TYPE_KEYWORDS: Record<string, string[]> = {
		retrospective: [
			'retrospective',
			'retro',
			'postmortem',
			'post-mortem',
			'lessons learned',
			'what went well',
			'what went wrong',
		],
		proposal: [
			'proposal',
			'pitch',
			'recommendation',
			'suggest',
			'propose',
		],
		specification: [
			'specification',
			'spec',
			'technical spec',
			'api spec',
			'requirements',
		],
		report: [
			'report',
			'status report',
			'progress report',
			'summary report',
		],
		documentation: [
			'documentation',
			'docs',
			'guide',
			'tutorial',
			'how-to',
			'reference',
		],
		'meeting-summary': [
			'meeting',
			'summary',
			'notes',
			'minutes',
			'action items',
		],
		essay: ['essay', 'reflection', 'analysis', 'commentary'],
		'literature-review': [
			'literature review',
			'survey',
			'related work',
			'background',
		],
		plan: ['plan', 'roadmap', 'strategy', 'timeline', 'milestones'],
	};

	/**
	 * Constructor
	 *
	 * @param vault - Obsidian vault instance
	 */
	constructor(vault: Vault) {
		this.vault = vault;
	}

	/**
	 * Validate outcome definition
	 *
	 * Validates outcome quality with comprehensive checks:
	 * 1. Length: 50-500 characters (prevents too vague or too detailed)
	 * 2. Vagueness: No generic keywords like "something", "stuff"
	 * 3. Specificity: Should mention document type or clear topic
	 *
	 * Algorithm:
	 * - Check required fields (description)
	 * - Validate description length (50-500 chars)
	 * - Detect vague keywords (case-insensitive)
	 * - Assess specificity (document type or clear topic)
	 * - Generate helpful suggestions for improvement
	 *
	 * @param outcome - Outcome definition to validate
	 * @returns Validation result with errors, warnings, and suggestions
	 *
	 * @example
	 * const result = outcomeManager.validateOutcome({
	 *   description: "Write something about product"
	 * });
	 * // result.valid = false
	 * // result.errors = ["Outcome description too short..."]
	 * // result.warnings = ["Contains vague keyword: 'something'"]
	 */
	validateOutcome(outcome: OutcomeDefinition): OutcomeValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];
		const suggestions: string[] = [];

		// Required field check
		if (!outcome.description || outcome.description.trim().length === 0) {
			errors.push('Outcome description is required.');
			return { valid: false, errors, warnings, suggestions };
		}

		const description = outcome.description.trim();

		// Length validation (50-500 characters)
		const MIN_LENGTH = 50;
		const MAX_LENGTH = 500;

		if (description.length < MIN_LENGTH) {
			errors.push(
				`Outcome description too short (${description.length} chars). Minimum: ${MIN_LENGTH} chars.`
			);
			suggestions.push(
				"Try: 'Q4 retrospective for team covering wins and challenges'"
			);
			suggestions.push(
				"Try: 'API tutorial for beginners using REST endpoints'"
			);
		}

		if (description.length > MAX_LENGTH) {
			errors.push(
				`Outcome description too long (${description.length} chars). Maximum: ${MAX_LENGTH} chars.`
			);
			warnings.push(
				'Consider simplifying your outcome. Save details for section prompts.'
			);
		}

		// Vagueness detection
		const vagueKeywordsFound: string[] = [];
		for (const keyword of this.VAGUE_KEYWORDS) {
			// Word boundary matching to avoid false positives
			// e.g., "something" matches, but "something-specific" doesn't
			const regex = new RegExp(`\\b${keyword}\\b`, 'i');
			if (regex.test(description)) {
				vagueKeywordsFound.push(keyword);
			}
		}

		if (vagueKeywordsFound.length > 0) {
			warnings.push(
				`Contains vague keyword(s): ${vagueKeywordsFound.map((k) => `'${k}'`).join(', ')}`
			);
			warnings.push(
				'Try being more specific about what you want to write.'
			);
		}

		// Specificity check (document type or clear topic)
		const detection = this.detectDocumentType(description);

		if (detection.confidence < 0.5 && vagueKeywordsFound.length > 0) {
			warnings.push(
				'Outcome seems vague. Consider specifying document type or topic.'
			);
			suggestions.push(
				'Good outcomes mention: document type, audience, or key topics'
			);
		}

		// Check for at least some concrete content
		// Heuristic: At least 3 words, at least one word with 4+ characters
		const words = description.split(/\s+/);
		const substantiveWords = words.filter((w) => w.length >= 4);

		if (words.length < 3 || substantiveWords.length === 0) {
			warnings.push(
				'Outcome description seems too brief to be meaningful.'
			);
		}

		// Overall validation result
		const valid = errors.length === 0;

		return {
			valid,
			errors,
			warnings,
			suggestions,
		};
	}

	/**
	 * Detect document type from outcome description
	 *
	 * Auto-detects document type using keyword matching with confidence scoring.
	 *
	 * Algorithm:
	 * 1. Normalize description (lowercase, trim)
	 * 2. For each document type, count matching keywords
	 * 3. Calculate confidence based on matches:
	 *    - 2+ matches = high confidence (0.9)
	 *    - 1 match = medium confidence (0.7)
	 *    - 0 matches = try partial matches (0.5)
	 * 4. Return type with highest confidence
	 * 5. Fallback to 'unknown' if confidence < 0.5
	 *
	 * Confidence Levels:
	 * - 0.8+: High confidence (multiple keyword matches)
	 * - 0.5-0.8: Medium confidence (single keyword match)
	 * - <0.5: Low confidence (no clear type detected)
	 *
	 * @param description - Outcome description to analyze
	 * @returns Detection result with document type, confidence, and keywords
	 *
	 * @example
	 * const result = outcomeManager.detectDocumentType(
	 *   "Q4 retrospective for team covering wins and challenges"
	 * );
	 * // result.documentType = "retrospective"
	 * // result.confidence = 0.9
	 * // result.keywords = ["retrospective", "wins"]
	 */
	detectDocumentType(description: string): DocumentTypeDetectionResult {
		const descriptionLower = description.toLowerCase();

		// Track best match
		let bestMatch: DocumentTypeDetectionResult = {
			documentType: 'unknown',
			confidence: 0,
			keywords: [],
		};

		// Check each document type
		for (const [docType, keywords] of Object.entries(
			this.DOCUMENT_TYPE_KEYWORDS
		)) {
			const matchedKeywords: string[] = [];

			// Count keyword matches
			for (const keyword of keywords) {
				if (descriptionLower.includes(keyword.toLowerCase())) {
					matchedKeywords.push(keyword);
				}
			}

			// Calculate confidence based on matches
			let confidence = 0;
			if (matchedKeywords.length >= 2) {
				// Multiple matches = high confidence
				confidence = 0.9;
			} else if (matchedKeywords.length === 1) {
				// Single match = medium confidence
				confidence = 0.7;
			}

			// Update best match if this is better
			if (confidence > bestMatch.confidence) {
				bestMatch = {
					documentType: docType,
					confidence,
					keywords: matchedKeywords,
				};
			}
		}

		return bestMatch;
	}

	/**
	 * Create outcome-driven document
	 *
	 * Creates a new Markdown file with outcome metadata in frontmatter.
	 * Document is created with initial structure but no content yet.
	 *
	 * Algorithm:
	 * 1. Validate inputs (outcome, structure)
	 * 2. Generate filename from outcome description
	 * 3. Create frontmatter with outcome metadata
	 * 4. Create initial document body with section placeholders
	 * 5. Write file to vault
	 * 6. Optionally open in editor
	 *
	 * Document Structure:
	 * ```markdown
	 * ---
	 * title: "Q4 Product Retrospective"
	 * mode: outcome-driven
	 * outcome: { ... }
	 * structure: { ... }
	 * progress: { ... }
	 * createdAt: "2025-11-08T14:30:00Z"
	 * completedAt: null
	 * totalCost: 0.008
	 * ---
	 *
	 * # Q4 Product Retrospective
	 *
	 * ## Executive Summary
	 * *Purpose: High-level outcomes for leadership*
	 * *Estimated: 200 words, 5 minutes*
	 *
	 * [Section 1: Start writing here...]
	 *
	 * ## What Went Well
	 * ...
	 * ```
	 *
	 * @param outcome - Validated outcome definition
	 * @param structure - AI-generated document structure
	 * @param options - Creation options (folder, filename, etc.)
	 * @returns Created file
	 * @throws OutcomeError if creation fails
	 *
	 * @example
	 * const file = await outcomeManager.createOutcomeDocument(
	 *   outcome,
	 *   structure,
	 *   { folder: "Drafts", openAfterCreate: true }
	 * );
	 */
	async createOutcomeDocument(
		outcome: OutcomeDefinition,
		structure: DocumentStructure,
		options: CreateOutcomeDocumentOptions = {}
	): Promise<TFile> {
		try {
			// Validate inputs
			const validation = this.validateOutcome(outcome);
			if (!validation.valid) {
				throw new OutcomeError(
					'Invalid outcome definition',
					'VALIDATION_FAILED',
					{ errors: validation.errors }
				);
			}

			if (!structure.sections || structure.sections.length === 0) {
				throw new OutcomeError(
					'Document structure must have at least one section',
					'INVALID_STRUCTURE'
				);
			}

			// Generate filename
			const filename =
				options.filename || this.generateFilename(outcome.description);
			const folder = options.folder || '';
			const filePath = folder
				? `${folder}/${filename}.md`
				: `${filename}.md`;

			// Initialize progress
			const now = new Date().toISOString();
			const progress: SectionProgress = {
				currentSectionId: null,
				totalSections: structure.sections.length,
				completedSections: 0,
				wordsWritten: 0,
				timeSpent: 0,
				completionPercentage: 0,
				sessionStartedAt: now,
				lastSavedAt: now,
			};

			// Create outcome metadata
			const outcomeMetadata: OutcomeDocumentMetadata = {
				mode: 'outcome-driven',
				outcome,
				structure,
				progress,
				createdAt: now,
				completedAt: null,
				totalCost: structure.generationCost,
			};

			// Create frontmatter
			const frontmatter = {
				title: structure.title,
				...outcomeMetadata,
			};

			// Create document body
			const body = this.generateDocumentBody(structure);

			// Combine frontmatter and body
			const content = `---\n${stringifyYaml(frontmatter).trim()}\n---\n\n${body}`;

			// Create file
			const file = await this.vault.create(filePath, content);

			return file;
		} catch (error) {
			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				'Failed to create outcome document',
				'METADATA_WRITE_ERROR',
				{ outcome, structure },
				error
			);
		}
	}

	/**
	 * Get outcome metadata from document
	 *
	 * Reads outcome metadata from document frontmatter.
	 * Returns null if document is not outcome-driven.
	 *
	 * @param file - Document file to read
	 * @returns Outcome metadata or null if not outcome-driven
	 * @throws OutcomeError if metadata parsing fails
	 */
	async getOutcome(file: TFile): Promise<OutcomeDocumentMetadata | null> {
		try {
			// Read file content
			const content = await this.vault.read(file);

			// Extract frontmatter
			const frontmatter = this.extractFrontmatter(content);
			if (!frontmatter) {
				return null;
			}

			// Parse YAML
			const parsed = parseYaml(frontmatter);
			if (!parsed || typeof parsed !== 'object') {
				return null;
			}

			// Check if outcome-driven mode
			const data = parsed as Record<string, unknown>;
			if (data.mode !== 'outcome-driven') {
				return null;
			}

			// Extract outcome metadata
			// Type assertion safe because we validated mode above
			return data as unknown as OutcomeDocumentMetadata;
		} catch (error) {
			throw new OutcomeError(
				`Failed to read outcome metadata from file: ${file.path}`,
				'METADATA_PARSE_ERROR',
				{ filePath: file.path },
				error
			);
		}
	}

	/**
	 * Update writing progress in document
	 *
	 * Updates progress metadata in document frontmatter.
	 * Used for auto-save and progress tracking.
	 *
	 * @param file - Document file to update
	 * @param progress - Updated progress data
	 * @throws OutcomeError if update fails
	 */
	async updateProgress(
		file: TFile,
		progress: Partial<SectionProgress>
	): Promise<void> {
		try {
			// Read current metadata
			const currentMetadata = await this.getOutcome(file);
			if (!currentMetadata) {
				throw new OutcomeError(
					'Document is not outcome-driven',
					'METADATA_PARSE_ERROR',
					{ filePath: file.path }
				);
			}

			// Merge progress update
			const updatedMetadata: OutcomeDocumentMetadata = {
				...currentMetadata,
				progress: {
					...currentMetadata.progress,
					...progress,
					lastSavedAt: new Date().toISOString(),
				},
			};

			// Write back to file
			await this.updateOutcomeMetadata(file, updatedMetadata);
		} catch (error) {
			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				'Failed to update progress',
				'METADATA_WRITE_ERROR',
				{ filePath: file.path, progress },
				error
			);
		}
	}

	/**
	 * Generate filename from outcome description
	 *
	 * Creates a clean filename from outcome description.
	 * - Limits to 50 characters
	 * - Removes special characters
	 * - Replaces spaces with hyphens
	 * - Adds timestamp with milliseconds to ensure uniqueness
	 *
	 * @param description - Outcome description
	 * @returns Clean filename (without .md extension)
	 *
	 * @example
	 * generateFilename("Q4 Product Retrospective for Team")
	 * // Returns: "Q4-Product-Retrospective-for-Team-20251108-143000-123"
	 */
	private generateFilename(description: string): string {
		// Take first 50 chars, clean up
		let filename = description
			.substring(0, 50)
			.trim()
			.replace(/[^\w\s-]/g, '') // Remove special chars
			.replace(/\s+/g, '-') // Spaces to hyphens
			.replace(/-+/g, '-') // Multiple hyphens to single
			.replace(/^-|-$/g, ''); // Trim hyphens

		// Add timestamp with milliseconds for uniqueness
		const now = new Date();
		const timestamp = now
			.toISOString()
			.replace(/[-:]/g, '')
			.substring(0, 15); // YYYYMMDDTHHmmss
		const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

		return `${filename}-${timestamp}-${milliseconds}`;
	}

	/**
	 * Generate document body from structure
	 *
	 * Creates initial document body with section placeholders.
	 * Each section shows: title, purpose, estimate, and writing prompt.
	 *
	 * @param structure - Document structure
	 * @returns Markdown document body
	 */
	private generateDocumentBody(structure: DocumentStructure): string {
		const lines: string[] = [];

		// Document title
		lines.push(`# ${structure.title}`);
		lines.push('');

		// Overview
		lines.push(
			`*Generated: ${new Date(structure.generatedAt).toLocaleDateString()}*`
		);
		lines.push(
			`*Estimated: ${structure.totalEstimatedWords} words, ${structure.totalEstimatedMinutes} minutes*`
		);
		lines.push('');
		lines.push('---');
		lines.push('');

		// Sections
		for (const section of structure.sections) {
			lines.push(`## ${section.title}`);
			lines.push('');
			lines.push(`*Purpose: ${section.purpose}*`);
			lines.push(
				`*Estimated: ${section.estimatedWords} words, ${section.estimatedMinutes} minutes*`
			);
			lines.push('');
			lines.push(`**Writing Prompt:** ${section.writingPrompt}`);
			lines.push('');
			lines.push(`[Section ${section.order}: Start writing here...]`);
			lines.push('');
			lines.push('---');
			lines.push('');
		}

		return lines.join('\n');
	}

	/**
	 * Extract frontmatter from content
	 *
	 * Extracts YAML frontmatter from Markdown content.
	 * Frontmatter must start with --- on first line and end with ---
	 *
	 * @param content - File content
	 * @returns Frontmatter text (without ---) or null if no frontmatter
	 */
	private extractFrontmatter(content: string): string | null {
		// Frontmatter must start at beginning of file
		if (!content.startsWith('---\n')) {
			return null;
		}

		// Find end of frontmatter
		const endIndex = content.indexOf('\n---\n', 4);
		if (endIndex === -1) {
			return null;
		}

		// Extract frontmatter (without opening/closing ---)
		return content.substring(4, endIndex);
	}

	/**
	 * Update outcome metadata in document
	 *
	 * Writes updated outcome metadata back to document frontmatter.
	 *
	 * @param file - Document file
	 * @param metadata - Updated metadata
	 */
	private async updateOutcomeMetadata(
		file: TFile,
		metadata: OutcomeDocumentMetadata
	): Promise<void> {
		// Read current content
		const content = await this.vault.read(file);

		// Split frontmatter and body
		const { body } = this.splitContent(content);

		// Create new frontmatter
		const frontmatter = {
			title: metadata.structure.title,
			...metadata,
		};

		// Reconstruct content
		const newContent = `---\n${stringifyYaml(frontmatter).trim()}\n---\n\n${body}`;

		// Write back
		await this.vault.modify(file, newContent);
	}

	/**
	 * Split content into frontmatter and body
	 *
	 * @param content - File content
	 * @returns Frontmatter and body
	 */
	private splitContent(content: string): {
		frontmatter: string | null;
		body: string;
	} {
		const frontmatter = this.extractFrontmatter(content);

		if (!frontmatter) {
			return { frontmatter: null, body: content };
		}

		// Body is everything after closing ---
		const endIndex = content.indexOf('\n---\n', 4);
		const body = content.substring(endIndex + 5); // +5 to skip \n---\n

		return { frontmatter, body };
	}
}
