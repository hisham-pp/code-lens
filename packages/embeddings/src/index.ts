export * from './core/cache.js';
export * from './mock/index.js';
export * from './ollama/index.js';
export * from './openai/index.js';

import type { EmbeddingProvider } from '@code-lense/core';
import { CachedEmbeddingProvider } from './core/cache.js';
import { MockEmbeddingProvider } from './mock/index.js';
import { OllamaEmbeddingProvider, type OllamaEmbeddingOptions } from './ollama/index.js';
import { OpenAIEmbeddingProvider, type OpenAIEmbeddingOptions } from './openai/index.js';

export type EmbeddingProviderType = 'mock' | 'ollama' | 'openai' | 'transformers';

export class EmbeddingFactory {
  public static create(
    type: EmbeddingProviderType,
    options?: OllamaEmbeddingOptions & OpenAIEmbeddingOptions,
    enableCache: boolean = true,
  ): EmbeddingProvider {
    let provider: EmbeddingProvider;
    switch (type) {
      case 'ollama':
        provider = new OllamaEmbeddingProvider(options);
        break;
      case 'openai':
        provider = new OpenAIEmbeddingProvider(options);
        break;
      case 'transformers':
      case 'mock':
      default:
        provider = new MockEmbeddingProvider();
        break;
    }

    return enableCache ? new CachedEmbeddingProvider(provider) : provider;
  }
}
