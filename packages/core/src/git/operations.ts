import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitCommit } from './types.js';

const execFileAsync = promisify(execFile);
const CMD_GIT = 'git';

export async function getRecentCommits(cwd: string, limit: number = 20): Promise<GitCommit[]> {
  try {
    const format = '%H%x1f%an%x1f%ad%x1f%s';
    const { stdout } = await execFileAsync(
      CMD_GIT,
      ['log', `-n${limit}`, `--pretty=format:${format}`, '--date=iso'],
      { cwd },
    );

    const lines = stdout.split('\n').filter(Boolean);
    return lines.map((line) => {
      const [hash, author, date, message] = line.split('\x1f');
      return {
        hash: hash || '',
        author: author || '',
        date: date || '',
        message: message || '',
      };
    });
  } catch {
    return [];
  }
}

export async function getDiff(cwd: string, filePath?: string): Promise<string> {
  try {
    const args = ['diff', 'HEAD'];
    if (filePath) args.push('--', filePath);
    const { stdout } = await execFileAsync(CMD_GIT, args, { cwd });
    return stdout;
  } catch {
    return '';
  }
}
