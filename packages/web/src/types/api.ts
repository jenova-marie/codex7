/**
 * API response types
 *
 * Types for responses from the Codex7 REST API.
 * These will be used by the API client for type safety.
 */

export interface Library {
  id: string;
  name: string;
  identifier: string;
  description: string | null;
  repositoryUrl: string | null;
  trustScore: number;
}

export interface SearchResult {
  title: string;
  content: string;
  library: string;
  url: string;
  relevanceScore: number;
}
