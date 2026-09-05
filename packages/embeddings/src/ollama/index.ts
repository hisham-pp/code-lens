import type { EmbeddingProvider } from '@code-lense/core';

export interface OllamaEmbeddingOptions {
  endpoint?: string; // default http://localhost:11434
  model?: string; // default nomic-embed-text
  dimension?: number;
}

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'ollama';
  public readonly dimension: number;
  private endpoint: string;
  private model: string;

  constructor(options: OllamaEmbeddingOptions = {}) {
    this.endpoint = options.endpoint || 'http://localhost:11434';
    this.model = options.model || 'nomic-embed-text';
    this.dimension = options.dimension || 768;
  }

  public async embed(text: string): Promise<number[]> {
    const res = await fetch(`${this.endpoint}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama embedding failed with status ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as { embedding: number[] };
    return data.embedding;
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
}
