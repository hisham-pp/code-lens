import type { CodeSymbol, Dependency } from '../types/index.js';

export interface ExtractedCodeData {
  symbols: CodeSymbol[];
  dependencies: Dependency[];
}
