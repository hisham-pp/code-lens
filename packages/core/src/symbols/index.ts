import { LANG_JSX, LANG_TSX } from './constants.js';
import { extractGeneric } from './generic.js';
import { extractGo } from './go.js';
import { extractPython } from './python.js';
import { extractRust } from './rust.js';
import type { ExtractedCodeData } from './types.js';
import { extractTypeScript } from './typescript.js';

export * from './types.js';

export class SymbolExtractor {
  public static extract(filePath: string, language: string, content: string): ExtractedCodeData {
    switch (language) {
      case 'typescript':
      case LANG_TSX:
      case 'javascript':
      case LANG_JSX:
        return extractTypeScript(filePath, language, content);
      case 'python':
        return extractPython(filePath, language, content);
      case 'go':
        return extractGo(filePath, language, content);
      case 'rust':
        return extractRust(filePath, language, content);
      default:
        return extractGeneric(filePath, language, content);
    }
  }
}
