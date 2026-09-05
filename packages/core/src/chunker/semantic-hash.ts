import * as crypto from 'node:crypto';
import { HASH_HEX } from './constants.js';

export function computeSemanticHash(
  code: string,
  symbolName: string = '',
  language: string = '',
): string {
  const normalizedLines = code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());

  while (normalizedLines.length > 0 && normalizedLines[0]!.trim() === '') {
    normalizedLines.shift();
  }
  while (normalizedLines.length > 0 && normalizedLines[normalizedLines.length - 1]!.trim() === '') {
    normalizedLines.pop();
  }

  const normalizedCode = normalizedLines.join('\n');
  const payload = `${normalizedCode}\0${symbolName}\0${language}`;
  return crypto.createHash('sha256').update(payload).digest(HASH_HEX);
}
