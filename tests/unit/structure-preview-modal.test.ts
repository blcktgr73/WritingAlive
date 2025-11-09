/**
 * Structure Preview Modal Tests
 *
 * Comprehensive unit tests for StructurePreviewModal component.
 * Tests all features: rendering, editing, drag-and-drop, validation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OutcomeManager } from '../../src/services/outcome/outcome-manager';
import { SectionManager } from '../../src/services/outcome/section-manager';
import type {
	OutcomeDefinition,
	DocumentStructure,
	DocumentSection,
} from '../../src/services/outcome/types';

// Helper to create mock HTMLElement with needed methods
interface MockHTMLElement extends HTMLElement {
	addClass(className: string): void;
	removeClass(className: string): void;
}

function createMockElement(): MockHTMLElement {
	const el = document.createElement('div') as MockHTMLElement;
	el.addClass = (className: string) => el.classList.add(className);
	el.removeClass = (className: string) => el.classList.remove(className);

	(el as any).createDiv = (className?: string) => {
		const div = createMockElement();
		if (className) div.addClass(className);
		return div;
	};

	(el as any).createEl = (tag: string, options?: any) => {
		const newEl = document.createElement(tag) as MockHTMLElement;
		newEl.addClass = el.addClass.bind(newEl);
		newEl.removeClass = el.removeClass.bind(newEl);
		if (options?.cls) newEl.addClass(options.cls);
		if (options?.text) newEl.textContent = options.text;
		if (options?.attr) {
			Object.entries(options.attr).forEach(([key, value]) => {
				newEl.setAttribute(key, String(value));
			});
		}
		return newEl;
	};

	(el as any).createSpan = (options?: any) => (el as any).createEl('span', options);

	(el as any).empty = () => {
		el.innerHTML = '';
	};

	return el;
}

// Mock Obsidian classes
vi.mock('obsidian', () => ({
	App: class MockApp {},
	Vault: class MockVault {},
	Modal: class MockModal {
		app: any;
		contentEl: MockHTMLElement;
		modalEl: MockHTMLElement;

		constructor(app: any) {
			this.app = app;
			this.contentEl = createMockElement();
			this.modalEl = createMockElement();
		}

		open() {}
		close() {}
		onOpen() {}
		onClose() {}
	},
	Setting: class MockSetting {
		controlEl: HTMLElement;
		constructor(_containerEl: HTMLElement) {
			this.controlEl = document.createElement('div');
		}
		setName() { return this; }
		setDesc() { return this; }
		addText(callback: any) {
			const mockText = {
				setValue: () => mockText,
				setPlaceholder: () => mockText,
				onChange: () => mockText,
				inputEl: document.createElement('input'),
			};
			callback(mockText);
			return this;
		}
		addTextArea(callback: any) {
			const mockTextArea = {
				setValue: () => mockTextArea,
				setPlaceholder: () => mockTextArea,
				onChange: () => mockTextArea,
				inputEl: document.createElement('textarea'),
			};
			callback(mockTextArea);
			return this;
		}
		addToggle(callback: any) {
			const mockToggle = {
				setValue: () => mockToggle,
				toggleEl: document.createElement('input'),
			};
			callback(mockToggle);
			return this;
		}
	},
	Notice: class MockNotice {
		constructor(_message: string) {}
	},
}));

// Import after mocking
import { StructurePreviewModal } from '../../src/ui/modals/structure-preview-modal';

// Type definitions
type App = any;
type Vault = any;

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create mock Obsidian App
 */
function createMockApp(): App {
	return {
		vault: createMockVault(),
	};
}

/**
 * Create mock Vault
 */
function createMockVault(): Vault {
	return {};
}

/**
 * Create test outcome definition
 */
function createTestOutcome(): OutcomeDefinition {
	return {
		description: 'Q4 Product Retrospective for team and VP covering wins and challenges',
		audience: 'Engineering team and leadership',
		topics: ['wins', 'challenges', 'lessons', 'actions'],
		lengthPreference: 'medium',
		documentType: 'retrospective',
	};
}

/**
 * Create test document structure
 */
function createTestStructure(): DocumentStructure {
	const sections: DocumentSection[] = [
		{
			id: 'section-1',
			title: 'Executive Summary',
			purpose: 'High-level outcomes for leadership',
			estimatedWords: 200,
			estimatedMinutes: 5,
			writingPrompt:
				'State the Q4 key achievement in 1-2 sentences. What was the biggest win?',
			order: 1,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-2',
			title: 'What Went Well',
			purpose: 'Celebrate successes and show impact',
			estimatedWords: 400,
			estimatedMinutes: 10,
			writingPrompt:
				'List 3-5 major wins. For each, note the impact in 2-3 sentences.',
			order: 2,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-3',
			title: 'Challenges & Learnings',
			purpose: 'Share obstacles and lessons learned',
			estimatedWords: 400,
			estimatedMinutes: 12,
			writingPrompt:
				'List 2-3 challenges faced. What did we learn from each?',
			order: 3,
			required: true,
			status: 'not-started',
		},
		{
			id: 'section-4',
			title: 'Action Items',
			purpose: 'Clear next steps for Q1',
			estimatedWords: 200,
			estimatedMinutes: 8,
			writingPrompt:
				'List 3-5 specific actions for Q1. Who owns each? When is it due?',
			order: 4,
			required: true,
			status: 'not-started',
		},
	];

	return {
		title: 'Q4 Product Retrospective',
		sections,
		totalEstimatedWords: 1200,
		totalEstimatedMinutes: 35,
		generatedAt: new Date().toISOString(),
		generationCost: 0.008,
	};
}

// ============================================================================
// Test Suite
// ============================================================================

describe('StructurePreviewModal', () => {
	let app: App;
	let vault: Vault;
	let outcomeManager: OutcomeManager;
	let sectionManager: SectionManager;
	let modal: StructurePreviewModal;
	let onStartWriting: (file: any) => Promise<void>;

	beforeEach(() => {
		app = createMockApp();
		vault = createMockVault();
		outcomeManager = new OutcomeManager(vault);
		sectionManager = new SectionManager(vault);
		onStartWriting = vi.fn().mockResolvedValue(undefined);
	});

	// ========================================================================
	// Initialization Tests
	// ========================================================================

	describe('Initialization', () => {
		it('should create modal with valid options', () => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
					language: 'en',
				}
			);

			expect(modal).toBeDefined();
		});

		it('should clone structure to avoid mutations', () => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);

			// Access private field via type assertion for testing
			const currentStructure = (modal as any).currentStructure;
			expect(currentStructure).not.toBe(structure);
			expect(currentStructure.sections).not.toBe(structure.sections);
		});

		it('should default to English language', () => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);

			expect((modal as any).language).toBe('en');
		});

		it('should support Korean language', () => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
					language: 'ko',
				}
			);

			expect((modal as any).language).toBe('ko');
		});
	});

	// ========================================================================
	// Statistics Calculation Tests
	// ========================================================================

	describe('Statistics Calculation', () => {
		beforeEach(() => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);
		});

		it('should calculate correct section count', () => {
			const stats = (modal as any).calculateStats();
			expect(stats.sectionCount).toBe(4);
		});

		it('should calculate correct total words', () => {
			const stats = (modal as any).calculateStats();
			expect(stats.totalWords).toBe(1200);
		});

		it('should calculate correct total minutes', () => {
			const stats = (modal as any).calculateStats();
			expect(stats.totalMinutes).toBe(35);
		});

		it('should recalculate stats after section changes', () => {
			const structure = (modal as any).currentStructure;

			// Add a new section
			structure.sections.push({
				id: 'section-5',
				title: 'New Section',
				purpose: 'Additional content',
				estimatedWords: 300,
				estimatedMinutes: 10,
				writingPrompt: 'Write something',
				order: 5,
				required: false,
				status: 'not-started',
			});

			(modal as any).recalculateTotals();

			const stats = (modal as any).calculateStats();
			expect(stats.sectionCount).toBe(5);
			expect(stats.totalWords).toBe(1500);
			expect(stats.totalMinutes).toBe(45);
		});
	});

	// ========================================================================
	// Progress Bar Calculation Tests
	// ========================================================================

	describe('Progress Bar Calculation', () => {
		beforeEach(() => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);
		});

		it('should calculate correct percentage for first section', () => {
			const structure = (modal as any).currentStructure;
			const section = structure.sections[0]; // 200 words out of 1200

			const percentage = (modal as any).calculateSectionPercentage(section);
			expect(percentage).toBe(17); // 200/1200 * 100 = 16.67 -> 17
		});

		it('should calculate correct percentage for largest section', () => {
			const structure = (modal as any).currentStructure;
			const section = structure.sections[1]; // 400 words out of 1200

			const percentage = (modal as any).calculateSectionPercentage(section);
			expect(percentage).toBe(33); // 400/1200 * 100 = 33.33 -> 33
		});

		it('should handle zero total words', () => {
			const structure = (modal as any).currentStructure;
			structure.totalEstimatedWords = 0;

			const section = structure.sections[0];
			const percentage = (modal as any).calculateSectionPercentage(section);

			expect(percentage).toBe(0);
		});

		it('should round percentages correctly', () => {
			const structure = (modal as any).currentStructure;
			structure.totalEstimatedWords = 1000;
			structure.sections[0].estimatedWords = 333;

			const section = structure.sections[0];
			const percentage = (modal as any).calculateSectionPercentage(section);

			expect(percentage).toBe(33); // 333/1000 * 100 = 33.3 -> 33
		});
	});

	// ========================================================================
	// Section Reordering Tests
	// ========================================================================

	describe('Section Reordering', () => {
		beforeEach(() => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);
		});

		it('should reorder sections correctly (move down)', () => {
			const structure = (modal as any).currentStructure;

			// Move section 1 to position 3
			(modal as any).reorderSections('section-1', 'section-3');

			expect(structure.sections[0].id).toBe('section-2');
			expect(structure.sections[1].id).toBe('section-3');
			expect(structure.sections[2].id).toBe('section-1');
			expect(structure.sections[3].id).toBe('section-4');
		});

		it('should reorder sections correctly (move up)', () => {
			const structure = (modal as any).currentStructure;

			// Move section 3 to position 1
			(modal as any).reorderSections('section-3', 'section-1');

			expect(structure.sections[0].id).toBe('section-3');
			expect(structure.sections[1].id).toBe('section-1');
			expect(structure.sections[2].id).toBe('section-2');
			expect(structure.sections[3].id).toBe('section-4');
		});

		it('should update order numbers after reordering', () => {
			const structure = (modal as any).currentStructure;

			(modal as any).reorderSections('section-1', 'section-3');

			expect(structure.sections[0].order).toBe(1);
			expect(structure.sections[1].order).toBe(2);
			expect(structure.sections[2].order).toBe(3);
			expect(structure.sections[3].order).toBe(4);
		});

		it('should handle invalid section IDs gracefully', () => {
			const structure = (modal as any).currentStructure;
			const originalSections = [...structure.sections];

			(modal as any).reorderSections('invalid-id', 'section-2');

			// Sections should remain unchanged
			expect(structure.sections).toEqual(originalSections);
		});

		it('should handle same section drop gracefully', () => {
			const structure = (modal as any).currentStructure;
			const originalSections = [...structure.sections];

			(modal as any).reorderSections('section-2', 'section-2');

			// Sections should remain unchanged
			expect(structure.sections).toEqual(originalSections);
		});
	});

	// ========================================================================
	// Section Add/Delete Tests
	// ========================================================================

	describe('Section Add/Delete', () => {
		beforeEach(() => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);
		});

		it('should add new section at end', () => {
			const structure = (modal as any).currentStructure;
			const originalLength = structure.sections.length;

			(modal as any).addNewSection();

			expect(structure.sections.length).toBe(originalLength + 1);
		});

		it('should set correct order for new section', () => {
			const structure = (modal as any).currentStructure;

			(modal as any).addNewSection();

			const newSection = structure.sections[structure.sections.length - 1];
			expect(newSection.order).toBe(structure.sections.length);
		});

		it('should set default values for new section', () => {
			const structure = (modal as any).currentStructure;

			(modal as any).addNewSection();

			const newSection = structure.sections[structure.sections.length - 1];
			expect(newSection.title).toBe('New Section');
			expect(newSection.estimatedWords).toBe(200);
			expect(newSection.estimatedMinutes).toBe(5);
			expect(newSection.required).toBe(false);
			expect(newSection.status).toBe('not-started');
		});

		it('should update totals after adding section', () => {
			const structure = (modal as any).currentStructure;
			const originalWords = structure.totalEstimatedWords;
			const originalMinutes = structure.totalEstimatedMinutes;

			(modal as any).addNewSection();

			expect(structure.totalEstimatedWords).toBe(originalWords + 200);
			expect(structure.totalEstimatedMinutes).toBe(originalMinutes + 5);
		});

		it('should delete section correctly', () => {
			// Mock window.confirm
			global.confirm = vi.fn(() => true);

			const structure = (modal as any).currentStructure;
			const originalLength = structure.sections.length;

			(modal as any).deleteSection('section-2');

			expect(structure.sections.length).toBe(originalLength - 1);
			expect(structure.sections.find((s: DocumentSection) => s.id === 'section-2')).toBeUndefined();
		});

		it('should update order numbers after deletion', () => {
			global.confirm = vi.fn(() => true);

			const structure = (modal as any).currentStructure;

			(modal as any).deleteSection('section-2');

			expect(structure.sections[0].order).toBe(1);
			expect(structure.sections[1].order).toBe(2);
			expect(structure.sections[2].order).toBe(3);
		});

		it('should update totals after deletion', () => {
			global.confirm = vi.fn(() => true);

			const structure = (modal as any).currentStructure;
			const deletedSection = structure.sections.find((s: DocumentSection) => s.id === 'section-2');
			const originalWords = structure.totalEstimatedWords;
			const originalMinutes = structure.totalEstimatedMinutes;

			(modal as any).deleteSection('section-2');

			expect(structure.totalEstimatedWords).toBe(originalWords - (deletedSection?.estimatedWords || 0));
			expect(structure.totalEstimatedMinutes).toBe(originalMinutes - (deletedSection?.estimatedMinutes || 0));
		});

		it('should cancel deletion if user declines', () => {
			global.confirm = vi.fn(() => false);

			const structure = (modal as any).currentStructure;
			const originalLength = structure.sections.length;

			(modal as any).deleteSection('section-2');

			expect(structure.sections.length).toBe(originalLength);
		});
	});

	// ========================================================================
	// Reset to Original Tests
	// ========================================================================

	describe('Reset to Original Structure', () => {
		beforeEach(() => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);
		});

		it('should restore original structure after edits', () => {
			global.confirm = vi.fn(() => true);

			const structure = (modal as any).currentStructure;

			// Make some edits
			structure.sections[0].title = 'Modified Title';
			(modal as any).addNewSection();

			// Reset
			(modal as any).resetToOriginalStructure();

			const resetStructure = (modal as any).currentStructure;
			expect(resetStructure.sections.length).toBe(4); // Back to original 4 sections
			expect(resetStructure.sections[0].title).toBe('Executive Summary'); // Original title
		});

		it('should cancel reset if user declines', () => {
			global.confirm = vi.fn(() => false);

			const structure = (modal as any).currentStructure;
			structure.sections[0].title = 'Modified Title';

			(modal as any).resetToOriginalStructure();

			expect(structure.sections[0].title).toBe('Modified Title');
		});
	});

	// ========================================================================
	// Saligo Validation Tests
	// ========================================================================

	describe('Saligo Principles Validation', () => {
		beforeEach(() => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);
		});

		it('should pass validation for well-formed structure', () => {
			const result = (modal as any).validateSaligoCompliance();

			expect(result.valid).toBe(true);
			expect(result.warnings.length).toBe(0);
			expect(result.passes.length).toBeGreaterThan(0);
		});

		it('should detect low-energy prompts', () => {
			const result = (modal as any).validateSaligoCompliance();

			expect(result.passes).toContain('Low-energy prompts (specific, actionable)');
		});

		it('should detect appropriate time estimates', () => {
			const result = (modal as any).validateSaligoCompliance();

			expect(result.passes).toContain('Small steps (3-20 min per section)');
		});

		it('should detect clear purposes', () => {
			const result = (modal as any).validateSaligoCompliance();

			expect(result.passes).toContain('Clear purpose (why each section matters)');
		});

		it('should warn about vague prompts', () => {
			const structure = (modal as any).currentStructure;
			structure.sections[0].writingPrompt = 'Write about the summary';

			const result = (modal as any).validateSaligoCompliance();

			expect(result.valid).toBe(false);
			expect(result.warnings.some((w: string) => w.includes('vague'))).toBe(true);
		});

		it('should warn about long sections (>20 min)', () => {
			const structure = (modal as any).currentStructure;
			structure.sections[0].estimatedMinutes = 25;

			const result = (modal as any).validateSaligoCompliance();

			expect(result.valid).toBe(false);
			expect(result.warnings.some((w: string) => w.includes('exceed'))).toBe(true);
		});

		it('should warn about unclear purposes', () => {
			const structure = (modal as any).currentStructure;
			structure.sections[0].purpose = 'Short';

			const result = (modal as any).validateSaligoCompliance();

			expect(result.valid).toBe(false);
			expect(result.warnings.some((w: string) => w.includes('unclear'))).toBe(true);
		});
	});

	// ========================================================================
	// Start Writing Tests
	// ========================================================================

	describe('Start Writing', () => {
		beforeEach(() => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);
		});

		it('should call onStartWriting with created file', async () => {
			await (modal as any).handleStartWriting();

			// The modal creates a document and passes the TFile to the callback
			expect(onStartWriting).toHaveBeenCalled();
		});

		it('should reject if no sections', async () => {
			const structure = (modal as any).currentStructure;
			structure.sections = [];

			await (modal as any).handleStartWriting();

			expect(onStartWriting).not.toHaveBeenCalled();
		});

		it('should prevent double-clicking', async () => {
			(modal as any).isCreatingDocument = true;

			await (modal as any).handleStartWriting();

			expect(onStartWriting).not.toHaveBeenCalled();
		});

		it('should handle callback errors gracefully', async () => {
			// Create a new mock that rejects
			const failingCallback = vi.fn().mockRejectedValue(new Error('Test error'));

			// Create modal with failing callback
			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome: createTestOutcome(),
					structure: createTestStructure(),
					onStartWriting: failingCallback,
				}
			);

			await (modal as any).handleStartWriting();

			// Should reset loading state
			expect((modal as any).isCreatingDocument).toBe(false);
		});
	});

	// ========================================================================
	// Structure Cloning Tests
	// ========================================================================

	describe('Structure Cloning', () => {
		it('should deep clone structure', () => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);

			const cloned = (modal as any).cloneStructure(structure);

			// Should be different objects
			expect(cloned).not.toBe(structure);
			expect(cloned.sections).not.toBe(structure.sections);

			// But same values
			expect(cloned.title).toBe(structure.title);
			expect(cloned.sections.length).toBe(structure.sections.length);
		});

		it('should not mutate original when editing clone', () => {
			const outcome = createTestOutcome();
			const structure = createTestStructure();

			modal = new StructurePreviewModal(
				app,
				outcomeManager,
				sectionManager,
				null,
				{
					outcome,
					structure,
					onStartWriting,
				}
			);

			const cloned = (modal as any).cloneStructure(structure);
			cloned.sections[0].title = 'Modified';

			expect(structure.sections[0].title).toBe('Executive Summary');
		});
	});
});
