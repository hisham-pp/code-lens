import { describe, it, expect } from 'vitest';
import { RepositoryDatabase } from '../src/index.js';

describe('Phase 4 Database & Repositories Tests', () => {
  it('should initialize schema, run migrations, and store files', () => {
    const repoDb = new RepositoryDatabase(':memory:', 'test-repo');

    const fileId = repoDb.files.save({
      path: '/path/to/src/auth.ts',
      relativePath: 'src/auth.ts',
      language: 'typescript',
      extension: '.ts',
      size: 1024,
      hash: 'abc123hash',
      isBinary: false,
      isGenerated: false,
      isMinified: false,
      isVendor: false,
      mtimeMs: 12345678,
    });

    expect(fileId).toBeGreaterThan(0);
    expect(repoDb.files.count()).toBe(1);

    const found = repoDb.files.findByRelativePath('src/auth.ts');
    expect(found).toBeDefined();
    expect(found?.language).toBe('typescript');
    expect(found?.hash).toBe('abc123hash');

    repoDb.close();
  });

  it('should store symbols and perform FTS5 search', () => {
    const repoDb = new RepositoryDatabase(':memory:', 'test-repo');

    const fileId = repoDb.files.save({
      path: '/path/to/src/user.service.ts',
      relativePath: 'src/user.service.ts',
      language: 'typescript',
      extension: '.ts',
      size: 2048,
      hash: 'userhash',
      isBinary: false,
      isGenerated: false,
      isMinified: false,
      isVendor: false,
      mtimeMs: 1000,
    });

    repoDb.symbols.saveBatch(
      [
        {
          id: 'sym-1',
          filePath: 'src/user.service.ts',
          name: 'UserService',
          type: 'class',
          startLine: 5,
          endLine: 50,
          startByte: 0,
          endByte: 0,
          signature: 'class UserService',
        },
        {
          id: 'sym-2',
          filePath: 'src/user.service.ts',
          name: 'authenticate',
          type: 'method',
          parentId: 'sym-1',
          startLine: 10,
          endLine: 25,
          startByte: 0,
          endByte: 0,
          signature: 'async authenticate(credentials: AuthCredentials)',
        },
      ],
      fileId,
    );

    expect(repoDb.symbols.count()).toBe(2);

    const byName = repoDb.symbols.findByName('UserService');
    expect(byName.length).toBe(1);
    expect(byName[0]?.name).toBe('UserService');

    const ftsResults = repoDb.symbols.searchFTS('authenticate');
    expect(ftsResults.length).toBe(1);
    expect(ftsResults[0]?.name).toBe('authenticate');

    repoDb.close();
  });

  it('should store chunks, perform FTS5 chunk search, and run vector similarity search', async () => {
    const repoDb = new RepositoryDatabase(':memory:', 'test-repo');

    const fileId = repoDb.files.save({
      path: '/path/to/src/token.ts',
      relativePath: 'src/token.ts',
      language: 'typescript',
      extension: '.ts',
      size: 500,
      hash: 'tokenhash',
      isBinary: false,
      isGenerated: false,
      isMinified: false,
      isVendor: false,
      mtimeMs: 2000,
    });

    repoDb.chunks.saveBatch(
      [
        {
          id: 'chunk-1',
          filePath: 'src/token.ts',
          symbolName: 'generateJwtToken',
          startLine: 1,
          endLine: 20,
          startByte: 0,
          endByte: 0,
          chunkType: 'symbol',
          content: 'export function generateJwtToken(user: User) { return jwt.sign(user); }',
          hash: 'hash-jwt',
          language: 'typescript',
        },
        {
          id: 'chunk-2',
          filePath: 'src/token.ts',
          symbolName: 'verifyJwtToken',
          startLine: 22,
          endLine: 40,
          startByte: 0,
          endByte: 0,
          chunkType: 'symbol',
          content: 'export function verifyJwtToken(token: string) { return jwt.verify(token); }',
          hash: 'hash-verify',
          language: 'typescript',
        },
      ],
      fileId,
    );

    expect(repoDb.chunks.count()).toBe(2);

    // FTS search
    const fts = repoDb.chunks.searchFTS('generateJwtToken');
    expect(fts.length).toBe(1);
    expect(fts[0]?.chunkId).toBe('chunk-1');

    // Vector search
    await repoDb.vectors.insertBatch([
      {
        id: 'chunk-1',
        embedding: [1.0, 0.0, 0.0],
      },
      {
        id: 'chunk-2',
        embedding: [0.0, 1.0, 0.0],
      },
    ]);

    const vecResults = await repoDb.vectors.search([0.9, 0.1, 0.0], 5);
    expect(vecResults.length).toBe(2);
    expect(vecResults[0]?.id).toBe('chunk-1');
    expect(vecResults[0]?.score).toBeGreaterThan(0.9);

    repoDb.close();
  });
});
