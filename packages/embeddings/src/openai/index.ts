import type { EmbeddingProvider } from '@code-lense/core';

export interface OpenAIEmbeddingOptions {
  apiKey?: string;
  endpoint?: string; // default https://api.openai.com/v1
  model?: string; // default text-embedding-3-small
  dimension?: number;
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'openai';
  public readonly dimension: number;
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor(options: OpenAIEmbeddingOptions = {}) {
    this.apiKey = options.apiKey || process.env['OPENAI_API_KEY'] || '';
    this.endpoint = (options.endpoint || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.model = options.model || 'text-embedding-3-small';
    this.dimension = options.dimension || 1536;
  }

  public async embed(text: string): Promise<number[]> {
    const results = await this.embedBatch([text]);
    const first = results[0];
    if (!first) throw new Error('No embedding returned from OpenAI');
    return first;
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const res = await fetch(`${this.endpoint}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI embedding failed with status ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      data: Array<{ embedding: number[]; index: number }>;
    };

    return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  }
}
