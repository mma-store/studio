
/**
 * @fileOverview SQLite Client for Node.js environments only.
 * This file is now protected to prevent being bundled into the client-side code.
 */

export const getSqliteDb = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('SQLite Native cannot be used in the browser.');
  }

  // Use dynamic import to prevent bundling for the client
  const Database = (await import('better-sqlite3')).default;
  const { drizzle } = await import('drizzle-orm/better-sqlite3');
  
  const sqlitePath = process.env.DATABASE_URL || 'dubsar.db';
  const sqlite = new Database(sqlitePath);
  
  return drizzle(sqlite);
};
