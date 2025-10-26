/**
 * Codex7 - MCP Server Implementation
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
 * 📝 Logger setup for MCP Server
 *
 * Uses @jenova-marie/wonder-logger for structured logging with trace context
 */

import { createLoggerFromConfig } from '@jenova-marie/wonder-logger';

/**
 * Logger instance for MCP server
 *
 * Configuration loaded from wonder-logger.yaml at package root
 * Note: Trace context disabled for Phase 0 to avoid @opentelemetry/api dependency
 */
export const logger = createLoggerFromConfig() as any;
