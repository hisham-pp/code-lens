import type { IgnoreMatcher } from '../types/index.js';

export interface ScannerOptions {
  maxFileSize?: number;
  ignoreMatcher?: IgnoreMatcher;
  includeHidden?: boolean;
}

export function shouldSkipEntry(
  entryName: string,
  relativePath: string,
  includeHidden: boolean,
  ignoreMatcher: IgnoreMatcher,
): boolean {
  if (!includeHidden && entryName.startsWith('.') && entryName !== '.repolensignore') {
    if (entryName !== '.github') return true;
  }
  return ignoreMatcher.shouldIgnore(relativePath);
}
