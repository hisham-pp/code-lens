import * as path from 'node:path';
import { AskEngine, ContextBuilder, type AskResult } from '@code-lense/ai';
import {
  IncrementalIndexer,
  RepositoryHelper,
  type CodeLenseConfig,
  type EmbeddingProvider,
  type IndexingReport,
  type LLMProvider,
  type SearchOptions,
  type SearchResult,
} from '@code-lense/core';
import { RepositoryDatabase } from '@code-lense/database';
import { HybridSearchEngine } from '@code-lense/search';
import { createFilesAccessor, createGraphAccessor, createSymbolsAccessor } from './accessors.js';
import { backfillChunkEmbeddings } from './backfill-embeddings.js';
import { resolveEmbeddingProvider, resolveLLMProvider } from './providers.js';
import { collectRepositoryStatus } from './repository-status.js';
import type { RepositoryStatus } from './types.js';

export * from './types.js';

export class CodeLense {
  public readonly rootPath: string;
  public readonly repositoryId: string;
  public readonly db: RepositoryDatabase;
  public readonly searchEngine: HybridSearchEngine;
  public readonly askEngine: AskEngine;
  public readonly embeddingProvider?: EmbeddingProvider;
  public readonly llmProvider: LLMProvider;

  private constructor(
    rootPath: string,
    db: RepositoryDatabase,
    embeddingProvider?: EmbeddingProvider,
    llmProvider?: LLMProvider,
  ) {
    this.rootPath = rootPath;
    this.repositoryId = db.repositoryId;
    this.db = db;
    this.embeddingProvider = embeddingProvider;
    this.searchEngine = new HybridSearchEngine(db, embeddingProvider);
    this.llmProvider = llmProvider || resolveLLMProvider({});
    const contextBuilder = new ContextBuilder(this.searchEngine, db);
    this.askEngine = new AskEngine(contextBuilder, this.llmProvider);
  }

  public static async open(
    targetPath: string = './',
    config: CodeLenseConfig = {},
  ): Promise<CodeLense> {
    const rootPath = path.resolve(targetPath);
    const repoId = RepositoryHelper.getRepositoryId(rootPath);
    const dbPath = RepositoryHelper.getDatabasePath(rootPath, config.storageDir);
    const db = new RepositoryDatabase(dbPath, repoId);
    const embeddingProvider = resolveEmbeddingProvider(config);
    const llmProvider = resolveLLMProvider(config);
    return new CodeLense(rootPath, db, embeddingProvider, llmProvider);
  }

  public async index(
    options: {
      force?: boolean;
      onProgress?: (indexed: number, total: number, file: string) => void;
    } = {},
  ): Promise<IndexingReport> {
    const indexer = new IncrementalIndexer(this.rootPath, this.db, options);
    const report = await indexer.index();
    if (this.embeddingProvider) {
      report.embeddingsGenerated = await backfillChunkEmbeddings(
        this.db,
        this.repositoryId,
        this.embeddingProvider,
      );
    }
    return report;
  }

  public async search(queryOrOptions: string | SearchOptions): Promise<SearchResult[]> {
    const opts: SearchOptions =
      typeof queryOrOptions === 'string'
        ? { query: queryOrOptions, mode: 'hybrid' }
        : queryOrOptions;
    return this.searchEngine.search(opts);
  }

  public async ask(question: string): Promise<AskResult> {
    return this.askEngine.ask(question);
  }

  public async status(): Promise<RepositoryStatus> {
    return collectRepositoryStatus(this.rootPath, this.repositoryId, this.db);
  }

  public get symbols() {
    return createSymbolsAccessor(this.db);
  }

  public get files() {
    return createFilesAccessor(this.db);
  }

  public get graph() {
    return createGraphAccessor(this.db);
  }

  public close(): void {
    this.db.close();
  }
}
