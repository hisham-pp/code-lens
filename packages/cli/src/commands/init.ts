import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { logger } from '@code-lense/core';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

export async function initCommand(cwd: string = process.cwd()): Promise<void> {
  const log = logger.withContext('init');
  log.raw(Format.banner());
  log.info('Initializing Code Lense in repository...');

  const configPath = await ConfigManager.initProjectConfig(cwd);
  log.success(`Created configuration: ${path.relative(cwd, configPath)}`);

  const ignorePath = path.join(cwd, '.repolensignore');
  const ignoreTemplate = `# Code Lense Ignore Patterns
# Additional rules beyond .gitignore
*.tmp
*.bak
test-output/
`;

  try {
    await fs.writeFile(ignorePath, ignoreTemplate, { flag: 'wx' });
    log.success(`Created ignore file: ${path.relative(cwd, ignorePath)}`);
  } catch {
    log.info('.repolensignore already exists, skipping.');
  }

  log.success(
    'Code Lense initialized successfully! Run `code-lense index` to index your codebase.',
  );
}
