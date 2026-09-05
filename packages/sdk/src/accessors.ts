import type { CodeSymbol, FileInfo } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';

export function createSymbolsAccessor(db: RepositoryDatabase) {
  return {
    find: (name: string): CodeSymbol[] => db.symbols.findByName(name),
    search: (query: string, limit?: number): CodeSymbol[] => db.symbols.searchFTS(query, limit),
    count: (): number => db.symbols.count(),
  };
}

export function createFilesAccessor(db: RepositoryDatabase) {
  return {
    find: (relativePath: string): FileInfo | null => db.files.findByRelativePath(relativePath),
    list: (): FileInfo[] => db.files.findAll(),
    count: (): number => db.files.count(),
  };
}

export function createGraphAccessor(db: RepositoryDatabase) {
  return {
    dependencies: (pathOrId: string) => db.graph.getDependencies(pathOrId),
    dependents: (pathOrId: string) => db.graph.getDependents(pathOrId),
    count: (): number => db.graph.count(),
  };
}
