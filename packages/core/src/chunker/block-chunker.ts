import type { CodeChunk } from '../types/index.js';
import { createLineRangeChunk } from './chunk-factory.js';
import { CHUNK_BLOCK, CHUNK_FILE } from './constants.js';

interface BlockState {
  currentStart: number;
}

function processUncoveredLine(
  filePath: string,
  language: string,
  lines: string[],
  lineNum: number,
  state: BlockState,
  maxLines: number,
  chunks: CodeChunk[],
): void {
  if (state.currentStart === -1) {
    state.currentStart = lineNum;
  }
  if (lineNum - state.currentStart + 1 >= maxLines) {
    const chunk = createLineRangeChunk(
      filePath,
      language,
      lines,
      state.currentStart,
      lineNum,
      CHUNK_BLOCK,
    );
    if (chunk) chunks.push(chunk);
    state.currentStart = -1;
  }
}

function processCoveredLine(
  filePath: string,
  language: string,
  lines: string[],
  lineNum: number,
  state: BlockState,
  minLines: number,
  chunks: CodeChunk[],
): void {
  if (state.currentStart === -1) return;
  if (lineNum - state.currentStart >= minLines) {
    const chunk = createLineRangeChunk(
      filePath,
      language,
      lines,
      state.currentStart,
      lineNum - 1,
      CHUNK_BLOCK,
    );
    if (chunk) chunks.push(chunk);
  }
  state.currentStart = -1;
}

function flushTrailingBlock(
  filePath: string,
  language: string,
  lines: string[],
  start: number,
  minLines: number,
  isFile: boolean,
  chunks: CodeChunk[],
): void {
  if (start === -1) return;
  const blockLines = lines.length - start + 1;
  if (blockLines >= minLines || isFile) {
    const chunkType = isFile ? CHUNK_FILE : CHUNK_BLOCK;
    const chunk = createLineRangeChunk(filePath, language, lines, start, lines.length, chunkType);
    if (chunk) chunks.push(chunk);
  }
}

export function chunkUncoveredBlocks(
  filePath: string,
  language: string,
  lines: string[],
  coveredLines: Set<number>,
  options: { maxLinesPerChunk: number; minLinesPerChunk: number },
  existingChunkCount: number,
): CodeChunk[] {
  const chunks: CodeChunk[] = [];
  const state: BlockState = { currentStart: -1 };

  for (let i = 1; i <= lines.length; i++) {
    if (!coveredLines.has(i)) {
      processUncoveredLine(filePath, language, lines, i, state, options.maxLinesPerChunk, chunks);
    } else {
      processCoveredLine(filePath, language, lines, i, state, options.minLinesPerChunk, chunks);
    }
  }

  const isFile = existingChunkCount === 0 && chunks.length === 0;
  flushTrailingBlock(
    filePath,
    language,
    lines,
    state.currentStart,
    options.minLinesPerChunk,
    isFile,
    chunks,
  );

  return chunks;
}
