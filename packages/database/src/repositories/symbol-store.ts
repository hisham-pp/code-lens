import type { CodeSymbol } from '@code-lense/core';
import type { SQLiteDatabase } from '../connection/index.js';
import { mapRowToSymbol } from './symbol-mapper.js';

export class SymbolStore {
  constructor(
    private db: SQLiteDatabase,
    private repoId: string,
  ) {}

  public saveBatch(symbols: CodeSymbol[], fileId: number): void {
    if (symbols.length === 0) return;
    const symSql = `
      INSERT OR REPLACE INTO symbols (
        id, file_id, repository_id, name, type, parent_id,
        start_line, end_line, start_byte, end_byte,
        signature, doc_comment, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const ftsSql =
      'INSERT INTO symbols_fts (symbol_id, repository_id, name, signature, file_path) VALUES (?, ?, ?, ?, ?)';
    const symStmt = this.db.prepare(symSql);
    const ftsStmt = this.db.prepare(ftsSql);

    this.db.transaction(() => {
      for (const s of symbols) {
        const meta = s.metadata ? JSON.stringify(s.metadata) : null;
        symStmt.run(
          s.id,
          fileId,
          this.repoId,
          s.name,
          s.type,
          s.parentId || null,
          s.startLine,
          s.endLine,
          s.startByte,
          s.endByte,
          s.signature || null,
          s.docComment || null,
          meta,
        );
        ftsStmt.run(s.id, this.repoId, s.name, s.signature || '', s.filePath);
      }
    });
  }

  public findByName(name: string): CodeSymbol[] {
    const sql = `
      SELECT s.*, f.relative_path as file_path
      FROM symbols s JOIN files f ON s.file_id = f.id
      WHERE s.repository_id = ? AND s.name = ?
    `;
    const rows = this.db.prepare(sql).all(this.repoId, name) as Record<string, unknown>[];
    return rows.map((r) => mapRowToSymbol(r));
  }

  public searchFTS(query: string, limit: number = 20): CodeSymbol[] {
    const clean = query.replace(/[^\w\s]/g, ' ').trim();
    if (!clean) return [];
    const ftsQuery = clean
      .split(/\s+/)
      .map((t) => `"${t}"*`)
      .join(' OR ');
    const sql = `
      SELECT s.*, f.relative_path as file_path
      FROM symbols_fts fts
      JOIN symbols s ON fts.symbol_id = s.id
      JOIN files f ON s.file_id = f.id
      WHERE fts.repository_id = ? AND symbols_fts MATCH ?
      ORDER BY bm25(symbols_fts) LIMIT ?
    `;
    const rows = this.db.prepare(sql).all(this.repoId, ftsQuery, limit) as Record<
      string,
      unknown
    >[];
    return rows.map((r) => mapRowToSymbol(r));
  }

  public count(): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM symbols WHERE repository_id = ?')
      .get(this.repoId) as { count: number } | undefined;
    return row?.count ?? 0;
  }
}
