/**
 * Codex7 - Shared Types, Models, and Utilities
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
 * 🌐 REST API type definitions
 */

/**
 * Standard API error response
 */
export interface ApiError {
  /** Error message */
  message: string;

  /** Error code */
  code: string;

  /** HTTP status code */
  status: number;

  /** Additional error details */
  details?: Record<string, unknown>;

  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  /** Data items */
  data: T[];

  /** Pagination metadata */
  pagination: {
    /** Total items */
    total: number;

    /** Current page */
    page: number;

    /** Items per page */
    perPage: number;

    /** Total pages */
    totalPages: number;

    /** Whether there's a next page */
    hasNext: boolean;

    /** Whether there's a previous page */
    hasPrev: boolean;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Overall status */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /** Service version */
  version: string;

  /** Uptime in seconds */
  uptime: number;

  /** Individual component health */
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    embeddings: ComponentHealth;
  };

  /** Timestamp */
  timestamp: Date;
}

/**
 * Component health status
 */
export interface ComponentHealth {
  /** Status */
  status: 'up' | 'down' | 'degraded';

  /** Response time (ms) */
  responseTime?: number;

  /** Error message (if down) */
  message?: string;
}

/**
 * API authentication token
 */
export interface ApiToken {
  /** Token ID */
  id: string;

  /** Token value (hashed in storage) */
  token: string;

  /** Token name/description */
  name: string;

  /** Expiration date */
  expiresAt?: Date;

  /** Rate limit (requests per hour) */
  rateLimit: number;

  /** Created timestamp */
  createdAt: Date;

  /** Last used timestamp */
  lastUsedAt?: Date;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  /** Maximum requests allowed */
  limit: number;

  /** Requests remaining */
  remaining: number;

  /** Reset timestamp */
  reset: Date;

  /** Retry after (seconds) */
  retryAfter?: number;
}
