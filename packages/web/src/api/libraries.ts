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

import { apiClient } from './client.js';
import type { Library } from '../types/api.js';

/**
 * Library API endpoints
 *
 * STUB: All methods return empty arrays/objects
 * TODO Phase 1: Implement real API calls
 */
export const librariesAPI = {
  /**
   * List all libraries
   *
   * STUB: Returns empty array
   */
  async list(): Promise<Library[]> {
    return apiClient.get<Library[]>('/libraries');
  },

  /**
   * Add new library source
   *
   * STUB: Returns mock job ID
   */
  async add(source: { type: string; url: string }): Promise<{ job_id: string }> {
    return apiClient.post('/libraries', source);
  }
};
