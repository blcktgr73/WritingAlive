/**
 * Vault Service Types
 *
 * Data models for seed gathering and vault operations.
 * Follows Data Transfer Object pattern for clean separation
 * between vault data and business logic.
 */

import type { TFile } from 'obsidian';

/**
 * Seed Note Data Model
 *
 * Represents a single seed note from the vault with all metadata
 * needed for selection and expansion.
 *
 * Seeds are the fundamental starting points for writing in the
 * Saligo Writing methodology - small nuggets of thought that can
 * grow into full documents.
 */
export interface SeedNote {
	/**
	 * Obsidian file reference
	 */
	file: TFile;

	/**
	 * Note title (filename without extension)
	 */
	title: string;

	/**
	 * Full note content (raw markdown)
	 */
	content: string;

	/**
	 * Excerpt for preview (first 150 chars, cleaned)
	 * Removes frontmatter, headers, links, tags
	 */
	excerpt: string;

	/**
	 * All tags found in the note (both inline and frontmatter)
	 * Normalized to lowercase, without # prefix
	 */
	tags: string[];

	/**
	 * Creation timestamp (Unix milliseconds)
	 */
	createdAt: number;

	/**
	 * Last modification timestamp (Unix milliseconds)
	 */
	modifiedAt: number;

	/**
	 * Files that link to this note (backlinks)
	 * Array of file paths relative to vault root
	 */
	backlinks: string[];

	/**
	 * File path relative to vault root
	 */
	path: string;
}

/**
 * Seed Gather Options
 *
 * Configuration for filtering and sorting seed notes.
 */
export interface SeedGatherOptions {
	/**
	 * Tags to search for
	 * If not provided, uses tags from plugin settings
	 */
	tags?: string[];

	/**
	 * Date filter for created date
	 * - 'today': Created today (00:00 to 23:59)
	 * - 'week': Created in last 7 days
	 * - 'month': Created in last 30 days
	 * - 'all': No date filter
	 *
	 * @default 'all'
	 */
	dateFilter?: 'today' | 'week' | 'month' | 'all';

	/**
	 * Sort field
	 * @default 'created'
	 */
	sortBy?: 'created' | 'modified' | 'title';

	/**
	 * Sort order
	 * @default 'desc'
	 */
	sortOrder?: 'asc' | 'desc';

	/**
	 * Maximum number of results to return
	 * Useful for performance and UI pagination
	 *
	 * @default undefined (no limit)
	 */
	limit?: number;
}

/**
 * Seed Gather Result
 *
 * Results of a seed gathering operation with metadata.
 */
export interface SeedGatherResult {
	/**
	 * Filtered and sorted seed notes
	 */
	seeds: SeedNote[];

	/**
	 * Total number of seed notes in vault (before filtering)
	 */
	totalCount: number;

	/**
	 * Number of notes after filtering
	 */
	filteredCount: number;

	/**
	 * Tags that were searched for
	 */
	tags: string[];
}

/**
 * Date filter utility type
 * Used internally for date range calculations
 */
export interface DateRange {
	start: number; // Unix timestamp
	end: number; // Unix timestamp
}

/**
 * Map of Content (MOC) Note Data Model
 *
 * Represents a MOC note with its structure and metadata.
 * MOCs are hub notes that organize related notes through links
 * and hierarchical headings (Zettelkasten, PARA, etc.).
 *
 * Detection methods (in priority order):
 * 1. YAML frontmatter: type: moc
 * 2. Tag: #moc
 * 3. Folder pattern: in "MOCs/", "Maps/", etc.
 */
export interface MOCNote {
	/**
	 * Obsidian file reference
	 */
	file: TFile;

	/**
	 * Note title (filename without extension)
	 */
	title: string;

	/**
	 * File path relative to vault root
	 */
	path: string;

	/**
	 * All links extracted from MOC content
	 */
	links: MOCLink[];

	/**
	 * Heading hierarchy parsed from content
	 */
	headings: MOCHeading[];

	/**
	 * Total number of links in MOC
	 */
	linkCount: number;

	/**
	 * Creation timestamp (Unix milliseconds)
	 */
	createdAt: number;

	/**
	 * Last modification timestamp (Unix milliseconds)
	 */
	modifiedAt: number;

	/**
	 * Whether this is a Living MOC
	 * (auto-updates from seed tags)
	 */
	isLivingMOC: boolean;

	/**
	 * Whether to auto-gather seeds based on tags
	 */
	autoGatherSeeds: boolean;

	/**
	 * Tags to gather seeds from (for Living MOCs)
	 */
	seedTags: string[];

	/**
	 * How frequently to update auto-gathered content
	 */
	updateFrequency: 'realtime' | 'daily' | 'manual';

	/**
	 * Character positions of auto-update markers
	 * null if no markers found
	 */
	autoUpdateMarkers: { start: number; end: number } | null;
}

/**
 * Link extracted from MOC content
 *
 * Represents a wikilink with contextual information
 * about its position and parent structure.
 */
export interface MOCLink {
	/**
	 * Link target path (without extension)
	 * e.g., "Notes/Idea" for [[Notes/Idea]]
	 */
	path: string;

	/**
	 * Display text for the link
	 * e.g., "My Idea" for [[Notes/Idea|My Idea]]
	 * Same as path if no alias
	 */
	displayText: string;

	/**
	 * Parent heading text (if link is under a heading)
	 * null if at document root
	 */
	heading: string | null;

	/**
	 * Line number in file (0-indexed)
	 */
	lineNumber: number;

	/**
	 * Whether link is inside auto-update section
	 * (between WRITEALIVE-AUTO markers)
	 */
	isInAutoSection: boolean;
}

/**
 * Heading in MOC structure
 *
 * Represents a hierarchical heading with its children.
 * Used to understand MOC organization and structure.
 */
export interface MOCHeading {
	/**
	 * Heading level (1-6)
	 * 1 = #, 2 = ##, etc.
	 */
	level: number;

	/**
	 * Heading text (without # prefix)
	 */
	text: string;

	/**
	 * Line number in file (0-indexed)
	 */
	lineNumber: number;

	/**
	 * Child headings (one level deeper)
	 */
	children: MOCHeading[];
}

/**
 * MOC Detection Options
 *
 * Configuration for finding and filtering MOCs in vault.
 */
export interface MOCDetectionOptions {
	/**
	 * Folder patterns to include
	 * e.g., ["MOCs/", "Maps/", "00 Maps/"]
	 * Default: standard MOC folder patterns
	 */
	includeFolderPatterns?: string[];

	/**
	 * Folder patterns to exclude
	 * e.g., [".trash/", "Archive/"]
	 */
	excludeFolderPatterns?: string[];

	/**
	 * Tag to identify MOCs
	 * Default: "moc"
	 */
	tagFilter?: string;

	/**
	 * YAML type field value to identify MOCs
	 * Default: "moc"
	 */
	yamlTypeFilter?: string;
}

/**
 * MOC Detection Result
 *
 * Results of a MOC detection operation with metadata.
 */
export interface MOCDetectionResult {
	/**
	 * All detected MOCs
	 */
	mocs: MOCNote[];

	/**
	 * Total number of MOCs found
	 */
	totalCount: number;

	/**
	 * Detection method used for each MOC
	 * Maps file path to detection method
	 */
	detectionMethod: Map<string, 'tag' | 'folder' | 'yaml'>;
}

/**
 * Living MOC Update Record
 *
 * Represents a single auto-update operation on a Living MOC.
 * Used for tracking history and implementing undo functionality.
 */
export interface LivingMOCUpdate {
	/**
	 * MOC file that was updated
	 */
	mocFile: TFile;

	/**
	 * New seeds that were added in this update
	 */
	newSeeds: SeedNote[];

	/**
	 * Paths to added seed notes (for undo)
	 */
	addedLinks: string[];

	/**
	 * When this update occurred (Unix milliseconds)
	 */
	timestamp: number;

	/**
	 * Update mode used
	 */
	updateMode: 'realtime' | 'daily' | 'manual';

	/**
	 * Previous content of auto-section (for undo)
	 */
	previousContent: string;
}

/**
 * Living MOC Update Options
 *
 * Configuration options for MOC update operations.
 */
export interface LivingMOCUpdateOptions {
	/**
	 * Override update mode from MOC frontmatter
	 * If not specified, uses MOC's configured mode
	 */
	mode?: 'realtime' | 'daily' | 'manual';

	/**
	 * Show notification to user when seeds added
	 * @default false
	 */
	notifyUser?: boolean;

	/**
	 * Preview changes without applying them
	 * Useful for showing what would be added
	 * @default false
	 */
	dryRun?: boolean;

	/**
	 * Force update even if frequency check fails
	 * (e.g., force daily update before 24h elapsed)
	 * @default false
	 */
	forceUpdate?: boolean;
}

/**
 * Living MOC Update Result
 *
 * Results of an update operation across multiple MOCs.
 */
export interface LivingMOCUpdateResult {
	/**
	 * Whether overall operation succeeded
	 */
	success: boolean;

	/**
	 * Number of MOCs updated
	 */
	mocsUpdated: number;

	/**
	 * Total number of seeds added across all MOCs
	 */
	seedsAdded: number;

	/**
	 * Detailed update records for each MOC
	 */
	updates: LivingMOCUpdate[];

	/**
	 * Errors encountered during update
	 */
	errors: Array<{ mocPath: string; error: string }>;
}
