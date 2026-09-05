import * as crypto from 'node:crypto';
import * as os from 'node:os';
import * as path from 'node:path';

export class RepositoryHelper {
  /**
   * Compute a stable, clean repository ID based on the repository's canonical root path.
   */
  public static getRepositoryId(rootPath: string): string {
    const resolved = path.resolve(rootPath);
    const basename = path
      .basename(resolved)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const hash = crypto.createHash('sha256').update(resolved).digest('hex').slice(0, 8);
    return `${basename}-${hash}`;
  }

  /**
   * Determine default SQLite database file path:
   * ~/.code-lense/repositories/<repository-id>/index.db
   */
  public static getDatabasePath(rootPath: string, customBaseDir?: string): string {
    const baseDir = customBaseDir || path.join(os.homedir(), '.code-lense');
    const repoId = this.getRepositoryId(rootPath);
    return path.join(baseDir, 'repositories', repoId, 'index.db');
  }
}
