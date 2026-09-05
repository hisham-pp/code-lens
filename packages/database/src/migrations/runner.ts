import type { SQLiteDatabase } from '../connection/index.js';
import { MIGRATIONS } from './registry.js';
import { MigrationState } from './state.js';
import type { AppliedMigration, Migration } from './types.js';

export interface MigrationResult {
  applied: Migration[];
  totalApplied: number;
}

export class MigrationRunner {
  public static ensureMigrationTable(db: SQLiteDatabase): void {
    MigrationState.ensureMigrationTable(db);
  }

  public static getAppliedMigrations(db: SQLiteDatabase): AppliedMigration[] {
    return MigrationState.getAppliedMigrations(db);
  }

  public static getPendingMigrations(
    db: SQLiteDatabase,
    registry: readonly Migration[] = MIGRATIONS,
  ): Migration[] {
    const applied = this.getAppliedMigrations(db);
    const appliedVersions = new Set(applied.map((m) => m.version));
    return registry.filter((m) => !appliedVersions.has(m.version));
  }

  public static migrateToLatest(
    db: SQLiteDatabase,
    registry: readonly Migration[] = MIGRATIONS,
  ): MigrationResult {
    this.ensureMigrationTable(db);
    const pending = this.getPendingMigrations(db, registry);
    const applied: Migration[] = [];

    const recordStmt = db.prepare(`
      INSERT INTO schema_migrations (version, name, applied_at)
      VALUES (?, ?, ?)
    `);

    for (const migration of pending) {
      db.transaction(() => {
        migration.up(db);
        recordStmt.run(migration.version, migration.name, Date.now());
      });
      applied.push(migration);
    }

    return {
      applied,
      totalApplied: applied.length,
    };
  }

  public static rollbackLast(
    db: SQLiteDatabase,
    registry: readonly Migration[] = MIGRATIONS,
  ): Migration | null {
    this.ensureMigrationTable(db);
    const applied = this.getAppliedMigrations(db);
    if (applied.length === 0) return null;

    const lastApplied = applied[applied.length - 1]!;
    const migration = registry.find((m) => m.version === lastApplied.version);
    if (!migration || !migration.down) return null;

    const deleteStmt = db.prepare('DELETE FROM schema_migrations WHERE version = ?');
    db.transaction(() => {
      migration.down!(db);
      deleteStmt.run(lastApplied.version);
    });

    return migration;
  }

  public static getCurrentVersion(db: SQLiteDatabase): number {
    return MigrationState.getCurrentVersion(db);
  }

  public static runMigrations(db: SQLiteDatabase): void {
    this.migrateToLatest(db);
  }
}
