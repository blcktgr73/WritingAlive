/**
 * Base AI Provider
 *
 * Abstract base class for AI providers implementing common functionality.
 * Concrete providers (Claude, GPT, Gemini) extend this class.
 *
 * Design Patterns Applied:
 * - Template Method: Common workflow with provider-specific implementations
 * - Strategy Pattern: Swappable AI backend providers
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles AI provider communication
 * - Open/Closed: Open for extension (new providers), closed for modification
 * - Liskov Substitution: All providers interchangeable via AIProvider interface
 * - Dependency Inversion: Depends on AIProvider abstraction
 */

import type {
	AIProvider,
	Center,
	ExpansionPrompt,
	WholenessAnalysis,
	UnityCheck,
	AIOperation,
	AIResponse,
} from '../types';
import type { AIProvider as AIProviderType } from '../../../settings/settings';

/**
 * Abstract Base Provider
 *
 * Implements common provider functionality while leaving
 * provider-specific details to concrete implementations.
 */
export abstract class BaseAIProvider implements AIProvider {
	/**
	 * Provider identifier
	 */
	abstract readonly name: AIProviderType;

	/**
	 * API key for authentication
	 */
	protected apiKey: string;

	/**
	 * Provider-specific API endpoint
	 */
	protected abstract readonly apiEndpoint: string;

	/**
	 * Provider-specific pricing (USD per 1M tokens)
	 */
	protected abstract readonly pricing: {
		input: number; // Cost per 1M input tokens
		output: number; // Cost per 1M output tokens
	};

	constructor(apiKey: string) {
		if (!apiKey || apiKey.trim().length === 0) {
			throw new Error('Invalid API key for provider');
		}
		this.apiKey = apiKey.trim();
	}

	/**
	 * Find centers in text
	 *
	 * Template method - concrete providers implement makeRequest()
	 */
	abstract findCenters(text: string, context?: string): Promise<Center[]>;

	/**
	 * Suggest expansion prompts
	 *
	 * Template method - concrete providers implement makeRequest()
	 */
	abstract suggestExpansions(
		center: Center,
		documentContext?: string
	): Promise<ExpansionPrompt[]>;

	/**
	 * Analyze document wholeness
	 *
	 * Template method - concrete providers implement makeRequest()
	 */
	abstract analyzeWholeness(document: string): Promise<WholenessAnalysis>;

	/**
	 * Check paragraph unity
	 *
	 * Template method - concrete providers implement makeRequest()
	 */
	abstract checkParagraphUnity(paragraph: string): Promise<UnityCheck>;

	/**
	 * Estimate cost for operation
	 *
	 * Common implementation based on text length and operation type.
	 * Can be overridden by providers with different pricing models.
	 *
	 * @param operation - Type of AI operation
	 * @param textLength - Approximate text length in characters
	 * @returns Estimated cost in USD
	 */
	estimateCost(operation: AIOperation, textLength: number): number {
		// Estimate tokens (rough approximation: 4 chars = 1 token)
		const inputTokens = this.countTokens(textLength.toString());

		// Estimate output tokens based on operation type
		const outputTokens = this.estimateOutputTokens(operation);

		// Calculate cost
		const inputCost =
			(inputTokens / 1_000_000) * this.pricing.input;
		const outputCost =
			(outputTokens / 1_000_000) * this.pricing.output;

		return inputCost + outputCost;
	}

	/**
	 * Count tokens in text
	 *
	 * Simple approximation: ~4 characters per token (English text).
	 * Concrete providers can override with provider-specific tokenizers.
	 *
	 * @param text - Text to count
	 * @returns Approximate token count
	 */
	countTokens(text: string): number {
		// Simple approximation: 4 chars ≈ 1 token (English)
		// This is conservative; actual may be lower
		return Math.ceil(text.length / 4);
	}

	/**
	 * Estimate output tokens for operation type
	 *
	 * Based on typical response sizes for each operation.
	 *
	 * @param operation - Operation type
	 * @returns Estimated output tokens
	 */
	protected estimateOutputTokens(operation: AIOperation): number {
		switch (operation) {
			case 'find-centers':
				return 500; // Typical: 2-5 centers with explanations
			case 'suggest-expansions':
				return 800; // Typical: 3-5 expansion prompts
			case 'analyze-wholeness':
				return 1500; // Detailed analysis with metrics
			case 'check-unity':
				return 400; // Single paragraph analysis
			default:
				return 500; // Default estimate
		}
	}

	/**
	 * Validate API response structure
	 *
	 * Common validation logic for all providers.
	 * Throws if response is malformed.
	 *
	 * @param response - Response object to validate
	 * @param expectedFields - Required field names
	 */
	protected validateResponse(
		response: unknown,
		expectedFields: string[]
	): void {
		if (!response || typeof response !== 'object') {
			throw new Error('Invalid response: not an object');
		}

		const obj = response as Record<string, unknown>;

		for (const field of expectedFields) {
			if (!(field in obj)) {
				throw new Error(`Invalid response: missing field '${field}'`);
			}
		}
	}

	/**
	 * Create response wrapper
	 *
	 * Wraps provider-specific response in standard AIResponse format.
	 *
	 * @param data - Parsed response data
	 * @param usage - Token usage stats
	 * @returns Standardized AI response
	 */
	protected createResponse<T>(
		data: T,
		usage: {
			promptTokens: number;
			completionTokens: number;
			totalTokens: number;
		}
	): AIResponse<T> {
		const estimatedCost =
			(usage.promptTokens / 1_000_000) * this.pricing.input +
			(usage.completionTokens / 1_000_000) * this.pricing.output;

		return {
			data,
			usage,
			estimatedCost,
			provider: this.name,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Generate unique ID
	 *
	 * Utility method for generating IDs for centers, prompts, etc.
	 *
	 * @param prefix - ID prefix (e.g., 'center', 'expansion')
	 * @returns Unique ID string
	 */
	protected generateId(prefix: string): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 9);
		return `${prefix}-${timestamp}-${random}`;
	}

	/**
	 * Extract paragraphs from text
	 *
	 * Utility method for splitting text into paragraphs.
	 *
	 * @param text - Text to split
	 * @returns Array of paragraphs
	 */
	protected extractParagraphs(text: string): string[] {
		return text
			.split(/\n\n+/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0);
	}

	/**
	 * Find text position in document
	 *
	 * Utility method for locating text positions.
	 *
	 * @param document - Full document text
	 * @param searchText - Text to find
	 * @param startOffset - Start search from this offset
	 * @returns Position object or null if not found
	 */
	protected findTextPosition(
		document: string,
		searchText: string,
		startOffset = 0
	): { start: number; end: number } | null {
		const index = document.indexOf(searchText, startOffset);
		if (index === -1) {
			return null;
		}
		return {
			start: index,
			end: index + searchText.length,
		};
	}
}
