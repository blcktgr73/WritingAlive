/**
 * Document Creator Service
 *
 * Responsible for creating new notes from AI-discovered centers.
 * Part of T-011: Center Discovery Modal feature.
 *
 * Design Principles:
 * - Single Responsibility: Only handles note creation from centers
 * - Dependency Inversion: Depends on Obsidian App abstraction
 * - Open/Closed: Extensible through CreateNoteOptions
 * - Clean Separation: Frontmatter, content, and file operations separated
 *
 * Core Operations:
 * 1. Generate YAML frontmatter with center metadata
 * 2. Generate initial content with center explanation and prompts
 * 3. Create file in vault with timestamp
 * 4. Open file in editor
 * 5. Position cursor at writing prompt (TODO)
 *
 * Output Format:
 * ```markdown
 * ---
 * writealive:
 *   gathered_seeds: [paths]
 *   selected_center: {metadata}
 *   gathered_at: ISO timestamp
 * ---
 *
 * # Center Name
 *
 * > Center explanation
 *
 * What does this center mean to me?
 *
 * [Cursor positioned here]
 *
 * ---
 * ## Gathered Seeds (Reference)
 *
 * > Seed excerpts with wikilinks
 * ```
 */

import type { App, TFile } from 'obsidian';
import type { DiscoveredCenter } from '../ai/types';
import type { SeedNote } from './types';

/**
 * Options for creating a new note
 */
export interface CreateNoteOptions {
	/**
	 * Folder path to create note in
	 * @default vault root
	 */
	folder?: string;

	/**
	 * Open in new pane vs current pane
	 * @default false
	 */
	openInNewPane?: boolean;

	/**
	 * Position cursor at writing prompt
	 * @default true
	 * TODO: Implement cursor positioning
	 */
	positionCursor?: boolean;
}

/**
 * DocumentCreator Service
 *
 * Creates new notes from AI-discovered centers after user selection.
 */
export class DocumentCreator {
	constructor(private app: App) {}

	/**
	 * Create a new note from a discovered center
	 *
	 * Algorithm:
	 * 1. Generate filename with timestamp
	 * 2. Build frontmatter YAML
	 * 3. Build content with center explanation and seeds
	 * 4. Create file in vault
	 * 5. Open file in editor
	 * 6. Position cursor (TODO)
	 *
	 * @param center - Selected center from AI discovery
	 * @param seeds - Seed notes that were analyzed
	 * @param options - Creation options
	 * @returns Created file reference
	 * @throws Error if file creation fails
	 */
	async createNoteFromCenter(
		center: DiscoveredCenter,
		seeds: SeedNote[],
		options?: CreateNoteOptions
	): Promise<TFile> {
		try {
			// 1. Generate filename
			const filename = this.generateFilename(center);
			const folder = options?.folder || '';
			const filepath = folder ? `${folder}/${filename}` : filename;

			console.log('[DocumentCreator] Creating note:', filepath);

			// 2. Generate frontmatter
			const frontmatter = this.generateFrontmatter(center, seeds);

			// 3. Generate initial content
			const content = this.generateInitialContent(center, seeds);

			// 4. Combine frontmatter and content
			const fullContent = `${frontmatter}\n${content}`;

			// 5. Create file in vault
			const file = await this.app.vault.create(filepath, fullContent);

			console.log('[DocumentCreator] Note created successfully:', file.path);

			// 6. Open file in editor
			await this.openFile(file, options || {});

			return file;
		} catch (error) {
			console.error('[DocumentCreator] Failed to create note:', error);
			throw new Error(
				`Failed to create note from center: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * Generate frontmatter YAML for the note
	 *
	 * Includes:
	 * - gathered_seeds: Array of seed file paths
	 * - selected_center: Center metadata (name, strength, connected seeds)
	 * - gathered_at: ISO timestamp
	 *
	 * YAML structure follows WriteAlive metadata convention.
	 *
	 * @param center - Selected center
	 * @param seeds - Seed notes analyzed
	 * @returns YAML frontmatter block (with --- delimiters)
	 */
	private generateFrontmatter(
		center: DiscoveredCenter,
		seeds: SeedNote[]
	): string {
		// Extract seed paths (relative to vault root)
		const seedPaths = seeds.map((seed) => seed.path);

		// Build YAML object
		const frontmatterObj = {
			writealive: {
				gathered_seeds: seedPaths,
				selected_center: {
					name: center.name,
					strength: center.strength,
					connectedSeeds: center.connectedSeeds,
				},
				gathered_at: new Date().toISOString(),
			},
		};

		// Convert to YAML string
		// Note: Using manual YAML generation for simplicity
		// Could use js-yaml library for complex cases
		const yaml = this.objectToYaml(frontmatterObj, 0);

		return `---\n${yaml}---\n`;
	}

	/**
	 * Generate initial content for the note
	 *
	 * Structure:
	 * 1. Title (H1): Center name
	 * 2. Explanation: Center explanation as blockquote
	 * 3. Writing prompt: "What does this center mean to me?"
	 * 4. Cursor placeholder with spacing
	 * 5. Horizontal rule separator
	 * 6. Seeds reference section with excerpts
	 *
	 * @param center - Selected center
	 * @param seeds - Seed notes analyzed
	 * @returns Markdown content
	 */
	private generateInitialContent(
		center: DiscoveredCenter,
		seeds: SeedNote[]
	): string {
		const lines: string[] = [];

		// Detect if center name/explanation is in Korean
		const isKorean = this.detectKorean(center.name + center.explanation);
		const writingPrompt = isKorean
			? '이 센터는 나에게 어떤 의미를 갖는가?'
			: 'What does this center mean to me?';
		const referenceTitle = isKorean
			? '## 모아온 씨앗들 (참고자료)'
			: '## Gathered Seeds (Reference)';

		// 1. Title
		lines.push(`# ${center.name}`);
		lines.push('');

		// 2. Explanation as blockquote
		lines.push(`> ${center.explanation}`);
		lines.push('');

		// 3. Writing prompt (in appropriate language)
		lines.push(writingPrompt);
		lines.push('');

		// 4. Space for writing (removed red placeholder)
		lines.push('');
		lines.push('');
		lines.push('');
		lines.push('');

		// 5. Horizontal rule
		lines.push('---');

		// 6. Seeds reference section (in appropriate language)
		lines.push(referenceTitle);
		lines.push('');

		// Add each seed as blockquote with wikilink
		for (const seed of seeds) {
			// Use excerpt if available, otherwise first line of content
			const excerpt = seed.excerpt || this.extractFirstLine(seed.content);

			// Convert path to wikilink format (remove .md extension)
			const wikilinkPath = seed.path.replace(/\.md$/, '');

			lines.push(`> ${excerpt}`);
			lines.push(`> — [[${wikilinkPath}]]`);
			lines.push('');
		}

		return lines.join('\n');
	}

	/**
	 * Generate filename for the note
	 *
	 * Format: {sanitized-center-name} - {YYYY-MM-DD}.md
	 *
	 * Example:
	 * - Center: "Completeness vs Approximation"
	 * - Date: 2025-11-03
	 * - Result: "Completeness vs Approximation - 2025-11-03.md"
	 *
	 * @param center - Center to create note for
	 * @returns Filename with extension
	 */
	private generateFilename(center: DiscoveredCenter): string {
		const sanitizedName = this.sanitizeFilename(center.name);
		const date = this.formatDate(new Date());

		return `${sanitizedName} - ${date}.md`;
	}

	/**
	 * Sanitize filename by removing invalid characters
	 *
	 * Removes:
	 * - Path separators: / \
	 * - Control characters: < > : " | ? *
	 * - Leading/trailing dots and spaces
	 *
	 * Preserves:
	 * - Unicode characters (Korean, Japanese, etc.)
	 * - Spaces and dashes
	 * - Parentheses and brackets
	 *
	 * Examples:
	 * - "Completeness/Approximation" → "Completeness-Approximation"
	 * - "What is this?" → "What is this"
	 * - "完全性 vs 近似" → "完全性 vs 近似"
	 *
	 * @param name - Raw filename
	 * @returns Sanitized filename (without extension)
	 */
	private sanitizeFilename(name: string): string {
		return (
			name
				// Replace path separators with dash
				.replace(/[/\\]/g, '-')
				// Remove invalid filename characters
				.replace(/[<>:"|?*]/g, '')
				// Trim leading/trailing dots and spaces
				.replace(/^[.\s]+|[.\s]+$/g, '')
				// Collapse multiple spaces
				.replace(/\s+/g, ' ')
				.trim()
		);
	}

	/**
	 * Format date as YYYY-MM-DD
	 *
	 * @param date - Date to format
	 * @returns Formatted date string
	 */
	private formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	/**
	 * Open file in editor
	 *
	 * Opens in new pane if requested, otherwise in active pane.
	 * TODO: Implement cursor positioning to "What does this center mean to me?" line
	 *
	 * @param file - File to open
	 * @param options - Opening options
	 */
	private async openFile(
		file: TFile,
		options: CreateNoteOptions
	): Promise<void> {
		try {
			// Get leaf (tab) to open in
			const leaf = options.openInNewPane
				? this.app.workspace.getLeaf('tab')
				: this.app.workspace.getLeaf(false);

			// Open file
			await leaf.openFile(file);

			// TODO: Position cursor at writing prompt
			// This requires access to editor API which may vary by Obsidian version
			// For now, user will see note opened at top
			if (options.positionCursor !== false) {
				console.log(
					'[DocumentCreator] TODO: Cursor positioning not yet implemented'
				);
			}
		} catch (error) {
			console.error('[DocumentCreator] Failed to open file:', error);
			throw new Error(
				`Failed to open file: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * Detect if text is primarily in Korean
	 *
	 * Checks if text contains significant Korean characters (Hangul).
	 *
	 * @param text - Text to analyze
	 * @returns True if text is primarily Korean
	 */
	private detectKorean(text: string): boolean {
		// Count Korean characters (Hangul syllables: 0xAC00-0xD7AF)
		const koreanChars = text.match(/[\uAC00-\uD7AF]/g);
		const koreanCount = koreanChars ? koreanChars.length : 0;

		// Count total meaningful characters (exclude whitespace and punctuation)
		const meaningfulChars = text.match(/[\w\uAC00-\uD7AF]/g);
		const totalCount = meaningfulChars ? meaningfulChars.length : 0;

		// Consider Korean if > 30% of characters are Hangul
		return totalCount > 0 && koreanCount / totalCount > 0.3;
	}

	/**
	 * Extract first meaningful line from content
	 *
	 * Skips frontmatter and headers to get first paragraph line.
	 *
	 * @param content - Full note content
	 * @returns First line (up to 150 chars)
	 */
	private extractFirstLine(content: string): string {
		// Remove frontmatter
		let cleaned = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/m, '');

		// Split into lines and find first non-empty, non-header line
		const lines = cleaned.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith('#')) {
				// Truncate to 150 chars
				return trimmed.length > 150
					? trimmed.substring(0, 150) + '...'
					: trimmed;
			}
		}

		return '(No content)';
	}

	/**
	 * Convert object to YAML string
	 *
	 * Simple YAML serializer for frontmatter generation.
	 * Handles nested objects and arrays.
	 *
	 * Limitations:
	 * - Does not handle complex edge cases
	 * - Assumes string values don't need escaping (mostly safe for our use case)
	 * - For production, consider using js-yaml library
	 *
	 * @param obj - Object to convert
	 * @param indent - Current indentation level
	 * @returns YAML string
	 */
	private objectToYaml(obj: unknown, indent: number): string {
		const spaces = '  '.repeat(indent);
		const lines: string[] = [];

		if (Array.isArray(obj)) {
			// Array format
			for (const item of obj) {
				if (typeof item === 'string') {
					// Escape quotes in strings
					const escaped = item.replace(/"/g, '\\"');
					lines.push(`${spaces}- "${escaped}"`);
				} else if (typeof item === 'object' && item !== null) {
					// Nested object in array
					lines.push(`${spaces}-`);
					const nested = this.objectToYaml(item, indent + 1);
					lines.push(nested);
				} else {
					lines.push(`${spaces}- ${item}`);
				}
			}
		} else if (typeof obj === 'object' && obj !== null) {
			// Object format
			for (const [key, value] of Object.entries(obj)) {
				if (Array.isArray(value)) {
					lines.push(`${spaces}${key}:`);
					const nested = this.objectToYaml(value, indent + 1);
					lines.push(nested);
				} else if (typeof value === 'object' && value !== null) {
					lines.push(`${spaces}${key}:`);
					const nested = this.objectToYaml(value, indent + 1);
					lines.push(nested);
				} else if (typeof value === 'string') {
					// Escape quotes in strings
					const escaped = value.replace(/"/g, '\\"');
					lines.push(`${spaces}${key}: "${escaped}"`);
				} else {
					lines.push(`${spaces}${key}: ${value}`);
				}
			}
		}

		return lines.join('\n');
	}
}
