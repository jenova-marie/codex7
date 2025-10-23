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
