import { pgTable, text, integer, boolean, varchar, json, timestamp, date, uuid, decimal, bigint, index } from 'drizzle-orm/pg-core';

export const versions = pgTable('versions', {
  documentCount: integer('documentCount').notNull().default(0),
  gitCommitSha: text('gitCommitSha').notNull().default(''),
  id: text('id').notNull().primaryKey().default(''),
  indexed: integer('indexed').notNull().default(0),
  isDeprecated: boolean('isDeprecated').notNull().default(false),
  isLatest: boolean('isLatest').notNull().default(false),
  libraryId: text('libraryId').notNull().default(''),
  metadata: text('metadata').notNull(),
  releaseDate: integer('releaseDate').notNull().default(0),
  updated: integer('updated').notNull().default(0),
  versionNormalized: text('versionNormalized').notNull().default(''),
  versionString: text('versionString').notNull().default(''),
});
