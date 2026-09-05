# Code Lense

> **"See your codebase clearly."**  
> Local-first repository intelligence engine for developers.

---

## Overview

**Code Lense** is a local-first repository intelligence engine that transforms source code into structured knowledge graphs, hybrid-searchable indexes, and coherent context for AI assistants.

It combines **deterministic code analysis**, **Git intelligence**, **full-text search (SQLite FTS5)**, **vector/semantic search**, and **graph relationship mapping** into a single local developer tool.

- **Local-First & Private**: 100% of your source code, symbols, AST chunks, and Git history remain on your machine in `~/.code-lense/`.
- **Zero AI Required for Core Engine**: Fully functional deterministic AST parsing, FTS5 BM25 lexical search, symbol extraction, and dependency graphing with zero AI or external network calls.
- **AST-Aware Semantic Chunking**: Chunks by function, method, and class boundaries rather than blind character slicing.
- **Deterministic Semantic Hashing**: Chunks retain stable hashes across line shifts, skipping redundant embedding computation during refactorings.
- **Multi-Signal Hybrid Ranking**: Fuses lexical BM25, semantic cosine similarity, symbol match, path proximity, and graph connectivity via Reciprocal Rank Fusion (RRF).

---

## Performance Highlights

Tested on 500 synthetic modules (2,000 symbols, 2,000 chunks):

| Benchmark Metric                 | Result                 |
| -------------------------------- | ---------------------- |
| **Initial Indexing Throughput**  | **648 files / second** |
| **Incremental Indexing (No-op)** | **68.96 ms**           |
| **Average Search Latency**       | **0.44 ms**            |
| **P95 Search Latency**           | **0.79 ms**            |

---

## Monorepo Packages

```text
code-lens/
├── packages/
│   ├── core/         # Scanner, IgnoreMatcher, Tree-sitter parsers, Symbols, Chunker, Git, Indexing
│   ├── database/     # SQLite manager, migrations, FTS5 virtual tables, VectorStore, repositories
│   ├── search/       # Lexical (FTS5 BM25), semantic, symbol, hybrid search & multi-signal ranker
│   ├── embeddings/   # Pluggable embedding providers (Ollama, Transformers.js, OpenAI, Local Mock)
│   ├── ai/           # LLM providers (Ollama, OpenAI, Mock), ContextBuilder, AskEngine
│   ├── cli/          # `code-lense` command line interface
│   └── sdk/          # Programmatic TypeScript SDK (`CodeLense.open()`)
```

---

## CLI Installation & Usage

### 1. Build and Link CLI

```bash
pnpm install
pnpm build
npm link ./packages/cli
```

### 2. Available Commands

```bash
# Check system health and prerequisites
code-lense doctor

# Initialize .repolensconfig and .repolensignore
code-lense init [path]

# Index or incrementally update repository
code-lense index [path] [--force] [--verbose]

# View repository status, language breakdown, and freshness
code-lense status [path]

# Multi-signal hybrid search
code-lense search "AuthService" [path] [--mode hybrid|lexical|semantic|symbol] [--lang ts] [--json]

# Natural-language Q&A grounded in codebase context
code-lense ask "How does user authentication work?" [path]

# List indexed files with metadata
code-lense files [path] [--lang typescript] [--json]

# Search and inspect extracted symbols
code-lense symbols [name] [path] [--type class|function|method]

# Inspect dependency and call graph
code-lense graph src/services/auth.service.ts [path]

# Start file-watcher mode with auto debounced re-indexing
code-lense watch [path]

# Inspect or set configuration
code-lense config
code-lense config embedding.enabled true
```

---

## Programmatic TypeScript SDK

```typescript
import { CodeLense } from '@code-lense/sdk';

// 1. Open repository
const repo = await CodeLense.open('./my-repo', {
  embedding: {
    enabled: true,
    provider: 'ollama', // or 'openai', 'mock'
    model: 'nomic-embed-text',
  },
  llm: {
    enabled: true,
    provider: 'ollama',
    model: 'llama3.2',
  },
});

// 2. Incremental index
const report = await repo.index();
console.log(`Indexed ${report.filesIndexed} files in ${report.durationMs}ms`);

// 3. Multi-signal search
const results = await repo.search({
  query: 'validateToken',
  mode: 'hybrid',
  limit: 10,
});

for (const result of results) {
  console.log(
    `${result.filePath}:${result.startLine} (${result.symbolName}) - Score: ${result.score}`,
  );
}

// 4. Codebase Q&A
const answer = await repo.ask('Where are API routes configured?');
console.log(answer.answer);

// 5. Query symbols & dependency graph
const symbols = repo.symbols.find('AuthService');
const deps = repo.graph.dependencies('src/auth.service.ts');

repo.close();
```

---

## Supported Languages & Frameworks

### Programming Languages (25+)

TypeScript, JavaScript, JSX, TSX, Python, Go, Rust, Java, Kotlin, C, C++, C#, PHP, Ruby, Swift, Dart, SQL, HTML, CSS, SCSS, JSON, YAML, TOML, Markdown, Shell, Dockerfile.

### Project & Framework Recognition

- **Workspaces & Monorepos**: pnpm, Turborepo, Lerna, Nx, and **Bit workspaces** (`workspace.jsonc`).
- **Frameworks**: Next.js (App Router & Pages Router API routes), React, NestJS, Express, Fastify, Django, FastAPI, Flask, Spring Boot, Astro, Vue, Svelte.
- **Architectural Layers**: Controllers, Services, Repositories, Models, Components, Hooks, Middleware, Config, Utilities.

---

## Testing

```bash
# Run unit & integration test suites
pnpm test

# Run performance benchmarks
node tests/benchmark.ts
```

---

## License

MIT
