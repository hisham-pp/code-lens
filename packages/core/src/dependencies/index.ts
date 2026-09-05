import * as path from 'node:path';
import type { Dependency, GraphEdge, FileInfo } from '../types/index.js';

export class DependencyResolver {
  /**
   * Resolve file specifiers and build graph edges for imported dependencies.
   */
  public static buildEdges(
    dependencies: Dependency[],
    filesByPath: Map<string, FileInfo>,
  ): GraphEdge[] {
    const edges: GraphEdge[] = [];

    for (const dep of dependencies) {
      const sourceFile = filesByPath.get(dep.sourceFilePath);
      if (!sourceFile) continue;

      const targetPath = this.resolveImportPath(dep.sourceFilePath, dep.specifier, filesByPath);
      if (targetPath) {
        edges.push({
          sourceId: dep.sourceFilePath,
          targetId: targetPath,
          relation: 'imports',
          metadata: {
            specifier: dep.specifier,
            importedSymbols: dep.importedSymbols,
            isTypeOnly: dep.isTypeOnly,
          },
        });
      }
    }

    return edges;
  }

  /**
   * Resolve a relative or module import specifier to an existing FileInfo path.
   */
  public static resolveImportPath(
    fromFilePath: string,
    specifier: string,
    filesByPath: Map<string, FileInfo>,
  ): string | undefined {
    if (!specifier.startsWith('.')) {
      // External package / node_module
      return undefined;
    }

    const dir = path.dirname(fromFilePath);
    const candidateBase = path.normalize(path.join(dir, specifier));

    // Try direct extensions
    const candidateExtensions = [
      '',
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.mjs',
      '/index.ts',
      '/index.js',
      '/index.tsx',
    ];

    for (const ext of candidateExtensions) {
      const fullCandidate = candidateBase + ext;
      if (filesByPath.has(fullCandidate)) {
        return fullCandidate;
      }
    }

    return undefined;
  }
}
