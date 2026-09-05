import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export async function statusCommand(targetPath: string = './'): Promise<void> {
  const log = logger.withContext('status');
  const config = await ConfigManager.load();
  const repo = await CodeLense.open(targetPath, config);
  const status = await repo.status();

  log.raw(Format.banner());
  log.raw(Format.kv('Repository', status.project.name || status.repositoryId));
  log.raw(Format.kv('Path', status.rootPath));
  log.raw(Format.kv('Branch', status.git.branch));
  log.raw(Format.kv('Commit', status.git.commitHash.slice(0, 8)));
  log.raw(Format.divider());

  log.raw(Format.kv('Files (Indexed)', status.totalFiles));
  log.raw(Format.kv('Symbols', status.totalSymbols));
  log.raw(Format.kv('Chunks', status.totalChunks));
  log.raw(Format.kv('Embeddings', status.totalEmbeddings));

  if (status.project.frameworks.length > 0) {
    log.raw(Format.kv('Frameworks', status.project.frameworks.join(', ')));
  }
  if (status.project.packageManager) {
    log.raw(Format.kv('Package Mgr', status.project.packageManager));
  }

  log.raw(Format.divider());
  log.raw(pc.bold('Languages'));

  const totalFiles = status.totalFiles || 1;
  const sortedLangs = (Object.entries(status.languages) as [string, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  if (sortedLangs.length === 0) {
    log.raw(pc.dim('  No files indexed yet.'));
  } else {
    for (const [lang, count] of sortedLangs.slice(0, 6)) {
      const pct = Math.round((count / totalFiles) * 100);
      const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20, '░');
      log.raw(`  ${lang.padEnd(14)} ${bar} ${pct}% (${count})`);
    }
  }

  log.raw(Format.divider());

  let timeAgo = 'Never';
  if (status.lastIndexedAt) {
    const diffSec = Math.round((Date.now() - status.lastIndexedAt) / 1000);
    if (diffSec < 60) timeAgo = `${diffSec} seconds ago`;
    else if (diffSec < 3600) timeAgo = `${Math.round(diffSec / 60)} minutes ago`;
    else timeAgo = `${Math.round(diffSec / 3600)} hours ago`;
  }

  log.raw(Format.kv('Last Indexed', timeAgo));
  log.raw(
    Format.kv(
      'Git Status',
      status.git.isClean ? pc.green('Clean') : pc.yellow('Modified changes present'),
    ),
  );

  repo.close();
}
