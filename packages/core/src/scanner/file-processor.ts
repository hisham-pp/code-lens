import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { LanguageDetector } from '../languages/index.js';
import type { FileInfo } from '../types/index.js';
import { FileClassifier } from './classifier.js';

export async function processFile(
  fullPath: string,
  relativePath: string,
  maxFileSize: number,
): Promise<FileInfo | null> {
  const stat = await fs.stat(fullPath);
  if (stat.size > maxFileSize) return null;

  const buffer = await fs.readFile(fullPath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const isBinary = FileClassifier.isBinary(buffer);

  let contentSample: string | undefined;
  let classification = {
    isBinary,
    isGenerated: false,
    isMinified: false,
    isVendor: FileClassifier.isVendor(relativePath),
  };

  if (!isBinary) {
    const text = buffer.toString('utf-8');
    contentSample = text.slice(0, 4000);
    classification = FileClassifier.classify(relativePath, buffer, text);
  }

  const langDetection = LanguageDetector.detect(relativePath, contentSample);
  const ext = path.extname(relativePath).toLowerCase();

  return {
    path: fullPath,
    relativePath,
    language: langDetection.language,
    extension: ext,
    size: stat.size,
    hash,
    isBinary: classification.isBinary,
    isGenerated: classification.isGenerated,
    isMinified: classification.isMinified,
    isVendor: classification.isVendor,
    mtimeMs: stat.mtimeMs,
    createdAt: stat.birthtimeMs || stat.ctimeMs,
    updatedAt: stat.mtimeMs,
  };
}
