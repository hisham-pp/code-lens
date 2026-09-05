import { execFileSync } from 'node:child_process';
import pc from 'picocolors';
import { logger } from '@code-lense/core';

export function updateCommand(): void {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  logger.info('Updating Code Lense to the latest version...');
  execFileSync(npmCommand, ['install', '--global', 'code-lense@latest'], {
    stdio: 'inherit',
  });
  logger.success(`Code Lense ${pc.green('updated successfully')}.`);
}
