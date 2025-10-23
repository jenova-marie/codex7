import { pgTable, text, integer, boolean, varchar, json, timestamp, date, uuid, decimal, bigint, index } from 'drizzle-orm/pg-core';

export const libraries = pgTable('libraries', {
  created: integer('created').notNull().default(0),
  description: text('description').notNull().default(''),
  homepageUrl: text('homepageUrl').notNull().default(''),
  id: text('id').notNull().primaryKey().default(''),
  identifier: text('identifier').notNull().default(''),
  metadata: text('metadata').notNull(),
  name: text('name').notNull().default(''),
  org: text('org').notNull().default(''),
  project: text('project').notNull().default(''),
  repositoryUrl: text('repositoryUrl').notNull().default(''),
  trustScore: integer('trustScore').notNull().default(5),
  updated: integer('updated').notNull().default(0),
});
