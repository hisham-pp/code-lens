import type { CodeSymbol } from '../types/index.js';
import { KIND_CONSTANT, KIND_VARIABLE } from './constants.js';
import { makeSymbolId } from './utils.js';

export function matchVariable(
  trimmed: string,
  filePath: string,
  lineNum: number,
): CodeSymbol | null {
  const varMatch = trimmed.match(
    /^export\s+(?:const|let)\s+([A-Za-z0-9_$]+)(?:\s*:\s*([^=]+))?\s*=/,
  );
  if (!varMatch || !varMatch[1]) return null;

  const isConst = trimmed.startsWith('export const');
  const type = isConst ? KIND_CONSTANT : KIND_VARIABLE;
  return {
    id: makeSymbolId(filePath, varMatch[1], type, lineNum),
    filePath,
    name: varMatch[1],
    type,
    startLine: lineNum,
    endLine: lineNum,
    startByte: 0,
    endByte: 0,
    signature: trimmed.slice(0, 100),
  };
}
