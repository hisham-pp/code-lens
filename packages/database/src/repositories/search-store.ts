import type { SQLiteDatabase } from '../connection/index.js';

export interface ChunkFTSResult {
  chunkId: string;
  filePath: string;
  symbolName?: string;
  language: string;
  content: string;
  startLine: number;
  endLine: number;
  bm25Rank: number;
}

export class SearchStore {
  constructor(
    private db: SQLiteDatabase,
    private repoId: string,
  ) {}

  public searchFTS(
    query: string,
    limit: number = 20,
    filters?: { language?: string; filePath?: string },
  ): ChunkFTSResult[] {
    const cleanQuery = query.replace(/[^\w\s]/g, ' ').trim();
    if (!cleanQuery) return [];

    const ftsQuery = cleanQuery
      .split(/\s+/)
      .map((t) => `"${t}"*`)
      .join(' OR ');

    let sql = `
      SELECT c.id as chunk_id, f.relative_path as file_path, c.symbol_name, c.language,
             c.content, c.start_line, c.end_line, bm25(chunks_fts) as bm25_rank
      FROM chunks_fts fts
      JOIN chunks c ON fts.chunk_id = c.id
      JOIN files f ON c.file_id = f.id
      WHERE fts.repository_id = ? AND chunks_fts MATCH ?
    `;
    const params: Array<string | number> = [this.repoId, ftsQuery];

    if (filters?.language) {
      sql += ' AND c.language = ?';
      params.push(filters.language);
    }
    if (filters?.filePath) {
      sql += ' AND f.relative_path LIKE ?';
      params.push(`%${filters.filePath}%`);
    }

    sql += ' ORDER BY bm25_rank LIMIT ?';
    params.push(limit);

    const rows = this.db.prepare(sql).all(...params) as Array<{
      chunk_id: string;
      file_path: string;
      symbol_name: string | null;
      language: string;
      content: string;
      start_line: number;
      end_line: number;
      bm25_rank: number;
    }>;

    return rows.map((r) => ({
      chunkId: r.chunk_id,
      filePath: r.file_path,
      symbolName: r.symbol_name || undefined,
      language: r.language,
      content: r.content,
      startLine: r.start_line,
      endLine: r.end_line,
      bm25Rank: r.bm25_rank,
    }));
  }
}
