/**
 * MOC Center Finder Service
 *
 * Orchestrates the workflow of discovering structural centers from MOC files.
 * Bridges MOC detection, content extraction, and AI-powered center discovery.
 *
 * Design Principles:
 * - Single Responsibility: Only handles MOC → Centers workflow orchestration
 * - Dependency Inversion: Depends on abstractions (MOCDetector, AIService)
 * - Open/Closed: Easy to extend with new validation rules or analysis strategies
 *
 * Workflow:
 * 1. Validate MOC (size, content, warnings)
 * 2. Extract linked notes from MOC structure
 * 3. Read note contents (parallel for performance)
 * 4. Build MOC context (title, headings, seed groupings)
 * 5. Call AI service for center discovery
 * 6. Return results with MOC attribution
 *
 * Performance Targets:
 * - 10-20 notes: <8 seconds end-to-end
 * - 20-30 notes: <12 seconds end-to-end
 * - P95: <10 seconds for typical MOCs
 *
 * Cost Targets:
 * - Average: $0.020-0.025 per analysis
 * - Maximum: $0.035 for 30-note MOCs
 */

import type { App, TFile } from 'obsidian';
import type { MOCDetector } from '../vault/moc-detector';
import type { AIService } from '../ai/ai-service';
import type { SeedNote, MOCNote } from '../vault/types';
import type { DiscoveredCenter, MOCContext } from '../ai/types';
import { AIServiceError } from '../ai/types';

/**
 * MOC Validation Result
 *
 * Results of validating MOC before analysis.
 * Provides warnings for suboptimal MOCs but allows proceeding.
 */
export interface MOCValidationResult {
	/**
	 * Whether MOC is valid for analysis
	 * - true: Can proceed (with or without warnings)
	 * - false: Cannot proceed (fatal error)
	 */
	valid: boolean;

	/**
	 * Validation warnings (non-fatal)
	 * User can proceed but should be aware of potential quality issues
	 */
	warnings: ValidationWarning[];

	/**
	 * Estimated cost for analysis (USD)
	 * Based on note count and average note length
	 */
	estimatedCost: number;

	/**
	 * Estimated analysis time (seconds)
	 */
	estimatedTime: number;

	/**
	 * Note count breakdown
	 */
	noteCount: {
		total: number;
		readable: number; // Notes that exist and can be read
		broken: number; // Broken links
	};
}

/**
 * Validation Warning
 *
 * Non-fatal issue with MOC that may affect center quality.
 */
export interface ValidationWarning {
	/**
	 * Warning severity
	 * - low: Minor issue, likely no impact
	 * - medium: May affect quality, user should be aware
	 * - high: Likely to produce weak centers, recommend action
	 */
	severity: 'low' | 'medium' | 'high';

	/**
	 * Warning type (for categorization)
	 */
	type:
		| 'too_few_notes'
		| 'too_many_notes'
		| 'broken_links'
		| 'short_notes'
		| 'heterogeneous_content'
		| 'no_structure';

	/**
	 * Human-readable warning message
	 */
	message: string;

	/**
	 * Suggested action (optional)
	 */
	suggestion?: string;
}

/**
 * MOC Center Finder Result
 *
 * Results of center discovery from MOC with full attribution and metrics.
 */
export interface MOCCenterFinderResult {
	/**
	 * Discovered centers (2-5 typical)
	 */
	centers: DiscoveredCenter[];

	/**
	 * Source MOC information (for attribution)
	 */
	sourceMOC: {
		title: string;
		path: string;
		noteCount: number;
	};

	/**
	 * Coverage metrics
	 * Shows how many notes are connected to at least one center
	 */
	coverage: {
		connectedNotes: number; // Notes connected to any center
		totalNotes: number; // Total notes analyzed
		percentage: number; // Coverage percentage (0-100)
	};

	/**
	 * All seed notes analyzed (for document creation)
	 */
	seeds: SeedNote[];

	/**
	 * MOC context used for analysis
	 */
	context: MOCContext;

	/**
	 * AI usage statistics
	 */
	usage: {
		totalTokens: number;
		promptTokens: number;
		completionTokens: number;
	};

	/**
	 * Actual cost (USD)
	 */
	estimatedCost: number;

	/**
	 * Analysis duration (milliseconds)
	 */
	duration: number;
}

/**
 * MOC Center Finder Service
 *
 * Main orchestrator for MOC → Centers workflow.
 */
export class MOCCenterFinder {
	/**
	 * Cost estimation constants (Claude 3.5 Sonnet pricing)
	 * As of 2024-11: $3/1M input tokens, $15/1M output tokens
	 */
	private readonly COST_PER_1K_INPUT_TOKENS = 0.003;
	private readonly COST_PER_1K_OUTPUT_TOKENS = 0.015;

	/**
	 * Average tokens per note (for cost estimation)
	 * Based on typical note length: ~500 words = ~650 tokens
	 */
	private readonly AVG_TOKENS_PER_NOTE = 650;

	/**
	 * System prompt overhead (tokens)
	 */
	private readonly SYSTEM_PROMPT_TOKENS = 500;

	/**
	 * Average output tokens (center discovery)
	 */
	private readonly AVG_OUTPUT_TOKENS = 800;

	constructor(
		private app: App,
		private mocDetector: MOCDetector,
		private aiService: AIService
	) {}

	/**
	 * Validate MOC before analysis
	 *
	 * Checks:
	 * - Note count (optimal: 10-25, max: 30)
	 * - Broken links
	 * - Note content length
	 * - Estimated cost and time
	 *
	 * Returns validation result with warnings but allows proceeding
	 * unless fatal error (e.g., no readable notes).
	 *
	 * @param mocFile - MOC file to validate
	 * @returns Validation result with warnings and estimates
	 */
	async validateMOC(mocFile: TFile): Promise<MOCValidationResult> {
		const warnings: ValidationWarning[] = [];

		// Parse MOC structure
		const moc = await this.mocDetector.parseMOC(mocFile);

		// Count readable vs broken links
		let readableCount = 0;
		let brokenCount = 0;

		for (const link of moc.links) {
			const linkedFile = this.app.metadataCache.getFirstLinkpathDest(
				link.path,
				mocFile.path
			);

			if (linkedFile) {
				readableCount++;
			} else {
				brokenCount++;
			}
		}

		const totalCount = readableCount + brokenCount;

		// Warning: Too few notes
		if (readableCount < 5) {
			warnings.push({
				severity: 'high',
				type: 'too_few_notes',
				message: `MOC has only ${readableCount} readable notes. Centers may be weak with fewer than 5 notes.`,
				suggestion: 'Add more related notes to your MOC for stronger center discovery.',
			});
		} else if (readableCount < 10) {
			warnings.push({
				severity: 'medium',
				type: 'too_few_notes',
				message: `MOC has ${readableCount} readable notes. Optimal range is 10-25 notes.`,
				suggestion: 'Consider adding a few more related notes for better results.',
			});
		}

		// Warning: Too many notes
		if (readableCount > 30) {
			warnings.push({
				severity: 'high',
				type: 'too_many_notes',
				message: `MOC has ${readableCount} notes. Analysis may be slow and expensive (>$0.035).`,
				suggestion:
					'Consider splitting into multiple MOCs or using section-based analysis (future feature).',
			});
		} else if (readableCount > 25) {
			warnings.push({
				severity: 'medium',
				type: 'too_many_notes',
				message: `MOC has ${readableCount} notes. This is near the upper limit (30).`,
				suggestion: 'Analysis will take 10-12 seconds and cost ~$0.030.',
			});
		}

		// Warning: Broken links
		if (brokenCount > 0) {
			const percentage = Math.round((brokenCount / totalCount) * 100);
			const severity = percentage > 30 ? 'high' : percentage > 10 ? 'medium' : 'low';

			warnings.push({
				severity,
				type: 'broken_links',
				message: `${brokenCount} of ${totalCount} links are broken (${percentage}%).`,
				suggestion:
					brokenCount > 5
						? 'Fix broken links or remove them from MOC before analysis.'
						: 'Broken links will be skipped during analysis.',
			});
		}

		// Warning: No headings (flat structure)
		if (moc.headings.length === 0 && readableCount > 10) {
			warnings.push({
				severity: 'low',
				type: 'no_structure',
				message: 'MOC has no headings. Structural organization helps center discovery.',
				suggestion:
					'Consider organizing notes under headings (e.g., "Theory", "Practice", "Examples").',
			});
		}

		// Estimate cost and time
		const estimatedInputTokens =
			this.SYSTEM_PROMPT_TOKENS + readableCount * this.AVG_TOKENS_PER_NOTE;
		const estimatedOutputTokens = this.AVG_OUTPUT_TOKENS;
		const estimatedCost =
			(estimatedInputTokens / 1000) * this.COST_PER_1K_INPUT_TOKENS +
			(estimatedOutputTokens / 1000) * this.COST_PER_1K_OUTPUT_TOKENS;

		// Estimate time (based on API latency + note reading)
		// Reading notes: ~50ms per note
		// AI analysis: ~3-5 seconds
		const estimatedTime = Math.ceil(readableCount * 0.05 + 4);

		// Validation fails only if no readable notes
		const valid = readableCount > 0;

		if (!valid) {
			warnings.push({
				severity: 'high',
				type: 'too_few_notes',
				message: 'MOC has no readable notes. Cannot proceed with analysis.',
				suggestion: 'Fix broken links or add valid note links to MOC.',
			});
		}

		return {
			valid,
			warnings,
			estimatedCost: Math.round(estimatedCost * 10000) / 10000, // Round to 4 decimals
			estimatedTime,
			noteCount: {
				total: totalCount,
				readable: readableCount,
				broken: brokenCount,
			},
		};
	}

	/**
	 * Find centers from MOC
	 *
	 * Main workflow:
	 * 1. Parse MOC structure
	 * 2. Extract and read linked notes
	 * 3. Build MOC context
	 * 4. Call AI service for center discovery
	 * 5. Calculate coverage metrics
	 * 6. Return results with full attribution
	 *
	 * @param mocFile - MOC file to analyze
	 * @param options - Analysis options (min/max centers)
	 * @returns Center discovery results with MOC attribution
	 * @throws Error if MOC parsing fails or AI service unavailable
	 */
	async findCentersFromMOC(
		mocFile: TFile,
		options?: {
			minCenters?: number;
			maxCenters?: number;
		}
	): Promise<MOCCenterFinderResult> {
		const startTime = Date.now();

		try {
			// Step 1: Parse MOC structure
			const moc = await this.mocDetector.parseMOC(mocFile);

			if (!moc || !moc.links || moc.links.length === 0) {
				throw new AIServiceError(
					`MOC "${mocFile.basename}" has no links. A MOC must contain links to other notes.`,
					'INVALID_MOC'
				);
			}

			// Step 2: Extract linked notes and read contents
			const seeds = await this.extractSeedsFromMOC(moc);

			if (seeds.length === 0) {
				throw new AIServiceError(
					'No readable notes found in MOC. All links may be broken or pointing to non-markdown files.',
					'MOC_NO_VALID_NOTES'
				);
			}

			if (seeds.length < 5) {
				throw new AIServiceError(
					`MOC has only ${seeds.length} readable notes. At least 5 notes are required for meaningful center discovery.`,
					'MOC_TOO_SMALL'
				);
			}

			if (seeds.length > 50) {
				throw new AIServiceError(
					`MOC has ${seeds.length} notes, which exceeds the maximum of 50. Consider splitting into multiple MOCs.`,
					'MOC_TOO_LARGE'
				);
			}

			// Warning for large MOCs (30-50 notes) but allow processing
			if (seeds.length > 30) {
				console.warn(`[MOCCenterFinder] Large MOC with ${seeds.length} notes. Analysis may take longer and cost more (~$${this.estimateCostForNotes(seeds.length).toFixed(4)}).`);
			}

			// Step 3: Build MOC context
			const context = this.buildMOCContext(moc, seeds);

			// Step 4: Call AI service for center discovery
			const aiResult = await this.aiService.discoverCentersFromMOC(
				context,
				seeds,
				options
			);

			// Step 5: Calculate coverage metrics
			const coverage = this.calculateCoverage(seeds, aiResult.centers);

			// Step 6: Build final result
			const duration = Date.now() - startTime;

			return {
				centers: aiResult.centers,
				sourceMOC: {
					title: moc.title,
					path: moc.path,
					noteCount: seeds.length,
				},
				coverage,
				seeds,
				context,
				usage: aiResult.usage,
				estimatedCost: aiResult.estimatedCost,
				duration,
			};
		} catch (error) {
			// Re-throw AIServiceError as-is
			if (error instanceof AIServiceError) {
				throw error;
			}

			// Wrap other errors
			const message = error instanceof Error ? error.message : 'Unknown error during MOC analysis';
			throw new AIServiceError(
				`Failed to analyze MOC "${mocFile.basename}": ${message}`,
				'PROVIDER_ERROR',
				'claude',
				error
			);
		}
	}

	/**
	 * Extract seed notes from MOC links
	 *
	 * Reads content of all linked notes in parallel for performance.
	 * Skips broken links and non-markdown files.
	 *
	 * @param moc - Parsed MOC structure
	 * @returns Array of seed notes with full content
	 */
	private async extractSeedsFromMOC(moc: MOCNote): Promise<SeedNote[]> {
		const seeds: SeedNote[] = [];

		// Read all linked notes in parallel
		const readPromises = moc.links.map(async (link) => {
			const linkedFile = this.app.metadataCache.getFirstLinkpathDest(
				link.path,
				moc.path
			);

			if (!linkedFile || linkedFile.extension !== 'md') {
				return null;
			}

			try {
				const content = await this.app.vault.read(linkedFile);
				const metadata = this.app.metadataCache.getFileCache(linkedFile);

				// Extract tags (from frontmatter and inline)
				const tags: string[] = [];
				if (metadata?.frontmatter?.tags) {
					const fmTags = metadata.frontmatter.tags;
					if (Array.isArray(fmTags)) {
						tags.push(...fmTags.map((t: string) => t.toLowerCase()));
					} else if (typeof fmTags === 'string') {
						tags.push(fmTags.toLowerCase());
					}
				}
				if (metadata?.tags) {
					tags.push(
						...metadata.tags.map((t) => t.tag.replace('#', '').toLowerCase())
					);
				}

				// Extract backlinks (getBacklinksForFile might not exist in all Obsidian versions)
				const backlinks: any = (this.app.metadataCache as any).getBacklinksForFile?.(linkedFile);
				const backlinkPaths = backlinks ? Object.keys(backlinks.data || {}) : [];

				// Create excerpt (first 150 chars, remove frontmatter/headers)
				const excerpt = this.createExcerpt(content);

				const seed: SeedNote = {
					file: linkedFile,
					title: linkedFile.basename,
					content,
					excerpt,
					tags: [...new Set(tags)], // Deduplicate
					createdAt: linkedFile.stat.ctime,
					modifiedAt: linkedFile.stat.mtime,
					backlinks: backlinkPaths,
					path: linkedFile.path,
				};

				return seed;
			} catch (error) {
				console.error(`[MOCCenterFinder] Failed to read ${linkedFile.path}:`, error);
				return null;
			}
		});

		const results = await Promise.all(readPromises);

		// Filter out null results (broken links, read errors)
		for (const seed of results) {
			if (seed) {
				seeds.push(seed);
			}
		}

		return seeds;
	}

	/**
	 * Build MOC context for AI analysis
	 *
	 * Structures MOC information for AI prompt:
	 * - Title (for semantic context)
	 * - Headings (user's organizational structure)
	 * - Seeds grouped by heading (hierarchical relationships)
	 *
	 * @param moc - Parsed MOC structure
	 * @param seeds - Extracted seed notes
	 * @returns Structured MOC context
	 */
	private buildMOCContext(moc: MOCNote, seeds: SeedNote[]): MOCContext {
		// Build map: seed ID → heading it appears under
		const seedsFromHeading: Record<string, string> = {};

		// Map each seed to its parent heading in MOC
		for (const link of moc.links) {
			// Match seed by path (remove .md extension for comparison)
			const linkPathWithoutExt = link.path.replace(/\.md$/, '');
			const seed = seeds.find((s) => {
				const seedPathWithoutExt = s.path.replace(/\.md$/, '');
				return seedPathWithoutExt === linkPathWithoutExt || s.title === link.displayText;
			});
			if (!seed) continue;

			const heading = link.heading || '(root)';
			// Map seed ID to heading
			seedsFromHeading[seed.file.basename] = heading;
		}

		return {
			title: moc.title,
			headings: moc.headings.map((h) => h.text),
			seedsFromHeading,
		};
	}

	/**
	 * Calculate coverage metrics
	 *
	 * Coverage = percentage of notes connected to at least one center.
	 * High coverage (>70%) indicates strong centers that unify most notes.
	 * Low coverage (<50%) indicates weak centers or heterogeneous MOC.
	 *
	 * @param seeds - All analyzed seeds
	 * @param centers - Discovered centers
	 * @returns Coverage metrics
	 */
	private calculateCoverage(
		seeds: SeedNote[],
		centers: DiscoveredCenter[]
	): {
		connectedNotes: number;
		totalNotes: number;
		percentage: number;
	} {
		// Collect all seed titles that are connected to any center
		const connectedSeedTitles = new Set<string>();

		for (const center of centers) {
			for (const seedTitle of center.connectedSeeds) {
				connectedSeedTitles.add(seedTitle);
			}
		}

		const connectedNotes = connectedSeedTitles.size;
		const totalNotes = seeds.length;
		const percentage = totalNotes > 0 ? Math.round((connectedNotes / totalNotes) * 100) : 0;

		return {
			connectedNotes,
			totalNotes,
			percentage,
		};
	}

	/**
	 * Estimate cost for analyzing a given number of notes
	 *
	 * Uses Claude 3.5 Sonnet pricing and average token counts.
	 *
	 * @param noteCount - Number of notes to analyze
	 * @returns Estimated cost in USD
	 */
	private estimateCostForNotes(noteCount: number): number {
		const inputTokens = noteCount * this.AVG_TOKENS_PER_NOTE + this.SYSTEM_PROMPT_TOKENS;
		const outputTokens = this.AVG_OUTPUT_TOKENS;

		const inputCost = (inputTokens / 1000) * this.COST_PER_1K_INPUT_TOKENS;
		const outputCost = (outputTokens / 1000) * this.COST_PER_1K_OUTPUT_TOKENS;

		return inputCost + outputCost;
	}

	/**
	 * Create excerpt from note content
	 *
	 * Removes:
	 * - YAML frontmatter
	 * - Headings
	 * - Links
	 * - Tags
	 *
	 * Takes first 150 characters of cleaned content.
	 *
	 * @param content - Full note content
	 * @returns Cleaned excerpt (max 150 chars)
	 */
	private createExcerpt(content: string): string {
		let cleaned = content;

		// Remove YAML frontmatter
		cleaned = cleaned.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

		// Remove headings
		cleaned = cleaned.replace(/^#+\s+.+$/gm, '');

		// Remove links
		cleaned = cleaned.replace(/\[\[([^\]]+)\]\]/g, '$1');
		cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

		// Remove tags
		cleaned = cleaned.replace(/#\w+/g, '');

		// Trim and take first 150 chars
		cleaned = cleaned.trim();
		if (cleaned.length > 150) {
			cleaned = cleaned.substring(0, 147) + '...';
		}

		return cleaned;
	}
}
