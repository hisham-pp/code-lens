import * as path from 'node:path';
import { LANGUAGE_REGISTRY } from './registry.js';
import type { LanguageDefinition, LanguageDetection } from './types.js';

export const extensionMap = new Map<string, LanguageDefinition>();
export const filenameMap = new Map<string, LanguageDefinition>();
export const shebangMap = new Map<string, LanguageDefinition>();

for (const lang of LANGUAGE_REGISTRY) {
  for (const ext of lang.extensions) {
    extensionMap.set(ext.toLowerCase(), lang);
  }
  if (lang.filenames) {
    for (const fname of lang.filenames) {
      filenameMap.set(fname.toLowerCase(), lang);
    }
  }
  if (lang.shebangs) {
    for (const sh of lang.shebangs) {
      shebangMap.set(sh.toLowerCase(), lang);
    }
  }
}

function detectByFilename(lowerFilename: string): LanguageDetection | null {
  const def = filenameMap.get(lowerFilename);
  return def ? { language: def.id, confidence: 0.99, parser: def.treeSitterParser } : null;
}

function detectByShebang(contentSample?: string): LanguageDetection | null {
  if (!contentSample?.startsWith('#!')) return null;
  const firstLine = contentSample.split('\n')[0]?.toLowerCase() || '';
  for (const [sh, lang] of shebangMap.entries()) {
    if (firstLine.includes(sh)) {
      return { language: lang.id, confidence: 0.95, parser: lang.treeSitterParser };
    }
  }
  return null;
}

function detectByExtension(filePath: string): LanguageDetection | null {
  const ext = path.extname(filePath).toLowerCase();
  const def = extensionMap.get(ext);
  return def ? { language: def.id, confidence: 0.95, parser: def.treeSitterParser } : null;
}

function detectByContent(contentSample?: string): LanguageDetection | null {
  if (!contentSample) return null;
  const sample = contentSample.slice(0, 1000).trim();
  if (sample.startsWith('<?php')) {
    return { language: 'php', confidence: 0.9, parser: 'tree-sitter-php' };
  }
  if (sample.startsWith('<!doctype html>') || sample.startsWith('<html')) {
    return { language: 'html', confidence: 0.9, parser: 'tree-sitter-html' };
  }
  if (sample.startsWith('{') || sample.startsWith('[')) {
    try {
      JSON.parse(sample);
      return { language: 'json', confidence: 0.8, parser: 'tree-sitter-json' };
    } catch {
      // not json
    }
  }
  return null;
}

export function detectLanguage(filePath: string, contentSample?: string): LanguageDetection {
  const filename = path.basename(filePath).toLowerCase();
  return (
    detectByFilename(filename) ??
    detectByShebang(contentSample) ??
    detectByExtension(filePath) ??
    detectByContent(contentSample) ?? { language: 'text', confidence: 0.5 }
  );
}
