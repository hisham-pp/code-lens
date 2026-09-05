export interface RankingWeights {
  lexical: number;
  semantic: number;
  symbol: number;
  path: number;
  graph: number;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  lexical: 0.35,
  semantic: 0.35,
  symbol: 0.15,
  path: 0.1,
  graph: 0.05,
};
