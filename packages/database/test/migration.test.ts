import { describe, it, expect } from 'vitest';
import { SQLiteDatabase } from '../src/connection/index.js';
import { RepositoryDatabase } from '../src/index.js';
import { MigrationRunner } from '../src/migrations/runner.js';

describe('Database Schema & Migration System Tests', () => {
  it('should create schema_migrations table and apply version 1 migration', () => {
    const db = new SQLiteDatabase(':memory:');

    expect(MigrationRunner.getCurrentVersion(db)).toBe(0);

    const pendingBefore = MigrationRunner.getPendingMigrations(db);
    expect(pendingBefore.length).toBeGreaterThan(0);
    expect(pendingBefore[0]?.version).toBe(1);

    const result = MigrationRunner.migrateToLatest(db);
    expect(result.totalApplied).toBe(1);
    expect(result.applied[0]?.name).toBe('001-initial-schema');

    expect(MigrationRunner.getCurrentVersion(db)).toBe(1);

    const applied = MigrationRunner.getAppliedMigrations(db);
    expect(applied.length).toBe(1);
    expect(applied[0]?.version).toBe(1);
    expect(applied[0]?.name).toBe('001-initial-schema');
    expect(applied[0]?.appliedAt).toBeGreaterThan(0);

    // Verify idempotency: second call should apply 0
    const secondResult = MigrationRunner.migrateToLatest(db);
    expect(secondResult.totalApplied).toBe(0);
    expect(MigrationRunner.getPendingMigrations(db).length).toBe(0);

    db.close();
  });

  it('should support migration rollback and re-application', () => {
    const db = new SQLiteDatabase(':memory:');
    MigrationRunner.migrateToLatest(db);
    expect(MigrationRunner.getCurrentVersion(db)).toBe(1);

    // Rollback
    const rolledBack = MigrationRunner.rollbackLast(db);
    expect(rolledBack).toBeDefined();
    expect(rolledBack?.version).toBe(1);
    expect(MigrationRunner.getCurrentVersion(db)).toBe(0);
    expect(MigrationRunner.getAppliedMigrations(db).length).toBe(0);

    // Re-apply
    const reapply = MigrationRunner.migrateToLatest(db);
    expect(reapply.totalApplied).toBe(1);
    expect(MigrationRunner.getCurrentVersion(db)).toBe(1);

    db.close();
  });

  it('should automatically synchronize FTS5 tables via triggers on delete cascade', () => {
    const repoDb = new RepositoryDatabase(':memory:', 'test-repo');
    expect(repoDb.getSchemaVersion()).toBe(1);

    const fileId = repoDb.files.save({
      path: '/workspace/src/example.ts',
      relativePath: 'src/example.ts',
      language: 'typescript',
      extension: '.ts',
      size: 100,
      hash: 'hash123',
      isBinary: false,
      isGenerated: false,
      isMinified: false,
      isVendor: false,
      mtimeMs: 1000,
    });

    repoDb.symbols.saveBatch(
      [
        {
          id: 'sym-trigger-1',
          filePath: 'src/example.ts',
          name: 'computeHash',
          type: 'function',
          startLine: 1,
          endLine: 10,
          startByte: 0,
          endByte: 0,
          signature: 'function computeHash()',
        },
      ],
      fileId,
    );

    repoDb.chunks.saveBatch(
      [
        {
          id: 'chunk-trigger-1',
          filePath: 'src/example.ts',
          symbolName: 'computeHash',
          startLine: 1,
          endLine: 10,
          startByte: 0,
          endByte: 0,
          chunkType: 'symbol',
          content: 'function computeHash() { return "ok"; }',
          hash: 'chunkhash123',
          language: 'typescript',
        },
      ],
      fileId,
    );

    // Verify FTS returns results
    expect(repoDb.symbols.searchFTS('computeHash').length).toBe(1);
    expect(repoDb.chunks.searchFTS('computeHash').length).toBe(1);

    // Cascade delete file
    repoDb.deleteFilesByPaths(['src/example.ts']);

    // Verify FTS triggers cleaned up virtual tables
    expect(repoDb.symbols.searchFTS('computeHash').length).toBe(0);
    expect(repoDb.chunks.searchFTS('computeHash').length).toBe(0);

    repoDb.close();
  });
});
