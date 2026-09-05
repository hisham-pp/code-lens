import type { Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { DefaultIgnoreMatcher } from '../ignore/index.js';
import type { FileInfo } from '../types/index.js';
import { shouldSkipEntry, type ScannerOptions } from './entry-filter.js';
import { processFile } from './file-processor.js';

export * from './classifier.js';
export type { ScannerOptions } from './entry-filter.js';

export class RepositoryScanner {
  private rootPath: string;
  private options: Required<ScannerOptions>;
  private visitedRealPaths: Set<string> = new Set();

  constructor(rootPath: string, options: ScannerOptions = {}) {
    this.rootPath = path.resolve(rootPath);
    this.options = {
      maxFileSize: options.maxFileSize ?? 5 * 1024 * 1024,
      ignoreMatcher: options.ignoreMatcher ?? new DefaultIgnoreMatcher(),
      includeHidden: options.includeHidden ?? false,
    };
  }

  public async scan(): Promise<FileInfo[]> {
    this.visitedRealPaths.clear();
    const files: FileInfo[] = [];
    await this.scanDir(this.rootPath, '', files);
    return files;
  }

  public async processFile(fullPath: string, relativePath: string): Promise<FileInfo | null> {
    return processFile(fullPath, relativePath, this.options.maxFileSize);
  }

  private async scanDir(
    currentDir: string,
    relativeDir: string,
    collectedFiles: FileInfo[],
  ): Promise<void> {
    let dirents: Dirent[];
    try {
      dirents = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const dirent of dirents) {
      const relPath = relativeDir ? `${relativeDir}/${dirent.name}` : dirent.name;
      if (
        shouldSkipEntry(
          dirent.name,
          relPath,
          this.options.includeHidden,
          this.options.ignoreMatcher,
        )
      ) {
        continue;
      }
      const fullPath = path.join(currentDir, dirent.name);
      if (dirent.isDirectory()) {
        await this.handleDirectory(fullPath, relPath, collectedFiles);
      } else if (dirent.isFile() || dirent.isSymbolicLink()) {
        await this.handleFile(fullPath, relPath, collectedFiles);
      }
    }
  }

  private async handleDirectory(
    fullPath: string,
    relativePath: string,
    collectedFiles: FileInfo[],
  ): Promise<void> {
    try {
      const real = await fs.realpath(fullPath);
      if (this.visitedRealPaths.has(real)) return;
      this.visitedRealPaths.add(real);
    } catch {
      return;
    }
    await this.scanDir(fullPath, relativePath, collectedFiles);
  }

  private async handleFile(
    fullPath: string,
    relativePath: string,
    collectedFiles: FileInfo[],
  ): Promise<void> {
    try {
      const fileInfo = await this.processFile(fullPath, relativePath);
      if (fileInfo) collectedFiles.push(fileInfo);
    } catch {
      // Skip unreadable files
    }
  }
}
