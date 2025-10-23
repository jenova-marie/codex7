/**
 * Version Model
 *
 * Represents a specific version of a library (e.g., React v18.2.0, Next.js v14.0.0)
 *
 * This is a plain data model with primitive types only.
 * Business logic belongs in classes/Version/Version.ts
 */
export class version {
    id: string = '';
    libraryId: string = '';
    versionString: string = '';
    versionNormalized: string = '';
    gitCommitSha: string = '';
    releaseDate: number = 0;
    isLatest: boolean = false;
    isDeprecated: boolean = false;
    documentCount: number = 0;
    metadata: Record<string, any> = {};
    indexed: number = 0;
    updated: number = 0;
}
