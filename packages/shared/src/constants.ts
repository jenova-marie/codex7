/**
 * 🎯 Codex7 Constants
 *
 * Application-wide constants and configuration values
 */

/**
 * 📚 Default values for documentation processing
 */
export const DEFAULTS = {
  /** Maximum number of documents to return in a single search */
  MAX_SEARCH_RESULTS: 100,

  /** Default number of search results */
  DEFAULT_SEARCH_LIMIT: 10,

  /** Default token limit for documentation responses */
  DEFAULT_TOKEN_LIMIT: 5000,

  /** Maximum token limit for documentation responses */
  MAX_TOKEN_LIMIT: 50000,

  /** Default embedding dimensions (OpenAI text-embedding-3-small) */
  EMBEDDING_DIMENSIONS: 1536,

  /** Chunk size for document processing (in characters) */
  DEFAULT_CHUNK_SIZE: 2000,

  /** Chunk overlap for context preservation */
  DEFAULT_CHUNK_OVERLAP: 200,
} as const;

/**
 * 🔍 Supported source types for documentation
 */
export const SOURCE_TYPES = {
  GITHUB: 'github',
  WEB: 'web',
  PDF: 'pdf',
  MARKDOWN: 'markdown',
  API_SPEC: 'api_spec',
} as const;

/**
 * 📊 Document status values
 */
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  INDEXING: 'indexing',
  INDEXED: 'indexed',
  FAILED: 'failed',
  STALE: 'stale',
} as const;

/**
 * 🎨 Supported embedding providers
 */
export const EMBEDDING_PROVIDERS = {
  OPENAI: 'openai',
  LOCAL: 'local',
} as const;

/**
 * 🔒 API response status codes
 */
export const API_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * ⏱️ Timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  /** API request timeout */
  API_REQUEST: 30000, // 30 seconds

  /** Database query timeout */
  DATABASE_QUERY: 10000, // 10 seconds

  /** Embedding generation timeout */
  EMBEDDING: 60000, // 60 seconds

  /** Web scraping timeout */
  WEB_SCRAPE: 30000, // 30 seconds
} as const;

/**
 * 🎯 Regex patterns for validation
 */
export const PATTERNS = {
  /** Library ID format: /org/project or /org/project/version */
  LIBRARY_ID: /^\/[\w-]+\/[\w.-]+(?:\/v?[\w.-]+)?$/,

  /** GitHub repository URL */
  GITHUB_REPO: /^https?:\/\/github\.com\/([\w-]+)\/([\w.-]+)/,

  /** Semantic version */
  SEMVER: /^v?(\d+)\.(\d+)\.(\d+)(?:-[\w.]+)?(?:\+[\w.]+)?$/,
} as const;
