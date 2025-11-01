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
	| 'INVALID_REQUEST';
