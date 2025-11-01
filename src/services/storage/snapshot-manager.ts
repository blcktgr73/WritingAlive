/**
 * Snapshot Manager Service
 *
 * Manages point-in-time snapshots of document state for versioning and comparison.
 * Stores snapshots in YAML frontmatter for MVP simplicity.
 *
 * Architecture:
 * - Single Responsibility: Only handles snapshot CRUD operations
 * - Dependency Injection: Receives Vault and MetadataManager via constructor
 * - Storage Strategy: YAML frontmatter (Option A) for MVP
 *   - Pros: No separate files, version controlled with document
 *   - Cons: Size limits (warns if >10 snapshots)
 *
 * Snapshot Structure:
 * - Metadata stored in frontmatter (writeAlive.snapshots[])
 * - Full content stored in separate .writealive/ folder for scalability
 * - Each snapshot preserves document state at specific point in time
 *
 * Future Enhancement (Post-MVP):
 * - Option B: Separate .writealive/ folder for snapshot content
 * - Compression for large snapshots
 * - Cloud sync for snapshots
 */

import type { TFile, Vault } from 'obsidian';
import type {
	Snapshot,
	SnapshotMetadata,
} from './types';
import { StorageError } from './types';
import { MetadataManager } from './metadata-manager';

/**
 * Snapshot Manager
 *
 * Service for creating, retrieving, and managing document snapshots.
 */
export class SnapshotManager {
	/**
	 * Maximum number of snapshots before warning
	 * Performance concern: Large frontmatter can slow down parsing
	 */
	private static readonly MAX_SNAPSHOTS_WARNING = 10;

	/**
	 * Snapshot ID prefix
	 */
	private static readonly SNAPSHOT_ID_PREFIX = 'snap-';

	/**
	 * Obsidian vault instance
	 */
	private readonly vault: Vault;

	/**
	 * Metadata manager for reading/updating frontmatter
	 */
	private readonly metadataManager: MetadataManager;

	/**
	 * Constructor
	 *
	 * @param vault - Obsidian vault instance
	 * @param metadataManager - Metadata manager instance
	 */
	constructor(vault: Vault, metadataManager: MetadataManager) {
		this.vault = vault;
		this.metadataManager = metadataManager;
	}

	/**
	 * Create snapshot of current document state
	 *
	 * Creates a point-in-time snapshot with current content and metadata.
	 * Stores snapshot metadata in frontmatter and content in .writealive/ folder.
	 *
	 * @param file - File to snapshot
	 * @param name - Optional custom name (auto-generated if not provided)
	 * @returns Created snapshot
	 * @throws StorageError if snapshot creation fails
	 */
	async createSnapshot(file: TFile, name?: string): Promise<Snapshot> {
		try {
			// Read current metadata and content
			const metadata = await this.metadataManager.readMetadata(file);
			const content = await this.vault.read(file);

			// Check snapshot limit
			if (metadata.snapshots.length >= SnapshotManager.MAX_SNAPSHOTS_WARNING) {
				console.warn(
					`[SnapshotManager] File has ${metadata.snapshots.length} snapshots. ` +
					`Consider deleting old snapshots for better performance.`
				);
			}

			// Generate snapshot ID and metadata
			const timestamp = new Date().toISOString();
			const snapshotId = this.generateSnapshotId();
			const snapshotName = name || this.generateAutoName();

			// Calculate statistics
			const wordCount = this.calculateWordCount(content);
			const paragraphCount = this.calculateParagraphCount(content);

			// Create snapshot metadata
			const snapshotMetadata: SnapshotMetadata = {
				id: snapshotId,
				name: snapshotName,
				timestamp,
				wordCount,
				paragraphCount,
				wholenessScore: metadata.lastWholenessScore,
				centerCount: metadata.centers.length,
				source: name ? 'manual' : 'auto',
			};

			// Create full snapshot object
			const snapshot: Snapshot = {
				metadata: snapshotMetadata,
				content,
				documentMetadata: metadata,
				wholenessAnalysis: null, // Will be populated by AI service if available
			};

			// Store snapshot content in .writealive/ folder
			await this.storeSnapshotContent(file, snapshotId, content);

			// Update frontmatter with new snapshot metadata
			const updatedSnapshots = [snapshotMetadata, ...metadata.snapshots];

			await this.metadataManager.updateMetadata(file, {
				snapshots: updatedSnapshots,
				stats: {
					...metadata.stats!,
					snapshotCount: (metadata.stats?.snapshotCount || 0) + 1,
					lastEditedAt: timestamp,
				},
			});

			return snapshot;
		} catch (error) {
			throw new StorageError(
				`Failed to create snapshot for file: ${file.path}`,
				'WRITE_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * List all snapshots for a file
	 *
	 * Returns snapshots sorted by timestamp (newest first).
	 *
	 * @param file - File to list snapshots for
	 * @returns Array of snapshot metadata
	 * @throws StorageError if metadata read fails
	 */
	async listSnapshots(file: TFile): Promise<SnapshotMetadata[]> {
		try {
			const metadata = await this.metadataManager.readMetadata(file);

			// Already sorted by timestamp (newest first) when stored
			return metadata.snapshots;
		} catch (error) {
			throw new StorageError(
				`Failed to list snapshots for file: ${file.path}`,
				'READ_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Get specific snapshot by ID
	 *
	 * Retrieves full snapshot including content.
	 *
	 * @param file - File to get snapshot from
	 * @param snapshotId - Snapshot ID
	 * @returns Snapshot or null if not found
	 * @throws StorageError if snapshot retrieval fails
	 */
	async getSnapshot(
		file: TFile,
		snapshotId: string
	): Promise<Snapshot | null> {
		try {
			const metadata = await this.metadataManager.readMetadata(file);

			// Find snapshot metadata
			const snapshotMetadata = metadata.snapshots.find(
				(s) => s.id === snapshotId
			);

			if (!snapshotMetadata) {
				return null;
			}

			// Load snapshot content from .writealive/ folder
			const content = await this.loadSnapshotContent(file, snapshotId);

			if (!content) {
				throw new StorageError(
					`Snapshot content not found for ID: ${snapshotId}`,
					'SNAPSHOT_NOT_FOUND',
					file.path
				);
			}

			// Reconstruct full snapshot
			const snapshot: Snapshot = {
				metadata: snapshotMetadata,
				content,
				documentMetadata: metadata,
				wholenessAnalysis: null,
			};

			return snapshot;
		} catch (error) {
			if (error instanceof StorageError) {
				throw error;
			}

			throw new StorageError(
				`Failed to get snapshot ${snapshotId} for file: ${file.path}`,
				'READ_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Delete snapshot by ID
	 *
	 * Removes snapshot metadata from frontmatter and deletes content file.
	 *
	 * @param file - File to delete snapshot from
	 * @param snapshotId - Snapshot ID to delete
	 * @throws StorageError if snapshot deletion fails or snapshot not found
	 */
	async deleteSnapshot(file: TFile, snapshotId: string): Promise<void> {
		try {
			const metadata = await this.metadataManager.readMetadata(file);

			// Find snapshot
			const snapshotIndex = metadata.snapshots.findIndex(
				(s) => s.id === snapshotId
			);

			if (snapshotIndex === -1) {
				throw new StorageError(
					`Snapshot not found: ${snapshotId}`,
					'SNAPSHOT_NOT_FOUND',
					file.path
				);
			}

			// Remove from metadata
			const updatedSnapshots = metadata.snapshots.filter(
				(s) => s.id !== snapshotId
			);

			await this.metadataManager.updateMetadata(file, {
				snapshots: updatedSnapshots,
			});

			// Delete snapshot content file
			await this.deleteSnapshotContent(file, snapshotId);
		} catch (error) {
			if (error instanceof StorageError) {
				throw error;
			}

			throw new StorageError(
				`Failed to delete snapshot ${snapshotId} from file: ${file.path}`,
				'WRITE_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Restore document to snapshot state
	 *
	 * Creates a backup snapshot before restoring (for undo support).
	 *
	 * @param file - File to restore
	 * @param snapshotId - Snapshot ID to restore from
	 * @throws StorageError if restoration fails or snapshot not found
	 */
	async restoreSnapshot(file: TFile, snapshotId: string): Promise<void> {
		try {
			// Get snapshot to restore
			const snapshot = await this.getSnapshot(file, snapshotId);

			if (!snapshot) {
				throw new StorageError(
					`Snapshot not found: ${snapshotId}`,
					'SNAPSHOT_NOT_FOUND',
					file.path
				);
			}

			// Create backup snapshot before restoring (undo support)
			await this.createSnapshot(file, `Backup before restore to ${snapshot.metadata.name}`);

			// Restore content
			await this.vault.modify(file, snapshot.content);
		} catch (error) {
			if (error instanceof StorageError) {
				throw error;
			}

			throw new StorageError(
				`Failed to restore snapshot ${snapshotId} for file: ${file.path}`,
				'WRITE_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Generate unique snapshot ID
	 *
	 * Format: snap-{timestamp}-{random}
	 *
	 * @returns Snapshot ID
	 */
	private generateSnapshotId(): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 8);
		return `${SnapshotManager.SNAPSHOT_ID_PREFIX}${timestamp}-${random}`;
	}

	/**
	 * Generate auto-name for snapshot
	 *
	 * Format: "Snapshot YYYY-MM-DD HH:MM:SS"
	 *
	 * @returns Auto-generated name
	 */
	private generateAutoName(): string {
		const now = new Date();
		const formatted = now.toLocaleString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		});

		return `Snapshot ${formatted}`;
	}

	/**
	 * Calculate word count from content
	 *
	 * @param content - Document content
	 * @returns Word count
	 */
	private calculateWordCount(content: string): number {
		// Remove frontmatter for accurate count
		const bodyContent = this.extractBody(content);

		// Split by whitespace and filter empty strings
		const words = bodyContent.split(/\s+/).filter((word) => word.length > 0);

		return words.length;
	}

	/**
	 * Calculate paragraph count from content
	 *
	 * @param content - Document content
	 * @returns Paragraph count
	 */
	private calculateParagraphCount(content: string): number {
		// Remove frontmatter for accurate count
		const bodyContent = this.extractBody(content);

		// Split by double newlines (paragraphs) and filter empty strings
		const paragraphs = bodyContent
			.split(/\n\n+/)
			.filter((para) => para.trim().length > 0);

		return paragraphs.length;
	}

	/**
	 * Extract body content (without frontmatter)
	 *
	 * @param content - Full document content
	 * @returns Body content only
	 */
	private extractBody(content: string): string {
		// Check if content starts with frontmatter
		if (!content.startsWith('---\n')) {
			return content;
		}

		// Find end of frontmatter
		const endIndex = content.indexOf('\n---\n', 4);

		if (endIndex === -1) {
			return content;
		}

		// Return content after frontmatter
		return content.substring(endIndex + 5); // +5 to skip \n---\n
	}

	/**
	 * Store snapshot content in .writealive/ folder
	 *
	 * Stores full content in separate file for scalability.
	 * Path: .writealive/snapshots/{filename}/{snapshotId}.md
	 *
	 * @param file - Source file
	 * @param snapshotId - Snapshot ID
	 * @param content - Snapshot content
	 */
	private async storeSnapshotContent(
		file: TFile,
		snapshotId: string,
		content: string
	): Promise<void> {
		try {
			// Get file's directory path
			const dir = file.parent?.path || '';

			// Create snapshot folder path
			const snapshotFolder = dir ? `${dir}/.writealive/snapshots/${file.basename}` : `.writealive/snapshots/${file.basename}`;

			// Ensure folder exists
			const folderExists = await this.vault.adapter.exists(snapshotFolder);
			if (!folderExists) {
				await this.vault.adapter.mkdir(snapshotFolder);
			}

			// Write snapshot content
			const snapshotPath = `${snapshotFolder}/${snapshotId}.md`;
			await this.vault.adapter.write(snapshotPath, content);
		} catch (error) {
			throw new StorageError(
				`Failed to store snapshot content for ${snapshotId}`,
				'WRITE_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Load snapshot content from .writealive/ folder
	 *
	 * @param file - Source file
	 * @param snapshotId - Snapshot ID
	 * @returns Snapshot content or null if not found
	 */
	private async loadSnapshotContent(
		file: TFile,
		snapshotId: string
	): Promise<string | null> {
		try {
			// Get file's directory path
			const dir = file.parent?.path || '';

			// Create snapshot file path
			const snapshotPath = dir
				? `${dir}/.writealive/snapshots/${file.basename}/${snapshotId}.md`
				: `.writealive/snapshots/${file.basename}/${snapshotId}.md`;

			// Check if file exists
			const exists = await this.vault.adapter.exists(snapshotPath);
			if (!exists) {
				return null;
			}

			// Read and return content
			return await this.vault.adapter.read(snapshotPath);
		} catch (error) {
			console.error(`[SnapshotManager] Failed to load snapshot content for ${snapshotId}:`, error);
			return null;
		}
	}

	/**
	 * Delete snapshot content file
	 *
	 * @param file - Source file
	 * @param snapshotId - Snapshot ID
	 */
	private async deleteSnapshotContent(
		file: TFile,
		snapshotId: string
	): Promise<void> {
		try {
			// Get file's directory path
			const dir = file.parent?.path || '';

			// Create snapshot file path
			const snapshotPath = dir
				? `${dir}/.writealive/snapshots/${file.basename}/${snapshotId}.md`
				: `.writealive/snapshots/${file.basename}/${snapshotId}.md`;

			// Check if file exists
			const exists = await this.vault.adapter.exists(snapshotPath);
			if (exists) {
				await this.vault.adapter.remove(snapshotPath);
			}
		} catch (error) {
			// Log but don't throw - content deletion is not critical
			console.error(`[SnapshotManager] Failed to delete snapshot content for ${snapshotId}:`, error);
		}
	}
}
