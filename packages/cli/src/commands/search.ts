import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense, type SearchOptions, type SearchResult } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export interface SearchCommandOptions {
  mode?: 'hybrid' | 'lexical' | 'semantic' | 'symbol';
  limit?: number;
  lang?: string;
  path?: string;
  json?: boolean;
}

function printSearchResult(r: SearchResult, index: number, log: typeof logger): void {
  const scorePct = Math.round(r.score * 100);
  let scoreColor: 'green' | 'cyan' | 'yellow' = 'yellow';
  if (scorePct > 70) {
    scoreColor = 'green';
  } else if (scorePct > 40) {
    scoreColor = 'cyan';
  }

  const prefix = `${pc.bold(pc.cyan(`[${index + 1}]`))} ${pc.bold(r.filePath)}:${r.startLine}-${r.endLine}`;
  const badge = Format.badge(`${scorePct}% match`, scoreColor);
  const symbol = r.symbolName ? pc.dim(`(${r.symbolName})`) : '';

  log.raw(`${prefix} ${badge} ${symbol}`);
  if (r.content) {
    const preview = r.content
      .split('\n')
      .slice(0, 3)
      .map((l: string) => `    ${pc.dim(l)}`)
      .join('\n');
    log.raw(preview);
  }
}

export async function searchCommand(
  query: string,
  targetPath: string = './',
  options: SearchCommandOptions = {},
): Promise<void> {
  const log = logger.withContext('search');
  const config = await ConfigManager.load();
  const repo = await CodeLense.open(targetPath, config);

  const searchOpts: SearchOptions = {
    query,
    mode: options.mode || 'hybrid',
    limit: options.limit || 10,
    language: options.lang,
    filePath: options.path,
  };

  const results = await repo.search(searchOpts);

  if (options.json) {
    logger.raw(JSON.stringify(results, null, 2));
    repo.close();
    return;
  }

  log.info(`Found ${results.length} result(s) for "${query}" (mode: ${searchOpts.mode}):`);

  if (results.length === 0) {
    log.raw(
      pc.dim('  No matching code or symbols found. Run `code-lense index` to refresh your index.'),
    );
  }

  for (let i = 0; i < results.length; i++) {
    printSearchResult(results[i]!, i, log);
  }

  repo.close();
}
