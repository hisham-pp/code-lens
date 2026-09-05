import type { CodeSymbol } from '../types/index.js';
import { KIND_CLASS, KIND_ENUM, KIND_INTERFACE, KIND_TYPE } from './constants.js';
import { findMatchingBraceEnd, makeSymbolId } from './utils.js';

export function matchClass(
  trimmed: string,
  filePath: string,
  lineNum: number,
  lines: string[],
  lineIndex: number,
): { symbol: CodeSymbol; classId: string } | null {
  const match = trimmed.match(
    /^(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_$]+)(?:<[^>]+>)?(?:\s+extends\s+[A-Za-z0-9_$.]+)?(?:\s+implements\s+[A-Za-z0-9_$,\s]+)?/,
  );
  if (!match || !match[1]) return null;

  const name = match[1];
  const endLine = findMatchingBraceEnd(lines, lineIndex);
  const symbolId = makeSymbolId(filePath, name, KIND_CLASS, lineNum);

  return {
    symbol: {
      id: symbolId,
      filePath,
      name,
      type: KIND_CLASS,
      startLine: lineNum,
      endLine,
      startByte: 0,
      endByte: 0,
      signature: trimmed.split('{')[0]?.trim(),
    },
    classId: symbolId,
  };
}

export function matchInterface(
  trimmed: string,
  filePath: string,
  lineNum: number,
  lines: string[],
  lineIndex: number,
): CodeSymbol | null {
  const match = trimmed.match(
    /^(?:export\s+)?interface\s+([A-Za-z0-9_$]+)(?:<[^>]+>)?(?:\s+extends\s+[A-Za-z0-9_$,\s]+)?/,
  );
  if (!match || !match[1]) return null;

  return {
    id: makeSymbolId(filePath, match[1], KIND_INTERFACE, lineNum),
    filePath,
    name: match[1],
    type: KIND_INTERFACE,
    startLine: lineNum,
    endLine: findMatchingBraceEnd(lines, lineIndex),
    startByte: 0,
    endByte: 0,
    signature: trimmed.split('{')[0]?.trim(),
  };
}

export function matchTypeOrEnum(
  trimmed: string,
  filePath: string,
  lineNum: number,
  lines: string[],
  lineIndex: number,
): CodeSymbol | null {
  const typeMatch = trimmed.match(/^(?:export\s+)?type\s+([A-Za-z0-9_$]+)(?:<[^>]+>)?\s*=/);
  if (typeMatch && typeMatch[1]) {
    return {
      id: makeSymbolId(filePath, typeMatch[1], KIND_TYPE, lineNum),
      filePath,
      name: typeMatch[1],
      type: KIND_TYPE,
      startLine: lineNum,
      endLine: lineNum,
      startByte: 0,
      endByte: 0,
      signature: trimmed,
    };
  }

  const enumMatch = trimmed.match(/^(?:export\s+)?(?:const\s+)?enum\s+([A-Za-z0-9_$]+)/);
  if (enumMatch && enumMatch[1]) {
    return {
      id: makeSymbolId(filePath, enumMatch[1], KIND_ENUM, lineNum),
      filePath,
      name: enumMatch[1],
      type: KIND_ENUM,
      startLine: lineNum,
      endLine: findMatchingBraceEnd(lines, lineIndex),
      startByte: 0,
      endByte: 0,
      signature: trimmed.split('{')[0]?.trim(),
    };
  }

  return null;
}
