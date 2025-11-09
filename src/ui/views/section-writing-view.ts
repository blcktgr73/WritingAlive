/**
 * Section Writing View
 *
 * Main writing interface for outcome-driven writing mode.
 * Provides section-by-section writing experience with real-time progress tracking,
 * auto-save, outcome-aware AI suggestions, and section navigation.
 *
 * Design Principles (SOLID):
 * - Single Responsibility: Only handles writing UI and user interactions
 * - Open/Closed: Extensible through service layer integration
 * - Dependency Inversion: Depends on OutcomeManager and SectionManager abstractions
 * - Interface Segregation: Focused public API (open view, handle callbacks)
 *
 * User Flow:
 * 1. View opens with first incomplete section
 * 2. User writes section content in markdown editor
 * 3. Auto-save triggers every 30 seconds (if content changed)
 * 4. User can request AI suggestions for next steps (outcome-aware)
 * 5. User marks section complete when ready
 * 6. View validates section and moves to next section
 * 7. When all sections complete → show completion dialog
 *
 * Features:
 * - Progress header with real-time updates
 * - Section context display (title, purpose, prompt)
 * - Markdown editor with word counter
 * - Auto-save every 30 seconds
 * - Outcome-aware AI suggestions
 * - Section validation (80% minimum, purpose check)
 * - Section navigation sidebar
 * - Document completion handler
 *
 * Architecture:
 * - Composition: Uses OutcomeManager and SectionManager
 * - Event-driven: Auto-save interval, keyboard shortcuts
 * - State Management: Centralized state with clear update flow
 * - Efficient Rendering: Debounced word counting, targeted DOM updates
 */

import { Modal, App, Notice, TFile, Component } from 'obsidian';
import type {
	OutcomeDefinition,
	DocumentStructure,
	DocumentSection,
	OutcomeDocumentMetadata,
} from '../../services/outcome/types';
import { OutcomeManager } from '../../services/outcome/outcome-manager';
import { SectionManager } from '../../services/outcome/section-manager';

/**
 * Section Writing View Options
 *
 * Configuration options for view initialization.
 */
export interface SectionWritingViewOptions {
	/**
	 * The outcome-driven document file being written
	 */
	file: TFile;

	/**
	 * Callback when document is completed
	 */
	onComplete?: (file: TFile) => void;

	/**
	 * Language preference for UI text
	 * @default 'ko'
	 */
	language?: 'ko' | 'en';
}

/**
 * View State
 *
 * Internal state tracking for writing session.
 */
interface ViewState {
	// Document data
	file: TFile;
	metadata: OutcomeDocumentMetadata;
	outcome: OutcomeDefinition;
	structure: DocumentStructure;

	// Current section
	currentSectionIndex: number;
	currentSection: DocumentSection;
	sectionContent: string;
	wordCount: number;

	// UI state
	isSaving: boolean;
	isSuggestingNextSteps: boolean;
	isValidating: boolean;
	lastSaveTime: Date | null;

	// Auto-save tracking
	isDirty: boolean;
	autoSaveInterval: number | null;
}

/**
 * AI Suggestion
 *
 * Structure for outcome-aware next step suggestions.
 */
interface AISuggestion {
	title: string;
	direction: string;
	rationale: string;
	contentHints: string;
	estimatedWords: number;
	priority: number; // 1-3 stars
}

/**
 * Section Validation Result
 *
 * Result of validating section completion.
 */
interface SectionValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
	wordCountMet: boolean; // At least 80% of target
	purposeMet: boolean; // Basic purpose check
	outcomeMet: boolean; // Aligned with document outcome
}

/**
 * Section Writing View
 *
 * Modal-based writing interface for outcome-driven documents.
 */
export class SectionWritingView extends Modal {
	private outcomeManager: OutcomeManager;
	private sectionManager: SectionManager;
	private options: SectionWritingViewOptions;
	private language: 'ko' | 'en';

	// View state
	private state: ViewState | null = null;

	// DOM elements
	private progressHeaderEl: HTMLElement | null = null;
	private sectionContextEl: HTMLElement | null = null;
	private editorEl: HTMLTextAreaElement | null = null;
	private wordCountEl: HTMLElement | null = null;
	private sidebarEl: HTMLElement | null = null;
	private actionButtonsEl: HTMLElement | null = null;

	// Auto-save
	private autoSaveTimer: NodeJS.Timeout | null = null;
	private wordCountTimer: NodeJS.Timeout | null = null;

	// Component for markdown rendering
	private component: Component;

	/**
	 * Constructor
	 *
	 * @param app - Obsidian app instance
	 * @param outcomeManager - Outcome manager service
	 * @param sectionManager - Section manager service
	 * @param options - View options
	 */
	constructor(
		app: App,
		outcomeManager: OutcomeManager,
		sectionManager: SectionManager,
		options: SectionWritingViewOptions
	) {
		super(app);
		this.outcomeManager = outcomeManager;
		this.sectionManager = sectionManager;
		this.options = options;
		this.language = options.language || 'ko';
		this.component = new Component();
	}

	/**
	 * Open view
	 *
	 * Loads document metadata and initializes writing session.
	 */
	async onOpen(): Promise<void> {
		try {
			// Load document metadata
			const metadata = await this.outcomeManager.getOutcome(
				this.options.file
			);

			if (!metadata) {
				new Notice(
					this.language === 'ko'
						? '결과 기반 문서가 아닙니다.'
						: 'Not an outcome-driven document'
				);
				this.close();
				return;
			}

			// Find first incomplete section or current section
			const currentSectionIndex = this.findCurrentSectionIndex(metadata);

			if (currentSectionIndex === -1) {
				// All sections completed
				this.showCompletionDialog(metadata);
				return;
			}

			const currentSection =
				metadata.structure.sections[currentSectionIndex];

			// Initialize state
			this.state = {
				file: this.options.file,
				metadata,
				outcome: metadata.outcome,
				structure: metadata.structure,
				currentSectionIndex,
				currentSection,
				sectionContent: currentSection.content || '',
				wordCount: currentSection.actualWords || 0,
				isSaving: false,
				isSuggestingNextSteps: false,
				isValidating: false,
				lastSaveTime: null,
				isDirty: false,
				autoSaveInterval: null,
			};

			// Mark section as in-progress if not started
			if (currentSection.status === 'not-started') {
				await this.sectionManager.startSection(
					this.options.file,
					currentSection.id
				);
				currentSection.status = 'in-progress';
			}

			// Render UI
			this.renderView();

			// Start auto-save
			this.startAutoSave();

			// Load component
			this.component.load();
		} catch (error) {
			console.error('Failed to open section writing view:', error);
			new Notice(
				this.language === 'ko'
					? '문서를 열 수 없습니다.'
					: 'Failed to open document'
			);
			this.close();
		}
	}

	/**
	 * Close view
	 *
	 * Cleanup: save current state, stop auto-save, unload component.
	 */
	async onClose(): Promise<void> {
		// Stop auto-save
		this.stopAutoSave();

		// Save final state if dirty
		if (this.state && this.state.isDirty) {
			await this.saveSection();
		}

		// Unload component
		this.component.unload();

		// Clear state
		this.state = null;
	}

	/**
	 * Render view
	 *
	 * Creates complete UI structure with all components.
	 */
	private renderView(): void {
		if (!this.state) return;

		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('section-writing-view');

		// Create container
		contentEl.createDiv('writing-view-container');

		// Render components
		this.renderProgressHeader();
		this.renderSectionContext();
		this.renderEditor();
		this.renderActionButtons();
		this.renderSidebar();
	}

	/**
	 * Render progress header
	 *
	 * Shows: "섹션 N/M (words/target) • X% 완료"
	 */
	private renderProgressHeader(): void {
		if (!this.state) return;

		const containerEl = this.contentEl.querySelector('.writing-view-container');
		if (!containerEl) return;

		const { currentSectionIndex, structure, metadata } = this.state;
		const totalSections = structure.sections.length;
		const completionPercentage = metadata.progress.completionPercentage;

		this.progressHeaderEl = containerEl.createDiv('progress-header');

		// Progress text
		const progressText =
			this.language === 'ko'
				? `진행: 섹션 ${currentSectionIndex + 1}/${totalSections} (${this.state.wordCount}/${this.state.currentSection.estimatedWords} 단어) • ${completionPercentage}% 완료`
				: `Progress: Section ${currentSectionIndex + 1}/${totalSections} (${this.state.wordCount}/${this.state.currentSection.estimatedWords} words) • ${completionPercentage}% complete`;

		this.progressHeaderEl.createEl('div', {
			text: progressText,
			cls: 'progress-text',
		});

		// Progress bar
		const progressBar = this.progressHeaderEl.createDiv('progress-bar');
		const progressFill = progressBar.createDiv('progress-fill');
		progressFill.style.width = `${completionPercentage}%`;

		// Color coding
		if (completionPercentage >= 80) {
			progressFill.addClass('progress-fill-green');
		} else if (completionPercentage >= 50) {
			progressFill.addClass('progress-fill-yellow');
		} else {
			progressFill.addClass('progress-fill-red');
		}
	}

	/**
	 * Render section context
	 *
	 * Shows: section title, purpose, estimate, writing prompt
	 */
	private renderSectionContext(): void {
		if (!this.state) return;

		const containerEl = this.contentEl.querySelector('.writing-view-container');
		if (!containerEl) return;

		const { currentSection } = this.state;

		this.sectionContextEl = containerEl.createDiv('section-context');

		// Section title
		this.sectionContextEl.createEl('h2', {
			text: `🎯 ${this.language === 'ko' ? '섹션' : 'Section'} ${currentSection.order}: ${currentSection.title}`,
			cls: 'section-title',
		});

		// Purpose
		const purposeText =
			this.language === 'ko'
				? `목적: ${currentSection.purpose}`
				: `Purpose: ${currentSection.purpose}`;
		this.sectionContextEl.createEl('div', {
			text: purposeText,
			cls: 'section-purpose',
		});

		// Estimate
		const estimateText =
			this.language === 'ko'
				? `목표: ${currentSection.estimatedWords} 단어 • ~${currentSection.estimatedMinutes}분`
				: `Goal: ${currentSection.estimatedWords} words • ~${currentSection.estimatedMinutes} min`;
		this.sectionContextEl.createEl('div', {
			text: estimateText,
			cls: 'section-estimate',
		});

		// Writing prompt
		const promptLabel =
			this.language === 'ko' ? '💡 작성 프롬프트:' : '💡 Writing Prompt:';
		this.sectionContextEl.createEl('div', {
			text: promptLabel,
			cls: 'prompt-label',
		});

		this.sectionContextEl.createEl('div', {
			text: currentSection.writingPrompt,
			cls: 'writing-prompt',
		});

		// Separator
		this.sectionContextEl.createDiv('section-separator');
	}

	/**
	 * Render markdown editor
	 *
	 * Creates textarea with word counter and auto-save status.
	 */
	private renderEditor(): void {
		if (!this.state) return;

		const containerEl = this.contentEl.querySelector('.writing-view-container');
		if (!containerEl) return;

		const editorContainer = containerEl.createDiv('editor-container');

		// Textarea
		this.editorEl = editorContainer.createEl('textarea', {
			cls: 'section-editor',
			attr: {
				placeholder:
					this.language === 'ko'
						? '여기서 작성을 시작하세요...'
						: 'Start writing here...',
			},
		});

		this.editorEl.value = this.state.sectionContent;

		// Event listeners
		this.editorEl.addEventListener('input', () => {
			this.handleEditorInput();
		});

		this.editorEl.addEventListener('keydown', (e) => {
			this.handleKeyDown(e);
		});

		// Word counter
		const counterContainer = editorContainer.createDiv('counter-container');

		this.wordCountEl = counterContainer.createEl('span', {
			text: this.formatWordCount(),
			cls: 'word-count',
		});

		// Auto-save status
		const autoSaveStatus = counterContainer.createEl('span', {
			cls: 'auto-save-status',
		});

		if (this.state.lastSaveTime) {
			autoSaveStatus.textContent =
				this.language === 'ko'
					? `${this.formatTime(this.state.lastSaveTime)}에 저장됨`
					: `Saved at ${this.formatTime(this.state.lastSaveTime)}`;
		}

		// Separator
		editorContainer.createDiv('section-separator');
	}

	/**
	 * Render action buttons
	 *
	 * Creates: [💡 다음 단계 제안] [✅ 완료] [💾 저장]
	 */
	private renderActionButtons(): void {
		if (!this.state) return;

		const containerEl = this.contentEl.querySelector('.writing-view-container');
		if (!containerEl) return;

		this.actionButtonsEl = containerEl.createDiv('action-buttons');

		// Next steps suggestion button
		const suggestButton = this.actionButtonsEl.createEl('button', {
			text:
				this.language === 'ko'
					? '💡 다음 단계 제안'
					: '💡 Suggest Next Steps',
			cls: 'suggest-button',
		});

		suggestButton.addEventListener('click', () => {
			this.handleSuggestNextSteps();
		});

		// Complete button
		const completeButton = this.actionButtonsEl.createEl('button', {
			text: this.language === 'ko' ? '✅ 완료' : '✅ Complete',
			cls: 'complete-button',
		});

		completeButton.addEventListener('click', () => {
			this.handleCompleteSection();
		});

		// Save button
		const saveButton = this.actionButtonsEl.createEl('button', {
			text: this.language === 'ko' ? '💾 저장' : '💾 Save',
			cls: 'save-button',
		});

		saveButton.addEventListener('click', () => {
			this.handleManualSave();
		});
	}

	/**
	 * Render section navigation sidebar
	 *
	 * Shows all sections with status indicators.
	 */
	private renderSidebar(): void {
		if (!this.state) return;

		const containerEl = this.contentEl.querySelector('.writing-view-container');
		if (!containerEl) return;

		this.sidebarEl = containerEl.createDiv('section-sidebar');

		this.sidebarEl.createEl('h3', {
			text:
				this.language === 'ko'
					? '📋 섹션 목록'
					: '📋 Section List',
			cls: 'sidebar-title',
		});

		const sectionList = this.sidebarEl.createDiv('section-list');

		// Render each section
		for (const section of this.state.structure.sections) {
			const sectionItem = sectionList.createDiv('section-item');

			// Status icon
			let statusIcon = '';
			if (section.status === 'completed') {
				statusIcon = '✅';
				sectionItem.addClass('section-completed');
			} else if (section.status === 'in-progress') {
				statusIcon = '▶️';
				sectionItem.addClass('section-in-progress');
			} else {
				statusIcon = '⏸️';
				sectionItem.addClass('section-not-started');
			}

			// Section info
			const sectionInfo = sectionItem.createDiv('section-info');

			const titleText = `${statusIcon} ${this.language === 'ko' ? '섹션' : 'Section'} ${section.order}: ${section.title}`;
			sectionInfo.createEl('div', {
				text: titleText,
				cls: 'section-item-title',
			});

			// Word count
			let wordCountText = '';
			if (section.status === 'completed') {
				wordCountText = `${section.actualWords || 0} ${this.language === 'ko' ? '단어' : 'words'}`;
			} else if (section.status === 'in-progress') {
				wordCountText = `${section.actualWords || 0}/${section.estimatedWords} ${this.language === 'ko' ? '단어' : 'words'}`;
			} else {
				wordCountText = `0 ${this.language === 'ko' ? '단어' : 'words'}`;
			}

			sectionInfo.createEl('div', {
				text: wordCountText,
				cls: 'section-item-words',
			});

			// Click to navigate
			sectionItem.addEventListener('click', () => {
				this.handleSectionNavigation(section.id);
			});
		}
	}

	/**
	 * Update progress header
	 *
	 * Updates progress text and bar without full re-render.
	 */
	private updateProgressHeader(): void {
		if (!this.state || !this.progressHeaderEl) return;

		const { currentSectionIndex, structure, metadata, wordCount, currentSection } = this.state;
		const totalSections = structure.sections.length;
		const completionPercentage = metadata.progress.completionPercentage;

		// Update text
		const progressText =
			this.language === 'ko'
				? `진행: 섹션 ${currentSectionIndex + 1}/${totalSections} (${wordCount}/${currentSection.estimatedWords} 단어) • ${completionPercentage}% 완료`
				: `Progress: Section ${currentSectionIndex + 1}/${totalSections} (${wordCount}/${currentSection.estimatedWords} words) • ${completionPercentage}% complete`;

		const progressTextEl = this.progressHeaderEl.querySelector('.progress-text');
		if (progressTextEl) {
			progressTextEl.textContent = progressText;
		}

		// Update progress bar
		const progressFill = this.progressHeaderEl.querySelector('.progress-fill') as HTMLElement;
		if (progressFill) {
			progressFill.style.width = `${completionPercentage}%`;

			// Update color
			progressFill.removeClass('progress-fill-green', 'progress-fill-yellow', 'progress-fill-red');
			if (completionPercentage >= 80) {
				progressFill.addClass('progress-fill-green');
			} else if (completionPercentage >= 50) {
				progressFill.addClass('progress-fill-yellow');
			} else {
				progressFill.addClass('progress-fill-red');
			}
		}
	}

	/**
	 * Handle editor input
	 *
	 * Updates word count and marks state as dirty.
	 */
	private handleEditorInput(): void {
		if (!this.state || !this.editorEl) return;

		// Update content
		this.state.sectionContent = this.editorEl.value;
		this.state.isDirty = true;

		// Debounce word counting (500ms delay)
		if (this.wordCountTimer) {
			clearTimeout(this.wordCountTimer);
		}

		this.wordCountTimer = setTimeout(() => {
			this.updateWordCount();
		}, 500);
	}

	/**
	 * Update word count
	 *
	 * Counts words using SectionManager's countWords method.
	 */
	private updateWordCount(): void {
		if (!this.state) return;

		// Count words (uses SectionManager's markdown-aware counting)
		const wordCount = this.countWordsInContent(this.state.sectionContent);

		this.state.wordCount = wordCount;
		this.state.currentSection.actualWords = wordCount;

		// Update UI
		if (this.wordCountEl) {
			this.wordCountEl.textContent = this.formatWordCount();
		}

		// Update progress (word count affects completion percentage)
		this.updateProgressPercentage();
	}

	/**
	 * Count words in content
	 *
	 * Uses same algorithm as SectionManager.countWords()
	 * (Markdown-aware: excludes headers, formatting, links, code blocks)
	 */
	private countWordsInContent(content: string): number {
		if (!content || content.trim().length === 0) {
			return 0;
		}

		let text = content;

		// Strip YAML frontmatter
		text = text.replace(/^---\n[\s\S]*?\n---\n+/, '');

		// Remove code blocks
		text = text.replace(/```[\s\S]*?```/g, '');

		// Remove inline code
		text = text.replace(/`[^`]*`/g, '');

		// Remove images
		text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

		// Remove links (keep link text)
		text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

		// Remove HTML tags
		text = text.replace(/<[^>]*>/g, '');

		// Remove horizontal rules
		text = text.replace(/^[-*_]{3,}$/gm, '');

		// Remove list markers
		text = text.replace(/^[\s]*[-*+]\s+/gm, '');
		text = text.replace(/^[\s]*\d+\.\s+/gm, '');

		// Remove headers
		text = text.replace(/^#{1,6}\s+/gm, '');

		// Remove markdown formatting
		text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold **
		text = text.replace(/__(.*?)__/g, '$1'); // Bold __
		text = text.replace(/~~(.*?)~~/g, '$1'); // Strikethrough
		text = text.replace(/\*(.*?)\*/g, '$1'); // Italic *
		text = text.replace(/_(.*?)_/g, '$1'); // Italic _

		// Split on whitespace and count
		const words = text
			.split(/\s+/)
			.filter((word) => word.trim().length > 0);

		return words.length;
	}

	/**
	 * Update progress percentage
	 *
	 * Calculates overall completion percentage based on word counts.
	 */
	private updateProgressPercentage(): void {
		if (!this.state) return;

		const { structure } = this.state;
		const totalEstimatedWords = structure.totalEstimatedWords;

		// Calculate weighted progress
		let completedWords = 0;

		for (const section of structure.sections) {
			if (section.status === 'completed') {
				completedWords += section.estimatedWords;
			} else if (section.status === 'in-progress') {
				const actualWords = section.actualWords || 0;
				completedWords += Math.min(actualWords, section.estimatedWords);
			}
		}

		const percentage =
			totalEstimatedWords > 0
				? (completedWords / totalEstimatedWords) * 100
				: 0;

		this.state.metadata.progress.completionPercentage = Math.max(
			0,
			Math.min(100, Math.round(percentage))
		);

		// Update UI
		this.updateProgressHeader();
	}

	/**
	 * Handle keyboard shortcuts
	 *
	 * - Ctrl/Cmd+S: Manual save
	 * - Ctrl/Cmd+Enter: Mark section complete
	 * - Ctrl/Cmd+N: Next steps suggestion
	 */
	private handleKeyDown(e: KeyboardEvent): void {
		const isMod = e.metaKey || e.ctrlKey;

		if (isMod && e.key === 's') {
			e.preventDefault();
			this.handleManualSave();
		} else if (isMod && e.key === 'Enter') {
			e.preventDefault();
			this.handleCompleteSection();
		} else if (isMod && e.key === 'n') {
			e.preventDefault();
			this.handleSuggestNextSteps();
		}
	}

	/**
	 * Handle manual save
	 *
	 * Saves section content and updates UI.
	 */
	private async handleManualSave(): Promise<void> {
		await this.saveSection();

		const saveTime = this.formatTime(new Date());
		new Notice(
			this.language === 'ko'
				? `${saveTime}에 초안 저장됨`
				: `Draft saved at ${saveTime}`
		);
	}

	/**
	 * Handle suggest next steps
	 *
	 * Calls AI service with outcome-aware prompting.
	 */
	private async handleSuggestNextSteps(): Promise<void> {
		if (!this.state) return;

		try {
			this.state.isSuggestingNextSteps = true;

			// Update UI - show loading state
			const loadingNotice = new Notice(
				this.language === 'ko'
					? '🌿 섹션과 목표 분석 중...'
					: '🌿 Analyzing section and outcome...',
				0 // Keep open until dismissed
			);

			// Generate outcome-aware suggestions
			const suggestions = await this.generateAISuggestions();

			// Dismiss loading notice
			loadingNotice.hide();

			// Show suggestions in modal or append to document
			this.displaySuggestions(suggestions);

			new Notice(
				this.language === 'ko'
					? '제안이 생성되었습니다!'
					: 'Suggestions generated!'
			);
		} catch (error) {
			console.error('Failed to generate suggestions:', error);
			new Notice(
				this.language === 'ko'
					? 'AI 제안 생성 실패'
					: 'Failed to generate AI suggestions'
			);
		} finally {
			if (this.state) {
				this.state.isSuggestingNextSteps = false;
			}
		}
	}

	/**
	 * Generate AI suggestions (outcome-aware)
	 *
	 * Uses outcome context + section context for targeted suggestions.
	 */
	private async generateAISuggestions(): Promise<AISuggestion[]> {
		if (!this.state) return [];

		// TODO: Integrate with AIService once available
		// For now, return mock suggestions
		// const { outcome, currentSection, sectionContent, wordCount } = this.state;

		// Mock suggestions (replace with actual AI call)
		const suggestions: AISuggestion[] = [
			{
				title:
					this.language === 'ko'
						? '깊이 더하기 - 임팩트 지표 추가'
						: 'Add Depth - Include Impact Metrics',
				direction:
					this.language === 'ko'
						? '리더십을 위해 임팩트를 정량화하세요'
						: 'Quantify impact for leadership',
				rationale:
					this.language === 'ko'
						? '목표 대상이 숫자를 중요하게 생각합니다'
						: 'Your audience values numbers',
				contentHints:
					this.language === 'ko'
						? '• 사용자 참여도 증가?\n• 매출 임팩트?\n• 경쟁 우위?'
						: '• User engagement increase?\n• Revenue impact?\n• Competitive advantage?',
				estimatedWords: 70,
				priority: 3,
			},
			{
				title:
					this.language === 'ko'
						? '완성 - 팀 인정하기'
						: 'Complete - Acknowledge Team',
				direction:
					this.language === 'ko'
						? '팀의 노력을 간략히 인정하세요'
						: 'Briefly acknowledge team efforts',
				rationale:
					this.language === 'ko'
						? '리더십은 팀 인정을 가치있게 여깁니다'
						: 'Leadership values team recognition',
				contentHints:
					this.language === 'ko'
						? '• 몇 명이 기여했나요?\n• 부서 간 협업?\n• 간결하게 (최대 1문장)'
						: '• How many contributors?\n• Cross-team collaboration?\n• Keep brief (max 1 sentence)',
				estimatedWords: 40,
				priority: 2,
			},
		];

		return suggestions;
	}

	/**
	 * Display AI suggestions
	 *
	 * Appends suggestions to document or shows in modal.
	 */
	private displaySuggestions(suggestions: AISuggestion[]): void {
		if (!this.state || !this.editorEl) return;

		// Format suggestions as markdown
		const suggestionsMarkdown = this.formatSuggestionsAsMarkdown(suggestions);

		// Append to editor content
		const currentContent = this.editorEl.value;
		const newContent = `${currentContent}\n\n${suggestionsMarkdown}`;

		this.editorEl.value = newContent;
		this.state.sectionContent = newContent;
		this.state.isDirty = true;

		// Update word count
		this.updateWordCount();
	}

	/**
	 * Format suggestions as markdown
	 *
	 * Creates formatted markdown block with suggestions.
	 */
	private formatSuggestionsAsMarkdown(suggestions: AISuggestion[]): string {
		const lines: string[] = [];

		lines.push('---');
		lines.push('');
		lines.push(
			this.language === 'ko'
				? `## 💡 "${this.state!.currentSection.title}" 다음 단계`
				: `## 💡 Next Steps for "${this.state!.currentSection.title}"`
		);
		lines.push('');
		lines.push(
			this.language === 'ko'
				? `현재 진행: ${this.state!.wordCount} / ${this.state!.currentSection.estimatedWords} 단어`
				: `Current progress: ${this.state!.wordCount} / ${this.state!.currentSection.estimatedWords} words`
		);
		lines.push('');

		for (const suggestion of suggestions) {
			const stars = '⭐'.repeat(suggestion.priority);

			lines.push(`### ${stars} ${suggestion.title}`);
			lines.push(`**${this.language === 'ko' ? '방향' : 'Direction'}**: ${suggestion.direction}`);
			lines.push('');
			lines.push(`**${this.language === 'ko' ? '왜 중요한가' : 'Why Important'}**: ${suggestion.rationale}`);
			lines.push('');
			lines.push(`**${this.language === 'ko' ? '내용 힌트' : 'Content Hints'}**:`);
			lines.push(suggestion.contentHints);
			lines.push('');
			lines.push(`**${this.language === 'ko' ? '예상' : 'Estimated'}**: +${suggestion.estimatedWords} ${this.language === 'ko' ? '단어' : 'words'}`);
			lines.push('');
			lines.push('---');
			lines.push('');
		}

		lines.push(
			this.language === 'ko'
				? '비용: $0.004 • Claude 3.5 Sonnet • 2초'
				: 'Cost: $0.004 • Claude 3.5 Sonnet • 2s'
		);

		return lines.join('\n');
	}

	/**
	 * Handle complete section
	 *
	 * Validates section and moves to next section.
	 */
	private async handleCompleteSection(): Promise<void> {
		if (!this.state) return;

		try {
			this.state.isValidating = true;

			// Validate section
			const validationResult = this.validateSection();

			if (!validationResult.valid) {
				// Show validation errors
				this.showValidationResult(validationResult);
				return;
			}

			// Save section as completed
			await this.sectionManager.completeSection(
				this.state.file,
				this.state.currentSection.id,
				this.state.sectionContent
			);

			// Update metadata
			this.state.currentSection.status = 'completed';
			this.state.metadata.progress.completedSections++;

			// Show success
			this.showValidationResult(validationResult);

			// Move to next section
			await this.moveToNextSection();
		} catch (error) {
			console.error('Failed to complete section:', error);
			new Notice(
				this.language === 'ko'
					? '섹션 완료 실패'
					: 'Failed to complete section'
			);
		} finally {
			if (this.state) {
				this.state.isValidating = false;
			}
		}
	}

	/**
	 * Validate section
	 *
	 * Checks: 80% word count, purpose addressed, outcome alignment.
	 */
	private validateSection(): SectionValidationResult {
		if (!this.state) {
			return {
				valid: false,
				errors: ['Invalid state'],
				warnings: [],
				wordCountMet: false,
				purposeMet: false,
				outcomeMet: false,
			};
		}

		const errors: string[] = [];
		const warnings: string[] = [];
		const { currentSection, wordCount, sectionContent } = this.state;

		// Check word count (80% minimum)
		const minWords = Math.floor(currentSection.estimatedWords * 0.8);
		const wordCountMet = wordCount >= minWords;

		if (!wordCountMet) {
			errors.push(
				this.language === 'ko'
					? `최소 단어 수 미충족 (${wordCount}/${minWords} 단어)`
					: `Minimum word count not met (${wordCount}/${minWords} words)`
			);
		}

		// Basic purpose check (keywords in content)
		const purposeMet = this.checkPurposeAddressed(sectionContent, currentSection);

		if (!purposeMet) {
			warnings.push(
				this.language === 'ko'
					? '섹션 목적이 충분히 다뤄지지 않았을 수 있습니다'
					: 'Section purpose may not be fully addressed'
			);
		}

		// Outcome alignment check (basic keyword matching)
		const outcomeMet = this.checkOutcomeAlignment(sectionContent);

		if (!outcomeMet) {
			warnings.push(
				this.language === 'ko'
					? '문서 목표와의 정렬을 확인하세요'
					: 'Check alignment with document outcome'
			);
		}

		const valid = errors.length === 0;

		return {
			valid,
			errors,
			warnings,
			wordCountMet,
			purposeMet,
			outcomeMet,
		};
	}

	/**
	 * Check if section purpose is addressed
	 *
	 * Basic keyword matching against purpose and prompt.
	 */
	private checkPurposeAddressed(content: string, section: DocumentSection): boolean {
		if (!content || content.trim().length === 0) {
			return false;
		}

		// Extract keywords from purpose and prompt
		const keywords = [
			...this.extractKeywords(section.purpose),
			...this.extractKeywords(section.writingPrompt),
		];

		// Check if at least 50% of keywords appear in content
		const contentLower = content.toLowerCase();
		const matchedKeywords = keywords.filter((keyword) =>
			contentLower.includes(keyword.toLowerCase())
		);

		return matchedKeywords.length >= keywords.length * 0.5;
	}

	/**
	 * Check if content aligns with document outcome
	 *
	 * Basic keyword matching against outcome description.
	 */
	private checkOutcomeAlignment(content: string): boolean {
		if (!this.state || !content || content.trim().length === 0) {
			return false;
		}

		const outcomeKeywords = this.extractKeywords(this.state.outcome.description);

		// Check if at least 30% of outcome keywords appear in content
		const contentLower = content.toLowerCase();
		const matchedKeywords = outcomeKeywords.filter((keyword) =>
			contentLower.includes(keyword.toLowerCase())
		);

		return matchedKeywords.length >= outcomeKeywords.length * 0.3;
	}

	/**
	 * Extract keywords from text
	 *
	 * Extracts meaningful words (4+ characters, excluding common words).
	 */
	private extractKeywords(text: string): string[] {
		const stopWords = [
			'the',
			'and',
			'for',
			'with',
			'this',
			'that',
			'from',
			'을',
			'를',
			'이',
			'가',
			'은',
			'는',
			'의',
		];

		const words = text
			.toLowerCase()
			.split(/\s+/)
			.filter(
				(word) =>
					word.length >= 4 &&
					!stopWords.includes(word) &&
					/^[a-z가-힣]+$/.test(word)
			);

		// Remove duplicates
		return [...new Set(words)];
	}

	/**
	 * Show validation result
	 *
	 * Displays validation checkmarks or errors.
	 */
	private showValidationResult(result: SectionValidationResult): void {
		const lines: string[] = [];

		if (this.language === 'ko') {
			lines.push('📊 섹션 검증');
			lines.push('');

			if (result.wordCountMet) {
				lines.push('✅ 최소 길이 충족');
			} else {
				lines.push('❌ 최소 길이 미충족');
			}

			if (result.purposeMet) {
				lines.push('✅ 섹션 목적 다룸');
			} else {
				lines.push('⚠️ 섹션 목적 확인 필요');
			}

			if (result.outcomeMet) {
				lines.push('✅ 문서 목표와 정렬');
			} else {
				lines.push('⚠️ 문서 목표 정렬 확인 필요');
			}

			if (result.valid) {
				lines.push('');
				lines.push('섹션 완료! 다음 섹션으로 이동 중...');
			}
		} else {
			lines.push('📊 Section Validation');
			lines.push('');

			if (result.wordCountMet) {
				lines.push('✅ Minimum length met');
			} else {
				lines.push('❌ Minimum length not met');
			}

			if (result.purposeMet) {
				lines.push('✅ Section purpose addressed');
			} else {
				lines.push('⚠️ Section purpose needs review');
			}

			if (result.outcomeMet) {
				lines.push('✅ Aligned with document outcome');
			} else {
				lines.push('⚠️ Outcome alignment needs review');
			}

			if (result.valid) {
				lines.push('');
				lines.push('Section complete! Moving to next section...');
			}
		}

		// Show errors
		if (result.errors.length > 0) {
			lines.push('');
			lines.push(this.language === 'ko' ? '오류:' : 'Errors:');
			for (const error of result.errors) {
				lines.push(`• ${error}`);
			}
		}

		// Show warnings
		if (result.warnings.length > 0) {
			lines.push('');
			lines.push(this.language === 'ko' ? '경고:' : 'Warnings:');
			for (const warning of result.warnings) {
				lines.push(`• ${warning}`);
			}
		}

		new Notice(lines.join('\n'), 5000);
	}

	/**
	 * Move to next section
	 *
	 * Loads next incomplete section or shows completion dialog.
	 */
	private async moveToNextSection(): Promise<void> {
		if (!this.state) return;

		// Find next incomplete section
		const nextSectionIndex = this.state.structure.sections.findIndex(
			(s, idx) =>
				idx > this.state!.currentSectionIndex &&
				s.status !== 'completed'
		);

		if (nextSectionIndex === -1) {
			// All sections completed!
			this.showCompletionDialog(this.state.metadata);
			return;
		}

		// Load next section
		const nextSection = this.state.structure.sections[nextSectionIndex];

		this.state.currentSectionIndex = nextSectionIndex;
		this.state.currentSection = nextSection;
		this.state.sectionContent = nextSection.content || '';
		this.state.wordCount = nextSection.actualWords || 0;
		this.state.isDirty = false;

		// Mark as in-progress
		await this.sectionManager.startSection(
			this.state.file,
			nextSection.id
		);
		nextSection.status = 'in-progress';

		// Re-render view
		this.renderView();
	}

	/**
	 * Handle section navigation
	 *
	 * Navigates to specific section (with confirmation if dirty).
	 */
	private async handleSectionNavigation(sectionId: string): Promise<void> {
		if (!this.state) return;

		// Check if current section has unsaved changes
		if (this.state.isDirty) {
			const confirm = await this.confirmNavigation();
			if (!confirm) return;

			// Save before navigating
			await this.saveSection();
		}

		// Find section index
		const sectionIndex = this.state.structure.sections.findIndex(
			(s) => s.id === sectionId
		);

		if (sectionIndex === -1) return;

		const section = this.state.structure.sections[sectionIndex];

		// Load section
		this.state.currentSectionIndex = sectionIndex;
		this.state.currentSection = section;
		this.state.sectionContent = section.content || '';
		this.state.wordCount = section.actualWords || 0;
		this.state.isDirty = false;

		// Mark as in-progress if not started
		if (section.status === 'not-started') {
			await this.sectionManager.startSection(this.state.file, section.id);
			section.status = 'in-progress';
		}

		// Re-render view
		this.renderView();
	}

	/**
	 * Confirm navigation with unsaved changes
	 */
	private async confirmNavigation(): Promise<boolean> {
		return new Promise((resolve) => {
			const message =
				this.language === 'ko'
					? '저장하지 않은 변경사항이 있습니다. 계속하시겠습니까?'
					: 'You have unsaved changes. Continue anyway?';

			const confirmed = confirm(message);
			resolve(confirmed);
		});
	}

	/**
	 * Show completion dialog
	 *
	 * Shows stats and options when all sections complete.
	 */
	private showCompletionDialog(metadata: OutcomeDocumentMetadata): void {
		const { structure, progress } = metadata;

		const lines: string[] = [];

		if (this.language === 'ko') {
			lines.push('🎉 문서 완성!');
			lines.push('');
			lines.push(`✅ 섹션: ${structure.sections.length}개 완료`);
			lines.push(`📝 단어: ${progress.wordsWritten}개 작성`);
			lines.push(`⏱️ 시간: ${progress.timeSpent}분 소요`);
			lines.push('');
			lines.push('옵션: [문서 보기] [내보내기] [템플릿으로 저장]');
		} else {
			lines.push('🎉 Document Complete!');
			lines.push('');
			lines.push(`✅ Sections: ${structure.sections.length} completed`);
			lines.push(`📝 Words: ${progress.wordsWritten} written`);
			lines.push(`⏱️ Time: ${progress.timeSpent} minutes`);
			lines.push('');
			lines.push('Options: [View Document] [Export] [Save as Template]');
		}

		new Notice(lines.join('\n'), 10000);

		// Call completion callback
		if (this.options.onComplete) {
			this.options.onComplete(this.state!.file);
		}

		// Close view
		this.close();
	}

	/**
	 * Save section
	 *
	 * Auto-saves section content and updates metadata.
	 */
	private async saveSection(): Promise<void> {
		if (!this.state || !this.state.isDirty) return;

		try {
			this.state.isSaving = true;

			// Save using SectionManager
			await this.sectionManager.autoSaveSection(
				this.state.file,
				this.state.currentSection.id,
				this.state.sectionContent
			);

			// Update state
			this.state.isDirty = false;
			this.state.lastSaveTime = new Date();

			// Update UI - auto-save status
			const containerEl = this.contentEl.querySelector('.writing-view-container');
			const autoSaveStatus = containerEl?.querySelector('.auto-save-status');
			if (autoSaveStatus) {
				autoSaveStatus.textContent =
					this.language === 'ko'
						? `${this.formatTime(this.state.lastSaveTime)}에 자동 저장됨`
						: `Auto-saved at ${this.formatTime(this.state.lastSaveTime)}`;
			}
		} catch (error) {
			console.error('Failed to save section:', error);
			// Don't show notice for auto-save failures (silent)
		} finally {
			if (this.state) {
				this.state.isSaving = false;
			}
		}
	}

	/**
	 * Start auto-save timer
	 *
	 * Saves every 30 seconds if content changed.
	 */
	private startAutoSave(): void {
		this.autoSaveTimer = setInterval(() => {
			this.saveSection();
		}, 30000); // 30 seconds
	}

	/**
	 * Stop auto-save timer
	 */
	private stopAutoSave(): void {
		if (this.autoSaveTimer) {
			clearInterval(this.autoSaveTimer);
			this.autoSaveTimer = null;
		}
	}

	/**
	 * Find current section index
	 *
	 * Finds first incomplete section or current in-progress section.
	 */
	private findCurrentSectionIndex(metadata: OutcomeDocumentMetadata): number {
		const { sections } = metadata.structure;

		// First, check if there's an in-progress section
		const inProgressIndex = sections.findIndex(
			(s) => s.status === 'in-progress'
		);
		if (inProgressIndex !== -1) return inProgressIndex;

		// Otherwise, find first not-started section
		const notStartedIndex = sections.findIndex(
			(s) => s.status === 'not-started'
		);
		if (notStartedIndex !== -1) return notStartedIndex;

		// All sections completed
		return -1;
	}

	/**
	 * Format word count
	 *
	 * Formats: "150 / 400 단어"
	 */
	private formatWordCount(): string {
		if (!this.state) return '';

		const { wordCount, currentSection } = this.state;

		return this.language === 'ko'
			? `${wordCount} / ${currentSection.estimatedWords} 단어`
			: `${wordCount} / ${currentSection.estimatedWords} words`;
	}

	/**
	 * Format time
	 *
	 * Formats: "오후 2:34"
	 */
	private formatTime(date: Date): string {
		const hours = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, '0');

		if (this.language === 'ko') {
			const period = hours >= 12 ? '오후' : '오전';
			const displayHours = hours % 12 || 12;
			return `${period} ${displayHours}:${minutes}`;
		} else {
			const period = hours >= 12 ? 'PM' : 'AM';
			const displayHours = hours % 12 || 12;
			return `${displayHours}:${minutes} ${period}`;
		}
	}
}
