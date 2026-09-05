import type { SQLiteDatabase } from '../connection/index.js';
import type { AppliedMigration } from './types.js';

export class MigrationState {
  public static ensureMigrationTable(db: SQLiteDatabase): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at INTEGER NOT NULL,
        checksum TEXT
      );
    `);
  }

  public static getAppliedMigrations(db: SQLiteDatabase): AppliedMigration[] {
    this.ensureMigrationTable(db);
    const stmt = db.prepare(`
      SELECT version, name, applied_at, checksum
      FROM schema_migrations
      ORDER BY version ASC
    `);
    const rows = stmt.all() as Array<{
      version: number;
      name: string;
      applied_at: number;
      checksum: string | null;
    }>;

    return rows.map((r) => ({
      version: Number(r.version),
      name: String(r.name),
      appliedAt: Number(r.applied_at),
      checksum: r.checksum || undefined,
    }));
  }

  public static getCurrentVersion(db: SQLiteDatabase): number {
    this.ensureMigrationTable(db);
    const stmt = db.prepare(`
      SELECT MAX(version) as max_version FROM schema_migrations
    `);
    const row = stmt.get() as { max_version: number | null } | undefined;
    return row?.max_version ?? 0;
  }
}
