import type { CodeChunk, CodeSymbol } from '../types/index.js';
import { chunkUncoveredBlocks } from './block-chunker.js';
import { createLineRangeChunk } from './chunk-factory.js';
import { CHUNK_FILE } from './constants.js';
import { computeSemanticHash } from './semantic-hash.js';
import { chunkSymbols } from './symbol-chunker.js';

export interface ChunkerOptions {
  maxLinesPerChunk?: number;
  minLinesPerChunk?: number;
}

export class SemanticChunker {
  private options: Required<ChunkerOptions>;

  constructor(options: ChunkerOptions = {}) {
    this.options = {
      maxLinesPerChunk: options.maxLinesPerChunk ?? 120,
      minLinesPerChunk: options.minLinesPerChunk ?? 3,
    };
  }

  public chunk(
    filePath: string,
    language: string,
    content: string,
    symbols: CodeSymbol[],
  ): CodeChunk[] {
    const lines = content.split('\n');
    if (lines.length === 0) return [];

    const coveredLines = new Set<number>();
    const chunks = chunkSymbols(
      filePath,
      language,
      lines,
      symbols,
      coveredLines,
      this.options.maxLinesPerChunk,
    );

    const blockChunks = chunkUncoveredBlocks(
      filePath,
      language,
      lines,
      coveredLines,
      this.options,
      chunks.length,
    );
    chunks.push(...blockChunks);

    if (chunks.length === 0 && lines.length > 0) {
      const fallback = createLineRangeChunk(filePath, language, lines, 1, lines.length, CHUNK_FILE);
      if (fallback) chunks.push(fallback);
    }

    return chunks;
  }

  public computeSemanticHash(code: string, symbolName: string = '', language: string = ''): string {
    return computeSemanticHash(code, symbolName, language);
  }
}
