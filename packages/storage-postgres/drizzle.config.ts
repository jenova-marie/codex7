// drizzle.config.ts
// Drizzle Kit configuration for PostgreSQL + pgvector migrations

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle',              // Folder where pgTable definitions live
  out: './src/migrations',              // Where to save generated migration SQL files
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'codex7',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  verbose: true,
  strict: true,
} satisfies Config;
