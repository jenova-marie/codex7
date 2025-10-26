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

// Domain entity classes (with data + methods)
export {
  Library,
  type LibraryMetadata,
  type CreateLibraryInput,
} from './classes/Library';
export {
  Version,
  type VersionMetadata,
  type CreateVersionInput,
} from './classes/Version';
export {
  Document,
  type DocumentMetadata,
  type CreateDocumentInput,
} from './classes/Document';

// Storage adapter interface and types
export type { StorageAdapter, StorageAdapterFactory } from './storage/adapter';
export type {
  StorageConfig,
  StorageStats,
  MigrationInfo,
  IndexingJob,
  IndexingJobStatus,
  TransactionContext,
} from './storage/types';

// Search types
export type {
  SearchOptions,
  SearchResult,
  VectorSearchParams,
  SearchResponse,
} from './types/search';

// Embedding types
export type {
  EmbeddingProvider,
  EmbeddingRequest,
  EmbeddingResponse,
  EmbeddingJob,
} from './types/embedding';

// MCP types (tool parameters and results)
export type {
  ResolveLibraryIdParams,
  ResolveLibraryIdResult,
  GetLibraryDocsParams,
  GetLibraryDocsResult,
  SearchDocumentationParams,
  SearchDocumentationResult,
  GetLibraryVersionsParams,
  GetLibraryVersionsResult,
} from './types/mcp';

// API types
export type {
  ApiError,
  PaginatedResponse,
  HealthCheckResponse,
  ComponentHealth,
  ApiToken,
  RateLimitInfo,
} from './types/api';

// Constants
export { SOURCE_TYPES, DOCUMENT_STATUS } from './constants';

// Scripts (for build pipeline)
export { convertTsFilesToSchemas } from './scripts/ts-to-json';
export { generateIndexFile } from './scripts/generate-index-dts';
