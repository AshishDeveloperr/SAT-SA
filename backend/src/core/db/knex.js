import knex from 'knex';
import path from 'node:path';
import fs from 'node:fs';

const isPostgres = process.env.DB_CLIENT === 'pg' || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));

let dbConfig;

if (isPostgres) {
  dbConfig = {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'satsa',
      password: process.env.DB_PASSWORD || 'satsa_secure_2026',
      database: process.env.DB_NAME || 'satsa_db'
    },
    pool: { min: 2, max: 20 }
  };
} else {
  // Offline-safe embedded SQLite for immediate zero-config execution
  const storageDir = path.resolve(process.cwd(), 'storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  const dbFile = path.resolve(storageDir, 'satsa.db');

  dbConfig = {
    client: 'better-sqlite3',
    connection: {
      filename: dbFile
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, cb) => {
        conn.pragma('journal_mode = WAL');
        conn.pragma('foreign_keys = ON');
        cb(null, conn);
      }
    }
  };
}

export const db = knex(dbConfig);
export default db;
