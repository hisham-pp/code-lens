import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export async function graphCommand(
  targetFileOrSymbol: string,
  targetPath: string = './',
): Promise<void> {
  const log = logger.withContext('graph');
  const config = await ConfigManager.load();
  const repo = await CodeLense.open(targetPath, config);

  const deps = repo.graph.dependencies(targetFileOrSymbol);
  const callers = repo.graph.dependents(targetFileOrSymbol);

  log.raw(Format.header(`Dependency Graph for: ${pc.bold(targetFileOrSymbol)}`));

  log.raw(pc.bold(`Dependencies (Imports): ${deps.length}`));
  if (deps.length === 0) {
    log.raw(pc.dim('  None detected.'));
  } else {
    for (const d of deps) {
      log.raw(`  ${pc.cyan('↳')} imports ${pc.bold(d.targetId)}`);
    }
  }

  log.raw('\n' + pc.bold(`Dependents (Imported by): ${callers.length}`));
  if (callers.length === 0) {
    log.raw(pc.dim('  No other files import this module.'));
  } else {
    for (const c of callers) {
      log.raw(`  ${pc.magenta('↰')} used by ${pc.bold(c.sourceId)}`);
    }
  }

  repo.close();
}
