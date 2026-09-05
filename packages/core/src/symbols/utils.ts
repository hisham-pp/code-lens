import * as crypto from 'node:crypto';

export function makeSymbolId(filePath: string, name: string, type: string, line: number): string {
  const raw = `${filePath}:${name}:${type}:${line}`;
  return crypto.createHash('sha1').update(raw).digest('hex').slice(0, 16);
}

export function findMatchingBraceEnd(lines: string[], startIdx: number): number {
  let braceCount = 0;
  let foundOpen = false;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i]!;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '{') {
        braceCount++;
        foundOpen = true;
      } else if (char === '}') {
        braceCount--;
        if (foundOpen && braceCount === 0) {
          return i + 1;
        }
      }
    }
  }

  return Math.min(startIdx + 50, lines.length);
}

export function findPythonBlockEnd(lines: string[], startIdx: number, baseIndent: number): number {
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;
    if (indent <= baseIndent) {
      return i;
    }
  }

  return lines.length;
}
