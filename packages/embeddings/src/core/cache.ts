import type { EmbeddingProvider } from '@code-lense/core';

export class CachedEmbeddingProvider implements EmbeddingProvider {
  public readonly name: string;
  public readonly dimension: number;
  private cache: Map<string, number[]> = new Map();

  constructor(private inner: EmbeddingProvider) {
    this.name = `cached(${inner.name})`;
    this.dimension = inner.dimension;
  }

  public async embed(text: string): Promise<number[]> {
    const cached = this.cache.get(text);
    if (cached) return cached;

    const emb = await this.inner.embed(text);
    this.cache.set(text, emb);
    return emb;
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = new Array(texts.length);
    const missingIndices: number[] = [];
    const missingTexts: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      const t = texts[i]!;
      const cached = this.cache.get(t);
      if (cached) {
        results[i] = cached;
      } else {
        missingIndices.push(i);
        missingTexts.push(t);
      }
    }

    if (missingTexts.length > 0) {
      const generated = await this.inner.embedBatch(missingTexts);
      for (let j = 0; j < missingTexts.length; j++) {
        const text = missingTexts[j]!;
        const emb = generated[j]!;
        this.cache.set(text, emb);
        const originalIndex = missingIndices[j]!;
        results[originalIndex] = emb;
      }
    }

    return results;
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}
