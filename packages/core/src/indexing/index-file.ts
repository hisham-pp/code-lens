import * as fs from 'node:fs/promises';
import type { SemanticChunker } from '../chunker/index.js';
import { SymbolExtractor } from '../symbols/index.js';
import type { Dependency, FileInfo, IndexStorage } from '../types/index.js';

export interface IndexFileResult {
  symbolsCount: number;
  chunksCount: number;
  dependencies: Dependency[];
  error?: { path: string; error: string };
}

export async function indexSingleFile(
  file: FileInfo,
  storage: IndexStorage,
  chunker: SemanticChunker,
): Promise<IndexFileResult> {
  if (file.isBinary) {
    storage.saveFiles([file]);
    return { symbolsCount: 0, chunksCount: 0, dependencies: [] };
  }

  try {
    const content = await fs.readFile(file.path, 'utf-8');
    const { symbols, dependencies } = SymbolExtractor.extract(
      file.relativePath,
      file.language,
      content,
    );
    const chunks = chunker.chunk(file.relativePath, file.language, content, symbols);

    storage.transaction(() => {
      const [fileId] = storage.saveFiles([file]);
      if (fileId) {
        if (symbols.length > 0) storage.saveSymbols(symbols, fileId);
        if (chunks.length > 0) storage.saveChunks(chunks, fileId);
        if (dependencies.length > 0) storage.saveDependencies(dependencies);
      }
    });

    return {
      symbolsCount: symbols.length,
      chunksCount: chunks.length,
      dependencies,
    };
  } catch (err: unknown) {
    return {
      symbolsCount: 0,
      chunksCount: 0,
      dependencies: [],
      error: {
        path: file.relativePath,
        error: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
