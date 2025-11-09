/**
 * Outcome Definition Modal
 *
 * Modal for defining writing outcomes in outcome-driven writing mode.
 * First step in the outcome-driven workflow before structure generation.
 *
 * Design Principles (SOLID):
 * - Single Responsibility: Only handles outcome definition UI and validation
 * - Open/Closed: Extensible through template integration
 * - Dependency Inversion: Accepts OutcomeManager and TemplateLibrary
 * - Interface Segregation: Focused public API (open modal, handle callbacks)
 *
 * User Flow:
 * 1. User opens modal (via ribbon or command)
 * 2. User fills outcome fields OR selects template
 * 3. User clicks "Generate Structure"
 * 4. Modal validates outcome using OutcomeManager
 * 5. On success → triggers onGenerate callback
 * 6. On error → shows inline validation errors
 *
 * Features:
 * - Real-time character counter (50-500 chars)
 * - Template dropdown with auto-populate
 * - Inline validation with helpful suggestions
 * - Length preference radio buttons
 * - Optional audience and topics fields
 * - Accessibility support (ARIA, keyboard nav)
 * - Loading state during generation
 *
 * Architecture:
 * - Composition: Uses OutcomeManager for validation
 * - Event-driven: Uses callback for generation trigger
 * - Form State Management: Tracks field values and validation
 */

import { Modal, App, Setting, Notice } from 'obsidian';
import type { OutcomeDefinition, OutcomeValidationResult } from '../../services/outcome/types';
import type { OutcomeManager } from '../../services/outcome/outcome-manager';
import type { TemplateLibrary } from '../../services/outcome/template-library';

/**
 * Outcome Definition Modal Options
 *
 * Configuration options for modal initialization.
 */
export interface OutcomeDefinitionModalOptions {
	/**
	 * Callback when user clicks "Generate Structure"
	 * Receives validated outcome definition
	 */
	onGenerate: (outcome: OutcomeDefinition) => Promise<void>;

	/**
	 * Initial outcome values (for editing existing outcome)
	 * @optional
	 */
	initialOutcome?: Partial<OutcomeDefinition>;

	/**
	 * Language preference for UI text
	 * @default 'en'
	 */
	language?: 'ko' | 'en';
}

/**
 * Form State
 *
 * Internal state tracking for form fields and validation.
 */
interface FormState {
	description: string;
	audience: string;
	topics: string;
	lengthPreference: 'short' | 'medium' | 'long';
	selectedTemplateId: string | null;
	validation: OutcomeValidationResult | null;
	isGenerating: boolean;
}

/**
 * Outcome Definition Modal
 *
 * Modal for defining writing outcomes with template support and validation.
 */
export class OutcomeDefinitionModal extends Modal {
	private outcomeManager: OutcomeManager;
	private templateLibrary: TemplateLibrary;
	private options: OutcomeDefinitionModalOptions;
	private language: 'ko' | 'en';

	// Form state
	private state: FormState = {
		description: '',
		audience: '',
		topics: '',
		lengthPreference: 'medium',
		selectedTemplateId: null,
		validation: null,
		isGenerating: false,
	};

	// DOM references for dynamic updates
	private descriptionInput: HTMLTextAreaElement | null = null;
	private charCountEl: HTMLElement | null = null;
	private validationEl: HTMLElement | null = null;
	private generateButton: HTMLButtonElement | null = null;

	/**
	 * Constructor
	 *
	 * @param app - Obsidian App instance
	 * @param outcomeManager - Service for outcome validation
	 * @param templateLibrary - Service for template management
	 * @param options - Modal configuration options
	 */
	constructor(
		app: App,
		outcomeManager: OutcomeManager,
		templateLibrary: TemplateLibrary,
		options: OutcomeDefinitionModalOptions
	) {
		super(app);
		this.outcomeManager = outcomeManager;
		this.templateLibrary = templateLibrary;
		this.options = options;
		this.language = options.language || 'en';

		// Initialize form state with initial values if provided
		if (options.initialOutcome) {
			this.state.description = options.initialOutcome.description || '';
			this.state.audience = options.initialOutcome.audience || '';
			this.state.topics = options.initialOutcome.topics?.join(', ') || '';
			this.state.lengthPreference = options.initialOutcome.lengthPreference || 'medium';
		}
	}

	/**
	 * Open modal and render content
	 *
	 * Called automatically when modal.open() is invoked.
	 */
	onOpen(): void {
		const { contentEl } = this;

		// Add modal class for styling
		this.modalEl.addClass('outcome-definition-modal');

		// Render modal content
		this.renderHeader(contentEl);
		this.renderForm(contentEl);
		this.renderFooter(contentEl);

		// Focus on description input
		setTimeout(() => {
			this.descriptionInput?.focus();
		}, 100);
	}

	/**
	 * Close modal and cleanup
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();

		// Clear DOM references
		this.descriptionInput = null;
		this.charCountEl = null;
		this.validationEl = null;
		this.generateButton = null;
	}

	// ========================================================================
	// Rendering Methods
	// ========================================================================

	/**
	 * Render modal header with title
	 */
	private renderHeader(container: HTMLElement): void {
		const header = container.createDiv('outcome-definition-modal__header');

		const isKorean = this.language === 'ko';
		header.createEl('h2', {
			cls: 'outcome-definition-modal__title',
			text: isKorean ? '🎯 글쓰기 목표 정의하기' : '🎯 Define Writing Outcome',
		});
	}

	/**
	 * Render form with all input fields
	 */
	private renderForm(container: HTMLElement): void {
		const form = container.createDiv('outcome-definition-modal__form');

		// Template selection (first, so it can populate other fields)
		this.renderTemplateSelector(form);

		// Description field (required)
		this.renderDescriptionField(form);

		// Audience field (optional)
		this.renderAudienceField(form);

		// Topics field (optional)
		this.renderTopicsField(form);

		// Length preference (radio buttons)
		this.renderLengthPreference(form);

		// Validation feedback area (hidden until validation occurs)
		this.renderValidationFeedback(form);
	}

	/**
	 * Render template selector dropdown
	 */
	private renderTemplateSelector(container: HTMLElement): void {
		const isKorean = this.language === 'ko';

		new Setting(container)
			.setName(isKorean ? '템플릿 사용' : 'Use Template')
			.setDesc(isKorean ? '미리 정의된 템플릿으로 빠르게 시작하기' : 'Quick start with pre-defined template')
			.addDropdown((dropdown) => {
				// Add "No template" option
				dropdown.addOption('', isKorean ? '템플릿 선택...' : 'Select template...');

				// Add all available templates grouped by category
				const templates = this.templateLibrary.getTemplates();

				let currentCategory = '';
				for (const template of templates) {
					// Add category separator (visual grouping)
					if (template.category !== currentCategory) {
						currentCategory = template.category;
						// Dropdown doesn't support separators, but we can prefix names
					}

					// Add template option
					const categoryLabel = this.getCategoryLabel(template.category);
					dropdown.addOption(
						template.id,
						`${categoryLabel}: ${template.name}`
					);
				}

				// Set initial value
				if (this.state.selectedTemplateId) {
					dropdown.setValue(this.state.selectedTemplateId);
				}

				// Handle selection change
				dropdown.onChange((templateId) => {
					this.handleTemplateSelection(templateId);
				});
			});
	}

	/**
	 * Render description textarea with character counter
	 */
	private renderDescriptionField(container: HTMLElement): void {
		const isKorean = this.language === 'ko';

		const setting = new Setting(container)
			.setName(isKorean ? '무엇을 쓰고 싶으신가요?' : 'What do you want to write?')
			.setDesc(
				isKorean
					? '명확하고 구체적인 목표를 작성하세요 (50-500자)'
					: 'Write a clear and specific goal (50-500 characters)'
			);

		// Create custom textarea with character counter
		const textareaContainer = setting.controlEl.createDiv('outcome-definition-modal__textarea-container');

		const textarea = textareaContainer.createEl('textarea', {
			cls: 'outcome-definition-modal__textarea',
			attr: {
				rows: '4',
				placeholder: isKorean
					? '예: "초보자를 위한 REST API 튜토리얼을 작성하고 싶습니다"'
					: 'e.g., "Write a REST API tutorial for beginners"',
				'aria-label': isKorean ? '글쓰기 목표' : 'Writing outcome',
				'aria-required': 'true',
			},
		});

		// Set initial value
		textarea.value = this.state.description;

		// Character counter
		const counterContainer = textareaContainer.createDiv('outcome-definition-modal__char-counter');
		this.charCountEl = counterContainer.createSpan({
			cls: 'outcome-definition-modal__char-count',
			text: this.getCharCountText(this.state.description.length),
		});

		// Examples hint
		const examplesHint = textareaContainer.createDiv('outcome-definition-modal__examples');
		examplesHint.innerHTML = isKorean
			? '💡 <strong>좋은 예:</strong> "Q4 제품 회고록 - 팀과 VP를 위한 성과와 교훈 정리"'
			: '💡 <strong>Good example:</strong> "Q4 Product Retrospective covering wins and lessons for team and VP"';

		// Store reference and add event listener
		this.descriptionInput = textarea;
		textarea.addEventListener('input', () => {
			this.handleDescriptionChange(textarea.value);
		});
	}

	/**
	 * Render audience input field
	 */
	private renderAudienceField(container: HTMLElement): void {
		const isKorean = this.language === 'ko';

		new Setting(container)
			.setName(isKorean ? '누가 읽을 예정인가요?' : 'Who will read this?')
			.setDesc(isKorean ? '대상 독자 (선택사항)' : 'Target audience (optional)')
			.addText((text) => {
				text.setPlaceholder(
					isKorean
						? '예: "팀원과 경영진"'
						: 'e.g., "Team members and leadership"'
				)
					.setValue(this.state.audience)
					.onChange((value) => {
						this.state.audience = value;
					});
			});
	}

	/**
	 * Render topics input field
	 */
	private renderTopicsField(container: HTMLElement): void {
		const isKorean = this.language === 'ko';

		new Setting(container)
			.setName(isKorean ? '다룰 주요 주제는?' : 'What topics to cover?')
			.setDesc(
				isKorean
					? '쉼표로 구분된 주제 목록 (선택사항)'
					: 'Comma-separated list of topics (optional)'
			)
			.addText((text) => {
				text.setPlaceholder(
					isKorean
						? '예: "성과, 도전과제, 교훈, 액션 아이템"'
						: 'e.g., "wins, challenges, lessons, actions"'
				)
					.setValue(this.state.topics)
					.onChange((value) => {
						this.state.topics = value;
					});
			});
	}

	/**
	 * Render length preference radio buttons
	 */
	private renderLengthPreference(container: HTMLElement): void {
		const isKorean = this.language === 'ko';

		const setting = new Setting(container)
			.setName(isKorean ? '문서 길이' : 'Document Length')
			.setDesc(
				isKorean
					? '예상 작성 시간: 짧게(10-20분), 중간(30-45분), 길게(60분+)'
					: 'Estimated time: Short(10-20min), Medium(30-45min), Long(60min+)'
			);

		// Create radio button group
		const radioGroup = setting.controlEl.createDiv('outcome-definition-modal__radio-group');
		radioGroup.setAttribute('role', 'radiogroup');
		radioGroup.setAttribute('aria-label', isKorean ? '문서 길이' : 'Document length');

		const options: Array<{ value: 'short' | 'medium' | 'long'; label: string }> = [
			{ value: 'short', label: isKorean ? '짧게' : 'Short' },
			{ value: 'medium', label: isKorean ? '중간' : 'Medium' },
			{ value: 'long', label: isKorean ? '길게' : 'Long' },
		];

		for (const option of options) {
			const label = radioGroup.createEl('label', {
				cls: 'outcome-definition-modal__radio-label',
			});

			const radio = label.createEl('input', {
				type: 'radio',
				attr: {
					name: 'length-preference',
					value: option.value,
				},
			});

			if (option.value === this.state.lengthPreference) {
				radio.checked = true;
			}

			radio.addEventListener('change', () => {
				if (radio.checked) {
					this.state.lengthPreference = option.value;
				}
			});

			label.createSpan({ text: option.label });
		}
	}

	/**
	 * Render validation feedback area
	 *
	 * Initially hidden, shown when validation errors/warnings occur.
	 */
	private renderValidationFeedback(container: HTMLElement): void {
		this.validationEl = container.createDiv('outcome-definition-modal__validation');
		this.validationEl.style.display = 'none'; // Hidden by default
	}

	/**
	 * Render footer with action buttons
	 */
	private renderFooter(container: HTMLElement): void {
		const footer = container.createDiv('outcome-definition-modal__footer');

		const isKorean = this.language === 'ko';

		// Action buttons
		const actions = footer.createDiv('outcome-definition-modal__actions');

		// Cancel button
		const cancelButton = actions.createEl('button', {
			cls: 'outcome-definition-modal__action outcome-definition-modal__action--secondary',
			text: isKorean ? '취소' : 'Cancel',
			attr: { type: 'button' },
		});

		cancelButton.addEventListener('click', () => {
			this.close();
		});

		// Generate Structure button
		this.generateButton = actions.createEl('button', {
			cls: 'outcome-definition-modal__action outcome-definition-modal__action--primary',
			text: isKorean ? '구조 생성' : 'Generate Structure',
			attr: { type: 'button' },
		});

		// Initially disabled until description is valid
		this.updateGenerateButtonState();

		this.generateButton.addEventListener('click', () => {
			this.handleGenerate();
		});
	}

	// ========================================================================
	// Event Handlers
	// ========================================================================

	/**
	 * Handle template selection change
	 *
	 * Applies template to populate form fields.
	 *
	 * @param templateId - Selected template ID (empty string = no template)
	 */
	private handleTemplateSelection(templateId: string): void {
		if (!templateId) {
			// No template selected, clear state
			this.state.selectedTemplateId = null;
			return;
		}

		try {
			// Apply template
			const outcome = this.templateLibrary.applyTemplate(templateId);

			// Update form state
			this.state.selectedTemplateId = templateId;
			this.state.description = outcome.description;
			this.state.audience = outcome.audience || '';
			this.state.topics = outcome.topics?.join(', ') || '';
			this.state.lengthPreference = outcome.lengthPreference || 'medium';

			// Update UI to reflect new values
			this.refreshFormUI();

			// Re-validate with new outcome
			this.validateCurrentOutcome();
		} catch (error) {
			console.error('Failed to apply template:', error);
			new Notice(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Handle description field change
	 *
	 * Updates character counter and validates in real-time.
	 *
	 * @param value - New description value
	 */
	private handleDescriptionChange(value: string): void {
		this.state.description = value;

		// Update character counter
		this.updateCharCounter(value.length);

		// Validate if description is not empty
		if (value.trim().length > 0) {
			this.validateCurrentOutcome();
		} else {
			// Clear validation if empty
			this.clearValidation();
		}

		// Update generate button state
		this.updateGenerateButtonState();
	}

	/**
	 * Handle Generate Structure button click
	 *
	 * Validates outcome and triggers generation callback.
	 */
	private async handleGenerate(): Promise<void> {
		// Prevent double-clicks
		if (this.state.isGenerating) {
			return;
		}

		// Build outcome definition
		const outcome = this.buildOutcomeDefinition();

		// Validate
		const validation = this.outcomeManager.validateOutcome(outcome);

		if (!validation.valid) {
			// Show validation errors
			this.showValidation(validation);
			return;
		}

		try {
			// Set loading state
			this.state.isGenerating = true;
			this.updateGenerateButtonState();

			// Show loading indicator
			this.showLoadingState();

			// Call generation callback
			await this.options.onGenerate(outcome);

			// Close modal on success
			this.close();
		} catch (error) {
			console.error('Structure generation failed:', error);

			// Show error notice
			new Notice(
				`Failed to generate structure: ${error instanceof Error ? error.message : 'Unknown error'}`
			);

			// Reset loading state
			this.state.isGenerating = false;
			this.updateGenerateButtonState();
			this.hideLoadingState();
		}
	}

	// ========================================================================
	// Helper Methods
	// ========================================================================

	/**
	 * Build OutcomeDefinition from current form state
	 *
	 * @returns OutcomeDefinition object
	 */
	private buildOutcomeDefinition(): OutcomeDefinition {
		const outcome: OutcomeDefinition = {
			description: this.state.description.trim(),
			lengthPreference: this.state.lengthPreference,
		};

		// Add optional fields if provided
		if (this.state.audience.trim()) {
			outcome.audience = this.state.audience.trim();
		}

		if (this.state.topics.trim()) {
			// Split by comma and trim each topic
			outcome.topics = this.state.topics
				.split(',')
				.map((t) => t.trim())
				.filter((t) => t.length > 0);
		}

		return outcome;
	}

	/**
	 * Validate current outcome definition
	 *
	 * Updates validation state and UI.
	 */
	private validateCurrentOutcome(): void {
		const outcome = this.buildOutcomeDefinition();
		const validation = this.outcomeManager.validateOutcome(outcome);

		this.state.validation = validation;
		this.showValidation(validation);
	}

	/**
	 * Clear validation feedback
	 */
	private clearValidation(): void {
		this.state.validation = null;
		if (this.validationEl) {
			this.validationEl.style.display = 'none';
			this.validationEl.empty();
		}
	}

	/**
	 * Show validation feedback (errors, warnings, suggestions)
	 *
	 * @param validation - Validation result to display
	 */
	private showValidation(validation: OutcomeValidationResult): void {
		if (!this.validationEl) return;

		// Clear previous validation
		this.validationEl.empty();

		// Show if there are errors or warnings
		const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0;

		if (!hasIssues) {
			this.validationEl.style.display = 'none';
			return;
		}

		this.validationEl.style.display = 'block';

		// Render errors
		if (validation.errors.length > 0) {
			const errorSection = this.validationEl.createDiv('outcome-definition-modal__validation-section');
			errorSection.createEl('strong', {
				cls: 'outcome-definition-modal__validation-label outcome-definition-modal__validation-label--error',
				text: '❌ Errors:',
			});

			const errorList = errorSection.createEl('ul', {
				cls: 'outcome-definition-modal__validation-list',
			});

			for (const error of validation.errors) {
				errorList.createEl('li', { text: error });
			}
		}

		// Render warnings
		if (validation.warnings.length > 0) {
			const warningSection = this.validationEl.createDiv('outcome-definition-modal__validation-section');
			warningSection.createEl('strong', {
				cls: 'outcome-definition-modal__validation-label outcome-definition-modal__validation-label--warning',
				text: '⚠️ Warnings:',
			});

			const warningList = warningSection.createEl('ul', {
				cls: 'outcome-definition-modal__validation-list',
			});

			for (const warning of validation.warnings) {
				warningList.createEl('li', { text: warning });
			}
		}

		// Render suggestions
		if (validation.suggestions.length > 0) {
			const suggestionSection = this.validationEl.createDiv('outcome-definition-modal__validation-section');
			suggestionSection.createEl('strong', {
				cls: 'outcome-definition-modal__validation-label outcome-definition-modal__validation-label--suggestion',
				text: '💡 Suggestions:',
			});

			const suggestionList = suggestionSection.createEl('ul', {
				cls: 'outcome-definition-modal__validation-list',
			});

			for (const suggestion of validation.suggestions) {
				suggestionList.createEl('li', { text: suggestion });
			}
		}
	}

	/**
	 * Update character counter display
	 *
	 * @param charCount - Current character count
	 */
	private updateCharCounter(charCount: number): void {
		if (!this.charCountEl) return;

		this.charCountEl.setText(this.getCharCountText(charCount));

		// Update color based on validity
		const MIN_LENGTH = 50;
		const MAX_LENGTH = 500;

		this.charCountEl.removeClass('outcome-definition-modal__char-count--error');
		this.charCountEl.removeClass('outcome-definition-modal__char-count--warning');
		this.charCountEl.removeClass('outcome-definition-modal__char-count--valid');

		if (charCount < MIN_LENGTH) {
			this.charCountEl.addClass('outcome-definition-modal__char-count--error');
		} else if (charCount > MAX_LENGTH) {
			this.charCountEl.addClass('outcome-definition-modal__char-count--error');
		} else if (charCount < MIN_LENGTH + 10) {
			this.charCountEl.addClass('outcome-definition-modal__char-count--warning');
		} else {
			this.charCountEl.addClass('outcome-definition-modal__char-count--valid');
		}
	}

	/**
	 * Get character count text with range indicator
	 *
	 * @param charCount - Current character count
	 * @returns Formatted text (e.g., "125 / 50-500 characters")
	 */
	private getCharCountText(charCount: number): string {
		const isKorean = this.language === 'ko';
		return isKorean
			? `${charCount} / 50-500 자`
			: `${charCount} / 50-500 characters`;
	}

	/**
	 * Update Generate button enabled/disabled state
	 *
	 * Button is enabled only when:
	 * - Description is not empty
	 * - Not currently generating
	 */
	private updateGenerateButtonState(): void {
		if (!this.generateButton) return;

		const isKorean = this.language === 'ko';
		const canGenerate = this.state.description.trim().length >= 50 && !this.state.isGenerating;

		this.generateButton.disabled = !canGenerate;

		// Update button text based on state
		if (this.state.isGenerating) {
			this.generateButton.setText(
				isKorean ? '🎯 문서 구조 생성 중...' : '🎯 Generating Structure...'
			);
		} else {
			this.generateButton.setText(
				isKorean ? '구조 생성' : 'Generate Structure'
			);
		}
	}

	/**
	 * Show loading state in modal
	 */
	private showLoadingState(): void {
		const isKorean = this.language === 'ko';

		// Dim the form
		const form = this.modalEl.querySelector('.outcome-definition-modal__form');
		if (form) {
			(form as HTMLElement).style.opacity = '0.5';
			(form as HTMLElement).style.pointerEvents = 'none';
		}

		// Show loading message
		const footer = this.modalEl.querySelector('.outcome-definition-modal__footer');
		if (footer) {
			const loadingMsg = footer.createDiv('outcome-definition-modal__loading');
			loadingMsg.setText(
				isKorean
					? '🎯 AI가 문서 구조를 생성하고 있습니다... (예상 비용: $0.005-0.010)'
					: '🎯 AI is generating document structure... (Est. cost: $0.005-0.010)'
			);
		}
	}

	/**
	 * Hide loading state
	 */
	private hideLoadingState(): void {
		// Restore form opacity
		const form = this.modalEl.querySelector('.outcome-definition-modal__form');
		if (form) {
			(form as HTMLElement).style.opacity = '1';
			(form as HTMLElement).style.pointerEvents = 'auto';
		}

		// Remove loading message
		const loadingMsg = this.modalEl.querySelector('.outcome-definition-modal__loading');
		if (loadingMsg) {
			loadingMsg.remove();
		}
	}

	/**
	 * Refresh form UI with current state values
	 *
	 * Used after template selection to update all fields.
	 */
	private refreshFormUI(): void {
		// Update description textarea
		if (this.descriptionInput) {
			this.descriptionInput.value = this.state.description;
			this.updateCharCounter(this.state.description.length);
		}

		// Re-render form to update all fields
		// Note: This is a simple approach. For production, consider more granular updates.
		const formEl = this.modalEl.querySelector('.outcome-definition-modal__form');
		if (formEl) {
			formEl.empty();
			this.renderForm(formEl as HTMLElement);
		}
	}

	/**
	 * Get localized category label
	 *
	 * @param category - Template category
	 * @returns Localized label
	 */
	private getCategoryLabel(category: string): string {
		const isKorean = this.language === 'ko';

		switch (category) {
			case 'professional':
				return isKorean ? '업무' : 'Professional';
			case 'academic':
				return isKorean ? '학술' : 'Academic';
			case 'creative':
				return isKorean ? '창작' : 'Creative';
			default:
				return category;
		}
	}
}
