/**
 * Storage Service Type Definitions
 *
 * Defines all interfaces and types for storage operations in WriteAlive.
 * Follows Data Transfer Object pattern for clean separation between
 * storage layer and business logic.
 *
 * Architecture:
 * - DocumentMetadata: YAML frontmatter structure for WriteAlive data
 * - Snapshot: Point-in-time document state for versioning
 * - Diff: Comparison result between two snapshots
 * - Rate limiting types for AI API throttling
 */

import type { Center, WholenessAnalysis } from '../ai/types';

/**
 * Document Metadata
 *
 * Structure stored in YAML frontmatter under 'writeAlive' key.
 * Preserves user's existing frontmatter while adding WriteAlive-specific data.
 *
 * Example YAML:
 * ```yaml
 * ---
 * title: My Document
 * tags: [essay, draft]
 * writeAlive:
 *   version: 1
 *   centers:
 *     - id: center-1234
 *       text: "The main point..."
 *       ...
 *   snapshots:
 *     - id: snap-1234
 *       name: "Initial draft"
 *       ...
 *   lastWholenessScore: 7.5
 *   lastAnalyzedAt: "2025-11-01T10:00:00Z"
 * ---
 * ```
 */
export interface DocumentMetadata {
	/**
	 * Metadata format version (for future migrations)
	 * Current: 1
	 */
	version: number;

	/**
	 * Identified centers in the document
	 * Empty array if no centers found/accepted
	 */
	centers: Center[];

	/**
	 * Document snapshots (versions)
	 * Sorted by timestamp (newest first)
	 */
	snapshots: SnapshotMetadata[];

	/**
	 * Most recent wholeness analysis score (1-10)
	 * null if never analyzed
	 */
	lastWholenessScore: number | null;

	/**
	 * ISO timestamp of last wholeness analysis
	 * null if never analyzed
	 */
	lastAnalyzedAt: string | null;

	/**
	 * Total AI API cost spent on this document (USD)
	 * Tracked for transparency and cost management
	 */
	totalCost: number;

	/**
	 * Document statistics
	 */
	stats?: DocumentStats;
}

/**
 * Document Statistics
 *
 * Tracked metrics for document evolution over time.
 */
export interface DocumentStats {
	/**
	 * Total number of wholeness analyses performed
	 */
	analysisCount: number;

	/**
	 * Total number of center discovery operations
	 */
	centerFindCount: number;

	/**
	 * Total number of snapshots created
	 */
	snapshotCount: number;

	/**
	 * First edit timestamp (ISO)
	 */
	firstEditedAt: string | null;

	/**
	 * Last edit timestamp (ISO)
	 */
	lastEditedAt: string | null;
}

/**
 * Snapshot Metadata (stored in frontmatter)
 *
 * Lightweight metadata about a snapshot.
 * Full content stored separately to avoid bloating frontmatter.
 */
export interface SnapshotMetadata {
	/**
	 * Unique snapshot identifier
	 * Format: `snap-${timestamp}-${randomId}`
	 */
	id: string;

	/**
	 * User-provided or auto-generated name
	 * e.g., "Initial draft", "After revision 1"
	 */
	name: string;

	/**
	 * ISO timestamp when snapshot was created
	 */
	timestamp: string;

	/**
	 * Word count at snapshot time
	 */
	wordCount: number;

	/**
	 * Paragraph count at snapshot time
	 */
	paragraphCount: number;

	/**
	 * Wholeness score at snapshot time (if available)
	 */
	wholenessScore: number | null;

	/**
	 * Number of centers at snapshot time
	 */
	centerCount: number;

	/**
	 * Snapshot source
	 */
	source: 'manual' | 'auto' | 'pre-ai-operation';
}

/**
 * Snapshot (full data structure)
 *
 * Complete snapshot including content.
 * Not stored directly in frontmatter due to size.
 */
export interface Snapshot {
	/**
	 * Snapshot metadata
	 */
	metadata: SnapshotMetadata;

	/**
	 * Full document content at snapshot time
	 * (including frontmatter)
	 */
	content: string;

	/**
	 * Document metadata at snapshot time
	 */
	documentMetadata: DocumentMetadata;

	/**
	 * Wholeness analysis at snapshot time (if available)
	 */
	wholenessAnalysis: WholenessAnalysis | null;
}

/**
 * Diff Result
 *
 * Comparison between two snapshots or snapshot and current state.
 */
export interface Diff {
	/**
	 * Source snapshot ID
	 */
	fromSnapshotId: string;

	/**
	 * Target snapshot ID (or 'current' for current document)
	 */
	toSnapshotId: string;

	/**
	 * Text changes (line-based diff)
	 */
	textChanges: DiffChange[];

	/**
	 * Metadata changes summary
	 */
	metadataChanges: MetadataChanges;

	/**
	 * Statistics delta
	 */
	stats: DiffStats;

	/**
	 * When diff was computed
	 */
	timestamp: string;
}

/**
 * Diff Change (single change in text)
 *
 * Represents a line-level change between documents.
 */
export interface DiffChange {
	/**
	 * Type of change
	 */
	type: 'added' | 'removed' | 'modified' | 'unchanged';

	/**
	 * Line number in source document (0-indexed)
	 * null for added lines
	 */
	lineNumber: number | null;

	/**
	 * Line content
	 */
	content: string;
}

/**
 * Metadata Changes
 *
 * Summary of changes in document metadata between snapshots.
 */
export interface MetadataChanges {
	/**
	 * Centers added
	 */
	centersAdded: Center[];

	/**
	 * Centers removed (by ID)
	 */
	centersRemoved: string[];

	/**
	 * Wholeness score change
	 * Positive = improvement, Negative = decline
	 */
	wholenessScoreChange: number | null;

	/**
	 * Previous wholeness score
	 */
	previousWholenessScore: number | null;

	/**
	 * Current wholeness score
	 */
	currentWholenessScore: number | null;
}

/**
 * Diff Statistics
 *
 * Quantitative changes between snapshots.
 */
export interface DiffStats {
	/**
	 * Lines added
	 */
	linesAdded: number;

	/**
	 * Lines removed
	 */
	linesRemoved: number;

	/**
	 * Lines modified
	 */
	linesModified: number;

	/**
	 * Word count change
	 */
	wordCountChange: number;

	/**
	 * Paragraph count change
	 */
	paragraphCountChange: number;

	/**
	 * Previous word count
	 */
	previousWordCount: number;

	/**
	 * Current word count
	 */
	currentWordCount: number;

	/**
	 * Previous paragraph count
	 */
	previousParagraphCount: number;

	/**
	 * Current paragraph count
	 */
	currentParagraphCount: number;
}

/**
 * Default empty metadata
 *
 * Used when document has no WriteAlive frontmatter yet.
 */
export const DEFAULT_DOCUMENT_METADATA: DocumentMetadata = {
	version: 1,
	centers: [],
	snapshots: [],
	lastWholenessScore: null,
	lastAnalyzedAt: null,
	totalCost: 0,
	stats: {
		analysisCount: 0,
		centerFindCount: 0,
		snapshotCount: 0,
		firstEditedAt: null,
		lastEditedAt: null,
	},
};

/**
 * Storage Service Error
 */
export class StorageError extends Error {
	constructor(
		message: string,
		public readonly code: StorageErrorCode,
		public readonly filePath?: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'StorageError';

		console.error('[StorageService]', message, {
			code,
			filePath,
			cause: cause instanceof Error ? cause.message : String(cause),
		});
	}
}

/**
 * Storage Error Codes
 */
export type StorageErrorCode =
	| 'FILE_NOT_FOUND'
	| 'READ_ERROR'
	| 'WRITE_ERROR'
	| 'PARSE_ERROR'
	| 'INVALID_METADATA'
	| 'SNAPSHOT_NOT_FOUND'
	| 'SNAPSHOT_LIMIT_EXCEEDED';
