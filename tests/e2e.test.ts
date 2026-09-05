import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectRecognizer } from '@code-lense/core';
import { CodeLense } from '@code-lense/sdk';

describe('Phase 9 End-to-End Multi-Language Repository Intelligence Tests', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures/multilang');
  let tempStorageDir: string;

  beforeEach(async () => {
    tempStorageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-lense-e2e-'));
  });

  afterEach(async () => {
    await fs.rm(tempStorageDir, { recursive: true, force: true });
  });

  it('should detect Bit workspace, Next.js, React, and multiple languages', async () => {
    const project = await ProjectRecognizer.analyze(fixturePath);

    // Verify Bit workspace detection
    expect(project.frameworks).toContain('bit');
    expect(project.isMonorepo).toBe(true);
    expect(project.configFiles).toContain('workspace.jsonc');

    // Verify Next.js and React detection
    expect(project.frameworks).toContain('nextjs');
    expect(project.frameworks).toContain('react');

    // Verify Next.js API route detection
    const routeInfo = ProjectRecognizer.detectRoute(
      'src/app/api/users/route.ts',
      await fs.readFile(path.join(fixturePath, 'src/app/api/users/route.ts'), 'utf-8'),
    );
    expect(routeInfo).toBeDefined();
    expect(routeInfo?.route).toBe('/api/users');
    expect(routeInfo?.methods).toContain('GET');
    expect(routeInfo?.methods).toContain('POST');
  });

  it('should index all multi-language files and extract cross-language symbols', async () => {
    const repo = await CodeLense.open(fixturePath, {
      storageDir: tempStorageDir,
      embedding: {
        enabled: true,
        provider: 'mock',
      },
    });

    const report = await repo.index();
    expect(report.filesScanned).toBeGreaterThanOrEqual(6);
    expect(report.filesIndexed).toBeGreaterThanOrEqual(6);
    expect(report.symbolsExtracted).toBeGreaterThanOrEqual(8);

    const status = await repo.status();
    expect(status.languages['typescript']).toBeGreaterThan(0);
    expect(status.languages['python']).toBeGreaterThan(0);
    expect(status.languages['go']).toBeGreaterThan(0);
    expect(status.languages['rust']).toBeGreaterThan(0);

    // 1. Search TypeScript AuthService
    const authResults = await repo.search('AuthService');
    expect(authResults.length).toBeGreaterThan(0);
    expect(authResults.some((r) => r.filePath.includes('auth.service.ts'))).toBe(true);

    // 2. Search Python PaymentProcessor
    const pyResults = await repo.search('PaymentProcessor');
    expect(pyResults.length).toBeGreaterThan(0);
    expect(pyResults.some((r) => r.filePath.includes('main.py'))).toBe(true);

    // 3. Search Go WorkerPool
    const goResults = await repo.search('WorkerPool');
    expect(goResults.length).toBeGreaterThan(0);
    expect(goResults.some((r) => r.filePath.includes('service.go'))).toBe(true);

    // 4. Search Rust DatabaseConnection
    const rustResults = await repo.search('DatabaseConnection');
    expect(rustResults.length).toBeGreaterThan(0);
    expect(rustResults.some((r) => r.filePath.includes('lib.rs'))).toBe(true);

    // 5. Ask question
    const askResult = await repo.ask('How do I process payments?');
    expect(askResult.answer).toBeDefined();
    expect(askResult.sources.some((s) => s.filePath.includes('main.py'))).toBe(true);

    // 6. Incremental index check
    const incrementalReport = await repo.index();
    expect(incrementalReport.filesIndexed).toBe(0);
    expect(incrementalReport.filesSkipped).toBe(report.filesIndexed);

    repo.close();
  });
});
