/**
 * Codex7 - Web Dashboard
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
