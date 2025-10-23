/**
 * Document Model
 *
 * Represents a chunk of documentation with vector embedding
 *
 * This is a plain data model with primitive types only.
 * Business logic belongs in classes/Document/Document.ts
 */
export class document {
    id: string = '';
    versionId: string = '';
    title: string = '';
    content: string = '';
    contentHash: string = '';
    embedding: number[] = [];       // Will become vector(1536) in PostgreSQL
    chunkIndex: number = 0;
    hierarchy: string[] = [];
    sourceUrl: string = '';
    sourceType: string = 'github';
    sourcePath: string = '';
    language: string = 'en';
    hasCode: boolean = false;
    codeLanguage: string = '';
    metadata: Record<string, any> = {};
    indexed: number = 0;
    updated: number = 0;
}
