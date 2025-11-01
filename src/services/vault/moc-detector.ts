/**
 * MOC (Map of Content) Detector Service
 *
 * Responsible for detecting and parsing MOC notes from the vault.
 * MOCs are hub notes that organize knowledge through links and structure.
 *
 * Design Principles:
 * - Single Responsibility: Only handles MOC detection and parsing
 * - Performance: Uses caching, metadata cache, lazy content reading
 * - Flexibility: Supports multiple detection methods (YAML, tags, folders)
 * - Living MOCs: Supports auto-updating MOCs with seed gathering
 *
 * Detection Methods (in priority order):
 * 1. YAML frontmatter: type: moc
 * 2. Tag: #moc
 * 3. Folder pattern: "MOCs/", "Maps/", etc.
 *
 * Performance Targets:
 * - 100 MOCs detection: <500ms
 * - Single MOC parse: <50ms
 * - Cache hit: <1ms
 */

import type { App, TFile, CachedMetadata } from 'obsidian';
import type {
	MOCNote,
	MOCLink,
	MOCHeading,
	MOCDetectionOptions,
	MOCDetectionResult,
} from './types';

/**
 * Default folder patterns for MOC detection
 *
 * Common folder naming conventions in PKM systems:
 * - MOCs/ - Standard MOC folder
 * - Maps/ - Alternative naming
 * - Map of Contents/ - Full spelling
 * - 00 Maps/ - Numbered prefix (Johnny Decimal, etc.)
 * - _MOCs/ - Underscore prefix
 */
const DEFAULT_MOC_FOLDERS = [
	'MOCs/',
	'Maps/',
	'Map of Contents/',
	'00 Maps/',
	'_MOCs/',
];

/**
 * Cache entry for parsed MOCs
 */
interface MOCCacheEntry {
	moc: MOCNote;
	cachedAt: number;
	fileModified: number;
}

/**
 * MOCDetector Service
 *
 * Main service for detecting and parsing MOC notes.
 */
export class MOCDetector {
	/**
	 * Parsed MOC cache
	 * Maps file path to cache entry
	 */
	private mocCache: Map<string, MOCCacheEntry> = new Map();

	/**
	 * Last full vault scan timestamp
	 * (Currently unused, reserved for future optimization)
	 */
	// private lastScanTime: number = 0;

	/**
	 * Cache expiry time (5 minutes)
	 */
	private readonly CACHE_EXPIRY_MS = 5 * 60 * 1000;

	constructor(private app: App) {}

	/**
	 * Detect all MOCs in vault
	 *
	 * Scans all markdown files and identifies MOCs using
	 * configured detection methods.
	 *
	 * Algorithm:
	 * 1. Get all markdown files
	 * 2. Check each file with detection methods (YAML → tag → folder)
	 * 3. Parse MOC structure for detected files
	 * 4. Cache results
	 *
	 * Performance: O(n) where n = number of markdown files
	 * - Uses metadata cache for YAML/tag checks (O(1) per file)
	 * - Only reads content when needed for parsing
	 *
	 * @param options - Detection configuration
	 * @returns All detected MOCs with detection metadata
	 */
	async detectMOCs(
		options?: MOCDetectionOptions
	): Promise<MOCDetectionResult> {
		const allFiles = this.app.vault.getMarkdownFiles();
		const mocs: MOCNote[] = [];
		const detectionMethod = new Map<string, 'tag' | 'folder' | 'yaml'>();

		for (const file of allFiles) {
			const method = await this.detectMOCMethod(file, options);
			if (method) {
				const moc = await this.parseMOC(file);
				mocs.push(moc);
				detectionMethod.set(file.path, method);
			}
		}

		// this.lastScanTime = Date.now();

		return {
			mocs,
			totalCount: mocs.length,
			detectionMethod,
		};
	}

	/**
	 * Check if a file is a MOC and return detection method
	 *
	 * Detection priority:
	 * 1. YAML frontmatter: type: moc
	 * 2. Tag: #moc
	 * 3. Folder pattern: in MOC folder
	 *
	 * @param file - File to check
	 * @param options - Detection options
	 * @returns Detection method or null if not a MOC
	 */
	private async detectMOCMethod(
		file: TFile,
		options?: MOCDetectionOptions
	): Promise<'yaml' | 'tag' | 'folder' | null> {
		const metadata = this.app.metadataCache.getFileCache(file);

		// Method 1: Check YAML frontmatter
		if (this.isMOCByYAML(metadata, options)) {
			return 'yaml';
		}

		// Method 2: Check tags
		if (this.isMOCByTag(metadata, options)) {
			return 'tag';
		}

		// Method 3: Check folder pattern
		if (this.isMOCByFolder(file, options)) {
			return 'folder';
		}

		return null;
	}

	/**
	 * Check if a file is a MOC (boolean)
	 *
	 * Public wrapper for MOC detection.
	 *
	 * @param file - File to check
	 * @param options - Detection options
	 * @returns true if file is a MOC
	 */
	async isMOC(file: TFile, options?: MOCDetectionOptions): Promise<boolean> {
		const method = await this.detectMOCMethod(file, options);
		return method !== null;
	}

	/**
	 * Check if file is MOC by YAML frontmatter
	 *
	 * Looks for: type: moc
	 *
	 * @param metadata - File metadata cache
	 * @param options - Detection options
	 * @returns true if YAML indicates MOC
	 */
	private isMOCByYAML(
		metadata: CachedMetadata | null,
		options?: MOCDetectionOptions
	): boolean {
		if (!metadata || !metadata.frontmatter) {
			return false;
		}

		const typeValue = metadata.frontmatter.type;
		const expectedType = options?.yamlTypeFilter || 'moc';

		return (
			typeof typeValue === 'string' &&
			typeValue.toLowerCase() === expectedType.toLowerCase()
		);
	}

	/**
	 * Check if file is MOC by tag
	 *
	 * Looks for: #moc tag (inline or frontmatter)
	 *
	 * @param metadata - File metadata cache
	 * @param options - Detection options
	 * @returns true if file has MOC tag
	 */
	private isMOCByTag(
		metadata: CachedMetadata | null,
		options?: MOCDetectionOptions
	): boolean {
		if (!metadata) {
			return false;
		}

		const targetTag = (options?.tagFilter || 'moc').toLowerCase();

		// Check inline tags
		if (metadata.tags) {
			for (const tagRef of metadata.tags) {
				const tag = tagRef.tag.startsWith('#')
					? tagRef.tag.slice(1)
					: tagRef.tag;
				if (tag.toLowerCase() === targetTag) {
					return true;
				}
			}
		}

		// Check frontmatter tags
		if (metadata.frontmatter) {
			const fmTags = metadata.frontmatter.tags || metadata.frontmatter.tag;

			if (Array.isArray(fmTags)) {
				for (const tag of fmTags) {
					if (
						typeof tag === 'string' &&
						tag.toLowerCase() === targetTag
					) {
						return true;
					}
				}
			} else if (typeof fmTags === 'string') {
				if (fmTags.toLowerCase() === targetTag) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Check if file is MOC by folder pattern
	 *
	 * Checks if file path contains any of the MOC folder patterns.
	 *
	 * @param file - File to check
	 * @param options - Detection options
	 * @returns true if file is in MOC folder
	 */
	private isMOCByFolder(
		file: TFile,
		options?: MOCDetectionOptions
	): boolean {
		const folderPatterns =
			options?.includeFolderPatterns || DEFAULT_MOC_FOLDERS;
		const excludePatterns = options?.excludeFolderPatterns || [];

		// Check exclude patterns first
		for (const pattern of excludePatterns) {
			if (file.path.includes(pattern)) {
				return false;
			}
		}

		// Check include patterns
		for (const pattern of folderPatterns) {
			if (file.path.includes(pattern)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Parse MOC structure
	 *
	 * Extracts full MOC data including:
	 * - Links and their context
	 * - Heading hierarchy
	 * - Living MOC configuration
	 * - Auto-update markers
	 *
	 * Uses cache to avoid redundant parsing.
	 *
	 * Performance: <50ms for typical MOC (100 links, 20 headings)
	 *
	 * @param file - MOC file to parse
	 * @returns Fully parsed MOC note
	 */
	async parseMOC(file: TFile): Promise<MOCNote> {
		// Check cache first
		const cached = this.getCachedMOC(file.path);
		if (cached && cached.fileModified === file.stat.mtime) {
			return cached.moc;
		}

		// Read content
		const content = await this.app.vault.read(file);
		const metadata = this.app.metadataCache.getFileCache(file);

		// Parse components
		const links = await this.extractLinks(file, content);
		const headings = this.parseHeadings(content);
		const livingConfig = this.parseLivingMOCConfig(
			metadata?.frontmatter || {}
		);
		const autoUpdateMarkers = this.findAutoUpdateMarkers(content);

		const moc: MOCNote = {
			file,
			title: file.basename,
			path: file.path,
			links,
			headings,
			linkCount: links.length,
			createdAt: file.stat.ctime,
			modifiedAt: file.stat.mtime,
			...livingConfig,
			autoUpdateMarkers,
		};

		// Cache the result
		this.mocCache.set(file.path, {
			moc,
			cachedAt: Date.now(),
			fileModified: file.stat.mtime,
		});

		return moc;
	}

	/**
	 * Extract all links from MOC content
	 *
	 * Parses wikilinks with context:
	 * - Link path and display text
	 * - Parent heading
	 * - Line number
	 * - Whether in auto-update section
	 *
	 * Handles link formats:
	 * - [[Note]] - Simple link
	 * - [[Note|Alias]] - Link with alias
	 * - [[Note#Section]] - Link to section
	 * - [[Note#Section|Alias]] - Section link with alias
	 * - ![[Note]] - Embed (treated as link)
	 *
	 * Performance: O(n) where n = number of lines
	 *
	 * @param file - File being parsed
	 * @param content - File content
	 * @returns Array of parsed links with context
	 */
	private async extractLinks(file: TFile, content: string): Promise<MOCLink[]> {
		const links: MOCLink[] = [];
		const lines = content.split('\n');

		// Find auto-update section bounds
		const autoMarkers = this.findAutoUpdateMarkers(content);
		const autoStart = autoMarkers?.start || -1;
		const autoEnd = autoMarkers?.end || -1;

		// Parse headings to find parent heading for each line
		const headings = this.parseHeadings(content);
		const headingMap = this.buildHeadingMap(headings, lines);

		// Extract links from metadata cache (includes embeds)
		const metadata = this.app.metadataCache.getFileCache(file);
		const cachedLinks = metadata?.links || [];
		const cachedEmbeds = metadata?.embeds || [];
		const allLinkRefs = [...cachedLinks, ...cachedEmbeds];

		// Process each link reference
		for (const linkRef of allLinkRefs) {
			const lineNumber = linkRef.position.start.line;

			// Parse link components
			const linkText = linkRef.link;
			const parts = linkText.split('|');
			const pathPart = parts[0].split('#')[0]; // Remove section
			const displayText =
				parts.length > 1 ? parts[1] : parts[0].split('#')[0];

			// Determine if in auto-update section
			// Calculate character position in document
			let charPosition = 0;
			for (let i = 0; i < lineNumber; i++) {
				charPosition += lines[i].length + 1; // +1 for \n
			}
			charPosition += linkRef.position.start.col;

			// Check if this character position falls within auto-update markers
			const isInAutoSection =
				autoStart !== -1 &&
				autoEnd !== -1 &&
				charPosition >= autoStart &&
				charPosition < autoEnd; // Use < instead of <= to exclude end marker

			links.push({
				path: pathPart,
				displayText,
				heading: headingMap.get(lineNumber) || null,
				lineNumber,
				isInAutoSection,
			});
		}

		return links;
	}

	/**
	 * Build map of line numbers to parent headings
	 *
	 * Creates a lookup table for finding the parent heading
	 * for any line in the document.
	 *
	 * @param headings - Parsed headings hierarchy
	 * @param lines - File lines
	 * @returns Map of line number to heading text
	 */
	private buildHeadingMap(
		headings: MOCHeading[],
		lines: string[]
	): Map<number, string> {
		const map = new Map<number, string>();

		const processHeading = (heading: MOCHeading, endLine: number) => {
			// Process children first (depth-first)
			// This ensures child headings take precedence over parent
			for (let i = 0; i < heading.children.length; i++) {
				const child = heading.children[i];
				const childEnd =
					i < heading.children.length - 1
						? heading.children[i + 1].lineNumber
						: endLine;
				processHeading(child, childEnd);
			}

			// Then assign this heading to all lines between heading and first child
			// (or end if no children)
			const firstChildLine =
				heading.children.length > 0
					? heading.children[0].lineNumber
					: endLine;

			for (let i = heading.lineNumber + 1; i < firstChildLine; i++) {
				if (!map.has(i)) {
					map.set(i, heading.text);
				}
			}
		};

		// Process top-level headings
		for (let i = 0; i < headings.length; i++) {
			const heading = headings[i];
			const endLine =
				i < headings.length - 1
					? headings[i + 1].lineNumber
					: lines.length;
			processHeading(heading, endLine);
		}

		return map;
	}

	/**
	 * Parse headings hierarchy
	 *
	 * Builds a tree structure of headings based on their levels.
	 *
	 * Algorithm:
	 * 1. Extract all headings with line numbers
	 * 2. Build parent-child relationships based on level
	 * 3. Return top-level headings (level 1 or first level encountered)
	 *
	 * Example:
	 * # Level 1
	 * ## Level 2a
	 * ### Level 3
	 * ## Level 2b
	 *
	 * →
	 * {
	 *   level: 1,
	 *   text: "Level 1",
	 *   children: [
	 *     { level: 2, text: "Level 2a", children: [
	 *       { level: 3, text: "Level 3", children: [] }
	 *     ]},
	 *     { level: 2, text: "Level 2b", children: [] }
	 *   ]
	 * }
	 *
	 * Performance: O(n) where n = number of headings
	 *
	 * @param content - File content
	 * @returns Array of top-level headings with nested children
	 */
	private parseHeadings(content: string): MOCHeading[] {
		const lines = content.split('\n');
		const flatHeadings: MOCHeading[] = [];

		// Extract all headings
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const match = line.match(/^(#{1,6})\s+(.+)$/);

			if (match) {
				const level = match[1].length;
				const text = match[2].trim();

				flatHeadings.push({
					level,
					text,
					lineNumber: i,
					children: [],
				});
			}
		}

		// Build hierarchy
		return this.buildHeadingHierarchy(flatHeadings);
	}

	/**
	 * Build heading hierarchy from flat list
	 *
	 * Converts flat array of headings into tree structure.
	 *
	 * @param flatHeadings - Flat array of headings in document order
	 * @returns Top-level headings with nested children
	 */
	private buildHeadingHierarchy(flatHeadings: MOCHeading[]): MOCHeading[] {
		if (flatHeadings.length === 0) {
			return [];
		}

		const root: MOCHeading[] = [];
		const stack: MOCHeading[] = [];

		for (const heading of flatHeadings) {
			// Create new heading (without children from previous iterations)
			const newHeading: MOCHeading = {
				level: heading.level,
				text: heading.text,
				lineNumber: heading.lineNumber,
				children: [],
			};

			// Pop stack until we find appropriate parent
			while (
				stack.length > 0 &&
				stack[stack.length - 1].level >= newHeading.level
			) {
				stack.pop();
			}

			// Add to parent or root
			if (stack.length === 0) {
				root.push(newHeading);
			} else {
				stack[stack.length - 1].children.push(newHeading);
			}

			// Push to stack for potential children
			stack.push(newHeading);
		}

		return root;
	}

	/**
	 * Parse Living MOC configuration from frontmatter
	 *
	 * Detects WriteAlive-specific MOC configuration:
	 * - writealive.auto_gather_seeds: true
	 * - writealive.seed_tags: [tag1, tag2]
	 * - writealive.update_frequency: realtime|daily|manual
	 *
	 * Example frontmatter:
	 * ---
	 * type: moc
	 * writealive:
	 *   auto_gather_seeds: true
	 *   seed_tags: [creativity, practice]
	 *   update_frequency: daily
	 * ---
	 *
	 * @param frontmatter - Frontmatter object
	 * @returns Living MOC configuration
	 */
	private parseLivingMOCConfig(frontmatter: any): {
		isLivingMOC: boolean;
		autoGatherSeeds: boolean;
		seedTags: string[];
		updateFrequency: 'realtime' | 'daily' | 'manual';
	} {
		const writealive = frontmatter.writealive || {};

		const autoGatherSeeds = writealive.auto_gather_seeds === true;
		const seedTags = Array.isArray(writealive.seed_tags)
			? writealive.seed_tags
					.filter((t: any) => typeof t === 'string')
					.map((t: string) => t.toLowerCase().trim())
			: [];

		const updateFrequency = ['realtime', 'daily', 'manual'].includes(
			writealive.update_frequency
		)
			? writealive.update_frequency
			: 'manual';

		return {
			isLivingMOC: autoGatherSeeds && seedTags.length > 0,
			autoGatherSeeds,
			seedTags,
			updateFrequency,
		};
	}

	/**
	 * Find auto-update markers in content
	 *
	 * Searches for WriteAlive auto-update section markers:
	 * <!-- BEGIN WRITEALIVE-AUTO -->
	 * ...content...
	 * <!-- END WRITEALIVE-AUTO -->
	 *
	 * Returns character positions (not line numbers) for precise
	 * content replacement during auto-updates.
	 *
	 * @param content - File content
	 * @returns Character positions of markers, or null if not found
	 */
	private findAutoUpdateMarkers(
		content: string
	): { start: number; end: number } | null {
		const beginMarker = '<!-- BEGIN WRITEALIVE-AUTO -->';
		const endMarker = '<!-- END WRITEALIVE-AUTO -->';

		const startPos = content.indexOf(beginMarker);
		const endPos = content.indexOf(endMarker);

		if (startPos === -1 || endPos === -1 || startPos >= endPos) {
			return null;
		}

		return {
			start: startPos + beginMarker.length,
			end: endPos,
		};
	}

	/**
	 * Clear MOC cache
	 *
	 * Removes all cached MOC data.
	 * Useful when vault structure changes significantly.
	 */
	clearCache(): void {
		this.mocCache.clear();
		// this.lastScanTime = 0;
	}

	/**
	 * Get cached MOC
	 *
	 * Returns cached MOC if available and not expired.
	 *
	 * @param path - File path
	 * @returns Cached MOC entry or undefined
	 */
	getCachedMOC(path: string): MOCCacheEntry | undefined {
		const cached = this.mocCache.get(path);

		if (!cached) {
			return undefined;
		}

		// Check expiry
		const age = Date.now() - cached.cachedAt;
		if (age > this.CACHE_EXPIRY_MS) {
			this.mocCache.delete(path);
			return undefined;
		}

		return cached;
	}
}
