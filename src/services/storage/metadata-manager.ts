/**
 * Metadata Manager Service
 *
 * Manages YAML frontmatter for WriteAlive documents.
 * Handles reading and updating document metadata stored in frontmatter
 * while preserving user's existing frontmatter fields.
 *
 * Architecture:
 * - Single Responsibility: Only handles metadata persistence
 * - Dependency Injection: Receives Vault via constructor
 * - Error Handling: Clear error messages with codes
 *
 * YAML Structure:
 * ```yaml
 * ---
 * # User's existing frontmatter
 * title: My Document
 * tags: [essay, draft]
 *
 * # WriteAlive metadata (managed by this service)
 * writeAlive:
 *   version: 1
 *   centers: [...]
 *   snapshots: [...]
 *   lastWholenessScore: 7.5
 *   ...
 * ---
 * ```
 */

import type { TFile, Vault } from 'obsidian';
import { parseYaml, stringifyYaml } from 'obsidian';
import type { DocumentMetadata } from './types';
import { DEFAULT_DOCUMENT_METADATA, StorageError } from './types';

/**
 * Metadata Manager
 *
 * Service for reading and updating WriteAlive metadata in YAML frontmatter.
 */
export class MetadataManager {
	/**
	 * Obsidian vault instance
	 */
	private readonly vault: Vault;

	/**
	 * Constructor
	 *
	 * @param vault - Obsidian vault instance
	 */
	constructor(vault: Vault) {
		this.vault = vault;
	}

	/**
	 * Read metadata from file
	 *
	 * Parses YAML frontmatter and extracts WriteAlive metadata.
	 * Returns default metadata if file has no frontmatter or no writeAlive section.
	 *
	 * @param file - File to read metadata from
	 * @returns Document metadata
	 * @throws StorageError if file read or parse fails
	 */
	async readMetadata(file: TFile): Promise<DocumentMetadata> {
		try {
			// Read file content
			const content = await this.vault.read(file);

			// Extract frontmatter
			const frontmatter = this.extractFrontmatter(content);

			// No frontmatter = return defaults
			if (!frontmatter) {
				return { ...DEFAULT_DOCUMENT_METADATA };
			}

			// Parse YAML
			const parsed = parseYaml(frontmatter);

			// No writeAlive section = return defaults
			if (!parsed || typeof parsed !== 'object' || !('writeAlive' in parsed)) {
				return { ...DEFAULT_DOCUMENT_METADATA };
			}

			// Extract and validate writeAlive metadata
			const writeAliveData = parsed.writeAlive;

			if (!writeAliveData || typeof writeAliveData !== 'object') {
				return { ...DEFAULT_DOCUMENT_METADATA };
			}

			// Merge with defaults to handle missing fields
			return this.mergeWithDefaults(writeAliveData as Partial<DocumentMetadata>);
		} catch (error) {
			throw new StorageError(
				`Failed to read metadata from file: ${file.path}`,
				'READ_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Update metadata in file
	 *
	 * Updates WriteAlive metadata in YAML frontmatter while preserving
	 * user's existing frontmatter fields.
	 *
	 * If file has no frontmatter, creates new frontmatter.
	 * If file has frontmatter but no writeAlive section, adds it.
	 * If file has writeAlive section, merges partial updates.
	 *
	 * @param file - File to update
	 * @param metadata - Partial metadata to update (merged with existing)
	 * @throws StorageError if file read/write or parse fails
	 */
	async updateMetadata(
		file: TFile,
		metadata: Partial<DocumentMetadata>
	): Promise<void> {
		try {
			// Read current content
			const content = await this.vault.read(file);

			// Extract frontmatter and body
			const { frontmatter, body } = this.splitContent(content);

			// Parse existing frontmatter (or create empty object)
			let parsed: Record<string, unknown> = {};

			if (frontmatter) {
				try {
					const yamlData = parseYaml(frontmatter);
					if (yamlData && typeof yamlData === 'object') {
						parsed = yamlData as Record<string, unknown>;
					}
				} catch (error) {
					throw new StorageError(
						`Invalid YAML frontmatter in file: ${file.path}`,
						'PARSE_ERROR',
						file.path,
						error
					);
				}
			}

			// Get current writeAlive metadata (or defaults)
			const currentMetadata = (parsed.writeAlive as DocumentMetadata) || {
				...DEFAULT_DOCUMENT_METADATA,
			};

			// Merge partial update with current metadata
			const updatedMetadata: DocumentMetadata = {
				...currentMetadata,
				...metadata,
				// Ensure version is always set
				version: metadata.version ?? currentMetadata.version ?? 1,
			};

			// Update writeAlive section
			parsed.writeAlive = updatedMetadata;

			// Serialize back to YAML
			const newFrontmatter = stringifyYaml(parsed);

			// Reconstruct file content
			const newContent = this.reconstructContent(newFrontmatter, body);

			// Write back to file
			await this.vault.modify(file, newContent);
		} catch (error) {
			if (error instanceof StorageError) {
				throw error;
			}

			throw new StorageError(
				`Failed to update metadata in file: ${file.path}`,
				'WRITE_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Clear all WriteAlive metadata from file
	 *
	 * Removes the writeAlive section from frontmatter while preserving
	 * user's other frontmatter fields.
	 *
	 * @param file - File to clear metadata from
	 * @throws StorageError if file read/write fails
	 */
	async clearMetadata(file: TFile): Promise<void> {
		try {
			// Read current content
			const content = await this.vault.read(file);

			// Extract frontmatter and body
			const { frontmatter, body } = this.splitContent(content);

			// No frontmatter = nothing to clear
			if (!frontmatter) {
				return;
			}

			// Parse frontmatter
			const parsed = parseYaml(frontmatter);

			if (!parsed || typeof parsed !== 'object') {
				return;
			}

			// Remove writeAlive section
			const updated = parsed as Record<string, unknown>;
			delete updated.writeAlive;

			// If frontmatter is now empty, remove it entirely
			if (Object.keys(updated).length === 0) {
				await this.vault.modify(file, body.trim());
				return;
			}

			// Serialize and write back
			const newFrontmatter = stringifyYaml(updated);
			const newContent = this.reconstructContent(newFrontmatter, body);
			await this.vault.modify(file, newContent);
		} catch (error) {
			throw new StorageError(
				`Failed to clear metadata from file: ${file.path}`,
				'WRITE_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Check if file has WriteAlive metadata
	 *
	 * @param file - File to check
	 * @returns True if file has writeAlive frontmatter section
	 */
	async hasMetadata(file: TFile): Promise<boolean> {
		try {
			const content = await this.vault.read(file);
			const frontmatter = this.extractFrontmatter(content);

			if (!frontmatter) {
				return false;
			}

			const parsed = parseYaml(frontmatter);

			return !!(
				parsed &&
				typeof parsed === 'object' &&
				'writeAlive' in parsed
			);
		} catch {
			return false;
		}
	}

	/**
	 * Extract frontmatter from content
	 *
	 * Frontmatter must start with --- on first line and end with ---
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
	 * Reconstruct content from frontmatter and body
	 *
	 * @param frontmatter - YAML frontmatter (already stringified)
	 * @param body - Document body
	 * @returns Reconstructed content
	 */
	private reconstructContent(frontmatter: string, body: string): string {
		// Ensure frontmatter doesn't have trailing newline
		const trimmedFrontmatter = frontmatter.trim();

		// Ensure body has leading newline
		const trimmedBody = body.trimStart();

		return `---\n${trimmedFrontmatter}\n---\n\n${trimmedBody}`;
	}

	/**
	 * Merge partial metadata with defaults
	 *
	 * Ensures all required fields are present with valid values.
	 *
	 * @param partial - Partial metadata from frontmatter
	 * @returns Complete metadata
	 */
	private mergeWithDefaults(
		partial: Partial<DocumentMetadata>
	): DocumentMetadata {
		return {
			version: partial.version ?? DEFAULT_DOCUMENT_METADATA.version,
			centers: Array.isArray(partial.centers) ? partial.centers : [],
			snapshots: Array.isArray(partial.snapshots) ? partial.snapshots : [],
			lastWholenessScore:
				typeof partial.lastWholenessScore === 'number'
					? partial.lastWholenessScore
					: null,
			lastAnalyzedAt:
				typeof partial.lastAnalyzedAt === 'string'
					? partial.lastAnalyzedAt
					: null,
			totalCost:
				typeof partial.totalCost === 'number' ? partial.totalCost : 0,
			stats: {
				analysisCount:
					partial.stats?.analysisCount ??
					DEFAULT_DOCUMENT_METADATA.stats!.analysisCount,
				centerFindCount:
					partial.stats?.centerFindCount ??
					DEFAULT_DOCUMENT_METADATA.stats!.centerFindCount,
				snapshotCount:
					partial.stats?.snapshotCount ??
					DEFAULT_DOCUMENT_METADATA.stats!.snapshotCount,
				firstEditedAt:
					partial.stats?.firstEditedAt ??
					DEFAULT_DOCUMENT_METADATA.stats!.firstEditedAt,
				lastEditedAt:
					partial.stats?.lastEditedAt ??
					DEFAULT_DOCUMENT_METADATA.stats!.lastEditedAt,
			},
		};
	}
}
