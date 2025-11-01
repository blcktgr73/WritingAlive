/**
 * Claude Provider Unit Tests
 *
 * Tests for Claude AI provider including:
 * - Real API integration (mocked)
 * - Prompt generation
 * - Response parsing
 * - Error handling
 * - Retry logic
 * - Token counting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClaudeProvider } from '../../src/services/ai/providers/claude-provider';
import type { Center } from '../../src/services/ai/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('ClaudeProvider', () => {
	let provider: ClaudeProvider;
	const testApiKey = 'test-api-key-12345';

	beforeEach(() => {
		// Create fresh provider instance before each test
		provider = new ClaudeProvider(testApiKey);

		// Reset fetch mock
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Provider Initialization', () => {
		it('should initialize with valid API key', () => {
			expect(provider).toBeDefined();
			expect(provider.name).toBe('claude');
		});

		it('should throw error for empty API key', () => {
			expect(() => new ClaudeProvider('')).toThrow(/invalid api key/i);
		});

		it('should throw error for whitespace-only API key', () => {
			expect(() => new ClaudeProvider('   ')).toThrow(/invalid api key/i);
		});
	});

	describe('Token Counting', () => {
		it('should count tokens using word-based approximation', () => {
			const text = 'This is a test sentence with seven words.';
			const tokens = provider.countTokens(text);

			// 7 words * 1.3 = 9.1, rounded up to 10
			expect(tokens).toBeGreaterThan(0);
			expect(typeof tokens).toBe('number');
		});

		it('should handle empty text', () => {
			const tokens = provider.countTokens('');
			expect(tokens).toBe(0);
		});

		it('should handle multi-line text', () => {
			const text = `First line with words.
Second line with more words.
Third line.`;
			const tokens = provider.countTokens(text);
			expect(tokens).toBeGreaterThan(0);
		});
	});

	describe('Cost Estimation', () => {
		it('should estimate cost for find-centers operation', () => {
			const cost = provider.estimateCost('find-centers', 1000);
			expect(typeof cost).toBe('number');
			expect(cost).toBeGreaterThan(0);
		});

		it('should estimate cost for analyze-wholeness operation', () => {
			const cost = provider.estimateCost('analyze-wholeness', 1000);
			expect(typeof cost).toBe('number');
			expect(cost).toBeGreaterThan(0);
		});

		it('should scale cost with text length', () => {
			const shortText = 'Short text.'; // ~10 chars
			const longText = 'This is a much longer text with many more words and characters to increase the token count significantly.'; // ~100+ chars
			const cost1 = provider.estimateCost('find-centers', shortText.length);
			const cost2 = provider.estimateCost('find-centers', longText.length);
			expect(cost2).toBeGreaterThan(cost1);
		});
	});

	describe('Find Centers', () => {
		it('should call Claude API and parse centers response', async () => {
			const mockResponse = {
				centers: [
					{
						text: 'This is a center.',
						position: { start: 0, end: 17 },
						confidence: 0.9,
						explanation: 'Main topic sentence',
					},
				],
			};

			// Mock successful API response
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({
					id: 'msg-123',
					type: 'message',
					role: 'assistant',
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					model: 'claude-3-5-sonnet-20241022',
					stop_reason: 'end_turn',
					usage: { input_tokens: 100, output_tokens: 50 },
				}),
			});

			const text = 'This is a center. And some other text.';
			const centers = await provider.findCenters(text);

			// Verify fetch was called
			expect(global.fetch).toHaveBeenCalledTimes(1);
			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.anthropic.com/v1/messages',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'x-api-key': testApiKey,
						'anthropic-version': '2023-06-01',
						'content-type': 'application/json',
					}),
				})
			);

			// Verify centers were parsed correctly
			expect(centers).toBeDefined();
			expect(Array.isArray(centers)).toBe(true);
			expect(centers.length).toBe(1);
			expect(centers[0].text).toBe('This is a center.');
			expect(centers[0].confidence).toBe(0.9);
			expect(centers[0].source).toBe('ai-suggested');
		});

		it('should throw error for empty text', async () => {
			await expect(provider.findCenters('')).rejects.toThrow(
				/empty text/i
			);
		});

		it('should include context in API request', async () => {
			const mockResponse = { centers: [] };

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					usage: { input_tokens: 100, output_tokens: 50 },
				}),
			});

			const text = 'Main text.';
			const context = 'Context before and after.';
			await provider.findCenters(text, context);

			// Verify fetch was called with context
			const callArgs = (global.fetch as any).mock.calls[0][1];
			const requestBody = JSON.parse(callArgs.body);
			expect(requestBody.messages[0].content).toContain(context);
		});
	});

	describe('Suggest Expansions', () => {
		it('should call Claude API and parse expansions response', async () => {
			const mockResponse = {
				expansions: [
					{
						direction: 'Elaborate on details',
						prompt: 'What specific examples support this?',
						rationale: 'Examples strengthen the center',
					},
					{
						direction: 'Explore implications',
						prompt: 'What are the consequences?',
						rationale: 'Deepens understanding',
					},
				],
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					usage: { input_tokens: 100, output_tokens: 150 },
				}),
			});

			const center: Center = {
				id: 'center-123',
				text: 'Test center text.',
				position: { start: 0, end: 17 },
				paragraph: 0,
				confidence: 0.85,
				timestamp: new Date().toISOString(),
				source: 'ai-suggested',
				accepted: false,
			};

			const expansions = await provider.suggestExpansions(center);

			// Verify expansions were parsed
			expect(expansions).toBeDefined();
			expect(Array.isArray(expansions)).toBe(true);
			expect(expansions.length).toBe(2);
			expect(expansions[0].centerId).toBe('center-123');
			expect(expansions[0].prompt).toBeTruthy();
			expect(expansions[0].type).toBe('elaborate');
		});
	});

	describe('Analyze Wholeness', () => {
		it('should call Claude API and parse wholeness response', async () => {
			const mockResponse = {
				score: 7.5,
				paragraphUnity: [
					{ paragraphIndex: 0, unityScore: 0.8, issue: 'Good unity' },
				],
				transitions: [
					{ from: 0, to: 1, strength: 0.7, suggestion: 'Improve flow' },
				],
				gaps: [
					{ after: 1, description: 'Missing link', severity: 'medium' },
				],
				suggestions: ['Add more examples', 'Clarify main argument'],
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					usage: { input_tokens: 200, output_tokens: 300 },
				}),
			});

			const document = 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.';
			const analysis = await provider.analyzeWholeness(document);

			expect(analysis).toBeDefined();
			expect(analysis.score).toBe(7.5);
			expect(analysis.paragraphUnity.length).toBe(1);
			expect(analysis.transitions.length).toBe(1);
			expect(analysis.gaps.length).toBe(1);
			expect(analysis.suggestions.length).toBe(2);
		});

		it('should throw error for empty document', async () => {
			await expect(provider.analyzeWholeness('')).rejects.toThrow(
				/empty document/i
			);
		});
	});

	describe('Check Paragraph Unity', () => {
		it('should call Claude API and parse unity response', async () => {
			const mockResponse = {
				hasUnity: true,
				score: 0.9,
				mainIdea: 'The paragraph focuses on testing',
				offTopicSentences: [],
				suggestions: ['Good paragraph unity'],
				label: 'claim',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					usage: { input_tokens: 50, output_tokens: 100 },
				}),
			});

			const paragraph = 'This paragraph has unity. All sentences relate.';
			const unity = await provider.checkParagraphUnity(paragraph);

			expect(unity).toBeDefined();
			expect(unity.isUnified).toBe(true);
			expect(unity.score).toBe(0.9);
			expect(unity.mainTopic).toBeTruthy();
		});

		it('should throw error for empty paragraph', async () => {
			await expect(provider.checkParagraphUnity('')).rejects.toThrow(
				/empty paragraph/i
			);
		});
	});

	describe('Error Handling', () => {
		it('should handle HTTP 401 (invalid API key)', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 401,
				text: async () => 'Invalid API key',
			});

			await expect(provider.findCenters('Test')).rejects.toThrow(
				/401/
			);
		});

		it('should handle HTTP 500 (server error) with retry', async () => {
			// First two attempts fail, third succeeds
			(global.fetch as any)
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					text: async () => 'Server error',
				})
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					text: async () => 'Server error',
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{ type: 'text', text: '{"centers":[]}' }],
						usage: { input_tokens: 10, output_tokens: 5 },
					}),
				});

			const centers = await provider.findCenters('Test');
			expect(centers).toBeDefined();
			expect(global.fetch).toHaveBeenCalledTimes(3);
		});

		it('should fail after max retries', async () => {
			// All attempts fail
			(global.fetch as any).mockResolvedValue({
				ok: false,
				status: 500,
				text: async () => 'Server error',
			});

			await expect(provider.findCenters('Test')).rejects.toThrow(
				/failed after 3 attempts/i
			);

			expect(global.fetch).toHaveBeenCalledTimes(3);
		}, 10000); // 10 second timeout for retry backoff

		it('should handle rate limiting (429) with retry', async () => {
			// First attempt rate limited, second succeeds
			(global.fetch as any)
				.mockResolvedValueOnce({
					ok: false,
					status: 429,
					headers: {
						get: (name: string) => (name === 'retry-after' ? '1' : null),
					},
					text: async () => 'Rate limited',
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{ type: 'text', text: '{"centers":[]}' }],
						usage: { input_tokens: 10, output_tokens: 5 },
					}),
				});

			const centers = await provider.findCenters('Test');
			expect(centers).toBeDefined();
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});

		it('should handle network errors with retry', async () => {
			// First attempt fails, second succeeds
			(global.fetch as any)
				.mockRejectedValueOnce(new Error('Network error'))
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						content: [{ type: 'text', text: '{"centers":[]}' }],
						usage: { input_tokens: 10, output_tokens: 5 },
					}),
				});

			const centers = await provider.findCenters('Test');
			expect(centers).toBeDefined();
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});

		it('should handle invalid JSON response', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: 'Not valid JSON' }],
					usage: { input_tokens: 10, output_tokens: 5 },
				}),
			});

			await expect(provider.findCenters('Test')).rejects.toThrow(
				/invalid json/i
			);
		});

		it('should handle missing required fields in response', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: '{"invalid":"response"}' }],
					usage: { input_tokens: 10, output_tokens: 5 },
				}),
			});

			await expect(provider.findCenters('Test')).rejects.toThrow(
				/missing required field/i
			);
		});
	});

	describe('API Request Format', () => {
		it('should send correct request structure', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: '{"centers":[]}' }],
					usage: { input_tokens: 10, output_tokens: 5 },
				}),
			});

			await provider.findCenters('Test text');

			const callArgs = (global.fetch as any).mock.calls[0];
			const [url, options] = callArgs;

			// Verify URL
			expect(url).toBe('https://api.anthropic.com/v1/messages');

			// Verify headers
			expect(options.headers['x-api-key']).toBe(testApiKey);
			expect(options.headers['anthropic-version']).toBe('2023-06-01');
			expect(options.headers['content-type']).toBe('application/json');

			// Verify request body
			const body = JSON.parse(options.body);
			expect(body.model).toBe('claude-3-5-sonnet-20241022');
			expect(body.max_tokens).toBe(4096);
			expect(body.messages).toHaveLength(1);
			expect(body.messages[0].role).toBe('user');
			expect(body.system).toBeTruthy(); // Should have Saligo context
		});

		it('should include Saligo Writing context in system prompt', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: '{"centers":[]}' }],
					usage: { input_tokens: 10, output_tokens: 5 },
				}),
			});

			await provider.findCenters('Test');

			const callArgs = (global.fetch as any).mock.calls[0][1];
			const body = JSON.parse(callArgs.body);

			expect(body.system).toContain('Saligo Writing');
			expect(body.system).toContain('Christopher Alexander');
		});
	});

	describe('Response Parsing', () => {
		it('should parse centers with all fields', async () => {
			const mockResponse = {
				centers: [
					{
						text: 'Full center text.',
						position: { start: 0, end: 17 },
						confidence: 0.95,
						explanation: 'Detailed explanation',
					},
				],
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					usage: { input_tokens: 10, output_tokens: 50 },
				}),
			});

			const centers = await provider.findCenters('Full center text.');

			expect(centers[0].text).toBe('Full center text.');
			expect(centers[0].position.start).toBe(0);
			expect(centers[0].position.end).toBe(17);
			expect(centers[0].confidence).toBe(0.95);
			expect(centers[0].explanation).toBe('Detailed explanation');
			expect(centers[0].id).toBeTruthy();
			expect(centers[0].timestamp).toBeTruthy();
		});

		it('should use default confidence if missing', async () => {
			const mockResponse = {
				centers: [
					{
						text: 'Center without confidence.',
						position: { start: 0, end: 26 },
					},
				],
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					usage: { input_tokens: 10, output_tokens: 30 },
				}),
			});

			const centers = await provider.findCenters('Center without confidence.');
			expect(centers[0].confidence).toBe(0.8); // Default confidence
		});

		it('should validate confidence range', async () => {
			const mockResponse = {
				centers: [
					{
						text: 'Invalid confidence.',
						position: { start: 0, end: 19 },
						confidence: 1.5, // Invalid: > 1.0
					},
				],
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
					usage: { input_tokens: 10, output_tokens: 30 },
				}),
			});

			await expect(
				provider.findCenters('Invalid confidence.')
			).rejects.toThrow(/confidence must be/i);
		});
	});

	describe('Retry Logic', () => {
		it('should use exponential backoff', async () => {
			const startTime = Date.now();

			// All attempts fail
			(global.fetch as any).mockResolvedValue({
				ok: false,
				status: 500,
				text: async () => 'Error',
			});

			try {
				await provider.findCenters('Test');
			} catch (error) {
				// Should have retried 3 times with backoff
				const duration = Date.now() - startTime;
				// Total backoff: 1000 + 2000 + 4000 = 7000ms minimum
				// Allow some margin for test execution
				expect(duration).toBeGreaterThan(6000);
			}
		}, 10000); // 10 second timeout for retry backoff

		it('should not retry on client errors (400)', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 400,
				text: async () => 'Bad request',
			});

			await expect(provider.findCenters('Test')).rejects.toThrow();
			expect(global.fetch).toHaveBeenCalledTimes(1); // No retry
		});
	});
});
