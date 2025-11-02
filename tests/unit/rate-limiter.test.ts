/**
 * Rate Limiter Unit Tests
 *
 * Comprehensive test coverage for rate limiting functionality.
 *
 * Test Coverage:
 * - Per-minute rate limiting
 * - Per-hour rate limiting
 * - Sliding window algorithm correctness
 * - Cost tracking
 * - Usage statistics
 * - Rate limit reset
 * - Configuration updates
 * - Error messages and retry-after calculation
 * - Edge cases (boundary conditions, concurrent requests)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	RateLimiter,
	RateLimitError,
} from '../../src/services/storage/rate-limiter';

// Helper: Wait for milliseconds
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('RateLimiter', () => {
	let rateLimiter: RateLimiter;

	beforeEach(() => {
		rateLimiter = new RateLimiter();
	});

	describe('initialization', () => {
		it('should initialize with default config', () => {
			const config = rateLimiter.getConfig();

			expect(config.maxRequestsPerMinute).toBe(10);
			expect(config.maxRequestsPerHour).toBe(100);
			expect(config.enableCostTracking).toBe(true);
		});

		it('should accept custom config', () => {
			const customLimiter = new RateLimiter({
				maxRequestsPerMinute: 5,
				maxRequestsPerHour: 50,
			});

			const config = customLimiter.getConfig();

			expect(config.maxRequestsPerMinute).toBe(5);
			expect(config.maxRequestsPerHour).toBe(50);
		});

		it('should initialize with zero usage stats', () => {
			const stats = rateLimiter.getUsageStats();

			expect(stats.requestsLastMinute).toBe(0);
			expect(stats.requestsLastHour).toBe(0);
			expect(stats.totalCost).toBe(0);
			expect(stats.lastResetAt).toBeDefined();
		});
	});

	describe('checkLimit - per-minute limit', () => {
		it('should allow requests under limit', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 3 });

			await expect(limiter.checkLimit('test-op')).resolves.toBeUndefined();
			limiter.recordRequest('test-op');

			await expect(limiter.checkLimit('test-op')).resolves.toBeUndefined();
			limiter.recordRequest('test-op');

			await expect(limiter.checkLimit('test-op')).resolves.toBeUndefined();
		});

		it('should throw error when per-minute limit exceeded', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 2 });

			// First 2 requests should succeed
			await limiter.checkLimit('test-op');
			limiter.recordRequest('test-op');

			await limiter.checkLimit('test-op');
			limiter.recordRequest('test-op');

			// 3rd request should fail
			await expect(limiter.checkLimit('test-op')).rejects.toThrow(
				RateLimitError
			);
		});

		it('should include retry-after in error', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 1 });

			await limiter.checkLimit('test-op');
			limiter.recordRequest('test-op');

			try {
				await limiter.checkLimit('test-op');
				expect.fail('Should have thrown RateLimitError');
			} catch (error) {
				expect(error).toBeInstanceOf(RateLimitError);
				expect((error as RateLimitError).retryAfterSeconds).toBeGreaterThan(
					0
				);
				expect((error as RateLimitError).retryAfterSeconds).toBeLessThanOrEqual(
					60
				);
			}
		});

		it('should include usage stats in error', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 1 });

			await limiter.checkLimit('test-op');
			limiter.recordRequest('test-op');

			try {
				await limiter.checkLimit('test-op');
				expect.fail('Should have thrown RateLimitError');
			} catch (error) {
				const rateLimitError = error as RateLimitError;
				expect(rateLimitError.usageStats).toBeDefined();
				expect(rateLimitError.usageStats.requestsLastMinute).toBe(1);
			}
		});
	});

	describe('checkLimit - per-hour limit', () => {
		it('should enforce per-hour limit', async () => {
			const limiter = new RateLimiter({
				maxRequestsPerMinute: 100, // High minute limit
				maxRequestsPerHour: 3, // Low hour limit
			});

			// First 3 requests should succeed
			for (let i = 0; i < 3; i++) {
				await limiter.checkLimit('test-op');
				limiter.recordRequest('test-op');
			}

			// 4th request should fail due to hour limit
			await expect(limiter.checkLimit('test-op')).rejects.toThrow(
				RateLimitError
			);
		});

		it('should enforce hour limit independently of minute limit', async () => {
			const limiter = new RateLimiter({
				maxRequestsPerMinute: 10,
				maxRequestsPerHour: 2,
			});

			await limiter.checkLimit('test-op');
			limiter.recordRequest('test-op');

			await limiter.checkLimit('test-op');
			limiter.recordRequest('test-op');

			await expect(limiter.checkLimit('test-op')).rejects.toThrow(
				'per hour'
			);
		});
	});

	describe('recordRequest', () => {
		it('should record request without cost', () => {
			rateLimiter.recordRequest('test-op');

			const stats = rateLimiter.getUsageStats();

			expect(stats.requestsLastMinute).toBe(1);
			expect(stats.totalCost).toBe(0);
		});

		it('should record request with cost', () => {
			rateLimiter.recordRequest('test-op', 0.05);

			const stats = rateLimiter.getUsageStats();

			expect(stats.totalCost).toBe(0.05);
		});

		it('should accumulate costs across requests', () => {
			rateLimiter.recordRequest('op1', 0.02);
			rateLimiter.recordRequest('op2', 0.03);
			rateLimiter.recordRequest('op3', 0.05);

			const stats = rateLimiter.getUsageStats();

			expect(stats.totalCost).toBeCloseTo(0.1, 2);
		});

		it('should track multiple requests', () => {
			rateLimiter.recordRequest('op1');
			rateLimiter.recordRequest('op2');
			rateLimiter.recordRequest('op3');

			const stats = rateLimiter.getUsageStats();

			expect(stats.requestsLastMinute).toBe(3);
			expect(stats.requestsLastHour).toBe(3);
		});
	});

	describe('getUsageStats', () => {
		it('should return accurate stats', () => {
			rateLimiter.recordRequest('op1', 0.01);
			rateLimiter.recordRequest('op2', 0.02);

			const stats = rateLimiter.getUsageStats();

			expect(stats.requestsLastMinute).toBe(2);
			expect(stats.requestsLastHour).toBe(2);
			expect(stats.totalCost).toBeCloseTo(0.03, 2);
			expect(stats.lastResetAt).toBeDefined();
		});

		it('should clean up old requests when getting stats', async () => {
			// Mock time to test cleanup
			vi.useFakeTimers();

			rateLimiter.recordRequest('op1');

			// Advance time by 2 hours
			vi.advanceTimersByTime(2 * 60 * 60 * 1000);

			const stats = rateLimiter.getUsageStats();

			// Request should be cleaned up (older than 1 hour)
			expect(stats.requestsLastHour).toBe(0);

			vi.useRealTimers();
		});
	});

	describe('resetLimits', () => {
		it('should clear request history', () => {
			rateLimiter.recordRequest('op1');
			rateLimiter.recordRequest('op2');

			rateLimiter.resetLimits();

			const stats = rateLimiter.getUsageStats();

			expect(stats.requestsLastMinute).toBe(0);
			expect(stats.requestsLastHour).toBe(0);
		});

		it('should reset cost tracking', () => {
			rateLimiter.recordRequest('op1', 0.1);

			rateLimiter.resetLimits();

			const stats = rateLimiter.getUsageStats();

			expect(stats.totalCost).toBe(0);
		});

		it('should update lastResetAt timestamp', async () => {
			const initialStats = rateLimiter.getUsageStats();
			const initialReset = initialStats.lastResetAt;

			await wait(10); // Small delay to ensure different timestamp

			rateLimiter.resetLimits();

			const newStats = rateLimiter.getUsageStats();

			expect(newStats.lastResetAt).not.toBe(initialReset);
		});
	});

	describe('updateConfig', () => {
		it('should update per-minute limit', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 2 });

			limiter.updateConfig({ maxRequestsPerMinute: 5 });

			const config = limiter.getConfig();

			expect(config.maxRequestsPerMinute).toBe(5);
		});

		it('should update per-hour limit', () => {
			rateLimiter.updateConfig({ maxRequestsPerHour: 200 });

			const config = rateLimiter.getConfig();

			expect(config.maxRequestsPerHour).toBe(200);
		});

		it('should allow disabling cost tracking', () => {
			rateLimiter.updateConfig({ enableCostTracking: false });

			rateLimiter.recordRequest('op1', 0.1);

			const stats = rateLimiter.getUsageStats();

			// Cost should not be tracked when disabled
			expect(stats.totalCost).toBe(0);
		});
	});

	describe('sliding window algorithm', () => {
		it('should allow requests after window expires', async () => {
			vi.useFakeTimers();

			const limiter = new RateLimiter({ maxRequestsPerMinute: 1 });

			// Make first request
			await limiter.checkLimit('op1');
			limiter.recordRequest('op1');

			// Should fail immediately
			await expect(limiter.checkLimit('op2')).rejects.toThrow(
				RateLimitError
			);

			// Advance time by 61 seconds (past 1 minute window)
			vi.advanceTimersByTime(61 * 1000);

			// Should succeed now
			await expect(limiter.checkLimit('op2')).resolves.toBeUndefined();

			vi.useRealTimers();
		});

		it('should maintain accurate count as requests expire', async () => {
			vi.useFakeTimers();

			const limiter = new RateLimiter({ maxRequestsPerMinute: 3 });

			// Make 3 requests
			for (let i = 0; i < 3; i++) {
				await limiter.checkLimit(`op${i}`);
				limiter.recordRequest(`op${i}`);
			}

			// Should be at limit
			await expect(limiter.checkLimit('op-fail')).rejects.toThrow();

			// Advance time by 30 seconds (requests still in window)
			vi.advanceTimersByTime(30 * 1000);

			// Should still be at limit
			await expect(limiter.checkLimit('op-fail')).rejects.toThrow();

			// Advance time by another 31 seconds (total 61s, past first request)
			vi.advanceTimersByTime(31 * 1000);

			// Should succeed now (first request expired)
			await expect(limiter.checkLimit('op-new')).resolves.toBeUndefined();

			vi.useRealTimers();
		});

		it('should handle requests at exact window boundary', async () => {
			vi.useFakeTimers();

			const limiter = new RateLimiter({ maxRequestsPerMinute: 1 });

			await limiter.checkLimit('op1');
			limiter.recordRequest('op1');

			// Advance exactly 60 seconds
			vi.advanceTimersByTime(60 * 1000);

			// Should succeed (original request is now outside window)
			await expect(limiter.checkLimit('op2')).resolves.toBeUndefined();

			vi.useRealTimers();
		});
	});

	describe('edge cases', () => {
		it('should handle zero limits', async () => {
			const limiter = new RateLimiter({
				maxRequestsPerMinute: 0,
			});

			// Should immediately fail
			await expect(limiter.checkLimit('op')).rejects.toThrow(RateLimitError);
		});

		it('should handle very high limits', async () => {
			const limiter = new RateLimiter({
				maxRequestsPerMinute: 10000,
				maxRequestsPerHour: 100000,
			});

			// Should allow many requests
			for (let i = 0; i < 100; i++) {
				await limiter.checkLimit(`op${i}`);
				limiter.recordRequest(`op${i}`);
			}

			const stats = limiter.getUsageStats();

			expect(stats.requestsLastMinute).toBe(100);
		});

		it('should handle concurrent checkLimit calls', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 5 });

			// Make concurrent check calls
			const checks = Array(10)
				.fill(null)
				.map((_, i) => limiter.checkLimit(`op${i}`));

			// Some should succeed, some should fail
			const results = await Promise.allSettled(checks);

			const succeeded = results.filter((r) => r.status === 'fulfilled');
			const failed = results.filter((r) => r.status === 'rejected');

			// All checks should either succeed or fail (no hanging)
			expect(succeeded.length + failed.length).toBe(10);
		});

		it('should handle fractional costs', () => {
			rateLimiter.recordRequest('op1', 0.00123);
			rateLimiter.recordRequest('op2', 0.00456);

			const stats = rateLimiter.getUsageStats();

			expect(stats.totalCost).toBeCloseTo(0.00579, 5);
		});

		it('should handle very large cost values', () => {
			rateLimiter.recordRequest('op1', 999999.99);

			const stats = rateLimiter.getUsageStats();

			expect(stats.totalCost).toBe(999999.99);
		});
	});

	describe('error messages', () => {
		it('should include rate limit details in error message', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 1 });

			await limiter.checkLimit('op1');
			limiter.recordRequest('op1');

			try {
				await limiter.checkLimit('op2');
				expect.fail('Should have thrown');
			} catch (error) {
				expect((error as Error).message).toContain('1 requests per minute');
				expect((error as Error).message).toContain('Try again in');
			}
		});

		it('should provide helpful retry-after guidance', async () => {
			const limiter = new RateLimiter({ maxRequestsPerMinute: 1 });

			await limiter.checkLimit('op1');
			limiter.recordRequest('op1');

			try {
				await limiter.checkLimit('op2');
				expect.fail('Should have thrown');
			} catch (error) {
				const message = (error as Error).message;
				expect(message).toMatch(/Try again in \d+ seconds/);
			}
		});
	});
});
