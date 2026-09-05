import type { CodeSymbol, Dependency, SymbolType } from '../types/index.js';
import { KIND_ENUM, KIND_FUNCTION, KIND_INTERFACE, KIND_TYPE } from './constants.js';
import type { ExtractedCodeData } from './types.js';
import { findMatchingBraceEnd, makeSymbolId } from './utils.js';

function extractRustDependencies(lines: string[], filePath: string): Dependency[] {
  const dependencies: Dependency[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('use ')) {
      dependencies.push({
        sourceFilePath: filePath,
        specifier: line.replace(/^use\s+|;$/g, '').trim(),
        importedSymbols: [],
        isDynamic: false,
        isTypeOnly: false,
      });
    }
  }
  return dependencies;
}

function extractRustSymbols(lines: string[], filePath: string): CodeSymbol[] {
  const symbols: CodeSymbol[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    const lineNum = i + 1;

    const structMatch = line.match(
      /^(?:pub(?:\([^)]*\))?\s+)?(struct|enum|trait)\s+([A-Za-z0-9_]+)/,
    );
    if (structMatch && structMatch[1] && structMatch[2]) {
      const kind = structMatch[1];
      const name = structMatch[2];
      const symType: SymbolType =
        kind === 'trait' ? KIND_INTERFACE : kind === KIND_ENUM ? KIND_ENUM : KIND_TYPE;
      symbols.push({
        id: makeSymbolId(filePath, name, symType, lineNum),
        filePath,
        name,
        type: symType,
        startLine: lineNum,
        endLine: findMatchingBraceEnd(lines, i),
        startByte: 0,
        endByte: 0,
        signature: line.split('{')[0]?.trim(),
      });
      continue;
    }

    const fnMatch = line.match(/^(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([A-Za-z0-9_]+)/);
    if (fnMatch && fnMatch[1]) {
      symbols.push({
        id: makeSymbolId(filePath, fnMatch[1], KIND_FUNCTION, lineNum),
        filePath,
        name: fnMatch[1],
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

export function extractRust(
  filePath: string,
  _language: string,
  content: string,
): ExtractedCodeData {
  const lines = content.split('\n');
  return {
    symbols: extractRustSymbols(lines, filePath),
    dependencies: extractRustDependencies(lines, filePath),
  };
}
