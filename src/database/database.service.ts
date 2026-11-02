import { resolve } from 'node:path';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema.js';

export type Database = NodePgDatabase<typeof schema>;

// PostgreSQL connection pool + Drizzle ORM; applies pending migrations on startup
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  readonly db: Database;

  constructor(config: ConfigService) {
    this.pool = new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    await migrate(this.db, { migrationsFolder: resolve(process.cwd(), 'drizzle') });
    this.logger.log('Database migrations are up to date');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
