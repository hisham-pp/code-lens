import type {
  FileInfo,
  CodeSymbol,
  CodeChunk,
  Dependency,
  GraphEdge,
  GitState,
  IndexStorage,
} from '@code-lense/core';
import { SQLiteDatabase, type DatabaseOptions } from './connection/index.js';
import { MigrationRunner } from './migrations/index.js';
import {
  FileStore,
  SymbolStore,
  ChunkStore,
  DependencyStore,
  GitStore,
  GraphStore,
} from './repositories/index.js';
import { SQLiteVectorStore } from './vector/index.js';

export * from './connection/index.js';
export * from './migrations/index.js';
export * from './vector/index.js';
export * from './repositories/index.js';

export class RepositoryDatabase implements IndexStorage {
  public readonly db: SQLiteDatabase;
  public readonly files: FileStore;
  public readonly symbols: SymbolStore;
  public readonly chunks: ChunkStore;
  public readonly dependencies: DependencyStore;
  public readonly git: GitStore;
  public readonly graph: GraphStore;
  public readonly vectors: SQLiteVectorStore;

  constructor(
    dbPath: string,
    public readonly repositoryId: string,
    options: DatabaseOptions = {},
  ) {
    this.db = new SQLiteDatabase(dbPath, options);
    MigrationRunner.migrateToLatest(this.db);

    const initRepoStmt = this.db.prepare(`
      INSERT OR IGNORE INTO repositories (id, name, root_path, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const now = Date.now();
    initRepoStmt.run(repositoryId, repositoryId, dbPath, now, now);

    this.files = new FileStore(this.db, repositoryId);
    this.symbols = new SymbolStore(this.db, repositoryId);
    this.chunks = new ChunkStore(this.db, repositoryId);
    this.dependencies = new DependencyStore(this.db, repositoryId);
    this.git = new GitStore(this.db, repositoryId);
    this.graph = new GraphStore(this.db, repositoryId);
    this.vectors = new SQLiteVectorStore(this.db, repositoryId);
  }

  // IndexStorage contract implementation
  public findFileByRelativePath(relativePath: string): FileInfo | null {
    return this.files.findByRelativePath(relativePath);
  }

  public findAllFiles(): FileInfo[] {
    return this.files.findAll();
  }

  public saveFiles(files: FileInfo[]): number[] {
    return this.files.saveBatch(files);
  }

  public deleteFilesByPaths(paths: string[]): void {
    this.files.deleteByPaths(paths);
  }

  public saveSymbols(symbols: CodeSymbol[], fileId: number): void {
    this.symbols.saveBatch(symbols, fileId);
  }

  public saveChunks(chunks: CodeChunk[], fileId: number): void {
    this.chunks.saveBatch(chunks, fileId);
  }

  public saveDependencies(deps: Dependency[]): void {
    this.dependencies.saveBatch(deps);
  }

  public saveGraphEdges(edges: GraphEdge[]): void {
    this.graph.saveEdges(edges);
  }

  public saveGitState(state: GitState): void {
    this.git.saveState(state);
  }

  public findChunkByHash(hash: string): CodeChunk | null {
    return this.chunks.findByHash(hash);
  }

  public transaction<T>(fn: () => T): T {
    return this.db.transaction(fn);
  }

  public getSchemaVersion(): number {
    return MigrationRunner.getCurrentVersion(this.db);
  }

  public close(): void {
    this.db.close();
  }
}
