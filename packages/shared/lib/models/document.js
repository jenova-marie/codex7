/**
 * Document Model
 *
 * Represents a chunk of documentation with vector embedding
 *
 * This is a plain data model with primitive types only.
 * Business logic belongs in classes/Document/Document.ts
 */
export class document {
    constructor() {
        this.id = '';
        this.versionId = '';
        this.title = '';
        this.content = '';
        this.contentHash = '';
        this.embedding = []; // Will become vector(1536) in PostgreSQL
        this.chunkIndex = 0;
        this.hierarchy = [];
        this.sourceUrl = '';
        this.sourceType = 'github';
        this.sourcePath = '';
        this.language = 'en';
        this.hasCode = false;
        this.codeLanguage = '';
        this.metadata = {};
        this.indexed = 0;
        this.updated = 0;
    }
}
//# sourceMappingURL=document.js.map