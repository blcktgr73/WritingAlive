import { Plugin, Notice, Menu } from 'obsidian';
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
import { GatherSeedsModal } from './ui/gather-seeds-modal';

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

		// Register ribbon button (T-024)
		this.registerRibbonButton();

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
					language: this.settings.language,
					enableCache: true,
					enableRateLimit: true,
				});

				console.log('[WriteAlive] AI service initialized', {
					provider: this.settings.aiProvider,
					language: this.settings.language,
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
	 * - Gather Seeds: Open seed gathering modal
	 * - Create Snapshot: Save current document state
	 * - List Snapshots: View all snapshots for current file
	 * - Restore Latest Snapshot: Restore most recent snapshot
	 */
	private registerCommands(): void {
		// Command: Gather Seeds
		this.addCommand({
			id: 'gather-seeds',
			name: 'Gather Seeds',
			callback: () => {
				if (!this.seedGatherer) {
					new Notice('WriteAlive: Seed gatherer not initialized');
					console.error(
						'[WriteAlive] Cannot gather seeds: SeedGatherer not initialized'
					);
					return;
				}

				// Open gather seeds modal with AI service (if available)
				new GatherSeedsModal(this.app, this.seedGatherer, this.aiService).open();
			},
		});

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

		// T-010 Command: Find Centers from Gathered Seeds (Quick Start)
		this.addCommand({
			id: 'find-centers',
			name: 'Find Centers from Gathered Seeds',
			callback: async () => {
				// Check services initialized
				if (!this.seedGatherer) {
					new Notice('WriteAlive: Seed gatherer not initialized');
					return;
				}

				if (!this.aiService) {
					new Notice('WriteAlive: AI service not configured. Please add API key in settings.');
					return;
				}

				try {
					// Open Gather Seeds Modal with recent 10 seeds auto-selected
					const { GatherSeedsModal } = await import('./ui/gather-seeds-modal');
					const modal = new GatherSeedsModal(
						this.app,
						this.seedGatherer,
						this.aiService
					);

					// Open modal first
					modal.open();

					// Wait a bit for modal to render
					await new Promise(resolve => setTimeout(resolve, 100));

					// Then auto-select recent seeds
					await modal.autoSelectRecentSeeds(10);

				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					new Notice(`Failed to open gather seeds modal: ${errorMessage}`);
					console.error('[WriteAlive] Find centers quick-start failed:', error);
				}
			},
		});

		// T-025 Command: Find Centers from MOC
		this.addCommand({
			id: 'find-centers-from-moc',
			name: 'Find Centers from MOC',
			callback: async () => {
				await this.findCentersFromMOC();
			},
		});

		// Command: Suggest Next Steps (T-024)
		this.addCommand({
			id: 'suggest-next-steps',
			name: 'Suggest Next Steps',
			callback: async () => {
				await this.openSuggestNextSteps();
			},
		});

		console.log('[WriteAlive] Commands registered');
	}

	/**
	 * Register ribbon button with context-aware actions (T-026)
	 *
	 * Creates a unified ribbon button (🌱 icon) that:
	 * - Left-click: Context-aware primary action
	 *   - No active file → Gather Seeds
	 *   - Regular document → Suggest Next Steps
	 *   - MOC document → Find Centers from MOC
	 * - Right-click: Shows full context menu with all WriteAlive commands
	 *
	 * This provides intelligent workflow shortcuts while maintaining
	 * access to all commands via right-click menu.
	 */
	private registerRibbonButton(): void {
		const ribbonIcon = this.addRibbonIcon(
			'sprout',
			'Write Alive',
			async (evt) => {
				// Left-click: Context-aware action
				if (evt.button === 0) {
					await this.handleContextAwareClick();
				}
			}
		);

		// Right-click: Show full context menu
		ribbonIcon.addEventListener('contextmenu', (evt) => {
			evt.preventDefault();

			const menu = new Menu();

			// Workflow commands section
			menu.addItem((item) =>
				item
					.setTitle('🌱 Gather Seeds')
					.setSection('workflow')
					.onClick(() => this.openGatherSeeds())
			);

			menu.addItem((item) =>
				item
					.setTitle('💡 Suggest Next Steps')
					.setSection('workflow')
					.onClick(() => this.openSuggestNextSteps())
			);

			menu.addItem((item) =>
				item
					.setTitle('🗺️ Find Centers from MOC')
					.setSection('workflow')
					.onClick(() => this.findCentersFromMOC())
			);

			menu.addSeparator();

			// Snapshot commands section
			menu.addItem((item) =>
				item
					.setTitle('📊 Create Snapshot')
					.setSection('snapshots')
					.onClick(() => this.createSnapshot())
			);

			menu.addItem((item) =>
				item
					.setTitle('📂 List Snapshots')
					.setSection('snapshots')
					.onClick(() => this.listSnapshots())
			);

			menu.addItem((item) =>
				item
					.setTitle('⏮️ Restore Latest Snapshot')
					.setSection('snapshots')
					.onClick(() => this.restoreLatestSnapshot())
			);

			menu.showAtMouseEvent(evt);
		});

		console.log('[WriteAlive] Ribbon button registered');
	}

	/**
	 * Handle context-aware ribbon click (T-026)
	 *
	 * Determines the appropriate action based on the current context:
	 * - No active file → Gather Seeds (start workflow)
	 * - Regular document → Suggest Next Steps (continue writing)
	 * - MOC document → Find Centers from MOC (center discovery)
	 *
	 * This implements intelligent workflow routing based on user context.
	 */
	private async handleContextAwareClick(): Promise<void> {
		const activeFile = this.app.workspace.getActiveFile();

		// Case 1: No active file → Gather Seeds (start new workflow)
		if (!activeFile) {
			this.openGatherSeeds();
			return;
		}

		// Case 2: Check if active file is MOC
		if (this.mocDetector) {
			const isMOC = await this.mocDetector.isMOC(activeFile);

			if (isMOC) {
				// Case 2a: Active file is MOC → Find Centers from MOC
				await this.findCentersFromMOC();
				return;
			}
		}

		// Case 3: Regular document → Suggest Next Steps (continue writing)
		await this.openSuggestNextSteps();
	}

	/**
	 * Open Gather Seeds modal
	 *
	 * Helper method for ribbon button and commands.
	 */
	private openGatherSeeds(): void {
		if (!this.seedGatherer) {
			new Notice('WriteAlive: Seed gatherer not initialized');
			console.error('[WriteAlive] Cannot gather seeds: SeedGatherer not initialized');
			return;
		}

		new GatherSeedsModal(this.app, this.seedGatherer, this.aiService).open();
	}

	/**
	 * Open Suggest Next Steps (T-024 Phase 2)
	 *
	 * Helper method for ribbon button and commands.
	 * Analyzes current document and appends AI-generated suggestions.
	 */
	private async openSuggestNextSteps(): Promise<void> {
		const file = this.app.workspace.getActiveFile();

		if (!file) {
			new Notice('WriteAlive: Please open a document first');
			return;
		}

		if (!this.aiService) {
			new Notice('WriteAlive: AI service not configured. Please add API key in settings.');
			return;
		}

		// Get content from active editor
		const { MarkdownView } = require('obsidian');
		const view = this.app.workspace.getActiveViewOfType(MarkdownView) as any;
		if (!view || !view.editor) {
			new Notice('WriteAlive: No active editor');
			return;
		}

		const content = view.editor.getValue();

		if (!content || content.trim().length < 100) {
			new Notice('WriteAlive: Document is too short for meaningful suggestions (min 100 characters)');
			return;
		}

		// Show loading notice
		const loadingNotice = new Notice('💡 Analyzing document for next steps... (5-7 seconds)', 0);

		try {
			// Call AI service
			const result = await this.aiService.suggestNextSteps(content, file);

			// Hide loading notice
			loadingNotice.hide();

			// Format suggestions as markdown and append to document
			let suggestionsText = '\n\n---\n\n## 💡 Suggested Next Steps\n';
			suggestionsText += `*Generated on ${new Date().toLocaleString()}*\n\n`;
			suggestionsText += `**Document Analysis:**\n`;
			suggestionsText += `- Wholeness Score: ${result.currentWholeness}/10\n`;
			suggestionsText += `- Key Themes: ${result.keyThemes.join(', ')}\n\n`;

			result.suggestions.forEach((suggestion, index) => {
				const strengthIcon = suggestion.strength === 'strong' ? '⭐⭐⭐' : suggestion.strength === 'medium' ? '⭐⭐' : '⭐';
				const typeEmoji: Record<string, string> = {
					deepen: '🔍',
					connect: '🔗',
					question: '❓',
					contrast: '⚖️'
				};

				suggestionsText += `### ${index + 1}. ${typeEmoji[suggestion.type] || '💡'} ${suggestion.direction} ${strengthIcon}\n\n`;
				suggestionsText += `**Type:** ${suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}\n\n`;
				suggestionsText += `**Why this matters:**\n${suggestion.rationale}\n\n`;
				suggestionsText += `**Content Hints:**\n`;
				suggestion.contentHints.forEach(hint => {
					suggestionsText += `- ${hint}\n`;
				});
				suggestionsText += `\n**Estimated Length:** +${suggestion.estimatedLength} words\n\n`;

				if (suggestion.relatedSeeds && suggestion.relatedSeeds.length > 0) {
					suggestionsText += `**Related Seeds:** ${suggestion.relatedSeeds.map(s => `[[${s}]]`).join(', ')}\n\n`;
				}

				suggestionsText += `---\n\n`;
			});

			suggestionsText += `💰 **Cost:** $${result.estimatedCost.toFixed(4)} | **Tokens:** ${result.usage.totalTokens.toLocaleString()}\n\n`;

			// Add natural continuation prompt
			const isKorean = /[\uAC00-\uD7AF]/.test(content);
			const continuationPrompt = isKorean
				? '---\n\n이러한 제안을 보시고, 쓰셨던 글을 어떤 방향으로 진행해 보고 싶으세요?\n\n'
				: '---\n\nAfter reviewing these suggestions, which direction would you like to take your writing?\n\n';

			suggestionsText += continuationPrompt;

			// Append to document
			const currentContent = view.editor.getValue();
			view.editor.setValue(currentContent + suggestionsText);

			// Scroll to bottom
			view.editor.setCursor(view.editor.lastLine());

			new Notice(`✅ Generated ${result.suggestions.length} suggestions (Cost: $${result.estimatedCost.toFixed(4)})`);
		} catch (error) {
			loadingNotice.hide();
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`❌ Failed to generate suggestions: ${errorMessage}`, 8000);
			console.error('[WriteAlive] Suggest next steps failed:', error);
		}
	}

	/**
	 * Create snapshot for current file
	 *
	 * Helper method for ribbon button and commands.
	 */
	private async createSnapshot(): Promise<void> {
		const file = this.app.workspace.getActiveFile();

		if (!file) {
			new Notice('WriteAlive: No active file');
			return;
		}

		if (!this.snapshotManager) {
			new Notice('WriteAlive: Snapshot manager not initialized');
			console.error('[WriteAlive] Cannot create snapshot: SnapshotManager not initialized');
			return;
		}

		try {
			const snapshot = await this.snapshotManager.createSnapshot(file);
			new Notice(`WriteAlive: Snapshot created - ${snapshot.metadata.name}`);
			console.log('[WriteAlive] Snapshot created:', snapshot.metadata);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`WriteAlive: Failed to create snapshot - ${errorMessage}`);
			console.error('[WriteAlive] Snapshot creation failed:', error);
		}
	}

	/**
	 * List snapshots for current file
	 *
	 * Helper method for ribbon button and commands.
	 */
	private listSnapshots(): void {
		const file = this.app.workspace.getActiveFile();

		if (!file) {
			new Notice('WriteAlive: No active file');
			return;
		}

		if (!this.snapshotManager) {
			new Notice('WriteAlive: Snapshot manager not initialized');
			console.error('[WriteAlive] Cannot list snapshots: SnapshotManager not initialized');
			return;
		}

		new SnapshotModal(this.app, file, this.snapshotManager).open();
	}

	/**
	 * Restore latest snapshot for current file
	 *
	 * Helper method for ribbon button and commands.
	 */
	private async restoreLatestSnapshot(): Promise<void> {
		const file = this.app.workspace.getActiveFile();

		if (!file) {
			new Notice('WriteAlive: No active file');
			return;
		}

		if (!this.snapshotManager) {
			new Notice('WriteAlive: Snapshot manager not initialized');
			console.error('[WriteAlive] Cannot restore snapshot: SnapshotManager not initialized');
			return;
		}

		try {
			const snapshots = await this.snapshotManager.listSnapshots(file);

			if (snapshots.length === 0) {
				new Notice('WriteAlive: No snapshots available');
				return;
			}

			const latestSnapshot = snapshots[0];
			await this.snapshotManager.restoreSnapshot(file, latestSnapshot.id);

			new Notice(`WriteAlive: Restored snapshot - ${latestSnapshot.name}`);
			console.log('[WriteAlive] Snapshot restored:', latestSnapshot);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			new Notice(`WriteAlive: Failed to restore snapshot - ${errorMessage}`);
			console.error('[WriteAlive] Snapshot restore failed:', error);
		}
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
	 * Find Centers from MOC (T-025)
	 *
	 * Workflow:
	 * 1. Detect all MOCs in vault
	 * 2. Present selection modal (MVP: use first MOC or active file)
	 * 3. Validate MOC (note count, broken links)
	 * 4. Analyze MOC with AI to discover centers
	 * 5. Display results in Center Discovery Modal
	 * 6. Create document from selected center
	 *
	 * This is a simplified MVP implementation.
	 * Full UI (MOCSelectionModal) will be added in T-MOC-005.
	 */
	private async findCentersFromMOC(): Promise<void> {
		// Check services initialized
		if (!this.mocDetector) {
			new Notice('WriteAlive: MOC detector not initialized');
			console.error('[WriteAlive] Cannot find centers from MOC: MOCDetector not initialized');
			return;
		}

		if (!this.aiService) {
			new Notice('WriteAlive: AI service not configured. Please add API key in settings.');
			return;
		}

		try {
			// Check if active file is a MOC
			const activeFile = this.app.workspace.getActiveFile();
			let shouldShowModal = true;

			if (activeFile) {
				const isMOC = await this.mocDetector.isMOC(activeFile);
				if (isMOC) {
					// Active file is a MOC, skip modal and use it directly
					shouldShowModal = false;
					console.log('[WriteAlive] Using active file as MOC:', activeFile.path);
					await this.analyzeMOC(activeFile);
					return;
				}
			}

			// Show MOC selection modal
			if (shouldShowModal) {
				const { MOCSelectionModal } = await import('./ui/modals/moc-selection-modal');
				const modal = new MOCSelectionModal(
					this.app,
					this.mocDetector,
					async (result) => {
						await this.analyzeMOC(result.mocFile);
					}
				);
				modal.open();
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : '';

			console.error('[WriteAlive] Find centers from MOC failed:');
			console.error('Error message:', errorMessage);
			console.error('Error stack:', errorStack);
			console.error('Full error:', error);

			new Notice(`❌ Failed to find centers from MOC:\n${errorMessage}\n\nCheck console for details.`, 10000);
		}
	}

	/**
	 * Analyze MOC for centers
	 *
	 * Internal method that performs the actual analysis.
	 * Called by findCentersFromMOC after MOC selection.
	 *
	 * @param mocFile - MOC file to analyze
	 */
	private async analyzeMOC(mocFile: any): Promise<void> {
		if (!this.aiService) {
			new Notice('WriteAlive: AI service not configured.');
			return;
		}

		try {
			// Import MOCCenterFinder
			const { MOCCenterFinder } = await import('./services/moc/moc-center-finder');
			const mocCenterFinder = new MOCCenterFinder(this.app, this.mocDetector!, this.aiService);

			// Validate MOC
			new Notice('Validating MOC...');
			const validation = await mocCenterFinder.validateMOC(mocFile);

			if (!validation.valid) {
				const errorMsg = validation.warnings
					.filter(w => w.severity === 'high')
					.map(w => w.message)
					.join('\n');
				new Notice(`MOC validation failed:\n${errorMsg}`);
				return;
			}

			// Show warnings if any
			const highWarnings = validation.warnings.filter(w => w.severity === 'high');
			if (highWarnings.length > 0) {
				const warningMsg = highWarnings.map(w => w.message).join('\n');
				new Notice(`⚠️ Warning:\n${warningMsg}\n\nProceed with analysis? (Will continue in 3 seconds)`, 3000);
				await new Promise(resolve => setTimeout(resolve, 3000));
			}

			// Find centers with progress feedback
			const analysisNotice = new Notice(
				`🔍 Analyzing ${validation.noteCount.readable} notes from MOC...\n` +
				`⏱️ Est: ${validation.estimatedTime}s | 💰 Cost: $${validation.estimatedCost.toFixed(4)}`,
				0 // Keep visible until dismissed
			);

			console.log('[WriteAlive] Starting MOC center analysis...');

			const result = await mocCenterFinder.findCentersFromMOC(mocFile);

			// Dismiss progress notice
			analysisNotice.hide();

			// Show completion notice
			new Notice('✅ Analysis complete! Preparing results...', 2000);

			console.log('[WriteAlive] Analysis complete, displaying results...');

			// Display results in modal (T-MOC-006)
			console.log('[WriteAlive] MOC Center Finding Results:', {
				sourceMOC: result.sourceMOC,
				centers: result.centers.map(c => ({
					name: c.name,
					strength: c.strength,
					explanation: c.explanation,
					connectedSeeds: c.connectedSeeds,
				})),
				coverage: result.coverage,
				usage: result.usage,
				cost: result.estimatedCost,
			});

			// Show success notice
			const strong = result.centers.filter(c => c.strength === 'strong');
			const medium = result.centers.filter(c => c.strength === 'medium');
			const weak = result.centers.filter(c => c.strength === 'weak');

			const summary = `✅ Found ${result.centers.length} centers:\n` +
				`⭐⭐⭐ Strong: ${strong.length} | ⭐⭐ Medium: ${medium.length} | ⭐ Weak: ${weak.length}`;

			new Notice(summary, 5000);

			// Open CenterDiscoveryModal with MOC context (T-MOC-006)
			const { CenterDiscoveryModal } = await import('./ui/modals/center-discovery-modal');
			const modal = CenterDiscoveryModal.forMOC(this.app, result);
			modal.open();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : '';

			console.error('[WriteAlive] Analyze MOC failed:');
			console.error('Error message:', errorMessage);
			console.error('Error stack:', errorStack);
			console.error('Full error:', error);

			// Check if it's an AIServiceError for better user messaging
			const { AIServiceError } = await import('./services/ai/types');
			if (error instanceof AIServiceError) {
				// Show user-friendly error message based on error code
				const errorCode = error.code;
				let userMessage = `❌ Failed to analyze MOC:\n\n${errorMessage}`;

				switch (errorCode) {
					case 'MOC_TOO_SMALL':
						userMessage += '\n\n💡 Tip: Add more related notes to your MOC (minimum 5 notes required).';
						break;
					case 'MOC_TOO_LARGE':
						userMessage += '\n\n💡 Tip: Consider splitting your MOC into smaller, focused MOCs.';
						break;
					case 'MOC_NO_VALID_NOTES':
						userMessage += '\n\n💡 Tip: Check for broken links in your MOC and fix them.';
						break;
					case 'INVALID_MOC':
						userMessage += '\n\n💡 Tip: A MOC must contain links to other notes.';
						break;
					case 'INVALID_API_KEY':
						userMessage += '\n\n💡 Tip: Check your API key in plugin settings.';
						break;
					case 'RATE_LIMIT_EXCEEDED':
						userMessage += '\n\n💡 Tip: Wait a few minutes and try again.';
						break;
					case 'NETWORK_ERROR':
						userMessage += '\n\n💡 Tip: Check your internet connection.';
						break;
					default:
						userMessage += '\n\nCheck console for details.';
				}

				new Notice(userMessage, 12000);
			} else {
				new Notice(`❌ Failed to analyze MOC:\n${errorMessage}\n\nCheck console for details.`, 10000);
			}
		}
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
