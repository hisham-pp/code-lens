import type { VectorRecord, VectorSearchResult, VectorStore } from '@code-lense/core';
import type { SQLiteDatabase } from '../connection/index.js';

export class SQLiteVectorStore implements VectorStore {
  private db: SQLiteDatabase;
  private repositoryId: string;

  constructor(db: SQLiteDatabase, repositoryId: string) {
    this.db = db;
    this.repositoryId = repositoryId;
  }

  public async insert(record: VectorRecord): Promise<void> {
    await this.insertBatch([record]);
  }

  public async insertBatch(records: VectorRecord[]): Promise<void> {
    if (records.length === 0) return;

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO vectors (id, repository_id, embedding_blob, dimension, metadata_json)
      VALUES (?, ?, ?, ?, ?)
    `);

    this.db.transaction(() => {
      for (const rec of records) {
        const float32 = new Float32Array(rec.embedding);
        const buffer = Buffer.from(float32.buffer, float32.byteOffset, float32.byteLength);
        stmt.run(
          rec.id,
          this.repositoryId,
          buffer,
          rec.embedding.length,
          rec.metadata ? JSON.stringify(rec.metadata) : null,
        );
      }
    });
  }

  public async search(queryEmbedding: number[], limit: number = 20): Promise<VectorSearchResult[]> {
    const qF32 = new Float32Array(queryEmbedding);
    const qNorm = Math.sqrt(this.dotProduct(qF32, qF32));
    if (qNorm === 0) return [];

    const stmt = this.db.prepare(`
      SELECT id, embedding_blob, metadata_json
      FROM vectors
      WHERE repository_id = ?
    `);

    const rows = stmt.all(this.repositoryId) as Array<{
      id: string;
      embedding_blob: Buffer | Uint8Array;
      metadata_json: string | null;
    }>;

    const scoredResults: VectorSearchResult[] = [];

    for (const row of rows) {
      const buf = row.embedding_blob;
      const emb = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
      if (emb.length !== qF32.length) continue;

      const dot = this.dotProduct(qF32, emb);
      const rowNorm = Math.sqrt(this.dotProduct(emb, emb));
      const score = rowNorm > 0 ? dot / (qNorm * rowNorm) : 0;

      let metadata: Record<string, unknown> | undefined;
      if (row.metadata_json) {
        try {
          metadata = JSON.parse(row.metadata_json);
        } catch {
          // ignore
        }
      }

      scoredResults.push({
        id: row.id,
        score,
        metadata,
      });
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(0, limit);
  }

  public async delete(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      DELETE FROM vectors
      WHERE repository_id = ? AND id IN (${placeholders})
    `);
    stmt.run(this.repositoryId, ...ids);
  }

  public async count(): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM vectors
      WHERE repository_id = ?
    `);
    const row = stmt.get(this.repositoryId) as { count: number } | undefined;
    return row?.count ?? 0;
  }

  public async close(): Promise<void> {
    // Database lifecycle managed by parent
  }

  private dotProduct(a: Float32Array, b: Float32Array): number {
    let sum = 0;
    const len = a.length;
    for (let i = 0; i < len; i++) {
      sum += a[i]! * b[i]!;
    }
    return sum;
  }
}
