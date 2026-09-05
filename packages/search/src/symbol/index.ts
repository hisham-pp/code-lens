import type { SearchResult, CodeSymbol } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';

export class SymbolSearchEngine {
  constructor(private db: RepositoryDatabase) {}

  public search(query: string, limit: number = 20): SearchResult[] {
    const symbols = this.db.symbols.searchFTS(query, limit);
    return symbols.map((sym, idx) => {
      const score = 1.0 - idx * 0.05;
      return {
        chunkId: `sym_${sym.id}`,
        filePath: sym.filePath,
        symbolName: sym.name,
        symbolType: sym.type,
        language: '',
        startLine: sym.startLine,
        endLine: sym.endLine,
        content: sym.signature || sym.name,
        score: Math.max(0.1, score),
        symbolScore: Math.max(0.1, score),
        matchType: 'symbol',
      };
    });
  }

  public findByName(name: string): CodeSymbol[] {
    return this.db.symbols.findByName(name);
  }
}
