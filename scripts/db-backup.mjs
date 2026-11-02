// Usage: npm run db:backup
// Writes a plain-SQL dump of the whole database to backups/car.sql
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { BACKUP_FILE, runPg } from './pg-tools.mjs';

mkdirSync(dirname(BACKUP_FILE), { recursive: true });

runPg('pg_dump', [
  '--file', BACKUP_FILE,
  '--format', 'plain',
  '--encoding', 'UTF8',
  // Restorable into a database owned by any role, replacing existing objects
  '--no-owner',
  '--no-privileges',
  '--clean',
  '--if-exists',
]);

console.log(`Backup written to ${BACKUP_FILE}`);
