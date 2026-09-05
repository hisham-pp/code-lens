import type { CodeSymbol } from '../types/index.js';
import { matchClass, matchInterface, matchTypeOrEnum } from './ts-containers.js';
import { matchFunction, matchMethod } from './ts-functions.js';
import { extractTypeScriptImports } from './ts-imports.js';
import { matchVariable } from './ts-variables.js';
import type { ExtractedCodeData } from './types.js';

interface LineContext {
  trimmed: string;
  filePath: string;
  lineNum: number;
  lines: string[];
  lineIndex: number;
  language: string;
  currentClassId?: string;
}

function matchNonClassSymbol(ctx: LineContext): CodeSymbol | null {
  const iface = matchInterface(ctx.trimmed, ctx.filePath, ctx.lineNum, ctx.lines, ctx.lineIndex);
  if (iface) return iface;

  const typeOrEnum = matchTypeOrEnum(
    ctx.trimmed,
    ctx.filePath,
    ctx.lineNum,
    ctx.lines,
    ctx.lineIndex,
  );
  if (typeOrEnum) return typeOrEnum;

  if (ctx.currentClassId) {
    const method = matchMethod(
      ctx.trimmed,
      ctx.filePath,
      ctx.lineNum,
      ctx.lines,
      ctx.lineIndex,
      ctx.currentClassId,
    );
    if (method) return method;
  }

  return (
    matchFunction(ctx.trimmed, ctx.filePath, ctx.lineNum, ctx.lines, ctx.lineIndex, ctx.language) ??
    matchVariable(ctx.trimmed, ctx.filePath, ctx.lineNum)
  );
}

export function extractTypeScript(
  filePath: string,
  language: string,
  content: string,
): ExtractedCodeData {
  const dependencies = extractTypeScriptImports(content, filePath);
  const symbols: CodeSymbol[] = [];
  const lines = content.split('\n');

  let currentClassId: string | undefined;
  let classBraceDepth = 0;
  let currentBraceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();
    const lineNum = i + 1;

    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    currentBraceDepth += openBraces - closeBraces;

    if (currentClassId && currentBraceDepth <= classBraceDepth) {
      currentClassId = undefined;
    }

    const cls = matchClass(trimmed, filePath, lineNum, lines, i);
    if (cls) {
      symbols.push(cls.symbol);
      currentClassId = cls.classId;
      classBraceDepth = currentBraceDepth - openBraces;
      continue;
    }

    const sym = matchNonClassSymbol({
      trimmed,
      filePath,
      lineNum,
      lines,
      lineIndex: i,
      language,
      currentClassId,
    });
    if (sym) symbols.push(sym);
  }

  return { symbols, dependencies };
}
