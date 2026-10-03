import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('storage/satsa.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log('Tables and Row Counts:');
for (const t of tables) {
  const count = db.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get();
  console.log(` - ${t.name}: ${count.c}`);
}
