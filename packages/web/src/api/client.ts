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
