import * as crypto from 'node:crypto';
import type { CodeChunk, CodeSymbol } from '../types/index.js';
import { CHUNK_SYMBOL, HASH_HEX } from './constants.js';
import { computeSemanticHash } from './semantic-hash.js';

export function createSymbolChunk(
  filePath: string,
  language: string,
  lines: string[],
  symbol: CodeSymbol,
): CodeChunk | null {
  const startIdx = Math.max(0, symbol.startLine - 1);
  const endIdx = Math.min(lines.length, symbol.endLine);
  const code = lines.slice(startIdx, endIdx).join('\n');
  if (!code.trim()) return null;

  const hash = computeSemanticHash(code, symbol.name, language);
  const chunkId = crypto
    .createHash('sha1')
    .update(`${filePath}:${symbol.name}:${symbol.startLine}:${hash}`)
    .digest(HASH_HEX)
    .slice(0, 20);

  return {
    id: chunkId,
    filePath,
    symbolId: symbol.id,
    symbolName: symbol.name,
    parentSymbolId: symbol.parentId,
    startLine: symbol.startLine,
    endLine: symbol.endLine,
    startByte: symbol.startByte,
    endByte: symbol.endByte,
    chunkType: CHUNK_SYMBOL,
    content: code,
    hash,
    language,
  };
}

export function createLineRangeChunk(
  filePath: string,
  language: string,
  lines: string[],
  startLine: number,
  endLine: number,
  chunkType: 'symbol' | 'block' | 'file',
  symbolName?: string,
  symbolId?: string,
): CodeChunk | null {
  const startIdx = Math.max(0, startLine - 1);
  const endIdx = Math.min(lines.length, endLine);
  const code = lines.slice(startIdx, endIdx).join('\n');
  if (!code.trim()) return null;

  const hash = computeSemanticHash(code, symbolName, language);
  const chunkId = crypto
    .createHash('sha1')
    .update(`${filePath}:${startLine}:${endLine}:${hash}`)
    .digest(HASH_HEX)
    .slice(0, 20);

  return {
    id: chunkId,
    filePath,
    symbolId,
    symbolName,
    startLine,
    endLine,
    startByte: 0,
    endByte: 0,
    chunkType,
    content: code,
    hash,
    language,
  };
}
