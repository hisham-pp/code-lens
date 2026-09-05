import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense, type CodeSymbol } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export interface SymbolsCommandOptions {
  type?: string;
  json?: boolean;
}

export async function symbolsCommand(
  nameQuery?: string,
  targetPath: string = './',
  options: SymbolsCommandOptions = {},
): Promise<void> {
  const log = logger.withContext('symbols');
  const config = await ConfigManager.load();
  const repo = await CodeLense.open(targetPath, config);

  let symbols: CodeSymbol[] = nameQuery
    ? repo.symbols.search(nameQuery, 30)
    : repo.symbols.search('', 50);

  if (options.type) {
    const filterType = options.type.toLowerCase();
    symbols = symbols.filter((s: CodeSymbol) => s.type.toLowerCase() === filterType);
  }

  if (options.json) {
    logger.raw(JSON.stringify(symbols, null, 2));
    repo.close();
    return;
  }

  log.info(`Matching Symbols (${symbols.length}):`);
  for (const s of symbols) {
    log.raw(
      `  ${Format.badge(s.type, 'cyan')} ${pc.bold(s.name)} ` +
        `${pc.dim(`at ${s.filePath}:${s.startLine}`)}`,
    );
    if (s.signature) {
      log.raw(`    ${pc.dim(s.signature)}`);
    }
  }

  repo.close();
}
