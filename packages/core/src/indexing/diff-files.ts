import type { FileInfo } from '../types/index.js';

export interface FileDiffResult {
  addedFiles: FileInfo[];
  modifiedFiles: FileInfo[];
  deletedFiles: string[];
  skippedCount: number;
}

export function diffFiles(
  scannedFiles: FileInfo[],
  existingFiles: FileInfo[],
  force?: boolean,
): FileDiffResult {
  const existingMap = new Map(existingFiles.map((f) => [f.relativePath, f]));
  const scannedMap = new Map(scannedFiles.map((f) => [f.relativePath, f]));

  const addedFiles: FileInfo[] = [];
  const modifiedFiles: FileInfo[] = [];
  let skippedCount = 0;

  for (const file of scannedFiles) {
    const existing = existingMap.get(file.relativePath);
    if (!existing) {
      addedFiles.push(file);
    } else if (force || existing.hash !== file.hash) {
      modifiedFiles.push(file);
    } else {
      skippedCount++;
    }
  }

  const deletedFiles: string[] = [];
  for (const existing of existingFiles) {
    if (!scannedMap.has(existing.relativePath)) {
      deletedFiles.push(existing.relativePath);
    }
  }

  return { addedFiles, modifiedFiles, deletedFiles, skippedCount };
}
