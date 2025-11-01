/**
 * Diff Service
 *
 * Compares snapshots and produces structured diff results for version tracking.
 * Implements simple line-by-line diff algorithm for MVP.
 *
 * Architecture:
 * - Single Responsibility: Only handles diff computation
 * - Dependency Injection: Receives SnapshotManager via constructor
 * - Algorithm: Simple line-based diff (no external libraries)
 *
 * Diff Features:
 * - Text changes (line-by-line comparison)
 * - Metadata changes (centers, wholeness score)
 * - Statistics (word count, paragraph count deltas)
 * - Human-readable summary generation
 *
 * Future Enhancement (Post-MVP):
 * - Myers diff algorithm for more accurate diffs
 * - Word-level diff highlighting
 * - Semantic diff (understanding code/content structure)
 */

import type { TFile } from 'obsidian';
import type {
	Snapshot,
	Diff,
	DiffChange,
	DiffStats,
	MetadataChanges,
} from './types';
import { StorageError } from './types';
import { SnapshotManager } from './snapshot-manager';

/**
 * Diff Service
 *
 * Service for comparing snapshots and generating structured diff results.
 */
export class DiffService {
	/**
	 * Snapshot manager for retrieving snapshot data
	 */
	private readonly snapshotManager: SnapshotManager;

	/**
	 * Constructor
	 *
	 * @param snapshotManager - Snapshot manager instance
	 */
	constructor(snapshotManager: SnapshotManager) {
		this.snapshotManager = snapshotManager;
	}

	/**
	 * Compare two snapshots
	 *
	 * Produces structured diff with text changes, metadata changes, and statistics.
	 *
	 * @param fromSnapshot - Source snapshot
	 * @param toSnapshot - Target snapshot
	 * @returns Diff result
	 */
	compareSnapshots(fromSnapshot: Snapshot, toSnapshot: Snapshot): Diff {
		// Extract body content (without frontmatter) for comparison
		const fromContent = this.extractBody(fromSnapshot.content);
		const toContent = this.extractBody(toSnapshot.content);

		// Compute line-by-line text changes
		const textChanges = this.computeTextChanges(fromContent, toContent);

		// Compute metadata changes
		const metadataChanges = this.computeMetadataChanges(
			fromSnapshot,
			toSnapshot
		);

		// Compute statistics
		const stats = this.computeStats(
			fromContent,
			toContent,
			fromSnapshot,
			toSnapshot
		);

		return {
			fromSnapshotId: fromSnapshot.metadata.id,
			toSnapshotId: toSnapshot.metadata.id,
			textChanges,
			metadataChanges,
			stats,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Compare snapshot to current document version
	 *
	 * Creates a temporary snapshot of current state for comparison.
	 *
	 * @param file - File to compare
	 * @param snapshot - Snapshot to compare against
	 * @returns Diff result
	 * @throws StorageError if file read fails
	 */
	async compareToCurrentVersion(
		file: TFile,
		snapshot: Snapshot
	): Promise<Diff> {
		try {
			// Create temporary snapshot of current state
			const currentSnapshot = await this.snapshotManager.createSnapshot(
				file,
				'[Temporary] Current Version'
			);

			// Compare snapshots
			const diff = this.compareSnapshots(snapshot, currentSnapshot);

			// Delete temporary snapshot
			await this.snapshotManager.deleteSnapshot(
				file,
				currentSnapshot.metadata.id
			);

			// Update diff to indicate comparison with current
			return {
				...diff,
				toSnapshotId: 'current',
			};
		} catch (error) {
			throw new StorageError(
				`Failed to compare snapshot to current version: ${file.path}`,
				'READ_ERROR',
				file.path,
				error
			);
		}
	}

	/**
	 * Generate human-readable diff summary
	 *
	 * Creates a concise summary of changes for user display.
	 *
	 * @param diff - Diff result
	 * @returns Human-readable summary
	 */
	generateDiffSummary(diff: Diff): string {
		const parts: string[] = [];

		// Text changes summary
		const { linesAdded, linesRemoved, linesModified } = diff.stats;
		if (linesAdded + linesRemoved + linesModified > 0) {
			const textParts: string[] = [];
			if (linesAdded > 0) textParts.push(`+${linesAdded} lines`);
			if (linesRemoved > 0) textParts.push(`-${linesRemoved} lines`);
			if (linesModified > 0) textParts.push(`~${linesModified} modified`);
			parts.push(`Text: ${textParts.join(', ')}`);
		}

		// Word count change
		const { wordCountChange } = diff.stats;
		if (wordCountChange !== 0) {
			const sign = wordCountChange > 0 ? '+' : '';
			parts.push(`Words: ${sign}${wordCountChange}`);
		}

		// Paragraph count change
		const { paragraphCountChange } = diff.stats;
		if (paragraphCountChange !== 0) {
			const sign = paragraphCountChange > 0 ? '+' : '';
			parts.push(`Paragraphs: ${sign}${paragraphCountChange}`);
		}

		// Wholeness score change
		const { wholenessScoreChange } = diff.metadataChanges;
		if (wholenessScoreChange !== null && wholenessScoreChange !== 0) {
			const sign = wholenessScoreChange > 0 ? '+' : '';
			parts.push(
				`Wholeness: ${sign}${wholenessScoreChange.toFixed(1)}`
			);
		}

		// Centers change
		const { centersAdded, centersRemoved } = diff.metadataChanges;
		if (centersAdded.length > 0 || centersRemoved.length > 0) {
			parts.push(
				`Centers: +${centersAdded.length}/-${centersRemoved.length}`
			);
		}

		// Return summary or "No changes" if empty
		return parts.length > 0 ? parts.join(' | ') : 'No changes';
	}

	/**
	 * Compute line-by-line text changes
	 *
	 * Implements simple line-based diff algorithm.
	 * For MVP, this is sufficient. Post-MVP can upgrade to Myers diff.
	 *
	 * @param fromContent - Source content
	 * @param toContent - Target content
	 * @returns Array of diff changes
	 */
	private computeTextChanges(
		fromContent: string,
		toContent: string
	): DiffChange[] {
		const fromLines = fromContent.split('\n');
		const toLines = toContent.split('\n');

		const changes: DiffChange[] = [];

		// Simple line-by-line comparison
		// This is O(n*m) but works fine for document-sized content
		const maxLines = Math.max(fromLines.length, toLines.length);

		for (let i = 0; i < maxLines; i++) {
			const fromLine = i < fromLines.length ? fromLines[i] : null;
			const toLine = i < toLines.length ? toLines[i] : null;

			if (fromLine === null && toLine !== null) {
				// Line added
				changes.push({
					type: 'added',
					lineNumber: null,
					content: toLine,
				});
			} else if (fromLine !== null && toLine === null) {
				// Line removed
				changes.push({
					type: 'removed',
					lineNumber: i,
					content: fromLine,
				});
			} else if (fromLine !== toLine) {
				// Line modified
				changes.push({
					type: 'removed',
					lineNumber: i,
					content: fromLine!,
				});
				changes.push({
					type: 'added',
					lineNumber: null,
					content: toLine!,
				});
			}
			// If lines are equal, skip (no change)
		}

		return changes;
	}

	/**
	 * Compute metadata changes between snapshots
	 *
	 * @param fromSnapshot - Source snapshot
	 * @param toSnapshot - Target snapshot
	 * @returns Metadata changes
	 */
	private computeMetadataChanges(
		fromSnapshot: Snapshot,
		toSnapshot: Snapshot
	): MetadataChanges {
		const fromCenters = fromSnapshot.documentMetadata.centers;
		const toCenters = toSnapshot.documentMetadata.centers;

		// Find added centers (in to, not in from)
		const centersAdded = toCenters.filter(
			(toCenter) => !fromCenters.find((c) => c.id === toCenter.id)
		);

		// Find removed centers (in from, not in to)
		const centersRemoved = fromCenters
			.filter((fromCenter) => !toCenters.find((c) => c.id === fromCenter.id))
			.map((c) => c.id);

		// Wholeness score change
		const fromScore = fromSnapshot.documentMetadata.lastWholenessScore;
		const toScore = toSnapshot.documentMetadata.lastWholenessScore;
		const wholenessScoreChange =
			fromScore !== null && toScore !== null ? toScore - fromScore : null;

		return {
			centersAdded,
			centersRemoved,
			wholenessScoreChange,
			previousWholenessScore: fromScore,
			currentWholenessScore: toScore,
		};
	}

	/**
	 * Compute diff statistics
	 *
	 * @param fromContent - Source content
	 * @param toContent - Target content
	 * @param fromSnapshot - Source snapshot
	 * @param toSnapshot - Target snapshot
	 * @returns Diff statistics
	 */
	private computeStats(
		fromContent: string,
		toContent: string,
		fromSnapshot: Snapshot,
		toSnapshot: Snapshot
	): DiffStats {
		const fromLines = fromContent.split('\n');
		const toLines = toContent.split('\n');

		// Count line changes
		let linesAdded = 0;
		let linesRemoved = 0;
		let linesModified = 0;

		const maxLines = Math.max(fromLines.length, toLines.length);

		for (let i = 0; i < maxLines; i++) {
			const fromLine = i < fromLines.length ? fromLines[i] : null;
			const toLine = i < toLines.length ? toLines[i] : null;

			if (fromLine === null && toLine !== null) {
				linesAdded++;
			} else if (fromLine !== null && toLine === null) {
				linesRemoved++;
			} else if (fromLine !== toLine) {
				linesModified++;
			}
		}

		// Word count statistics
		const previousWordCount = fromSnapshot.metadata.wordCount;
		const currentWordCount = toSnapshot.metadata.wordCount;
		const wordCountChange = currentWordCount - previousWordCount;

		// Paragraph count statistics
		const previousParagraphCount = fromSnapshot.metadata.paragraphCount;
		const currentParagraphCount = toSnapshot.metadata.paragraphCount;
		const paragraphCountChange =
			currentParagraphCount - previousParagraphCount;

		return {
			linesAdded,
			linesRemoved,
			linesModified,
			wordCountChange,
			paragraphCountChange,
			previousWordCount,
			currentWordCount,
			previousParagraphCount,
			currentParagraphCount,
		};
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
}
