import type { CodeSymbol, SymbolType } from '../types/index.js';
import { KIND_CLASS, KIND_FUNCTION, KIND_METHOD } from './constants.js';
import { extractPythonImports } from './python-imports.js';
import type { ExtractedCodeData } from './types.js';
import { findPythonBlockEnd, makeSymbolId } from './utils.js';

function matchPythonClass(
  trimmed: string,
  filePath: string,
  lineNum: number,
  lines: string[],
  lineIndex: number,
  indent: number,
): { symbol: CodeSymbol; classId: string; indent: number } | null {
  const match = trimmed.match(/^class\s+([A-Za-z0-9_]+)(?:\(([^)]*)\))?:/);
  if (!match || !match[1]) return null;

  const symbolId = makeSymbolId(filePath, match[1], KIND_CLASS, lineNum);
  return {
    symbol: {
      id: symbolId,
      filePath,
      name: match[1],
      type: KIND_CLASS,
      startLine: lineNum,
      endLine: findPythonBlockEnd(lines, lineIndex, indent),
      startByte: 0,
      endByte: 0,
      signature: trimmed,
    },
    classId: symbolId,
    indent,
  };
}

function matchPythonFunc(
  trimmed: string,
  filePath: string,
  lineNum: number,
  lines: string[],
  lineIndex: number,
  indent: number,
  currentClassId?: string,
): CodeSymbol | null {
  const match = trimmed.match(
    /^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/,
  );
  if (!match || !match[1]) return null;

  const type: SymbolType = currentClassId ? KIND_METHOD : KIND_FUNCTION;
  return {
    id: makeSymbolId(filePath, match[1], type, lineNum),
    filePath,
    name: match[1],
    type,
    parentId: currentClassId,
    startLine: lineNum,
    endLine: findPythonBlockEnd(lines, lineIndex, indent),
    startByte: 0,
    endByte: 0,
    signature: trimmed,
  };
}

function extractPythonSymbols(lines: string[], filePath: string): CodeSymbol[] {
  const symbols: CodeSymbol[] = [];
  let currentClassId: string | undefined;
  let currentClassIndent = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;
    const lineNum = i + 1;

    if (currentClassId && indent <= currentClassIndent) {
      currentClassId = undefined;
      currentClassIndent = -1;
    }

    const cls = matchPythonClass(trimmed, filePath, lineNum, lines, i, indent);
    if (cls) {
      symbols.push(cls.symbol);
      currentClassId = cls.classId;
      currentClassIndent = cls.indent;
      continue;
    }

    const fn = matchPythonFunc(trimmed, filePath, lineNum, lines, i, indent, currentClassId);
    if (fn) symbols.push(fn);
  }

  return symbols;
}

export function extractPython(
  filePath: string,
  _language: string,
  content: string,
): ExtractedCodeData {
  const dependencies = extractPythonImports(content, filePath);
  const symbols = extractPythonSymbols(content.split('\n'), filePath);
  return { symbols, dependencies };
}
