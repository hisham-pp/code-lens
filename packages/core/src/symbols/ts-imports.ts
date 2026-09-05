import type { Dependency } from '../types/index.js';

export function extractTypeScriptImports(content: string, filePath: string): Dependency[] {
  const dependencies: Dependency[] = [];
  const importRegex =
    /(?:import\s+(?:type\s+)?(?:(\*\s+as\s+[\w$]+|[\w$]+|\{[^}]*\})\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const specifier = match[2] || match[3] || '';
    const rawSymbols = match[1] || '';
    const isTypeOnly = match[0].includes('import type');
    const importedSymbols: string[] = [];

    if (rawSymbols.startsWith('{') && rawSymbols.endsWith('}')) {
      const inner = rawSymbols.slice(1, -1);
      inner.split(',').forEach((s) => {
        const clean = s
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim();
        if (clean) importedSymbols.push(clean);
      });
    } else if (rawSymbols) {
      importedSymbols.push(rawSymbols.trim());
    }

    dependencies.push({
      sourceFilePath: filePath,
      specifier,
      importedSymbols,
      isDynamic: false,
      isTypeOnly,
    });
  }

  return dependencies;
}
