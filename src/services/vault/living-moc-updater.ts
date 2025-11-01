/**
 * Living MOC Updater Service
 *
 * Responsible for auto-updating Living MOCs with new matching seeds.
 * Implements the "Living MOC" pattern where Maps of Content evolve
 * automatically as new related notes are created.
 *
 * Design Principles:
 * - Non-Destructive: Never modifies content outside auto-update markers
 * - Reversible: Maintains update history for undo functionality
 * - Performance: Incremental updates, avoids full vault scans
 * - Event-Driven: Responds to file changes in realtime mode
 *
 * Core Operations:
 * 1. Detect Living MOCs (auto_gather_seeds: true in frontmatter)
 * 2. Find matching seeds by configured tags
 * 3. Update auto-section between markers
 * 4. Track update history for undo
 * 5. Respect update frequency (realtime, daily, manual)
 *
 * Update Modes:
 * - realtime: Updates immediately when new seed created/modified
 * - daily: Updates once per day (at first check after midnight)
 * - manual: Only updates when explicitly triggered
 *
 * Performance Targets:
 * - Single MOC update: <100ms
 * - Batch update (10 MOCs): <1s
 * - File change event handling: <50ms (debounced)
 */

import type { App, TFile, EventRef } from 'obsidian';
import { Notice } from 'obsidian';
import type { SeedGatherer } from './seed-gatherer';
import type { MOCDetector } from './moc-detector';
import type {
	MOCNote,
	SeedNote,
	LivingMOCUpdate,
	LivingMOCUpdateOptions,
	LivingMOCUpdateResult,
} from './types';

/**
 * Debounce timer map for file changes
 * Maps file path to timeout ID
 */
type DebounceTimers = Map<string, NodeJS.Timeout>;

/**
 * LivingMOCUpdater Service
 *
 * Main service for managing Living MOC auto-updates.
 */
export class LivingMOCUpdater {
	/**
	 * Last update timestamp for each MOC
	 * Maps MOC file path to timestamp
	 */
	private lastUpdate: Map<string, number> = new Map();

	/**
	 * Update history for undo functionality
	 * Stores last 10 updates per MOC
	 */
	private updateHistory: Map<string, LivingMOCUpdate[]> = new Map();

	/**
	 * Maximum number of updates to keep in history per MOC
	 */
	private readonly MAX_HISTORY_PER_MOC = 10;

	/**
	 * Debounce timers for file change events
	 * Prevents rapid-fire updates when user is typing
	 */
	private debounceTimers: DebounceTimers = new Map();

	/**
	 * Debounce delay in milliseconds
	 * Wait this long after file change before processing
	 */
	private readonly DEBOUNCE_DELAY_MS = 5000; // 5 seconds

	/**
	 * Event references for cleanup
	 */
	private eventRefs: EventRef[] = [];

	constructor(
		private app: App,
		private seedGatherer: SeedGatherer,
		private mocDetector: MOCDetector
	) {}

	/**
	 * Find and update all Living MOCs
	 *
	 * Scans vault for Living MOCs and updates each one with
	 * matching seeds created/modified since last update.
	 *
	 * Algorithm:
	 * 1. Detect all MOCs in vault
	 * 2. Filter for Living MOCs (auto_gather_seeds: true)
	 * 3. Update each MOC independently
	 * 4. Collect results and errors
	 *
	 * Performance: O(n) where n = number of MOCs
	 * - Most time spent in file I/O (reading/writing MOC content)
	 * - Uses cached MOC detection when possible
	 *
	 * @param options - Update configuration
	 * @returns Summary of update operation
	 */
	async updateAllLivingMOCs(
		options?: LivingMOCUpdateOptions
	): Promise<LivingMOCUpdateResult> {
		const result: LivingMOCUpdateResult = {
			success: true,
			mocsUpdated: 0,
			seedsAdded: 0,
			updates: [],
			errors: [],
		};

		try {
			// Detect all MOCs in vault
			const detection = await this.mocDetector.detectMOCs();

			// Filter for Living MOCs
			const livingMOCs = detection.mocs.filter(
				(moc) => moc.isLivingMOC && moc.autoGatherSeeds
			);

			// Update each Living MOC
			for (const moc of livingMOCs) {
				try {
					const update = await this.updateLivingMOC(moc.file, options);

					if (update) {
						result.updates.push(update);
						result.mocsUpdated++;
						result.seedsAdded += update.newSeeds.length;
					}
				} catch (error) {
					result.errors.push({
						mocPath: moc.path,
						error:
							error instanceof Error
								? error.message
								: String(error),
					});
				}
			}

			// Mark as failed if any errors occurred
			if (result.errors.length > 0) {
				result.success = false;
			}
		} catch (error) {
			result.success = false;
			result.errors.push({
				mocPath: 'vault-scan',
				error: error instanceof Error ? error.message : String(error),
			});
		}

		return result;
	}

	/**
	 * Update a single Living MOC
	 *
	 * Main update workflow:
	 * 1. Parse MOC and verify it's a Living MOC
	 * 2. Check update frequency constraints
	 * 3. Find matching seeds since last update
	 * 4. Update MOC content if new seeds found
	 * 5. Record update in history
	 *
	 * @param mocFile - MOC file to update
	 * @param options - Update configuration
	 * @returns Update record or null if no update needed
	 */
	async updateLivingMOC(
		mocFile: TFile,
		options?: LivingMOCUpdateOptions
	): Promise<LivingMOCUpdate | null> {
		// 1. Parse MOC
		const moc = await this.mocDetector.parseMOC(mocFile);

		// 2. Verify Living MOC
		if (!moc.isLivingMOC || !moc.autoGatherSeeds) {
			return null;
		}

		// 3. Check update frequency (unless force update)
		if (!options?.forceUpdate) {
			const lastUpdateTime = this.lastUpdate.get(mocFile.path) || 0;

			if (
				moc.updateFrequency === 'daily' &&
				!this.shouldUpdateDaily(lastUpdateTime)
			) {
				return null;
			}

			if (moc.updateFrequency === 'manual' && !options?.mode) {
				return null;
			}
		}

		// 4. Find matching seeds
		const lastUpdateTime = this.lastUpdate.get(mocFile.path) || 0;
		const newSeeds = await this.findMatchingSeeds(moc, lastUpdateTime);

		if (newSeeds.length === 0) {
			return null;
		}

		// 5. Preview mode (dry run)
		if (options?.dryRun) {
			// Return what would be added without modifying file
			return {
				mocFile,
				newSeeds,
				addedLinks: newSeeds.map((s) => s.path),
				timestamp: Date.now(),
				updateMode: moc.updateFrequency,
				previousContent: '',
			};
		}

		// 6. Update content
		const { addedLinks, previousContent } = await this.updateMOCContent(
			mocFile,
			moc,
			newSeeds
		);

		// 7. Record update
		const update: LivingMOCUpdate = {
			mocFile,
			newSeeds,
			addedLinks,
			timestamp: Date.now(),
			updateMode: moc.updateFrequency,
			previousContent,
		};

		// Add to history
		this.addToHistory(mocFile.path, update);

		// Update last update time
		this.lastUpdate.set(mocFile.path, update.timestamp);

		// 8. Notify user
		if (options?.notifyUser) {
			new Notice(
				`WriteAlive: ${newSeeds.length} new seed(s) added to "${moc.title}"`
			);
		}

		return update;
	}

	/**
	 * Find new seeds matching MOC's seed tags
	 *
	 * Searches vault for seeds that:
	 * 1. Have tags matching MOC's seed_tags
	 * 2. Were created/modified after last update (if sinceTimestamp provided)
	 * 3. Are not already linked in the MOC
	 *
	 * Performance: O(n) where n = number of files in vault
	 * - Uses metadata cache for tag matching (fast)
	 * - Filters in memory (no additional file I/O)
	 *
	 * @param moc - MOC to find seeds for
	 * @param sinceTimestamp - Only include seeds created/modified after this time
	 * @returns New matching seeds
	 */
	private async findMatchingSeeds(
		moc: MOCNote,
		sinceTimestamp?: number
	): Promise<SeedNote[]> {
		// Gather all seeds with matching tags
		const result = await this.seedGatherer.gatherSeeds({
			tags: moc.seedTags,
			sortBy: 'created',
			sortOrder: 'desc',
		});

		// Get existing links in MOC (to avoid duplicates)
		const existingPaths = new Set(moc.links.map((link) => link.path));

		// Filter seeds
		const matchingSeeds = result.seeds.filter((seed) => {
			// Skip if already linked in MOC
			if (
				existingPaths.has(seed.path) ||
				existingPaths.has(seed.file.basename)
			) {
				return false;
			}

			// Skip if older than last update (for incremental updates)
			if (sinceTimestamp && seed.createdAt < sinceTimestamp) {
				return false;
			}

			// Include if has any matching tag
			return this.seedMatchesMOC(seed, moc);
		});

		return matchingSeeds;
	}

	/**
	 * Check if seed matches any of MOC's seed tags
	 *
	 * Case-insensitive tag matching.
	 *
	 * @param seed - Seed to check
	 * @param moc - MOC with seed tags
	 * @returns true if seed has at least one matching tag
	 */
	private seedMatchesMOC(seed: SeedNote, moc: MOCNote): boolean {
		const mocTagsSet = new Set(moc.seedTags.map((t) => t.toLowerCase()));

		for (const seedTag of seed.tags) {
			if (mocTagsSet.has(seedTag.toLowerCase())) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Update MOC content with new seeds
	 *
	 * Non-destructive update process:
	 * 1. Read current content
	 * 2. Verify auto-update markers exist
	 * 3. Extract existing links in auto-section
	 * 4. Filter out duplicates
	 * 5. Sort new seeds by recency (newest first)
	 * 6. Format as markdown links
	 * 7. Reconstruct content (preserving manual content)
	 * 8. Write back to file
	 *
	 * Content Structure:
	 * ```
	 * [manual content before markers]
	 * <!-- BEGIN WRITEALIVE-AUTO -->
	 * - [[2025-11-01]] - "excerpt..." #tag1 #tag2
	 * - [[2025-10-31]] - "excerpt..." #tag3
	 * <!-- END WRITEALIVE-AUTO -->
	 * [manual content after markers]
	 * ```
	 *
	 * Performance: O(n) where n = number of new seeds
	 *
	 * @param mocFile - MOC file to update
	 * @param moc - Parsed MOC data
	 * @param newSeeds - Seeds to add
	 * @returns Paths of added links and previous auto-section content
	 */
	private async updateMOCContent(
		mocFile: TFile,
		moc: MOCNote,
		newSeeds: SeedNote[]
	): Promise<{ addedLinks: string[]; previousContent: string }> {
		// Read current content
		const content = await this.app.vault.read(mocFile);

		// Verify markers exist
		if (!moc.autoUpdateMarkers) {
			throw new Error(
				`Missing auto-update markers in "${moc.title}". Add <!-- BEGIN WRITEALIVE-AUTO --> and <!-- END WRITEALIVE-AUTO --> to the file.`
			);
		}

		const { start, end } = moc.autoUpdateMarkers;

		// Extract current auto-section content (for undo)
		const previousContent = content.substring(start, end);

		// Get existing links in auto-section
		const existingInAutoSection = moc.links
			.filter((link) => link.isInAutoSection)
			.map((link) => link.path);

		// Filter out duplicates (shouldn't happen, but be safe)
		const existingSet = new Set(existingInAutoSection);
		const newUnique = newSeeds.filter(
			(seed) =>
				!existingSet.has(seed.path) &&
				!existingSet.has(seed.file.basename)
		);

		// Sort by recency (newest first)
		newUnique.sort((a, b) => b.createdAt - a.createdAt);

		// Format links
		const newLinks = newUnique.map((seed) => this.formatSeedLink(seed));

		// Get existing links in auto-section
		const existingLinks = previousContent
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.startsWith('-'));

		// Combine: new links first, then existing links
		const allLinks = [...newLinks, ...existingLinks];

		// Reconstruct content
		const before = content.substring(0, start);
		const after = content.substring(end);
		const autoSection = allLinks.join('\n');

		const newContent =
			before +
			(autoSection.length > 0 ? '\n' + autoSection + '\n' : '') +
			after;

		// Write back to file
		await this.app.vault.modify(mocFile, newContent);

		return {
			addedLinks: newUnique.map((s) => s.path),
			previousContent,
		};
	}

	/**
	 * Format seed as markdown link
	 *
	 * Format: - [[note-title]] - "excerpt..." #tag1 #tag2
	 *
	 * Examples:
	 * - [[2025-11-01 Idea]] - "This is a creative thought about..." #creativity #practice
	 * - [[Meeting Notes]] - "Discussed project timeline and..." #work #meeting
	 *
	 * @param seed - Seed to format
	 * @returns Markdown list item
	 */
	private formatSeedLink(seed: SeedNote): string {
		// Truncate excerpt if needed
		const maxExcerptLength = 60;
		const excerpt =
			seed.excerpt.length > maxExcerptLength
				? seed.excerpt.substring(0, maxExcerptLength) + '...'
				: seed.excerpt;

		// Format tags (exclude generic "seed" tag)
		const tags = seed.tags
			.filter((tag) => tag !== 'seed' && tag !== 'moc')
			.map((tag) => `#${tag}`)
			.join(' ');

		// Build link
		const link = `- [[${seed.title}]] - "${excerpt}"${tags.length > 0 ? ' ' + tags : ''}`;

		return link;
	}

	/**
	 * Check if MOC should be updated (daily frequency check)
	 *
	 * Daily updates occur once per day, at the first check after
	 * the day boundary (00:00).
	 *
	 * Examples:
	 * - Last update: Nov 1 at 10:00, now: Nov 1 at 15:00 → false
	 * - Last update: Nov 1 at 10:00, now: Nov 2 at 09:00 → true
	 * - Last update: never (0), now: any time → true
	 *
	 * @param lastUpdateTimestamp - When MOC was last updated
	 * @returns true if update should occur
	 */
	private shouldUpdateDaily(lastUpdateTimestamp: number): boolean {
		if (lastUpdateTimestamp === 0) {
			return true; // Never updated before
		}

		const now = new Date();
		const last = new Date(lastUpdateTimestamp);

		// Check if different day (compare year/month/day)
		return (
			now.getFullYear() !== last.getFullYear() ||
			now.getMonth() !== last.getMonth() ||
			now.getDate() !== last.getDate()
		);
	}

	/**
	 * Add update to history
	 *
	 * Maintains last N updates per MOC for undo functionality.
	 *
	 * @param mocPath - MOC file path
	 * @param update - Update record to add
	 */
	private addToHistory(mocPath: string, update: LivingMOCUpdate): void {
		if (!this.updateHistory.has(mocPath)) {
			this.updateHistory.set(mocPath, []);
		}

		const history = this.updateHistory.get(mocPath)!;
		history.unshift(update);

		// Keep only last N updates
		if (history.length > this.MAX_HISTORY_PER_MOC) {
			history.pop();
		}
	}

	/**
	 * Undo last update for a MOC
	 *
	 * Reverts the most recent auto-update by restoring the
	 * previous content of the auto-section.
	 *
	 * Algorithm:
	 * 1. Find last update in history
	 * 2. Read current MOC content
	 * 3. Replace auto-section with previous content
	 * 4. Write back to file
	 * 5. Remove update from history
	 *
	 * @param mocPath - MOC file path
	 * @returns true if undo succeeded, false if no history found
	 */
	async undoLastUpdate(mocPath: string): Promise<boolean> {
		const history = this.updateHistory.get(mocPath);

		if (!history || history.length === 0) {
			return false;
		}

		const lastUpdate = history[0];

		try {
			// Read current content
			const content = await this.app.vault.read(lastUpdate.mocFile);

			// Parse MOC to get current marker positions
			const moc = await this.mocDetector.parseMOC(lastUpdate.mocFile);

			if (!moc.autoUpdateMarkers) {
				throw new Error('Auto-update markers not found');
			}

			const { start, end } = moc.autoUpdateMarkers;

			// Reconstruct content with previous auto-section
			const before = content.substring(0, start);
			const after = content.substring(end);
			const restoredContent =
				before + lastUpdate.previousContent + after;

			// Write back
			await this.app.vault.modify(lastUpdate.mocFile, restoredContent);

			// Remove from history
			history.shift();

			// Reset last update time to previous update (if any)
			if (history.length > 0) {
				this.lastUpdate.set(mocPath, history[0].timestamp);
			} else {
				this.lastUpdate.delete(mocPath);
			}

			return true;
		} catch (error) {
			console.error(
				'[WriteAlive] Failed to undo MOC update:',
				mocPath,
				error
			);
			return false;
		}
	}

	/**
	 * Get update history for a MOC
	 *
	 * Returns the update history for a specific MOC, or all MOCs
	 * if no path specified.
	 *
	 * @param mocPath - MOC file path (optional)
	 * @param limit - Maximum number of updates to return
	 * @returns Update history
	 */
	getUpdateHistory(mocPath?: string, limit?: number): LivingMOCUpdate[] {
		if (mocPath) {
			const history = this.updateHistory.get(mocPath) || [];
			return limit ? history.slice(0, limit) : history;
		}

		// Return all updates across all MOCs
		const allUpdates: LivingMOCUpdate[] = [];
		for (const history of this.updateHistory.values()) {
			allUpdates.push(...history);
		}

		// Sort by timestamp (newest first)
		allUpdates.sort((a, b) => b.timestamp - a.timestamp);

		return limit ? allUpdates.slice(0, limit) : allUpdates;
	}

	/**
	 * Clear update history
	 *
	 * Removes all update history (irreversible).
	 * Useful for cleanup or testing.
	 *
	 * @param mocPath - Clear history for specific MOC (optional)
	 */
	clearHistory(mocPath?: string): void {
		if (mocPath) {
			this.updateHistory.delete(mocPath);
		} else {
			this.updateHistory.clear();
		}
	}

	/**
	 * Register file watcher for realtime mode
	 *
	 * Listens for file create/modify events and triggers updates
	 * for Living MOCs with realtime mode enabled.
	 *
	 * Implements debouncing to avoid rapid-fire updates while
	 * user is typing.
	 */
	registerFileWatcher(): void {
		console.log('[WriteAlive] Registering Living MOC file watcher');

		// Listen for file creation
		const createRef = this.app.vault.on(
			'create' as any,
			this.handleFileChange.bind(this)
		);
		this.eventRefs.push(createRef);

		// Listen for file modification
		const modifyRef = this.app.vault.on(
			'modify' as any,
			this.handleFileChange.bind(this)
		);
		this.eventRefs.push(modifyRef);
	}

	/**
	 * Unregister file watcher
	 *
	 * Removes event listeners and clears debounce timers.
	 * Called on plugin unload.
	 */
	unregisterFileWatcher(): void {
		console.log('[WriteAlive] Unregistering Living MOC file watcher');

		// Remove event listeners
		for (const ref of this.eventRefs) {
			this.app.vault.offref(ref);
		}
		this.eventRefs = [];

		// Clear debounce timers
		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();
	}

	/**
	 * Handle file create/modify event
	 *
	 * Debounced event handler for file changes:
	 * 1. Check if file is a seed (has seed tags)
	 * 2. Find Living MOCs with realtime mode
	 * 3. Update matching MOCs (debounced)
	 *
	 * Debouncing: Waits 5 seconds after last file change before
	 * processing. This avoids updating MOCs while user is still
	 * typing.
	 *
	 * @param file - File that was created or modified
	 */
	private async handleFileChange(file: TFile | any): Promise<void> {
		// Type guard: ensure file is TFile
		if (!('extension' in file)) {
			return;
		}

		// Only process markdown files
		if (file.extension !== 'md') {
			return;
		}

		// Clear existing debounce timer for this file
		const existingTimer = this.debounceTimers.get(file.path);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		// Set new debounce timer
		const timer = setTimeout(async () => {
			try {
				await this.processFileChange(file);
			} catch (error) {
				console.error(
					'[WriteAlive] Error processing file change:',
					file.path,
					error
				);
			} finally {
				this.debounceTimers.delete(file.path);
			}
		}, this.DEBOUNCE_DELAY_MS);

		this.debounceTimers.set(file.path, timer);
	}

	/**
	 * Process file change (called after debounce)
	 *
	 * Checks if file is a seed and updates matching Living MOCs.
	 *
	 * @param file - File to process
	 */
	private async processFileChange(file: TFile): Promise<void> {
		// Check if file is a seed (has seed tags)
		const isSeed = await this.seedGatherer.fileHasSeedTag(file);

		if (!isSeed) {
			return;
		}

		// Find all Living MOCs with realtime mode
		const detection = await this.mocDetector.detectMOCs();
		const realtimeMOCs = detection.mocs.filter(
			(moc) =>
				moc.isLivingMOC &&
				moc.autoGatherSeeds &&
				moc.updateFrequency === 'realtime'
		);

		if (realtimeMOCs.length === 0) {
			return;
		}

		// Update matching MOCs
		for (const moc of realtimeMOCs) {
			try {
				await this.updateLivingMOC(moc.file, {
					notifyUser: false, // Don't spam notifications in realtime mode
				});
			} catch (error) {
				console.error(
					'[WriteAlive] Error updating MOC:',
					moc.path,
					error
				);
			}
		}
	}

	/**
	 * Dispose of resources
	 *
	 * Cleanup method for graceful shutdown.
	 * Called on plugin unload.
	 */
	dispose(): void {
		this.unregisterFileWatcher();
		this.clearHistory();
		this.lastUpdate.clear();
	}
}
