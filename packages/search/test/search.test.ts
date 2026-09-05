import { describe, it, expect } from 'vitest';
import { RepositoryDatabase } from '@code-lense/database';
import { MockEmbeddingProvider } from '@code-lense/embeddings';
import { HybridSearchEngine } from '../src/index.js';

describe('Phase 6 Search Engine Tests', () => {
  it('should perform lexical, symbol, semantic, and hybrid search', async () => {
    const repoDb = new RepositoryDatabase(':memory:', 'test-search-repo');
    const embeddingProvider = new MockEmbeddingProvider(32);

    // Save test files
    const file1Id = repoDb.files.save({
      path: '/app/src/auth.service.ts',
      relativePath: 'src/auth.service.ts',
      language: 'typescript',
      extension: '.ts',
      size: 1000,
      hash: 'h1',
      isBinary: false,
      isGenerated: false,
      isMinified: false,
      isVendor: false,
      mtimeMs: 100,
    });

    const file2Id = repoDb.files.save({
      path: '/app/src/user.controller.ts',
      relativePath: 'src/user.controller.ts',
      language: 'typescript',
      extension: '.ts',
      size: 1500,
      hash: 'h2',
      isBinary: false,
      isGenerated: false,
      isMinified: false,
      isVendor: false,
      mtimeMs: 100,
    });

    // Save symbols
    repoDb.symbols.saveBatch(
      [
        {
          id: 'sym-auth',
          filePath: 'src/auth.service.ts',
          name: 'AuthService',
          type: 'class',
          startLine: 1,
          endLine: 50,
          startByte: 0,
          endByte: 0,
          signature: 'class AuthService',
        },
        {
          id: 'sym-login',
          filePath: 'src/auth.service.ts',
          name: 'loginUser',
          type: 'method',
          parentId: 'sym-auth',
          startLine: 10,
          endLine: 25,
          startByte: 0,
          endByte: 0,
          signature: 'async loginUser(credentials: Credentials)',
        },
      ],
      file1Id,
    );

    // Save chunks
    const chunk1Content =
      'export class AuthService { async loginUser(credentials: Credentials) { return token; } }';
    const chunk2Content =
      'export class UserController { constructor(private authService: AuthService) {} }';

    repoDb.chunks.saveBatch(
      [
        {
          id: 'c1',
          filePath: 'src/auth.service.ts',
          symbolName: 'AuthService',
          startLine: 1,
          endLine: 50,
          startByte: 0,
          endByte: 0,
          chunkType: 'symbol',
          content: chunk1Content,
          hash: 'hash-c1',
          language: 'typescript',
        },
      ],
      file1Id,
    );

    repoDb.chunks.saveBatch(
      [
        {
          id: 'c2',
          filePath: 'src/user.controller.ts',
          symbolName: 'UserController',
          startLine: 1,
          endLine: 40,
          startByte: 0,
          endByte: 0,
          chunkType: 'symbol',
          content: chunk2Content,
          hash: 'hash-c2',
          language: 'typescript',
        },
      ],
      file2Id,
    );

    // Generate embeddings and insert into vector store
    const emb1 = await embeddingProvider.embed(chunk1Content);
    const emb2 = await embeddingProvider.embed(chunk2Content);

    await repoDb.vectors.insertBatch([
      { id: 'c1', embedding: emb1 },
      { id: 'c2', embedding: emb2 },
    ]);

    const engine = new HybridSearchEngine(repoDb, embeddingProvider);

    // 1. Lexical Search
    const lexicalResults = await engine.search({ query: 'loginUser', mode: 'lexical' });
    expect(lexicalResults.length).toBeGreaterThan(0);
    expect(lexicalResults[0]?.chunkId).toBe('c1');

    // 2. Symbol Search
    const symbolResults = await engine.search({ query: 'AuthService', mode: 'symbol' });
    expect(symbolResults.length).toBeGreaterThan(0);
    expect(symbolResults[0]?.symbolName).toBe('AuthService');

    // 3. Semantic Search
    const semanticResults = await engine.search({
      query: 'credentials login authentication token',
      mode: 'semantic',
    });
    expect(semanticResults.length).toBeGreaterThan(0);

    // 4. Hybrid Search
    const hybridResults = await engine.search({ query: 'auth credentials', mode: 'hybrid' });
    expect(hybridResults.length).toBeGreaterThan(0);
    expect(hybridResults[0]?.score).toBeGreaterThan(0);

    repoDb.close();
  });
});
