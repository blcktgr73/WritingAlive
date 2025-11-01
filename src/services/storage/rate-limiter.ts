/**
 * Rate Limiter Service
 *
 * Prevents excessive AI API calls using sliding window algorithm.
 * Tracks request counts and estimated costs for transparency.
 *
 * Architecture:
 * - Single Responsibility: Only handles rate limiting logic
 * - Algorithm: Sliding Window (accurate and simple)
 * - Storage: In-memory (reset on plugin reload)
 *
 * Rate Limiting Strategy:
 * - Per-minute limit: 10 requests (default, configurable)
 * - Per-hour limit: 100 requests (default, configurable)
 * - Cost tracking: Estimated tokens/cost for transparency
 *
 * Sliding Window Algorithm:
 * - Maintains array of {timestamp, cost} tuples
 * - On each check: filters out requests older than time window
 * - Counts remaining requests in window
 * - O(n) where n = requests in largest window (typically <100)
 *
 * Future Enhancement (Post-MVP):
 * - Token bucket algorithm for burst handling
 * - Per-user rate limiting (multi-user support)
 * - Persistent storage (survive plugin reload)
 * - Dynamic rate adjustment based on API tier
 */

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
	/**
	 * Maximum requests per minute
	 */
	maxRequestsPerMinute: number;

	/**
	 * Maximum requests per hour
	 */
	maxRequestsPerHour: number;

	/**
	 * Enable cost tracking
	 */
	enableCostTracking: boolean;
}

/**
 * Usage statistics
 */
export interface UsageStats {
	/**
	 * Number of requests in last minute
	 */
	requestsLastMinute: number;

	/**
	 * Number of requests in last hour
	 */
	requestsLastHour: number;

	/**
	 * Total estimated cost (USD)
	 */
	totalCost: number;

	/**
	 * Timestamp when stats were last reset
	 */
	lastResetAt: string;
}

/**
 * Request record for sliding window
 */
interface RequestRecord {
	/**
	 * Timestamp when request was made (milliseconds since epoch)
	 */
	timestamp: number;

	/**
	 * Estimated cost of request (USD)
	 */
	cost: number;

	/**
	 * Operation type (for debugging/analytics)
	 */
	operation: string;
}

/**
 * Rate Limit Error
 *
 * Thrown when rate limit is exceeded.
 */
export class RateLimitError extends Error {
	/**
	 * Number of seconds to wait before retrying
	 */
	public readonly retryAfterSeconds: number;

	/**
	 * Current usage stats
	 */
	public readonly usageStats: UsageStats;

	constructor(
		message: string,
		retryAfterSeconds: number,
		usageStats: UsageStats
	) {
		super(message);
		this.name = 'RateLimitError';
		this.retryAfterSeconds = retryAfterSeconds;
		this.usageStats = usageStats;
	}
}

/**
 * Rate Limiter
 *
 * Service for enforcing rate limits on AI API calls using sliding window algorithm.
 */
export class RateLimiter {
	/**
	 * Default configuration
	 */
	private static readonly DEFAULT_CONFIG: RateLimitConfig = {
		maxRequestsPerMinute: 10,
		maxRequestsPerHour: 100,
		enableCostTracking: true,
	};

	/**
	 * Time windows (milliseconds)
	 */
	private static readonly MINUTE_MS = 60 * 1000;
	private static readonly HOUR_MS = 60 * 60 * 1000;

	/**
	 * Rate limit configuration
	 */
	private readonly config: RateLimitConfig;

	/**
	 * Request history (sliding window)
	 * Sorted by timestamp (oldest first)
	 */
	private requestHistory: RequestRecord[] = [];

	/**
	 * Total cost accumulated since last reset
	 */
	private totalCost = 0;

	/**
	 * Timestamp when limiter was created/reset
	 */
	private createdAt: string;

	/**
	 * Constructor
	 *
	 * @param config - Optional rate limit configuration
	 */
	constructor(config?: Partial<RateLimitConfig>) {
		this.config = {
			...RateLimiter.DEFAULT_CONFIG,
			...config,
		};
		this.createdAt = new Date().toISOString();
	}

	/**
	 * Check if request is allowed within rate limits
	 *
	 * Throws RateLimitError if limit would be exceeded.
	 *
	 * @param _operation - Operation type (for logging/analytics) - reserved for future use
	 * @throws RateLimitError if rate limit exceeded
	 */
	async checkLimit(_operation: string): Promise<void> {
		// Clean up old requests
		this.cleanupOldRequests();

		// Count requests in windows
		const now = Date.now();
		const requestsLastMinute = this.countRequestsInWindow(
			now,
			RateLimiter.MINUTE_MS
		);
		const requestsLastHour = this.countRequestsInWindow(
			now,
			RateLimiter.HOUR_MS
		);

		// Check per-minute limit
		if (requestsLastMinute >= this.config.maxRequestsPerMinute) {
			const retryAfter = this.calculateRetryAfter(RateLimiter.MINUTE_MS);
			throw new RateLimitError(
				`Rate limit exceeded: ${this.config.maxRequestsPerMinute} requests per minute. ` +
				`Try again in ${retryAfter} seconds.`,
				retryAfter,
				this.getUsageStats()
			);
		}

		// Check per-hour limit
		if (requestsLastHour >= this.config.maxRequestsPerHour) {
			const retryAfter = this.calculateRetryAfter(RateLimiter.HOUR_MS);
			throw new RateLimitError(
				`Rate limit exceeded: ${this.config.maxRequestsPerHour} requests per hour. ` +
				`Try again in ${retryAfter} seconds.`,
				retryAfter,
				this.getUsageStats()
			);
		}

		// Request is allowed - don't record it yet (wait for actual API call)
		// Recording happens in recordRequest()
	}

	/**
	 * Record a request
	 *
	 * Should be called after checkLimit() and after the actual API call.
	 * Records the request in the sliding window and updates cost tracking.
	 *
	 * @param operation - Operation type
	 * @param cost - Estimated cost (USD), defaults to 0
	 */
	recordRequest(operation: string, cost = 0): void {
		const record: RequestRecord = {
			timestamp: Date.now(),
			cost,
			operation,
		};

		this.requestHistory.push(record);

		if (this.config.enableCostTracking) {
			this.totalCost += cost;
		}
	}

	/**
	 * Get current usage statistics
	 *
	 * @returns Usage statistics
	 */
	getUsageStats(): UsageStats {
		this.cleanupOldRequests();

		const now = Date.now();
		const requestsLastMinute = this.countRequestsInWindow(
			now,
			RateLimiter.MINUTE_MS
		);
		const requestsLastHour = this.countRequestsInWindow(
			now,
			RateLimiter.HOUR_MS
		);

		return {
			requestsLastMinute,
			requestsLastHour,
			totalCost: this.totalCost,
			lastResetAt: this.createdAt,
		};
	}

	/**
	 * Reset rate limiter
	 *
	 * Clears all request history and cost tracking.
	 * Useful for testing or manual reset.
	 */
	resetLimits(): void {
		this.requestHistory = [];
		this.totalCost = 0;
		this.createdAt = new Date().toISOString();
	}

	/**
	 * Get rate limit configuration
	 *
	 * @returns Current configuration
	 */
	getConfig(): Readonly<RateLimitConfig> {
		return { ...this.config };
	}

	/**
	 * Update rate limit configuration
	 *
	 * @param config - Partial configuration to update
	 */
	updateConfig(config: Partial<RateLimitConfig>): void {
		Object.assign(this.config, config);
	}

	/**
	 * Count requests within time window
	 *
	 * @param now - Current timestamp (milliseconds)
	 * @param windowMs - Window size (milliseconds)
	 * @returns Number of requests in window
	 */
	private countRequestsInWindow(now: number, windowMs: number): number {
		const windowStart = now - windowMs;

		return this.requestHistory.filter(
			(record) => record.timestamp >= windowStart
		).length;
	}

	/**
	 * Clean up requests older than largest window (1 hour)
	 *
	 * Prevents memory buildup from old requests.
	 */
	private cleanupOldRequests(): void {
		const now = Date.now();
		const oldestRelevant = now - RateLimiter.HOUR_MS;

		this.requestHistory = this.requestHistory.filter(
			(record) => record.timestamp >= oldestRelevant
		);
	}

	/**
	 * Calculate retry-after time in seconds
	 *
	 * Finds the oldest request in the window and calculates when it will expire.
	 *
	 * @param windowMs - Window size (milliseconds)
	 * @returns Seconds to wait before retry
	 */
	private calculateRetryAfter(windowMs: number): number {
		const now = Date.now();
		const windowStart = now - windowMs;

		// Find oldest request in window
		const oldestInWindow = this.requestHistory.find(
			(record) => record.timestamp >= windowStart
		);

		if (!oldestInWindow) {
			return 0;
		}

		// Calculate when oldest request will expire from window
		const expiresAt = oldestInWindow.timestamp + windowMs;
		const waitMs = expiresAt - now;

		// Return seconds, rounded up
		return Math.ceil(waitMs / 1000);
	}
}
