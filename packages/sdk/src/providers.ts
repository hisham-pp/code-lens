import { MockLLMProvider, OllamaLLMProvider, OpenAILLMProvider } from '@code-lense/ai';
import type { CodeLenseConfig, EmbeddingProvider, LLMProvider } from '@code-lense/core';
import { EmbeddingFactory } from '@code-lense/embeddings';

export function resolveEmbeddingProvider(config: CodeLenseConfig): EmbeddingProvider | undefined {
  if (!config.embedding?.enabled) return undefined;
  return EmbeddingFactory.create(config.embedding.provider || 'mock', {
    endpoint: config.embedding.endpoint,
    model: config.embedding.model,
    dimension: config.embedding.dimension,
    apiKey: config.embedding.apiKey,
  });
}

export function resolveLLMProvider(config: CodeLenseConfig): LLMProvider {
  if (config.llm?.enabled) {
    if (config.llm.provider === 'ollama') {
      return new OllamaLLMProvider({
        endpoint: config.llm.endpoint,
        model: config.llm.model,
      });
    }
    if (config.llm.provider === 'openai') {
      return new OpenAILLMProvider({
        endpoint: config.llm.endpoint,
        model: config.llm.model,
        apiKey: config.llm.apiKey,
      });
    }
  }
  return new MockLLMProvider();
}
