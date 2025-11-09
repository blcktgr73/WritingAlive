/**
 * Structure Generator Unit Tests
 *
 * Tests for AI-powered document structure generation including:
 * - Structure generation from outcomes
 * - Structure regeneration with feedback
 * - Prompt construction (Korean/English)
 * - Structure validation
 * - Cost calculation
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StructureGenerator } from '../../src/services/outcome/structure-generator';
import type { AIService } from '../../src/services/ai/ai-service';
import type {
	OutcomeDefinition,
	DocumentStructure,
} from '../../src/services/outcome/types';
import { OutcomeError } from '../../src/services/outcome/types';

// Mock AI service
const createMockAIService = (): AIService => {
	return {
		provider: {
			makeClaudeRequest: vi.fn(),
		},
	} as any;
};

describe('StructureGenerator', () => {
	let generator: StructureGenerator;
	let mockAIService: AIService;

	beforeEach(() => {
		mockAIService = createMockAIService();
		generator = new StructureGenerator(mockAIService, 'en');
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('generateStructure', () => {
		it('should generate valid structure from outcome', async () => {
			// Mock AI response
			const mockResponse = JSON.stringify({
				title: 'Q4 Product Retrospective',
				sections: [
					{
						id: 'section-1',
						title: 'Executive Summary',
						purpose: 'High-level outcomes for leadership',
						estimatedWords: 200,
						estimatedMinutes: 5,
						writingPrompt:
							'Summarize the key achievements and learnings from Q4 in 2-3 sentences.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'What Went Well',
						purpose: 'Celebrate successes and show impact',
						estimatedWords: 400,
						estimatedMinutes: 10,
						writingPrompt:
							'List 3-5 major wins. For each, describe the impact in 2-3 sentences.',
						order: 2,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-3',
						title: 'Challenges and Learnings',
						purpose: 'Reflect on difficulties and growth',
						estimatedWords: 400,
						estimatedMinutes: 10,
						writingPrompt:
							'Describe 3-4 key challenges. What did we learn from each?',
						order: 3,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-4',
						title: 'Action Items',
						purpose: 'Define next steps and improvements',
						estimatedWords: 200,
						estimatedMinutes: 5,
						writingPrompt:
							'List 5-7 concrete action items based on our learnings.',
						order: 4,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			// Generate structure
			const outcome: OutcomeDefinition = {
				description: 'Q4 Product Retrospective for team and VP',
				audience: 'Engineering team and leadership',
				topics: ['wins', 'challenges', 'lessons', 'actions'],
				lengthPreference: 'medium',
			};

			const result = await generator.generateStructure(outcome);

			// Verify structure
			expect(result.structure.title).toBe('Q4 Product Retrospective');
			expect(result.structure.sections).toHaveLength(4);
			expect(result.structure.totalEstimatedWords).toBe(1200);
			expect(result.structure.totalEstimatedMinutes).toBe(30);

			// Verify usage tracking
			expect(result.usage.totalTokens).toBeGreaterThan(0);
			expect(result.estimatedCost).toBeGreaterThan(0);
			expect(result.estimatedCost).toBeLessThan(0.05); // Reasonable cost

			// Verify metadata
			expect(result.provider).toBe('claude');
			expect(result.cached).toBe(false);
			expect(result.timestamp).toBeTruthy();
		});

		it('should generate Korean structure when language is ko', async () => {
			generator = new StructureGenerator(mockAIService, 'ko');

			const mockResponse = JSON.stringify({
				title: 'Q4 제품 회고록',
				sections: [
					{
						id: 'section-1',
						title: '요약',
						purpose: '주요 성과 요약',
						estimatedWords: 200,
						estimatedMinutes: 5,
						writingPrompt: 'Q4의 주요 성과를 2-3문장으로 요약하세요.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: '세부 내용',
						purpose: '상세 분석',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: '주요 성과를 자세히 설명하세요.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			const outcome: OutcomeDefinition = {
				description: 'Q4 제품 회고록',
				lengthPreference: 'short',
			};

			const result = await generator.generateStructure(outcome);

			expect(result.structure.title).toBe('Q4 제품 회고록');
			expect(result.structure.sections[0].title).toBe('요약');
		});

		it('should handle different length preferences', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections: [
					{
						id: 'section-1',
						title: 'Introduction',
						purpose: 'Set context',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Introduce the topic.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Conclusion',
						purpose: 'Wrap up',
						estimatedWords: 200,
						estimatedMinutes: 5,
						writingPrompt: 'Conclude the topic.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			// Test short
			await generator.generateStructure({
				description: 'Test document',
				lengthPreference: 'short',
			});

			let lastCall = (mockAIService as any).provider.makeClaudeRequest.mock
				.calls[0];
			expect(lastCall[1]).toContain('2-3 sections');
			expect(lastCall[1]).toContain('500-800 words');

			// Test medium
			await generator.generateStructure({
				description: 'Test document',
				lengthPreference: 'medium',
			});

			lastCall = (mockAIService as any).provider.makeClaudeRequest.mock.calls[1];
			expect(lastCall[1]).toContain('3-5 sections');
			expect(lastCall[1]).toContain('1000-1500 words');

			// Test long
			await generator.generateStructure({
				description: 'Test document',
				lengthPreference: 'long',
			});

			lastCall = (mockAIService as any).provider.makeClaudeRequest.mock.calls[2];
			expect(lastCall[1]).toContain('4-6 sections');
			expect(lastCall[1]).toContain('1500-2500 words');
		});

		it('should validate section count (too few)', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections: [
					{
						id: 'section-1',
						title: 'Only Section',
						purpose: 'Do everything',
						estimatedWords: 1000,
						estimatedMinutes: 30,
						writingPrompt: 'Write everything.',
						order: 1,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should validate section count (too many)', async () => {
			const sections = Array.from({ length: 8 }, (_, i) => ({
				id: `section-${i + 1}`,
				title: `Section ${i + 1}`,
				purpose: 'Purpose',
				estimatedWords: 200,
				estimatedMinutes: 5,
				writingPrompt: 'Write something.',
				order: i + 1,
				required: true,
				status: 'not-started',
			}));

			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections,
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should validate total time (too short)', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections: [
					{
						id: 'section-1',
						title: 'Section 1',
						purpose: 'Purpose',
						estimatedWords: 50,
						estimatedMinutes: 2,
						writingPrompt: 'Write.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Section 2',
						purpose: 'Purpose',
						estimatedWords: 50,
						estimatedMinutes: 2,
						writingPrompt: 'Write.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should validate total time (too long)', async () => {
			const sections = Array.from({ length: 6 }, (_, i) => ({
				id: `section-${i + 1}`,
				title: `Section ${i + 1}`,
				purpose: 'Purpose',
				estimatedWords: 500,
				estimatedMinutes: 20,
				writingPrompt: 'Write a lot.',
				order: i + 1,
				required: true,
				status: 'not-started',
			}));

			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections,
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should handle malformed JSON response', async () => {
			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				'This is not valid JSON'
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should handle missing required fields', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections: [
					{
						// Missing writingPrompt
						id: 'section-1',
						title: 'Section 1',
						purpose: 'Purpose',
						estimatedWords: 200,
						estimatedMinutes: 5,
						order: 1,
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should handle markdown code blocks in response', async () => {
			const jsonContent = {
				title: 'Test Document',
				sections: [
					{
						id: 'section-1',
						title: 'Introduction',
						purpose: 'Set context',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Introduce the topic.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Conclusion',
						purpose: 'Wrap up',
						estimatedWords: 200,
						estimatedMinutes: 5,
						writingPrompt: 'Conclude.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
			};

			const mockResponse = `\`\`\`json\n${JSON.stringify(jsonContent)}\n\`\`\``;

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			const result = await generator.generateStructure({
				description: 'Test document',
			});

			expect(result.structure.title).toBe('Test Document');
			expect(result.structure.sections).toHaveLength(2);
		});

		it('should default section fields if missing', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections: [
					{
						// Missing id, order, required, status
						title: 'Section 1',
						purpose: 'Purpose',
						estimatedWords: 200,
						estimatedMinutes: 5,
						writingPrompt: 'Write.',
					},
					{
						title: 'Section 2',
						purpose: 'Purpose',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Write more.',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			const result = await generator.generateStructure({
				description: 'Test document',
			});

			expect(result.structure.sections[0].id).toBe('section-1');
			expect(result.structure.sections[0].order).toBe(1);
			expect(result.structure.sections[0].required).toBe(true);
			expect(result.structure.sections[0].status).toBe('not-started');

			expect(result.structure.sections[1].id).toBe('section-2');
			expect(result.structure.sections[1].order).toBe(2);
		});

		it('should calculate cost correctly', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections: [
					{
						id: 'section-1',
						title: 'Section 1',
						purpose: 'Purpose',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Write.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Section 2',
						purpose: 'Purpose',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Write more.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			const result = await generator.generateStructure({
				description: 'Test document for cost calculation',
			});

			// Cost should be > 0 and < $0.05 (reasonable for structure generation)
			expect(result.estimatedCost).toBeGreaterThan(0);
			expect(result.estimatedCost).toBeLessThan(0.05);

			// Cost should be in target range ($0.005-0.010)
			// Allow some variance for longer prompts
			expect(result.estimatedCost).toBeLessThan(0.02);
		});

		it('should warn if cost exceeds target', async () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// Create a very long response to trigger high cost
			const sections = Array.from({ length: 6 }, (_, i) => ({
				id: `section-${i + 1}`,
				title: `Section ${i + 1}`,
				purpose: 'Purpose '.repeat(50), // Long text
				estimatedWords: 400,
				estimatedMinutes: 10,
				writingPrompt: 'Write something. '.repeat(100), // Long text
				order: i + 1,
				required: true,
				status: 'not-started',
			}));

			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections,
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await generator.generateStructure({
				description: 'Test document with very long description '.repeat(100),
			});

			// Should log warning about high cost
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Cost exceeds target')
			);

			consoleSpy.mockRestore();
		});
	});

	describe('regenerateStructure', () => {
		it('should regenerate structure with feedback', async () => {
			const previousStructure: DocumentStructure = {
				title: 'Original Title',
				sections: [
					{
						id: 'section-1',
						title: 'Section 1',
						purpose: 'Purpose 1',
						estimatedWords: 500,
						estimatedMinutes: 15,
						writingPrompt: 'Write a lot.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Section 2',
						purpose: 'Purpose 2',
						estimatedWords: 500,
						estimatedMinutes: 15,
						writingPrompt: 'Write more.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
				totalEstimatedWords: 1000,
				totalEstimatedMinutes: 30,
				generatedAt: '2025-11-08T14:00:00Z',
				generationCost: 0.008,
			};

			const mockResponse = JSON.stringify({
				title: 'Improved Title',
				sections: [
					{
						id: 'section-1',
						title: 'Short Intro',
						purpose: 'Quick context',
						estimatedWords: 200,
						estimatedMinutes: 5,
						writingPrompt: 'Brief introduction.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Main Content',
						purpose: 'Core information',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Main points.',
						order: 2,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-3',
						title: 'Technical Details',
						purpose: 'Deep dive',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Technical specifics.',
						order: 3,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			const result = await generator.regenerateStructure(
				{ description: 'Test document' },
				{
					previousStructure,
					feedback: 'Make sections shorter, add technical details section',
				}
			);

			expect(result.structure.title).toBe('Improved Title');
			expect(result.structure.sections).toHaveLength(3);

			// Verify prompt includes feedback
			const lastCall = (mockAIService as any).provider.makeClaudeRequest.mock
				.calls[0];
			expect(lastCall[1]).toContain('PREVIOUS STRUCTURE');
			expect(lastCall[1]).toContain('USER FEEDBACK');
			expect(lastCall[1]).toContain(
				'Make sections shorter, add technical details section'
			);
		});

		it('should preserve section count if requested', async () => {
			const previousStructure: DocumentStructure = {
				title: 'Original',
				sections: [
					{
						id: 'section-1',
						title: 'Section 1',
						purpose: 'Purpose',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Write.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Section 2',
						purpose: 'Purpose',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Write.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
				totalEstimatedWords: 600,
				totalEstimatedMinutes: 16,
				generatedAt: '2025-11-08T14:00:00Z',
				generationCost: 0.007,
			};

			const mockResponse = JSON.stringify({
				title: 'Improved',
				sections: previousStructure.sections,
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await generator.regenerateStructure(
				{ description: 'Test' },
				{
					previousStructure,
					feedback: 'Improve section titles',
					preserveSectionCount: true,
				}
			);

			const lastCall = (mockAIService as any).provider.makeClaudeRequest.mock
				.calls[0];
			expect(lastCall[1]).toContain('PRESERVE SECTION COUNT: 2');
		});

		it('should use Korean prompts for regeneration', async () => {
			generator = new StructureGenerator(mockAIService, 'ko');

			const previousStructure: DocumentStructure = {
				title: '원본',
				sections: [
					{
						id: 'section-1',
						title: '섹션 1',
						purpose: '목적',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: '작성하기.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: '섹션 2',
						purpose: '목적',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: '더 작성하기.',
						order: 2,
						required: true,
						status: 'not-started',
					},
				],
				totalEstimatedWords: 600,
				totalEstimatedMinutes: 16,
				generatedAt: '2025-11-08T14:00:00Z',
				generationCost: 0.007,
			};

			const mockResponse = JSON.stringify({
				title: '개선됨',
				sections: previousStructure.sections,
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await generator.regenerateStructure(
				{ description: '테스트' },
				{
					previousStructure,
					feedback: '섹션을 더 짧게 만들기',
				}
			);

			const lastCall = (mockAIService as any).provider.makeClaudeRequest.mock
				.calls[0];
			expect(lastCall[1]).toContain('이전 구조');
			expect(lastCall[1]).toContain('사용자 피드백');
		});
	});

	describe('Cost Calculation', () => {
		it('should calculate costs within target range', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test Document',
				sections: [
					{
						id: 'section-1',
						title: 'Section 1',
						purpose: 'Purpose',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Write something.',
						order: 1,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-2',
						title: 'Section 2',
						purpose: 'Purpose',
						estimatedWords: 400,
						estimatedMinutes: 10,
						writingPrompt: 'Write more.',
						order: 2,
						required: true,
						status: 'not-started',
					},
					{
						id: 'section-3',
						title: 'Section 3',
						purpose: 'Purpose',
						estimatedWords: 300,
						estimatedMinutes: 8,
						writingPrompt: 'Conclude.',
						order: 3,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			const result = await generator.generateStructure({
				description:
					'Comprehensive product retrospective covering Q4 achievements, challenges, and action items',
				audience: 'Engineering team and leadership',
				topics: ['wins', 'challenges', 'lessons', 'actions'],
				lengthPreference: 'medium',
			});

			// Cost should be reasonable (typical: $0.005-0.015)
			expect(result.estimatedCost).toBeGreaterThan(0.001);
			expect(result.estimatedCost).toBeLessThan(0.03);
		});
	});

	describe('Error Handling', () => {
		it('should throw OutcomeError on AI service failure', async () => {
			(mockAIService as any).provider.makeClaudeRequest.mockRejectedValue(
				new Error('API Error')
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should throw OutcomeError on invalid JSON', async () => {
			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				'Invalid JSON {]}'
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});

		it('should throw OutcomeError on structure validation failure', async () => {
			const mockResponse = JSON.stringify({
				title: 'Test',
				sections: [
					{
						id: 'section-1',
						title: 'Only Section',
						purpose: 'Everything',
						estimatedWords: 10000,
						estimatedMinutes: 200,
						writingPrompt: 'Write everything.',
						order: 1,
						required: true,
						status: 'not-started',
					},
				],
			});

			(mockAIService as any).provider.makeClaudeRequest.mockResolvedValue(
				mockResponse
			);

			await expect(
				generator.generateStructure({
					description: 'Test document',
				})
			).rejects.toThrow(OutcomeError);
		});
	});
});
