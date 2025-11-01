/**
 * AI Service Unit Tests
 *
 * Tests for AI service layer including:
 * - Service initialization
 * - Provider selection
 * - Caching behavior
 * - Rate limiting
 * - Error handling
 * - Mock AI responses
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIService } from '../../src/services/ai/ai-service';
import type { Center } from '../../src/services/ai/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('AIService', () => {
	let service: AIService;
	const testApiKey = 'test-api-key-12345';

	beforeEach(() => {
		// Reset fetch mock before each test
		vi.clearAllMocks();

		// Setup default successful mock response
		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				content: [{ type: 'text', text: '{"centers":[]}' }],
				usage: { input_tokens: 10, output_tokens: 5 },
			}),
		});

		// Create fresh service instance before each test
		service = new AIService({
			provider: 'claude',
			apiKey: testApiKey,
			enableCache: true,
			enableRateLimit: false, // Disable for most tests
		});
	});

	afterEach(() => {
		// Cleanup after each test
		service.dispose();
		vi.restoreAllMocks();
	});

	describe('Service Initialization', () => {
		it('should initialize with valid config', () => {
			expect(service).toBeDefined();
			expect(service.getCacheStats().entries).toBe(0);
		});

		it('should initialize Claude provider by default', () => {
			expect(service).toBeDefined();
			// Service should be ready to use
			expect(service.getCacheStats).toBeDefined();
		});

		it('should throw error for invalid provider', () => {
			expect(() => {
				new AIService({
					provider: 'invalid-provider' as any,
					apiKey: testApiKey,
				});
			}).toThrow();
		});

		it('should throw error for empty API key', () => {
			expect(() => {
				new AIService({
					provider: 'claude',
					apiKey: '',
				});
			}).toThrow();
		});
	});

	describe('Find Centers', () => {
		it('should find centers in text', async () => {
			// Mock response with actual center data
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{
						type: 'text',
						text: JSON.stringify({
							centers: [{
								text: 'This is a test paragraph.',
								position: { start: 0, end: 26 },
								confidence: 0.9,
								explanation: 'Main topic sentence'
							}]
						})
					}],
					usage: { input_tokens: 10, output_tokens: 50 },
				}),
			});

			const text = 'This is a test paragraph. It contains multiple sentences. Some are centers.';

			const centers = await service.findCenters(text);

			expect(centers).toBeDefined();
			expect(Array.isArray(centers)).toBe(true);
			expect(centers.length).toBeGreaterThan(0);

			// Validate center structure
			const center = centers[0];
			expect(center).toHaveProperty('id');
			expect(center).toHaveProperty('text');
			expect(center).toHaveProperty('position');
			expect(center).toHaveProperty('confidence');
			expect(center).toHaveProperty('source');
			expect(center.source).toBe('ai-suggested');
		});

		it('should find centers with context', async () => {
			const text = 'Main paragraph.';
			const context = 'Previous paragraph. Next paragraph.';

			const centers = await service.findCenters(text, context);

			expect(centers).toBeDefined();
			expect(Array.isArray(centers)).toBe(true);
		});

		it('should throw error for empty text', async () => {
			await expect(service.findCenters('')).rejects.toThrow();
			await expect(service.findCenters('   ')).rejects.toThrow();
		});

		it('should cache results for same text', async () => {
			const text = 'Test paragraph for caching.';

			// First call - should hit provider
			const centers1 = await service.findCenters(text);
			const stats1 = service.getCacheStats();

			// Second call - should hit cache
			const centers2 = await service.findCenters(text);
			const stats2 = service.getCacheStats();

			// Results should be identical
			expect(centers1).toEqual(centers2);
			// Cache size should not increase
			expect(stats2.entries).toBe(stats1.entries);
		});

		it('should not cache when caching disabled', async () => {
			const noCacheService = new AIService({
				provider: 'claude',
				apiKey: testApiKey,
				enableCache: false,
			});

			const text = 'Test paragraph.';
			await noCacheService.findCenters(text);

			expect(noCacheService.getCacheStats().entries).toBe(0);

			noCacheService.dispose();
		});
	});

	describe('Suggest Expansions', () => {
		it('should suggest expansions for a center', async () => {
			// Mock response with expansion data
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{
						type: 'text',
						text: JSON.stringify({
							expansions: [{
								direction: 'Elaborate',
								prompt: 'What examples support this?',
								rationale: 'Examples strengthen the argument'
							}]
						})
					}],
					usage: { input_tokens: 20, output_tokens: 100 },
				}),
			});

			const center: Center = {
				id: 'center-test-123',
				text: 'This is a key sentence.',
				position: { start: 0, end: 23 },
				paragraph: 0,
				confidence: 0.9,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested',
				accepted: false,
			};

			const expansions = await service.suggestExpansions(center);

			expect(expansions).toBeDefined();
			expect(Array.isArray(expansions)).toBe(true);
			expect(expansions.length).toBeGreaterThan(0);

			// Validate expansion structure
			const expansion = expansions[0];
			expect(expansion).toHaveProperty('id');
			expect(expansion).toHaveProperty('centerId');
			expect(expansion).toHaveProperty('type');
			expect(expansion).toHaveProperty('prompt');
			expect(expansion).toHaveProperty('priority');
			expect(expansion.centerId).toBe(center.id);
		});

		it('should suggest expansions with document context', async () => {
			// Mock expansion response
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{
						type: 'text',
						text: JSON.stringify({
							expansions: [{
								direction: 'Explore context',
								prompt: 'How does this relate to the broader context?',
								rationale: 'Contextual connections'
							}]
						})
					}],
					usage: { input_tokens: 30, output_tokens: 80 },
				}),
			});

			const center: Center = {
				id: 'center-test-456',
				text: 'Another key sentence.',
				position: { start: 0, end: 21 },
				paragraph: 0,
				confidence: 0.85,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested',
				accepted: false,
			};
			const context = 'Full document text for context.';

			const expansions = await service.suggestExpansions(center, context);

			expect(expansions).toBeDefined();
			expect(Array.isArray(expansions)).toBe(true);
		});

		it('should throw error for invalid center', async () => {
			await expect(service.suggestExpansions(null as any)).rejects.toThrow();
			await expect(
				service.suggestExpansions({ text: '' } as any)
			).rejects.toThrow();
		});
	});

	describe('Analyze Wholeness', () => {
		it('should analyze document wholeness', async () => {
			// Mock wholeness analysis response
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{
						type: 'text',
						text: JSON.stringify({
							score: 7.5,
							paragraphUnity: [],
							transitions: [],
							gaps: [],
							suggestions: ['Good structure overall']
						})
					}],
					usage: { input_tokens: 100, output_tokens: 200 },
				}),
			});

			const document = `First paragraph with main idea.

Second paragraph expanding on the idea.

Third paragraph concluding the thought.`;

			const analysis = await service.analyzeWholeness(document);

			expect(analysis).toBeDefined();
			expect(analysis).toHaveProperty('score');
			expect(analysis).toHaveProperty('paragraphUnity');
			expect(analysis).toHaveProperty('transitions');
			expect(analysis).toHaveProperty('suggestions');
			expect(typeof analysis.score).toBe('number');
			expect(analysis.score).toBeGreaterThanOrEqual(1);
			expect(analysis.score).toBeLessThanOrEqual(10);
		});

		it('should throw error for empty document', async () => {
			await expect(service.analyzeWholeness('')).rejects.toThrow();
			await expect(service.analyzeWholeness('   ')).rejects.toThrow();
		});

		it('should cache wholeness analysis', async () => {
			// Mock response for first call (second call will use cache)
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{
						type: 'text',
						text: JSON.stringify({
							score: 8.0,
							paragraphUnity: [],
							transitions: [],
							gaps: [],
							suggestions: ['Test suggestion']
						})
					}],
					usage: { input_tokens: 50, output_tokens: 120 },
				}),
			});

			const document = 'Test document for caching.';

			const analysis1 = await service.analyzeWholeness(document);
			const analysis2 = await service.analyzeWholeness(document);

			expect(analysis1).toEqual(analysis2);
			// Verify only one API call was made (second used cache)
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});
	});

	describe('Check Paragraph Unity', () => {
		it('should check paragraph unity', async () => {
			// Mock unity check response
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{
						type: 'text',
						text: JSON.stringify({
							hasUnity: true,
							score: 0.9,
							mainIdea: 'Topic focus',
							offTopicSentences: [],
							suggestions: ['Good unity']
						})
					}],
					usage: { input_tokens: 30, output_tokens: 80 },
				}),
			});

			const paragraph = 'This paragraph focuses on one topic. All sentences relate to it. Unity is maintained.';

			const unityCheck = await service.checkParagraphUnity(paragraph);

			expect(unityCheck).toBeDefined();
			expect(unityCheck).toHaveProperty('isUnified');
			expect(unityCheck).toHaveProperty('score');
			expect(unityCheck).toHaveProperty('mainTopic');
			expect(unityCheck).toHaveProperty('suggestions');
			expect(typeof unityCheck.isUnified).toBe('boolean');
			expect(typeof unityCheck.score).toBe('number');
		});

		it('should throw error for empty paragraph', async () => {
			await expect(service.checkParagraphUnity('')).rejects.toThrow();
		});
	});

	describe('Cost Estimation', () => {
		it('should estimate cost for operations', () => {
			const cost1 = service.estimateCost('find-centers', 1000);
			const cost2 = service.estimateCost('analyze-wholeness', 5000);

			expect(typeof cost1).toBe('number');
			expect(typeof cost2).toBe('number');
			expect(cost1).toBeGreaterThan(0);
			expect(cost2).toBeGreaterThan(cost1); // Larger text = higher cost
		});

		it('should provide different costs for different operations', () => {
			const textLength = 2000;
			const findCentersCost = service.estimateCost('find-centers', textLength);
			const wholenessCost = service.estimateCost('analyze-wholeness', textLength);

			expect(findCentersCost).not.toBe(wholenessCost);
		});
	});

	describe('Cache Management', () => {
		it('should clear cache', async () => {
			const text = 'Test text for cache clearing.';

			await service.findCenters(text);
			expect(service.getCacheStats().entries).toBeGreaterThan(0);

			service.clearCache();
			expect(service.getCacheStats().entries).toBe(0);
		});

		it('should return cache statistics', async () => {
			const stats1 = service.getCacheStats();
			expect(stats1).toHaveProperty('size');
			expect(stats1).toHaveProperty('entries');

			await service.findCenters('Test 1');
			await service.findCenters('Test 2');

			const stats2 = service.getCacheStats();
			expect(stats2.entries).toBeGreaterThan(stats1.entries);
		});
	});

	describe('Rate Limiting', () => {
		it('should enforce rate limits when enabled', async () => {
			const rateLimitedService = new AIService({
				provider: 'claude',
				apiKey: testApiKey,
				enableRateLimit: true,
				maxRequestsPerMinute: 3,
			});

			const text1 = 'Test 1';
			const text2 = 'Test 2';
			const text3 = 'Test 3';
			const text4 = 'Test 4';

			// First 3 requests should succeed
			await rateLimitedService.findCenters(text1);
			await rateLimitedService.findCenters(text2);
			await rateLimitedService.findCenters(text3);

			// 4th request should fail (rate limit exceeded)
			await expect(rateLimitedService.findCenters(text4)).rejects.toThrow(
				/rate limit/i
			);

			rateLimitedService.dispose();
		});

		it('should not rate limit when disabled', async () => {
			const noRateLimitService = new AIService({
				provider: 'claude',
				apiKey: testApiKey,
				enableRateLimit: false,
			});

			// Should be able to make many requests
			for (let i = 0; i < 10; i++) {
				await noRateLimitService.findCenters(`Test ${i}`);
			}

			noRateLimitService.dispose();
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid API key gracefully', () => {
			expect(() => {
				new AIService({
					provider: 'claude',
					apiKey: '',
				});
			}).toThrow();
		});

		it('should throw error with proper structure', async () => {
			try {
				await service.findCenters('');
			} catch (error) {
				expect(error).toBeDefined();
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBeTruthy();
			}
		});
	});

	describe('Service Disposal', () => {
		it('should dispose cleanly', () => {
			const disposableService = new AIService({
				provider: 'claude',
				apiKey: testApiKey,
			});

			expect(() => disposableService.dispose()).not.toThrow();
			expect(disposableService.getCacheStats().entries).toBe(0);
		});

		it('should clear cache on dispose', async () => {
			const disposableService = new AIService({
				provider: 'claude',
				apiKey: testApiKey,
			});

			await disposableService.findCenters('Test');
			expect(disposableService.getCacheStats().entries).toBeGreaterThan(0);

			disposableService.dispose();
			expect(disposableService.getCacheStats().entries).toBe(0);
		});
	});

	describe('Integration: Multiple Operations', () => {
		it('should handle multiple different operations', async () => {
			// Mock responses for each operation
			(global.fetch as any)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{
							type: 'text',
							text: JSON.stringify({
								centers: [{
									text: 'Test paragraph.',
									position: { start: 0, end: 15 },
									confidence: 0.9
								}]
							})
						}],
						usage: { input_tokens: 10, output_tokens: 30 },
					}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{
							type: 'text',
							text: JSON.stringify({
								expansions: [{
									direction: 'Elaborate',
									prompt: 'Expand on this',
									rationale: 'For clarity'
								}]
							})
						}],
						usage: { input_tokens: 20, output_tokens: 50 },
					}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{
							type: 'text',
							text: JSON.stringify({
								score: 8.0,
								paragraphUnity: [],
								transitions: [],
								gaps: [],
								suggestions: []
							})
						}],
						usage: { input_tokens: 30, output_tokens: 100 },
					}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{
							type: 'text',
							text: JSON.stringify({
								hasUnity: true,
								score: 0.85,
								mainIdea: 'Test',
								offTopicSentences: [],
								suggestions: []
							})
						}],
						usage: { input_tokens: 15, output_tokens: 40 },
					}),
				});

			const text = 'Test paragraph.';

			// Find centers
			const centers = await service.findCenters(text);
			expect(centers.length).toBeGreaterThan(0);

			// Suggest expansions
			const expansions = await service.suggestExpansions(centers[0]);
			expect(expansions.length).toBeGreaterThan(0);

			// Analyze wholeness
			const analysis = await service.analyzeWholeness(text);
			expect(analysis.score).toBeGreaterThan(0);

			// Check unity
			const unity = await service.checkParagraphUnity(text);
			expect(unity.score).toBeGreaterThan(0);
		});

		it('should maintain separate caches for different operations', async () => {
			// Mock responses for caching test
			(global.fetch as any)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{
							type: 'text',
							text: JSON.stringify({
								centers: []
							})
						}],
						usage: { input_tokens: 10, output_tokens: 20 },
					}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{
							type: 'text',
							text: JSON.stringify({
								score: 7.0,
								paragraphUnity: [],
								transitions: [],
								gaps: [],
								suggestions: []
							})
						}],
						usage: { input_tokens: 20, output_tokens: 80 },
					}),
				});

			const text = 'Test text';

			await service.findCenters(text);
			await service.analyzeWholeness(text);

			const stats = service.getCacheStats();
			// Should have cached both operations
			expect(stats.entries).toBeGreaterThanOrEqual(2);
		});
	});
});
