
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

/**
 * @fileOverview SQLite Client Initialization for DUBSAR 2.0.
 * هذا الملف يعمل فقط في بيئة Node.js (Server Side).
 */

// التأكد من عدم استدعاء هذا الملف في المتصفح
const isServer = typeof window === 'undefined';

if (!isServer) {
  throw new Error('SQLite client cannot be initialized in the browser.');
}

const sqlitePath = process.env.DATABASE_URL || 'dubsar.db';
const sqlite = new Database(sqlitePath);

export const db = drizzle(sqlite, { schema });

export type SQLiteDB = typeof db;
