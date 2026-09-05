import type { SearchResult } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';

export class LexicalSearchEngine {
  constructor(private db: RepositoryDatabase) {}

  public search(
    query: string,
    limit: number = 20,
    filters?: { language?: string; filePath?: string },
  ): SearchResult[] {
    const rawChunks = this.db.chunks.searchFTS(query, limit, filters);
    if (rawChunks.length === 0) return [];

    // FTS5 bm25 produces negative numbers where more negative = better match
    const rawRanks = rawChunks.map((c) => -c.bm25Rank);
    const minRank = Math.min(...rawRanks);
    const maxRank = Math.max(...rawRanks);
    const range = maxRank - minRank || 1;

    return rawChunks.map((chunk, idx) => {
      const normalizedScore = (rawRanks[idx]! - minRank) / range;
      return {
        chunkId: chunk.chunkId,
        filePath: chunk.filePath,
        symbolName: chunk.symbolName,
        language: chunk.language,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        content: chunk.content,
        score: normalizedScore,
        lexicalScore: normalizedScore,
        matchType: 'lexical',
      };
    });
  }
}
