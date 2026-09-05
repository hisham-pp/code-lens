import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import ignore, { type Ignore } from 'ignore';
import type { IgnoreMatcher, IgnoreReason } from '../types/index.js';
import { DEFAULT_IGNORES } from './defaults.js';

export { DEFAULT_IGNORES } from './defaults.js';

export class DefaultIgnoreMatcher implements IgnoreMatcher {
  private builtInIgnore: Ignore;
  private gitIgnore: Ignore;
  private repolensIgnore: Ignore;
  private customIgnore: Ignore;

  constructor(
    customRules: string[] = [],
    gitIgnoreContent: string = '',
    repolensIgnoreContent: string = '',
  ) {
    this.builtInIgnore = ignore().add(DEFAULT_IGNORES);
    this.gitIgnore = ignore();
    if (gitIgnoreContent.trim()) {
      this.gitIgnore.add(gitIgnoreContent);
    }
    this.repolensIgnore = ignore();
    if (repolensIgnoreContent.trim()) {
      this.repolensIgnore.add(repolensIgnoreContent);
    }
    this.customIgnore = ignore();
    if (customRules.length > 0) {
      this.customIgnore.add(customRules);
    }
  }

  public shouldIgnore(relativePath: string): boolean {
    const normalized = this.normalizePath(relativePath);
    if (!normalized || normalized === '.') return false;

    if (this.repolensIgnore.ignores(normalized)) return true;
    if (this.gitIgnore.ignores(normalized)) return true;
    if (this.customIgnore.ignores(normalized)) return true;
    if (this.builtInIgnore.ignores(normalized)) return true;

    return false;
  }

  public reason(relativePath: string): IgnoreReason {
    const normalized = this.normalizePath(relativePath);
    if (!normalized || normalized === '.') {
      return { ignored: false };
    }

    if (this.repolensIgnore.ignores(normalized)) {
      return { ignored: true, reason: 'repolensignore' };
    }
    if (this.gitIgnore.ignores(normalized)) {
      return { ignored: true, reason: 'gitignore' };
    }
    if (this.customIgnore.ignores(normalized)) {
      return { ignored: true, reason: 'custom' };
    }
    if (this.builtInIgnore.ignores(normalized)) {
      return { ignored: true, reason: 'builtin' };
    }

    return { ignored: false };
  }

  public static async loadFromDirectory(
    rootPath: string,
    customRules: string[] = [],
  ): Promise<DefaultIgnoreMatcher> {
    let gitIgnoreContent = '';
    let repolensIgnoreContent = '';

    try {
      gitIgnoreContent = await fs.readFile(path.join(rootPath, '.gitignore'), 'utf-8');
    } catch {
      // .gitignore is optional
    }

    try {
      repolensIgnoreContent = await fs.readFile(path.join(rootPath, '.repolensignore'), 'utf-8');
    } catch {
      // .repolensignore is optional
    }

    return new DefaultIgnoreMatcher(customRules, gitIgnoreContent, repolensIgnoreContent);
  }

  private normalizePath(filePath: string): string {
    return filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  }
}
