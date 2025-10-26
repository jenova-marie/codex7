import { type Result } from '@jenova-marie/ts-rust-result';
/**
 * Document metadata stored in database
 */
export interface DocumentMetadata {
    /** Section hierarchy (e.g., ['Getting Started', 'Installation']) */
    hierarchy?: string[];
    /** Header level (1-6) */
    headerLevel?: number;
    /** Tags or keywords */
    tags?: string[];
    /** Additional custom metadata */
    [key: string]: unknown;
}
/**
 * Input for creating a new document
 */
export interface CreateDocumentInput {
    versionId: string;
    title: string;
    content: string;
    chunkIndex?: number;
    hierarchy?: string[];
    sourceUrl?: string;
    sourceType?: string;
    sourcePath?: string;
    language?: string;
    metadata?: DocumentMetadata;
}
/**
 * Document domain entity
 * Represents a chunk of documentation with vector embedding
 */
export declare class Document {
    /** Unique identifier  */
    id: string;
    /** Parent version ID */
    versionId: string;
    /** Document title/heading */
    title: string;
    /** Text content */
    content: string;
    /** Content hash (SHA-256) for deduplication */
    contentHash: string;
    /** Vector embedding (1536 dimensions for OpenAI text-embedding-3-small) */
    embedding: number[];
    /** Position in parent document */
    chunkIndex: number;
    /** Section hierarchy (e.g., ['API', 'Components', 'Button']) */
    hierarchy: string[];
    /** Source URL */
    sourceUrl: string;
    /** Source type (e.g., 'github', 'npm', 'website') */
    sourceType: string;
    /** Source file path */
    sourcePath: string;
    /** Language code (e.g., 'en', 'es') */
    language: string;
    /** Whether this chunk contains code */
    hasCode: boolean;
    /** Programming language (if code block) */
    codeLanguage: string;
    /** Additional metadata */
    metadata: DocumentMetadata;
    /** Indexing timestamp (Unix ms) */
    indexed: number;
    /** Last update timestamp (Unix ms) */
    updated: number;
    /**
     * Check if document data is stale (not updated in 14 days)
     */
    isStale(): boolean;
    /**
     * Check if document has vector embedding
     */
    hasEmbedding(): boolean;
    /**
     * Check if document is ready for vector search
     */
    isReadyForSearch(): boolean;
    /**
     * Generate SHA-256 hash of document content
     */
    generateContentHash(): string;
    /**
     * Detect if content contains code blocks
     */
    detectCode(): {
        hasCode: boolean;
        language?: string;
    };
    /**
     * Validate document has minimum required fields
     */
    validate(): Result<boolean, Error>;
    /**
     * Create a new Document instance with defaults
     */
    static create(data: CreateDocumentInput): Result<Document, Error>;
    /**
     * Update document fields and refresh timestamp
     */
    update(data: Partial<Omit<Document, 'id' | 'indexed'>>): Result<Document, Error>;
    /**
     * Attach vector embedding to document
     */
    attachEmbedding(embedding: number[]): Result<Document, Error>;
    /**
     * Calculate cosine similarity with another document's embedding
     * Returns value between -1 and 1 (higher is more similar)
     */
    cosineSimilarity(other: Document): number;
    /**
     * Convert to plain object (for JSON serialization, DB storage)
     */
    toJSON(): Record<string, unknown>;
    /**
     * Create instance from plain object (from DB, JSON)
     */
    static fromJSON(data: Record<string, unknown>): Result<Document, Error>;
}
