/**
 * Template Library Unit Tests
 *
 * Tests the TemplateLibrary service for document template management.
 *
 * Test Coverage:
 * - Built-in templates loading (7 templates with correct structure)
 * - Get all templates (with and without category filter)
 * - Get template by ID (valid and invalid IDs)
 * - Template application (with and without customizations)
 * - Custom template save/load (validation, ID generation)
 * - Custom template deletion (success, built-in protection)
 * - Category filtering (professional, academic, creative)
 * - Template sorting (by category and name)
 * - Error handling (invalid template ID, missing required fields)
 * - Edge cases (empty customizations, null values)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	TemplateLibrary,
	type TemplateCustomization,
} from '../../src/services/outcome/template-library';

/**
 * Test Setup
 */
describe('TemplateLibrary', () => {
	let library: TemplateLibrary;

	beforeEach(() => {
		library = new TemplateLibrary();
	});

	/**
	 * Built-in Templates Loading Tests
	 */
	describe('Built-in Templates', () => {
		it('should load at least 5 built-in templates', () => {
			const templates = library.getTemplates();
			expect(templates.length).toBeGreaterThanOrEqual(5);
		});

		it('should load exactly 7 built-in templates', () => {
			const templates = library.getTemplates();
			expect(templates.length).toBe(7);
		});

		it('should mark all built-in templates as isBuiltIn = true', () => {
			const templates = library.getTemplates();
			templates.forEach((template) => {
				expect(template.isBuiltIn).toBe(true);
			});
		});

		it('should have Project Retrospective template', () => {
			const template = library.getTemplate(
				'template-professional-retrospective'
			);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Project Retrospective');
			expect(template?.category).toBe('professional');
			expect(template?.defaultOutcome.documentType).toBe(
				'retrospective'
			);
		});

		it('should have Technical Specification template', () => {
			const template = library.getTemplate(
				'template-professional-specification'
			);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Technical Specification');
			expect(template?.category).toBe('professional');
			expect(template?.defaultOutcome.documentType).toBe(
				'specification'
			);
		});

		it('should have Product Proposal template', () => {
			const template = library.getTemplate(
				'template-professional-proposal'
			);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Product Proposal');
			expect(template?.category).toBe('professional');
			expect(template?.defaultOutcome.documentType).toBe('proposal');
		});

		it('should have Status Report template', () => {
			const template = library.getTemplate(
				'template-professional-report'
			);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Status Report');
			expect(template?.category).toBe('professional');
			expect(template?.defaultOutcome.documentType).toBe('report');
		});

		it('should have Meeting Summary template', () => {
			const template = library.getTemplate(
				'template-professional-meeting'
			);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Meeting Summary');
			expect(template?.category).toBe('professional');
			expect(template?.defaultOutcome.documentType).toBe(
				'meeting-summary'
			);
		});

		it('should have Literature Review template', () => {
			const template = library.getTemplate(
				'template-academic-literature-review'
			);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Literature Review');
			expect(template?.category).toBe('academic');
			expect(template?.defaultOutcome.documentType).toBe(
				'literature-review'
			);
		});

		it('should have Reflective Essay template', () => {
			const template = library.getTemplate(
				'template-creative-reflection'
			);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Reflective Essay');
			expect(template?.category).toBe('creative');
			expect(template?.defaultOutcome.documentType).toBe('essay');
		});

		it('should have all templates with required fields', () => {
			const templates = library.getTemplates();
			templates.forEach((template) => {
				expect(template.id).toBeTruthy();
				expect(template.name).toBeTruthy();
				expect(template.description).toBeTruthy();
				expect(template.category).toBeTruthy();
				expect(template.defaultOutcome).toBeTruthy();
				expect(template.exampleUseCases).toBeTruthy();
				expect(Array.isArray(template.exampleUseCases)).toBe(true);
			});
		});

		it('should have all templates with valid defaultOutcome', () => {
			const templates = library.getTemplates();
			templates.forEach((template) => {
				const outcome = template.defaultOutcome;
				expect(outcome.description).toBeTruthy();
				expect(outcome.description.length).toBeGreaterThanOrEqual(
					50
				);
				expect(outcome.description.length).toBeLessThanOrEqual(500);
				expect(outcome.audience).toBeTruthy();
				expect(outcome.topics).toBeTruthy();
				expect(Array.isArray(outcome.topics)).toBe(true);
				expect(outcome.topics!.length).toBeGreaterThan(0);
				expect(outcome.lengthPreference).toBeTruthy();
				expect(outcome.documentType).toBeTruthy();
			});
		});

		it('should have retrospective template with 4 topics', () => {
			const template = library.getTemplate(
				'template-professional-retrospective'
			);
			expect(template?.defaultOutcome.topics?.length).toBe(4);
		});

		it('should have specification template with 6 topics', () => {
			const template = library.getTemplate(
				'template-professional-specification'
			);
			expect(template?.defaultOutcome.topics?.length).toBe(6);
		});

		it('should have proposal template with 4 topics', () => {
			const template = library.getTemplate(
				'template-professional-proposal'
			);
			expect(template?.defaultOutcome.topics?.length).toBe(4);
		});

		it('should have report template with 4 topics', () => {
			const template = library.getTemplate(
				'template-professional-report'
			);
			expect(template?.defaultOutcome.topics?.length).toBe(4);
		});

		it('should have meeting template with 3 topics', () => {
			const template = library.getTemplate(
				'template-professional-meeting'
			);
			expect(template?.defaultOutcome.topics?.length).toBe(3);
		});
	});

	/**
	 * Get Templates Tests
	 */
	describe('getTemplates()', () => {
		it('should return all templates when no category specified', () => {
			const templates = library.getTemplates();
			expect(templates.length).toBe(7);
		});

		it('should return only professional templates when category = "professional"', () => {
			const templates = library.getTemplates('professional');
			expect(templates.length).toBe(5);
			templates.forEach((template) => {
				expect(template.category).toBe('professional');
			});
		});

		it('should return only academic templates when category = "academic"', () => {
			const templates = library.getTemplates('academic');
			expect(templates.length).toBe(1);
			templates.forEach((template) => {
				expect(template.category).toBe('academic');
			});
		});

		it('should return only creative templates when category = "creative"', () => {
			const templates = library.getTemplates('creative');
			expect(templates.length).toBe(1);
			templates.forEach((template) => {
				expect(template.category).toBe('creative');
			});
		});

		it('should return empty array for non-existent category', () => {
			const templates = library.getTemplates('non-existent');
			expect(templates.length).toBe(0);
		});

		it('should sort templates by category, then name', () => {
			const templates = library.getTemplates();

			// Check category order: academic, creative, professional
			let previousCategory = '';
			for (const template of templates) {
				if (previousCategory && previousCategory !== template.category) {
					expect(
						template.category.localeCompare(previousCategory)
					).toBeGreaterThan(0);
				}
				previousCategory = template.category;
			}

			// Check name order within each category
			const professionalTemplates =
				library.getTemplates('professional');
			for (let i = 1; i < professionalTemplates.length; i++) {
				expect(
					professionalTemplates[i].name.localeCompare(
						professionalTemplates[i - 1].name
					)
				).toBeGreaterThanOrEqual(0);
			}
		});

		it('should include custom templates in results', () => {
			// Save custom template
			const id = library.saveCustomTemplate({
				name: 'Custom Template',
				description: 'My custom template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1', 'topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const templates = library.getTemplates();
			expect(templates.length).toBe(8);

			const customTemplate = templates.find((t) => t.id === id);
			expect(customTemplate).toBeTruthy();
			expect(customTemplate?.isBuiltIn).toBe(false);
		});
	});

	/**
	 * Get Template by ID Tests
	 */
	describe('getTemplate()', () => {
		it('should return template when valid ID provided', () => {
			const template = library.getTemplate(
				'template-professional-retrospective'
			);
			expect(template).not.toBeNull();
			expect(template?.id).toBe('template-professional-retrospective');
		});

		it('should return null when invalid ID provided', () => {
			const template = library.getTemplate('non-existent-template');
			expect(template).toBeNull();
		});

		it('should return built-in template by ID', () => {
			const template = library.getTemplate(
				'template-professional-proposal'
			);
			expect(template).not.toBeNull();
			expect(template?.isBuiltIn).toBe(true);
		});

		it('should return custom template by ID', () => {
			// Save custom template
			const id = library.saveCustomTemplate({
				name: 'Custom Template',
				description: 'My custom template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1', 'topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const template = library.getTemplate(id);
			expect(template).not.toBeNull();
			expect(template?.id).toBe(id);
			expect(template?.isBuiltIn).toBe(false);
		});
	});

	/**
	 * Apply Template Tests
	 */
	describe('applyTemplate()', () => {
		it('should return default outcome when no customizations provided', () => {
			const outcome = library.applyTemplate(
				'template-professional-retrospective'
			);

			const template = library.getTemplate(
				'template-professional-retrospective'
			);
			expect(outcome).toEqual(template?.defaultOutcome);
		});

		it('should override description when provided', () => {
			const customDescription =
				'Q4 Engineering Retrospective for team and leadership with custom description';
			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				{
					description: customDescription,
				}
			);

			expect(outcome.description).toBe(customDescription);
		});

		it('should override audience when provided', () => {
			const customAudience = 'Engineering team and VP';
			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				{
					audience: customAudience,
				}
			);

			expect(outcome.audience).toBe(customAudience);
		});

		it('should override topics when provided', () => {
			const customTopics = ['wins', 'challenges', 'actions'];
			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				{
					topics: customTopics,
				}
			);

			expect(outcome.topics).toEqual(customTopics);
		});

		it('should override lengthPreference when provided', () => {
			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				{
					lengthPreference: 'long',
				}
			);

			expect(outcome.lengthPreference).toBe('long');
		});

		it('should override documentType when provided', () => {
			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				{
					documentType: 'custom-type',
				}
			);

			expect(outcome.documentType).toBe('custom-type');
		});

		it('should merge multiple customizations', () => {
			const customizations: TemplateCustomization = {
				description:
					'Q4 Engineering Retrospective with custom description and details',
				audience: 'Engineering team and VP',
				topics: ['wins', 'challenges', 'actions'],
				lengthPreference: 'long',
				documentType: 'custom-retrospective',
			};

			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				customizations
			);

			expect(outcome.description).toBe(customizations.description);
			expect(outcome.audience).toBe(customizations.audience);
			expect(outcome.topics).toEqual(customizations.topics);
			expect(outcome.lengthPreference).toBe(
				customizations.lengthPreference
			);
			expect(outcome.documentType).toBe(customizations.documentType);
		});

		it('should preserve fields not in customizations', () => {
			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				{
					description:
						'Custom description with enough characters to meet validation requirements',
				}
			);

			// Other fields should remain from template
			const template = library.getTemplate(
				'template-professional-retrospective'
			);
			expect(outcome.audience).toBe(template?.defaultOutcome.audience);
			expect(outcome.topics).toEqual(template?.defaultOutcome.topics);
			expect(outcome.lengthPreference).toBe(
				template?.defaultOutcome.lengthPreference
			);
		});

		it('should throw error when template ID not found', () => {
			expect(() => {
				library.applyTemplate('non-existent-template');
			}).toThrow('Template not found: non-existent-template');
		});

		it('should work with empty customizations object', () => {
			const outcome = library.applyTemplate(
				'template-professional-retrospective',
				{}
			);

			const template = library.getTemplate(
				'template-professional-retrospective'
			);
			expect(outcome).toEqual(template?.defaultOutcome);
		});

		it('should handle all built-in templates', () => {
			const templateIds = [
				'template-professional-retrospective',
				'template-professional-specification',
				'template-professional-proposal',
				'template-professional-report',
				'template-professional-meeting',
				'template-academic-literature-review',
				'template-creative-reflection',
			];

			templateIds.forEach((id) => {
				const outcome = library.applyTemplate(id);
				expect(outcome).toBeTruthy();
				expect(outcome.description).toBeTruthy();
			});
		});
	});

	/**
	 * Save Custom Template Tests
	 */
	describe('saveCustomTemplate()', () => {
		it('should save custom template and return ID', () => {
			const id = library.saveCustomTemplate({
				name: 'Custom Template',
				description: 'My custom template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1', 'topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			expect(id).toBeTruthy();
			expect(id.startsWith('template-custom-')).toBe(true);
		});

		it('should save custom template with custom ID', () => {
			const customId = 'my-custom-template-id';
			const id = library.saveCustomTemplate({
				id: customId,
				name: 'Custom Template',
				description: 'My custom template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1', 'topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			expect(id).toBe(customId);
		});

		it('should mark custom template as isBuiltIn = false', () => {
			const id = library.saveCustomTemplate({
				name: 'Custom Template',
				description: 'My custom template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1', 'topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const template = library.getTemplate(id);
			expect(template?.isBuiltIn).toBe(false);
		});

		it('should allow retrieving saved custom template', () => {
			const id = library.saveCustomTemplate({
				name: 'Custom Template',
				description: 'My custom template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1', 'topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const template = library.getTemplate(id);
			expect(template).not.toBeNull();
			expect(template?.name).toBe('Custom Template');
			expect(template?.description).toBe('My custom template');
			expect(template?.category).toBe('professional');
		});

		it('should throw error when name missing', () => {
			expect(() => {
				library.saveCustomTemplate({
					name: '',
					description: 'My custom template',
					category: 'professional',
					defaultOutcome: {
						description:
							'Custom template for testing purposes with enough characters',
						audience: 'Test audience',
						topics: ['topic1'],
						lengthPreference: 'medium',
						documentType: 'custom',
					},
					exampleUseCases: ['Test case'],
				});
			}).toThrow('Template must have name, description, and category');
		});

		it('should throw error when description missing', () => {
			expect(() => {
				library.saveCustomTemplate({
					name: 'Custom Template',
					description: '',
					category: 'professional',
					defaultOutcome: {
						description:
							'Custom template for testing purposes with enough characters',
						audience: 'Test audience',
						topics: ['topic1'],
						lengthPreference: 'medium',
						documentType: 'custom',
					},
					exampleUseCases: ['Test case'],
				});
			}).toThrow('Template must have name, description, and category');
		});

		it('should throw error when category missing', () => {
			expect(() => {
				library.saveCustomTemplate({
					name: 'Custom Template',
					description: 'My custom template',
					category: '' as any,
					defaultOutcome: {
						description:
							'Custom template for testing purposes with enough characters',
						audience: 'Test audience',
						topics: ['topic1'],
						lengthPreference: 'medium',
						documentType: 'custom',
					},
					exampleUseCases: ['Test case'],
				});
			}).toThrow('Template must have name, description, and category');
		});

		it('should throw error when defaultOutcome missing', () => {
			expect(() => {
				library.saveCustomTemplate({
					name: 'Custom Template',
					description: 'My custom template',
					category: 'professional',
					defaultOutcome: null as any,
					exampleUseCases: ['Test case'],
				});
			}).toThrow('Template must have defaultOutcome');
		});

		it('should generate unique IDs for multiple templates', () => {
			const id1 = library.saveCustomTemplate({
				name: 'Template 1',
				description: 'First template',
				category: 'professional',
				defaultOutcome: {
					description:
						'First template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const id2 = library.saveCustomTemplate({
				name: 'Template 2',
				description: 'Second template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Second template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			expect(id1).not.toBe(id2);
		});
	});

	/**
	 * Delete Custom Template Tests
	 */
	describe('deleteCustomTemplate()', () => {
		it('should delete custom template and return true', () => {
			const id = library.saveCustomTemplate({
				name: 'Custom Template',
				description: 'My custom template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1', 'topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const deleted = library.deleteCustomTemplate(id);
			expect(deleted).toBe(true);

			// Verify template removed
			const template = library.getTemplate(id);
			expect(template).toBeNull();
		});

		it('should return false when template not found', () => {
			const deleted = library.deleteCustomTemplate(
				'non-existent-template'
			);
			expect(deleted).toBe(false);
		});

		it('should return false when trying to delete built-in template', () => {
			const deleted = library.deleteCustomTemplate(
				'template-professional-retrospective'
			);
			expect(deleted).toBe(false);

			// Verify built-in template still exists
			const template = library.getTemplate(
				'template-professional-retrospective'
			);
			expect(template).not.toBeNull();
		});

		it('should not affect other templates when deleting custom template', () => {
			const id1 = library.saveCustomTemplate({
				name: 'Template 1',
				description: 'First template',
				category: 'professional',
				defaultOutcome: {
					description:
						'First template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic1'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const id2 = library.saveCustomTemplate({
				name: 'Template 2',
				description: 'Second template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Second template for testing purposes with enough characters to pass validation',
					audience: 'Test audience',
					topics: ['topic2'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			// Delete first template
			library.deleteCustomTemplate(id1);

			// Verify second template still exists
			const template2 = library.getTemplate(id2);
			expect(template2).not.toBeNull();

			// Verify all built-in templates still exist
			const allTemplates = library.getTemplates();
			expect(allTemplates.length).toBe(8); // 7 built-in + 1 custom
		});
	});

	/**
	 * Category Filtering Tests
	 */
	describe('Category Filtering', () => {
		it('should have professional category templates', () => {
			const templates = library.getTemplates('professional');
			expect(templates.length).toBeGreaterThan(0);
		});

		it('should have academic category templates', () => {
			const templates = library.getTemplates('academic');
			expect(templates.length).toBeGreaterThan(0);
		});

		it('should have creative category templates', () => {
			const templates = library.getTemplates('creative');
			expect(templates.length).toBeGreaterThan(0);
		});

		it('should support filtering custom templates by category', () => {
			library.saveCustomTemplate({
				name: 'Custom Professional',
				description: 'Custom professional template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Custom professional template for testing purposes with enough characters',
					audience: 'Test audience',
					topics: ['topic1'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			library.saveCustomTemplate({
				name: 'Custom Academic',
				description: 'Custom academic template',
				category: 'academic',
				defaultOutcome: {
					description:
						'Custom academic template for testing purposes with enough characters',
					audience: 'Test audience',
					topics: ['topic1'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test case'],
			});

			const professionalTemplates =
				library.getTemplates('professional');
			const academicTemplates = library.getTemplates('academic');

			expect(professionalTemplates.length).toBe(6); // 5 built-in + 1 custom
			expect(academicTemplates.length).toBe(2); // 1 built-in + 1 custom
		});
	});

	/**
	 * Integration Tests
	 */
	describe('Integration Scenarios', () => {
		it('should support complete template workflow: save, apply, delete', () => {
			// Save custom template
			const id = library.saveCustomTemplate({
				name: 'Team Update',
				description: 'Weekly team update template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Weekly team update covering progress, blockers, and next steps for the team',
					audience: 'Team members',
					topics: ['progress', 'blockers', 'next steps'],
					lengthPreference: 'short',
					documentType: 'update',
				},
				exampleUseCases: ['Weekly Update', 'Sprint Summary'],
			});

			// Apply template with customizations
			const outcome = library.applyTemplate(id, {
				description:
					'Engineering Team Weekly Update for week of November 8th with progress and blockers',
				audience: 'Engineering team and manager',
			});

			expect(outcome.description).toBe(
				'Engineering Team Weekly Update for week of November 8th with progress and blockers'
			);
			expect(outcome.audience).toBe('Engineering team and manager');
			expect(outcome.topics).toEqual([
				'progress',
				'blockers',
				'next steps',
			]);

			// Delete template
			const deleted = library.deleteCustomTemplate(id);
			expect(deleted).toBe(true);

			// Verify template removed
			const template = library.getTemplate(id);
			expect(template).toBeNull();
		});

		it('should handle multiple custom templates with different categories', () => {
			// Create templates in different categories
			library.saveCustomTemplate({
				name: 'Professional Custom',
				description: 'Professional template',
				category: 'professional',
				defaultOutcome: {
					description:
						'Professional template for testing purposes with enough characters to pass',
					audience: 'Test',
					topics: ['topic1'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test'],
			});

			library.saveCustomTemplate({
				name: 'Academic Custom',
				description: 'Academic template',
				category: 'academic',
				defaultOutcome: {
					description:
						'Academic template for testing purposes with enough characters to pass',
					audience: 'Test',
					topics: ['topic1'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test'],
			});

			library.saveCustomTemplate({
				name: 'Creative Custom',
				description: 'Creative template',
				category: 'creative',
				defaultOutcome: {
					description:
						'Creative template for testing purposes with enough characters to pass',
					audience: 'Test',
					topics: ['topic1'],
					lengthPreference: 'medium',
					documentType: 'custom',
				},
				exampleUseCases: ['Test'],
			});

			// Verify all categories increased
			expect(library.getTemplates('professional').length).toBe(6);
			expect(library.getTemplates('academic').length).toBe(2);
			expect(library.getTemplates('creative').length).toBe(2);

			// Verify total count
			expect(library.getTemplates().length).toBe(10);
		});
	});
});
