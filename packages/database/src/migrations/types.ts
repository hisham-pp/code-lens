import type { SQLiteDatabase } from '../connection/index.js';

export interface Migration {
  readonly version: number;
  readonly name: string;
  readonly up: (db: SQLiteDatabase) => void;
  readonly down?: (db: SQLiteDatabase) => void;
}

export interface AppliedMigration {
  readonly version: number;
  readonly name: string;
  readonly appliedAt: number;
  readonly checksum?: string;
}
