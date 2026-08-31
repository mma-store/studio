
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

/**
 * @fileOverview SQLite Client Initialization for DUBSAR 2.0.
 * In a desktop environment, this points to a local file.
 */

const sqlitePath = process.env.DATABASE_URL || 'dubsar.db';
const sqlite = new Database(sqlitePath);

export const db = drizzle(sqlite, { schema });

export type SQLiteDB = typeof db;
