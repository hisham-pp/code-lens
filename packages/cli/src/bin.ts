#!/usr/bin/env node

import { Command } from 'commander';
import { logger } from '@code-lense/core';
import { registerAdditionalCommands } from './commands-register.js';
import { indexCommand } from './commands/index-cmd.js';
import { initCommand } from './commands/init.js';
import { searchCommand } from './commands/search.js';
import { statusCommand } from './commands/status.js';
import { updateCommand } from './commands/update.js';
import { ARG_PATH, DESC_PATH, DEFAULT_PATH, OPT_JSON, OPT_JSON_DESC } from './constants.js';

const program = new Command();

program
  .name('code-lense')
  .description('Local-first repository intelligence for developers')
  .version('0.2.0')
  .addHelpCommand(false);

program
  .command('init')
  .description('Initialize Code Lense in the current repository')
  .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
  .action(async (targetPath) => {
    await initCommand(targetPath);
  });

program
  .command('index')
  .description('Index or incrementally update repository intelligence')
  .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
  .option('-f, --force', 'Force full re-indexing of all files')
  .option('-v, --verbose', 'Show real-time indexing file progress')
  .action(async (targetPath, options) => {
    await indexCommand(targetPath, options);
  });

program
  .command('status')
  .description('Display repository statistics, language breakdown, and indexing status')
  .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
  .action(async (targetPath) => {
    await statusCommand(targetPath);
  });

program
  .command('search')
  .description('Search repository via hybrid, lexical, semantic, or symbol search')
  .argument('<query>', 'Search term or query string')
  .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
  .option('-m, --mode <mode>', 'Search mode: hybrid, lexical, semantic, or symbol', 'hybrid')
  .option('-l, --limit <number>', 'Maximum results to return', (v) => parseInt(v, 10), 10)
  .option('--lang <language>', 'Filter results by programming language')
  .option('--path <subpath>', 'Filter results by file path pattern')
  .option(OPT_JSON, OPT_JSON_DESC)
  .action(async (query, targetPath, options) => {
    await searchCommand(query, targetPath, options);
  });

program
  .command('update')
  .description('Update the globally installed Code Lense CLI')
  .action(() => {
    updateCommand();
  });

registerAdditionalCommands(program);

program.parseAsync(process.argv).catch((err) => {
  logger.error('Unexpected CLI error:', err);
  process.exit(1);
});
