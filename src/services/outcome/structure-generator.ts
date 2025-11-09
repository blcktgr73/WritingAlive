/**
 * Structure Generator Service
 *
 * AI-powered document structure generation for outcome-driven writing.
 * Converts outcome definitions into section-based writing structures using
 * Saligo Writing principles (low-energy prompts, realistic estimates).
 *
 * Architecture:
 * - Single Responsibility: Only handles structure generation from outcomes
 * - Dependency Injection: Receives AIService via constructor
 * - Error Handling: Clear error messages with OutcomeError
 * - Cost Transparency: Tracks and reports AI API costs
 *
 * Design Principles (SOLID):
 * - Single Responsibility: Structure generation only
 * - Open/Closed: Extensible through prompt strategy variations
 * - Liskov Substitution: Works with any AIProvider implementation
 * - Interface Segregation: Focused public API with minimal methods
 * - Dependency Inversion: Depends on AIService abstraction
 *
 * Performance Targets:
 * - Latency: <5 seconds P95 (Claude Sonnet 4.5)
 * - Cost: $0.005-0.010 per generation (3K-4K tokens typical)
 * - Quality: 3-5 sections with actionable prompts
 *
 * @see OutcomeDefinition for input structure
 * @see DocumentStructure for output structure
 */

import type { AIService } from '../ai/ai-service';
import type {
	OutcomeDefinition,
	DocumentStructure,
	DocumentSection,
} from './types';
import { OutcomeError } from './types';

/**
 * Structure Generation Result
 *
 * Complete result of structure generation including usage and cost tracking.
 *
 * Example:
 * ```typescript
 * {
 *   structure: {
 *     title: "Q4 Product Retrospective",
 *     sections: [...],
 *     totalEstimatedWords: 1200,
 *     totalEstimatedMinutes: 35,
 *     generatedAt: "2025-11-08T14:30:00Z",
 *     generationCost: 0.008
 *   },
 *   usage: {
 *     promptTokens: 1500,
 *     completionTokens: 800,
 *     totalTokens: 2300
 *   },
 *   estimatedCost: 0.008,
 *   provider: "claude",
 *   cached: false,
 *   timestamp: "2025-11-08T14:30:00Z"
 * }
 * ```
 */
export interface StructureGenerationResult {
	/**
	 * Generated document structure
	 */
	structure: DocumentStructure;

	/**
	 * Token usage breakdown
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
	 * AI provider used
	 */
	provider: string;

	/**
	 * Whether result was cached
	 */
	cached: boolean;

	/**
	 * ISO timestamp of generation
	 */
	timestamp: string;
}

/**
 * Structure Regeneration Options
 *
 * Options for regenerating structure with feedback.
 * Supports iterative refinement: user provides feedback,
 * AI adjusts structure accordingly.
 *
 * Example:
 * ```typescript
 * {
 *   previousStructure: { ... },
 *   feedback: "Make sections shorter, add technical details section",
 *   preserveSectionCount: false
 * }
 * ```
 */
export interface StructureRegenerationOptions {
	/**
	 * Previous structure to refine
	 */
	previousStructure: DocumentStructure;

	/**
	 * User feedback for refinement
	 * @example "Make sections shorter, add technical details section"
	 */
	feedback: string;

	/**
	 * Whether to preserve section count from previous structure
	 * @default false
	 */
	preserveSectionCount?: boolean;
}

/**
 * Structure Generator
 *
 * Service for AI-powered document structure generation.
 *
 * Usage Example:
 * ```typescript
 * const generator = new StructureGenerator(aiService, 'ko');
 *
 * const result = await generator.generateStructure({
 *   description: "Q4 제품 회고록 - 성과와 교훈",
 *   audience: "팀과 VP",
 *   topics: ["성과", "도전", "교훈", "액션"],
 *   lengthPreference: "medium"
 * });
 *
 * console.log(result.structure.title); // "Q4 제품 회고록"
 * console.log(result.estimatedCost); // 0.008
 * ```
 */
export class StructureGenerator {
	/**
	 * AI service for structure generation
	 */
	private readonly aiService: AIService;

	/**
	 * Language preference for prompts and output
	 * @default 'en'
	 */
	private readonly language: 'ko' | 'en';

	/**
	 * Minimum sections in generated structure
	 */
	private readonly MIN_SECTIONS = 2;

	/**
	 * Maximum sections in generated structure
	 */
	private readonly MAX_SECTIONS = 6;

	/**
	 * Target cost range (USD)
	 */
	private readonly TARGET_COST_MAX = 0.010;

	/**
	 * Claude Sonnet 4.5 pricing (per 1M tokens)
	 * Matches pricing from claude-provider.ts
	 */
	private readonly PRICING = {
		input: 3.0, // $3 per 1M input tokens
		output: 15.0, // $15 per 1M output tokens
	};

	/**
	 * Constructor
	 *
	 * @param aiService - AI service instance
	 * @param language - Language preference (default: 'en')
	 */
	constructor(aiService: AIService, language: 'ko' | 'en' = 'en') {
		this.aiService = aiService;
		this.language = language;
	}

	/**
	 * Generate document structure from outcome
	 *
	 * Creates AI-powered section-based structure using Saligo principles.
	 *
	 * Algorithm:
	 * 1. Validate outcome definition
	 * 2. Build AI prompt with outcome context
	 * 3. Call AI service (Claude Sonnet 4.5)
	 * 4. Parse and validate JSON response
	 * 5. Calculate token usage and cost
	 * 6. Return structured result
	 *
	 * Error Handling:
	 * - Invalid outcome → OutcomeError (VALIDATION_FAILED)
	 * - AI API failure → OutcomeError (AI_GENERATION_FAILED)
	 * - Invalid structure → OutcomeError (INVALID_STRUCTURE)
	 *
	 * @param outcome - Validated outcome definition
	 * @returns Generation result with structure, usage, and cost
	 * @throws OutcomeError if generation fails
	 *
	 * @example
	 * const result = await generator.generateStructure({
	 *   description: "Q4 Product Retrospective for team and VP",
	 *   audience: "Engineering team and leadership",
	 *   topics: ["wins", "challenges", "lessons", "actions"],
	 *   lengthPreference: "medium"
	 * });
	 */
	async generateStructure(
		outcome: OutcomeDefinition
	): Promise<StructureGenerationResult> {
		console.log('[StructureGenerator] Generating structure', {
			description: outcome.description.substring(0, 50),
			language: this.language,
		});

		try {
			// Build prompt
			const prompt = this.buildStructurePrompt(outcome);

			console.log('[StructureGenerator] Calling AI service');
			const startTime = Date.now();

			// Call AI service
			// Using same pattern as suggestNextSteps in ai-service.ts
			const responseText = await (this.aiService as any).provider.makeClaudeRequest(
				prompt.system,
				prompt.user
			);

			const latency = Date.now() - startTime;
			console.log('[StructureGenerator] AI response received', {
				latency,
				responseLength: responseText.length,
			});

			// Parse response
			const parsed = this.parseStructureResponse(responseText);

			// Calculate token usage
			const promptTokens = this.countTokens(prompt.system + prompt.user);
			const completionTokens = this.countTokens(responseText);

			// Calculate cost
			const estimatedCost = this.calculateCost(
				promptTokens,
				completionTokens
			);

			// Validate cost is within target range
			if (estimatedCost > this.TARGET_COST_MAX * 2) {
				console.warn(
					`[StructureGenerator] Cost exceeds target: $${estimatedCost.toFixed(4)} > $${this.TARGET_COST_MAX}`
				);
			}

			// Build structure with metadata
			const now = new Date().toISOString();
			const structure: DocumentStructure = {
				title: parsed.title,
				sections: parsed.sections,
				totalEstimatedWords: parsed.sections.reduce(
					(sum, s) => sum + s.estimatedWords,
					0
				),
				totalEstimatedMinutes: parsed.sections.reduce(
					(sum, s) => sum + s.estimatedMinutes,
					0
				),
				generatedAt: now,
				generationCost: estimatedCost,
			};

			// Validate structure
			this.validateStructure(structure);

			const result: StructureGenerationResult = {
				structure,
				usage: {
					promptTokens,
					completionTokens,
					totalTokens: promptTokens + completionTokens,
				},
				estimatedCost,
				provider: 'claude',
				cached: false,
				timestamp: now,
			};

			console.log('[StructureGenerator] Structure generation complete', {
				sections: structure.sections.length,
				totalWords: structure.totalEstimatedWords,
				totalMinutes: structure.totalEstimatedMinutes,
				cost: estimatedCost.toFixed(4),
				latency,
			});

			return result;
		} catch (error) {
			console.error('[StructureGenerator] Generation failed:', error);

			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				'Failed to generate document structure',
				'UNKNOWN_ERROR',
				{ outcome },
				error
			);
		}
	}

	/**
	 * Regenerate structure with user feedback
	 *
	 * Refines existing structure based on user feedback.
	 * Useful for iterative refinement without starting over.
	 *
	 * Algorithm:
	 * 1. Build regeneration prompt with previous structure + feedback
	 * 2. Call AI service
	 * 3. Parse and validate response
	 * 4. Return new structure with updated metadata
	 *
	 * @param outcome - Original outcome definition
	 * @param options - Regeneration options with feedback
	 * @returns Generation result with refined structure
	 * @throws OutcomeError if regeneration fails
	 *
	 * @example
	 * const refined = await generator.regenerateStructure(outcome, {
	 *   previousStructure: result.structure,
	 *   feedback: "Make sections shorter, add technical details section"
	 * });
	 */
	async regenerateStructure(
		outcome: OutcomeDefinition,
		options: StructureRegenerationOptions
	): Promise<StructureGenerationResult> {
		console.log('[StructureGenerator] Regenerating structure with feedback', {
			feedback: options.feedback,
			preserveCount: options.preserveSectionCount,
		});

		try {
			// Build regeneration prompt
			const prompt = this.buildRegenerationPrompt(outcome, options);

			// Call AI service
			const responseText = await (this.aiService as any).provider.makeClaudeRequest(
				prompt.system,
				prompt.user
			);

			// Parse response (same as generateStructure)
			const parsed = this.parseStructureResponse(responseText);

			// Calculate usage and cost
			const promptTokens = this.countTokens(prompt.system + prompt.user);
			const completionTokens = this.countTokens(responseText);
			const estimatedCost = this.calculateCost(
				promptTokens,
				completionTokens
			);

			// Build structure
			const now = new Date().toISOString();
			const structure: DocumentStructure = {
				title: parsed.title,
				sections: parsed.sections,
				totalEstimatedWords: parsed.sections.reduce(
					(sum, s) => sum + s.estimatedWords,
					0
				),
				totalEstimatedMinutes: parsed.sections.reduce(
					(sum, s) => sum + s.estimatedMinutes,
					0
				),
				generatedAt: now,
				generationCost: estimatedCost,
			};

			this.validateStructure(structure);

			return {
				structure,
				usage: {
					promptTokens,
					completionTokens,
					totalTokens: promptTokens + completionTokens,
				},
				estimatedCost,
				provider: 'claude',
				cached: false,
				timestamp: now,
			};
		} catch (error) {
			console.error('[StructureGenerator] Regeneration failed:', error);

			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				'Failed to regenerate structure',
				'UNKNOWN_ERROR',
				{ outcome, options },
				error
			);
		}
	}

	// ========================================================================
	// Private Helper Methods
	// ========================================================================

	/**
	 * Build AI prompt for structure generation
	 *
	 * Creates system and user prompts following Saligo Writing principles:
	 * - Low-energy writing prompts (specific, actionable)
	 * - Realistic estimates (based on section complexity)
	 * - Natural flow (intro → development → conclusion)
	 * - Language-specific output
	 *
	 * Prompt Strategy:
	 * - System: Methodology and output format constraints
	 * - User: Outcome context and specific requirements
	 *
	 * @param outcome - Outcome definition
	 * @returns System and user prompts
	 */
	private buildStructurePrompt(outcome: OutcomeDefinition): {
		system: string;
		user: string;
	} {
		// Map length preference to section/word targets
		const lengthTargets = this.getLengthTargets(
			outcome.lengthPreference || 'medium'
		);

		// Language-specific text
		const lang = this.language;
		const isKorean = lang === 'ko';

		// System prompt
		const system = isKorean
			? this.buildKoreanSystemPrompt()
			: this.buildEnglishSystemPrompt();

		// User prompt
		const user = `
${isKorean ? '결과물' : 'OUTCOME'}: ${outcome.description}
${isKorean ? '대상 독자' : 'AUDIENCE'}: ${outcome.audience || (isKorean ? '지정되지 않음' : 'Not specified')}
${isKorean ? '다룰 주제' : 'TOPICS'}: ${outcome.topics ? outcome.topics.join(', ') : (isKorean ? '지정되지 않음' : 'Not specified')}
${isKorean ? '길이' : 'LENGTH'}: ${outcome.lengthPreference || 'medium'} → ${lengthTargets.sections} ${isKorean ? '섹션' : 'sections'}, ${lengthTargets.words} ${isKorean ? '단어' : 'words'}
${outcome.documentType ? `${isKorean ? '문서 타입' : 'DOCUMENT TYPE'}: ${outcome.documentType}` : ''}

${isKorean ? '이제 이 결과물을 달성하기 위한 문서 구조를 JSON 형식으로 생성해주세요.' : 'Now generate the document structure in JSON format to achieve this outcome.'}
		`.trim();

		return { system, user };
	}

	/**
	 * Build Korean system prompt
	 */
	private buildKoreanSystemPrompt(): string {
		return `
당신은 Saligo Writing 방법론을 사용하여 작가가 구조화된 문서를 만들도록 돕는 도우미입니다.

요구사항:
1. 결과물을 달성하는 섹션들을 생성합니다
2. 각 섹션: 제목, 목적, 낮은 에너지 작성 프롬프트, 현실적인 추정치
3. 구조가 자연스럽게 흘러갑니다 (도입 → 전개 → 결론)
4. 프롬프트는 구체적이고 실행 가능해야 합니다
5. 섹션들이 서로를 기반으로 구축됩니다
6. 모든 텍스트는 한국어로 작성합니다

SALIGO 원칙:
- 관찰이나 질문으로 시작하기
- 작고 진실한 단계 허용하기
- 압도적인 지시 피하기
- 한 번에 한 가지 측면에 집중하기

출력 형식 (JSON):
{
  "title": "...",
  "sections": [
    {
      "id": "section-1",
      "title": "...",
      "purpose": "...",
      "estimatedWords": 200,
      "estimatedMinutes": 5,
      "writingPrompt": "...",
      "order": 1,
      "required": true,
      "status": "not-started"
    }
  ]
}

중요: 순수 JSON만 반환하고, 추가 설명이나 마크다운 코드 블록은 포함하지 마세요.
		`.trim();
	}

	/**
	 * Build English system prompt
	 */
	private buildEnglishSystemPrompt(): string {
		return `
You are helping a writer create a structured document using the Saligo Writing methodology.

REQUIREMENTS:
1. Create sections that achieve the outcome
2. Each section: title, purpose, low-energy writing prompt, realistic estimates
3. Structure flows naturally (intro → development → conclusion)
4. Prompts specific and actionable
5. Sections build on each other
6. Use English for all text

SALIGO PRINCIPLES:
- Start with observation or question
- Allow small, truthful steps
- Avoid overwhelming instructions
- Focus on one aspect at a time

OUTPUT FORMAT (JSON):
{
  "title": "...",
  "sections": [
    {
      "id": "section-1",
      "title": "...",
      "purpose": "...",
      "estimatedWords": 200,
      "estimatedMinutes": 5,
      "writingPrompt": "...",
      "order": 1,
      "required": true,
      "status": "not-started"
    }
  ]
}

IMPORTANT: Return only pure JSON, no additional explanation or markdown code blocks.
		`.trim();
	}

	/**
	 * Build regeneration prompt with feedback
	 *
	 * @param outcome - Original outcome
	 * @param options - Regeneration options
	 * @returns System and user prompts
	 */
	private buildRegenerationPrompt(
		outcome: OutcomeDefinition,
		options: StructureRegenerationOptions
	): { system: string; user: string } {
		const isKorean = this.language === 'ko';

		// Reuse base system prompt
		const system =
			this.language === 'ko'
				? this.buildKoreanSystemPrompt()
				: this.buildEnglishSystemPrompt();

		// Add previous structure and feedback to user prompt
		const user = `
${isKorean ? '결과물' : 'OUTCOME'}: ${outcome.description}

${isKorean ? '이전 구조' : 'PREVIOUS STRUCTURE'}:
${JSON.stringify(options.previousStructure, null, 2)}

${isKorean ? '사용자 피드백' : 'USER FEEDBACK'}: ${options.feedback}

${options.preserveSectionCount ? `${isKorean ? '섹션 수 유지' : 'PRESERVE SECTION COUNT'}: ${options.previousStructure.sections.length}` : ''}

${isKorean ? '피드백을 반영하여 개선된 구조를 JSON 형식으로 생성해주세요.' : 'Generate an improved structure incorporating the feedback in JSON format.'}
		`.trim();

		return { system, user };
	}

	/**
	 * Parse AI response into DocumentStructure
	 *
	 * Validates JSON structure and field types.
	 *
	 * @param responseText - AI response text
	 * @returns Parsed structure with sections
	 * @throws OutcomeError if parsing fails
	 */
	private parseStructureResponse(responseText: string): {
		title: string;
		sections: DocumentSection[];
	} {
		try {
			// Extract JSON from response (handle markdown code blocks)
			let jsonText = responseText.trim();

			// Remove markdown code block if present
			if (jsonText.startsWith('```json')) {
				jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
			} else if (jsonText.startsWith('```')) {
				jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
			}

			// Parse JSON
			const parsed = JSON.parse(jsonText);

			// Validate structure
			if (!parsed.title || typeof parsed.title !== 'string') {
				throw new Error('Missing or invalid title field');
			}

			if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
				throw new Error('Missing or empty sections array');
			}

			// Validate each section
			const sections: DocumentSection[] = parsed.sections.map(
				(section: any, index: number) => {
					// Required fields
					if (!section.title || typeof section.title !== 'string') {
						throw new Error(
							`Section ${index + 1}: Missing or invalid title`
						);
					}

					if (!section.purpose || typeof section.purpose !== 'string') {
						throw new Error(
							`Section ${index + 1}: Missing or invalid purpose`
						);
					}

					if (!section.writingPrompt || typeof section.writingPrompt !== 'string') {
						throw new Error(
							`Section ${index + 1}: Missing or invalid writingPrompt`
						);
					}

					if (
						typeof section.estimatedWords !== 'number' ||
						section.estimatedWords <= 0
					) {
						throw new Error(
							`Section ${index + 1}: Missing or invalid estimatedWords`
						);
					}

					if (
						typeof section.estimatedMinutes !== 'number' ||
						section.estimatedMinutes <= 0
					) {
						throw new Error(
							`Section ${index + 1}: Missing or invalid estimatedMinutes`
						);
					}

					// Build validated section
					return {
						id: section.id || `section-${index + 1}`,
						title: section.title,
						purpose: section.purpose,
						estimatedWords: section.estimatedWords,
						estimatedMinutes: section.estimatedMinutes,
						writingPrompt: section.writingPrompt,
						order: section.order || index + 1,
						required: section.required !== false, // Default to true
						status: section.status || 'not-started',
					};
				}
			);

			return {
				title: parsed.title,
				sections,
			};
		} catch (error) {
			console.error('[StructureGenerator] Failed to parse response:', error);

			throw new OutcomeError(
				'Failed to parse AI response into valid structure',
				'INVALID_STRUCTURE',
				{ responsePreview: responseText.substring(0, 200) },
				error
			);
		}
	}

	/**
	 * Validate generated structure
	 *
	 * Ensures structure meets quality constraints:
	 * - Section count within bounds (2-6)
	 * - Total time reasonable (10-90 minutes)
	 * - Each section has valid estimates
	 *
	 * @param structure - Structure to validate
	 * @throws OutcomeError if validation fails
	 */
	private validateStructure(structure: DocumentStructure): void {
		const errors: string[] = [];

		// Validate section count
		if (structure.sections.length < this.MIN_SECTIONS) {
			errors.push(
				`Too few sections: ${structure.sections.length} < ${this.MIN_SECTIONS}`
			);
		}

		if (structure.sections.length > this.MAX_SECTIONS) {
			errors.push(
				`Too many sections: ${structure.sections.length} > ${this.MAX_SECTIONS}`
			);
		}

		// Validate total time (10-90 minutes)
		if (structure.totalEstimatedMinutes < 10) {
			errors.push(
				`Total time too short: ${structure.totalEstimatedMinutes} minutes < 10 minutes`
			);
		}

		if (structure.totalEstimatedMinutes > 90) {
			errors.push(
				`Total time too long: ${structure.totalEstimatedMinutes} minutes > 90 minutes`
			);
		}

		// Validate each section
		structure.sections.forEach((section, index) => {
			// Section time should be reasonable (3-20 minutes)
			if (section.estimatedMinutes < 3) {
				errors.push(
					`Section ${index + 1} time too short: ${section.estimatedMinutes} minutes`
				);
			}

			if (section.estimatedMinutes > 20) {
				errors.push(
					`Section ${index + 1} time too long: ${section.estimatedMinutes} minutes`
				);
			}

			// Section words should be reasonable (100-1000 words)
			if (section.estimatedWords < 100) {
				errors.push(
					`Section ${index + 1} words too few: ${section.estimatedWords} words`
				);
			}

			if (section.estimatedWords > 1000) {
				errors.push(
					`Section ${index + 1} words too many: ${section.estimatedWords} words`
				);
			}
		});

		if (errors.length > 0) {
			throw new OutcomeError(
				'Generated structure failed validation',
				'INVALID_STRUCTURE',
				{ errors, structure }
			);
		}
	}

	/**
	 * Get length targets based on preference
	 *
	 * Maps length preference to section count and word count ranges.
	 *
	 * @param preference - Length preference
	 * @returns Section and word targets
	 */
	private getLengthTargets(preference: 'short' | 'medium' | 'long'): {
		sections: string;
		words: string;
	} {
		switch (preference) {
			case 'short':
				return { sections: '2-3', words: '500-800' };
			case 'medium':
				return { sections: '3-5', words: '1000-1500' };
			case 'long':
				return { sections: '4-6', words: '1500-2500' };
			default:
				return { sections: '3-5', words: '1000-1500' };
		}
	}

	/**
	 * Calculate cost from token usage
	 *
	 * Uses Claude Sonnet 4.5 pricing.
	 *
	 * @param promptTokens - Input tokens
	 * @param completionTokens - Output tokens
	 * @returns Cost in USD
	 */
	private calculateCost(
		promptTokens: number,
		completionTokens: number
	): number {
		const inputCost = (promptTokens / 1_000_000) * this.PRICING.input;
		const outputCost = (completionTokens / 1_000_000) * this.PRICING.output;
		return inputCost + outputCost;
	}

	/**
	 * Count tokens in text
	 *
	 * Approximation: 1 token ≈ 4 characters (for English/Korean)
	 * This is a rough estimate; actual tokenization is more complex.
	 *
	 * @param text - Text to count tokens for
	 * @returns Approximate token count
	 */
	private countTokens(text: string): number {
		// Simple approximation: 1 token ≈ 4 characters
		// Real implementation would use tiktoken or similar
		return Math.ceil(text.length / 4);
	}
}
