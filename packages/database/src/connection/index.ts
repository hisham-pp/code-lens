import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface DatabaseOptions {
  readOnly?: boolean;
}

export class SQLiteDatabase {
  private db: DatabaseSync;
  private inTransaction: boolean = false;

  constructor(filePath: string, options: DatabaseOptions = {}) {
    if (filePath !== ':memory:') {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(filePath, {
      readOnly: options.readOnly ?? false,
    });

    this.initPragmas();
  }

  private initPragmas(): void {
    // Configure SQLite for high performance local indexing
    try {
      this.db.exec('PRAGMA journal_mode = WAL;');
      this.db.exec('PRAGMA synchronous = NORMAL;');
      this.db.exec('PRAGMA foreign_keys = ON;');
      this.db.exec('PRAGMA temp_store = MEMORY;');
    } catch {
      // Memory dbs or certain flags might ignore some pragmas
    }
  }

  public getRawDb(): DatabaseSync {
    return this.db;
  }

  public exec(sql: string): void {
    this.db.exec(sql);
  }

  public prepare(sql: string) {
    return this.db.prepare(sql);
  }

  public transaction<T>(fn: () => T): T {
    if (this.inTransaction) {
      return fn();
    }
    this.inTransaction = true;
    this.db.exec('BEGIN TRANSACTION;');
    try {
      const result = fn();
      this.db.exec('COMMIT;');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    } finally {
      this.inTransaction = false;
    }
  }

  public close(): void {
    this.db.close();
  }
}
