import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense, type FileInfo } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';

export interface FilesCommandOptions {
  lang?: string;
  json?: boolean;
}

export async function filesCommand(
  targetPath: string = './',
  options: FilesCommandOptions = {},
): Promise<void> {
  const log = logger.withContext('files');
  const config = await ConfigManager.load();
  const repo = await CodeLense.open(targetPath, config);

  let files: FileInfo[] = repo.files.list();
  if (options.lang) {
    const filterLang = options.lang.toLowerCase();
    files = files.filter((f: FileInfo) => f.language.toLowerCase() === filterLang);
  }

  if (options.json) {
    logger.raw(JSON.stringify(files, null, 2));
    repo.close();
    return;
  }

  log.info(`Repository Files (${files.length}):`);
  for (const f of files) {
    const sizeKb = (f.size / 1024).toFixed(1);
    log.raw(
      `  ${pc.bold(f.relativePath.padEnd(45))} ${pc.cyan(f.language.padEnd(12))} ${pc.dim(`${sizeKb} KB`)}`,
    );
  }

  repo.close();
}
