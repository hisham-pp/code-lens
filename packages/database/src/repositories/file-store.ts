import type { FileInfo } from '@code-lense/core';
import type { SQLiteDatabase } from '../connection/index.js';

function mapFileToParams(repoId: string, f: FileInfo): (string | number)[] {
  return [
    repoId,
    f.path,
    f.relativePath,
    f.language || '',
    f.extension || '',
    f.size,
    f.hash,
    f.isBinary ? 1 : 0,
    f.isGenerated ? 1 : 0,
    f.isMinified ? 1 : 0,
    f.isVendor ? 1 : 0,
    f.mtimeMs,
    f.createdAt || Date.now(),
    f.updatedAt || Date.now(),
  ];
}

function mapRowToFile(row: Record<string, unknown>): FileInfo {
  return {
    id: Number(row['id']),
    path: String(row['path']),
    relativePath: String(row['relative_path']),
    language: String(row['language']),
    extension: String(row['extension']),
    size: Number(row['size']),
    hash: String(row['hash']),
    isBinary: Boolean(row['is_binary']),
    isGenerated: Boolean(row['is_generated']),
    isMinified: Boolean(row['is_minified']),
    isVendor: Boolean(row['is_vendor']),
    mtimeMs: Number(row['mtime_ms']),
    createdAt: Number(row['created_at']),
    updatedAt: Number(row['updated_at']),
  };
}

export class FileStore {
  constructor(
    private db: SQLiteDatabase,
    private repoId: string,
  ) {}

  public save(file: FileInfo): number {
    return this.saveBatch([file])[0] || 0;
  }

  public saveBatch(files: FileInfo[]): number[] {
    if (files.length === 0) return [];
    const sql = `
      INSERT INTO files (
        repository_id, path, relative_path, language, extension,
        size, hash, is_binary, is_generated, is_minified, is_vendor,
        mtime_ms, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const stmt = this.db.prepare(sql);
    const ids: number[] = [];

    this.db.transaction(() => {
      for (const f of files) {
        const result = stmt.run(...mapFileToParams(this.repoId, f));
        ids.push(Number(result.lastInsertRowid));
      }
    });
    return ids;
  }

  public findByRelativePath(relativePath: string): FileInfo | null {
    const stmt = this.db.prepare(
      'SELECT * FROM files WHERE repository_id = ? AND relative_path = ? LIMIT 1',
    );
    const row = stmt.get(this.repoId, relativePath) as Record<string, unknown> | undefined;
    return row ? mapRowToFile(row) : null;
  }

  public findAll(): FileInfo[] {
    const stmt = this.db.prepare('SELECT * FROM files WHERE repository_id = ?');
    const rows = stmt.all(this.repoId) as Record<string, unknown>[];
    return rows.map((r) => mapRowToFile(r));
  }

  public deleteByPaths(relativePaths: string[]): void {
    if (relativePaths.length === 0) return;
    const placeholders = relativePaths.map(() => '?').join(',');
    const stmt = this.db.prepare(
      `DELETE FROM files WHERE repository_id = ? AND relative_path IN (${placeholders})`,
    );
    stmt.run(this.repoId, ...relativePaths);
  }

  public count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM files WHERE repository_id = ?');
    const row = stmt.get(this.repoId) as { count: number } | undefined;
    return row?.count ?? 0;
  }
}
