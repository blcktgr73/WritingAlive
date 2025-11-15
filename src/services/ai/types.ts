/**
 * AI Service Type Definitions
 *
 * Defines all interfaces and types for AI operations in WriteAlive.
 * Follows Interface Segregation Principle - each interface serves a specific purpose.
 *
 * Architecture:
 * - AIService: Main service interface for AI operations
 * - AIProvider: Abstract provider for multi-AI-backend support
 * - Domain models: Center, WholenessAnalysis, etc.
 */

import type { AIProvider as AIProviderType } from '../../settings/settings';

/**
 * Center - A structural pivot point in writing
 *
 * Represents a sentence or phrase that acts as a "center" around which
 * paragraphs or sections can grow, inspired by Christopher Alexander's
 * pattern language.
 */
export interface Center {
	/**
	 * Unique identifier for this center
	 * Format: `center-${timestamp}-${randomId}`
	 */
	id: string;

	/**
	 * The actual text content of the center
	 */
	text: string;

	/**
	 * Position in the document
	 */
	position: {
		/** Character offset from start of document */
		start: number;
		/** Character offset from start of document */
		end: number;
	};

	/**
	 * Paragraph number (0-indexed)
	 */
	paragraph: number;

	/**
	 * AI confidence score (0.0 - 1.0)
	 * Higher means more likely to be a strong center
	 */
	confidence: number;

	/**
	 * ISO timestamp of when this center was identified
	 */
	timestamp: string;

	/**
	 * How was this center discovered?
	 */
	source: 'ai-suggested' | 'user-identified';

	/**
	 * Has the user accepted this center suggestion?
	 */
	accepted: boolean;

	/**
	 * Optional AI explanation of why this is a center
	 */
	explanation?: string;
}

/**
 * Expansion Prompt - Suggestion for developing content around a center
 */
export interface ExpansionPrompt {
	/**
	 * Unique identifier
	 */
	id: string;

	/**
	 * Reference to the center this expands
	 */
	centerId: string;

	/**
	 * Type of expansion suggested
	 */
	type: 'before' | 'after' | 'elaborate' | 'contrast' | 'example';

	/**
	 * Human-readable prompt text
	 */
	prompt: string;

	/**
	 * Priority ranking (1-5, higher is more important)
	 */
	priority: number;

	/**
	 * Why this expansion would help (AI explanation)
	 */
	rationale?: string;
}

/**
 * Wholeness Analysis - Overall document quality assessment
 */
export interface WholenessAnalysis {
	/**
	 * Overall wholeness score (1-10)
	 * Based on paragraph unity, transitions, center hierarchy, gaps
	 */
	score: number;

	/**
	 * Unity score for each paragraph
	 */
	paragraphUnity: UnityScore[];

	/**
	 * Strength of transitions between paragraphs
	 */
	transitions: TransitionStrength[];

	/**
	 * Hierarchical structure of centers
	 */
	centerHierarchy: CenterNode[];

	/**
	 * Identified structural gaps
	 */
	gaps: Gap[];

	/**
	 * AI-generated suggestions for improvement
	 */
	suggestions: string[];

	/**
	 * Timestamp of analysis
	 */
	timestamp: string;
}

/**
 * Unity Score - Measures how well a paragraph focuses on one idea
 */
export interface UnityScore {
	/**
	 * Paragraph number (0-indexed)
	 */
	paragraphIndex: number;

	/**
	 * Unity score (0.0 - 1.0)
	 * 1.0 = perfect unity, 0.0 = scattered/unfocused
	 */
	score: number;

	/**
	 * Main topic/theme of paragraph (AI-identified)
	 */
	mainTopic?: string;

	/**
	 * Sentences that seem off-topic
	 */
	digressions?: string[];
}

/**
 * Transition Strength - How well paragraphs connect
 */
export interface TransitionStrength {
	/**
	 * From paragraph index
	 */
	from: number;

	/**
	 * To paragraph index
	 */
	to: number;

	/**
	 * Transition strength (0.0 - 1.0)
	 * 1.0 = smooth transition, 0.0 = jarring jump
	 */
	strength: number;

	/**
	 * Type of transition
	 */
	type?: 'continuation' | 'contrast' | 'elaboration' | 'example' | 'conclusion';

	/**
	 * Suggestion for improvement (if weak)
	 */
	suggestion?: string;
}

/**
 * Center Node - Node in center hierarchy tree
 */
export interface CenterNode {
	/**
	 * Reference to the Center
	 */
	center: Center;

	/**
	 * Hierarchical level (0 = root/main idea)
	 */
	level: number;

	/**
	 * Child centers that support this center
	 */
	children: CenterNode[];

	/**
	 * Parent center ID (null for root)
	 */
	parentId: string | null;
}

/**
 * Gap - Missing content or structural weakness
 */
export interface Gap {
	/**
	 * Type of gap
	 */
	type: 'missing-transition' | 'missing-support' | 'missing-conclusion' | 'logical-jump';

	/**
	 * Position in document (between paragraphs or within)
	 */
	position: {
		/** After this paragraph */
		afterParagraph?: number;
		/** Before this paragraph */
		beforeParagraph?: number;
		/** Within this paragraph */
		withinParagraph?: number;
	};

	/**
	 * Severity (1-5, higher is more critical)
	 */
	severity: number;

	/**
	 * Description of the gap
	 */
	description: string;

	/**
	 * Suggestion for filling the gap
	 */
	suggestion?: string;
}

/**
 * Unity Check - Result of paragraph unity analysis
 */
export interface UnityCheck {
	/**
	 * Is the paragraph unified?
	 */
	isUnified: boolean;

	/**
	 * Unity score (0.0 - 1.0)
	 */
	score: number;

	/**
	 * Main topic identified
	 */
	mainTopic: string;

	/**
	 * Off-topic sentences (if any)
	 */
	offTopicSentences: string[];

	/**
	 * Suggestions for improvement
	 */
	suggestions: string[];
}

/**
 * AI Provider Interface
 *
 * Abstract interface for AI backend providers (Claude, GPT, Gemini).
 * Enables easy swapping of AI providers without changing service code.
 *
 * Follows Strategy Pattern for provider selection.
 */
export interface AIProvider {
	/**
	 * Provider identifier
	 */
	readonly name: AIProviderType;

	/**
	 * Find centers in text
	 *
	 * @param text - Text to analyze
	 * @param context - Optional surrounding context
	 * @returns Array of identified centers
	 */
	findCenters(text: string, context?: string): Promise<Center[]>;

	/**
	 * Suggest expansion prompts for a center
	 *
	 * @param center - The center to expand around
	 * @param documentContext - Full document for context
	 * @returns Array of expansion suggestions
	 */
	suggestExpansions(
		center: Center,
		documentContext?: string
	): Promise<ExpansionPrompt[]>;

	/**
	 * Analyze document wholeness
	 *
	 * @param document - Full document text
	 * @returns Wholeness analysis results
	 */
	analyzeWholeness(document: string): Promise<WholenessAnalysis>;

	/**
	 * Check paragraph unity
	 *
	 * @param paragraph - Paragraph text to analyze
	 * @returns Unity check results
	 */
	checkParagraphUnity(paragraph: string): Promise<UnityCheck>;

	/**
	 * Estimate cost for operation
	 *
	 * @param operation - Operation type
	 * @param textLength - Approximate text length
	 * @returns Estimated cost in USD
	 */
	estimateCost(operation: AIOperation, textLength: number): number;

	/**
	 * Count tokens in text (provider-specific)
	 *
	 * @param text - Text to count
	 * @returns Approximate token count
	 */
	countTokens(text: string): number;
}

/**
 * AI Operation Types (for cost estimation)
 */
export type AIOperation =
	| 'find-centers'
	| 'suggest-expansions'
	| 'analyze-wholeness'
	| 'check-unity';

/**
 * AI Response Wrapper
 *
 * Generic response structure from AI providers
 */
export interface AIResponse<T> {
	/**
	 * Parsed response data
	 */
	data: T;

	/**
	 * Token usage statistics
	 */
	usage: {
		/** Input tokens */
		promptTokens: number;
		/** Output tokens */
		completionTokens: number;
		/** Total tokens */
		totalTokens: number;
	};

	/**
	 * Estimated cost in USD
	 */
	estimatedCost: number;

	/**
	 * Provider that generated this response
	 */
	provider: AIProviderType;

	/**
	 * Request timestamp
	 */
	timestamp: string;
}

/**
 * AI Service Configuration
 */
export interface AIServiceConfig {
	/**
	 * Active provider
	 */
	provider: AIProviderType;

	/**
	 * API key (decrypted, runtime only)
	 */
	apiKey: string;

	/**
	 * User language preference
	 * @default 'en'
	 */
	language?: 'en' | 'ko';

	/**
	 * Enable request caching
	 */
	enableCache?: boolean;

	/**
	 * Cache TTL in milliseconds
	 */
	cacheTtl?: number;

	/**
	 * Enable rate limiting
	 */
	enableRateLimit?: boolean;

	/**
	 * Max requests per minute
	 */
	maxRequestsPerMinute?: number;
}

/**
 * Cache Entry
 */
export interface CacheEntry<T> {
	/**
	 * Cached data
	 */
	data: T;

	/**
	 * Timestamp when cached
	 */
	cachedAt: number;

	/**
	 * Cache key hash
	 */
	key: string;
}

/**
 * Rate Limit State
 */
export interface RateLimitState {
	/**
	 * Request timestamps in current window
	 */
	requests: number[];

	/**
	 * Window start time
	 */
	windowStart: number;

	/**
	 * Is currently limited?
	 */
	isLimited: boolean;

	/**
	 * When will limit reset?
	 */
	resetAt?: number;
}

/**
 * T-010: Center Finding Context Types
 *
 * Context data structures for AI-assisted center discovery from seed notes.
 * These types enable privacy-preserving context extraction and structured
 * center analysis based on Saligo Writing methodology.
 */

/**
 * Center Finding Context
 *
 * Complete context package sent to AI for center discovery.
 * Privacy-aware: Only includes seed content and metadata, no file paths.
 */
export interface CenterFindingContext {
	/**
	 * Seed notes to analyze for centers
	 */
	seeds: SeedContext[];

	/**
	 * Writing methodology (always 'saligo-writing')
	 */
	methodology: 'saligo-writing';

	/**
	 * User's goal (always 'find-centers')
	 */
	userGoal: 'find-centers';

	/**
	 * Optional MOC context if seeds come from a MOC
	 */
	mocContext?: MOCContext;
}

/**
 * Seed Context
 *
 * Privacy-aware seed note context for AI analysis.
 * Excludes file paths and vault identifiers.
 */
export interface SeedContext {
	/**
	 * Anonymous seed ID (not file path)
	 * Format: 'seed-{index}' or 'seed-{hash}'
	 */
	id: string;

	/**
	 * Note content (excluding frontmatter)
	 */
	content: string;

	/**
	 * All tags (inline and frontmatter)
	 */
	tags: string[];

	/**
	 * Note title (filename without extension)
	 */
	title: string;

	/**
	 * Creation timestamp
	 */
	createdAt: number;

	/**
	 * Number of backlinks (for popularity signal)
	 */
	backlinkCount: number;

	/**
	 * Whether seed has photo attachment
	 */
	hasPhoto: boolean;

	/**
	 * Photo caption/alt text (if available)
	 */
	photoCaption?: string;
}

/**
 * MOC Context
 *
 * Context about the Map of Contents the seeds come from.
 * Provides structural information for better center discovery.
 */
export interface MOCContext {
	/**
	 * MOC title
	 */
	title: string;

	/**
	 * Heading structure (list of heading texts)
	 */
	headings: string[];

	/**
	 * Map of seed ID → heading it appears under
	 */
	seedsFromHeading: Record<string, string>;
}

/**
 * Discovered Center (from AI)
 *
 * Enhanced Center type for T-010 center discovery results.
 * Extends base Center with discovery-specific metadata.
 */
export interface DiscoveredCenter {
	/**
	 * Center theme/name (short descriptive phrase)
	 */
	name: string;

	/**
	 * AI explanation of why this is a center (2-3 sentences)
	 */
	explanation: string;

	/**
	 * Strength rating
	 */
	strength: 'strong' | 'medium' | 'weak';

	/**
	 * Connected seed IDs (which seeds relate to this center)
	 */
	connectedSeeds: string[];

	/**
	 * Recommendation text (if this is the strongest center)
	 */
	recommendation?: string;

	/**
	 * Confidence score (0.0-1.0) - derived from strength
	 */
	confidence: number;

	/**
	 * Structural assessment criteria
	 */
	assessment: {
		/**
		 * Does center appear across multiple domains/contexts?
		 */
		crossDomain: boolean;

		/**
		 * Does user express emotional resonance?
		 */
		emotionalResonance: boolean;

		/**
		 * Does user have concrete lived experience?
		 */
		hasConcrete: boolean;

		/**
		 * Can center expand in multiple directions?
		 */
		structuralPivot: boolean;
	};
}

/**
 * Center Finding Result
 *
 * Complete result from AI center discovery operation.
 */
export interface CenterFindingResult {
	/**
	 * Discovered centers (2-4 centers typically)
	 */
	centers: DiscoveredCenter[];

	/**
	 * Token usage for this operation
	 */
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};

	/**
	 * Estimated cost in USD
	 */
	estimatedCost: number;

	/**
	 * Provider used
	 */
	provider: AIProviderType;

	/**
	 * Timestamp
	 */
	timestamp: string;
}

/**
 * AI Service Error Types
 */
export class AIServiceError extends Error {
	constructor(
		message: string,
		public readonly code: AIErrorCode,
		public readonly provider?: AIProviderType,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'AIServiceError';

		console.error('[AIService]', message, {
			code,
			provider,
			cause: cause instanceof Error ? cause.message : String(cause),
		});
	}
}

/**
 * AI Error Codes
 */
export type AIErrorCode =
	| 'INVALID_API_KEY'
	| 'RATE_LIMIT_EXCEEDED'
	| 'NETWORK_ERROR'
	| 'PROVIDER_ERROR'
	| 'INVALID_RESPONSE'
	| 'TIMEOUT'
	| 'QUOTA_EXCEEDED'
	| 'INVALID_REQUEST'
	| 'INSUFFICIENT_SEEDS' // T-010: Not enough seeds for center finding
	| 'INVALID_MOC' // T-025: MOC validation failed
	| 'MOC_TOO_LARGE' // T-025: MOC has too many notes (>30)
	| 'MOC_TOO_SMALL' // T-025: MOC has too few notes (<10)
	| 'MOC_NO_VALID_NOTES'; // T-025: All linked notes are broken/unreadable

/**
 * Next Step Suggestion (T-024)
 *
 * Represents an AI-suggested direction for expanding/developing a document.
 * Based on analysis of current document content and metadata.
 */
export interface NextStepSuggestion {
	/**
	 * Unique identifier for this suggestion
	 */
	id: string;

	/**
	 * Type of expansion suggested
	 */
	type: 'deepen' | 'connect' | 'question' | 'contrast';

	/**
	 * Brief title describing the direction (5-8 words)
	 */
	direction: string;

	/**
	 * Why this expansion improves document wholeness (2-3 sentences)
	 */
	rationale: string;

	/**
	 * Specific content hints (3-5 bullet points)
	 */
	contentHints: string[];

	/**
	 * Strength of this suggestion
	 */
	strength: 'strong' | 'medium' | 'weak';

	/**
	 * Estimated length to add (words)
	 */
	estimatedLength: number;

	/**
	 * Related seed note paths (if applicable)
	 */
	relatedSeeds?: string[];
}

/**
 * WholenessHistoryEntry
 *
 * Single entry in document wholeness history
 * Tracks how document wholeness evolves over time
 */
export interface WholenessHistoryEntry {
	/**
	 * Wholeness score at this point (1-10)
	 */
	score: number;

	/**
	 * When this score was calculated
	 */
	timestamp: string;

	/**
	 * Word count at this point
	 */
	wordCount: number;

	/**
	 * Key changes made since last score (optional)
	 */
	changes?: string;
}

/**
 * WholenessAnalysisDetail
 *
 * Detailed breakdown of wholeness evaluation
 * Provides transparency in how AI evaluates document quality
 */
export interface WholenessAnalysisDetail {
	/**
	 * Overall wholeness score (1-10)
	 */
	score: number;

	/**
	 * Previous score for comparison (if available)
	 */
	previousScore?: number;

	/**
	 * Score change explanation
	 * e.g., "7 → 8 (+1)" or "7 → 7 (no change)"
	 */
	scoreChange?: string;

	/**
	 * Breakdown by evaluation criteria
	 */
	breakdown: {
		/**
		 * Structural completeness (1-10)
		 * Has clear intro, body, conclusion
		 */
		structuralCompleteness: number;

		/**
		 * Thematic coherence (1-10)
		 * Clear main themes, ideas flow logically
		 */
		thematicCoherence: number;

		/**
		 * Internal connections (1-10)
		 * Ideas reference each other, build on previous points
		 */
		internalConnections: number;

		/**
		 * Depth vs breadth balance (1-10)
		 * Not too shallow, not too scattered
		 */
		depthBreadthBalance: number;
	};

	/**
	 * Specific strengths identified
	 */
	strengths: string[];

	/**
	 * Specific areas for improvement
	 */
	improvements: string[];
}

/**
 * Next Steps Result (T-024)
 *
 * Complete result from AI next steps analysis
 */
export interface NextStepsResult {
	/**
	 * All suggested next steps (2-4 suggestions)
	 */
	suggestions: NextStepSuggestion[];

	/**
	 * Current document wholeness score (1-10)
	 * @deprecated Use wholenessAnalysis.score instead
	 */
	currentWholeness: number;

	/**
	 * Detailed wholeness analysis with breakdown
	 */
	wholenessAnalysis: WholenessAnalysisDetail;

	/**
	 * Key themes identified in document
	 */
	keyThemes: string[];

	/**
	 * Related seeds discovered in vault (optional)
	 */
	relatedSeeds?: string[];

	/**
	 * Token usage statistics
	 */
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};

	/**
	 * Estimated cost in USD
	 */
	estimatedCost: number;

	/**
	 * Provider used
	 */
	provider: 'claude' | 'gpt' | 'gemini';

	/**
	 * Whether this was a cached request
	 */
	cached?: boolean;

	/**
	 * Timestamp
	 */
	timestamp: string;
}
