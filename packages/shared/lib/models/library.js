/**
 * Library Model
 *
 * Represents a library/project (e.g., React, Next.js, Express)
 *
 * This is a plain data model with primitive types only.
 * Business logic belongs in classes/Library/Library.ts
 */
export class library {
    constructor() {
        this.id = '';
        this.name = '';
        this.org = '';
        this.project = '';
        this.identifier = '';
        this.repositoryUrl = '';
        this.homepageUrl = '';
        this.description = '';
        this.trustScore = 5;
        this.metadata = {};
        this.created = 0;
        this.updated = 0;
    }
}
//# sourceMappingURL=library.js.map