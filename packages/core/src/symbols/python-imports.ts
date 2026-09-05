import type { Dependency } from '../types/index.js';

export function extractPythonImports(content: string, filePath: string): Dependency[] {
  const dependencies: Dependency[] = [];
  const regex = /^(?:from\s+([A-Za-z0-9_.]+)\s+import\s+([^#\n]+)|import\s+([A-Za-z0-9_.,\s]+))/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      const importedSymbols = match[2]
        .split(',')
        .map((s) =>
          s
            .trim()
            .split(/\s+as\s+/)[0]
            ?.trim(),
        )
        .filter(Boolean) as string[];
      dependencies.push({
        sourceFilePath: filePath,
        specifier: match[1],
        importedSymbols,
        isDynamic: false,
        isTypeOnly: false,
      });
    } else if (match[3]) {
      const modules = match[3]
        .split(',')
        .map((s) =>
          s
            .trim()
            .split(/\s+as\s+/)[0]
            ?.trim(),
        )
        .filter(Boolean) as string[];
      for (const mod of modules) {
        dependencies.push({
          sourceFilePath: filePath,
          specifier: mod,
          importedSymbols: [],
          isDynamic: false,
          isTypeOnly: false,
        });
      }
    }
  }

  return dependencies;
}
