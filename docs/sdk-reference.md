# TypeScript SDK Reference

The `@code-lense/sdk` package provides a programmatic TypeScript API for embedding Code Lense directly into developer tooling, AI coding agents, IDE extensions, or CI/CD automated review bots.

---

## 1. Installation

```bash
pnpm add @code-lense/sdk
# or
npm install @code-lense/sdk
```

---

## 2. Quickstart

```typescript
import { CodeLense } from '@code-lense/sdk';

// 1. Open repository (automatically runs migrations & loads database)
const repo = await CodeLense.open('/path/to/my-repo', {
  storageDir: '/optional/custom/storage',
});

// 2. Index the repository (incremental by default)
const report = await repo.index();
console.log(`Indexed ${report.filesIndexed} files in ${report.durationMs.toFixed(2)}ms`);

// 3. Search code with hybrid ranking
const results = await repo.search('AuthService', {
  mode: 'hybrid',
  limit: 5,
});

for (const res of results) {
  console.log(`[${res.score.toFixed(3)}] ${res.filePath}:${res.startLine}`);
}

// 4. Close database connection when done
repo.close();
```

---

## 3. Core API Reference

### `CodeLense.open(rootPath, options?)`

Initializes a `CodeLense` repository instance.

```typescript
static async open(
  rootPath: string,
  options?: CodeLenseConfig
): Promise<CodeLense>
```

#### Parameters:

- `rootPath` (`string`): Absolute or relative path to the repository root.
- `options` (`CodeLenseConfig`): Optional configuration overrides:
  - `storageDir?: string`: Base directory for SQLite databases (default: `~/.code-lense`).
  - `includeHidden?: boolean`: Whether to scan hidden files (default: `false`).
  - `maxFileSize?: number`: Maximum file size in bytes to index (default: `1,048,576` = 1MB).
  - `embeddingProvider?: EmbeddingProvider`: Pluggable embedding provider instance.
  - `llmProvider?: LLMProvider`: Pluggable LLM provider instance.

---

### `repo.index(options?)`

Scans and indexes the repository.

```typescript
async index(options?: {
  full?: boolean;
  skipEmbeddings?: boolean;
}): Promise<IndexingReport>
```

#### Returns `IndexingReport`:

```typescript
interface IndexingReport {
  repositoryId: string;
  filesIndexed: number;
  filesSkipped: number;
  symbolsExtracted: number;
  chunksCreated: number;
  durationMs: number;
  errors: Array<{ file: string; error: string }>;
}
```

---

### `repo.search(query, options?)`

Executes multi-signal code search.

```typescript
async search(
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]>
```

#### `SearchOptions`:

- `mode?: 'lexical' | 'semantic' | 'symbol' | 'hybrid'` (default: `'hybrid'`)
- `limit?: number` (default: `10`)
- `language?: string` (e.g. `'typescript'`)
- `pathPattern?: string` (e.g. `'src/controllers/**'`)

---

### `repo.ask(question, options?)`

Answers questions about the codebase using grounded AST symbols, dependency graphs, and recent Git changes.

```typescript
async ask(
  question: string,
  options?: {
    model?: string;
    maxContextTokens?: number;
  }
): Promise<AskResult>
```

#### Returns `AskResult`:

```typescript
interface AskResult {
  question: string;
  answer: string;
  citations: Array<{
    filePath: string;
    startLine: number;
    endLine: number;
    symbolName?: string;
  }>;
  contextSizeTokens: number;
}
```

---

### `repo.getStatus()`

Returns metadata, statistics, and Git state.

```typescript
async getStatus(): Promise<RepositoryStatus>
```

---

### `repo.getFiles(filter?)`

Retrieves tracked files with language and size attributes.

```typescript
async getFiles(filter?: {
  language?: string;
  limit?: number;
}): Promise<FileInfo[]>
```

---

### `repo.getSymbols(name?, filter?)`

Queries extracted symbols across all indexed files.

```typescript
async getSymbols(
  name?: string,
  filter?: { kind?: SymbolKind; limit?: number }
): Promise<CodeSymbol[]>
```

---

### `repo.getGraph(filePath, options?)`

Traverses import and caller dependency relationships.

```typescript
async getGraph(
  filePath: string,
  options?: { direction?: 'both' | 'dependencies' | 'dependents'; depth?: number }
): Promise<{ dependencies: Dependency[]; dependents: Dependency[] }>
```

---

### `repo.close()`

Closes SQLite connections and releases file locks.

```typescript
close(): void
```
