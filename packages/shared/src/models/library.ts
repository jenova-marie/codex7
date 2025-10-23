/**
 * Library Model
 *
 * Represents a library/project (e.g., React, Next.js, Express)
 *
 * This is a plain data model with primitive types only.
 * Business logic belongs in classes/Library/Library.ts
 */
export class library {
    id: string = '';
    name: string = '';
    org: string = '';
    project: string = '';
    identifier: string = '';
    repositoryUrl: string = '';
    homepageUrl: string = '';
    description: string = '';
    trustScore: number = 5;
    metadata: Record<string, any> = {};
    created: number = 0;
    updated: number = 0;
}
