# Code Lense Documentation

> **"See your codebase clearly."**  
> A high-performance, local-first repository intelligence engine that transforms codebases into searchable, structured, and AI-ready knowledge graphs.

---

## Welcome to Code Lense

**Code Lense** is designed from the ground up for software architects, developer tooling engineers, and AI code assistants. Unlike simple RAG wrappers that slice code into arbitrary character chunks, Code Lense parses your code into true Abstract Syntax Trees (ASTs), models relationships between symbols, indexes Git intelligence, and provides deterministic hybrid search—all locally on your machine.

```
                      Code Lense Engine
                             │
                  ┌──────────┴──────────┐
                  │                     │
                 CLI                   SDK
             (Terminal)           (TypeScript)
                  │                     │
                  └──────────┬──────────┘
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
          Deterministic              Statistical
          Code Analysis             Intelligence
         (AST & Symbols)         (Vectors & BM25)
                 │                       │
                 └───────────┬───────────┘
                             │
                             ▼
                    ~/.code-lense/
            repositories/<repo-id>/index.db
             (Isolated SQLite + WAL Engine)
```

---

## Why Code Lense?

| Capability              | Naive Code RAG / Grep                      | Code Lense                                                                      |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| **Privacy & Locality**  | Often sends files to 3rd-party clouds      | **100% Local-First** (Zero data leaves your machine)                            |
| **Code Understanding**  | Blind character or token slicing           | **AST-Aligned Semantic Chunks** (Functions, classes, routes)                    |
| **Symbol Hierarchy**    | Flat text matches                          | **Parent-Child Linkage** (Methods linked to class, hooks to components)         |
| **Search Engine**       | Pure lexical grep or pure vector cosine    | **Reciprocal Rank Fusion (RRF)**: Lexical + Semantic + Symbol + Path + Graph    |
| **Storage & Scoping**   | Clutters project directories or global mix | **Deterministic Repository Scoping** in `~/.code-lense/repositories/<repo-id>/` |
| **Change Detection**    | Re-indexes entire workspace on changes     | **Incremental Indexing** with SHA-256 semantic chunk hash reuse                 |
| **Framework Awareness** | None (treats code as plain text)           | Native detection for Next.js routes, React components, Bit workspaces           |

---

## Core Capabilities

- 🔍 **Multi-Signal Hybrid Search**: Combines SQLite FTS5 (BM25 lexical search) and dense vector embeddings (cosine distance) using Reciprocal Rank Fusion ($RRF$).
- 🌲 **Tree-Sitter AST Symbol Extraction**: Extracts classes, interfaces, functions, methods, enums, variables, React components, hooks, and API endpoints across TypeScript, JavaScript, Python, Go, and Rust.
- ⚡ **Lightning-Fast Incremental Indexing**: Re-indexes large repositories at over **900+ files/second**. Unmodified files are skipped in milliseconds using content hashes.
- 🛡️ **Zero Project Pollution**: Indexes, databases, vector BLOBs, and caches are stored outside your workspace in `~/.code-lense/repositories/<repo-id>/index.db`.
- 🧩 **Pluggable AI & Embeddings**: Works out of the box with zero dependencies (Mock engine), local LLMs via **Ollama**, or cloud providers (**OpenAI**).
- 📦 **Monorepo & Bit Workspace Native**: First-class support for pnpm workspaces, Turborepo, Lerna, Nx, and Bit component workspaces (`workspace.jsonc`).

---

## Navigating the Documentation

- [Installation & Quickstart](installation.md): How to install Code Lense, run system diagnostics, and index your first repository.
- [Storage & Architecture](storage-and-architecture.md): Where repository data is saved, SQLite database schema, WAL mode, and vector BLOB storage.
- [Repository Scoping](repo-scoping.md): How repositories are uniquely scoped, collision prevention, isolation, and monorepo detection.
- [CLI Reference](cli-reference.md): Full manual for all 12 command-line tools.
- [SDK Reference](sdk-reference.md): Programmatic TypeScript API documentation with practical recipes.
- [Configuration & Ignore Engine](configuration.md): Customizing search weights, storage directories, and `.repolensignore` rules.
