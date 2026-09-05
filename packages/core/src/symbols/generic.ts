import type { CodeSymbol, Dependency } from '../types/index.js';
import { KIND_CLASS, KIND_FUNCTION, KIND_INTERFACE } from './constants.js';
import type { ExtractedCodeData } from './types.js';
import { makeSymbolId } from './utils.js';

export function extractGeneric(
  filePath: string,
  _language: string,
  content: string,
): ExtractedCodeData {
  const symbols: CodeSymbol[] = [];
  const dependencies: Dependency[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    const lineNum = i + 1;

    const classMatch = line.match(/\b(class|interface)\s+([A-Za-z0-9_]+)/);
    if (classMatch && classMatch[1] && classMatch[2]) {
      const isIface = classMatch[1] === KIND_INTERFACE;
      const type = isIface ? KIND_INTERFACE : KIND_CLASS;
      symbols.push({
        id: makeSymbolId(filePath, classMatch[2], type, lineNum),
        filePath,
        name: classMatch[2],
        type,
        startLine: lineNum,
        endLine: Math.min(lineNum + 50, lines.length),
        startByte: 0,
        endByte: 0,
        signature: line.split('{')[0]?.trim(),
      });
      continue;
    }

    const funcMatch = line.match(/\b(?:function|def|fn)\s+([A-Za-z0-9_]+)\s*\(/);
    if (funcMatch && funcMatch[1]) {
      symbols.push({
        id: makeSymbolId(filePath, funcMatch[1], KIND_FUNCTION, lineNum),
        filePath,
        name: funcMatch[1],
        type: KIND_FUNCTION,
        startLine: lineNum,
        endLine: Math.min(lineNum + 30, lines.length),
        startByte: 0,
        endByte: 0,
        signature: line.split('{')[0]?.trim(),
      });
    }
  }

  return { symbols, dependencies };
}
