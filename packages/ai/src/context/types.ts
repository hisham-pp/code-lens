import type { CodeSymbol, GitState, SearchResult } from '@code-lense/core';

export interface ContextBuilderOptions {
  maxCharacters?: number;
  maxChunks?: number;
}

export interface AssembledContext {
  contextText: string;
  sources: SearchResult[];
  relatedSymbols: CodeSymbol[];
  gitState?: GitState | null;
}
