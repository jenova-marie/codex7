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
