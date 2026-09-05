import type { CodeSymbol, SymbolType } from '../types/index.js';
import {
  KIND_COMPONENT,
  KIND_FUNCTION,
  KIND_HOOK,
  KIND_METHOD,
  LANG_JSX,
  LANG_TSX,
  PREFIX_USE,
} from './constants.js';
import { findMatchingBraceEnd, makeSymbolId } from './utils.js';

export function resolveFunctionType(name: string, language: string): SymbolType {
  const isHook =
    name.startsWith(PREFIX_USE) && name.length > 3 && name[3] === name[3]?.toUpperCase();
  if (isHook) return KIND_HOOK;
  const isComponent =
    name.length > 0 &&
    name[0] === name[0]?.toUpperCase() &&
    (language === LANG_TSX || language === LANG_JSX);
  if (isComponent) return KIND_COMPONENT;
  return KIND_FUNCTION;
}

export function matchMethod(
  trimmed: string,
  filePath: string,
  lineNum: number,
  lines: string[],
  lineIndex: number,
  currentClassId: string,
): CodeSymbol | null {
  const match = trimmed.match(
    /^(?:public\s+|private\s+|protected\s+|static\s+|async\s+)*(?:get\s+|set\s+)?([A-Za-z0-9_$]+)\s*\(([^)]*)\)(?::\s*([^{;]+))?/,
  );
  if (!match || !match[1] || ['if', 'for', 'while', 'switch', 'catch'].includes(match[1])) {
    return null;
  }
  return {
    id: makeSymbolId(filePath, match[1], KIND_METHOD, lineNum),
    filePath,
    name: match[1],
    type: KIND_METHOD,
    parentId: currentClassId,
    startLine: lineNum,
    endLine: findMatchingBraceEnd(lines, lineIndex),
    startByte: 0,
    endByte: 0,
    signature: trimmed.split('{')[0]?.trim(),
  };
}

export function matchFunction(
  trimmed: string,
  filePath: string,
  lineNum: number,
  lines: string[],
  lineIndex: number,
  language: string,
): CodeSymbol | null {
  const funcMatch = trimmed.match(
    /^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*([A-Za-z0-9_$]*)\s*\(([^)]*)\)(?::\s*([^{;]+))?/,
  );
  if (funcMatch) {
    const name = funcMatch[1] || 'anonymous';
    const type = resolveFunctionType(name, language);
    return {
      id: makeSymbolId(filePath, name, type, lineNum),
      filePath,
      name,
      type,
      startLine: lineNum,
      endLine: findMatchingBraceEnd(lines, lineIndex),
      startByte: 0,
      endByte: 0,
      signature: trimmed.split('{')[0]?.trim(),
    };
  }

  const constMatch = trimmed.match(
    /^(?:export\s+)?(?:const|let)\s+([A-Za-z0-9_$]+)(?:\s*:\s*([^=]+))?\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>/,
  );
  if (constMatch && constMatch[1]) {
    const name = constMatch[1];
    const type = resolveFunctionType(name, language);
    return {
      id: makeSymbolId(filePath, name, type, lineNum),
      filePath,
      name,
      type,
      startLine: lineNum,
      endLine: findMatchingBraceEnd(lines, lineIndex),
      startByte: 0,
      endByte: 0,
      signature: trimmed.split('{')[0]?.trim(),
    };
  }

  return null;
}
