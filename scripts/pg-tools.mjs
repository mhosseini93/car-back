// Shared helpers for the db:backup / db:restore scripts
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment
}

export const BACKUP_FILE = join(process.cwd(), 'backups', 'car.sql');

// PostgreSQL client tools: PG_BIN in .env, else the default Windows install, else PATH
function pgBinary(name) {
  const dirs = [process.env.PG_BIN, 'C:\\Program Files\\PostgreSQL\\18\\bin'].filter(Boolean);
  for (const dir of dirs) {
    const exe = join(dir, process.platform === 'win32' ? `${name}.exe` : name);
    if (existsSync(exe)) return exe;
  }
  return name;
}

// Connection details from DATABASE_URL; the password goes in PGPASSWORD, not argv
function connection() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set (see .env.example)');
    process.exit(1);
  }
  const url = new URL(process.env.DATABASE_URL);
  return {
    args: [
      '--host', url.hostname,
      '--port', url.port || '5432',
      '--username', decodeURIComponent(url.username),
      '--dbname', url.pathname.slice(1),
    ],
    env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) },
  };
}

export function runPg(tool, args) {
  const { args: connArgs, env } = connection();
  const result = spawnSync(pgBinary(tool), [...connArgs, ...args], { env, stdio: 'inherit' });
  if (result.error) {
    console.error(`Could not run ${tool}: ${result.error.message}. Set PG_BIN in .env.`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
