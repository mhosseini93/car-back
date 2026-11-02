// Usage: npm run db:restore
// Replaces the contents of the DATABASE_URL database with backups/car.sql
import { existsSync } from 'node:fs';
import { BACKUP_FILE, runPg } from './pg-tools.mjs';

if (!existsSync(BACKUP_FILE)) {
  console.error(`Backup file not found: ${BACKUP_FILE}`);
  process.exit(1);
}

runPg('psql', [
  '--file', BACKUP_FILE,
  '--quiet',
  '--set', 'ON_ERROR_STOP=1',
  // All or nothing: a failed restore leaves the database unchanged
  '--single-transaction',
]);

console.log(`Database restored from ${BACKUP_FILE}`);
