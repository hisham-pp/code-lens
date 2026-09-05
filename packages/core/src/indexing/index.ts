import { SemanticChunker } from '../chunker/index.js';
import { DependencyResolver } from '../dependencies/index.js';
import { GitIntelligence } from '../git/index.js';
import { DefaultIgnoreMatcher } from '../ignore/index.js';
import { RepositoryScanner } from '../scanner/index.js';
import type { Dependency, FileInfo, IndexStorage, IndexingReport } from '../types/index.js';
import { diffFiles } from './diff-files.js';
import { indexSingleFile } from './index-file.js';

export interface IndexerOptions {
  force?: boolean;
  batchSize?: number;
  onProgress?: (indexed: number, total: number, currentFile: string) => void;
}

function buildAndSaveEdges(
  deps: Dependency[],
  scannedFiles: FileInfo[],
  storage: IndexStorage,
  errors: Array<{ path: string; error: string }>,
) {
  try {
    const allFilesMap = new Map<string, FileInfo>(scannedFiles.map((f) => [f.path, f]));
    const edges = DependencyResolver.buildEdges(deps, allFilesMap);
    if (edges.length > 0) storage.saveGraphEdges(edges);
  } catch (err: unknown) {
    errors.push({
      path: 'dependency-graph',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function recordGitState(rootPath: string, storage: IndexStorage): Promise<void> {
  try {
    const gitState = await GitIntelligence.getState(rootPath);
    storage.saveGitState(gitState);
  } catch {
    // Not a git repo or error
  }
}

export class IncrementalIndexer {
  private chunker: SemanticChunker;

  constructor(
    private rootPath: string,
    private storage: IndexStorage,
    private options: IndexerOptions = {},
  ) {
    this.chunker = new SemanticChunker();
  }

  public async index(): Promise<IndexingReport> {
    const startTime = Date.now();
    const errors: Array<{ path: string; error: string }> = [];

    const ignoreMatcher = await DefaultIgnoreMatcher.loadFromDirectory(this.rootPath);
    const scanner = new RepositoryScanner(this.rootPath, { ignoreMatcher });
    const scannedFiles = await scanner.scan();

    const existingFiles = this.storage.findAllFiles();
    const { addedFiles, modifiedFiles, deletedFiles, skippedCount } = diffFiles(
      scannedFiles,
      existingFiles,
      this.options.force,
    );

    const pathsToRemove = [...deletedFiles, ...modifiedFiles.map((f) => f.relativePath)];
    if (pathsToRemove.length > 0) {
      this.storage.deleteFilesByPaths(pathsToRemove);
    }

    const toIndex = [...addedFiles, ...modifiedFiles];
    let totalSymbols = 0;
    let totalChunks = 0;
    const allDeps: Dependency[] = [];

    for (let i = 0; i < toIndex.length; i++) {
      const file = toIndex[i]!;
      if (this.options.onProgress) {
        this.options.onProgress(i + 1, toIndex.length, file.relativePath);
      }
      const res = await indexSingleFile(file, this.storage, this.chunker);
      if (res.error) errors.push(res.error);
      totalSymbols += res.symbolsCount;
      totalChunks += res.chunksCount;
      allDeps.push(...res.dependencies);
    }

    buildAndSaveEdges(allDeps, scannedFiles, this.storage, errors);
    await recordGitState(this.rootPath, this.storage);

    return {
      filesScanned: scannedFiles.length,
      filesIndexed: toIndex.length - errors.length,
      filesSkipped: skippedCount,
      filesIgnored: 0,
      filesFailed: errors.length,
      symbolsExtracted: totalSymbols,
      chunksCreated: totalChunks,
      embeddingsGenerated: 0,
      durationMs: Date.now() - startTime,
      errors,
    };
  }
}
