/**
 * 🎯 Codex7 Constants
 *
 * Application-wide constants and configuration values
 */
/**
 * 📚 Default values for documentation processing
 */
export declare const DEFAULTS: {
    /** Maximum number of documents to return in a single search */
    readonly MAX_SEARCH_RESULTS: 100;
    /** Default number of search results */
    readonly DEFAULT_SEARCH_LIMIT: 10;
    /** Default token limit for documentation responses */
    readonly DEFAULT_TOKEN_LIMIT: 5000;
    /** Maximum token limit for documentation responses */
    readonly MAX_TOKEN_LIMIT: 50000;
    /** Default embedding dimensions (OpenAI text-embedding-3-small) */
    readonly EMBEDDING_DIMENSIONS: 1536;
    /** Chunk size for document processing (in characters) */
    readonly DEFAULT_CHUNK_SIZE: 2000;
    /** Chunk overlap for context preservation */
    readonly DEFAULT_CHUNK_OVERLAP: 200;
};
/**
 * 🔍 Supported source types for documentation
 */
export declare const SOURCE_TYPES: {
    readonly GITHUB: "github";
    readonly WEB: "web";
    readonly PDF: "pdf";
    readonly MARKDOWN: "markdown";
    readonly API_SPEC: "api_spec";
};
/**
 * 📊 Document status values
 */
export declare const DOCUMENT_STATUS: {
    readonly PENDING: "pending";
    readonly INDEXING: "indexing";
    readonly INDEXED: "indexed";
    readonly FAILED: "failed";
    readonly STALE: "stale";
};
/**
 * 🎨 Supported embedding providers
 */
export declare const EMBEDDING_PROVIDERS: {
    readonly OPENAI: "openai";
    readonly LOCAL: "local";
};
/**
 * 🔒 API response status codes
 */
export declare const API_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
/**
 * ⏱️ Timeout values (in milliseconds)
 */
export declare const TIMEOUTS: {
    /** API request timeout */
    readonly API_REQUEST: 30000;
    /** Database query timeout */
    readonly DATABASE_QUERY: 10000;
    /** Embedding generation timeout */
    readonly EMBEDDING: 60000;
    /** Web scraping timeout */
    readonly WEB_SCRAPE: 30000;
};
/**
 * 🎯 Regex patterns for validation
 */
export declare const PATTERNS: {
    /** Library ID format: /org/project or /org/project/version */
    readonly LIBRARY_ID: RegExp;
    /** GitHub repository URL */
    readonly GITHUB_REPO: RegExp;
    /** Semantic version */
    readonly SEMVER: RegExp;
};
