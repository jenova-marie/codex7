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

import { logger } from '../utils/logger.js';

/**
 * Base API client
 *
 * Handles HTTP requests to backend API.
 * STUB: Methods return mock data for now.
 *
 * @example
 * ```typescript
 * const client = new APIClient('/api');
 * const data = await client.get<Library[]>('/libraries');
 * ```
 */
export class APIClient {
  private readonly baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    logger.info('🌐 API Client initialized', { baseURL });
  }

  /**
   * Make GET request
   *
   * STUB: Returns empty object/array for now
   * TODO Phase 1: Implement real fetch
   */
  async get<T>(path: string): Promise<T> {
    logger.debug('📡 GET request (STUB)', { path, baseURL: this.baseURL });

    // TODO Phase 1: Implement real fetch
    // const response = await fetch(`${this.baseURL}${path}`);
    // if (!response.ok) {
    //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    // }
    // return response.json();

    return {} as T;
  }

  /**
   * Make POST request
   *
   * STUB: Returns empty object for now
   * TODO Phase 1: Implement real fetch
   */
  async post<T>(path: string, data: any): Promise<T> {
    logger.debug('📡 POST request (STUB)', { path, data, baseURL: this.baseURL });

    // TODO Phase 1: Implement real fetch
    // const response = await fetch(`${this.baseURL}${path}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // if (!response.ok) {
    //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    // }
    // return response.json();

    return {} as T;
  }
}

/**
 * Global API client instance
 */
export const apiClient = new APIClient();
