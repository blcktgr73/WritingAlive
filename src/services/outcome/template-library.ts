/**
 * Template Library Service
 *
 * Provides built-in and custom document templates for outcome-driven writing.
 * Templates pre-fill outcome definitions with realistic sections and guidance.
 *
 * Architecture:
 * - Single Responsibility: Only manages template storage and application
 * - Template Categories: Professional, academic, creative organization
 * - Built-in Templates: 5+ common document types with realistic structures
 * - Custom Templates: User-defined templates stored in memory (MVP)
 *
 * Design Principles (SOLID):
 * - Single Responsibility: Template management only
 * - Open/Closed: Extensible through template registration
 * - Interface Segregation: Small, focused public API
 * - Dependency Inversion: No external dependencies (pure service)
 *
 * Core Operations:
 * 1. getTemplates() - List all available templates (with optional category filter)
 * 2. getTemplate() - Get specific template by ID
 * 3. applyTemplate() - Convert template to OutcomeDefinition with customizations
 * 4. saveCustomTemplate() - Save user-defined template
 * 5. deleteCustomTemplate() - Remove custom template
 *
 * Template Structure:
 * - id: Unique identifier
 * - name: Display name
 * - description: Purpose and use cases
 * - category: Template category (professional, academic, creative)
 * - defaultOutcome: Pre-filled OutcomeDefinition
 * - exampleUseCases: Array of example scenarios
 *
 * @see OutcomeDefinition for outcome structure
 * @see DocumentStructure for structure generation
 */

import type { OutcomeDefinition } from './types';

/**
 * Document Template
 *
 * Template definition with pre-filled outcome and metadata.
 * Used to quick-start outcome-driven writing for common document types.
 */
export interface DocumentTemplate {
	/**
	 * Unique template identifier
	 * @format "template-{category}-{name}"
	 * @example "template-professional-retrospective"
	 */
	id: string;

	/**
	 * Template display name
	 * @example "Project Retrospective"
	 */
	name: string;

	/**
	 * Template description and purpose
	 * @example "Reflect on project outcomes, wins, and lessons learned"
	 */
	description: string;

	/**
	 * Template category
	 * - professional: Work-related documents (reports, specs, proposals)
	 * - academic: Academic documents (essays, reviews, analyses)
	 * - creative: Creative writing (stories, articles, reflections)
	 */
	category: 'professional' | 'academic' | 'creative';

	/**
	 * Pre-filled outcome definition
	 * Serves as starting point for structure generation
	 */
	defaultOutcome: OutcomeDefinition;

	/**
	 * Example use cases for this template
	 * @example ["Q4 Product Retrospective", "Sprint Review", "Project Post-Mortem"]
	 */
	exampleUseCases: string[];

	/**
	 * Whether this is a built-in template (immutable)
	 * Custom templates can be deleted, built-in cannot
	 */
	isBuiltIn: boolean;
}

/**
 * Template Customization Options
 *
 * Options for customizing template when applying.
 * Allows user to override template defaults while preserving structure.
 */
export interface TemplateCustomization {
	/**
	 * Override description (required)
	 * If not provided, uses template default
	 */
	description?: string;

	/**
	 * Override audience
	 */
	audience?: string;

	/**
	 * Override or extend topics
	 * If provided, replaces template topics entirely
	 */
	topics?: string[];

	/**
	 * Override length preference
	 */
	lengthPreference?: 'short' | 'medium' | 'long';

	/**
	 * Override document type
	 */
	documentType?: string;
}

/**
 * Template Library
 *
 * Service for managing document templates.
 * Provides built-in templates and custom template storage.
 */
export class TemplateLibrary {
	/**
	 * Built-in templates (immutable)
	 * Loaded at initialization
	 */
	private readonly builtInTemplates: Map<string, DocumentTemplate>;

	/**
	 * Custom user templates (mutable)
	 * Stored in memory for MVP (future: persist to storage)
	 */
	private readonly customTemplates: Map<string, DocumentTemplate>;

	/**
	 * Constructor
	 *
	 * Initializes library with built-in templates.
	 */
	constructor() {
		this.builtInTemplates = new Map();
		this.customTemplates = new Map();

		// Load built-in templates
		this.loadBuiltInTemplates();
	}

	/**
	 * Get all templates
	 *
	 * Returns all available templates (built-in + custom).
	 * Optionally filters by category.
	 *
	 * Algorithm:
	 * 1. Combine built-in and custom templates
	 * 2. Filter by category if specified
	 * 3. Sort by category, then name
	 *
	 * @param category - Optional category filter
	 * @returns Array of templates
	 *
	 * @example
	 * const allTemplates = library.getTemplates();
	 * const professionalTemplates = library.getTemplates('professional');
	 */
	getTemplates(category?: string): DocumentTemplate[] {
		// Combine all templates
		const allTemplates = [
			...Array.from(this.builtInTemplates.values()),
			...Array.from(this.customTemplates.values()),
		];

		// Filter by category if specified
		const filtered = category
			? allTemplates.filter((t) => t.category === category)
			: allTemplates;

		// Sort by category, then name
		return filtered.sort((a, b) => {
			if (a.category !== b.category) {
				return a.category.localeCompare(b.category);
			}
			return a.name.localeCompare(b.name);
		});
	}

	/**
	 * Get template by ID
	 *
	 * Returns specific template by ID.
	 * Returns null if template not found.
	 *
	 * @param id - Template ID
	 * @returns Template or null
	 *
	 * @example
	 * const template = library.getTemplate('template-professional-retrospective');
	 */
	getTemplate(id: string): DocumentTemplate | null {
		return (
			this.builtInTemplates.get(id) ||
			this.customTemplates.get(id) ||
			null
		);
	}

	/**
	 * Apply template with customizations
	 *
	 * Converts template to OutcomeDefinition with user customizations.
	 * Merges customizations with template defaults.
	 *
	 * Algorithm:
	 * 1. Retrieve template by ID
	 * 2. Start with template's defaultOutcome
	 * 3. Apply customizations (override fields if provided)
	 * 4. Return merged OutcomeDefinition
	 *
	 * @param templateId - Template ID to apply
	 * @param customizations - User customizations
	 * @returns OutcomeDefinition ready for structure generation
	 * @throws Error if template not found
	 *
	 * @example
	 * const outcome = library.applyTemplate(
	 *   'template-professional-retrospective',
	 *   {
	 *     description: 'Q4 Engineering Retrospective',
	 *     audience: 'Engineering team and VP',
	 *     topics: ['wins', 'challenges', 'learnings', 'actions']
	 *   }
	 * );
	 */
	applyTemplate(
		templateId: string,
		customizations: TemplateCustomization = {}
	): OutcomeDefinition {
		// Get template
		const template = this.getTemplate(templateId);
		if (!template) {
			throw new Error(`Template not found: ${templateId}`);
		}

		// Start with template defaults
		const outcome: OutcomeDefinition = {
			...template.defaultOutcome,
		};

		// Apply customizations (override if provided)
		if (customizations.description !== undefined) {
			outcome.description = customizations.description;
		}

		if (customizations.audience !== undefined) {
			outcome.audience = customizations.audience;
		}

		if (customizations.topics !== undefined) {
			outcome.topics = customizations.topics;
		}

		if (customizations.lengthPreference !== undefined) {
			outcome.lengthPreference = customizations.lengthPreference;
		}

		if (customizations.documentType !== undefined) {
			outcome.documentType = customizations.documentType;
		}

		return outcome;
	}

	/**
	 * Save custom template
	 *
	 * Saves user-defined template to library.
	 * Validates template structure before saving.
	 *
	 * Algorithm:
	 * 1. Validate template (required fields)
	 * 2. Generate unique ID if not provided
	 * 3. Mark as custom template (isBuiltIn = false)
	 * 4. Store in customTemplates map
	 * 5. Return template ID
	 *
	 * @param template - Template to save
	 * @returns Template ID
	 * @throws Error if template invalid
	 *
	 * @example
	 * const id = library.saveCustomTemplate({
	 *   name: 'My Custom Template',
	 *   description: 'Custom template for team updates',
	 *   category: 'professional',
	 *   defaultOutcome: { ... },
	 *   exampleUseCases: ['Weekly Update', 'Monthly Summary']
	 * });
	 */
	saveCustomTemplate(
		template: Omit<DocumentTemplate, 'id' | 'isBuiltIn'> & {
			id?: string;
		}
	): string {
		// Validate required fields
		if (!template.name || !template.description || !template.category) {
			throw new Error(
				'Template must have name, description, and category'
			);
		}

		if (!template.defaultOutcome) {
			throw new Error('Template must have defaultOutcome');
		}

		// Generate ID if not provided
		const id =
			template.id ||
			`template-custom-${Date.now()}-${Math.random().toString(36).substring(7)}`;

		// Create full template
		const fullTemplate: DocumentTemplate = {
			...template,
			id,
			isBuiltIn: false,
		};

		// Store template
		this.customTemplates.set(id, fullTemplate);

		return id;
	}

	/**
	 * Delete custom template
	 *
	 * Removes custom template from library.
	 * Cannot delete built-in templates.
	 *
	 * @param id - Template ID to delete
	 * @returns True if deleted, false if not found or built-in
	 *
	 * @example
	 * const deleted = library.deleteCustomTemplate('template-custom-123');
	 */
	deleteCustomTemplate(id: string): boolean {
		// Cannot delete built-in templates
		if (this.builtInTemplates.has(id)) {
			return false;
		}

		// Delete custom template
		return this.customTemplates.delete(id);
	}

	/**
	 * Load built-in templates
	 *
	 * Initializes library with 5+ built-in templates.
	 * Called during constructor.
	 *
	 * Built-in Templates:
	 * 1. Project Retrospective - 4 sections (Summary, Wins, Challenges, Lessons)
	 * 2. Technical Specification - 6 sections (Overview, Architecture, API, Auth, Errors, Examples)
	 * 3. Product Proposal - 4 sections (Problem, Solution, Approach, Metrics)
	 * 4. Status Report - 4 sections (Summary, Progress, Blockers, Next Steps)
	 * 5. Meeting Summary - 3 sections (Decisions, Actions, Follow-ups)
	 */
	private loadBuiltInTemplates(): void {
		// Template 1: Project Retrospective
		this.builtInTemplates.set('template-professional-retrospective', {
			id: 'template-professional-retrospective',
			name: 'Project Retrospective',
			description:
				'Reflect on project outcomes, celebrate wins, identify challenges, and capture lessons learned for continuous improvement',
			category: 'professional',
			defaultOutcome: {
				description:
					'Project retrospective covering what went well, what could be improved, and key learnings for the team',
				audience: 'Team members and stakeholders',
				topics: [
					'executive summary',
					'wins and achievements',
					'challenges faced',
					'lessons learned',
				],
				lengthPreference: 'medium',
				documentType: 'retrospective',
				estimatedTime: 40,
			},
			exampleUseCases: [
				'Q4 Product Retrospective',
				'Sprint Review for Engineering Team',
				'Project Post-Mortem Analysis',
				'Annual Team Retrospective',
			],
			isBuiltIn: true,
		});

		// Template 2: Technical Specification
		this.builtInTemplates.set('template-professional-specification', {
			id: 'template-professional-specification',
			name: 'Technical Specification',
			description:
				'Comprehensive technical documentation covering architecture, API design, authentication, error handling, and implementation examples',
			category: 'professional',
			defaultOutcome: {
				description:
					'Technical specification for new API service including architecture, endpoints, authentication, and usage examples',
				audience: 'Engineering team and technical stakeholders',
				topics: [
					'overview',
					'architecture',
					'api endpoints',
					'authentication',
					'error handling',
					'examples',
				],
				lengthPreference: 'long',
				documentType: 'specification',
				estimatedTime: 60,
			},
			exampleUseCases: [
				'REST API Technical Spec',
				'Microservice Architecture Design',
				'Database Schema Documentation',
				'Integration Specification',
			],
			isBuiltIn: true,
		});

		// Template 3: Product Proposal
		this.builtInTemplates.set('template-professional-proposal', {
			id: 'template-professional-proposal',
			name: 'Product Proposal',
			description:
				'Structured proposal for new product or feature, covering problem statement, proposed solution, implementation approach, and success metrics',
			category: 'professional',
			defaultOutcome: {
				description:
					'Product proposal for new feature addressing customer pain points with clear solution and success metrics',
				audience: 'Product team, leadership, and stakeholders',
				topics: [
					'problem statement',
					'proposed solution',
					'implementation approach',
					'success metrics',
				],
				lengthPreference: 'medium',
				documentType: 'proposal',
				estimatedTime: 45,
			},
			exampleUseCases: [
				'New Feature Proposal',
				'Product Enhancement Pitch',
				'Strategic Initiative Recommendation',
				'Process Improvement Proposal',
			],
			isBuiltIn: true,
		});

		// Template 4: Status Report
		this.builtInTemplates.set('template-professional-report', {
			id: 'template-professional-report',
			name: 'Status Report',
			description:
				'Concise status update covering progress summary, completed work, current blockers, and next steps for stakeholder communication',
			category: 'professional',
			defaultOutcome: {
				description:
					'Weekly status report summarizing progress, highlighting blockers, and outlining next steps for the team',
				audience: 'Team leads and stakeholders',
				topics: [
					'executive summary',
					'progress this week',
					'blockers and risks',
					'next steps',
				],
				lengthPreference: 'short',
				documentType: 'report',
				estimatedTime: 25,
			},
			exampleUseCases: [
				'Weekly Team Update',
				'Monthly Progress Report',
				'Project Status Summary',
				'Quarterly Business Review',
			],
			isBuiltIn: true,
		});

		// Template 5: Meeting Summary
		this.builtInTemplates.set('template-professional-meeting', {
			id: 'template-professional-meeting',
			name: 'Meeting Summary',
			description:
				'Capture key decisions, action items, and follow-up tasks from meetings to ensure alignment and accountability',
			category: 'professional',
			defaultOutcome: {
				description:
					'Meeting summary documenting decisions made, action items assigned, and follow-up tasks for the team',
				audience: 'Meeting participants and stakeholders',
				topics: ['key decisions', 'action items', 'follow-ups'],
				lengthPreference: 'short',
				documentType: 'meeting-summary',
				estimatedTime: 20,
			},
			exampleUseCases: [
				'Sprint Planning Notes',
				'Architecture Review Summary',
				'Stakeholder Meeting Minutes',
				'One-on-One Follow-ups',
			],
			isBuiltIn: true,
		});

		// Template 6: Literature Review (Academic)
		this.builtInTemplates.set('template-academic-literature-review', {
			id: 'template-academic-literature-review',
			name: 'Literature Review',
			description:
				'Academic literature review synthesizing research findings, identifying gaps, and establishing theoretical foundation',
			category: 'academic',
			defaultOutcome: {
				description:
					'Literature review analyzing recent research on topic, identifying trends, gaps, and implications for further study',
				audience: 'Academic peers and researchers',
				topics: [
					'introduction',
					'theoretical framework',
					'key findings',
					'research gaps',
					'conclusion',
				],
				lengthPreference: 'long',
				documentType: 'literature-review',
				estimatedTime: 75,
			},
			exampleUseCases: [
				'Research Paper Background',
				'Thesis Literature Review',
				'Grant Proposal Foundation',
				'Systematic Review',
			],
			isBuiltIn: true,
		});

		// Template 7: Reflective Essay (Creative)
		this.builtInTemplates.set('template-creative-reflection', {
			id: 'template-creative-reflection',
			name: 'Reflective Essay',
			description:
				'Personal reflection exploring experiences, insights, and growth with narrative structure and thoughtful analysis',
			category: 'creative',
			defaultOutcome: {
				description:
					'Reflective essay examining personal experience, exploring insights gained, and articulating lessons learned',
				audience: 'General readers or personal journal',
				topics: [
					'context and experience',
					'key moments',
					'insights and realizations',
					'impact and growth',
				],
				lengthPreference: 'medium',
				documentType: 'essay',
				estimatedTime: 50,
			},
			exampleUseCases: [
				'Personal Learning Journal',
				'Professional Development Reflection',
				'Life Event Analysis',
				'Creative Writing Exercise',
			],
			isBuiltIn: true,
		});
	}
}
