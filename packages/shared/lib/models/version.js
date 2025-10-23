/**
 * Version Model
 *
 * Represents a specific version of a library (e.g., React v18.2.0, Next.js v14.0.0)
 *
 * This is a plain data model with primitive types only.
 * Business logic belongs in classes/Version/Version.ts
 */
export class version {
    constructor() {
        this.id = '';
        this.libraryId = '';
        this.versionString = '';
        this.versionNormalized = '';
        this.gitCommitSha = '';
        this.releaseDate = 0;
        this.isLatest = false;
        this.isDeprecated = false;
        this.documentCount = 0;
        this.metadata = {};
        this.indexed = 0;
        this.updated = 0;
    }
}
//# sourceMappingURL=version.js.map