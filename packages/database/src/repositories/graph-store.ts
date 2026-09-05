import type { GraphEdge } from '@code-lense/core';
import type { SQLiteDatabase } from '../connection/index.js';
import { COL_METADATA_JSON } from './constants.js';

function mapRowToEdge(row: Record<string, unknown>): GraphEdge {
  let metadata: Record<string, unknown> | undefined;
  if (row[COL_METADATA_JSON]) {
    try {
      metadata = JSON.parse(String(row[COL_METADATA_JSON]));
    } catch {
      // ignore
    }
  }

  return {
    id: Number(row['id']),
    sourceId: String(row['source_id']),
    targetId: String(row['target_id']),
    relation: row['relation'] as GraphEdge['relation'],
    metadata,
  };
}

export class GraphStore {
  constructor(
    private db: SQLiteDatabase,
    private repoId: string,
  ) {}

  public saveEdges(edges: GraphEdge[]): void {
    if (edges.length === 0) return;
    const sql = `
      INSERT INTO graph_edges (repository_id, source_id, target_id, relation, metadata_json)
      VALUES (?, ?, ?, ?, ?)
    `;
    const stmt = this.db.prepare(sql);

    this.db.transaction(() => {
      for (const edge of edges) {
        const meta = edge.metadata ? JSON.stringify(edge.metadata) : null;
        stmt.run(this.repoId, edge.sourceId, edge.targetId, edge.relation, meta);
      }
    });
  }

  public getDependencies(sourceId: string): GraphEdge[] {
    const sql = 'SELECT * FROM graph_edges WHERE repository_id = ? AND source_id = ?';
    const rows = this.db.prepare(sql).all(this.repoId, sourceId) as Record<string, unknown>[];
    return rows.map((r) => mapRowToEdge(r));
  }

  public getDependents(targetId: string): GraphEdge[] {
    const sql = 'SELECT * FROM graph_edges WHERE repository_id = ? AND target_id = ?';
    const rows = this.db.prepare(sql).all(this.repoId, targetId) as Record<string, unknown>[];
    return rows.map((r) => mapRowToEdge(r));
  }

  public count(): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM graph_edges WHERE repository_id = ?')
      .get(this.repoId) as { count: number } | undefined;
    return row?.count ?? 0;
  }
}
