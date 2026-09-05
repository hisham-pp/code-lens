import type { CodeSymbol, SearchResult } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';
import type { HybridSearchEngine } from '@code-lense/search';
import { formatDependencies, formatGitState, formatSnippets, formatSymbols } from './formatter.js';
import type { AssembledContext, ContextBuilderOptions } from './types.js';

export * from './types.js';

function collectParentSymbol(
  db: RepositoryDatabase,
  s: CodeSymbol,
  seenSymbols: Set<string>,
): CodeSymbol | null {
  if (!s.parentId) return null;
  const parentStmt = db.db.prepare('SELECT * FROM symbols WHERE id = ?');
  const row = parentStmt.get(s.parentId) as Record<string, unknown> | undefined;
  if (!row || seenSymbols.has(String(row['id']))) return null;

  seenSymbols.add(String(row['id']));
  return {
    id: String(row['id']),
    fileId: Number(row['file_id']),
    filePath: s.filePath,
    name: String(row['name']),
    type: row['type'] as CodeSymbol['type'],
    startLine: Number(row['start_line']),
    endLine: Number(row['end_line']),
    startByte: 0,
    endByte: 0,
    signature: row['signature'] ? String(row['signature']) : undefined,
  };
}

function collectSymbolsForResults(db: RepositoryDatabase, results: SearchResult[]): CodeSymbol[] {
  const seen = new Set<string>();
  const related: CodeSymbol[] = [];
  for (const res of results) {
    if (!res.symbolName) continue;
    for (const s of db.symbols.findByName(res.symbolName)) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        related.push(s);
        const parent = collectParentSymbol(db, s, seen);
        if (parent) related.push(parent);
      }
    }
  }
  return related;
}

function collectDependencies(db: RepositoryDatabase, results: SearchResult[]): string[] {
  const deps: string[] = [];
  for (const res of results) {
    for (const e of db.graph.getDependencies(res.filePath)) {
      deps.push(`${res.filePath} --[${e.relation}]--> ${e.targetId}`);
    }
  }
  return deps;
}

export class ContextBuilder {
  private maxCharacters: number;
  private maxChunks: number;

  constructor(
    private searchEngine: HybridSearchEngine,
    private db: RepositoryDatabase,
    options: ContextBuilderOptions = {},
  ) {
    this.maxCharacters = options.maxCharacters ?? 24000;
    this.maxChunks = options.maxChunks ?? 8;
  }

  public async buildContext(query: string): Promise<AssembledContext> {
    const searchResults = await this.searchEngine.search({
      query,
      mode: 'hybrid',
      limit: this.maxChunks,
    });

    const relatedSymbols = collectSymbolsForResults(this.db, searchResults);
    const dependencyInfo = collectDependencies(this.db, searchResults);

    const sections = [
      ...formatSnippets(searchResults),
      ...formatSymbols(relatedSymbols),
      ...formatDependencies(dependencyInfo),
      ...formatGitState(this.db.git.getState()),
    ];

    let assembled = sections.join('\n\n');
    if (assembled.length > this.maxCharacters) {
      assembled =
        assembled.slice(0, this.maxCharacters) + '\n\n[...context truncated due to length...]';
    }

    return {
      contextText: assembled,
      sources: searchResults,
      relatedSymbols,
      gitState: this.db.git.getState(),
    };
  }
}
