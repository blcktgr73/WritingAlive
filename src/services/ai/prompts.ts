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

import type { Center, CenterFindingContext, MOCContext } from './types';
import type { SeedNote } from '../vault/types';

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
 * T-010: Generate prompt for finding centers from seed notes
 *
 * Creates a comprehensive prompt that asks Claude to identify structural centers
 * across multiple seed notes, based on Saligo Writing methodology.
 *
 * This differs from createFindCentersPrompt which analyzes existing prose.
 * This function analyzes scattered seed notes to find unifying themes.
 *
 * @param context - Complete center finding context with seeds and metadata
 * @returns Formatted prompt object with system and user messages
 */
export function createFindCentersFromSeedsPrompt(
	context: CenterFindingContext
): { system: string; user: string } {
	// Enhanced system prompt with T-010 specific methodology
	const systemPrompt = `You are a Saligo Writing expert. Saligo Writing (살리고 글쓰기) is a generative, iterative writing methodology developed by June Kim (김창준), inspired by Christopher Alexander's "The Nature of Order" and Bill Evans' practice philosophy.

CORE PRINCIPLES:

1. Start small and true: "Don't approximate the whole vaguely. Take a small part and be entirely true about it." (Bill Evans)

2. Centers: Identify structural pivots where writing has the most "life" and can expand naturally. Centers are not just topics - they are ideas with:
   - Cross-domain presence (appearing in multiple contexts)
   - Emotional resonance (user expressed strong feeling)
   - Concreteness (lived experience, not just abstract concepts)
   - Structural pivot potential (can expand in multiple directions)

3. Generative Sequence: Let structure emerge through writing, not predetermined outlines.

YOUR TASK: Analyze seed notes to identify 2-4 "centers" - structural themes with the strongest potential for development into coherent writing.`;

	// Format seeds for the prompt
	const seedsSections = context.seeds.map((seed, index) => {
		const photoNote = seed.hasPhoto
			? `\n📸 Photo: ${seed.photoCaption || 'No caption'}`
			: '';
		const backlinkNote = seed.backlinkCount > 0
			? `\n🔗 Backlinks: ${seed.backlinkCount}`
			: '';

		return `Seed ${index + 1}:
Title: ${seed.title}
Content: ${seed.content || '[No text content]'}
Tags: ${seed.tags.join(', ')}
Created: ${new Date(seed.createdAt).toLocaleDateString()}${photoNote}${backlinkNote}`;
	}).join('\n\n---\n\n');

	// Optional MOC context
	const mocSection = context.mocContext
		? `\n\nMOC CONTEXT:
MOC Title: ${context.mocContext.title}
Headings: ${context.mocContext.headings.join(' → ')}
`
		: '';

	const userMessage = `Here are my seed notes:

${seedsSections}${mocSection}

EVALUATION CRITERIA:

Identify centers using these criteria:
- **Cross-domain presence**: Does this idea appear across multiple contexts/seeds?
- **Emotional resonance**: Did I express strong feeling (keywords: "shocking", "amazing", "realized", "came easily")?
- **Concreteness**: Do I have lived experience, or is it just an abstract concept?
- **Structural pivot**: Can this idea expand in multiple directions?

STRENGTH RATINGS:
- **Strong** (⭐⭐⭐): Present in 3+ seeds + concrete experience + emotional resonance
- **Medium** (⭐⭐): Present in 2 seeds OR has one strong quality
- **Weak** (⭐): Mentioned once OR too abstract

RETURN JSON FORMAT:
{
  "centers": [
    {
      "name": "Center theme (short phrase, e.g., 'Completeness vs Approximation')",
      "explanation": "Why this is a center (2-3 sentences explaining cross-domain, emotional, concrete, structural pivot)",
      "strength": "strong" | "medium" | "weak",
      "connectedSeeds": ["seed-1", "seed-3"],
      "recommendation": "Why to start here (only for strongest center)",
      "assessment": {
        "crossDomain": true,
        "emotionalResonance": true,
        "hasConcrete": true,
        "structuralPivot": true
      }
    }
  ]
}

Identify 2-4 centers. Rank by strength (strongest first). Include recommendation only for the top center.

LANGUAGE INSTRUCTION:
Detect the primary language of the seed notes. If the seeds are primarily in Korean (한글), respond with center names and explanations in Korean. If the seeds are in English or mixed languages, respond in English.`;

	return {
		system: systemPrompt,
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

	console.log('[validateJsonResponse] Raw response length:', jsonString.length);
	console.log('[validateJsonResponse] Raw response (first 500 chars):', jsonString.substring(0, 500));

	// Extract JSON from response (Claude often wraps JSON in explanatory text)
	let cleanedJson = jsonString.trim();

	// Try to find JSON object boundaries
	const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
	if (jsonMatch) {
		cleanedJson = jsonMatch[0];
		console.log('[validateJsonResponse] Extracted JSON length:', cleanedJson.length);
		console.log('[validateJsonResponse] Extracted JSON (first 500 chars):', cleanedJson.substring(0, 500));
	} else {
		console.warn('[validateJsonResponse] No JSON object found in response');
	}

	try {
		parsed = JSON.parse(cleanedJson);
		console.log('[validateJsonResponse] Successfully parsed JSON');
	} catch (error) {
		console.error('[validateJsonResponse] First parse attempt failed:', error);
		// If extraction failed, try parsing the original string
		try {
			parsed = JSON.parse(jsonString);
			console.log('[validateJsonResponse] Successfully parsed original string');
		} catch (secondError) {
			console.error('[validateJsonResponse] Second parse attempt failed:', secondError);
			throw new Error(
				`Invalid JSON response: ${error instanceof Error ? error.message : String(error)}\nResponse preview: ${jsonString.substring(0, 200)}...`
			);
		}
	}

	if (!parsed || typeof parsed !== 'object') {
		console.error('[validateJsonResponse] Parsed value is not an object:', typeof parsed);
		throw new Error('Invalid response: not a JSON object');
	}

	const obj = parsed as Record<string, unknown>;

	console.log('[validateJsonResponse] Parsed object keys:', Object.keys(obj));

	for (const field of expectedFields) {
		if (!(field in obj)) {
			console.error(`[validateJsonResponse] Missing required field: ${field}`);
			throw new Error(`Invalid response: missing required field '${field}'`);
		}
	}

	console.log('[validateJsonResponse] Validation successful');
	return obj;
}

/**
 * Generate prompt for suggesting next steps (T-024)
 *
 * Analyzes current document and suggests 2-4 expansion directions
 * categorized by type (deepen, connect, question, contrast).
 *
 * @param content - Current document content
 * @param metadata - Optional document metadata from YAML frontmatter
 * @returns Formatted prompt object
 */
export function createSuggestNextStepsPrompt(
	content: string,
	metadata?: {
		gatheredSeeds?: string[];
		selectedCenter?: { name: string; explanation: string };
		keywords?: string[];
		previousWholeness?: number;
		wordCount?: number;
	}
): { system: string; user: string } {
	const system = `${SALIGO_CONTEXT}

Your task is to analyze a document and suggest next steps for expansion.

Focus on suggestions that:
1. **Enhance Wholeness**: Improve the document's structural coherence
2. **Preserve Truth**: Stay faithful to the writer's authentic voice
3. **Build Naturally**: Suggest organic growth from existing centers
4. **Enable Discovery**: Help the writer discover what they didn't know they wanted to say

Suggestion Categories:
- **Deepen**: Add concrete examples, case studies, or detailed analysis
- **Connect**: Link to related ideas, seeds, or external concepts
- **Question**: Pose provocative questions to explore further
- **Contrast**: Add contrasting perspectives or counterexamples

Return JSON only, no markdown formatting.`;

	const metadataSection = metadata
		? `

Document Metadata:
- Gathered Seeds: ${metadata.gatheredSeeds?.length || 0} seeds referenced
- Selected Center: ${metadata.selectedCenter?.name || 'None'}
${metadata.keywords ? `- Keywords: ${metadata.keywords.join(', ')}` : ''}
${metadata.previousWholeness ? `- Previous Wholeness Score: ${metadata.previousWholeness}/10` : ''}
${metadata.wordCount ? `- Current Word Count: ${metadata.wordCount} words` : ''}`
		: '';

	const user = `Analyze this document and suggest 2-4 expansion directions.

Current Document:
---
${content}
---
${metadataSection}

Provide suggestions in these categories (at least 2, maximum 4 total):
1. **Deepen**: Add concrete examples, case studies, detailed analysis, or specific scenarios
2. **Connect**: Link to related concepts, connect multiple ideas, or reference external sources
3. **Question**: Pose thought-provoking questions that invite deeper exploration
4. **Contrast**: Add contrasting perspectives, counterexamples, or opposing viewpoints

For each suggestion, provide:
- **type**: "deepen" | "connect" | "question" | "contrast"
- **direction**: Brief title (5-8 words max)
- **rationale**: Why this expansion improves wholeness (2-3 sentences)
- **contentHints**: 3-5 specific bullet points of what to add
- **strength**: "strong" | "medium" | "weak"
- **estimatedLength**: Number of words to add (realistic estimate)
- **relatedSeeds** (optional): Array of seed note titles if applicable

**CRITICAL: Wholeness Analysis**
Evaluate document wholeness using these specific criteria (1-10 scale for each):

1. **Structural Completeness** (structuralCompleteness):
   - Does it have clear introduction, body, and conclusion?
   - Are sections well-organized with logical flow?
   - Is the document "complete" or still a fragment?

2. **Thematic Coherence** (thematicCoherence):
   - Are main themes clearly identifiable?
   - Do ideas flow logically from one to another?
   - Is there a unified message or purpose?

3. **Internal Connections** (internalConnections):
   - Do ideas reference and build on previous points?
   - Are there clear relationships between sections?
   - Does the document feel integrated, not scattered?

4. **Depth vs Breadth Balance** (depthBreadthBalance):
   - Is depth appropriate (not too shallow, not too dense)?
   - Is scope appropriate (not too narrow, not too scattered)?
   - Are examples concrete and specific?

Calculate overall score as average of these four criteria.
${metadata?.previousWholeness ? `
IMPORTANT: Previous score was ${metadata.previousWholeness}/10.
- If document improved, explain what changed and increase score accordingly
- If document stayed similar, keep score similar (small variations like 7.0→7.2 are expected)
- Show score change clearly: "${metadata.previousWholeness} → X (+/-Y)" or "${metadata.previousWholeness} → ${metadata.previousWholeness} (no change)"
` : ''}

Also identify:
- **strengths**: 2-3 specific strengths of this document
- **improvements**: 2-3 specific areas that need improvement
- **keyThemes**: 3-5 main themes in the document

Return ONLY valid JSON (no markdown code blocks):
{
  "suggestions": [
    {
      "id": "suggestion-1",
      "type": "deepen",
      "direction": "Short title here",
      "rationale": "Why this matters...",
      "contentHints": ["Specific hint 1", "Specific hint 2", "Specific hint 3"],
      "strength": "strong",
      "estimatedLength": 250,
      "relatedSeeds": ["optional-seed-1"]
    }
  ],
  "wholenessAnalysis": {
    "score": 7,
    "previousScore": ${metadata?.previousWholeness || 'null'},
    "scoreChange": "${metadata?.previousWholeness ? `${metadata.previousWholeness} → 7 (+0)` : 'N/A'}",
    "breakdown": {
      "structuralCompleteness": 6,
      "thematicCoherence": 8,
      "internalConnections": 7,
      "depthBreadthBalance": 7
    },
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "currentWholeness": 7,
  "keyThemes": ["theme1", "theme2", "theme3"]
}`;

	return { system, user };
}

/**
 * Generate prompt for discovering centers from MOC
 *
 * Creates MOC-specific prompt that considers:
 * - User's existing MOC organization (headings, sections)
 * - Larger note count (10-30 vs 5-10 for seeds)
 * - Structural coherence across organized notes
 * - Cross-heading patterns and relationships
 *
 * Unlike findCentersFromSeeds (scattered notes), this emphasizes:
 * - Structural patterns within user's organization
 * - Cross-section themes
 * - Academic/professional writing contexts
 *
 * @param mocContext - MOC structure (title, headings, seed groupings)
 * @param seeds - All notes linked in MOC
 * @param options - Min/max centers to discover
 * @returns Formatted prompt object with system and user messages
 */
export function createDiscoverCentersFromMOCPrompt(
	mocContext: MOCContext,
	seeds: SeedNote[],
	language: 'en' | 'ko' = 'en',
	options?: {
		minCenters?: number;
		maxCenters?: number;
	}
): { system: string; user: string } {
	const minCenters = options?.minCenters || 2;
	const maxCenters = options?.maxCenters || 5;

	// Language instruction - must be strong and with examples
	const languageInstruction = language === 'ko'
		? `

CRITICAL LANGUAGE REQUIREMENT:
YOU MUST respond entirely in Korean (한국어). This is non-negotiable.
- Center names (name): Write in Korean only
- Explanations (explanation): Write in Korean only
- Expansion potentials (expansionPotential): Write in Korean only
- All text fields must be in Korean

Example of CORRECT Korean response:
{
  "name": "경험적 학습과 반성적 실천의 순환",
  "explanation": "이 센터는 구체적 경험에서 시작하여 반성적 성찰을 거쳐 새로운 이해로 발전하는 학습 과정을 다룹니다. 여러 노트에서 실천-성찰-개선의 순환 패턴이 반복적으로 나타납니다.",
  "expansionPotential": "실천 사례들을 시간순으로 정리하고, 각 사례에서 얻은 통찰을 연결하여 학습 이론으로 발전시킬 수 있습니다."
}

NEVER mix English and Korean. Use only Korean.`
		: `

CRITICAL LANGUAGE REQUIREMENT:
YOU MUST respond entirely in English. This is non-negotiable.
- Center names (name): Write in English only
- Explanations (explanation): Write in English only
- Expansion potentials (expansionPotential): Write in English only
- All text fields must be in English

Example of CORRECT English response:
{
  "name": "Cyclic Learning Through Experience and Reflection",
  "explanation": "This center addresses the learning process that starts from concrete experiences, goes through reflective contemplation, and evolves into new understanding. The practice-reflection-improvement cycle pattern appears repeatedly across multiple notes.",
  "expansionPotential": "Case studies can be organized chronologically, and insights from each case can be connected to develop into a learning theory."
}

NEVER mix Korean and English. Use only English.`;

	// Enhanced system prompt for MOC analysis
	const system = `You are a Saligo Writing expert. Saligo Writing (살리고 글쓰기) is a generative, iterative writing methodology developed by June Kim (김창준), inspired by Christopher Alexander's "The Nature of Order" and Bill Evans' practice philosophy.

CORE PRINCIPLES:

1. Start small and true: "Don't approximate the whole vaguely. Take a small part and be entirely true about it." (Bill Evans)

2. Centers: Identify structural pivots where writing has the most "life" and can expand naturally. Centers are not just topics - they are ideas with:
   - Cross-domain presence (appearing in multiple contexts)
   - Emotional resonance (expressed strong feeling or significance)
   - Concreteness (rooted in lived experience, not just abstract concepts)
   - Structural pivot potential (can expand in multiple directions)

3. Generative Sequence: Let structure emerge through writing, not predetermined outlines.

YOUR TASK: Analyze notes from a MOC (Map of Content) to identify ${minCenters}-${maxCenters} "centers" - structural themes with the strongest potential for development into coherent academic or professional writing.

MOC-SPECIFIC CONSIDERATIONS:
- The user has already organized these notes into a MOC, indicating perceived relationships
- Pay attention to patterns that span multiple sections/headings
- Look for structural coherence across the user's organization
- Consider both explicit connections (same heading) and implicit connections (cross-heading patterns)
- MOCs typically support academic writing (literature reviews, thesis chapters) or professional synthesis (reports, strategy docs)

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown code blocks):
{
  "centers": [
    {
      "name": "Center Name (5-10 words, concise)",
      "explanation": "Why this is a powerful center (2-3 sentences). Explain the structural pattern, cross-domain presence, and why it can generate strong writing.",
      "connectedSeeds": ["seed-title-1", "seed-title-2", ...],
      "strength": "strong" | "medium" | "weak",
      "assessmentCriteria": {
        "crossDomain": 9,
        "emotionalResonance": 7,
        "concreteness": 8,
        "structuralPivot": 9
      },
      "expansionPotential": "Brief description of how this center can expand (1-2 sentences)"
    }
  ]
}

ASSESSMENT CRITERIA (1-10 scale):
- crossDomain: How many different contexts/sections does this theme appear in?
- emotionalResonance: Does the user show strong interest or significance in this theme?
- concreteness: Is it grounded in specific examples, cases, or experiences (vs pure abstraction)?
- structuralPivot: Can this center serve as a foundation for multiple writing directions?

STRENGTH CLASSIFICATION:
- strong: 3+ connected seeds, all criteria ≥7, clear expansion potential
- medium: 2-3 connected seeds, most criteria ≥5, some expansion potential
- weak: <2 connected seeds, criteria mixed, limited expansion potential${languageInstruction}`;

	// Build user prompt with MOC context
	let user = `I have a MOC (Map of Content) titled "${mocContext.title}" with ${seeds.length} linked notes.`;

	// Add heading structure if present
	if (mocContext.headings.length > 0) {
		// Group seeds by heading for display
		const seedsByHeading = new Map<string, string[]>();
		for (const [seedId, heading] of Object.entries(mocContext.seedsFromHeading)) {
			if (!seedsByHeading.has(heading)) {
				seedsByHeading.set(heading, []);
			}
			// Find seed title by ID
			const seed = seeds.find((s) => s.file.basename === seedId);
			if (seed) {
				seedsByHeading.get(heading)!.push(seed.title);
			}
		}

		user += `\n\nMOC STRUCTURE:\n`;
		for (const heading of mocContext.headings) {
			const seedsInSection = seedsByHeading.get(heading) || [];
			if (seedsInSection.length > 0) {
				user += `\n## ${heading}\n`;
				user += `- ${seedsInSection.length} notes: ${seedsInSection.slice(0, 5).join(', ')}${seedsInSection.length > 5 ? ` (and ${seedsInSection.length - 5} more)` : ''}\n`;
			}
		}
	}

	// Add all seed contents
	user += `\n\n--- SEED NOTES CONTENT ---\n\n`;

	for (const seed of seeds) {
		user += `### [[${seed.title}]]\n`;

		// Add tags if present
		if (seed.tags && seed.tags.length > 0) {
			user += `Tags: ${seed.tags.map((t) => `#${t}`).join(' ')}\n`;
		}

		// Add content (truncate if very long)
		let content = seed.content;

		// Remove YAML frontmatter
		content = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

		// Truncate if longer than 800 words (~1000 tokens)
		const words = content.split(/\s+/).length;
		if (words > 800) {
			const truncated = content.split(/\s+/).slice(0, 800).join(' ');
			content = truncated + `\n[... content truncated, originally ${words} words ...]`;
		}

		user += `\n${content}\n\n---\n\n`;
	}

	user += `\n\nBased on the MOC structure and note contents above, identify ${minCenters}-${maxCenters} centers that:
1. Span multiple sections/notes (cross-domain presence)
2. Show structural coherence in the user's organization
3. Have strong potential for academic/professional writing development
4. Are grounded in concrete examples or experiences (not pure abstraction)

Return centers ordered by strength (strongest first).`;

	return { system, user };
}
