import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export interface IndexCommandOptions {
  force?: boolean;
  verbose?: boolean;
}

export async function indexCommand(
  targetPath: string = './',
  options: IndexCommandOptions = {},
): Promise<void> {
  const log = logger.withContext('index');
  const config = await ConfigManager.load();
  const repo = await CodeLense.open(targetPath, config);

  log.info(`Indexing repository at ${pc.bold(repo.rootPath)}...`);
  log.info('Scanning repository files...');

  const report = await repo.index({
    force: options.force,
    onProgress: (indexed: number, total: number, file: string) => {
      const message = options.verbose
        ? `[${indexed}/${total}] Processing ${file}...`
        : `[${indexed}/${total}] Indexing files...`;
      process.stdout.write(`\r${Format.info(message)}`.padEnd(80));
    },
    onEmbeddingProgress: (completed: number, total: number) => {
      process.stdout.write(
        `\r${Format.info(`[${completed}/${total}] Building embeddings...`)}`.padEnd(80),
      );
    },
  });

  process.stdout.write('\n');
  log.info('Finalizing index...');

  log.success(`Indexing completed in ${(report.durationMs / 1000).toFixed(2)}s`);
  log.raw(Format.divider());
  log.raw(Format.kv('Files Scanned', report.filesScanned));
  log.raw(Format.kv('Files Indexed', pc.green(String(report.filesIndexed))));
  log.raw(Format.kv('Files Skipped', pc.dim(String(report.filesSkipped))));
  if (report.filesFailed > 0) {
    log.raw(Format.kv('Files Failed', pc.red(String(report.filesFailed))));
  }
  log.raw(Format.kv('Symbols Extracted', pc.cyan(String(report.symbolsExtracted))));
  log.raw(Format.kv('Chunks Created', pc.blue(String(report.chunksCreated))));
  if (report.embeddingsGenerated > 0) {
    log.raw(Format.kv('Embeddings Built', pc.magenta(String(report.embeddingsGenerated))));
  }
  log.raw(Format.divider());

  if (report.errors.length > 0) {
    log.warn(`Warnings/Errors (${report.errors.length}):`);
    for (const err of report.errors.slice(0, 5)) {
      log.warn(`  - ${pc.yellow(err.path)}: ${err.error}`);
    }
  }

  repo.close();
}
