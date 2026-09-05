import type { GitState } from '@code-lense/core';
import type { SQLiteDatabase } from '../connection/index.js';

export class GitStore {
  constructor(
    private db: SQLiteDatabase,
    private repoId: string,
  ) {}

  public saveState(state: GitState): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO git_state (
        repository_id, branch, commit_hash, is_clean,
        staged_json, unstaged_json, untracked_json, indexed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      this.repoId,
      state.branch,
      state.commitHash,
      state.isClean ? 1 : 0,
      JSON.stringify(state.staged),
      JSON.stringify(state.unstaged),
      JSON.stringify(state.untracked),
      state.indexedAt || Date.now(),
    );
  }

  public getState(): GitState | null {
    const stmt = this.db.prepare('SELECT * FROM git_state WHERE repository_id = ?');
    const row = stmt.get(this.repoId) as Record<string, unknown> | undefined;
    if (!row) return null;

    return {
      branch: String(row['branch']),
      commitHash: String(row['commit_hash']),
      isClean: Boolean(row['is_clean']),
      staged: JSON.parse(String(row['staged_json'] || '[]')),
      unstaged: JSON.parse(String(row['unstaged_json'] || '[]')),
      untracked: JSON.parse(String(row['untracked_json'] || '[]')),
      indexedAt: Number(row['indexed_at']),
    };
  }
}
