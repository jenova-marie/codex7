/**
 * Types for local project documentation storage
 *
 * Storage structure:
 * ~/.codex7/
 * ├── index.json              # LocalIndex - searchable manifest
 * └── docs/
 *     └── {org}/
 *         └── {project}/
 *             └── docs.md     # Generated documentation in Context7 format
 */

/**
 * A single library entry in the local index
 * Mirrors the remote SearchResult structure for compatibility
 */
export interface LocalLibrary {
  /** Library ID in /org/project format */
  id: string;
  /** Human-readable title */
  title: string;
  /** Short description of the library */
  description: string;
  /** Git branch the docs were generated from */
  branch: string;
  /** ISO timestamp of last generation */
  lastUpdateDate: string;
  /** Always "finalized" for local docs */
  state: "finalized";
  /** Approximate token count of generated docs */
  totalTokens: number;
  /** Number of code snippets extracted */
  totalSnippets: number;
  /** Number of source pages/files processed */
  totalPages: number;
  /** Local trust score (default 10 for local projects) */
  trustScore: number;
  /** Absolute path to the source project */
  sourcePath: string;
  /** Package name from package.json if available */
  packageName?: string;
  /** Version from package.json if available */
  version?: string;
  /** Keywords for search matching */
  keywords: string[];
}

/**
 * The main local index file structure
 */
export interface LocalIndex {
  /** Schema version for future migrations */
  version: 1;
  /** Timestamp of last index update */
  lastUpdated: string;
  /** Map of library ID to library metadata */
  libraries: Record<string, LocalLibrary>;
}

/**
 * Source file types we extract documentation from
 */
export type SourceFileType =
  | "readme"
  | "api"
  | "docs"
  | "examples"
  | "content"
  | "source";

/**
 * A parsed documentation snippet
 */
export interface DocSnippet {
  /** Unique identifier within the library */
  id: string;
  /** Section title/heading */
  title: string;
  /** Source file path relative to project root */
  source: string;
  /** Type of source file */
  sourceType: SourceFileType;
  /** Description text */
  description: string;
  /** Code blocks with language tags */
  codeBlocks: Array<{
    language: string;
    code: string;
  }>;
  /** Approximate token count */
  tokens: number;
}

/**
 * Configuration for knowledge generation
 */
export interface GenerateConfig {
  /** Path to the project to index */
  projectPath: string;
  /** Library ID override (default: inferred from package.json or path) */
  libraryId?: string;
  /** Custom title (default: from package.json name) */
  title?: string;
  /** Custom description (default: from package.json description) */
  description?: string;
  /** Additional keywords for search */
  keywords?: string[];
  /** Glob patterns for additional files to include */
  includePatterns?: string[];
  /** Glob patterns for files to exclude */
  excludePatterns?: string[];
}

/**
 * Result of knowledge generation
 */
export interface GenerateResult {
  /** The generated library entry */
  library: LocalLibrary;
  /** Path to the generated docs.md file */
  docsPath: string;
  /** Number of snippets extracted */
  snippetCount: number;
  /** Files that were processed */
  processedFiles: string[];
  /** Any warnings during generation */
  warnings: string[];
}

/**
 * Default storage paths
 */
export const LOCAL_STORAGE = {
  /** Base directory for local codex7 storage */
  baseDir: () => {
    const home = process.env.HOME || process.env.USERPROFILE || "~";
    return `${home}/.codex7`;
  },
  /** Path to the index file */
  indexPath: () => `${LOCAL_STORAGE.baseDir()}/index.json`,
  /** Path to docs directory */
  docsDir: () => `${LOCAL_STORAGE.baseDir()}/docs`,
  /** Path to a specific library's docs */
  libraryDocsPath: (libraryId: string) => {
    // Remove leading slash if present
    const cleanId = libraryId.startsWith("/") ? libraryId.slice(1) : libraryId;
    return `${LOCAL_STORAGE.docsDir()}/${cleanId}/docs.md`;
  },
};
