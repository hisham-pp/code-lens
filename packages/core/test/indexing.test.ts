import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IncrementalIndexer } from '../src/indexing/index.js';
import type {
  FileInfo,
  IndexStorage,
  CodeSymbol,
  CodeChunk,
  Dependency,
  GraphEdge,
  GitState,
} from '../src/types/index.js';

class MockStorage implements IndexStorage {
  public files = new Map<string, FileInfo>();
  public symbols = new Map<string, CodeSymbol[]>();
  public chunks = new Map<string, CodeChunk[]>();
  public dependencies: Dependency[] = [];
  public graphEdges: GraphEdge[] = [];
  public gitState: GitState | null = null;
  private nextId = 1;

  public findFileByRelativePath(relativePath: string): FileInfo | null {
    return this.files.get(relativePath) || null;
  }

  public findAllFiles(): FileInfo[] {
    return Array.from(this.files.values());
  }

  public saveFiles(files: FileInfo[]): number[] {
    const ids: number[] = [];
    for (const f of files) {
      const id = f.id || this.nextId++;
      f.id = id;
      this.files.set(f.relativePath, f);
      ids.push(id);
    }
    return ids;
  }

  public deleteFilesByPaths(paths: string[]): void {
    for (const p of paths) {
      this.files.delete(p);
      this.symbols.delete(p);
      this.chunks.delete(p);
    }
  }

  public saveSymbols(symbols: CodeSymbol[], fileId: number): void {
    const key = String(fileId);
    this.symbols.set(key, symbols);
  }

  public saveChunks(chunks: CodeChunk[], fileId: number): void {
    const key = String(fileId);
    this.chunks.set(key, chunks);
  }

  public saveDependencies(deps: Dependency[]): void {
    this.dependencies.push(...deps);
  }

  public saveGraphEdges(edges: GraphEdge[]): void {
    this.graphEdges.push(...edges);
  }

  public saveGitState(state: GitState): void {
    this.gitState = state;
  }

  public findChunkByHash(hash: string): CodeChunk | null {
    for (const chunkList of this.chunks.values()) {
      const found = chunkList.find((c) => c.hash === hash);
      if (found) return found;
    }
    return null;
  }

  public transaction<T>(fn: () => T): T {
    return fn();
  }
}

describe('Phase 5 Incremental Indexing Tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-lense-test-'));
    await fs.writeFile(
      path.join(tempDir, 'math.ts'),
      'export function add(a: number, b: number) { return a + b; }',
    );
    await fs.writeFile(
      path.join(tempDir, 'auth.ts'),
      'export class AuthService { login() { return true; } }',
    );
    await fs.writeFile(path.join(tempDir, 'README.md'), '# My Project\nDocumentation here.');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should run initial full index and subsequent incremental index', async () => {
    const storage = new MockStorage();
    const indexer = new IncrementalIndexer(tempDir, storage);

    // Initial index
    const report1 = await indexer.index();
    expect(report1.filesScanned).toBe(3);
    expect(report1.filesIndexed).toBe(3);
    expect(report1.filesSkipped).toBe(0);
    expect(report1.symbolsExtracted).toBeGreaterThanOrEqual(2);
    expect(storage.files.size).toBe(3);

    // Second index without any changes: all 3 should be skipped!
    const report2 = await indexer.index();
    expect(report2.filesScanned).toBe(3);
    expect(report2.filesIndexed).toBe(0);
    expect(report2.filesSkipped).toBe(3);

    // Modify math.ts and remove README.md
    await fs.writeFile(
      path.join(tempDir, 'math.ts'),
      'export function add(a: number, b: number) { return a + b + 1; }\nexport function sub(a: number, b: number) { return a - b; }',
    );
    await fs.rm(path.join(tempDir, 'README.md'));

    // Incremental index
    const report3 = await indexer.index();
    expect(report3.filesScanned).toBe(2);
    expect(report3.filesIndexed).toBe(1); // only math.ts
    expect(report3.filesSkipped).toBe(1); // auth.ts skipped
    expect(storage.files.has('README.md')).toBe(false); // deleted file pruned!
    expect(storage.files.size).toBe(2);
  });
});
