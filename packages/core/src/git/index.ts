import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitState } from '../types/index.js';
import { parseGitStatus } from './changes.js';
import { getDiff, getRecentCommits } from './operations.js';
import type { GitFileChange } from './types.js';

export * from './types.js';

const execFileAsync = promisify(execFile);
const CMD_GIT = 'git';

export class GitIntelligence {
  public static getRecentCommits = getRecentCommits;
  public static getDiff = getDiff;

  public static async isGitRepo(cwd: string): Promise<boolean> {
    try {
      await execFileAsync(CMD_GIT, ['rev-parse', '--is-inside-work-tree'], { cwd });
      return true;
    } catch {
      return false;
    }
  }

  public static async getState(cwd: string): Promise<GitState> {
    const isRepo = await this.isGitRepo(cwd);
    if (!isRepo) {
      return {
        branch: 'unknown',
        commitHash: '0000000000000000000000000000000000000000',
        isClean: true,
        staged: [],
        unstaged: [],
        untracked: [],
      };
    }

    let branch = 'unknown';
    let commitHash = 'initial';

    try {
      const { stdout } = await execFileAsync(CMD_GIT, ['branch', '--show-current'], { cwd });
      branch = stdout.trim() || 'detached';
    } catch {
      // ignore
    }

    try {
      const { stdout } = await execFileAsync(CMD_GIT, ['rev-parse', 'HEAD'], { cwd });
      commitHash = stdout.trim();
    } catch {
      // ignore
    }

    const changes = await this.getChanges(cwd);
    const staged: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];

    for (const change of changes) {
      if (change.status === 'untracked') {
        untracked.push(change.path);
      } else if (change.staged) {
        staged.push(change.path);
      } else {
        unstaged.push(change.path);
      }
    }

    return {
      branch,
      commitHash,
      isClean: changes.length === 0,
      staged,
      unstaged,
      untracked,
      indexedAt: Date.now(),
    };
  }

  public static async getChanges(cwd: string): Promise<GitFileChange[]> {
    try {
      const { stdout } = await execFileAsync(CMD_GIT, ['status', '--porcelain=v1', '-uall'], {
        cwd,
      });
      return parseGitStatus(stdout);
    } catch {
      return [];
    }
  }
}
