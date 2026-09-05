import type { SearchResult, EmbeddingProvider } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';

export class SemanticSearchEngine {
  constructor(
    private db: RepositoryDatabase,
    private embeddingProvider?: EmbeddingProvider,
  ) {}

  public async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!this.embeddingProvider) {
      return [];
    }

    const queryEmbedding = await this.embeddingProvider.embed(query);
    const vectorResults = await this.db.vectors.search(queryEmbedding, limit);
    if (vectorResults.length === 0) return [];

    const results: SearchResult[] = [];

    for (const v of vectorResults) {
      // Look up chunk by ID
      const stmt = this.db.db.prepare(`
        SELECT c.*, f.relative_path as file_path
        FROM chunks c
        JOIN files f ON c.file_id = f.id
        WHERE c.repository_id = ? AND c.id = ?
        LIMIT 1
      `);
      const row = stmt.get(this.db.repositoryId, v.id) as Record<string, unknown> | undefined;

      if (row) {
        results.push({
          chunkId: String(row['id']),
          filePath: String(row['file_path']),
          symbolName: row['symbol_name'] ? String(row['symbol_name']) : undefined,
          language: String(row['language']),
          startLine: Number(row['start_line']),
          endLine: Number(row['end_line']),
          content: String(row['content']),
          score: v.score,
          semanticScore: v.score,
          matchType: 'semantic',
        });
      }
    }

    return results;
  }
}
