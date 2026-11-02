import { defineConfig } from 'drizzle-kit';

// drizzle-kit doesn't read .env on its own
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
