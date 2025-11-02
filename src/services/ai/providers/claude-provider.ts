/**
 * Claude AI Provider
 *
 * Concrete implementation of AIProvider for Anthropic's Claude API.
 * Uses Claude 3.5 Sonnet for all operations.
 *
 * Design Principles:
 * - Single Responsibility: Only handles Claude API communication
 * - Open/Closed: Can be extended for different Claude models
 * - Liskov Substitution: Fully implements AIProvider interface
 *
 * Security:
 * - API key passed securely from encrypted storage
 * - Never logs API keys or responses containing sensitive data
 * - All requests over HTTPS
 *
 * Performance:
 * - Reuses HTTP connections
 * - Supports streaming responses (future enhancement)
 * - Implements exponential backoff for retries
 *
 * @see https://docs.anthropic.com/claude/reference/messages_post
 */

import { BaseAIProvider } from './base-provider';
import type {
	Center,
	ExpansionPrompt,
	WholenessAnalysis,
	UnityCheck,
	AIOperation,
	CenterFindingContext,
	CenterFindingResult,
	DiscoveredCenter,
} from '../types';
import type { AIProvider as AIProviderType } from '../../../settings/settings';
import {
	createFindCentersPrompt,
	createSuggestExpansionsPrompt,
	createAnalyzeWholenessPrompt,
	createCheckParagraphUnityPrompt,
	createFindCentersFromSeedsPrompt,
	validateJsonResponse,
} from '../prompts';

/**
 * Claude API Request/Response Types
 */
interface ClaudeMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface ClaudeRequest {
	model: string;
	max_tokens: number;
	messages: ClaudeMessage[];
	system?: string;
}

interface ClaudeResponse {
	id: string;
	type: 'message';
	role: 'assistant';
	content: Array<{ type: 'text'; text: string }>;
	model: string;
	stop_reason: string;
	usage: {
		input_tokens: number;
		output_tokens: number;
	};
}

/**
 * Claude Provider Implementation
 *
 * For T-20251101-004, this is a stub implementation with mock responses.
 * Real API integration will be implemented in T-20251101-005.
 */
export class ClaudeProvider extends BaseAIProvider {
	readonly name: AIProviderType = 'claude';

	/**
	 * Claude API endpoint
	 * @see https://docs.anthropic.com/claude/reference/messages_post
	 */
	protected readonly apiEndpoint = 'https://api.anthropic.com/v1/messages';

	/**
	 * Claude 3.5 Sonnet pricing (as of 2025-11-01)
	 * @see https://www.anthropic.com/pricing
	 */
	protected readonly pricing = {
		input: 3.0, // $3 per 1M input tokens
		output: 15.0, // $15 per 1M output tokens
	};

	/**
	 * Claude API version
	 */
	private readonly apiVersion = '2023-06-01';

	/**
	 * Model identifier for Claude 3.5 Sonnet
	 */
	private readonly model = 'claude-3-5-sonnet-20241022';

	/**
	 * Maximum output tokens per request
	 */
	private readonly maxTokens = 4096;

	/**
	 * Maximum retry attempts for transient failures
	 */
	private readonly maxRetries = 3;

	/**
	 * Initial retry delay in milliseconds
	 */
	private readonly initialRetryDelay = 1000;

	/**
	 * Find centers in text
	 *
	 * Calls Claude API to identify structural pivot points in writing.
	 *
	 * @param text - Text to analyze
	 * @param context - Optional surrounding context
	 * @returns Array of identified centers
	 * @throws {Error} If API call fails or response is invalid
	 */
	async findCenters(text: string, context?: string): Promise<Center[]> {
		// Validate input
		if (!text || text.trim().length === 0) {
			throw new Error('Cannot find centers in empty text');
		}

		console.log('[ClaudeProvider] Finding centers', {
			textLength: text.length,
			hasContext: !!context,
		});

		// Generate prompt
		const prompt = createFindCentersPrompt(text, context);

		// Call Claude API
		const response = await this.makeClaudeRequest(prompt.system, prompt.user);

		// Parse and validate response
		return this.parseClaudeCentersResponse(response, text);
	}

	/**
	 * Suggest expansion prompts for a center
	 *
	 * Calls Claude API to generate expansion suggestions.
	 *
	 * @param center - The center to expand around
	 * @param documentContext - Full document for context
	 * @returns Array of expansion suggestions
	 * @throws {Error} If API call fails or response is invalid
	 */
	async suggestExpansions(
		center: Center,
		documentContext?: string
	): Promise<ExpansionPrompt[]> {
		console.log('[ClaudeProvider] Suggesting expansions', {
			centerId: center.id,
			hasContext: !!documentContext,
		});

		// Generate prompt
		const prompt = createSuggestExpansionsPrompt(center, documentContext);

		// Call Claude API
		const response = await this.makeClaudeRequest(prompt.system, prompt.user);

		// Parse and validate response
		return this.parseClaudeExpansionsResponse(response, center.id);
	}

	/**
	 * Analyze document wholeness
	 *
	 * Calls Claude API to evaluate overall document structure.
	 *
	 * @param document - Full document text
	 * @returns Wholeness analysis results
	 * @throws {Error} If API call fails or response is invalid
	 */
	async analyzeWholeness(document: string): Promise<WholenessAnalysis> {
		if (!document || document.trim().length === 0) {
			throw new Error('Cannot analyze empty document');
		}

		console.log('[ClaudeProvider] Analyzing wholeness', {
			documentLength: document.length,
		});

		// Generate prompt
		const prompt = createAnalyzeWholenessPrompt(document);

		// Call Claude API
		const response = await this.makeClaudeRequest(prompt.system, prompt.user);

		// Parse and validate response
		return this.parseClaudeWholenessResponse(response);
	}

	/**
	 * Check paragraph unity
	 *
	 * Calls Claude API to evaluate paragraph structure.
	 *
	 * @param paragraph - Paragraph text to analyze
	 * @returns Unity check results
	 * @throws {Error} If API call fails or response is invalid
	 */
	async checkParagraphUnity(paragraph: string): Promise<UnityCheck> {
		if (!paragraph || paragraph.trim().length === 0) {
			throw new Error('Cannot check unity of empty paragraph');
		}

		console.log('[ClaudeProvider] Checking paragraph unity', {
			paragraphLength: paragraph.length,
		});

		// Generate prompt
		const prompt = createCheckParagraphUnityPrompt(paragraph);

		// Call Claude API
		const response = await this.makeClaudeRequest(prompt.system, prompt.user);

		// Parse and validate response
		return this.parseClaudeUnityResponse(response);
	}

	/**
	 * T-010: Find centers from seed notes
	 *
	 * Analyzes seed notes using Saligo Writing methodology to identify
	 * structural centers with development potential.
	 *
	 * @param context - Complete center finding context with seeds
	 * @returns Center finding result with usage stats
	 * @throws {Error} If API call fails or response is invalid
	 */
	async findCentersFromSeeds(
		context: CenterFindingContext
	): Promise<CenterFindingResult> {
		console.log('[ClaudeProvider] Finding centers from seeds', {
			seedCount: context.seeds.length,
			hasMOCContext: !!context.mocContext,
		});

		// Generate T-010 specific prompt
		const prompt = createFindCentersFromSeedsPrompt(context);

		// Call Claude API
		const responseText = await this.makeClaudeRequest(
			prompt.system,
			prompt.user
		);

		// Parse and validate response
		return this.parseCenterFindingResponse(
			responseText,
			context.seeds.length
		);
	}

	/**
	 * Count tokens in text
	 *
	 * Override base implementation with improved approximation for Claude.
	 * Claude uses ~1.3 tokens per word on average for English text.
	 *
	 * TODO: Integrate with tiktoken or Anthropic's tokenizer for exact counts
	 *
	 * @param text - Text to count
	 * @returns Approximate token count
	 */
	countTokens(text: string): number {
		// Approximation: count words and multiply by 1.3
		// This is more accurate than character-based counting
		const words = text.split(/\s+/).filter((w) => w.length > 0);
		return Math.ceil(words.length * 1.3);
	}

	/**
	 * Estimate cost for operation
	 *
	 * Override base implementation to correctly handle textLength parameter.
	 * Base implementation incorrectly converts textLength to string.
	 *
	 * @param operation - Type of AI operation
	 * @param textLength - Text length in characters
	 * @returns Estimated cost in USD
	 */
	estimateCost(operation: AIOperation, textLength: number): number {
		// Approximate text for token counting (4 chars per word average)
		const approximateWordCount = Math.ceil(textLength / 4);
		const inputTokens = approximateWordCount * 1.3;

		// Estimate output tokens based on operation type
		const outputTokens = this.estimateOutputTokens(operation);

		// Calculate cost
		const inputCost = (inputTokens / 1_000_000) * this.pricing.input;
		const outputCost = (outputTokens / 1_000_000) * this.pricing.output;

		return inputCost + outputCost;
	}

	// ========================================================================
	// PRIVATE API METHODS
	// ========================================================================

	/**
	 * Make request to Claude API with retry logic
	 *
	 * Implements exponential backoff for transient failures.
	 * Retries up to 3 times for network errors and rate limits.
	 *
	 * @param systemPrompt - System prompt (context about Saligo Writing)
	 * @param userMessage - User message (actual request)
	 * @returns Parsed response text
	 * @throws {Error} If all retry attempts fail
	 */
	private async makeClaudeRequest(
		systemPrompt: string,
		userMessage: string
	): Promise<string> {
		let lastError: Error | null = null;

		// Retry loop with exponential backoff
		for (let attempt = 0; attempt < this.maxRetries; attempt++) {
			try {
				// Build request payload
				const requestBody: ClaudeRequest = {
					model: this.model,
					max_tokens: this.maxTokens,
					messages: [{ role: 'user', content: userMessage }],
					system: systemPrompt,
				};

				console.log(`[ClaudeProvider] API request (attempt ${attempt + 1}/${this.maxRetries})`, {
					model: this.model,
					systemPromptLength: systemPrompt.length,
					userMessageLength: userMessage.length,
				});

				// Make API request
				const response = await fetch(this.apiEndpoint, {
					method: 'POST',
					headers: {
						'x-api-key': this.apiKey,
						'anthropic-version': this.apiVersion,
						'content-type': 'application/json',
					},
					body: JSON.stringify(requestBody),
				});

				// Handle HTTP errors
				if (!response.ok) {
					const errorText = await response.text();
					const statusCode = response.status;

					// Rate limit - retry with backoff
					if (statusCode === 429) {
						const retryAfter = response.headers.get('retry-after');
						const delay = retryAfter
							? parseInt(retryAfter) * 1000
							: this.calculateBackoffDelay(attempt);

						console.warn(
							`[ClaudeProvider] Rate limited. Retrying after ${delay}ms`
						);
						await this.sleep(delay);
						continue;
					}

					// Server errors - retry with backoff
					if (statusCode >= 500) {
						const delay = this.calculateBackoffDelay(attempt);
						console.warn(
							`[ClaudeProvider] Server error (${statusCode}). Retrying after ${delay}ms`
						);
						await this.sleep(delay);
						continue;
					}

					// Client errors - don't retry
					throw new Error(
						`Claude API error (${statusCode}): ${errorText}`
					);
				}

				// Parse response
				const data = (await response.json()) as ClaudeResponse;

				// Validate response structure
				if (!data.content || data.content.length === 0) {
					throw new Error('Invalid Claude response: empty content');
				}

				// Extract text from response
				const text = data.content[0].text;

				console.log('[ClaudeProvider] API request successful', {
					inputTokens: data.usage.input_tokens,
					outputTokens: data.usage.output_tokens,
					responseLength: text.length,
				});

				return text;
			} catch (error) {
				lastError =
					error instanceof Error
						? error
						: new Error(String(error));

				// Don't retry on validation errors
				if (
					lastError.message.includes('Invalid Claude response') ||
					lastError.message.includes('API error')
				) {
					throw lastError;
				}

				// Network error - retry with backoff
				const delay = this.calculateBackoffDelay(attempt);
				console.warn(
					`[ClaudeProvider] Network error. Retrying after ${delay}ms`,
					{ error: lastError.message }
				);
				await this.sleep(delay);
			}
		}

		// All retries failed
		throw new Error(
			`Claude API request failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
		);
	}

	/**
	 * Calculate exponential backoff delay
	 *
	 * @param attempt - Current attempt number (0-indexed)
	 * @returns Delay in milliseconds
	 */
	private calculateBackoffDelay(attempt: number): number {
		// Exponential backoff: 1s, 2s, 4s
		return this.initialRetryDelay * Math.pow(2, attempt);
	}

	/**
	 * Sleep for specified duration
	 *
	 * @param ms - Milliseconds to sleep
	 */
	private async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Parse Claude response for findCenters
	 *
	 * @param responseText - Raw response text from Claude
	 * @param originalText - Original text being analyzed (for validation)
	 * @returns Array of parsed centers
	 * @throws {Error} If response format is invalid
	 */
	private parseClaudeCentersResponse(
		responseText: string,
		originalText: string
	): Center[] {
		// Validate and parse JSON
		const parsed = validateJsonResponse(responseText, ['centers']);
		const centersData = parsed.centers;

		if (!Array.isArray(centersData)) {
			throw new Error('Invalid response: centers is not an array');
		}

		// Parse each center
		const centers: Center[] = centersData.map((centerData: any, index: number) => {
			// Validate required fields
			if (!centerData.text || typeof centerData.text !== 'string') {
				throw new Error(`Invalid center ${index}: missing or invalid text`);
			}

			if (
				!centerData.position ||
				typeof centerData.position.start !== 'number' ||
				typeof centerData.position.end !== 'number'
			) {
				throw new Error(`Invalid center ${index}: missing or invalid position`);
			}

			if (
				centerData.confidence !== undefined &&
				(typeof centerData.confidence !== 'number' ||
					centerData.confidence < 0 ||
					centerData.confidence > 1)
			) {
				throw new Error(`Invalid center ${index}: confidence must be 0.0-1.0`);
			}

			// Determine paragraph number from position
			const paragraphs = this.extractParagraphs(originalText);
			let paragraphIndex = 0;
			let charCount = 0;

			for (let i = 0; i < paragraphs.length; i++) {
				const paragraphEnd = charCount + paragraphs[i].length;
				if (centerData.position.start < paragraphEnd) {
					paragraphIndex = i;
					break;
				}
				charCount = paragraphEnd + 2; // +2 for \n\n
			}

			return {
				id: this.generateId('center'),
				text: centerData.text,
				position: {
					start: centerData.position.start,
					end: centerData.position.end,
				},
				paragraph: paragraphIndex,
				confidence: centerData.confidence || 0.8,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested',
				accepted: false,
				explanation: centerData.explanation || '',
			};
		});

		return centers;
	}

	/**
	 * Parse Claude response for suggestExpansions
	 *
	 * @param responseText - Raw response text from Claude
	 * @param centerId - ID of the center being expanded
	 * @returns Array of parsed expansion prompts
	 * @throws {Error} If response format is invalid
	 */
	private parseClaudeExpansionsResponse(
		responseText: string,
		centerId: string
	): ExpansionPrompt[] {
		// Validate and parse JSON
		const parsed = validateJsonResponse(responseText, ['expansions']);
		const expansionsData = parsed.expansions;

		if (!Array.isArray(expansionsData)) {
			throw new Error('Invalid response: expansions is not an array');
		}

		// Parse each expansion
		const expansions: ExpansionPrompt[] = expansionsData.map(
			(expData: any, index: number) => {
				// Validate required fields
				if (!expData.prompt || typeof expData.prompt !== 'string') {
					throw new Error(
						`Invalid expansion ${index}: missing or invalid prompt`
					);
				}

				// Map direction to expansion type
				const typeMap: Record<string, ExpansionPrompt['type']> = {
					before: 'before',
					after: 'after',
					elaborate: 'elaborate',
					contrast: 'contrast',
					example: 'example',
				};

				// Try to infer type from direction or default to 'elaborate'
				const direction = (expData.direction || '').toLowerCase();
				let type: ExpansionPrompt['type'] = 'elaborate';

				for (const [key, value] of Object.entries(typeMap)) {
					if (direction.includes(key)) {
						type = value;
						break;
					}
				}

				// Priority: use index as priority (1-5)
				const priority = Math.min(5, Math.max(1, 5 - index));

				return {
					id: this.generateId('expansion'),
					centerId,
					type,
					prompt: expData.prompt,
					priority,
					rationale: expData.rationale || '',
				};
			}
		);

		return expansions;
	}

	/**
	 * Parse Claude response for analyzeWholeness
	 *
	 * @param responseText - Raw response text from Claude
	 * @returns Parsed wholeness analysis
	 * @throws {Error} If response format is invalid
	 */
	private parseClaudeWholenessResponse(
		responseText: string
	): WholenessAnalysis {
		// Validate and parse JSON
		const parsed = validateJsonResponse(responseText, [
			'score',
			'suggestions',
		]);

		// Validate score
		const score =
			typeof parsed.score === 'number' ? parsed.score : 0;

		// Parse paragraph unity
		const paragraphUnity = Array.isArray(parsed.paragraphUnity)
			? parsed.paragraphUnity.map((pu: any) => ({
					paragraphIndex: pu.paragraphIndex || 0,
					score: pu.unityScore || 0.5,
					mainTopic: pu.issue || '',
					digressions: undefined,
				}))
			: [];

		// Parse transitions
		const transitions = Array.isArray(parsed.transitions)
			? parsed.transitions.map((t: any) => ({
					from: t.from || 0,
					to: t.to || 0,
					strength: t.strength || 0.5,
					type: 'continuation' as const,
					suggestion: t.suggestion,
				}))
			: [];

		// Parse gaps
		const gaps = Array.isArray(parsed.gaps)
			? parsed.gaps.map((g: any) => ({
					type: 'missing-transition' as const,
					position: {
						afterParagraph: g.after,
					},
					severity: g.severity === 'high' ? 5 : g.severity === 'medium' ? 3 : 1,
					description: g.description || '',
					suggestion: '',
				}))
			: [];

		// Parse suggestions
		const suggestions = Array.isArray(parsed.suggestions)
			? parsed.suggestions.filter((s: any) => typeof s === 'string')
			: [];

		return {
			score,
			paragraphUnity,
			transitions,
			centerHierarchy: [],
			gaps,
			suggestions,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Parse Claude response for checkParagraphUnity
	 *
	 * @param responseText - Raw response text from Claude
	 * @returns Parsed unity check
	 * @throws {Error} If response format is invalid
	 */
	private parseClaudeUnityResponse(responseText: string): UnityCheck {
		// Validate and parse JSON
		const parsed = validateJsonResponse(responseText, [
			'hasUnity',
			'score',
			'mainIdea',
		]);

		// Parse off-topic sentences
		const offTopicSentences = Array.isArray(parsed.offTopicSentences)
			? parsed.offTopicSentences.map((ots: any) => ots.sentence || '')
			: [];

		// Parse suggestions
		const suggestions = Array.isArray(parsed.suggestions)
			? parsed.suggestions.filter((s: any) => typeof s === 'string')
			: [];

		return {
			isUnified: !!parsed.hasUnity,
			score: typeof parsed.score === 'number' ? parsed.score : 0.5,
			mainTopic: String(parsed.mainIdea || ''),
			offTopicSentences,
			suggestions,
		};
	}

	/**
	 * T-010: Parse Claude response for findCentersFromSeeds
	 *
	 * Parses and validates center finding response, converts to typed result.
	 *
	 * Expected JSON format:
	 * {
	 *   "centers": [
	 *     {
	 *       "name": "Center name",
	 *       "explanation": "Why this is a center",
	 *       "strength": "strong" | "medium" | "weak",
	 *       "connectedSeeds": ["seed-1", "seed-2"],
	 *       "recommendation": "Why to start here" (optional),
	 *       "assessment": {
	 *         "crossDomain": true,
	 *         "emotionalResonance": false,
	 *         "hasConcrete": true,
	 *         "structuralPivot": true
	 *       }
	 *     }
	 *   ]
	 * }
	 *
	 * @param responseText - Raw response text from Claude
	 * @param seedCount - Number of seeds analyzed (for validation)
	 * @returns Parsed center finding result
	 * @throws {Error} If response format is invalid
	 */
	private parseCenterFindingResponse(
		responseText: string,
		seedCount: number
	): CenterFindingResult {
		// Validate and parse JSON
		const parsed = validateJsonResponse(responseText, ['centers']);
		const centersData = parsed.centers;

		if (!Array.isArray(centersData)) {
			throw new Error('Invalid response: centers is not an array');
		}

		if (centersData.length === 0) {
			throw new Error(
				'Invalid response: no centers found. AI may have determined seeds are too disconnected.'
			);
		}

		// Parse each center
		const centers: DiscoveredCenter[] = centersData.map(
			(centerData: any, index: number) => {
				// Validate required fields
				if (!centerData.name || typeof centerData.name !== 'string') {
					throw new Error(`Invalid center ${index}: missing or invalid name`);
				}

				if (
					!centerData.explanation ||
					typeof centerData.explanation !== 'string'
				) {
					throw new Error(
						`Invalid center ${index}: missing or invalid explanation`
					);
				}

				// Validate strength
				const strength = centerData.strength?.toLowerCase();
				if (!['strong', 'medium', 'weak'].includes(strength)) {
					throw new Error(
						`Invalid center ${index}: strength must be 'strong', 'medium', or 'weak'`
					);
				}

				// Validate connectedSeeds
				if (!Array.isArray(centerData.connectedSeeds)) {
					throw new Error(
						`Invalid center ${index}: connectedSeeds must be an array`
					);
				}

				// Map strength to confidence score
				const confidenceMap = {
					strong: 0.9,
					medium: 0.7,
					weak: 0.5,
				};
				const confidence = confidenceMap[strength as 'strong' | 'medium' | 'weak'];

				// Parse assessment (with defaults)
				const assessment = {
					crossDomain: !!centerData.assessment?.crossDomain,
					emotionalResonance: !!centerData.assessment?.emotionalResonance,
					hasConcrete: !!centerData.assessment?.hasConcrete,
					structuralPivot: !!centerData.assessment?.structuralPivot,
				};

				return {
					name: centerData.name,
					explanation: centerData.explanation,
					strength: strength as 'strong' | 'medium' | 'weak',
					connectedSeeds: centerData.connectedSeeds,
					recommendation: centerData.recommendation,
					confidence,
					assessment,
				};
			}
		);

		// Sort centers by strength (strong > medium > weak)
		const strengthOrder = { strong: 3, medium: 2, weak: 1 };
		centers.sort(
			(a, b) => strengthOrder[b.strength] - strengthOrder[a.strength]
		);

		// Estimate token usage (approximate)
		// This is a rough estimate - real usage comes from API response
		const promptTokens = this.estimatePromptTokens(seedCount);
		const completionTokens = this.countTokens(responseText);
		const totalTokens = promptTokens + completionTokens;

		// Calculate cost
		const inputCost = (promptTokens / 1_000_000) * this.pricing.input;
		const outputCost = (completionTokens / 1_000_000) * this.pricing.output;
		const estimatedCost = inputCost + outputCost;

		return {
			centers,
			usage: {
				promptTokens,
				completionTokens,
				totalTokens,
			},
			estimatedCost,
			provider: this.name,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Estimate prompt tokens for center finding
	 *
	 * Rough approximation based on seed count.
	 * Actual prompt includes:
	 * - System message (~400 tokens)
	 * - User message format (~200 tokens)
	 * - Per-seed content (~150 tokens average)
	 *
	 * @param seedCount - Number of seeds
	 * @returns Estimated prompt tokens
	 */
	private estimatePromptTokens(seedCount: number): number {
		const baseTokens = 600; // System + user message format
		const perSeedTokens = 150; // Average content + metadata
		return baseTokens + seedCount * perSeedTokens;
	}
}
