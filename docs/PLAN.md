# Code Lense — Architecture & Execution Plan

> "See your codebase clearly."  
> Local-first repository intelligence for developers.

This document serves as the living project plan and task execution tracker for **Code Lense**. Every phase and task is tracked here with its status, technical specification, and verification records.

---

## 1. Architectural Blueprint

```
                      Code Lense
                          │
               ┌──────────┴──────────┐
               │                     │
              CLI                    SDK
               │                     │
               └──────────┬──────────┘
                          │
                   Repository Engine
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
       Scanner           Git           Config
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                    File Analyzer
                          │
                ┌─────────┼─────────┐
                ▼         ▼         ▼
             Parser     Symbols   Dependencies
                │         │         │
                └─────────┼─────────┘
                          ▼
                       Chunker
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
               FTS              Embeddings
                │                   │
                └─────────┬─────────┘
                          ▼
                        SQLite
                          │
                          ▼
                   Search Engine
                          │
               ┌──────────┼──────────┐
               ▼          ▼          ▼
            Keyword    Semantic    Symbol
             Search      Search     Search
               │          │          │
               └──────────┼──────────┘
                          ▼
                      Reranking
                          │
                          ▼
                    Context Builder
                          │
                          ▼
                    Optional LLM
```

---

## 2. Monorepo Structure

```text
code-lens/
├── packages/
│   ├── core/                  # Core repository engine (Scanner, AST Parser, Symbols, Chunker, Git, Indexing)
│   ├── database/              # SQLite manager, migrations, FTS5 virtual tables, vector store, repositories
│   ├── search/                # Lexical (FTS5 BM25), semantic, symbol, hybrid search & multi-signal ranking
│   ├── embeddings/            # Pluggable embedding providers (Ollama, Transformers.js, OpenAI, Local Mock)
│   ├── ai/                    # LLM providers, ContextBuilder (AST + graph + Git + budget), prompts
│   ├── cli/                   # User-facing CLI tool (code-lense binary)
│   └── sdk/                   # Programmatic TypeScript SDK
├── tests/                     # Multi-language fixture repositories and integration test suites
├── docs/                      # Architectural docs & task logs
│   └── PLAN.md                # This document (living plan & execution tracker)
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── turbo.json
└── README.md
```

---

## 3. Implementation Phases & Task Checklist

### Phase 1: Monorepo Foundation & Domain Interfaces

- [x] **1.1 Workspace Setup**: Configure `pnpm-workspace.yaml`, root `package.json`, `turbo.json`, and `tsconfig.base.json`.
- [x] **1.2 Package Scaffolding**: Initialize `packages/core`, `packages/database`, `packages/search`, `packages/embeddings`, `packages/ai`, `packages/cli`, `packages/sdk`.
- [x] **1.3 Core Domain Contracts**: Define TypeScript interfaces in `@code-lense/core` for `File`, `Symbol`, `Chunk`, `Dependency`, `GraphEdge`, `GitState`, `ProjectProfile`, and `RepositoryStore`.

### Phase 2: Scanner, Ignore System, Classifiers & Git

- [x] **2.1 IgnoreMatcher**: Hierarchical ignore system supporting built-in defaults, `.gitignore`, and `.repolensignore`.
- [x] **2.2 High-Performance Scanner**: Asynchronous directory walker with symlink protection, cycle detection, and stat collection.
- [x] **2.3 File Classifiers**: Detection of binary files, minified code, generated code markers (`DO NOT EDIT`, `@generated`), and vendor code.
- [x] **2.4 Language Detection**: Pluggable detector supporting 25+ languages via shebang, filename, extension, and content inspection.
- [x] **2.5 Framework & Project Recognition**: Project detection (`pnpm`, `cargo`, `go`, `bit` workspaces via `workspace.jsonc`, etc.) and framework analysis (`Next.js`, `React`, `NestJS`, `Express`, etc.).
- [x] **2.6 Git Intelligence**: Extraction of Git HEAD, current branch, status (staged/unstaged/modified/added/deleted/renamed), and commit log.

### Phase 3: Tree-sitter Parser, Symbols & AST Chunker

- [x] **3.1 Tree-sitter Parser Engine**: Integration of WebAssembly Tree-sitter parsers (`web-tree-sitter`) with fallback heuristic parser.
- [x] **3.2 Unified Symbol Extraction**: Extract functions, methods, classes, interfaces, types, enums, variables, components, hooks, routes.
- [x] **3.3 Hierarchical Symbol Builder**: Construct parent-child symbol relationships (e.g. `Class -> Method`).
- [x] **3.4 AST-Aware Semantic Chunker**: Semantic chunk generation preserving symbol boundaries and line/byte ranges.
- [x] **3.5 Deterministic Chunk Hashing**: Stable content hashing `hash(normalizedCode + symbolName + language)` to prevent invalidating embeddings on line shifts.

### Phase 4: Database Architecture & Repositories

- [x] **4.1 SQLite Connection & PRAGMAs**: Configure WAL mode, normal synchronous, foreign keys, and memory temp store.
- [x] **4.2 Schema Migrations**: Relational tables (`repositories`, `projects`, `files`, `symbols`, `dependencies`, `chunks`, `git_state`, `graph_edges`).
- [x] **4.3 FTS5 Virtual Tables**: Setup full-text search indexes (`chunks_fts`, `symbols_fts`, `files_fts`).
- [x] **4.4 Vector Storage Layer**: Pluggable `VectorStore` interface supporting `sqlite-vec` and built-in vector distance fallback.
- [x] **4.5 Domain Stores**: Implement `FileStore`, `SymbolStore`, `ChunkStore`, `GitStore`, `GraphStore`, `SearchStore`.

### Phase 5: Incremental Indexing Engine

- [x] **5.1 Change Detection**: Compare filesystem / Git status against stored file hashes.
- [x] **5.2 Incremental Pipeline**: Coordinate parse -> extract -> chunk -> persist flow only for modified/added files.
- [x] **5.3 Cascade Deletions**: Clean up removed files from all relational tables, FTS5 indexes, and vector stores.
- [x] **5.4 Chunk Embedding Reuse**: Detect unchanged chunk hashes and reuse existing embeddings.
- [x] **5.5 Batch Transactions & Resilience**: Wrap batch indexing in atomic transactions with per-file error isolation.

### Phase 6: Search Engine & Multi-Signal Ranking

- [x] **6.1 Lexical Search**: FTS5 BM25 search with phrase, prefix, exact, and metadata filtering.
- [x] **6.2 Symbol Search**: Fast symbol lookup by exact name, fuzzy match, and symbol type.
- [x] **6.3 Semantic Search**: Vector similarity search using cosine distance.
- [x] **6.4 Hybrid Search Fusion**: Combine lexical, semantic, symbol, path, and graph signals via Reciprocal Rank Fusion (RRF) and weighted linear ranking.
- [x] **6.5 Configurable Ranking Weights**: Allow custom signal weighting.

### Phase 7: Pluggable Embeddings & AI Layer

- [x] **7.1 Embedding Providers**: Implement `EmbeddingProvider` for Ollama, Transformers.js, OpenAI-compatible, and Local Mock.
- [x] **7.2 Batching & Cache**: Batch embedding generator with in-memory / SQLite hash cache.
- [x] **7.3 LLM Provider**: Implement `LLMProvider` interface for Ollama and OpenAI-compatible endpoints.
- [x] **7.4 ContextBuilder**: Assemble rich context from hybrid search results, symbol hierarchy, dependency graph, and Git history within a strict token budget.
- [x] **7.5 Natural Language Ask Engine**: Contextual prompt generator for codebase Q&A.

### Phase 8: CLI Tooling & Programmatic SDK

- [x] **8.1 CLI Framework**: Build `code-lense` command line tool with Commander.
- [x] **8.2 CLI Commands**:
  - [x] `init`: Initialize repository configuration and ignore files.
  - [x] `index`: Trigger full or incremental repository indexing.
  - [x] `status`: Show detailed statistics (files, language breakdown, symbols, chunks, Git info).
  - [x] `search`: Interactive search with hybrid, lexical, semantic, and symbol modes.
  - [x] `ask`: Query codebase with context-augmented answers.
  - [x] `files`: Inspect indexed files with language filters.
  - [x] `symbols`: Inspect symbols and signatures.
  - [x] `graph`: Query dependency graph relationships.
  - [x] `watch`: File-watcher mode with debounced auto-reindexing.
  - [x] `doctor`: Environment diagnostics (Node, Git, SQLite, FTS5, vector extensions).
  - [x] `config`: Manage global and local configuration.
- [x] **8.3 Output Formatting**: Beautiful terminal tables, colored status badges, syntax highlighting, and `--json` format support.
- [x] **8.4 TypeScript SDK**: Clean programmatic facade `CodeLense.open(path)`.

### Phase 9: Test Suites, Benchmarking & Documentation

- [x] **9.1 Multi-Language Fixtures**: Create test repositories for TypeScript, Python, Go, and Rust.
- [x] **9.2 Unit & Integration Tests**: Comprehensive tests covering ignore rules, language detection, AST parsing, chunk hashing, database transactions, and hybrid search.
- [x] **9.3 Performance Benchmarks**: Indexing speed (files/sec), search latency, and memory footprint.
- [x] **9.4 Documentation & README**: Comprehensive guide, CLI manual, and SDK examples.

---

## 4. Execution Record & Change Log

| Date       | Phase / Task        | Status    | Summary of Actions & Deliverables                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-05 | Architecture & Plan | Approved  | Created living plan in `docs/PLAN.md` and approved `implementation_plan.md`.                                                                                                                                                                                                                                                                                               |
| 2026-09-05 | Phase 1 (1.1 - 1.3) | Completed | Initialized monorepo with pnpm workspaces, Turborepo, TS config, scaffolded all 7 packages, defined core domain contracts in `@code-lense/core/types`.                                                                                                                                                                                                                     |
| 2026-09-05 | Phase 2 (2.1 - 2.6) | Completed | Implemented `DefaultIgnoreMatcher`, `FileClassifier` (binary, generated, minified, vendor), `LanguageDetector` (25+ langs), `ProjectRecognizer` (monorepo, package managers including Bit, Next.js routes, layers), `GitIntelligence` (HEAD, branch, changes, commits, diffs), and `RepositoryScanner`.                                                                    |
| 2026-09-05 | Phase 3 (3.1 - 3.5) | Completed | Implemented `SymbolExtractor` (TypeScript, Python, Go, Rust, and generic fallback), hierarchical symbol extraction (`parentId`), `SemanticChunker` with AST-aware line boundaries, deterministic semantic hashing `hash(normalizedCode + symbolName + language)`, and `DependencyResolver`. Verified via vitest.                                                           |
| 2026-09-05 | Phase 4 (4.1 - 4.5) | Completed | Implemented `SQLiteDatabase` with WAL, PRAGMAs, and atomic transactions; schema migrations for files, symbols, chunks, dependencies, graph_edges, git_state; FTS5 virtual tables (`chunks_fts`, `symbols_fts`); `SQLiteVectorStore` with cosine distance; and `RepositoryDatabase` domain stores.                                                                          |
| 2026-09-05 | Phase 5 (5.1 - 5.5) | Completed | Implemented `IncrementalIndexer` coordinating change detection (unchanged, modified, added, deleted), cascade deletions, AST symbol & chunk re-extraction, dependency graph edge generation, Git state tracking, and isolated error recovery.                                                                                                                              |
| 2026-09-05 | Phase 6 (6.1 - 6.5) | Completed | Implemented `LexicalSearchEngine` (FTS5 BM25), `SymbolSearchEngine`, `SemanticSearchEngine`, `SearchRanker` (Reciprocal Rank Fusion RRF & multi-signal scoring), and `HybridSearchEngine`. Verified via vitest.                                                                                                                                                            |
| 2026-09-05 | Phase 7 (7.1 - 7.5) | Completed | Implemented `EmbeddingFactory`, `CachedEmbeddingProvider`, `MockEmbeddingProvider`, `OllamaEmbeddingProvider`, `OpenAIEmbeddingProvider`, `LLMProvider` (Mock, Ollama, OpenAI), `ContextBuilder` (budget-aware hybrid context assembly), and `AskEngine`. Verified via vitest.                                                                                             |
| 2026-09-05 | Phase 8 (8.1 - 8.4) | Completed | Implemented `code-lense` CLI (commands: `init`, `index`, `status`, `search`, `ask`, `files`, `symbols`, `graph`, `watch`, `doctor`, `config`), output formatters with tables/colors/JSON, and the programmatic TypeScript SDK (`@code-lense/sdk`). Verified via CLI execution and vitest.                                                                                  |
| 2026-09-05 | Phase 9 (9.1 - 9.4) | Completed | Created multi-language test fixtures (TypeScript, Python, Go, Rust, Bit workspace), end-to-end integration tests (15 test suites, 53 tests passing), performance benchmark (648 files/sec indexing throughput, 68ms incremental check, 0.44ms search latency), and comprehensive root `README.md`.                                                                         |
| 2026-09-05 | DB Architecture     | Completed | Redesigned database schema and structured versioned migrations: introduced `schema_migrations` tracking table, transactional `MigrationRunner` (`migrateToLatest`, `rollbackLast`, `getCurrentVersion`), eliminated dead tables, added unique path constraint, and created automated FTS5 sync triggers. Tested with 16 test suites, 56/56 passing tests.                  |
| 2026-09-05 | CLI Help Command    | Completed | Implemented dedicated `code-lense help [command]` command and metadata registry (`help-data.ts`), supporting categorized command overview and deep flag/argument documentation with examples. Tested via vitest (17 test suites, 60/60 passing tests).                                                                                                                     |
| 2026-09-05 | Common Logger       | Completed | Created unified colorized & timestamped Logger in `@code-lense/core` (`packages/core/src/logger/`), supporting millisecond timestamps, level badges (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SUCCESS`), contextual tagging (`withContext`), and raw passthrough. Replaced raw `console` usage across all CLI commands. Tested via vitest (18 test suites, 65/65 passing tests). |
| 2026-09-05 | Next.js Docs App    | Completed | Built full-featured Next.js documentation website in `apps/docs`, rendering native Markdown files from `docs/` with dynamic TOC, instant `Cmd+K` search dialog, syntax highlighting, dark mode, and dedicated deep dives on storage (`~/.code-lense/repositories/<repo-id>/index.db`) and repository scoping (`${basename}-${hash8}`). Verified via Next.js build & curl.  |
