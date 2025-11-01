import { Plugin, Notice } from 'obsidian';
import type { WriteAliveSettings } from './settings/settings';
import { DEFAULT_SETTINGS, needsMigration } from './settings/settings';
import type { LegacySettings } from './settings/settings';
import { WriteAliveSettingTab } from './settings/settings-tab';
import { encryptionService } from './services/encryption';
import { AIService } from './services/ai/ai-service';
import { SeedGatherer } from './services/vault/seed-gatherer';
import { MOCDetector } from './services/vault/moc-detector';
import { LivingMOCUpdater } from './services/vault/living-moc-updater';

// Storage services
import { MetadataManager } from './services/storage/metadata-manager';
import { SnapshotManager } from './services/storage/snapshot-manager';
import { DiffService } from './services/storage/diff-service';
import { RateLimiter } from './services/storage/rate-limiter';

// UI components
import { SnapshotModal } from './ui/snapshot-modal';

/**
 * WriteAlive Plugin
 *
 * AI-assisted writing tool based on Saligo Writing methodology.
 * Enables writers to start small with seeds and grow naturally through
 * center-based development, inspired by Christopher Alexander's "The Nature of Order"
 * and Bill Evans' step-by-step mastery philosophy.
 *
 * Core Principles:
 * - Low-energy writing initiation (start with seeds, no outlines required)
 * - AI-assisted center discovery (identify structural pivots)
 * - Iterative refinement (evolve through generative sequences)
 * - Wholeness analysis (measure and improve document coherence)
 *
 * Architecture:
 * - Service-oriented design with clear separation of concerns
 * - Dependency Inversion: Plugin depends on service abstractions
 * - Single Responsibility: Each service handles one domain
 */
export default class WriteAlivePlugin extends Plugin {
	settings!: WriteAliveSettings;

	/**
	 * Decrypted API keys cache
	 *
	 * Stored in memory only for runtime use.
	 * Never written to disk.
	 */
	private decryptedApiKey: string = '';

	/**
	 * AI Service instance
	 *
	 * Provides all AI-assisted writing features:
	 * - Center discovery
	 * - Expansion suggestions
	 * - Wholeness analysis
	 * - Paragraph unity checking
	 *
	 * Initialized with decrypted API key on plugin load.
	 * Disposed on plugin unload.
	 */
	private aiService: AIService | null = null;

	/**
	 * Seed Gatherer instance
	 *
	 * Provides seed note gathering from vault:
	 * - Search by configured tags
	 * - Filter by date range
	 * - Extract metadata (tags, backlinks, dates)
	 * - Sort by various criteria
	 *
	 * Initialized on plugin load.
	 * No disposal needed (stateless service).
	 */
	private seedGatherer: SeedGatherer | null = null;

	/**
	 * MOC Detector instance
	 *
	 * Provides MOC (Map of Content) detection and parsing:
	 * - Detect MOCs by YAML, tags, or folder patterns
	 * - Parse MOC structure (links, headings, hierarchy)
	 * - Extract Living MOC configuration
	 * - Find auto-update markers
	 *
	 * Initialized on plugin load.
	 * No disposal needed (stateless service with cache).
	 */
	private mocDetector: MOCDetector | null = null;

	/**
	 * Living MOC Updater instance
	 *
	 * Provides auto-update functionality for Living MOCs:
	 * - Detect Living MOCs with auto_gather_seeds enabled
	 * - Find matching seeds by configured tags
	 * - Update auto-section with new seeds
	 * - Track update history for undo
	 * - Handle realtime/daily/manual update modes
	 *
	 * Initialized on plugin load after seed gatherer and MOC detector.
	 * Requires disposal to clean up file watchers.
	 */
	private livingMOCUpdater: LivingMOCUpdater | null = null;

	/**
	 * Metadata Manager instance
	 *
	 * Provides metadata read/write operations:
	 * - Read/update YAML frontmatter
	 * - Manage WriteAlive-specific metadata
	 * - Preserve user's existing frontmatter
	 *
	 * Initialized on plugin load.
	 * No disposal needed (stateless service).
	 */
	private metadataManager: MetadataManager | null = null;

	/**
	 * Snapshot Manager instance
	 *
	 * Provides snapshot CRUD operations:
	 * - Create point-in-time snapshots
	 * - List/retrieve snapshots
	 * - Restore/delete snapshots
	 * - Store content in .writealive/ folder
	 *
	 * Initialized on plugin load after metadata manager.
	 * No disposal needed (stateless service).
	 */
	private snapshotManager: SnapshotManager | null = null;

	/**
	 * Diff Service instance (reserved for future use)
	 *
	 * Provides diff comparison operations:
	 * - Compare snapshots
	 * - Calculate text changes
	 * - Track metadata changes
	 *
	 * Initialized on plugin load after snapshot manager.
	 * No disposal needed (stateless service).
	 */
	// @ts-ignore - Reserved for future use
	private diffService: DiffService | null = null;

	/**
	 * Rate Limiter instance (reserved for future use)
	 *
	 * Provides API rate limiting:
	 * - Track request rates
	 * - Enforce limits
	 * - Track API costs
	 *
	 * Initialized on plugin load.
	 * No disposal needed (stateless service).
	 */
	// @ts-ignore - Reserved for future use
	private rateLimiter: RateLimiter | null = null;

	/**
	 * Plugin initialization
	 *
	 * Follows lifecycle pattern:
	 * 1. Load persisted settings
	 * 2. Migrate legacy settings if needed
	 * 3. Decrypt API keys for runtime use
	 * 4. Initialize services (AIService, StorageManager)
	 * 5. Register commands
	 * 6. Register UI components
	 */
	async onload(): Promise<void> {
		console.log('Loading WriteAlive plugin');

		// Load settings from Obsidian's data store
		await this.loadSettings();

		// Decrypt API key for current provider (if configured)
		await this.loadDecryptedApiKey();

		// Initialize AI service (if API key is configured)
		this.initializeAIService();

		// Initialize seed gatherer
		this.initializeSeedGatherer();

		// Initialize MOC detector
		this.initializeMOCDetector();

		// Initialize Living MOC updater (requires seed gatherer and MOC detector)
		this.initializeLivingMOCUpdater();

		// Initialize storage services (Phase 2)
		this.initializeStorageServices();

		// Register command palette commands (Phase 3)
		this.registerCommands();

		// Register settings tab
		this.addSettingTab(new WriteAliveSettingTab(this.app, this));

		console.log('WriteAlive plugin loaded successfully');
	}

	/**
	 * Plugin cleanup
	 *
	 * Ensures graceful shutdown:
	 * - Clear decrypted API keys from memory
	 * - Dispose of service resources
	 * - Clear event listeners
	 * - Save any pending state
	 */
	onunload(): void {
		console.log('Unloading WriteAlive plugin');

		// Dispose Living MOC updater (unregister file watchers)
		if (this.livingMOCUpdater) {
			this.livingMOCUpdater.dispose();
			this.livingMOCUpdater = null;
		}

		// Dispose AI service (clears cache, releases resources)
		if (this.aiService) {
			this.aiService.dispose();
			this.aiService = null;
		}

		// Clear decrypted API key from memory (security best practice)
		this.decryptedApiKey = '';

		// Future: Cleanup other services
		// this.storageManager?.dispose();
	}

	/**
	 * Load plugin settings
	 *
	 * Merges persisted settings with defaults to ensure
	 * backward compatibility as new settings are added.
	 *
	 * Also handles migration from legacy plaintext API key
	 * format (T-001) to encrypted format (T-002).
	 */
	async loadSettings(): Promise<void> {
		const loadedData = await this.loadData();

		// Check if migration is needed from legacy format
		if (loadedData && needsMigration(loadedData)) {
			await this.migrateLegacySettings(loadedData as LegacySettings);
			return;
		}

		// Normal settings load
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
	}

	/**
	 * Migrate legacy settings to encrypted format
	 *
	 * Converts plaintext apiKey to encryptedApiKeys structure.
	 * Only runs once during first load after T-002 update.
	 *
	 * @param legacy - Legacy settings with plaintext API key
	 */
	private async migrateLegacySettings(legacy: LegacySettings): Promise<void> {
		console.log('Migrating legacy settings to encrypted format');

		// Start with default settings
		this.settings = Object.assign({}, DEFAULT_SETTINGS);

		// Copy non-encrypted settings
		this.settings.aiProvider = legacy.aiProvider;
		this.settings.seedTags = legacy.seedTags;
		this.settings.autoSave = legacy.autoSave;
		this.settings.autoSaveInterval = legacy.autoSaveInterval;
		this.settings.showCostWarnings = legacy.showCostWarnings;
		this.settings.language = legacy.language;

		// Encrypt legacy API key if present
		if (legacy.apiKey && legacy.apiKey.trim().length > 0) {
			try {
				// Generate new encryption salt
				this.settings.encryptionSalt = encryptionService.generateSalt();

				// Encrypt the legacy key
				const encrypted = await encryptionService.encryptApiKey(
					legacy.apiKey.trim(),
					legacy.aiProvider,
					this.settings.encryptionSalt
				);

				// Store encrypted key
				this.settings.encryptedApiKeys[legacy.aiProvider] = encrypted;

				// Save migrated settings
				await this.saveSettings();

				new Notice(
					'WriteAlive: API key migrated to secure encrypted storage'
				);

				console.log('Legacy API key migrated successfully');
			} catch (error) {
				console.error('Failed to migrate legacy API key:', error);
				new Notice(
					'WriteAlive: Failed to migrate API key. Please re-enter in settings.'
				);
			}
		} else {
			// No API key to migrate, just save new structure
			await this.saveSettings();
		}
	}

	/**
	 * Load decrypted API key for runtime use
	 *
	 * Decrypts the API key for the current provider and stores
	 * it in memory only. Never written to disk.
	 */
	private async loadDecryptedApiKey(): Promise<void> {
		const provider = this.settings.aiProvider;
		const encryptedKey = this.settings.encryptedApiKeys[provider];

		if (encryptedKey) {
			try {
				this.decryptedApiKey = await encryptionService.decryptApiKey(
					encryptedKey,
					provider
				);
			} catch (error) {
				console.error('Failed to decrypt API key on load:', error);
				this.decryptedApiKey = '';

				new Notice(
					`WriteAlive: Failed to decrypt ${provider} API key. Please check settings.`
				);
			}
		} else {
			this.decryptedApiKey = '';
		}
	}

	/**
	 * Initialize AI service
	 *
	 * Creates AIService instance if API key is configured.
	 * Called on plugin load and when API key changes in settings.
	 */
	private initializeAIService(): void {
		// Dispose existing service if any
		if (this.aiService) {
			this.aiService.dispose();
			this.aiService = null;
		}

		// Only initialize if API key is configured
		if (this.decryptedApiKey && this.decryptedApiKey.length > 0) {
			try {
				this.aiService = new AIService({
					provider: this.settings.aiProvider,
					apiKey: this.decryptedApiKey,
					enableCache: true,
					enableRateLimit: true,
				});

				console.log('[WriteAlive] AI service initialized', {
					provider: this.settings.aiProvider,
				});
			} catch (error) {
				console.error('[WriteAlive] Failed to initialize AI service', error);
				new Notice(
					'WriteAlive: Failed to initialize AI service. Check console for details.'
				);
			}
		} else {
			console.log(
				'[WriteAlive] AI service not initialized - no API key configured'
			);
		}
	}

	/**
	 * Initialize seed gatherer
	 *
	 * Creates SeedGatherer instance for vault-wide seed discovery.
	 * Called on plugin load.
	 *
	 * The seed gatherer uses a function reference to get tags from settings,
	 * ensuring it always uses the latest tag configuration without
	 * requiring reinitialization when settings change.
	 */
	private initializeSeedGatherer(): void {
		this.seedGatherer = new SeedGatherer(
			this.app,
			() => this.settings.seedTags.split(',').map((t) => t.trim())
		);

		console.log('[WriteAlive] Seed gatherer initialized');
	}

	/**
	 * Initialize MOC detector
	 *
	 * Creates MOCDetector instance for vault-wide MOC detection.
	 * Called on plugin load.
	 *
	 * The MOC detector is stateless but includes internal caching
	 * for performance optimization.
	 */
	private initializeMOCDetector(): void {
		this.mocDetector = new MOCDetector(this.app);

		console.log('[WriteAlive] MOC detector initialized');
	}

	/**
	 * Initialize Living MOC updater
	 *
	 * Creates LivingMOCUpdater instance for auto-updating Living MOCs.
	 * Called on plugin load after seed gatherer and MOC detector are initialized.
	 *
	 * Registers file watchers for realtime mode if any Living MOCs exist.
	 */
	private initializeLivingMOCUpdater(): void {
		if (!this.seedGatherer || !this.mocDetector) {
			console.error(
				'[WriteAlive] Cannot initialize Living MOC updater: dependencies not initialized'
			);
			return;
		}

		this.livingMOCUpdater = new LivingMOCUpdater(
			this.app,
			this.seedGatherer,
			this.mocDetector
		);

		// Register file watcher for realtime updates
		this.livingMOCUpdater.registerFileWatcher();

		console.log('[WriteAlive] Living MOC updater initialized');
	}

	/**
	 * Initialize storage services
	 *
	 * Creates storage layer services for snapshot management.
	 * Called on plugin load.
	 *
	 * Services initialized:
	 * - MetadataManager: Read/write YAML frontmatter
	 * - SnapshotManager: Create/restore/delete snapshots
	 * - DiffService: Compare snapshots
	 * - RateLimiter: API rate limiting
	 */
	private initializeStorageServices(): void {
		// Metadata manager (foundation for other storage services)
		this.metadataManager = new MetadataManager(this.app.vault);

		// Snapshot manager (depends on metadata manager)
		this.snapshotManager = new SnapshotManager(
			this.app.vault,
			this.metadataManager
		);

		// Diff service (depends on snapshot manager)
		this.diffService = new DiffService(this.snapshotManager);

		// Rate limiter (independent service)
		this.rateLimiter = new RateLimiter({
			maxRequestsPerMinute: 10,
			maxRequestsPerHour: 100,
			enableCostTracking: true,
		});

		console.log('[WriteAlive] Storage services initialized');
	}

	/**
	 * Register command palette commands
	 *
	 * Registers all WriteAlive commands accessible via Ctrl+P (Cmd+P).
	 * Called on plugin load after storage services are initialized.
	 *
	 * Commands registered:
	 * - Create Snapshot: Save current document state
	 * - List Snapshots: View all snapshots for current file
	 * - Restore Latest Snapshot: Restore most recent snapshot
	 */
	private registerCommands(): void {
		// Command: Create Snapshot
		this.addCommand({
			id: 'create-snapshot',
			name: 'Create Snapshot',
			callback: async () => {
				const file = this.app.workspace.getActiveFile();

				if (!file) {
					new Notice('WriteAlive: No active file');
					return;
				}

				if (!this.snapshotManager) {
					new Notice('WriteAlive: Snapshot manager not initialized');
					console.error(
						'[WriteAlive] Cannot create snapshot: SnapshotManager not initialized'
					);
					return;
				}

				try {
					const snapshot = await this.snapshotManager.createSnapshot(file);
					new Notice(`WriteAlive: Snapshot created - ${snapshot.metadata.name}`);
					console.log('[WriteAlive] Snapshot created:', snapshot.metadata);
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Unknown error';
					new Notice(`WriteAlive: Failed to create snapshot - ${errorMessage}`);
					console.error('[WriteAlive] Snapshot creation failed:', error);
				}
			},
		});

		// Command: List Snapshots
		this.addCommand({
			id: 'list-snapshots',
			name: 'List Snapshots',
			callback: () => {
				const file = this.app.workspace.getActiveFile();

				if (!file) {
					new Notice('WriteAlive: No active file');
					return;
				}

				if (!this.snapshotManager) {
					new Notice('WriteAlive: Snapshot manager not initialized');
					console.error(
						'[WriteAlive] Cannot list snapshots: SnapshotManager not initialized'
					);
					return;
				}

				// Open snapshot modal
				new SnapshotModal(this.app, file, this.snapshotManager).open();
			},
		});

		// Command: Restore Latest Snapshot
		this.addCommand({
			id: 'restore-latest-snapshot',
			name: 'Restore Latest Snapshot',
			callback: async () => {
				const file = this.app.workspace.getActiveFile();

				if (!file) {
					new Notice('WriteAlive: No active file');
					return;
				}

				if (!this.snapshotManager) {
					new Notice('WriteAlive: Snapshot manager not initialized');
					console.error(
						'[WriteAlive] Cannot restore snapshot: SnapshotManager not initialized'
					);
					return;
				}

				try {
					// Get all snapshots
					const snapshots = await this.snapshotManager.listSnapshots(file);

					if (snapshots.length === 0) {
						new Notice('WriteAlive: No snapshots available');
						return;
					}

					// Restore most recent (first in list)
					const latestSnapshot = snapshots[0];
					await this.snapshotManager.restoreSnapshot(
						file,
						latestSnapshot.id
					);

					new Notice(
						`WriteAlive: Restored snapshot - ${latestSnapshot.name}`
					);
					console.log('[WriteAlive] Snapshot restored:', latestSnapshot);
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Unknown error';
					new Notice(
						`WriteAlive: Failed to restore snapshot - ${errorMessage}`
					);
					console.error('[WriteAlive] Snapshot restore failed:', error);
				}
			},
		});

		console.log('[WriteAlive] Commands registered');
	}

	/**
	 * Reinitialize AI service
	 *
	 * Called when provider or API key changes in settings.
	 * Public method for settings tab to trigger reinitialization.
	 */
	async reinitializeAIService(): Promise<void> {
		await this.loadDecryptedApiKey();
		this.initializeAIService();
	}

	/**
	 * Get AI service instance
	 *
	 * Returns the AI service for use by commands and UI components.
	 *
	 * @returns AI service or null if not initialized
	 */
	getAIService(): AIService | null {
		return this.aiService;
	}

	/**
	 * Get seed gatherer instance
	 *
	 * Returns the seed gatherer for use by commands and UI components.
	 *
	 * @returns Seed gatherer or null if not initialized
	 */
	getSeedGatherer(): SeedGatherer | null {
		return this.seedGatherer;
	}

	/**
	 * Get MOC detector instance
	 *
	 * Returns the MOC detector for use by commands and UI components.
	 *
	 * @returns MOC detector or null if not initialized
	 */
	getMOCDetector(): MOCDetector | null {
		return this.mocDetector;
	}

	/**
	 * Get Living MOC updater instance
	 *
	 * Returns the Living MOC updater for use by commands and UI components.
	 *
	 * @returns Living MOC updater or null if not initialized
	 */
	getLivingMOCUpdater(): LivingMOCUpdater | null {
		return this.livingMOCUpdater;
	}

	/**
	 * Get decrypted API key for current provider
	 *
	 * Returns the API key stored in memory (already decrypted).
	 * Used by AI services to make API calls.
	 *
	 * @returns Decrypted API key or empty string if not configured
	 */
	getApiKey(): string {
		return this.decryptedApiKey;
	}

	/**
	 * Save plugin settings
	 *
	 * Persists settings to Obsidian's data store
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
