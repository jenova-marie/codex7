export interface SearchResult {
  id: string;
  title: string;
  description: string;
  branch: string;
  lastUpdateDate: string;
  state: DocumentState;
  totalTokens: number;
  totalSnippets: number;
  totalPages: number;
  stars?: number;
  trustScore?: number;
  versions?: string[];
  /** Which tool to use for fetching docs */
  tool: "get-local-docs" | "get-library-docs";
  /** Source of the library */
  source: "local" | "remote";
}

export interface SearchResponse {
  error?: string;
  results: SearchResult[];
}

// Version state is still needed for validating search results
export type DocumentState = "initial" | "finalized" | "error" | "delete";
