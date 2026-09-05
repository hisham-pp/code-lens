import type { Command } from 'commander';
import { askCommand } from './commands/ask.js';
import { configCommand } from './commands/config.js';
import { doctorCommand } from './commands/doctor.js';
import { filesCommand } from './commands/files.js';
import { graphCommand } from './commands/graph.js';
import { helpCommand } from './commands/help.js';
import { symbolsCommand } from './commands/symbols.js';
import { watchCommand } from './commands/watch.js';
import { ARG_PATH, DESC_PATH, DEFAULT_PATH, OPT_JSON, OPT_JSON_DESC } from './constants.js';

export function registerAdditionalCommands(program: Command): void {
  program
    .command('ask')
    .description('Ask natural-language questions about your codebase')
    .argument('<question>', 'Question to answer')
    .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
    .option('--provider <provider>', 'LLM provider (ollama, openai)')
    .option('--model <model>', 'LLM model name')
    .option(OPT_JSON, OPT_JSON_DESC)
    .action(async (question, targetPath, options) => {
      await askCommand(question, targetPath, options);
    });

  program
    .command('files')
    .description('List indexed files in the repository')
    .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
    .option('--lang <language>', 'Filter by language')
    .option(OPT_JSON, OPT_JSON_DESC)
    .action(async (targetPath, options) => {
      await filesCommand(targetPath, options);
    });

  program
    .command('symbols')
    .description('Search and inspect extracted symbols across the codebase')
    .argument('[name]', 'Symbol name to filter by')
    .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
    .option('-t, --type <type>', 'Filter by symbol type (class, function, method, hook, component)')
    .option(OPT_JSON, OPT_JSON_DESC)
    .action(async (name, targetPath, options) => {
      await symbolsCommand(name, targetPath, options);
    });

  program
    .command('graph')
    .description('Inspect import and dependent graph relationships for a file or symbol')
    .argument('<target>', 'File path or symbol name to inspect')
    .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
    .action(async (target, targetPath) => {
      await graphCommand(target, targetPath);
    });

  program
    .command('watch')
    .description('Start filesystem watch mode with automatic debounced re-indexing')
    .argument(ARG_PATH, DESC_PATH, DEFAULT_PATH)
    .action(async (targetPath) => {
      await watchCommand(targetPath);
    });

  program
    .command('doctor')
    .description('Run system health checks on dependencies, permissions, and database')
    .action(async () => {
      await doctorCommand();
    });

  program
    .command('config')
    .description('Inspect or update Code Lense configuration')
    .argument('[key]', 'Config key (e.g. embedding.enabled)')
    .argument('[value]', 'Value to set')
    .action(async (key, value) => {
      await configCommand(key, value);
    });

  program
    .command('help')
    .description('Display detailed help information, commands overview, and examples')
    .argument('[command]', 'Specific command to display detailed help for')
    .action(async (commandName) => {
      await helpCommand(commandName);
    });
}
