import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { CodeLense } from '@code-lense/sdk';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export interface AskCommandOptions {
  provider?: 'ollama' | 'openai';
  model?: string;
  json?: boolean;
}

export async function askCommand(
  question: string,
  targetPath: string = './',
  options: AskCommandOptions = {},
): Promise<void> {
  const log = logger.withContext('ask');
  const config = await ConfigManager.load();

  if (options.provider) {
    config.llm = {
      enabled: true,
      provider: options.provider,
      model: options.model,
    };
  }

  const repo = await CodeLense.open(targetPath, config);

  log.info(`Consulting repository intelligence for: "${question}"...`);
  const result = await repo.ask(question);

  if (options.json) {
    logger.raw(JSON.stringify(result, null, 2));
    repo.close();
    return;
  }

  log.raw('\n' + Format.divider());
  log.raw(pc.bold(result.answer));
  log.raw(Format.divider() + '\n');

  if (result.sources.length > 0) {
    log.raw(pc.bold('Referenced Sources:'));
    for (const src of result.sources) {
      log.raw(
        `  - ${pc.cyan(src.filePath)} (Lines ${src.startLine}-${src.endLine})${src.symbolName ? ` [${src.symbolName}]` : ''}`,
      );
    }
  }

  repo.close();
}
