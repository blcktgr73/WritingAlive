/**
 * AI Prompt Templates for Saligo Writing
 *
 * Contains prompt templates for all AI operations based on Saligo Writing methodology.
 * Saligo Writing is inspired by Christopher Alexander's "The Nature of Order" and
 * developed by June Kim (김창준).
 *
 * Design Principles:
 * - Single Responsibility: Each function generates one type of prompt
 * - Open/Closed: Easy to add new prompt types without modifying existing ones
 * - Type Safety: All inputs validated, typed parameters
 *
 * Core Concepts:
 * - Centers: Strong, coherent ideas that naturally attract attention
 * - Wholeness: Structural quality and coherence of the document
 * - Generative Sequence: Step-by-step development process
 * - Bill Evans' Principle: "Don't approximate the whole vaguely. Take a small part and be entirely true about it."
 *
 * @see https://www.agile.or.kr/saligo-writing (Saligo Writing introduction)
 */

import type { Center } from './types';

/**
 * Saligo Writing context for all prompts
 *
 * This text is included in system prompts to provide context about the methodology.
 */
const SALIGO_CONTEXT = `You are an expert in Saligo Writing (살리고 글쓰기), a methodology inspired by Christopher Alexander's "The Nature of Order" and developed by June Kim (김창준).

Key concepts:
- Centers: Strong, coherent ideas that naturally attract attention and serve as focal points
- Wholeness: The structural quality that makes writing feel coherent and alive
- Generative Sequence: Development through small, structure-preserving transformations
- Bill Evans' Philosophy: "Don't approximate the whole vaguely. Take a small part and be entirely true about it."`;

/**
 * Generate prompt for finding centers in text
 *
 * Creates a prompt that asks Claude to identify "centers" - strong ideas
 * or phrases that could serve as focal points for further development.
 *
 * @param text - Text to analyze for centers
 * @param context - Optional surrounding context (±2 paragraphs)
 * @returns Formatted prompt object with system and user messages
 */
export function createFindCentersPrompt(
	text: string,
	context?: string
): { system: string; user: string } {
	const contextSection = context
		? `\n\nCONTEXT (surrounding paragraphs):\n${context}`
		: '';

	const userMessage = `TEXT TO ANALYZE:
${text}${contextSection}

INSTRUCTIONS:
1. Identify 2-5 centers (strong ideas or phrases)
2. For each center, provide:
   - The exact text (quote from the input)
   - Position in the text (character start/end)
   - Confidence (0.0-1.0)
   - Brief explanation of why this is a center

Return your response in JSON format:
{
  "centers": [
    {
      "text": "exact quote",
      "position": { "start": 0, "end": 20 },
      "confidence": 0.85,
      "explanation": "why this is a strong center"
    }
  ]
}`;

	return {
		system: SALIGO_CONTEXT,
		user: userMessage,
	};
}

/**
 * Generate prompt for suggesting expansions around a center
 *
 * Creates a prompt that asks Claude to suggest 3-5 ways the author
 * could expand or develop a given center.
 *
 * @param center - The center to expand around
 * @param context - Optional surrounding text for context
 * @returns Formatted prompt object with system and user messages
 */
export function createSuggestExpansionsPrompt(
	center: Center,
	context?: string
): { system: string; user: string } {
	const contextSection = context
		? `\n\nSURROUNDING TEXT:\n${context}`
		: '';

	const userMessage = `CENTER:
${center.text}

EXPLANATION:
${center.explanation || 'No explanation provided'}${contextSection}

INSTRUCTIONS:
Suggest 3-5 expansion prompts that:
1. Build on the center's strength
2. Maintain structural wholeness
3. Follow Bill Evans' principle: "Take a small part and be entirely true about it"

Return your response in JSON format:
{
  "expansions": [
    {
      "direction": "brief title (e.g., 'Explore Historical Context')",
      "prompt": "detailed prompt for the writer",
      "rationale": "why this expansion strengthens wholeness"
    }
  ]
}`;

	return {
		system: SALIGO_CONTEXT,
		user: userMessage,
	};
}

/**
 * Generate prompt for analyzing document wholeness
 *
 * Creates a prompt that asks Claude to evaluate the overall structural
 * coherence and "life" of a document.
 *
 * @param document - Full document text to analyze
 * @returns Formatted prompt object with system and user messages
 */
export function createAnalyzeWholenessPrompt(document: string): {
	system: string;
	user: string;
} {
	const userMessage = `DOCUMENT:
${document}

INSTRUCTIONS:
Evaluate the document on a scale of 1-10 for structural coherence and "life". Consider:
1. How well paragraphs connect to each other
2. Whether there's a clear center or multiple centers
3. Transition quality between ideas
4. Structural gaps or weak spots

Return your response in JSON format:
{
  "score": 7.5,
  "paragraphUnity": [
    { "paragraphIndex": 0, "unityScore": 0.8, "issue": "..." }
  ],
  "transitions": [
    { "from": 0, "to": 1, "strength": 0.7, "suggestion": "..." }
  ],
  "gaps": [
    { "after": 2, "description": "missing connection to...", "severity": "medium" }
  ],
  "suggestions": [
    "Consider developing the idea in paragraph 3...",
    "The transition from paragraph 1 to 2 could be smoother..."
  ]
}`;

	return {
		system: SALIGO_CONTEXT,
		user: userMessage,
	};
}

/**
 * Generate prompt for checking paragraph unity
 *
 * Creates a prompt that asks Claude to evaluate whether a paragraph
 * has a single clear focus and all sentences support that focus.
 *
 * @param paragraph - Paragraph text to analyze
 * @returns Formatted prompt object with system and user messages
 */
export function createCheckParagraphUnityPrompt(paragraph: string): {
	system: string;
	user: string;
} {
	const userMessage = `PARAGRAPH:
${paragraph}

INSTRUCTIONS:
Evaluate:
1. Does the paragraph have a single clear focus?
2. Do all sentences support that focus?
3. Is there a clear claim, evidence, or analysis structure?

Return your response in JSON format:
{
  "hasUnity": true,
  "score": 0.85,
  "mainIdea": "brief statement of the paragraph's main idea",
  "offTopicSentences": [
    { "sentence": "quote", "reason": "why it's off-topic" }
  ],
  "suggestions": [
    "Consider moving sentence 3 to a new paragraph about...",
    "The paragraph would be stronger if..."
  ],
  "label": "claim" | "evidence" | "analysis" | "transition" | "mixed"
}`;

	return {
		system: SALIGO_CONTEXT,
		user: userMessage,
	};
}

/**
 * Validate JSON response from Claude
 *
 * Utility function to safely parse and validate JSON responses.
 * Throws descriptive errors if parsing fails.
 *
 * @param jsonString - Raw JSON string from API response
 * @param expectedFields - Required top-level fields
 * @returns Parsed JSON object
 * @throws {Error} If JSON is invalid or missing required fields
 */
export function validateJsonResponse(
	jsonString: string,
	expectedFields: string[]
): Record<string, unknown> {
	let parsed: unknown;

	try {
		parsed = JSON.parse(jsonString);
	} catch (error) {
		throw new Error(
			`Invalid JSON response: ${error instanceof Error ? error.message : String(error)}`
		);
	}

	if (!parsed || typeof parsed !== 'object') {
		throw new Error('Invalid response: not a JSON object');
	}

	const obj = parsed as Record<string, unknown>;

	for (const field of expectedFields) {
		if (!(field in obj)) {
			throw new Error(`Invalid response: missing required field '${field}'`);
		}
	}

	return obj;
}
