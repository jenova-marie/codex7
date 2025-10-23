/**
 * Document Model
 *
 * Represents a chunk of documentation with vector embedding
 *
 * This is a plain data model with primitive types only.
 * Business logic belongs in classes/Document/Document.ts
 */
export declare class document {
    id: string;
    versionId: string;
    title: string;
    content: string;
    contentHash: string;
    embedding: number[];
    chunkIndex: number;
    hierarchy: string[];
    sourceUrl: string;
    sourceType: string;
    sourcePath: string;
    language: string;
    hasCode: boolean;
    codeLanguage: string;
    metadata: Record<string, any>;
    indexed: number;
    updated: number;
}
