import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { Format } from '../output/format.js';
import { COMMAND_DOCS, type CommandDoc } from './help-data.js';

const log = logger.withContext('help');

function renderCommandDetail(doc: CommandDoc): void {
  log.raw(Format.header(`code-lense ${doc.name}`));
  log.raw(`${doc.summary}\n`);
  log.raw(`${pc.bold('Usage:')} ${pc.cyan(doc.usage)}\n`);

  if (doc.args && doc.args.length > 0) {
    log.raw(pc.bold('Arguments:'));
    for (const a of doc.args) {
      log.raw(`  ${pc.green(a.name.padEnd(16))} ${a.desc}`);
    }
    log.raw('');
  }

  if (doc.options && doc.options.length > 0) {
    log.raw(pc.bold('Options:'));
    for (const opt of doc.options) {
      log.raw(`  ${pc.yellow(opt.flags.padEnd(24))} ${opt.desc}`);
    }
    log.raw('');
  }

  log.raw(pc.bold('Examples:'));
  for (const ex of doc.examples) {
    log.raw(`  ${pc.dim('$')} ${pc.cyan(ex)}`);
  }
}

function renderOverview(): void {
  log.raw(Format.banner());
  log.raw(`${pc.bold('Usage:')} ${pc.cyan('code-lense <command> [options] [path]')}\n`);

  const categories = ['Indexing', 'Search & Intelligence', 'AI', 'Diagnostics & Config'] as const;

  for (const cat of categories) {
    log.raw(pc.bold(pc.blue(`${cat}:`)));
    for (const doc of Object.values(COMMAND_DOCS)) {
      if (doc.category === cat) {
        log.raw(`  ${pc.green(doc.name.padEnd(12))} ${doc.summary}`);
      }
    }
    log.raw('');
  }

  log.raw(pc.bold('Quick Examples:'));
  log.raw(`  ${pc.dim('$')} ${pc.cyan('code-lense init')}`);
  log.raw(`  ${pc.dim('$')} ${pc.cyan('code-lense index')}`);
  log.raw(`  ${pc.dim('$')} ${pc.cyan('code-lense search "UserService" --mode hybrid')}`);
  log.raw(`  ${pc.dim('$')} ${pc.cyan('code-lense ask "How does auth work?"')}`);
  log.raw(`  ${pc.dim('$')} ${pc.cyan('code-lense graph src/service.ts')}\n`);

  log.info(`Run ${pc.cyan('code-lense help <command>')} for detailed options and examples.`);
}

export async function helpCommand(commandName?: string): Promise<void> {
  if (!commandName) {
    renderOverview();
    return;
  }

  const doc = COMMAND_DOCS[commandName.toLowerCase().trim()];
  if (!doc) {
    log.error(`Unknown command "${commandName}".`);
    log.info(`Run ${pc.cyan('code-lense help')} to list all available commands.`);
    return;
  }

  renderCommandDetail(doc);
}
