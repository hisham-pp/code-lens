import type { Dependency } from '@code-lense/core';
import type { SQLiteDatabase } from '../connection/index.js';

export class DependencyStore {
  constructor(
    private db: SQLiteDatabase,
    private repoId: string,
  ) {}

  public saveBatch(deps: Dependency[]): void {
    if (deps.length === 0) return;
    const stmt = this.db.prepare(`
      INSERT INTO dependencies (
        repository_id, source_file_path, target_path, specifier,
        imported_symbols_json, is_dynamic, is_type_only
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    this.db.transaction(() => {
      for (const d of deps) {
        stmt.run(
          this.repoId,
          d.sourceFilePath,
          d.targetPath || null,
          d.specifier,
          JSON.stringify(d.importedSymbols),
          d.isDynamic ? 1 : 0,
          d.isTypeOnly ? 1 : 0,
        );
      }
    });
  }
}
