import * as fs from 'node:fs';
import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export async function watchCommand(targetPath: string = './'): Promise<void> {
  const log = logger.withContext('watch');
  const config = await ConfigManager.load();
  const repo = await CodeLense.open(targetPath, config);

  log.raw(Format.banner());
  log.info(`Watching ${pc.bold(repo.rootPath)} for changes... (Press Ctrl+C to stop)`);

  let debounceTimer: NodeJS.Timeout | null = null;
  let isIndexing = false;

  const triggerReindex = async () => {
    if (isIndexing) return;
    isIndexing = true;
    try {
      log.info('Changes detected. Re-indexing affected files...');
      const report = await repo.index();
      log.success(
        `Updated index: ${report.filesIndexed} re-indexed, ${report.filesSkipped} unchanged in ${report.durationMs}ms.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`Watch indexing error: ${msg}`);
    } finally {
      isIndexing = false;
    }
  };

  const watcher = fs.watch(repo.rootPath, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    if (
      filename.includes('.git') ||
      filename.includes('node_modules') ||
      filename.includes('.code-lense')
    ) {
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      triggerReindex();
    }, 400);
  });

  process.on('SIGINT', () => {
    watcher.close();
    repo.close();
    log.info('\nWatch mode terminated. Goodbye!');
    process.exit(0);
  });
}
