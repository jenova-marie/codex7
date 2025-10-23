import { document } from '../../models/document';
import { addFunctions } from '../../decorators/function-injection';
import { ok, err, type DocumentResult } from '../../errors';
import ObjectID from 'bson-objectid';
import { createHash } from 'crypto';

/**
 * Business logic class for Document domain entity
 * Extends plain model with methods and validation
 */
@addFunctions({})
export class Document extends document {
  /**
   * Check if document data is stale (not updated in 14 days)
   */
  isStale(): boolean {
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    return Date.now() - this.updated > fourteenDaysMs;
  }

  /**
   * Check if document has vector embedding
   */
  hasEmbedding(): boolean {
    return this.embedding.length === 1536;
  }

  /**
   * Check if document is ready for vector search
   */
  isReadyForSearch(): boolean {
    return this.hasEmbedding() && !this.isStale();
  }

  /**
   * Generate SHA-256 hash of document content
   */
  generateContentHash(): string {
    return createHash('sha256').update(this.content).digest('hex');
  }

  /**
   * Detect if content contains code blocks
   */
  detectCode(): { hasCode: boolean; language?: string } {
    // Simple markdown code block detection
    const codeBlockRegex = /```(\w+)?\n/;
    const match = this.content.match(codeBlockRegex);

    if (match) {
      return {
        hasCode: true,
        language: match[1] || 'unknown'
      };
    }

    return { hasCode: false };
  }

  /**
   * Validate document has minimum required fields
   */
  validate(): DocumentResult<boolean> {
    if (!this.versionId) {
      return err({
        message: 'Document must be associated with a version',
        code: 'INVALID_DOCUMENT'
      });
    }

    if (!this.title) {
      return err({
        message: 'Document must have a title',
        code: 'INVALID_DOCUMENT'
      });
    }

    if (!this.content) {
      return err({
        message: 'Document must have content',
        code: 'INVALID_DOCUMENT'
      });
    }

    if (this.embedding.length > 0 && this.embedding.length !== 1536) {
      return err({
        message: 'Document embedding must be 1536 dimensions',
        code: 'INVALID_EMBEDDING'
      });
    }

    return ok(true);
  }

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
  }): DocumentResult<Document> {
    try {
      const doc = new this();
      const objectId = new ObjectID();
      doc.id = objectId.toHexString();

      const now = Date.now();
      doc.indexed = now;
      doc.updated = now;

      // Set required fields
      doc.versionId = data.versionId;
      doc.title = data.title;
      doc.content = data.content;
      doc.contentHash = doc.generateContentHash();

      // Set optional fields
      doc.chunkIndex = data.chunkIndex || 0;
      doc.hierarchy = data.hierarchy || [];
      doc.sourceUrl = data.sourceUrl || '';
      doc.sourceType = data.sourceType || 'github';
      doc.sourcePath = data.sourcePath || '';

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
    } catch (e) {
      return err({
        message: 'Failed to create Document instance',
        code: 'CREATE_FAILED',
        cause: e
      });
    }
  }

  /**
   * Update document fields and refresh timestamp
   */
  update(data: Partial<Omit<document, 'id' | 'indexed'>>): DocumentResult<Document> {
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
    } catch (e) {
      return err({
        message: 'Failed to update Document instance',
        code: 'UPDATE_FAILED',
        cause: e
      });
    }
  }

  /**
   * Attach vector embedding to document
   */
  attachEmbedding(embedding: number[]): DocumentResult<Document> {
    if (embedding.length !== 1536) {
      return err({
        message: 'Embedding must be 1536 dimensions (OpenAI text-embedding-3-small)',
        code: 'INVALID_EMBEDDING'
      });
    }

    this.embedding = embedding;
    this.updated = Date.now();
    return ok(this);
  }

  /**
   * Calculate cosine similarity with another document's embedding
   * Returns value between -1 and 1 (higher is more similar)
   */
  cosineSimilarity(other: Document): number {
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
}
