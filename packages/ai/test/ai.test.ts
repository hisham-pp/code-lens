import { describe, it, expect } from 'vitest';
import { RepositoryDatabase } from '@code-lense/database';
import { MockEmbeddingProvider } from '@code-lense/embeddings';
import { HybridSearchEngine } from '@code-lense/search';
import { ContextBuilder, AskEngine, MockLLMProvider } from '../src/index.js';

describe('Phase 7 AI & Context Builder Tests', () => {
  it('should assemble context with code snippets, symbols, and graph edges', async () => {
    const repoDb = new RepositoryDatabase(':memory:', 'ai-test-repo');
    const emb = new MockEmbeddingProvider(32);

    const fileId = repoDb.files.save({
      path: '/repo/src/billing.ts',
      relativePath: 'src/billing.ts',
      language: 'typescript',
      extension: '.ts',
      size: 500,
      hash: 'bill-hash',
      isBinary: false,
      isGenerated: false,
      isMinified: false,
      isVendor: false,
      mtimeMs: 100,
    });

    repoDb.symbols.saveBatch(
      [
        {
          id: 'sym-billing',
          filePath: 'src/billing.ts',
          name: 'BillingService',
          type: 'class',
          startLine: 1,
          endLine: 30,
          startByte: 0,
          endByte: 0,
          signature: 'class BillingService',
        },
        {
          id: 'sym-charge',
          filePath: 'src/billing.ts',
          name: 'chargeCustomer',
          type: 'method',
          parentId: 'sym-billing',
          startLine: 5,
          endLine: 15,
          startByte: 0,
          endByte: 0,
          signature: 'async chargeCustomer(amount: number)',
        },
      ],
      fileId,
    );

    const chunkContent =
      'export class BillingService { async chargeCustomer(amount: number) { return stripe.charge(amount); } }';
    repoDb.chunks.saveBatch(
      [
        {
          id: 'c-bill',
          filePath: 'src/billing.ts',
          symbolName: 'BillingService',
          startLine: 1,
          endLine: 30,
          startByte: 0,
          endByte: 0,
          chunkType: 'symbol',
          content: chunkContent,
          hash: 'h-bill',
          language: 'typescript',
        },
      ],
      fileId,
    );

    repoDb.graph.saveEdges([
      {
        sourceId: 'src/billing.ts',
        targetId: 'src/stripe.client.ts',
        relation: 'imports',
      },
    ]);

    const searchEngine = new HybridSearchEngine(repoDb, emb);
    const contextBuilder = new ContextBuilder(searchEngine, repoDb);

    const assembled = await contextBuilder.buildContext('How does billing charge customers?');
    expect(assembled.sources.length).toBeGreaterThan(0);
    expect(assembled.contextText).toContain('Primary Code Chunks');
    expect(assembled.contextText).toContain('BillingService');

    // Test AskEngine with MockLLMProvider
    const mockLlm = new MockLLMProvider();
    const askEngine = new AskEngine(contextBuilder, mockLlm);

    const result = await askEngine.ask('How does billing work?');
    expect(result.answer).toContain('Code Lense Analysis');
    expect(result.sources.length).toBeGreaterThan(0);

    repoDb.close();
  });
});
