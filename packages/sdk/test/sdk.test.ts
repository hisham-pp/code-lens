import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeLense } from '../src/index.js';

describe('Phase 8 SDK Tests', () => {
  let tempDir: string;
  let storageDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-lense-sdk-test-'));
    storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-lense-storage-'));

    await fs.writeFile(
      path.join(tempDir, 'server.ts'),
      'export class ApiServer { start() { return 8080; } }',
    );
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(storageDir, { recursive: true, force: true });
  });

  it('should index, search, inspect status, and ask questions via SDK', async () => {
    const repo = await CodeLense.open(tempDir, {
      storageDir,
      embedding: {
        enabled: true,
        provider: 'mock',
      },
    });

    // 1. Index
    const report = await repo.index();
    expect(report.filesScanned).toBe(1);
    expect(report.filesIndexed).toBe(1);
    expect(report.symbolsExtracted).toBeGreaterThanOrEqual(1);

    // 2. Status
    const status = await repo.status();
    expect(status.totalFiles).toBe(1);
    expect(status.totalSymbols).toBeGreaterThanOrEqual(1);
    expect(status.languages['typescript']).toBe(1);

    // 3. Search
    const searchResults = await repo.search('ApiServer');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0]?.filePath).toContain('server.ts');

    // 4. Symbols
    const symbols = repo.symbols.find('ApiServer');
    expect(symbols.length).toBe(1);
    expect(symbols[0]?.name).toBe('ApiServer');

    // 5. Ask
    const askResult = await repo.ask('Where is ApiServer defined?');
    expect(askResult.answer).toBeDefined();
    expect(askResult.sources.length).toBeGreaterThan(0);

    repo.close();
  });
});
