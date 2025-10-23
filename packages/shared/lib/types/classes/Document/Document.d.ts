import { document } from '../../models/document';
import { type DocumentResult } from '../../errors';
/**
 * Business logic class for Document domain entity
 * Extends plain model with methods and validation
 */
export declare class Document extends document {
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
    validate(): DocumentResult<boolean>;
    /**
     * Create a new Document instance with defaults
     */
    static create(data: {
        versionId: string;
        title: string;
        content: string;
        chunkIndex?: number;
        hierarchy?: string[];
        sourceUrl?: string;
        sourceType?: string;
        sourcePath?: string;
    }): DocumentResult<Document>;
    /**
     * Update document fields and refresh timestamp
     */
    update(data: Partial<Omit<document, 'id' | 'indexed'>>): DocumentResult<Document>;
    /**
     * Attach vector embedding to document
     */
    attachEmbedding(embedding: number[]): DocumentResult<Document>;
    /**
     * Calculate cosine similarity with another document's embedding
     * Returns value between -1 and 1 (higher is more similar)
     */
    cosineSimilarity(other: Document): number;
}
