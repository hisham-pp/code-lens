import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { logger } from '@code-lense/core';
import { CodeLense } from '@code-lense/sdk';

const log = logger.withContext('benchmark');

async function runBenchmark() {
  log.info('=== Code Lense Performance Benchmark ===\n');

  const benchmarkDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-lense-bench-'));
  const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-lense-storage-'));

  const fileCount = 500;
  log.info(`Generating ${fileCount} synthetic source files...`);

  for (let i = 0; i < fileCount; i++) {
    const code = `
// Module ${i}
export interface Config${i} {
  id: number;
  enabled: boolean;
}

export class Service${i} {
  private count = ${i};

  public executeTask(factor: number): number {
    return this.count * factor;
  }
}

export function helper${i}(val: number): string {
  return "result-" + (val + ${i});
}
`;
    await fs.writeFile(path.join(benchmarkDir, `service_${i}.ts`), code, 'utf-8');
  }

  const repo = await CodeLense.open(benchmarkDir, { storageDir });

  // 1. Initial Indexing Benchmark
  log.info('Running initial index benchmark...');
  const indexStart = performance.now();
  const report = await repo.index();
  const indexTimeMs = performance.now() - indexStart;

  const filesPerSec = Math.round(report.filesIndexed / (indexTimeMs / 1000));

  log.success('Initial Index:');
  log.info(`  Files Indexed:      ${report.filesIndexed}`);
  log.info(`  Symbols Extracted:  ${report.symbolsExtracted}`);
  log.info(`  Chunks Created:     ${report.chunksCreated}`);
  log.info(`  Total Duration:     ${indexTimeMs.toFixed(2)} ms`);
  log.info(`  Throughput:         ${filesPerSec} files/sec`);

  // 2. Incremental Indexing Benchmark
  log.info('Running incremental index benchmark (no changes)...');
  const incStart = performance.now();
  const incReport = await repo.index();
  const incTimeMs = performance.now() - incStart;

  log.success('Incremental Index (No-op):');
  log.info(`  Files Skipped:      ${incReport.filesSkipped}`);
  log.info(`  Total Duration:     ${incTimeMs.toFixed(2)} ms`);

  // 3. Search Latency Benchmark
  log.info('Running search latency benchmark (100 queries)...');
  const searchTimes: number[] = [];

  for (let q = 0; q < 100; q++) {
    const query = `Service${Math.floor(Math.random() * fileCount)}`;
    const qStart = performance.now();
    await repo.search(query);
    searchTimes.push(performance.now() - qStart);
  }

  const avgSearchMs = (searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length).toFixed(2);
  const p95SearchMs = searchTimes
    .sort((a, b) => a - b)
    [Math.floor(searchTimes.length * 0.95)]!.toFixed(2);

  log.success('Search Latency:');
  log.info(`  Average Latency:    ${avgSearchMs} ms`);
  log.info(`  95th Percentile:    ${p95SearchMs} ms`);

  repo.close();
  await fs.rm(benchmarkDir, { recursive: true, force: true });
  await fs.rm(storageDir, { recursive: true, force: true });

  log.success('=== Benchmark Finished Successfully ===\n');
}

runBenchmark().catch((err: unknown) => {
  log.error('Benchmark failed:', err);
});
