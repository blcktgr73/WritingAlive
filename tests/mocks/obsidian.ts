/**
 * Obsidian API Mock for Vitest
 *
 * Provides minimal mock implementations of Obsidian types and classes
 * needed for unit testing.
 */

/**
 * Mock Notice class
 */
export class Notice {
	constructor(public message: string, public duration?: number) {}
}

/**
 * Mock Plugin class
 */
export class Plugin {
	app: any;
	manifest: any;

	async loadData(): Promise<any> {
		return {};
	}

	async saveData(_data: any): Promise<void> {
		// Mock implementation
	}

	addCommand(_command: any): void {
		// Mock implementation
	}

	addSettingTab(_tab: any): void {
		// Mock implementation
	}

	registerEvent(_eventRef: any): void {
		// Mock implementation
	}
}

/**
 * Mock EventRef
 */
export interface EventRef {
	e: any;
}

/**
 * Mock TFile
 */
export interface TFile {
	path: string;
	name: string;
	basename: string;
	extension: string;
	parent: TFolder | null;
	vault: Vault;
	stat: {
		ctime: number;
		mtime: number;
		size: number;
	};
}

/**
 * Mock TFolder
 */
export interface TFolder {
	path: string;
	name: string;
	parent: TFolder | null;
	children: (TFile | TFolder)[];
}

/**
 * Mock Vault
 */
export interface Vault {
	read(file: TFile): Promise<string>;
	modify(file: TFile, data: string): Promise<void>;
	adapter: {
		exists(path: string): Promise<boolean>;
		mkdir(path: string): Promise<void>;
		write(path: string, data: string): Promise<void>;
		read(path: string): Promise<string>;
		remove(path: string): Promise<void>;
	};
}

/**
 * Mock CachedMetadata
 */
export interface CachedMetadata {
	links?: LinkCache[];
	tags?: TagCache[];
	frontmatter?: Record<string, any>;
	headings?: HeadingCache[];
}

/**
 * Mock LinkCache
 */
export interface LinkCache {
	link: string;
	original: string;
	position: {
		start: { line: number; col: number; offset: number };
		end: { line: number; col: number; offset: number };
	};
}

/**
 * Mock TagCache
 */
export interface TagCache {
	tag: string;
	position: {
		start: { line: number; col: number; offset: number };
		end: { line: number; col: number; offset: number };
	};
}

/**
 * Mock HeadingCache
 */
export interface HeadingCache {
	heading: string;
	level: number;
	position: {
		start: { line: number; col: number; offset: number };
		end: { line: number; col: number; offset: number };
	};
}

/**
 * Mock MetadataCache
 */
export interface MetadataCache {
	getFileCache(file: TFile): CachedMetadata | null;
}

/**
 * Mock App
 */
export interface App {
	vault: Vault;
	metadataCache: MetadataCache;
}

/**
 * Parse YAML string to object
 *
 * Uses js-yaml library for proper YAML parsing in tests.
 * Obsidian provides its own parseYaml implementation in production.
 */
export function parseYaml(yaml: string): unknown {
	// Use js-yaml for proper YAML parsing in tests
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const jsYaml = require('js-yaml');
		return jsYaml.load(yaml);
	} catch (error) {
		throw new Error(`Failed to parse YAML: ${error}`);
	}
}

/**
 * Stringify object to YAML
 *
 * Uses js-yaml library for proper YAML stringification in tests.
 * Obsidian provides its own stringifyYaml implementation in production.
 */
export function stringifyYaml(obj: unknown): string {
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const jsYaml = require('js-yaml');
		return jsYaml.dump(obj, {
			indent: 2,
			lineWidth: -1, // Don't wrap lines
			noRefs: true, // Don't use anchors/aliases
			sortKeys: false, // Preserve key order
		});
	} catch (error) {
		throw new Error(`Failed to stringify YAML: ${error}`);
	}
}

/**
 * Export all mocked types
 */
export default {
	Notice,
	Plugin,
	parseYaml,
	stringifyYaml,
};
