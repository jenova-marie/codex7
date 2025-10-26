/**
 * Codex7 - Shared Types, Models, and Utilities
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
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
};
/**
 * 🔍 Supported source types for documentation
 */
export const SOURCE_TYPES = {
    GITHUB: 'github',
    WEB: 'web',
    PDF: 'pdf',
    MARKDOWN: 'markdown',
    API_SPEC: 'api_spec',
};
/**
 * 📊 Document status values
 */
export const DOCUMENT_STATUS = {
    PENDING: 'pending',
    INDEXING: 'indexing',
    INDEXED: 'indexed',
    FAILED: 'failed',
    STALE: 'stale',
};
/**
 * 🎨 Supported embedding providers
 */
export const EMBEDDING_PROVIDERS = {
    OPENAI: 'openai',
    LOCAL: 'local',
};
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
};
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
};
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
};
//# sourceMappingURL=constants.js.map