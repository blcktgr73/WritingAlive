/**
 * Outcome Service Type Definitions
 *
 * Defines all interfaces and types for the outcome-driven writing mode.
 * This service layer enables top-down goal-oriented writing while maintaining
 * Saligo principles (small steps, low energy barriers, truthful iteration).
 *
 * Architecture:
 * - OutcomeDefinition: User's writing goal and context
 * - DocumentStructure: AI-generated section-based structure
 * - DocumentSection: Individual writing unit with prompts and estimates
 * - SectionProgress: Real-time tracking of writing progress
 * - OutcomeDocumentMetadata: Extended document metadata for outcome mode
 *
 * Design Principles:
 * - Data Transfer Objects: Clean separation from business logic
 * - Immutability: Interfaces define structure, not behavior
 * - Extensibility: Optional fields support future enhancements
 * - Validation: Type safety with runtime validation in OutcomeManager
 *
 * @see OutcomeManager for business logic and validation
 */

/**
 * Outcome Definition
 *
 * User's writing goal and context. Serves as input for AI structure generation.
 *
 * Validation Rules (enforced by OutcomeManager):
 * - description: 50-500 characters, required
 * - No vague keywords: "something", "stuff", "things"
 * - documentType: Auto-detected or user-specified
 *
 * Example:
 * ```typescript
 * {
 *   description: "Q4 Product Retrospective for team and VP",
 *   audience: "Engineering team and leadership",
 *   topics: ["wins", "challenges", "lessons", "actions"],
 *   lengthPreference: "medium",
 *   documentType: "retrospective",
 *   estimatedTime: 35
 * }
 * ```
 */
export interface OutcomeDefinition {
	/**
	 * Clear description of writing goal
	 * @constraints 50-500 characters, no vague keywords
	 * @required
	 */
	description: string;

	/**
	 * Intended audience for the document
	 * @example "Engineering team and leadership"
	 * @optional
	 */
	audience?: string;

	/**
	 * Key topics to cover
	 * @example ["wins", "challenges", "lessons", "actions"]
	 * @optional
	 */
	topics?: string[];

	/**
	 * Preferred document length
	 * - short: 500-1000 words (10-20 min)
	 * - medium: 1000-2000 words (30-45 min)
	 * - long: 2000+ words (60+ min)
	 * @optional
	 */
	lengthPreference?: 'short' | 'medium' | 'long';

	/**
	 * Document type (auto-detected or user-specified)
	 * @example "retrospective", "proposal", "specification", "report"
	 * @optional
	 */
	documentType?: string;

	/**
	 * Estimated total writing time in minutes
	 * @calculated Sum of section estimates
	 * @optional
	 */
	estimatedTime?: number;
}

/**
 * Document Structure
 *
 * AI-generated section-based structure for outcome-driven writing.
 * Created from OutcomeDefinition by StructureGenerator service.
 *
 * Structure Constraints:
 * - 2-6 sections (realistic for single session)
 * - Total estimated time: 10-90 minutes
 * - Each section has clear purpose and low-energy prompt
 *
 * Example:
 * ```typescript
 * {
 *   title: "Q4 Product Retrospective",
 *   sections: [
 *     {
 *       id: "section-1",
 *       title: "Executive Summary",
 *       purpose: "High-level outcomes for leadership",
 *       estimatedWords: 200,
 *       estimatedMinutes: 5,
 *       writingPrompt: "Summarize key achievement in 1-2 sentences...",
 *       order: 1,
 *       required: true,
 *       status: "not-started"
 *     }
 *     // ... more sections
 *   ],
 *   totalEstimatedWords: 1200,
 *   totalEstimatedMinutes: 35,
 *   generatedAt: "2025-11-08T14:30:00Z",
 *   generationCost: 0.008
 * }
 * ```
 */
export interface DocumentStructure {
	/**
	 * Document title (derived from outcome)
	 * @example "Q4 Product Retrospective"
	 */
	title: string;

	/**
	 * Sections in writing order
	 * @constraints 2-6 sections
	 */
	sections: DocumentSection[];

	/**
	 * Total estimated word count
	 * @calculated Sum of section estimates
	 */
	totalEstimatedWords: number;

	/**
	 * Total estimated time in minutes
	 * @calculated Sum of section time estimates
	 */
	totalEstimatedMinutes: number;

	/**
	 * ISO timestamp when structure was generated
	 */
	generatedAt: string;

	/**
	 * AI API cost for structure generation (USD)
	 * @target $0.005-0.010 per structure
	 */
	generationCost: number;
}

/**
 * Document Section
 *
 * Individual writing unit with clear purpose and guidance.
 * Maintains Saligo principles: small steps, low energy barriers.
 *
 * Section Design:
 * - Clear title and purpose (user knows what to write)
 * - Low-energy writing prompt (not "write 500 words about...")
 * - Realistic estimates (5-20 minutes per section)
 * - Progress tracking (not-started → in-progress → completed)
 *
 * Example:
 * ```typescript
 * {
 *   id: "section-2",
 *   title: "What Went Well",
 *   purpose: "Celebrate successes and show impact",
 *   estimatedWords: 400,
 *   estimatedMinutes: 10,
 *   writingPrompt: "List 3-5 major wins. For each, describe impact in 2-3 sentences.",
 *   order: 2,
 *   required: true,
 *   status: "in-progress",
 *   content: "1. Launched new API...",
 *   actualWords: 150,
 *   actualMinutes: 5,
 *   startedAt: "2025-11-08T14:35:00Z"
 * }
 * ```
 */
export interface DocumentSection {
	/**
	 * Unique section identifier
	 * @format "section-{index}" or UUID
	 */
	id: string;

	/**
	 * Section title
	 * @example "What Went Well"
	 */
	title: string;

	/**
	 * Clear purpose of this section
	 * @example "Celebrate successes and show impact"
	 */
	purpose: string;

	/**
	 * Estimated word count for this section
	 * @range 100-1000 words
	 */
	estimatedWords: number;

	/**
	 * Estimated time in minutes
	 * @range 3-20 minutes
	 */
	estimatedMinutes: number;

	/**
	 * Low-energy writing prompt
	 * @example "List 3-5 major wins. For each, describe impact in 2-3 sentences."
	 */
	writingPrompt: string;

	/**
	 * Section order (1-indexed)
	 */
	order: number;

	/**
	 * Whether section is required for outcome completion
	 */
	required: boolean;

	/**
	 * Section writing status
	 */
	status: 'not-started' | 'in-progress' | 'completed';

	/**
	 * Section content (Markdown)
	 * @optional Present only when started/completed
	 */
	content?: string;

	/**
	 * Actual word count written
	 * @optional Present only when content exists
	 */
	actualWords?: number;

	/**
	 * Actual time spent in minutes
	 * @optional Present only when section started
	 */
	actualMinutes?: number;

	/**
	 * ISO timestamp when section writing started
	 * @optional Present only when status is in-progress or completed
	 */
	startedAt?: string;

	/**
	 * ISO timestamp when section completed
	 * @optional Present only when status is completed
	 */
	completedAt?: string;
}

/**
 * Section Progress
 *
 * Real-time progress tracking for outcome-driven writing session.
 * Enables resume after interruption and motivates completion.
 *
 * Progress Metrics:
 * - Section completion (N/M sections done)
 * - Word count progress (actual vs estimated)
 * - Time tracking (session duration)
 * - Completion percentage (weighted by section estimates)
 *
 * Example:
 * ```typescript
 * {
 *   currentSectionId: "section-2",
 *   totalSections: 4,
 *   completedSections: 1,
 *   wordsWritten: 350,
 *   timeSpent: 15,
 *   completionPercentage: 35,
 *   sessionStartedAt: "2025-11-08T14:30:00Z",
 *   lastSavedAt: "2025-11-08T14:45:00Z"
 * }
 * ```
 */
export interface SectionProgress {
	/**
	 * Currently active section ID
	 * @nullable Null if session not started or completed
	 */
	currentSectionId: string | null;

	/**
	 * Total number of sections
	 */
	totalSections: number;

	/**
	 * Number of completed sections
	 */
	completedSections: number;

	/**
	 * Total words written across all sections
	 */
	wordsWritten: number;

	/**
	 * Total time spent in minutes
	 * @calculated Sum of section actualMinutes
	 */
	timeSpent: number;

	/**
	 * Overall completion percentage (0-100)
	 * @calculated Weighted by section word estimates
	 */
	completionPercentage: number;

	/**
	 * ISO timestamp when writing session started
	 */
	sessionStartedAt: string;

	/**
	 * ISO timestamp of last auto-save
	 */
	lastSavedAt: string;
}

/**
 * Outcome Document Metadata
 *
 * Extended metadata for outcome-driven documents.
 * Stored in YAML frontmatter under 'outcome' key.
 *
 * Frontmatter Structure:
 * ```yaml
 * ---
 * title: "Q4 Product Retrospective"
 * mode: outcome-driven
 * outcome:
 *   description: "Q4 Product Retrospective for team and VP"
 *   documentType: "retrospective"
 *   audience: "Engineering team and leadership"
 *   topics: ["wins", "challenges", "lessons", "actions"]
 *   structure:
 *     totalEstimatedWords: 1200
 *     totalEstimatedMinutes: 35
 *     sectionsCompleted: 2
 *     sectionsTotal: 4
 *   progress:
 *     wordsWritten: 550
 *     timeSpent: 20
 *     completionPercentage: 50
 *     lastSavedAt: "2025-11-08T14:45:00Z"
 *   createdAt: "2025-11-08T14:30:00Z"
 *   completedAt: null
 * ---
 * ```
 */
export interface OutcomeDocumentMetadata {
	/**
	 * Writing mode identifier
	 */
	mode: 'outcome-driven';

	/**
	 * Original outcome definition
	 */
	outcome: OutcomeDefinition;

	/**
	 * Document structure
	 */
	structure: DocumentStructure;

	/**
	 * Current progress
	 */
	progress: SectionProgress;

	/**
	 * ISO timestamp when document created
	 */
	createdAt: string;

	/**
	 * ISO timestamp when all sections completed
	 * @nullable Null if incomplete
	 */
	completedAt: string | null;

	/**
	 * Total AI API cost for this document (USD)
	 * @includes Structure generation + any AI assistance
	 */
	totalCost: number;
}

/**
 * Outcome Validation Result
 *
 * Result of validating an OutcomeDefinition.
 * Used by OutcomeManager.validateOutcome() method.
 *
 * Validation Checks:
 * - Length: 50-500 characters
 * - Vagueness: No generic keywords
 * - Specificity: Contains clear topic/document type
 *
 * Example (Valid):
 * ```typescript
 * {
 *   valid: true,
 *   errors: [],
 *   warnings: [],
 *   suggestions: []
 * }
 * ```
 *
 * Example (Invalid):
 * ```typescript
 * {
 *   valid: false,
 *   errors: [
 *     "Outcome description too short (30 chars). Minimum: 50 chars."
 *   ],
 *   warnings: [
 *     "Outcome seems vague. Consider specifying document type."
 *   ],
 *   suggestions: [
 *     "Try: 'Q4 retrospective for team covering wins and challenges'",
 *     "Try: 'API tutorial for beginners using REST endpoints'"
 *   ]
 * }
 * ```
 */
export interface OutcomeValidationResult {
	/**
	 * Whether outcome is valid (passes all required checks)
	 */
	valid: boolean;

	/**
	 * Validation errors (blockers)
	 * @example ["Outcome description too short (30 chars). Minimum: 50 chars."]
	 */
	errors: string[];

	/**
	 * Validation warnings (soft issues)
	 * @example ["Outcome seems vague. Consider specifying document type."]
	 */
	warnings: string[];

	/**
	 * Improvement suggestions
	 * @example ["Try: 'Q4 retrospective for team covering wins and challenges'"]
	 */
	suggestions: string[];
}

/**
 * Document Type Detection Result
 *
 * Result of auto-detecting document type from outcome description.
 * Used by OutcomeManager.detectDocumentType() method.
 *
 * Detection Strategy:
 * - Keyword matching (retrospective, proposal, specification, etc.)
 * - Confidence scoring based on keyword presence
 * - Fallback to 'unknown' if no clear match
 *
 * Example (High Confidence):
 * ```typescript
 * {
 *   documentType: "retrospective",
 *   confidence: 0.95,
 *   keywords: ["retrospective", "Q4", "wins", "challenges"]
 * }
 * ```
 *
 * Example (Low Confidence):
 * ```typescript
 * {
 *   documentType: "unknown",
 *   confidence: 0.0,
 *   keywords: []
 * }
 * ```
 */
export interface DocumentTypeDetectionResult {
	/**
	 * Detected document type
	 * @example "retrospective", "proposal", "specification", "report", "unknown"
	 */
	documentType: string;

	/**
	 * Detection confidence (0-1)
	 * - 0.8+: High confidence
	 * - 0.5-0.8: Medium confidence
	 * - <0.5: Low confidence
	 */
	confidence: number;

	/**
	 * Keywords that triggered detection
	 * @example ["retrospective", "Q4", "wins"]
	 */
	keywords: string[];
}

/**
 * Outcome Service Error
 *
 * Custom error class for outcome service operations.
 * Follows same pattern as StorageError from storage service.
 */
export class OutcomeError extends Error {
	constructor(
		message: string,
		public readonly code: OutcomeErrorCode,
		public readonly context?: Record<string, unknown>,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'OutcomeError';

		console.error('[OutcomeService]', message, {
			code,
			context,
			cause: cause instanceof Error ? cause.message : String(cause),
		});
	}
}

/**
 * Outcome Error Codes
 *
 * Error codes for outcome service operations.
 */
export type OutcomeErrorCode =
	| 'VALIDATION_FAILED' // Outcome validation failed
	| 'INVALID_LENGTH' // Description too short or too long
	| 'VAGUE_OUTCOME' // Outcome too vague/generic
	| 'INVALID_STRUCTURE' // Document structure invalid
	| 'SECTION_NOT_FOUND' // Section ID not found
	| 'METADATA_PARSE_ERROR' // Failed to parse outcome metadata
	| 'METADATA_WRITE_ERROR' // Failed to write outcome metadata
	| 'UNKNOWN_ERROR'; // Unexpected error
