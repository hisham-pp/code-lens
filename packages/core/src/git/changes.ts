import type { GitFileChange } from './types.js';

function resolveStatusChange(
  statusChar: string | undefined,
  filePath: string,
  oldPath: string | undefined,
  staged: boolean,
): GitFileChange | null {
  if (!statusChar || statusChar === ' ' || statusChar === '?') return null;
  let status: GitFileChange['status'] = 'modified';
  if (statusChar === 'A') status = 'added';
  else if (statusChar === 'D') status = 'deleted';
  else if (statusChar === 'R') status = 'renamed';
  return { status, path: filePath, oldPath, staged };
}

function parseStatusLine(line: string): GitFileChange[] {
  if (line.length < 4) return [];
  const indexStatus = line[0];
  const worktreeStatus = line[1];
  let filePath = line.slice(3).trim();
  let oldPath: string | undefined;

  if (filePath.includes(' -> ')) {
    const parts = filePath.split(' -> ');
    oldPath = parts[0]?.trim();
    filePath = parts[1]?.trim() || filePath;
  }

  if (indexStatus === '?' && worktreeStatus === '?') {
    return [{ status: 'untracked', path: filePath, staged: false }];
  }

  const changes: GitFileChange[] = [];
  const stagedChange = resolveStatusChange(indexStatus, filePath, oldPath, true);
  if (stagedChange) changes.push(stagedChange);

  const worktreeChange = resolveStatusChange(worktreeStatus, filePath, oldPath, false);
  if (worktreeChange) changes.push(worktreeChange);

  return changes;
}

export function parseGitStatus(stdout: string): GitFileChange[] {
  const lines = stdout.split('\n').filter(Boolean);
  const changes: GitFileChange[] = [];
  for (const line of lines) {
    changes.push(...parseStatusLine(line));
  }
  return changes;
}
