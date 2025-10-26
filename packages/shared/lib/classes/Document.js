import { ok, err } from '@jenova-marie/ts-rust-result';
import { randomUUID } from 'node:crypto';
import { createHash } from 'crypto';
/**
 * Document domain entity
 * Represents a chunk of documentation with vector embedding
 */
export class Document {
    constructor() {
        /** Unique identifier  */
        this.id = '';
        /** Parent version ID */
        this.versionId = '';
        /** Document title/heading */
        this.title = '';
        /** Text content */
        this.content = '';
        /** Content hash (SHA-256) for deduplication */
        this.contentHash = '';
        /** Vector embedding (1536 dimensions for OpenAI text-embedding-3-small) */
        this.embedding = [];
        /** Position in parent document */
        this.chunkIndex = 0;
        /** Section hierarchy (e.g., ['API', 'Components', 'Button']) */
        this.hierarchy = [];
        /** Source URL */
        this.sourceUrl = '';
        /** Source type (e.g., 'github', 'npm', 'website') */
        this.sourceType = 'github';
        /** Source file path */
        this.sourcePath = '';
        /** Language code (e.g., 'en', 'es') */
        this.language = 'en';
        /** Whether this chunk contains code */
        this.hasCode = false;
        /** Programming language (if code block) */
        this.codeLanguage = '';
        /** Additional metadata */
        this.metadata = {};
        /** Indexing timestamp (Unix ms) */
        this.indexed = 0;
        /** Last update timestamp (Unix ms) */
        this.updated = 0;
    }
    /**
     * Check if document data is stale (not updated in 14 days)
     */
    isStale() {
        const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
        return Date.now() - this.updated > fourteenDaysMs;
    }
    /**
     * Check if document has vector embedding
     */
    hasEmbedding() {
        return this.embedding.length === 1536;
    }
    /**
     * Check if document is ready for vector search
     */
    isReadyForSearch() {
        return this.hasEmbedding() && !this.isStale();
    }
    /**
     * Generate SHA-256 hash of document content
     */
    generateContentHash() {
        return createHash('sha256').update(this.content).digest('hex');
    }
    /**
     * Detect if content contains code blocks
     */
    detectCode() {
        // Simple markdown code block detection
        const codeBlockRegex = /```(\w+)?\n/;
        const match = this.content.match(codeBlockRegex);
        if (match) {
            return {
                hasCode: true,
                language: match[1] || 'unknown',
            };
        }
        return { hasCode: false };
    }
    /**
     * Validate document has minimum required fields
     */
    validate() {
        if (!this.versionId) {
            return err(new Error('Document must be associated with a version'));
        }
        if (!this.title) {
            return err(new Error('Document must have a title'));
        }
        if (!this.content) {
            return err(new Error('Document must have content'));
        }
        if (this.embedding.length > 0 && this.embedding.length !== 1536) {
            return err(new Error('Document embedding must be 1536 dimensions'));
        }
        return ok(true);
    }
    /**
     * Create a new Document instance with defaults
     */
    static create(data) {
        try {
            const doc = new Document();
            doc.id = randomUUID();
            const now = Date.now();
            doc.indexed = now;
            doc.updated = now;
            // Set required fields
            doc.versionId = data.versionId;
            doc.title = data.title;
            doc.content = data.content;
            doc.contentHash = doc.generateContentHash();
            // Set optional fields
            doc.chunkIndex = data.chunkIndex ?? 0;
            doc.hierarchy = data.hierarchy || [];
            doc.sourceUrl = data.sourceUrl || '';
            doc.sourceType = data.sourceType || 'github';
            doc.sourcePath = data.sourcePath || '';
            doc.language = data.language || 'en';
            doc.metadata = data.metadata || {};
            // Auto-detect code
            const codeDetection = doc.detectCode();
            doc.hasCode = codeDetection.hasCode;
            doc.codeLanguage = codeDetection.language || '';
            // Validate before returning
            const validation = doc.validate();
            if (!validation.ok) {
                return err(validation.error);
            }
            return ok(doc);
        }
        catch (e) {
            return err(new Error(`Failed to create Document: ${e instanceof Error ? e.message : String(e)}`));
        }
    }
    /**
     * Update document fields and refresh timestamp
     */
    update(data) {
        try {
            Object.assign(this, data);
            this.updated = Date.now();
            // Regenerate hash if content changed
            if (data.content) {
                this.contentHash = this.generateContentHash();
                const codeDetection = this.detectCode();
                this.hasCode = codeDetection.hasCode;
                this.codeLanguage = codeDetection.language || '';
            }
            // Re-validate after update
            const validation = this.validate();
            if (!validation.ok) {
                return err(validation.error);
            }
            return ok(this);
        }
        catch (e) {
            return err(new Error(`Failed to update Document: ${e instanceof Error ? e.message : String(e)}`));
        }
    }
    /**
     * Attach vector embedding to document
     */
    attachEmbedding(embedding) {
        if (embedding.length !== 1536) {
            return err(new Error('Embedding must be 1536 dimensions (OpenAI text-embedding-3-small)'));
        }
        this.embedding = embedding;
        this.updated = Date.now();
        return ok(this);
    }
    /**
     * Calculate cosine similarity with another document's embedding
     * Returns value between -1 and 1 (higher is more similar)
     */
    cosineSimilarity(other) {
        if (!this.hasEmbedding() || !other.hasEmbedding()) {
            return 0;
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < 1536; i++) {
            dotProduct += this.embedding[i] * other.embedding[i];
            normA += this.embedding[i] * this.embedding[i];
            normB += other.embedding[i] * other.embedding[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Convert to plain object (for JSON serialization, DB storage)
     */
    toJSON() {
        return {
            id: this.id,
            versionId: this.versionId,
            title: this.title,
            content: this.content,
            contentHash: this.contentHash,
            embedding: this.embedding,
            chunkIndex: this.chunkIndex,
            hierarchy: this.hierarchy,
            sourceUrl: this.sourceUrl,
            sourceType: this.sourceType,
            sourcePath: this.sourcePath,
            language: this.language,
            hasCode: this.hasCode,
            codeLanguage: this.codeLanguage,
            metadata: this.metadata,
            indexed: this.indexed,
            updated: this.updated,
        };
    }
    /**
     * Create instance from plain object (from DB, JSON)
     */
    static fromJSON(data) {
        try {
            const doc = new Document();
            Object.assign(doc, data);
            const validation = doc.validate();
            if (!validation.ok) {
                return err(validation.error);
            }
            return ok(doc);
        }
        catch (e) {
            return err(new Error(`Failed to deserialize Document: ${e instanceof Error ? e.message : String(e)}`));
        }
    }
}
//# sourceMappingURL=Document.js.map