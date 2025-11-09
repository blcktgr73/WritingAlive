/**
 * Structure Preview Modal
 *
 * Modal for reviewing and customizing AI-generated document structure.
 * Second step in outcome-driven workflow after OutcomeDefinitionModal.
 *
 * Design Principles (SOLID):
 * - Single Responsibility: Only handles structure preview/editing UI
 * - Open/Closed: Extensible through drag-and-drop plugins
 * - Dependency Inversion: Accepts managers via dependency injection
 * - Interface Segregation: Focused public API
 *
 * User Flow:
 * 1. Receives structure from StructureGenerator
 * 2. Displays sections with details and visual overview
 * 3. User can edit, reorder, add, or delete sections
 * 4. Validates against Saligo principles (low-energy, realistic estimates)
 * 5. On "Start Writing" → creates document and opens writing view
 *
 * Features:
 * - Section cards with expand/collapse
 * - Inline section editing (title, purpose, prompt, estimates)
 * - Drag-and-drop reordering
 * - Add/delete sections with real-time totals update
 * - Progress bar showing effort distribution (% of total)
 * - Saligo principles validation with visual feedback
 * - Reset to original AI structure
 * - Accessibility support (ARIA, keyboard nav)
 *
 * Architecture:
 * - Composition: Uses OutcomeManager and SectionManager
 * - Event-driven: Callbacks for document creation
 * - State Management: Tracks original and edited structures
 */

import { Modal, App, Setting, Notice, TFile, normalizePath } from 'obsidian';
import type {
	OutcomeDefinition,
	DocumentStructure,
	DocumentSection,
} from '../../services/outcome/types';
import type { OutcomeManager } from '../../services/outcome/outcome-manager';
import type { SectionManager } from '../../services/outcome/section-manager';
import type { StructureGenerator } from '../../services/outcome/structure-generator';

/**
 * Structure Preview Modal Options
 *
 * Configuration for modal initialization.
 */
export interface StructurePreviewModalOptions {
	/**
	 * Outcome definition from previous step
	 */
	outcome: OutcomeDefinition;

	/**
	 * AI-generated document structure
	 */
	structure: DocumentStructure;

	/**
	 * Callback when user clicks "Start Writing"
	 * Receives created document file
	 */
	onStartWriting: (file: TFile) => Promise<void>;

	/**
	 * Language preference for UI text
	 * @default 'en'
	 */
	language?: 'ko' | 'en';
}

/**
 * Section Edit State
 *
 * Tracks which section is currently being edited.
 */
interface SectionEditState {
	sectionId: string | null;
	originalSection: DocumentSection | null;
}

/**
 * Saligo Validation Result
 *
 * Validation against Saligo principles.
 */
interface SaligoValidationResult {
	valid: boolean;
	warnings: string[];
	passes: string[];
}

/**
 * Structure Preview Modal
 *
 * Modal for reviewing and editing document structure before writing.
 */
export class StructurePreviewModal extends Modal {
	private language: 'ko' | 'en';

	// State
	private originalStructure: DocumentStructure;
	private currentStructure: DocumentStructure;
	private editState: SectionEditState = {
		sectionId: null,
		originalSection: null,
	};
	private isCreatingDocument = false;
	private draggedSectionId: string | null = null;

	// DOM references
	private structureContainer: HTMLElement | null = null;
	private validationContainer: HTMLElement | null = null;
	private startButton: HTMLButtonElement | null = null;

	/**
	 * Constructor
	 *
	 * @param app - Obsidian App instance
	 * @param outcomeManager - Service for outcome operations
	 * @param sectionManager - Service for section operations
	 * @param structureGenerator - Optional generator for regeneration
	 * @param options - Modal configuration
	 */
	constructor(
		app: App,
		// Reserved for future use (section validation, regeneration)
		// @ts-ignore - TS6138
		private _outcomeManager: OutcomeManager,
		// @ts-ignore - TS6138
		private _sectionManager: SectionManager,
		// @ts-ignore - TS6138
		private _structureGenerator: StructureGenerator | null,
		private options: StructurePreviewModalOptions
	) {
		super(app);
		this.language = options.language || 'en';

		// Deep clone structure to avoid mutating original
		this.originalStructure = this.cloneStructure(options.structure);
		this.currentStructure = this.cloneStructure(options.structure);
	}

	/**
	 * Open modal and render content
	 */
	onOpen(): void {
		const { contentEl } = this;

		// Add modal class for styling
		this.modalEl.addClass('structure-preview-modal');

		// Render modal content
		this.renderHeader(contentEl);
		this.renderOverview(contentEl);
		this.renderSections(contentEl);
		this.renderActions(contentEl);
		this.renderValidation(contentEl);
		this.renderFooter(contentEl);

		// Perform initial validation
		this.validateSaligoCompliance();
	}

	/**
	 * Close modal and cleanup
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();

		// Clear DOM references
		this.structureContainer = null;
		this.validationContainer = null;
		this.startButton = null;
	}

	// ========================================================================
	// Rendering Methods
	// ========================================================================

	/**
	 * Render modal header
	 */
	private renderHeader(container: HTMLElement): void {
		const header = container.createDiv('structure-preview-modal__header');

		const isKorean = this.language === 'ko';
		header.createEl('h2', {
			cls: 'structure-preview-modal__title',
			text: isKorean ? '📋 문서 구조' : '📋 Document Structure',
		});

		header.createEl('h3', {
			cls: 'structure-preview-modal__subtitle',
			text: this.currentStructure.title,
		});
	}

	/**
	 * Render structure overview (stats summary)
	 */
	private renderOverview(container: HTMLElement): void {
		const overview = container.createDiv('structure-preview-modal__overview');

		const isKorean = this.language === 'ko';
		const stats = this.calculateStats();

		overview.createSpan({
			cls: 'structure-preview-modal__stat',
			text: isKorean
				? `📊 개요: ${stats.sectionCount}개 섹션 • ~${stats.totalWords} 단어 • ~${stats.totalMinutes}분`
				: `📊 Overview: ${stats.sectionCount} sections • ~${stats.totalWords} words • ~${stats.totalMinutes} min`,
		});
	}

	/**
	 * Render section cards
	 */
	private renderSections(container: HTMLElement): void {
		this.structureContainer = container.createDiv(
			'structure-preview-modal__sections'
		);

		this.updateSectionsDisplay();
	}

	/**
	 * Update sections display (for re-rendering after changes)
	 */
	private updateSectionsDisplay(): void {
		if (!this.structureContainer) return;

		this.structureContainer.empty();

		// Render each section card
		for (const section of this.currentStructure.sections) {
			this.renderSectionCard(this.structureContainer, section);
		}
	}

	/**
	 * Render individual section card
	 */
	private renderSectionCard(
		container: HTMLElement,
		section: DocumentSection
	): void {
		const isEditing = this.editState.sectionId === section.id;

		const card = container.createDiv({
			cls: 'structure-preview-modal__section-card',
			attr: {
				'data-section-id': section.id,
				draggable: 'true',
			},
		});

		// Drag events
		card.addEventListener('dragstart', (e) => this.handleDragStart(e, section.id));
		card.addEventListener('dragover', (e) => this.handleDragOver(e));
		card.addEventListener('drop', (e) => this.handleDrop(e, section.id));
		card.addEventListener('dragend', () => this.handleDragEnd());

		if (isEditing) {
			// Render edit mode
			this.renderSectionEditMode(card, section);
		} else {
			// Render view mode
			this.renderSectionViewMode(card, section);
		}
	}

	/**
	 * Render section in view mode (collapsed/expanded)
	 */
	private renderSectionViewMode(
		card: HTMLElement,
		section: DocumentSection
	): void {
		const isKorean = this.language === 'ko';

		// Header with number, title, and edit button
		const header = card.createDiv('structure-preview-modal__section-header');

		// Drag handle
		header.createSpan({
			cls: 'structure-preview-modal__drag-handle',
			text: '⋮⋮',
			attr: {
				'aria-label': isKorean ? '드래그하여 순서 변경' : 'Drag to reorder',
			},
		});

		// Section number
		header.createSpan({
			cls: 'structure-preview-modal__section-number',
			text: `${section.order}️⃣`,
		});

		// Section title
		header.createSpan({
			cls: 'structure-preview-modal__section-title',
			text: section.title,
		});

		// Edit button
		const editButton = header.createEl('button', {
			cls: 'structure-preview-modal__edit-button',
			text: isKorean ? '편집 ▼' : 'Edit ▼',
			attr: {
				'aria-label': isKorean ? '섹션 편집' : 'Edit section',
			},
		});

		editButton.addEventListener('click', () => {
			this.startEditingSection(section);
		});

		// Section details
		const details = card.createDiv('structure-preview-modal__section-details');

		// Purpose
		details.createDiv({
			cls: 'structure-preview-modal__section-field',
			text: `${isKorean ? '목적' : 'Purpose'}: ${section.purpose}`,
		});

		// Estimates
		details.createDiv({
			cls: 'structure-preview-modal__section-field',
			text: `${isKorean ? '목표' : 'Target'}: ${section.estimatedWords} ${isKorean ? '단어' : 'words'} • ${section.estimatedMinutes} ${isKorean ? '분' : 'min'}`,
		});

		// Writing prompt
		const promptSection = details.createDiv('structure-preview-modal__section-prompt');
		promptSection.createDiv({
			cls: 'structure-preview-modal__section-prompt-label',
			text: isKorean ? '작성 프롬프트:' : 'Writing Prompt:',
		});
		promptSection.createDiv({
			cls: 'structure-preview-modal__section-prompt-text',
			text: section.writingPrompt,
		});

		// Progress bar (% of total effort)
		this.renderProgressBar(details, section);

		// Delete button
		const deleteButton = card.createEl('button', {
			cls: 'structure-preview-modal__delete-button',
			text: '🗑️',
			attr: {
				'aria-label': isKorean ? '섹션 삭제' : 'Delete section',
			},
		});

		deleteButton.addEventListener('click', () => {
			this.deleteSection(section.id);
		});
	}

	/**
	 * Render section in edit mode
	 */
	private renderSectionEditMode(
		card: HTMLElement,
		section: DocumentSection
	): void {
		const isKorean = this.language === 'ko';

		card.addClass('structure-preview-modal__section-card--editing');

		const editForm = card.createDiv('structure-preview-modal__edit-form');

		// Title input
		new Setting(editForm)
			.setName(isKorean ? '제목' : 'Title')
			.addText((text) => {
				text.setValue(section.title)
					.setPlaceholder(isKorean ? '섹션 제목' : 'Section title')
					.inputEl.id = `edit-title-${section.id}`;
			});

		// Purpose input
		new Setting(editForm)
			.setName(isKorean ? '목적' : 'Purpose')
			.addTextArea((textarea) => {
				textarea
					.setValue(section.purpose)
					.setPlaceholder(
						isKorean ? '이 섹션의 목적' : 'Purpose of this section'
					);
				textarea.inputEl.rows = 2;
				textarea.inputEl.id = `edit-purpose-${section.id}`;
			});

		// Writing prompt input
		new Setting(editForm)
			.setName(isKorean ? '작성 프롬프트' : 'Writing Prompt')
			.addTextArea((textarea) => {
				textarea
					.setValue(section.writingPrompt)
					.setPlaceholder(
						isKorean
							? '구체적이고 실행 가능한 프롬프트'
							: 'Specific, actionable prompt'
					);
				textarea.inputEl.rows = 3;
				textarea.inputEl.id = `edit-prompt-${section.id}`;
			});

		// Estimates row
		const estimatesRow = editForm.createDiv(
			'structure-preview-modal__estimates-row'
		);

		// Word estimate
		new Setting(estimatesRow)
			.setName(isKorean ? '단어 수' : 'Words')
			.addText((text) => {
				text.setValue(String(section.estimatedWords))
					.setPlaceholder('200')
					.inputEl.type = 'number';
				text.inputEl.id = `edit-words-${section.id}`;
			});

		// Time estimate
		new Setting(estimatesRow)
			.setName(isKorean ? '시간(분)' : 'Time (min)')
			.addText((text) => {
				text.setValue(String(section.estimatedMinutes))
					.setPlaceholder('5')
					.inputEl.type = 'number';
				text.inputEl.id = `edit-minutes-${section.id}`;
			});

		// Required checkbox
		new Setting(editForm)
			.setName(isKorean ? '필수 섹션' : 'Required Section')
			.addToggle((toggle) => {
				toggle.setValue(section.required);
				toggle.toggleEl.id = `edit-required-${section.id}`;
			});

		// Action buttons
		const actions = editForm.createDiv('structure-preview-modal__edit-actions');

		// Cancel button
		const cancelButton = actions.createEl('button', {
			cls: 'structure-preview-modal__edit-action structure-preview-modal__edit-action--secondary',
			text: isKorean ? '취소' : 'Cancel',
		});

		cancelButton.addEventListener('click', () => {
			this.cancelEditingSection();
		});

		// Save button
		const saveButton = actions.createEl('button', {
			cls: 'structure-preview-modal__edit-action structure-preview-modal__edit-action--primary',
			text: isKorean ? '저장' : 'Save',
		});

		saveButton.addEventListener('click', () => {
			this.saveEditedSection(section.id);
		});
	}

	/**
	 * Render progress bar showing section's % of total effort
	 */
	private renderProgressBar(container: HTMLElement, section: DocumentSection): void {
		const isKorean = this.language === 'ko';

		const progressContainer = container.createDiv(
			'structure-preview-modal__progress-container'
		);

		const percentage = this.calculateSectionPercentage(section);

		const progressBar = progressContainer.createDiv({
			cls: 'structure-preview-modal__progress-bar',
		});

		const progressFill = progressBar.createDiv({
			cls: 'structure-preview-modal__progress-fill',
		});

		progressFill.style.width = `${percentage}%`;

		// Color-code by percentage (more effort = darker)
		if (percentage > 40) {
			progressFill.addClass('structure-preview-modal__progress-fill--high');
		} else if (percentage > 20) {
			progressFill.addClass('structure-preview-modal__progress-fill--medium');
		} else {
			progressFill.addClass('structure-preview-modal__progress-fill--low');
		}

		progressContainer.createSpan({
			cls: 'structure-preview-modal__progress-label',
			text: isKorean
				? `문서의 ${percentage}%`
				: `${percentage}% of document`,
		});
	}

	/**
	 * Render action buttons (add section, reorder, reset)
	 */
	private renderActions(container: HTMLElement): void {
		const isKorean = this.language === 'ko';

		const actions = container.createDiv('structure-preview-modal__actions');

		// Add section button
		const addButton = actions.createEl('button', {
			cls: 'structure-preview-modal__action-button',
			text: isKorean ? '+ 섹션 추가' : '+ Add Section',
		});

		addButton.addEventListener('click', () => {
			this.addNewSection();
		});

		// Reset to original button
		const resetButton = actions.createEl('button', {
			cls: 'structure-preview-modal__action-button',
			text: isKorean ? '⟲ AI 제안으로 초기화' : '⟲ Reset to AI Suggestion',
		});

		resetButton.addEventListener('click', () => {
			this.resetToOriginalStructure();
		});
	}

	/**
	 * Render Saligo validation feedback
	 */
	private renderValidation(container: HTMLElement): void {
		this.validationContainer = container.createDiv(
			'structure-preview-modal__validation'
		);

		// Will be populated by validateSaligoCompliance()
	}

	/**
	 * Update validation display
	 */
	private updateValidationDisplay(result: SaligoValidationResult): void {
		if (!this.validationContainer) return;

		this.validationContainer.empty();

		const isKorean = this.language === 'ko';

		const header = this.validationContainer.createDiv(
			'structure-preview-modal__validation-header'
		);

		header.createEl('strong', {
			text: isKorean
				? '이 구조는 살리고 원칙을 따릅니다:'
				: 'This structure follows Saligo principles:',
		});

		// Show passes (checkmarks)
		if (result.passes.length > 0) {
			const passesList = this.validationContainer.createDiv(
				'structure-preview-modal__validation-passes'
			);

			for (const pass of result.passes) {
				passesList.createDiv({
					cls: 'structure-preview-modal__validation-item structure-preview-modal__validation-item--pass',
					text: `✅ ${pass}`,
				});
			}
		}

		// Show warnings
		if (result.warnings.length > 0) {
			const warningsList = this.validationContainer.createDiv(
				'structure-preview-modal__validation-warnings'
			);

			for (const warning of result.warnings) {
				warningsList.createDiv({
					cls: 'structure-preview-modal__validation-item structure-preview-modal__validation-item--warning',
					text: `⚠️ ${warning}`,
				});
			}
		}
	}

	/**
	 * Render footer with cancel/start buttons
	 */
	private renderFooter(container: HTMLElement): void {
		const footer = container.createDiv('structure-preview-modal__footer');

		const isKorean = this.language === 'ko';

		const actions = footer.createDiv('structure-preview-modal__footer-actions');

		// Cancel button
		const cancelButton = actions.createEl('button', {
			cls: 'structure-preview-modal__footer-action structure-preview-modal__footer-action--secondary',
			text: isKorean ? '취소' : 'Cancel',
		});

		cancelButton.addEventListener('click', () => {
			this.close();
		});

		// Start Writing button
		this.startButton = actions.createEl('button', {
			cls: 'structure-preview-modal__footer-action structure-preview-modal__footer-action--primary',
			text: isKorean ? '글쓰기 시작' : 'Start Writing',
		});

		this.startButton.addEventListener('click', () => {
			this.handleStartWriting();
		});
	}

	// ========================================================================
	// Event Handlers - Section Editing
	// ========================================================================

	/**
	 * Start editing a section
	 */
	private startEditingSection(section: DocumentSection): void {
		// Cancel any current editing
		if (this.editState.sectionId) {
			this.cancelEditingSection();
		}

		// Set edit state
		this.editState = {
			sectionId: section.id,
			originalSection: { ...section },
		};

		// Re-render sections to show edit mode
		this.updateSectionsDisplay();
	}

	/**
	 * Cancel editing a section
	 */
	private cancelEditingSection(): void {
		// Restore original section if it was modified
		if (this.editState.originalSection) {
			const index = this.currentStructure.sections.findIndex(
				(s) => s.id === this.editState.sectionId
			);

			if (index !== -1) {
				this.currentStructure.sections[index] = this.editState.originalSection;
			}
		}

		// Clear edit state
		this.editState = {
			sectionId: null,
			originalSection: null,
		};

		// Re-render sections
		this.updateSectionsDisplay();
	}

	/**
	 * Save edited section
	 */
	private saveEditedSection(sectionId: string): void {
		const isKorean = this.language === 'ko';

		// Find section
		const section = this.currentStructure.sections.find((s) => s.id === sectionId);
		if (!section) return;

		// Read values from inputs
		const titleInput = document.getElementById(`edit-title-${sectionId}`) as HTMLInputElement;
		const purposeInput = document.getElementById(`edit-purpose-${sectionId}`) as HTMLTextAreaElement;
		const promptInput = document.getElementById(`edit-prompt-${sectionId}`) as HTMLTextAreaElement;
		const wordsInput = document.getElementById(`edit-words-${sectionId}`) as HTMLInputElement;
		const minutesInput = document.getElementById(`edit-minutes-${sectionId}`) as HTMLInputElement;
		const requiredInput = document.getElementById(`edit-required-${sectionId}`) as HTMLInputElement;

		// Validate inputs
		const title = titleInput?.value.trim();
		const purpose = purposeInput?.value.trim();
		const prompt = promptInput?.value.trim();
		const words = parseInt(wordsInput?.value || '0');
		const minutes = parseInt(minutesInput?.value || '0');

		if (!title || !purpose || !prompt) {
			new Notice(isKorean ? '모든 필드를 입력해주세요' : 'Please fill all fields');
			return;
		}

		if (words < 50 || words > 2000) {
			new Notice(isKorean ? '단어 수는 50-2000 사이여야 합니다' : 'Words must be between 50-2000');
			return;
		}

		if (minutes < 1 || minutes > 30) {
			new Notice(isKorean ? '시간은 1-30분 사이여야 합니다' : 'Time must be between 1-30 minutes');
			return;
		}

		// Update section
		section.title = title;
		section.purpose = purpose;
		section.writingPrompt = prompt;
		section.estimatedWords = words;
		section.estimatedMinutes = minutes;
		section.required = requiredInput?.checked || false;

		// Clear edit state
		this.editState = {
			sectionId: null,
			originalSection: null,
		};

		// Update totals
		this.recalculateTotals();

		// Re-render
		this.updateSectionsDisplay();
		this.renderOverview(
			this.modalEl.querySelector('.structure-preview-modal__overview')?.parentElement || this.contentEl
		);

		// Re-validate
		this.validateSaligoCompliance();

		new Notice(isKorean ? '섹션이 저장되었습니다' : 'Section saved');
	}

	// ========================================================================
	// Event Handlers - Drag and Drop
	// ========================================================================

	/**
	 * Handle drag start
	 */
	private handleDragStart(event: DragEvent, sectionId: string): void {
		this.draggedSectionId = sectionId;

		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', sectionId);
		}

		// Add dragging class
		const card = event.currentTarget as HTMLElement;
		card.addClass('structure-preview-modal__section-card--dragging');
	}

	/**
	 * Handle drag over
	 */
	private handleDragOver(event: DragEvent): void {
		event.preventDefault();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		// Add drop target indicator
		const card = event.currentTarget as HTMLElement;
		card.addClass('structure-preview-modal__section-card--drop-target');
	}

	/**
	 * Handle drop
	 */
	private handleDrop(event: DragEvent, targetSectionId: string): void {
		event.preventDefault();

		// Remove drop target indicator
		const card = event.currentTarget as HTMLElement;
		card.removeClass('structure-preview-modal__section-card--drop-target');

		if (!this.draggedSectionId || this.draggedSectionId === targetSectionId) {
			return;
		}

		// Reorder sections
		this.reorderSections(this.draggedSectionId, targetSectionId);
	}

	/**
	 * Handle drag end
	 */
	private handleDragEnd(): void {
		// Remove all drag-related classes
		const cards = this.structureContainer?.querySelectorAll('.structure-preview-modal__section-card');
		cards?.forEach((card) => {
			card.removeClass('structure-preview-modal__section-card--dragging');
			card.removeClass('structure-preview-modal__section-card--drop-target');
		});

		this.draggedSectionId = null;
	}

	/**
	 * Reorder sections (move dragged section to target position)
	 */
	private reorderSections(draggedId: string, targetId: string): void {
		const sections = this.currentStructure.sections;

		const draggedIndex = sections.findIndex((s) => s.id === draggedId);
		const targetIndex = sections.findIndex((s) => s.id === targetId);

		if (draggedIndex === -1 || targetIndex === -1) return;

		// Remove dragged section
		const [draggedSection] = sections.splice(draggedIndex, 1);

		// Insert at target position
		sections.splice(targetIndex, 0, draggedSection);

		// Update order numbers
		sections.forEach((section, index) => {
			section.order = index + 1;
		});

		// Re-render
		this.updateSectionsDisplay();

		const isKorean = this.language === 'ko';
		new Notice(isKorean ? '섹션 순서가 변경되었습니다' : 'Section order updated');
	}

	// ========================================================================
	// Event Handlers - Add/Delete Sections
	// ========================================================================

	/**
	 * Add new section at end
	 */
	private addNewSection(): void {
		const isKorean = this.language === 'ko';

		const newSection: DocumentSection = {
			id: `section-${Date.now()}`,
			title: isKorean ? '새 섹션' : 'New Section',
			purpose: isKorean ? '섹션의 목적을 입력하세요' : 'Enter section purpose',
			estimatedWords: 200,
			estimatedMinutes: 5,
			writingPrompt: isKorean
				? '구체적인 작성 프롬프트를 입력하세요'
				: 'Enter specific writing prompt',
			order: this.currentStructure.sections.length + 1,
			required: false,
			status: 'not-started',
		};

		this.currentStructure.sections.push(newSection);

		// Update totals
		this.recalculateTotals();

		// Re-render
		this.updateSectionsDisplay();
		this.renderOverview(
			this.modalEl.querySelector('.structure-preview-modal__overview')?.parentElement || this.contentEl
		);

		// Re-validate
		this.validateSaligoCompliance();

		// Start editing the new section
		this.startEditingSection(newSection);

		new Notice(isKorean ? '새 섹션이 추가되었습니다' : 'New section added');
	}

	/**
	 * Delete section
	 */
	private deleteSection(sectionId: string): void {
		const isKorean = this.language === 'ko';

		// Confirm deletion
		const section = this.currentStructure.sections.find((s) => s.id === sectionId);
		if (!section) return;

		const confirmMessage = isKorean
			? `"${section.title}" 섹션을 삭제하시겠습니까?`
			: `Delete section "${section.title}"?`;

		// Simple confirmation (Obsidian doesn't have built-in confirm dialog)
		// In production, use a custom modal
		if (!confirm(confirmMessage)) {
			return;
		}

		// Remove section
		this.currentStructure.sections = this.currentStructure.sections.filter(
			(s) => s.id !== sectionId
		);

		// Update order numbers
		this.currentStructure.sections.forEach((s, index) => {
			s.order = index + 1;
		});

		// Update totals
		this.recalculateTotals();

		// Re-render
		this.updateSectionsDisplay();
		this.renderOverview(
			this.modalEl.querySelector('.structure-preview-modal__overview')?.parentElement || this.contentEl
		);

		// Re-validate
		this.validateSaligoCompliance();

		new Notice(isKorean ? '섹션이 삭제되었습니다' : 'Section deleted');
	}

	/**
	 * Reset to original AI-generated structure
	 */
	private resetToOriginalStructure(): void {
		const isKorean = this.language === 'ko';

		const confirmMessage = isKorean
			? '모든 변경 사항을 취소하고 AI 제안으로 초기화하시겠습니까?'
			: 'Reset all changes and restore AI-generated structure?';

		if (!confirm(confirmMessage)) {
			return;
		}

		// Clone original structure
		this.currentStructure = this.cloneStructure(this.originalStructure);

		// Clear edit state
		this.editState = {
			sectionId: null,
			originalSection: null,
		};

		// Re-render
		this.updateSectionsDisplay();
		this.renderOverview(
			this.modalEl.querySelector('.structure-preview-modal__overview')?.parentElement || this.contentEl
		);

		// Re-validate
		this.validateSaligoCompliance();

		new Notice(isKorean ? 'AI 제안으로 초기화되었습니다' : 'Reset to AI suggestion');
	}

	// ========================================================================
	// Document Creation
	// ========================================================================

	/**
	 * Create document file with outcome metadata
	 */
	private async createDocumentFile(): Promise<TFile> {
		const { outcome } = this.options;
		const { title } = this.currentStructure;

		// Generate filename
		const timestamp = new Date().toISOString().split('T')[0];
		const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣\s-]/g, '').trim();
		const filename = `${sanitizedTitle}-${timestamp}.md`;
		const filepath = normalizePath(filename);

		// Build document content with frontmatter
		let content = '---\n';
		content += 'mode: outcome-driven\n';
		content += `created: ${new Date().toISOString()}\n`;
		content += `description: ${outcome.description}\n`;
		if (outcome.audience) {
			content += `audience: ${outcome.audience}\n`;
		}
		if (outcome.topics && outcome.topics.length > 0) {
			content += 'topics:\n';
			outcome.topics.forEach(topic => {
				content += `  - ${topic}\n`;
			});
		}
		content += `lengthPreference: ${outcome.lengthPreference}\n`;
		content += '---\n\n';
		content += `# ${this.currentStructure.title}\n\n`;
		content += `> ${outcome.description}\n\n`;

		// Add section placeholders
		this.currentStructure.sections.forEach(section => {
			content += `## ${section.title}\n\n`;
			content += `*[Write ${section.estimatedWords} words (~${section.estimatedMinutes} min)]*\n\n`;
		});

		// Create file
		return await this.app.vault.create(filepath, content);
	}

	// ========================================================================
	// Event Handlers - Start Writing
	// ========================================================================

	/**
	 * Handle Start Writing button click
	 */
	private async handleStartWriting(): Promise<void> {
		if (this.isCreatingDocument) return;

		const isKorean = this.language === 'ko';

		try {
			// Validate structure
			if (this.currentStructure.sections.length === 0) {
				new Notice(
					isKorean
						? '최소 1개의 섹션이 필요합니다'
						: 'At least one section is required'
				);
				return;
			}

			// Set loading state
			this.isCreatingDocument = true;
			this.updateStartButtonState();

			// Create document file with metadata
			const file = await this.createDocumentFile();

			// Call callback with created file
			await this.options.onStartWriting(file);

			// Close modal on success
			this.close();
		} catch (error) {
			console.error('Failed to start writing:', error);

			new Notice(
				`${isKorean ? '문서 생성 실패' : 'Failed to create document'}: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);

			// Reset loading state
			this.isCreatingDocument = false;
			this.updateStartButtonState();
		}
	}

	// ========================================================================
	// Helper Methods
	// ========================================================================

	/**
	 * Calculate structure statistics
	 */
	private calculateStats(): {
		sectionCount: number;
		totalWords: number;
		totalMinutes: number;
	} {
		return {
			sectionCount: this.currentStructure.sections.length,
			totalWords: this.currentStructure.totalEstimatedWords,
			totalMinutes: this.currentStructure.totalEstimatedMinutes,
		};
	}

	/**
	 * Calculate section percentage of total effort
	 */
	private calculateSectionPercentage(section: DocumentSection): number {
		const totalWords = this.currentStructure.totalEstimatedWords;
		if (totalWords === 0) return 0;

		return Math.round((section.estimatedWords / totalWords) * 100);
	}

	/**
	 * Recalculate total estimates
	 */
	private recalculateTotals(): void {
		this.currentStructure.totalEstimatedWords = this.currentStructure.sections.reduce(
			(sum, s) => sum + s.estimatedWords,
			0
		);

		this.currentStructure.totalEstimatedMinutes = this.currentStructure.sections.reduce(
			(sum, s) => sum + s.estimatedMinutes,
			0
		);
	}

	/**
	 * Validate against Saligo principles
	 */
	private validateSaligoCompliance(): SaligoValidationResult {
		const isKorean = this.language === 'ko';
		const warnings: string[] = [];
		const passes: string[] = [];

		// Check 1: Low-energy prompts (specific, actionable)
		const vaguePhrases = ['write about', 'describe', 'explain', 'discuss'];
		const hasLowEnergyPrompts = this.currentStructure.sections.every((section) => {
			const prompt = section.writingPrompt.toLowerCase();
			return !vaguePhrases.some((phrase) => prompt.includes(phrase));
		});

		if (hasLowEnergyPrompts) {
			passes.push(
				isKorean
					? '낮은 에너지 프롬프트 (구체적, 실행 가능)'
					: 'Low-energy prompts (specific, actionable)'
			);
		} else {
			warnings.push(
				isKorean
					? '일부 프롬프트가 모호합니다. 더 구체적으로 만들어주세요.'
					: 'Some prompts are vague. Make them more specific.'
			);
		}

		// Check 2: Small steps (5-20 min per section)
		const hasSmallSteps = this.currentStructure.sections.every(
			(section) => section.estimatedMinutes >= 3 && section.estimatedMinutes <= 20
		);

		if (hasSmallSteps) {
			passes.push(
				isKorean
					? '작은 단계 (섹션당 3-20분)'
					: 'Small steps (3-20 min per section)'
			);
		} else {
			const longSections = this.currentStructure.sections.filter(
				(s) => s.estimatedMinutes > 20
			);
			if (longSections.length > 0) {
				warnings.push(
					isKorean
						? `${longSections.length}개 섹션이 20분을 초과합니다. 더 작은 단위로 나누는 것을 고려하세요.`
						: `${longSections.length} section(s) exceed 20 minutes. Consider breaking into smaller units.`
				);
			}
		}

		// Check 3: Clear purpose (each section has meaningful purpose)
		const hasClearPurpose = this.currentStructure.sections.every(
			(section) => section.purpose.length > 20
		);

		if (hasClearPurpose) {
			passes.push(
				isKorean
					? '명확한 목적 (각 섹션이 왜 중요한지)'
					: 'Clear purpose (why each section matters)'
			);
		} else {
			warnings.push(
				isKorean
					? '일부 섹션의 목적이 불명확합니다.'
					: 'Some sections have unclear purposes.'
			);
		}

		const result: SaligoValidationResult = {
			valid: warnings.length === 0,
			warnings,
			passes,
		};

		// Update display
		this.updateValidationDisplay(result);

		return result;
	}

	/**
	 * Update Start Writing button state
	 */
	private updateStartButtonState(): void {
		if (!this.startButton) return;

		const isKorean = this.language === 'ko';

		this.startButton.disabled = this.isCreatingDocument;

		if (this.isCreatingDocument) {
			this.startButton.setText(
				isKorean ? '문서 생성 중...' : 'Creating Document...'
			);
		} else {
			this.startButton.setText(isKorean ? '글쓰기 시작' : 'Start Writing');
		}
	}

	/**
	 * Deep clone structure to avoid mutations
	 */
	private cloneStructure(structure: DocumentStructure): DocumentStructure {
		return {
			...structure,
			sections: structure.sections.map((section) => ({ ...section })),
		};
	}
}
