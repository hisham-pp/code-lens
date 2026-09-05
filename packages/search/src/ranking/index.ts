import type { SearchResult } from '@code-lense/core';
import { DEFAULT_RANKING_WEIGHTS, type RankingWeights } from './weights.js';

export * from './weights.js';

function mergeEntryScores(existing: SearchResult, entry: SearchResult): void {
  if (entry.lexicalScore !== undefined) {
    existing.lexicalScore = Math.max(existing.lexicalScore || 0, entry.lexicalScore);
  }
  if (entry.semanticScore !== undefined) {
    existing.semanticScore = Math.max(existing.semanticScore || 0, entry.semanticScore);
  }
  if (entry.symbolScore !== undefined) {
    existing.symbolScore = Math.max(existing.symbolScore || 0, entry.symbolScore);
  }
}

export class SearchRanker {
  public static reciprocalRankFusion(
    rankings: Array<Array<{ id: string; item: SearchResult }>>,
    k: number = 60,
  ): SearchResult[] {
    const scoreMap = new Map<string, { item: SearchResult; rrfScore: number }>();

    for (const ranking of rankings) {
      for (let rank = 0; rank < ranking.length; rank++) {
        const entry = ranking[rank]!;
        const existing = scoreMap.get(entry.id);
        const rankScore = 1 / (k + rank + 1);

        if (existing) {
          existing.rrfScore += rankScore;
          mergeEntryScores(existing.item, entry.item);
        } else {
          scoreMap.set(entry.id, {
            item: { ...entry.item },
            rrfScore: rankScore,
          });
        }
      }
    }

    const merged = Array.from(scoreMap.values()).map((val) => {
      val.item.score = val.rrfScore;
      val.item.matchType = 'hybrid';
      return val.item;
    });

    merged.sort((a, b) => b.score - a.score);
    return merged;
  }

  public static scoreMultiSignal(
    results: SearchResult[],
    weights: RankingWeights = DEFAULT_RANKING_WEIGHTS,
  ): SearchResult[] {
    for (const r of results) {
      const lex = r.lexicalScore ?? 0;
      const sem = r.semanticScore ?? 0;
      const sym = r.symbolScore ?? 0;
      const pth = r.pathScore ?? 0;
      const grp = r.graphScore ?? 0;

      r.score =
        lex * weights.lexical +
        sem * weights.semantic +
        sym * weights.symbol +
        pth * weights.path +
        grp * weights.graph;
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }

  public static normalizeScores(scores: number[]): number[] {
    if (scores.length === 0) return [];
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    if (max === min) return scores.map(() => 1.0);
    return scores.map((s) => (s - min) / (max - min));
  }
}
