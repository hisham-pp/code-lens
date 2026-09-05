export interface CodeLenseConfig {
  storageDir?: string;
  workerCount?: number;
  embedding?: {
    enabled: boolean;
    provider: 'ollama' | 'transformers' | 'openai' | 'mock';
    model?: string;
    dimension?: number;
    endpoint?: string;
    apiKey?: string;
  };
  llm?: {
    enabled: boolean;
    provider: 'ollama' | 'openai';
    model?: string;
    endpoint?: string;
    apiKey?: string;
  };
  search?: {
    defaultMode: 'hybrid' | 'lexical' | 'semantic' | 'symbol';
    defaultLimit: number;
    weights: {
      lexical: number;
      semantic: number;
      symbol: number;
      path: number;
      graph: number;
    };
  };
  indexing?: {
    maxFileSize: number; // in bytes (e.g. 2MB)
    respectGitignore: boolean;
    respectRepolensignore: boolean;
    includeHidden: boolean;
  };
}
