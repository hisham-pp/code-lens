import type { SymbolType } from './domain.js';

export interface SearchResult {
  chunkId: string;
  filePath: string;
  symbolName?: string;
  symbolType?: SymbolType;
  language: string;
  startLine: number;
  endLine: number;
  content: string;
  score: number;
  lexicalScore?: number;
  semanticScore?: number;
  symbolScore?: number;
  pathScore?: number;
  graphScore?: number;
  matchType: 'hybrid' | 'lexical' | 'semantic' | 'symbol';
}

export interface SearchOptions {
  query: string;
  mode?: 'hybrid' | 'lexical' | 'semantic' | 'symbol';
  limit?: number;
  language?: string;
  filePath?: string;
  symbolType?: SymbolType;
  weights?: {
    lexical?: number;
    semantic?: number;
    symbol?: number;
    path?: number;
    graph?: number;
  };
}

export interface EmbeddingProvider {
  name: string;
  dimension: number;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
}
