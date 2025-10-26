/**
 * Codex7 - REST API Server
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

import type { Express } from 'express';
import type { Server } from 'http';
import { logger } from './utils/logger.js';

/**
 * HTTP server lifecycle manager
 *
 * Handles server start, graceful shutdown, and error handling.
 */
export class APIServer {
  private app: Express;
  private server: Server | null = null;
  private port: number;

  constructor(app: Express, port: number) {
    this.app = app;
    this.port = port;
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          logger.info({
            port: this.port,
            url: `http://localhost:${this.port}`
          });
          resolve();
        });

        this.server.on('error', (error) => {
          logger.error({ error });
          reject(error);
        });
      } catch (error) {
        logger.error({ error });
        reject(error);
      }
    });
  }

  /**
   * Gracefully shutdown the server
   */
  async shutdown(): Promise<void> {
    if (!this.server) {
      return;
    }

    logger.info('Shutting down API server...');

    return new Promise((resolve, reject) => {
      this.server!.close((error) => {
        if (error) {
          logger.error({ error });
          reject(error);
        } else {
          logger.info('API server stopped');
          resolve();
        }
      });
    });
  }
}
