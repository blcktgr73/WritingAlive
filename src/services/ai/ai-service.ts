/**
 * AI Service Layer
 *
 * Main service class for all AI operations in WriteAlive.
 * Provides a unified interface for AI-assisted writing features.
 *
 * Architecture:
 * - Facade Pattern: Simplifies AI operations for plugin consumers
 * - Strategy Pattern: Swappable AI providers (Claude, GPT, Gemini)
 * - Dependency Injection: Provider injected via constructor
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Coordinates AI operations, delegates to providers
 * - Open/Closed: Easy to add new providers without modifying service
 * - Liskov Substitution: Any AIProvider implementation works
 * - Interface Segregation: Clean, focused public API
 * - Dependency Inversion: Depends on AIProvider abstraction, not concrete classes
 *
 * Features:
 * - Provider abstraction (multi-AI-backend support)
 * - Request caching (reduces costs and latency)
 * - Rate limiting (prevents API quota exhaustion)
 * - Cost estimation (transparency for users)
 * - Error handling (graceful degradation)
 */

import type {
	AIProvider,
	AIServiceConfig,
	Center,
	ExpansionPrompt,
	WholenessAnalysis,
	UnityCheck,
	AIOperation,
	CacheEntry,
	RateLimitState,
	CenterFindingContext,
	SeedContext,
	MOCContext,
	CenterFindingResult,
	DiscoveredCenter,
} from './types';
import { ClaudeProvider } from './providers/claude-provider';
import type { AIProvider as AIProviderType } from '../../settings/settings';
import type { SeedNote } from '../vault/types';
import type { App } from 'obsidian';

/**
 * AI Service
 *
 * Main entry point for all AI operations.
 *
 * Usage Example:
 * ```typescript
 * const service = new AIService({
 *   provider: 'claude',
 *   apiKey: decryptedKey,
 *   enableCache: true,
 *   enableRateLimit: true,
 * });
 *
 * const centers = await service.findCenters(selectedText);
 * const analysis = await service.analyzeWholeness(documentText);
 * ```
 */
export class AIService {
	/**
	 * Active AI provider instance
	 */
	private provider: AIProvider;

	/**
	 * Service configuration
	 */
	private config: AIServiceConfig;

	/**
	 * Response cache (in-memory)
	 * Maps cache key → cached response
	 */
	private cache: Map<string, CacheEntry<unknown>>;

	/**
	 * Rate limiting state
	 */
	private rateLimitState: RateLimitState;

	/**
	 * Default cache TTL (24 hours)
	 */
	private readonly DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000;

	/**
	 * Default rate limit (60 requests per minute)
	 */
	private readonly DEFAULT_RATE_LIMIT = 60;

	constructor(config: AIServiceConfig) {
		this.config = {
			enableCache: true,
			cacheTtl: this.DEFAULT_CACHE_TTL,
			enableRateLimit: true,
			maxRequestsPerMinute: this.DEFAULT_RATE_LIMIT,
			...config,
		};

		// Initialize provider
		this.provider = this.createProvider(config.provider, config.apiKey);

		// Initialize cache
		this.cache = new Map();

		// Initialize rate limiting
		this.rateLimitState = {
			requests: [],
			windowStart: Date.now(),
			isLimited: false,
		};

		console.log('[AIService] Initialized', {
			provider: config.provider,
			cacheEnabled: this.config.enableCache,
			rateLimitEnabled: this.config.enableRateLimit,
		});
	}

	/**
	 * Find centers in text
	 *
	 * Identifies structural pivot points (centers) in writing
	 * that can serve as foundation for growth.
	 *
	 * @param text - Text to analyze
	 * @param context - Optional surrounding context (±2 paragraphs)
	 * @returns Array of identified centers
	 * @throws {AIServiceError} If operation fails
	 */
	async findCenters(text: string, context?: string): Promise<Center[]> {
		// Validate input
		if (!text || text.trim().length === 0) {
			throw this.createError(
				'INVALID_REQUEST',
				'Cannot find centers in empty text'
			);
		}

		// Check cache
		const cacheKey = this.createCacheKey('find-centers', { text, context });
		const cached = this.getFromCache<Center[]>(cacheKey);
		if (cached) {
			console.log('[AIService] Returning cached centers');
			return cached;
		}

		// Check rate limit
		await this.checkRateLimit();

		// Call provider
		try {
			const centers = await this.provider.findCenters(text, context);

			// Cache result
			this.saveToCache(cacheKey, centers);

			console.log('[AIService] Found centers', {
				count: centers.length,
				cached: false,
			});

			return centers;
		} catch (error) {
			throw this.createError(
				'PROVIDER_ERROR',
				'Failed to find centers',
				error
			);
		}
	}

	/**
	 * Suggest expansion prompts for a center
	 *
	 * Generates prompts to help writers develop content around a center.
	 *
	 * @param center - The center to expand around
	 * @param documentContext - Full document for context
	 * @returns Array of expansion suggestions
	 * @throws {AIServiceError} If operation fails
	 */
	async suggestExpansions(
		center: Center,
		documentContext?: string
	): Promise<ExpansionPrompt[]> {
		// Validate input
		if (!center || !center.text) {
			throw this.createError(
				'INVALID_REQUEST',
				'Cannot suggest expansions for invalid center'
			);
		}

		// Check cache
		const cacheKey = this.createCacheKey('suggest-expansions', {
			centerId: center.id,
			text: center.text,
		});
		const cached = this.getFromCache<ExpansionPrompt[]>(cacheKey);
		if (cached) {
			console.log('[AIService] Returning cached expansions');
			return cached;
		}

		// Check rate limit
		await this.checkRateLimit();

		// Call provider
		try {
			const expansions = await this.provider.suggestExpansions(
				center,
				documentContext
			);

			// Cache result
			this.saveToCache(cacheKey, expansions);

			console.log('[AIService] Suggested expansions', {
				count: expansions.length,
				cached: false,
			});

			return expansions;
		} catch (error) {
			throw this.createError(
				'PROVIDER_ERROR',
				'Failed to suggest expansions',
				error
			);
		}
	}

	/**
	 * Analyze document wholeness
	 *
	 * Evaluates overall document quality, coherence, and structure.
	 *
	 * @param document - Full document text
	 * @returns Wholeness analysis results
	 * @throws {AIServiceError} If operation fails
	 */
	async analyzeWholeness(document: string): Promise<WholenessAnalysis> {
		// Validate input
		if (!document || document.trim().length === 0) {
			throw this.createError(
				'INVALID_REQUEST',
				'Cannot analyze empty document'
			);
		}

		// Check cache
		const cacheKey = this.createCacheKey('analyze-wholeness', { document });
		const cached = this.getFromCache<WholenessAnalysis>(cacheKey);
		if (cached) {
			console.log('[AIService] Returning cached wholeness analysis');
			return cached;
		}

		// Check rate limit
		await this.checkRateLimit();

		// Call provider
		try {
			const analysis = await this.provider.analyzeWholeness(document);

			// Cache result
			this.saveToCache(cacheKey, analysis);

			console.log('[AIService] Analyzed wholeness', {
				score: analysis.score,
				cached: false,
			});

			return analysis;
		} catch (error) {
			throw this.createError(
				'PROVIDER_ERROR',
				'Failed to analyze wholeness',
				error
			);
		}
	}

	/**
	 * Check paragraph unity
	 *
	 * Evaluates whether a paragraph focuses on a single idea.
	 *
	 * @param paragraph - Paragraph text to analyze
	 * @returns Unity check results
	 * @throws {AIServiceError} If operation fails
	 */
	async checkParagraphUnity(paragraph: string): Promise<UnityCheck> {
		// Validate input
		if (!paragraph || paragraph.trim().length === 0) {
			throw this.createError(
				'INVALID_REQUEST',
				'Cannot check unity of empty paragraph'
			);
		}

		// Check cache
		const cacheKey = this.createCacheKey('check-unity', { paragraph });
		const cached = this.getFromCache<UnityCheck>(cacheKey);
		if (cached) {
			console.log('[AIService] Returning cached unity check');
			return cached;
		}

		// Check rate limit
		await this.checkRateLimit();

		// Call provider
		try {
			const unityCheck = await this.provider.checkParagraphUnity(paragraph);

			// Cache result
			this.saveToCache(cacheKey, unityCheck);

			console.log('[AIService] Checked paragraph unity', {
				isUnified: unityCheck.isUnified,
				score: unityCheck.score,
				cached: false,
			});

			return unityCheck;
		} catch (error) {
			throw this.createError(
				'PROVIDER_ERROR',
				'Failed to check paragraph unity',
				error
			);
		}
	}

	/**
	 * Estimate cost for operation
	 *
	 * Provides transparency about AI operation costs.
	 *
	 * @param operation - Type of AI operation
	 * @param textLength - Approximate text length
	 * @returns Estimated cost in USD
	 */
	estimateCost(operation: AIOperation, textLength: number): number {
		return this.provider.estimateCost(operation, textLength);
	}

	/**
	 * Clear cache
	 *
	 * Clears all cached responses. Useful for testing or
	 * when switching providers.
	 */
	clearCache(): void {
		this.cache.clear();
		console.log('[AIService] Cache cleared');
	}

	/**
	 * Get cache statistics
	 *
	 * Returns information about cache usage.
	 */
	getCacheStats(): { size: number; entries: number } {
		return {
			size: this.cache.size,
			entries: this.cache.size,
		};
	}

	/**
	 * T-010: Find centers from seed notes
	 *
	 * Analyzes multiple seed notes to identify structural centers (themes)
	 * with potential for development into coherent writing.
	 *
	 * This method:
	 * 1. Extracts privacy-safe context from seeds
	 * 2. Calls AI provider with Saligo Writing prompts
	 * 3. Parses and validates center suggestions
	 * 4. Returns ranked centers with explanations
	 *
	 * Privacy: Only sends seed content and tags, no file paths or vault info.
	 * Performance: <4s total latency (extract <50ms/seed, API <3s)
	 *
	 * @param seeds - Seed notes to analyze (2-10 seeds recommended)
	 * @param app - Obsidian app instance for photo detection
	 * @param mocContext - Optional MOC context if seeds from MOC
	 * @returns Center finding results with usage stats
	 * @throws {AIServiceError} If insufficient seeds or API error
	 */
	async findCentersFromSeeds(
		seeds: SeedNote[],
		app: App,
		mocContext?: {
			title: string;
			headings: string[];
			seedsByHeading: Map<string, string>;
		}
	): Promise<CenterFindingResult> {
		// Validate input
		if (!seeds || seeds.length < 2) {
			throw this.createError(
				'INVALID_REQUEST',
				'Need at least 2 seeds to find centers. Consider gathering more seeds first.'
			);
		}

		if (seeds.length > 10) {
			console.warn(
				'[AIService] More than 10 seeds may dilute analysis. Consider filtering to most relevant seeds.'
			);
		}

		console.log('[AIService] Finding centers from seeds', {
			seedCount: seeds.length,
			hasMOCContext: !!mocContext,
		});

		// Extract context (privacy-preserving)
		const context = await this.extractCenterFindingContext(
			seeds,
			app,
			mocContext
		);

		// Check cache
		const cacheKey = this.createCacheKey('find-centers-from-seeds', {
			seedIds: context.seeds.map(s => s.id),
			moc: mocContext?.title,
		});
		const cached = this.getFromCache<CenterFindingResult>(cacheKey);
		if (cached) {
			console.log('[AIService] Returning cached center finding results');
			return cached;
		}

		// Check rate limit
		await this.checkRateLimit();

		// Call provider (T-010 specific method)
		try {
			const result = await (this.provider as any).findCentersFromSeeds(context);

			// Cache result
			this.saveToCache(cacheKey, result);

			console.log('[AIService] Found centers from seeds', {
				centerCount: result.centers.length,
				strongCenters: result.centers.filter((c: DiscoveredCenter) => c.strength === 'strong').length,
				estimatedCost: result.estimatedCost,
				cached: false,
			});

			return result;
		} catch (error) {
			throw this.createError(
				'PROVIDER_ERROR',
				'Failed to find centers from seeds',
				error
			);
		}
	}

	/**
	 * T-010: Extract privacy-safe context from seed notes
	 *
	 * Converts SeedNote[] → CenterFindingContext for AI analysis.
	 * Ensures no file paths, vault names, or identifying info sent to API.
	 *
	 * Context extraction:
	 * - Content: Removes frontmatter, keeps body text
	 * - Tags: All tags (normalized)
	 * - Metadata: Title, creation date, backlink count
	 * - Photos: Detects photo attachments, extracts captions
	 *
	 * Performance: <50ms per seed (target)
	 *
	 * @param seeds - Seed notes to extract context from
	 * @param app - Obsidian app for photo detection
	 * @param mocContext - Optional MOC context
	 * @returns Privacy-safe context for AI
	 */
	private async extractCenterFindingContext(
		seeds: SeedNote[],
		app: App,
		mocContext?: {
			title: string;
			headings: string[];
			seedsByHeading: Map<string, string>;
		}
	): Promise<CenterFindingContext> {
		const startTime = Date.now();

		// Extract seed contexts
		const seedContexts: SeedContext[] = await Promise.all(
			seeds.map(async (seed, index) => {
				// Remove frontmatter from content
				const content = this.removeFrontmatter(seed.content);

				// Detect photo attachments
				const { hasPhoto, caption } = await this.detectPhotoInSeed(
					seed,
					app
				);

				return {
					id: `seed-${index + 1}`, // Anonymous ID
					content: content.trim(),
					tags: seed.tags,
					title: seed.title,
					createdAt: seed.createdAt,
					backlinkCount: seed.backlinks.length,
					hasPhoto,
					photoCaption: caption,
				};
			})
		);

		// Convert MOC context if provided
		const mocCtx: MOCContext | undefined = mocContext
			? {
					title: mocContext.title,
					headings: mocContext.headings,
					seedsFromHeading: Object.fromEntries(
						Array.from(mocContext.seedsByHeading.entries())
					),
			}
			: undefined;

		const extractionTime = Date.now() - startTime;
		const avgTimePerSeed = extractionTime / seeds.length;

		console.log('[AIService] Context extraction complete', {
			seedCount: seeds.length,
			totalTime: extractionTime,
			avgPerSeed: Math.round(avgTimePerSeed),
			targetPerSeed: 50,
		});

		if (avgTimePerSeed > 50) {
			console.warn(
				`[AIService] Context extraction slower than target: ${avgTimePerSeed}ms/seed > 50ms/seed`
			);
		}

		return {
			seeds: seedContexts,
			methodology: 'saligo-writing',
			userGoal: 'find-centers',
			mocContext: mocCtx,
		};
	}

	/**
	 * Remove YAML frontmatter from note content
	 *
	 * Removes content between opening --- and closing --- markers.
	 * Handles edge cases: missing closing marker, nested ---, etc.
	 *
	 * @param content - Raw note content
	 * @returns Content without frontmatter
	 */
	private removeFrontmatter(content: string): string {
		// Check if content starts with frontmatter delimiter
		if (!content.trimStart().startsWith('---')) {
			return content;
		}

		// Find closing delimiter
		const lines = content.split('\n');
		let frontmatterEnd = -1;

		for (let i = 1; i < lines.length; i++) {
			if (lines[i].trim() === '---') {
				frontmatterEnd = i;
				break;
			}
		}

		// If no closing delimiter found, return content as-is
		if (frontmatterEnd === -1) {
			return content;
		}

		// Return content after frontmatter
		return lines.slice(frontmatterEnd + 1).join('\n');
	}

	/**
	 * Detect photo attachments in seed note
	 *
	 * Checks for:
	 * - Embedded images: ![[image.png]]
	 * - Markdown images: ![alt](image.png)
	 *
	 * Extracts caption from alt text or surrounding text.
	 *
	 * @param seed - Seed note to check
	 * @param _app - Obsidian app for file resolution (reserved for future use)
	 * @returns Photo detection result
	 */
	private async detectPhotoInSeed(
		seed: SeedNote,
		_app: App
	): Promise<{ hasPhoto: boolean; caption?: string }> {
		const content = seed.content;

		// Check for embedded images: ![[image.png]]
		const embedRegex = /!\[\[([^\]]+)\]\]/g;
		const embedMatches = content.match(embedRegex);

		if (embedMatches && embedMatches.length > 0) {
			// Extract filename from first embed
			const firstEmbed = embedMatches[0];
			const filenameMatch = firstEmbed.match(/!\[\[([^\]]+)\]\]/);
			const filename = filenameMatch ? filenameMatch[1] : '';

			// Extract caption from surrounding context (next line or previous line)
			const lines = content.split('\n');
			let caption: string | undefined;

			for (let i = 0; i < lines.length; i++) {
				if (lines[i].includes(firstEmbed)) {
					// Try next line
					if (i + 1 < lines.length && lines[i + 1].trim()) {
						caption = lines[i + 1].trim();
					}
					// Try previous line
					else if (i > 0 && lines[i - 1].trim()) {
						caption = lines[i - 1].trim();
					}
					break;
				}
			}

			return {
				hasPhoto: true,
				caption: caption || filename,
			};
		}

		// Check for markdown images: ![alt](image.png)
		const markdownImageRegex = /!\[([^\]]*)\]\(([^\)]+)\)/g;
		const markdownMatches = content.match(markdownImageRegex);

		if (markdownMatches && markdownMatches.length > 0) {
			// Extract alt text from first image
			const firstImage = markdownMatches[0];
			const altMatch = firstImage.match(/!\[([^\]]*)\]/);
			const altText = altMatch ? altMatch[1] : '';

			return {
				hasPhoto: true,
				caption: altText || 'No caption',
			};
		}

		return { hasPhoto: false };
	}

	/**
	 * Dispose of service resources
	 *
	 * Cleanup method for plugin unload.
	 */
	dispose(): void {
		this.clearCache();
		console.log('[AIService] Disposed');
	}

	// ========================================================================
	// Private Helper Methods
	// ========================================================================

	/**
	 * Create AI provider instance
	 *
	 * Factory method for instantiating providers.
	 * Follows Factory Pattern for provider creation.
	 *
	 * @param providerType - Provider type identifier
	 * @param apiKey - Decrypted API key
	 * @returns Provider instance
	 */
	private createProvider(
		providerType: AIProviderType,
		apiKey: string
	): AIProvider {
		switch (providerType) {
			case 'claude':
				return new ClaudeProvider(apiKey);
			case 'gpt':
				// TODO: Implement GPT provider in future transformation
				throw new Error('GPT provider not yet implemented');
			case 'gemini':
				// TODO: Implement Gemini provider in future transformation
				throw new Error('Gemini provider not yet implemented');
			default:
				throw new Error(`Unknown provider: ${providerType}`);
		}
	}

	/**
	 * Create cache key from operation and parameters
	 *
	 * @param operation - Operation type
	 * @param params - Operation parameters
	 * @returns Cache key string
	 */
	private createCacheKey(
		operation: string,
		params: Record<string, unknown>
	): string {
		// Simple hash: operation + JSON stringified params
		// Note: This is not cryptographically secure, just for cache keying
		const paramsStr = JSON.stringify(params);
		return `${operation}:${this.simpleHash(paramsStr)}`;
	}

	/**
	 * Simple hash function for cache keys
	 *
	 * @param str - String to hash
	 * @returns Hash string
	 */
	private simpleHash(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return hash.toString(36);
	}

	/**
	 * Get value from cache
	 *
	 * @param key - Cache key
	 * @returns Cached value or null if not found/expired
	 */
	private getFromCache<T>(key: string): T | null {
		if (!this.config.enableCache) {
			return null;
		}

		const entry = this.cache.get(key) as CacheEntry<T> | undefined;
		if (!entry) {
			return null;
		}

		// Check if expired
		const now = Date.now();
		const ttl = this.config.cacheTtl || this.DEFAULT_CACHE_TTL;
		if (now - entry.cachedAt > ttl) {
			// Expired, remove from cache
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Save value to cache
	 *
	 * @param key - Cache key
	 * @param data - Data to cache
	 */
	private saveToCache<T>(key: string, data: T): void {
		if (!this.config.enableCache) {
			return;
		}

		const entry: CacheEntry<T> = {
			data,
			cachedAt: Date.now(),
			key,
		};

		this.cache.set(key, entry);
	}

	/**
	 * Check rate limit
	 *
	 * Implements sliding window rate limiting.
	 * Throws if rate limit exceeded.
	 *
	 * @throws {AIServiceError} If rate limit exceeded
	 */
	private async checkRateLimit(): Promise<void> {
		if (!this.config.enableRateLimit) {
			return;
		}

		const now = Date.now();
		const windowSize = 60 * 1000; // 1 minute
		const maxRequests =
			this.config.maxRequestsPerMinute || this.DEFAULT_RATE_LIMIT;

		// Remove requests outside current window
		this.rateLimitState.requests = this.rateLimitState.requests.filter(
			(timestamp) => now - timestamp < windowSize
		);

		// Check if at limit
		if (this.rateLimitState.requests.length >= maxRequests) {
			const oldestRequest = Math.min(...this.rateLimitState.requests);
			const resetAt = oldestRequest + windowSize;

			this.rateLimitState.isLimited = true;
			this.rateLimitState.resetAt = resetAt;

			throw this.createError(
				'RATE_LIMIT_EXCEEDED',
				`Rate limit exceeded. Try again in ${Math.ceil((resetAt - now) / 1000)} seconds.`
			);
		}

		// Record this request
		this.rateLimitState.requests.push(now);
		this.rateLimitState.isLimited = false;
	}

	/**
	 * Create AI service error
	 *
	 * @param code - Error code
	 * @param message - Error message
	 * @param cause - Optional underlying error
	 * @returns AIServiceError instance
	 */
	private createError(
		code: 'INVALID_REQUEST' | 'PROVIDER_ERROR' | 'RATE_LIMIT_EXCEEDED',
		message: string,
		cause?: unknown
	): Error {
		// Create custom error type
		const error = new Error(message);
		error.name = 'AIServiceError';
		(error as any).code = code;
		(error as any).provider = this.config.provider;
		(error as any).cause = cause;

		console.error('[AIService]', message, {
			code,
			provider: this.config.provider,
			cause: cause instanceof Error ? cause.message : String(cause),
		});

		return error;
	}
}
