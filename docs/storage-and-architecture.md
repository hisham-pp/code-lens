# Storage & Architecture

This guide explains in detail **where Code Lense saves your data**, how the underlying storage engine is structured, and how SQLite with Write-Ahead Logging (WAL) powers zero-cloud, high-performance repository intelligence.

---

## 1. Storage Location Hierarchy

Code Lense follows a strict **zero-pollution philosophy**. It never clutters your project directories with multi-gigabyte cache folders or internal database files. Instead, all indexed metadata, symbols, AST chunks, search indexes, and vector embeddings are stored externally in a centralized user directory.

### Default Storage Directory

By default, Code Lense stores all data under the user's home directory:

```text
~/.code-lense/
├── .perm-check                             # Diagnostics write-permission probe
└── repositories/                           # Repository-scoped directory root
    ├── code-lens-a1b2c3d4/                 # Scoped directory for repo A
    │   ├── index.db                        # Primary SQLite database
    │   ├── index.db-wal                    # Write-Ahead Log (WAL mode)
    │   └── index.db-shm                    # Shared-memory index for WAL
    └── my-web-app-9e8f7a6b/                # Scoped directory for repo B
        ├── index.db
        ├── index.db-wal
        └── index.db-shm
```

### Path Breakdown

| File / Folder              | Location                                | Purpose                                                                                         |
| -------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Base Storage Directory** | `~/.code-lense/`                        | Global root for all Code Lense cache and state                                                  |
| **Repositories Root**      | `~/.code-lense/repositories/`           | Directory containing all indexed repository silos                                               |
| **Repository Workspace**   | `~/.code-lense/repositories/<repo-id>/` | Dedicated directory for a single repository                                                     |
| **Primary Database**       | `<repo-dir>/index.db`                   | Single-file SQLite database containing all metadata, symbols, chunks, FTS5 indexes, and vectors |
| **WAL File**               | `<repo-dir>/index.db-wal`               | High-concurrency transaction journal                                                            |
| **SHM File**               | `<repo-dir>/index.db-shm`               | Shared memory map for concurrent reader coordination                                            |

---

## 2. Customizing the Storage Location

You can override the storage directory at any level depending on your environment (e.g., CI runners, secondary SSDs, or team shared disks):

### Method 1: Project Configuration (`.repolensconfig`)

Add `storageDir` to `.repolensconfig` in your repository root:

```json
{
  "storageDir": "/mnt/fast-ssd/code-lense-cache"
}
```

### Method 2: Global User Configuration (`~/.repolensconfig`)

Set a global default for all repositories on your system:

```json
{
  "storageDir": "/var/cache/code-lense"
}
```

### Method 3: CLI Flag

Pass `--storage-dir` to any CLI command:

```bash
code-lense index --storage-dir /tmp/my-cache
code-lense search "AuthService" --storage-dir /tmp/my-cache
```

### Method 4: Programmatic SDK

Specify `storageDir` when calling `CodeLense.open()`:

```typescript
import { CodeLense } from '@code-lense/sdk';

const repo = await CodeLense.open(process.cwd(), {
  storageDir: '/custom/storage/path',
});
```

---

## 3. SQLite Database Architecture

Code Lense uses embedded **SQLite** configured for maximum read/write concurrency and ACID resilience.

### Performance PRAGMAs Applied on Connection

```sql
PRAGMA journal_mode = WAL;          -- Non-blocking concurrent readers & writers
PRAGMA synchronous = NORMAL;        -- Safe durability without disk bottleneck
PRAGMA foreign_keys = ON;           -- Enforces relational integrity & cascades
PRAGMA busy_timeout = 5000;         -- 5-second wait during concurrent writes
PRAGMA cache_size = -64000;         -- 64MB in-memory page cache
```

---

## 4. Relational Schema & Tables

All repository intelligence is organized into structured tables:

### 1. `repositories`

Tracks indexed repository roots, identity, and timestamps.

```sql
CREATE TABLE repositories (
  id TEXT PRIMARY KEY,
  root_path TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### 2. `files`

Stores all tracked source files with SHA-256 content hashes for incremental change detection.

```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  relative_path TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  language TEXT NOT NULL,
  is_binary INTEGER NOT NULL DEFAULT 0,
  is_generated INTEGER NOT NULL DEFAULT 0,
  last_indexed_at INTEGER NOT NULL,
  UNIQUE(repository_id, relative_path)
);
```

### 3. `symbols`

Hierarchical AST symbols (classes, methods, functions, interfaces, types, components, hooks).

```sql
CREATE TABLE symbols (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  parent_id TEXT REFERENCES symbols(id) ON DELETE CASCADE,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  start_byte INTEGER NOT NULL,
  end_byte INTEGER NOT NULL,
  signature TEXT,
  docstring TEXT,
  language TEXT NOT NULL
);
```

### 4. `chunks`

AST-aligned code snippets with deterministic semantic hashes.

```sql
CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  symbol_id TEXT REFERENCES symbols(id) ON DELETE SET NULL,
  chunk_type TEXT NOT NULL,
  content TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  semantic_hash TEXT NOT NULL,
  language TEXT NOT NULL
);
```

### 5. `dependencies` & `graph_edges`

Directional code relationships (`imports`, `calls`, `defines`).

```sql
CREATE TABLE dependencies (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  specifier TEXT NOT NULL
);

CREATE TABLE graph_edges (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  edge_type TEXT NOT NULL
);
```

### 6. `git_state`

Tracks working tree cleanliness, current branch, and HEAD commit.

```sql
CREATE TABLE git_state (
  repository_id TEXT PRIMARY KEY REFERENCES repositories(id) ON DELETE CASCADE,
  branch TEXT NOT NULL,
  head_commit TEXT NOT NULL,
  is_dirty INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

---

## 5. Full-Text Search Virtual Tables (FTS5)

For BM25 lexical ranking, Code Lense uses SQLite's native FTS5 extension:

```sql
CREATE VIRTUAL TABLE chunks_fts USING fts5(
  content,
  language UNINDEXED,
  content_rowid UNINDEXED,
  tokenize = 'porter unicode61'
);

CREATE VIRTUAL TABLE symbols_fts USING fts5(
  name,
  signature,
  docstring,
  content_rowid UNINDEXED,
  tokenize = 'porter unicode61'
);
```

### Automated FTS Synchronization Triggers

When a file, chunk, or symbol is deleted or cascade-deleted, database triggers automatically keep the FTS index 100% consistent without requiring manual re-indexing:

```sql
CREATE TRIGGER chunks_ad AFTER DELETE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, content)
  VALUES('delete', old.rowid, old.content);
END;

CREATE TRIGGER symbols_ad AFTER DELETE ON symbols BEGIN
  INSERT INTO symbols_fts(symbols_fts, rowid, name, signature, docstring)
  VALUES('delete', old.rowid, old.name, old.signature, old.docstring);
END;
```

---

## 6. Vector Storage (Float32Array BLOBs)

Vector embeddings for semantic search are stored directly in SQLite as raw IEEE 754 Float32 binary BLOBs:

```sql
CREATE TABLE vectors (
  id TEXT PRIMARY KEY,
  chunk_id TEXT UNIQUE NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  dimensions INTEGER NOT NULL,
  embedding BLOB NOT NULL
);
```

### In-Engine SIMD Cosine Distance

Code Lense reads vector BLOBs as `Float32Array` buffers and executes high-speed vectorized cosine distance computations:

$$\text{similarity}(A, B) = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}$$

Because vector BLOBs are linked to `chunks(id)` with `ON DELETE CASCADE`, modifying or deleting a source file automatically frees the associated vector records and avoids orphaned embeddings.
