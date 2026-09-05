import type { CodeSymbol, Dependency } from '../types/index.js';
import { KIND_FUNCTION, KIND_INTERFACE, KIND_METHOD, KIND_TYPE } from './constants.js';
import type { ExtractedCodeData } from './types.js';
import { findMatchingBraceEnd, makeSymbolId } from './utils.js';

function extractGoImports(lines: string[], filePath: string): Dependency[] {
  const dependencies: Dependency[] = [];
  let inImportBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === 'import (') {
      inImportBlock = true;
      continue;
    }
    if (inImportBlock && line === ')') {
      inImportBlock = false;
      continue;
    }
    if (inImportBlock && line.startsWith('"')) {
      dependencies.push({
        sourceFilePath: filePath,
        specifier: line.replace(/["']/g, '').trim(),
        importedSymbols: [],
        isDynamic: false,
        isTypeOnly: false,
      });
    } else if (line.startsWith('import "') || line.startsWith('import `')) {
      dependencies.push({
        sourceFilePath: filePath,
        specifier: line.replace(/^import\s+["`]|["`]$/g, '').trim(),
        importedSymbols: [],
        isDynamic: false,
        isTypeOnly: false,
      });
    }
  }

  return dependencies;
}

function extractGoSymbols(lines: string[], filePath: string): CodeSymbol[] {
  const symbols: CodeSymbol[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    const lineNum = i + 1;

    const typeMatch = line.match(/^type\s+([A-Za-z0-9_]+)\s+(struct|interface)\b/);
    if (typeMatch && typeMatch[1] && typeMatch[2]) {
      const isIface = typeMatch[2] === KIND_INTERFACE;
      const type = isIface ? KIND_INTERFACE : KIND_TYPE;
      symbols.push({
        id: makeSymbolId(filePath, typeMatch[1], type, lineNum),
        filePath,
        name: typeMatch[1],
        type,
        startLine: lineNum,
        endLine: findMatchingBraceEnd(lines, i),
        startByte: 0,
        endByte: 0,
        signature: line.split('{')[0]?.trim(),
      });
      continue;
    }

    const methodMatch = line.match(/^func\s+\((?:[A-Za-z0-9_*\s]+)\)\s+([A-Za-z0-9_]+)\s*\(/);
    if (methodMatch && methodMatch[1]) {
      symbols.push({
        id: makeSymbolId(filePath, methodMatch[1], KIND_METHOD, lineNum),
        filePath,
        name: methodMatch[1],
        type: KIND_METHOD,
        startLine: lineNum,
        endLine: findMatchingBraceEnd(lines, i),
        startByte: 0,
        endByte: 0,
        signature: line.split('{')[0]?.trim(),
      });
      continue;
    }

    const funcMatch = line.match(/^func\s+([A-Za-z0-9_]+)\s*\(/);
    if (funcMatch && funcMatch[1]) {
      symbols.push({
        id: makeSymbolId(filePath, funcMatch[1], KIND_FUNCTION, lineNum),
        filePath,
        name: funcMatch[1],
        type: KIND_FUNCTION,
        startLine: lineNum,
        endLine: findMatchingBraceEnd(lines, i),
        startByte: 0,
        endByte: 0,
        signature: line.split('{')[0]?.trim(),
      });
    }
  }

  return symbols;
}

export function extractGo(filePath: string, _language: string, content: string): ExtractedCodeData {
  const lines = content.split('\n');
  return {
    symbols: extractGoSymbols(lines, filePath),
    dependencies: extractGoImports(lines, filePath),
  };
}
