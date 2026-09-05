import type { CodeChunk, CodeSymbol } from '../types/index.js';
import { createLineRangeChunk, createSymbolChunk } from './chunk-factory.js';
import { CHUNK_SYMBOL } from './constants.js';

function markLinesCovered(start: number, end: number, coveredLines: Set<number>): void {
  for (let l = start; l <= end; l++) {
    coveredLines.add(l);
  }
}

function handleContainerSymbol(
  filePath: string,
  language: string,
  lines: string[],
  sym: CodeSymbol,
  allSymbols: CodeSymbol[],
  coveredLines: Set<number>,
  maxLines: number,
): CodeChunk | null {
  const symLines = sym.endLine - sym.startLine + 1;
  const hasChildren = allSymbols.some((child) => child.parentId === sym.id);

  if (symLines <= maxLines && !hasChildren) {
    const chunk = createSymbolChunk(filePath, language, lines, sym);
    if (chunk) markLinesCovered(sym.startLine, sym.endLine, coveredLines);
    return chunk;
  }

  const headerEndLine = Math.min(sym.startLine + 15, sym.endLine);
  const chunk = createLineRangeChunk(
    filePath,
    language,
    lines,
    sym.startLine,
    headerEndLine,
    CHUNK_SYMBOL,
    sym.name,
    sym.id,
  );
  if (chunk) markLinesCovered(sym.startLine, headerEndLine, coveredLines);
  return chunk;
}

function chunkOtherSymbols(
  filePath: string,
  language: string,
  lines: string[],
  others: CodeSymbol[],
  coveredLines: Set<number>,
  chunks: CodeChunk[],
): void {
  for (const sym of others) {
    if (!coveredLines.has(sym.startLine)) {
      const chunk = createSymbolChunk(filePath, language, lines, sym);
      if (chunk) {
        chunks.push(chunk);
        markLinesCovered(sym.startLine, sym.endLine, coveredLines);
      }
    }
  }
}

export function chunkSymbols(
  filePath: string,
  language: string,
  lines: string[],
  symbols: CodeSymbol[],
  coveredLines: Set<number>,
  maxLines: number,
): CodeChunk[] {
  const chunks: CodeChunk[] = [];
  const methods = symbols.filter(
    (s) =>
      s.type === 'method' || s.type === 'function' || s.type === 'hook' || s.type === 'component',
  );
  const containers = symbols.filter(
    (s) => s.type === 'class' || s.type === 'interface' || s.type === 'enum',
  );
  const others = symbols.filter((s) => !methods.includes(s) && !containers.includes(s));

  for (const sym of methods) {
    const chunk = createSymbolChunk(filePath, language, lines, sym);
    if (chunk) {
      chunks.push(chunk);
      markLinesCovered(sym.startLine, sym.endLine, coveredLines);
    }
  }

  for (const sym of containers) {
    const chunk = handleContainerSymbol(
      filePath,
      language,
      lines,
      sym,
      symbols,
      coveredLines,
      maxLines,
    );
    if (chunk) chunks.push(chunk);
  }

  chunkOtherSymbols(filePath, language, lines, others, coveredLines, chunks);
  return chunks;
}
