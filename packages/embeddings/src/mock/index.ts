import * as crypto from 'node:crypto';
import type { EmbeddingProvider } from '@code-lense/core';

export class MockEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'mock';
  public readonly dimension: number;

  constructor(dimension: number = 64) {
    this.dimension = dimension;
  }

  public async embed(text: string): Promise<number[]> {
    return this.generateDeterministicVector(text);
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.generateDeterministicVector(t));
  }

  private generateDeterministicVector(text: string): number[] {
    const vec: number[] = new Array(this.dimension).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);

    if (words.length === 0) {
      vec[0] = 1.0;
      return vec;
    }

    for (const word of words) {
      const hash = crypto.createHash('md5').update(word).digest();
      for (let i = 0; i < this.dimension; i++) {
        const byte = hash[i % hash.length]!;
        // Scale to [-1, 1]
        const val = byte / 127.5 - 1.0;
        const current = vec[i] ?? 0;
        vec[i] = current + val;
      }
    }

    // L2 Normalize
    let norm = 0;
    for (let i = 0; i < this.dimension; i++) {
      norm += vec[i]! * vec[i]!;
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < this.dimension; i++) {
        vec[i] = vec[i]! / norm;
      }
    }

    return vec;
  }
}
