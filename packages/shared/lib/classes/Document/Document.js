var __esDecorate =
  (this && this.__esDecorate) ||
  function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected');
      return f;
    }
    var kind = contextIn.kind,
      key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
    var target = !descriptorIn && ctor ? (contextIn['static'] ? ctor : ctor.prototype) : null;
    var descriptor =
      descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _,
      done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === 'access' ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) {
        if (done) throw new TypeError('Cannot add initializers after decoration has completed');
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(
        kind === 'accessor' ? { get: descriptor.get, set: descriptor.set } : descriptor[key],
        context
      );
      if (kind === 'accessor') {
        if (result === void 0) continue;
        if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
        if ((_ = accept(result.get))) descriptor.get = _;
        if ((_ = accept(result.set))) descriptor.set = _;
        if ((_ = accept(result.init))) initializers.unshift(_);
      } else if ((_ = accept(result))) {
        if (kind === 'field') initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
var __runInitializers =
  (this && this.__runInitializers) ||
  function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
    return Object.defineProperty(f, 'name', {
      configurable: true,
      value: prefix ? ''.concat(prefix, ' ', name) : name,
    });
  };
import { document } from '../../models/document';
import { addFunctions } from '../../decorators/function-injection';
import { ok, err } from '../../errors';
import { randomUUID } from 'node:crypto';
import { createHash } from 'crypto';
/**
 * Business logic class for Document domain entity
 * Extends plain model with methods and validation
 */
let Document = (() => {
  let _classDecorators = [addFunctions({})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = document;
  var Document = (_classThis = class extends _classSuper {
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
        return err({
          message: 'Document must be associated with a version',
          code: 'INVALID_DOCUMENT',
        });
      }
      if (!this.title) {
        return err({
          message: 'Document must have a title',
          code: 'INVALID_DOCUMENT',
        });
      }
      if (!this.content) {
        return err({
          message: 'Document must have content',
          code: 'INVALID_DOCUMENT',
        });
      }
      if (this.embedding.length > 0 && this.embedding.length !== 1536) {
        return err({
          message: 'Document embedding must be 1536 dimensions',
          code: 'INVALID_EMBEDDING',
        });
      }
      return ok(true);
    }
    /**
     * Create a new Document instance with defaults
     */
    static create(data) {
      try {
        const doc = new this();

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
          cause: e,
        });
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
      } catch (e) {
        return err({
          message: 'Failed to update Document instance',
          code: 'UPDATE_FAILED',
          cause: e,
        });
      }
    }
    /**
     * Attach vector embedding to document
     */
    attachEmbedding(embedding) {
      if (embedding.length !== 1536) {
        return err({
          message: 'Embedding must be 1536 dimensions (OpenAI text-embedding-3-small)',
          code: 'INVALID_EMBEDDING',
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
  });
  __setFunctionName(_classThis, 'Document');
  (() => {
    const _metadata =
      typeof Symbol === 'function' && Symbol.metadata
        ? Object.create(_classSuper[Symbol.metadata] ?? null)
        : void 0;
    __esDecorate(
      null,
      (_classDescriptor = { value: _classThis }),
      _classDecorators,
      { kind: 'class', name: _classThis.name, metadata: _metadata },
      null,
      _classExtraInitializers
    );
    Document = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (Document = _classThis);
})();
export { Document };
//# sourceMappingURL=Document.js.map
