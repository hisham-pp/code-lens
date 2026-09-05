import type { CodeChunk } from '@code-lense/core';
import type { SQLiteDatabase } from '../connection/index.js';
import { SearchStore, type ChunkFTSResult } from './search-store.js';

function mapRowToChunk(row: Record<string, unknown>): CodeChunk {
  return {
    id: String(row['id']),
    fileId: Number(row['file_id']),
    filePath: String(row['file_path'] || ''),
    symbolId: row['symbol_id'] ? String(row['symbol_id']) : undefined,
    symbolName: row['symbol_name'] ? String(row['symbol_name']) : undefined,
    parentSymbolId: row['parent_symbol_id'] ? String(row['parent_symbol_id']) : undefined,
    startLine: Number(row['start_line']),
    endLine: Number(row['end_line']),
    startByte: Number(row['start_byte'] || 0),
    endByte: Number(row['end_byte'] || 0),
    chunkType: row['chunk_type'] as CodeChunk['chunkType'],
    content: String(row['content']),
    hash: String(row['hash']),
    language: String(row['language']),
  };
}

export class ChunkStore {
  constructor(
    private db: SQLiteDatabase,
    private repoId: string,
  ) {}

  public saveBatch(chunks: CodeChunk[], fileId: number): void {
    if (chunks.length === 0) return;
    const chunkSql = `
      INSERT OR REPLACE INTO chunks (
        id, file_id, repository_id, symbol_id, symbol_name, parent_symbol_id,
        start_line, end_line, start_byte, end_byte,
        chunk_type, content, hash, language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const ftsSql =
      'INSERT INTO chunks_fts (chunk_id, repository_id, content, file_path, symbol_name, language) VALUES (?, ?, ?, ?, ?, ?)';
    const chunkStmt = this.db.prepare(chunkSql);
    const ftsStmt = this.db.prepare(ftsSql);

    this.db.transaction(() => {
      for (const c of chunks) {
        chunkStmt.run(
          c.id,
          fileId,
          this.repoId,
          c.symbolId || null,
          c.symbolName || null,
          c.parentSymbolId || null,
          c.startLine,
          c.endLine,
          c.startByte,
          c.endByte,
          c.chunkType,
          c.content,
          c.hash,
          c.language,
        );
        ftsStmt.run(c.id, this.repoId, c.content, c.filePath, c.symbolName || '', c.language);
      }
    });
  }

  public findByHash(hash: string): CodeChunk | null {
    const sql = `
      SELECT c.*, f.relative_path as file_path
      FROM chunks c JOIN files f ON c.file_id = f.id
      WHERE c.repository_id = ? AND c.hash = ? LIMIT 1
    `;
    const row = this.db.prepare(sql).get(this.repoId, hash) as Record<string, unknown> | undefined;
    return row ? mapRowToChunk(row) : null;
  }

  public searchFTS(
    query: string,
    limit: number = 20,
    filters?: { language?: string; filePath?: string },
  ): ChunkFTSResult[] {
    return new SearchStore(this.db, this.repoId).searchFTS(query, limit, filters);
  }

  public count(): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM chunks WHERE repository_id = ?')
      .get(this.repoId) as { count: number } | undefined;
    return row?.count ?? 0;
  }
}
