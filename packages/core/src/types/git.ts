export interface GitState {
  branch: string;
  commitHash: string;
  isClean: boolean;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  indexedAt?: number;
}

export interface ProjectProfile {
  name: string;
  rootPath: string;
  packageManager?:
    'pnpm' | 'npm' | 'yarn' | 'bun' | 'cargo' | 'pip' | 'poetry' | 'go' | 'bit' | 'unknown';
  primaryLanguage?: string;
  languages: Record<string, number>;
  frameworks: string[];
  isMonorepo: boolean;
  workspaces?: string[];
  configFiles: string[];
}

export interface IgnoreReason {
  ignored: boolean;
  reason?: 'builtin' | 'gitignore' | 'repolensignore' | 'binary' | 'size' | 'custom';
  rule?: string;
}

export interface IgnoreMatcher {
  shouldIgnore(relativePath: string): boolean;
  reason(relativePath: string): IgnoreReason;
}
