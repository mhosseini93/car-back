import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Thin wrapper around Node's built-in SQLite driver
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db!: DatabaseSync;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const path = this.config.get<string>('DATABASE_PATH', 'data/app.db');
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  onModuleDestroy() {
    this.db.close();
  }

  get connection(): DatabaseSync {
    return this.db;
  }
}
