import * as path from 'node:path';
import { GENERATED_HEADER_MARKERS, VENDOR_PATH_SEGMENTS } from './constants.js';

export function isBinary(buffer: Buffer): boolean {
  const bytesToCheck = Math.min(buffer.length, 8192);
  if (bytesToCheck === 0) return false;

  let nonPrintableCount = 0;
  for (let i = 0; i < bytesToCheck; i++) {
    const byte = buffer[i]!;
    if (byte === 0) return true;
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      nonPrintableCount++;
    }
  }

  return nonPrintableCount / bytesToCheck > 0.1;
}

export function isGenerated(content: string, relativePath: string): boolean {
  const basename = path.basename(relativePath.toLowerCase());

  if (
    basename.includes('.generated.') ||
    basename.includes('.g.') ||
    basename.endsWith('_generated.go') ||
    basename.endsWith('.pb.go') ||
    basename.endsWith('.pb.ts') ||
    basename.endsWith('_pb2.py')
  ) {
    return true;
  }

  const sample = content.slice(0, 4000).toLowerCase();
  return GENERATED_HEADER_MARKERS.some((marker) => sample.includes(marker));
}

export function isMinified(content: string, relativePath: string): boolean {
  const lowerPath = relativePath.toLowerCase();
  if (lowerPath.endsWith('.min.js') || lowerPath.endsWith('.min.css')) {
    return true;
  }

  if (content.length < 500) return false;

  const lines = content.slice(0, 5000).split('\n');
  return lines.some((line) => line.length > 500);
}

export function isVendor(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/').toLowerCase();
  return VENDOR_PATH_SEGMENTS.some((segment) => normalized.includes(segment));
}
