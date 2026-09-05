import type { CodeChunk, CodeSymbol, Dependency, FileInfo, GraphEdge } from './domain.js';
import type { GitState } from './git.js';

export interface IndexStorage {
  findFileByRelativePath(relativePath: string): FileInfo | null;
  findAllFiles(): FileInfo[];
  saveFiles(files: FileInfo[]): number[];
  deleteFilesByPaths(paths: string[]): void;
  saveSymbols(symbols: CodeSymbol[], fileId: number): void;
  saveChunks(chunks: CodeChunk[], fileId: number): void;
  saveDependencies(deps: Dependency[]): void;
  saveGraphEdges(edges: GraphEdge[]): void;
  saveGitState(state: GitState): void;
  findChunkByHash(hash: string): CodeChunk | null;
  transaction<T>(fn: () => T): T;
}

export interface IndexingReport {
  filesScanned: number;
  filesIndexed: number;
  filesSkipped: number;
  filesIgnored: number;
  filesFailed: number;
  symbolsExtracted: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  durationMs: number;
  errors: Array<{ path: string; error: string }>;
}

export interface VectorRecord {
  id: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorStore {
  insert(record: VectorRecord): Promise<void>;
  insertBatch(records: VectorRecord[]): Promise<void>;
  search(embedding: number[], limit: number): Promise<VectorSearchResult[]>;
  delete(ids: string[]): Promise<void>;
  count(): Promise<number>;
  close(): Promise<void>;
}
