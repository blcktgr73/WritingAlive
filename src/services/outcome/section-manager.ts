/**
 * Section Manager Service
 *
 * Manages section progress tracking and state for outcome-driven writing.
 * Handles session state, section status updates, progress calculation,
 * and auto-save functionality.
 *
 * Architecture:
 * - Single Responsibility: Only handles section state and progress tracking
 * - Dependency Injection: Receives Vault via constructor
 * - Error Handling: Clear error messages with OutcomeError
 * - Separation of Concerns: Uses OutcomeManager for metadata operations
 *
 * Core Operations:
 * 1. getSessionState() - Retrieve current writing session state
 * 2. startSection() - Begin writing a section
 * 3. completeSection() - Mark section as completed
 * 4. autoSaveSection() - Auto-save section content
 * 5. calculateProgress() - Calculate overall progress percentage
 *
 * Design Principles (SOLID):
 * - Single Responsibility: Section state management only
 * - Open/Closed: Extensible through word counting strategy
 * - Liskov Substitution: Follows same interface pattern as OutcomeManager
 * - Interface Segregation: Small, focused public API
 * - Dependency Inversion: Depends on Vault abstraction
 *
 * Word Counting Strategy:
 * - Strips YAML frontmatter (--- ... ---)
 * - Removes markdown syntax (headers, bold, italic, links)
 * - Counts actual content words only
 * - Handles edge cases (empty content, only frontmatter)
 *
 * @see OutcomeManager for metadata persistence
 * @see DocumentSection for section structure
 * @see SectionProgress for progress metrics
 */

import type { TFile, Vault } from 'obsidian';
import { stringifyYaml } from 'obsidian';
import type {
	OutcomeDocumentMetadata,
	DocumentSection,
	SectionProgress,
} from './types';
import { OutcomeError } from './types';
import { OutcomeManager } from './outcome-manager';

/**
 * Writing Session State
 *
 * Current state of a writing session for outcome-driven document.
 * Includes all section states and overall progress.
 */
export interface WritingSessionState {
	/**
	 * Current section being worked on
	 * @nullable Null if no section active
	 */
	currentSection: DocumentSection | null;

	/**
	 * All sections in document
	 */
	sections: DocumentSection[];

	/**
	 * Overall progress metrics
	 */
	progress: SectionProgress;

	/**
	 * Full outcome metadata
	 */
	metadata: OutcomeDocumentMetadata;
}

/**
 * Section Manager
 *
 * Service for managing section state and progress in outcome-driven writing.
 */
export class SectionManager {
	/**
	 * Obsidian vault instance
	 */
	private readonly vault: Vault;

	/**
	 * Outcome manager for metadata operations
	 */
	private readonly outcomeManager: OutcomeManager;

	/**
	 * Constructor
	 *
	 * @param vault - Obsidian vault instance
	 */
	constructor(vault: Vault) {
		this.vault = vault;
		this.outcomeManager = new OutcomeManager(vault);
	}

	/**
	 * Get current writing session state
	 *
	 * Retrieves complete session state including current section,
	 * all sections, and progress metrics.
	 *
	 * Algorithm:
	 * 1. Read outcome metadata from document
	 * 2. Find current section by ID from progress
	 * 3. Return complete session state
	 *
	 * @param file - Outcome-driven document file
	 * @returns Session state or null if not outcome-driven
	 * @throws OutcomeError if metadata parsing fails
	 *
	 * @example
	 * const state = await sectionManager.getSessionState(file);
	 * if (state) {
	 *   console.log(`Working on: ${state.currentSection?.title}`);
	 *   console.log(`Progress: ${state.progress.completionPercentage}%`);
	 * }
	 */
	async getSessionState(file: TFile): Promise<WritingSessionState | null> {
		try {
			// Read outcome metadata
			const metadata = await this.outcomeManager.getOutcome(file);
			if (!metadata) {
				return null;
			}

			// Find current section
			const currentSection = metadata.progress.currentSectionId
				? metadata.structure.sections.find(
						(s) => s.id === metadata.progress.currentSectionId
					) || null
				: null;

			return {
				currentSection,
				sections: metadata.structure.sections,
				progress: metadata.progress,
				metadata,
			};
		} catch (error) {
			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				`Failed to get session state from file: ${file.path}`,
				'METADATA_PARSE_ERROR',
				{ filePath: file.path },
				error
			);
		}
	}

	/**
	 * Start writing a section
	 *
	 * Marks section as in-progress and updates session state.
	 * Sets startedAt timestamp and updates currentSectionId.
	 *
	 * Algorithm:
	 * 1. Read current metadata
	 * 2. Find and validate section
	 * 3. Update section status to 'in-progress'
	 * 4. Set startedAt timestamp
	 * 5. Update progress.currentSectionId
	 * 6. Write metadata back to file
	 *
	 * @param file - Outcome-driven document file
	 * @param sectionId - Section ID to start
	 * @throws OutcomeError if section not found or metadata update fails
	 *
	 * @example
	 * await sectionManager.startSection(file, "section-2");
	 * // Section 2 is now in-progress
	 */
	async startSection(file: TFile, sectionId: string): Promise<void> {
		try {
			// Read current metadata
			const metadata = await this.outcomeManager.getOutcome(file);
			if (!metadata) {
				throw new OutcomeError(
					'Document is not outcome-driven',
					'METADATA_PARSE_ERROR',
					{ filePath: file.path }
				);
			}

			// Find section
			const sectionIndex = metadata.structure.sections.findIndex(
				(s) => s.id === sectionId
			);

			if (sectionIndex === -1) {
				throw new OutcomeError(
					`Section not found: ${sectionId}`,
					'SECTION_NOT_FOUND',
					{ filePath: file.path, sectionId }
				);
			}

			// Update section status
			const section = metadata.structure.sections[sectionIndex];
			section.status = 'in-progress';
			section.startedAt = new Date().toISOString();

			// Update progress
			metadata.progress = {
				...metadata.progress,
				currentSectionId: sectionId,
				lastSavedAt: new Date().toISOString(),
			};

			// Write back to file (full metadata to persist section changes)
			await this.updateFullMetadata(file, metadata);
		} catch (error) {
			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				`Failed to start section: ${sectionId}`,
				'METADATA_WRITE_ERROR',
				{ filePath: file.path, sectionId },
				error
			);
		}
	}

	/**
	 * Complete a section
	 *
	 * Marks section as completed and updates progress metrics.
	 * Calculates actual words and time spent.
	 *
	 * Algorithm:
	 * 1. Read current metadata
	 * 2. Find and validate section
	 * 3. Update section status to 'completed'
	 * 4. Set completedAt timestamp
	 * 5. Count actual words in content
	 * 6. Calculate time spent (completedAt - startedAt)
	 * 7. Update overall progress metrics
	 * 8. Check if all sections completed
	 * 9. Write metadata back to file
	 *
	 * @param file - Outcome-driven document file
	 * @param sectionId - Section ID to complete
	 * @param content - Section content (Markdown)
	 * @throws OutcomeError if section not found or metadata update fails
	 *
	 * @example
	 * await sectionManager.completeSection(
	 *   file,
	 *   "section-2",
	 *   "## What Went Well\n\n1. Launched new API..."
	 * );
	 * // Section 2 is now completed with word count and time tracked
	 */
	async completeSection(
		file: TFile,
		sectionId: string,
		content: string
	): Promise<void> {
		try {
			// Read current metadata
			const metadata = await this.outcomeManager.getOutcome(file);
			if (!metadata) {
				throw new OutcomeError(
					'Document is not outcome-driven',
					'METADATA_PARSE_ERROR',
					{ filePath: file.path }
				);
			}

			// Find section
			const sectionIndex = metadata.structure.sections.findIndex(
				(s) => s.id === sectionId
			);

			if (sectionIndex === -1) {
				throw new OutcomeError(
					`Section not found: ${sectionId}`,
					'SECTION_NOT_FOUND',
					{ filePath: file.path, sectionId }
				);
			}

			const section = metadata.structure.sections[sectionIndex];
			const now = new Date();

			// Update section
			section.status = 'completed';
			section.completedAt = now.toISOString();
			section.content = content;
			section.actualWords = this.countWords(content);

			// Calculate time spent (if startedAt exists)
			if (section.startedAt) {
				const startTime = new Date(section.startedAt);
				const elapsedMs = now.getTime() - startTime.getTime();
				section.actualMinutes = Math.round(elapsedMs / 1000 / 60);
			}

			// Recalculate overall progress
			const completedSections = metadata.structure.sections.filter(
				(s) => s.status === 'completed'
			).length;

			const totalWords = metadata.structure.sections.reduce(
				(sum, s) => sum + (s.actualWords || 0),
				0
			);

			const totalTime = metadata.structure.sections.reduce(
				(sum, s) => sum + (s.actualMinutes || 0),
				0
			);

			// Calculate progress percentage based on updated metadata
			const totalEstimatedWords = metadata.structure.totalEstimatedWords;
			let completedWords = 0;
			for (const sec of metadata.structure.sections) {
				if (sec.status === 'completed') {
					completedWords += sec.estimatedWords;
				} else if (sec.status === 'in-progress') {
					const actualWords = sec.actualWords || 0;
					completedWords += Math.min(actualWords, sec.estimatedWords);
				}
			}
			const progressPercentage =
				totalEstimatedWords > 0
					? Math.round((completedWords / totalEstimatedWords) * 100)
					: 0;

			// Update progress
			metadata.progress = {
				...metadata.progress,
				currentSectionId:
					completedSections === metadata.structure.sections.length
						? null
						: metadata.progress.currentSectionId,
				completedSections,
				wordsWritten: totalWords,
				timeSpent: totalTime,
				completionPercentage: progressPercentage,
				lastSavedAt: now.toISOString(),
			};

			// If all sections completed, mark document as completed
			if (completedSections === metadata.structure.sections.length) {
				metadata.completedAt = now.toISOString();
			}

			// Write back to file (full metadata to persist section changes)
			await this.updateFullMetadata(file, metadata);
		} catch (error) {
			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				`Failed to complete section: ${sectionId}`,
				'METADATA_WRITE_ERROR',
				{ filePath: file.path, sectionId },
				error
			);
		}
	}

	/**
	 * Auto-save section content
	 *
	 * Saves section content and updates word count without completing section.
	 * Used for periodic auto-save (every 30 seconds).
	 *
	 * Algorithm:
	 * 1. Read current metadata
	 * 2. Find and validate section
	 * 3. Update section content and actualWords
	 * 4. Update progress.lastSavedAt
	 * 5. Update progress.wordsWritten (total)
	 * 6. Write metadata back to file
	 *
	 * @param file - Outcome-driven document file
	 * @param sectionId - Section ID to auto-save
	 * @param content - Current section content
	 * @throws OutcomeError if section not found or metadata update fails
	 *
	 * @example
	 * // Called every 30 seconds while user is writing
	 * await sectionManager.autoSaveSection(
	 *   file,
	 *   "section-2",
	 *   currentContent
	 * );
	 */
	async autoSaveSection(
		file: TFile,
		sectionId: string,
		content: string
	): Promise<void> {
		try {
			// Read current metadata
			const metadata = await this.outcomeManager.getOutcome(file);
			if (!metadata) {
				throw new OutcomeError(
					'Document is not outcome-driven',
					'METADATA_PARSE_ERROR',
					{ filePath: file.path }
				);
			}

			// Find section
			const sectionIndex = metadata.structure.sections.findIndex(
				(s) => s.id === sectionId
			);

			if (sectionIndex === -1) {
				throw new OutcomeError(
					`Section not found: ${sectionId}`,
					'SECTION_NOT_FOUND',
					{ filePath: file.path, sectionId }
				);
			}

			// Update section content and word count
			const section = metadata.structure.sections[sectionIndex];
			section.content = content;
			section.actualWords = this.countWords(content);

			// Recalculate total words
			const totalWords = metadata.structure.sections.reduce(
				(sum, s) => sum + (s.actualWords || 0),
				0
			);

			// Update progress
			metadata.progress = {
				...metadata.progress,
				wordsWritten: totalWords,
				lastSavedAt: new Date().toISOString(),
			};

			// Write back to file (full metadata to persist section changes)
			await this.updateFullMetadata(file, metadata);
		} catch (error) {
			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				`Failed to auto-save section: ${sectionId}`,
				'METADATA_WRITE_ERROR',
				{ filePath: file.path, sectionId },
				error
			);
		}
	}

	/**
	 * Calculate overall progress percentage
	 *
	 * Calculates completion percentage weighted by section word estimates.
	 * More accurate than simple section count (e.g., 2/4 sections ≠ 50%
	 * if sections have different word counts).
	 *
	 * Algorithm:
	 * 1. Read outcome metadata
	 * 2. For each section:
	 *    - If completed: weight = estimatedWords
	 *    - If in-progress: weight = actualWords (partial credit)
	 *    - If not-started: weight = 0
	 * 3. Calculate: (total weight / total estimated) * 100
	 * 4. Round to whole number (0-100)
	 *
	 * @param file - Outcome-driven document file
	 * @returns Progress percentage (0-100)
	 * @throws OutcomeError if metadata parsing fails
	 *
	 * @example
	 * const progress = await sectionManager.calculateProgress(file);
	 * console.log(`Progress: ${progress}%`); // "Progress: 67%"
	 */
	async calculateProgress(file: TFile): Promise<number> {
		try {
			// Read outcome metadata
			const metadata = await this.outcomeManager.getOutcome(file);
			if (!metadata) {
				throw new OutcomeError(
					'Document is not outcome-driven',
					'METADATA_PARSE_ERROR',
					{ filePath: file.path }
				);
			}

			const { sections } = metadata.structure;
			const totalEstimatedWords = metadata.structure.totalEstimatedWords;

			// Calculate weighted progress
			let completedWords = 0;

			for (const section of sections) {
				if (section.status === 'completed') {
					// Full credit for completed sections
					completedWords += section.estimatedWords;
				} else if (section.status === 'in-progress') {
					// Partial credit for in-progress sections
					// Use actual words, but cap at estimated words
					const actualWords = section.actualWords || 0;
					completedWords += Math.min(
						actualWords,
						section.estimatedWords
					);
				}
				// not-started sections contribute 0
			}

			// Calculate percentage
			const percentage =
				totalEstimatedWords > 0
					? (completedWords / totalEstimatedWords) * 100
					: 0;

			// Round to whole number, ensure 0-100 range
			return Math.max(0, Math.min(100, Math.round(percentage)));
		} catch (error) {
			if (error instanceof OutcomeError) {
				throw error;
			}

			throw new OutcomeError(
				`Failed to calculate progress for file: ${file.path}`,
				'METADATA_PARSE_ERROR',
				{ filePath: file.path },
				error
			);
		}
	}

	/**
	 * Update full outcome metadata
	 *
	 * Writes complete outcome metadata back to file frontmatter.
	 * This includes structure, sections, and progress updates.
	 *
	 * @param file - Document file
	 * @param metadata - Complete updated metadata
	 */
	private async updateFullMetadata(
		file: TFile,
		metadata: OutcomeDocumentMetadata
	): Promise<void> {
		// Read current content
		const content = await this.vault.read(file);

		// Split frontmatter and body
		const { body } = this.splitContent(content);

		// Create new frontmatter
		const frontmatter = {
			title: metadata.structure.title,
			...metadata,
		};

		// Reconstruct content
		const newContent = `---\n${stringifyYaml(frontmatter).trim()}\n---\n\n${body}`;

		// Write back
		await this.vault.modify(file, newContent);
	}

	/**
	 * Split content into frontmatter and body
	 *
	 * @param content - File content
	 * @returns Frontmatter and body
	 */
	private splitContent(content: string): {
		frontmatter: string | null;
		body: string;
	} {
		const frontmatter = this.extractFrontmatter(content);

		if (!frontmatter) {
			return { frontmatter: null, body: content };
		}

		// Body is everything after closing ---
		const endIndex = content.indexOf('\n---\n', 4);
		const body = content.substring(endIndex + 5); // +5 to skip \n---\n

		return { frontmatter, body };
	}

	/**
	 * Extract frontmatter from content
	 *
	 * @param content - File content
	 * @returns Frontmatter text (without ---) or null if no frontmatter
	 */
	private extractFrontmatter(content: string): string | null {
		// Frontmatter must start at beginning of file
		if (!content.startsWith('---\n')) {
			return null;
		}

		// Find end of frontmatter
		const endIndex = content.indexOf('\n---\n', 4);

		if (endIndex === -1) {
			return null;
		}

		// Extract frontmatter (without opening/closing ---)
		return content.substring(4, endIndex);
	}

	/**
	 * Count words in content
	 *
	 * Counts actual content words, excluding:
	 * - YAML frontmatter (--- ... ---)
	 * - Markdown headers (# ## ###)
	 * - Markdown formatting (** __ * _ ~~)
	 * - Links and images ([text](url) ![alt](url))
	 * - Code blocks (``` ```)
	 * - HTML tags (<tag>)
	 *
	 * Algorithm:
	 * 1. Strip YAML frontmatter
	 * 2. Remove code blocks
	 * 3. Remove links/images
	 * 4. Remove markdown formatting
	 * 5. Remove HTML tags
	 * 6. Split on whitespace
	 * 7. Count non-empty words
	 *
	 * Edge Cases:
	 * - Empty content → 0 words
	 * - Only frontmatter → 0 words
	 * - Only whitespace → 0 words
	 *
	 * @param content - Markdown content
	 * @returns Word count
	 *
	 * @example
	 * countWords("# Title\n\nHello **world**!")
	 * // Returns: 2 (only "Hello" and "world")
	 */
	private countWords(content: string): number {
		if (!content || content.trim().length === 0) {
			return 0;
		}

		let text = content;

		// 1. Strip YAML frontmatter (must be at start)
		// Match: ---\n...\n---\n at start of file
		text = text.replace(/^---\n[\s\S]*?\n---\n+/, '');

		// 2. Remove code blocks (``` ... ```)
		text = text.replace(/```[\s\S]*?```/g, '');

		// 3. Remove inline code (` ... `)
		text = text.replace(/`[^`]*`/g, '');

		// 4. Remove images (![alt](url))
		text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

		// 5. Remove links ([text](url)) - keep link text
		text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

		// 6. Remove HTML tags (<tag>)
		text = text.replace(/<[^>]*>/g, '');

		// 7. Remove horizontal rules (---, ***, ___)
		text = text.replace(/^[-*_]{3,}$/gm, '');

		// 8. Remove markdown list markers (-, *, +, 1.) BEFORE removing formatting
		text = text.replace(/^[\s]*[-*+]\s+/gm, '');
		text = text.replace(/^[\s]*\d+\.\s+/gm, '');

		// 9. Remove markdown headers (#, ##, ###) - just remove the markers, keep text
		text = text.replace(/^#{1,6}\s+/gm, '');

		// 10. Remove markdown formatting (**, __, *, _, ~~)
		// Do this carefully to avoid issues with list markers
		text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold **
		text = text.replace(/__(.*?)__/g, '$1'); // Bold __
		text = text.replace(/~~(.*?)~~/g, '$1'); // Strikethrough
		text = text.replace(/\*(.*?)\*/g, '$1'); // Italic *
		text = text.replace(/_(.*?)_/g, '$1'); // Italic _

		// 11. Split on whitespace and count non-empty words
		const words = text
			.split(/\s+/)
			.filter((word) => word.trim().length > 0);

		return words.length;
	}
}
