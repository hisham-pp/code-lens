import type { SearchResult, SearchOptions, EmbeddingProvider } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';
import { LexicalSearchEngine } from '../lexical/index.js';
import { SearchRanker, DEFAULT_RANKING_WEIGHTS, type RankingWeights } from '../ranking/index.js';
import { SemanticSearchEngine } from '../semantic/index.js';
import { SymbolSearchEngine } from '../symbol/index.js';

export class HybridSearchEngine {
  public lexical: LexicalSearchEngine;
  public symbol: SymbolSearchEngine;
  public semantic: SemanticSearchEngine;

  constructor(db: RepositoryDatabase, embeddingProvider?: EmbeddingProvider) {
    this.lexical = new LexicalSearchEngine(db);
    this.symbol = new SymbolSearchEngine(db);
    this.semantic = new SemanticSearchEngine(db, embeddingProvider);
  }

  /**
   * Execute search based on mode (hybrid, lexical, semantic, symbol).
   */
  public async search(options: SearchOptions): Promise<SearchResult[]> {
    const mode = options.mode || 'hybrid';
    const limit = options.limit || 20;

    switch (mode) {
      case 'lexical':
        return this.lexical.search(options.query, limit, {
          language: options.language,
          filePath: options.filePath,
        });

      case 'symbol':
        return this.symbol.search(options.query, limit);

      case 'semantic':
        return this.semantic.search(options.query, limit);

      case 'hybrid':
      default:
        return this.searchHybrid(options);
    }
  }

  private async searchHybrid(options: SearchOptions): Promise<SearchResult[]> {
    const limit = options.limit || 20;
    const weights: RankingWeights = {
      ...DEFAULT_RANKING_WEIGHTS,
      ...options.weights,
    };

    // 1. Run parallel searches
    const [lexicalResults, semanticResults, symbolResults] = await Promise.all([
      this.lexical.search(options.query, limit * 2, {
        language: options.language,
        filePath: options.filePath,
      }),
      this.semantic.search(options.query, limit * 2),
      this.symbol.search(options.query, limit),
    ]);

    // Format for RRF
    const lexicalRanking = lexicalResults.map((r) => ({ id: r.chunkId, item: r }));
    const semanticRanking = semanticResults.map((r) => ({ id: r.chunkId, item: r }));
    const symbolRanking = symbolResults.map((r) => ({ id: r.chunkId, item: r }));

    const rrfCandidates = SearchRanker.reciprocalRankFusion([
      lexicalRanking,
      semanticRanking,
      symbolRanking,
    ]);

    // Path matching bonus
    const queryLower = options.query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter(Boolean);

    for (const r of rrfCandidates) {
      const pathLower = r.filePath.toLowerCase();
      let pathMatches = 0;
      for (const t of queryTokens) {
        if (pathLower.includes(t)) pathMatches++;
      }
      r.pathScore = queryTokens.length > 0 ? pathMatches / queryTokens.length : 0;
    }

    // Apply multi-signal ranking
    const finalRanked = SearchRanker.scoreMultiSignal(rrfCandidates, weights);
    return finalRanked.slice(0, limit);
  }
}
