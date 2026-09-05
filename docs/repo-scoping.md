# Repository Scoping & Isolation

This guide explains in detail **how Code Lense scopes repositories**, generates deterministic identifiers, enforces strict cross-project isolation, and seamlessly handles monorepos and Bit workspaces.

---

## 1. The Repository Scoping Problem

In modern development environments, developers frequently work across dozens of repositories. Common challenges include:

1. **Naming Collisions**: Two completely unrelated projects might share the directory name `backend`, `api`, or `web` (e.g., `/home/user/client-a/backend` vs. `/home/user/client-b/backend`).
2. **Repository Pollution**: Naive tools drop gigabytes of cache files or SQLite databases directly inside the project root or `.git/` folder, causing Git staging mistakes and disk clutter.
3. **Cross-Project Leakage**: Shared or global vector stores risk mixing symbol names, API keys, or code chunks between confidential enterprise repositories and personal experiments.

Code Lense solves all three problems through **deterministic, path-hashed repository scoping**.

---

## 2. Deterministic Repository ID Generation

Every repository indexed by Code Lense receives a unique, collision-proof identifier computed by the core `RepositoryHelper`:

```typescript
// packages/core/src/repository/index.ts
export class RepositoryHelper {
  public static getRepositoryId(rootPath: string): string {
    const resolved = path.resolve(rootPath);
    const basename = path
      .basename(resolved)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const hash = crypto.createHash('sha256').update(resolved).digest('hex').slice(0, 8);
    return `${basename}-${hash}`;
  }
}
```

### The 3-Step ID Algorithm

1. **Canonical Absolute Path Resolution**:
   `rootPath` is resolved to its fully qualified, absolute filesystem path (`path.resolve(rootPath)`). Relative paths (`.`, `../repo`) and symlinks are normalized.
2. **Directory Slug Extraction**:
   The directory basename is extracted, converted to lowercase, and sanitized so non-alphanumeric characters become hyphens (e.g. `@org/core-service` $\rightarrow$ `org-core-service`).
3. **SHA-256 Path Hashing**:
   A SHA-256 digest of the canonical path string is calculated, and the first 8 hexadecimal characters are truncated.
4. **Composite Identifier**:
   The result is `${basename}-${hash8}`.

### Example ID Computation

| Project Path                          | Computed Repository ID     |
| ------------------------------------- | -------------------------- |
| `/home/user/work/payment-service`     | `payment-service-a1b2c3d4` |
| `/home/user/personal/payment-service` | `payment-service-8f9e0a1b` |
| `/var/repos/finance/backend`          | `backend-4c5d6e7f`         |
| `/home/user/experiments/backend`      | `backend-12345678`         |

Even if two repositories share the identical directory name `payment-service`, their computed repository IDs are guaranteed to be unique because their absolute filesystem paths differ.

---

## 3. Strict Cross-Repository Isolation

Code Lense guarantees complete physical and logical isolation between repositories:

```text
~/.code-lense/repositories/
├── payment-service-a1b2c3d4/           <-- Work Payment Service
│   └── index.db
│       ├── files
│       ├── symbols
│       ├── chunks
│       └── vectors
└── payment-service-8f9e0a1b/           <-- Personal Payment Service
    └── index.db
        ├── files
        ├── symbols
        ├── chunks
        └── vectors
```

- **Dedicated SQLite Database**: Each repository has its own independent `index.db` file.
- **Zero Cross-Talk**: Queries executed in one repository can never return search results, symbols, or chunks from another repository.
- **Independent Lifecycles**: Deleting the index for one repository (`rm -rf ~/.code-lense/repositories/<id>`) has zero impact on any other project.
- **Zero Pollution**: The target repository itself contains no database artifacts. Only optional, human-readable configuration files (`.repolensconfig`, `.repolensignore`) live in the project root.

---

## 4. Monorepo & Workspace Scoping

Code Lense natively understands monorepo boundaries and multi-package workspaces.

### Supported Monorepo Systems

Code Lense automatically detects:

- **pnpm Workspaces**: `pnpm-workspace.yaml`
- **Turborepo**: `turbo.json`
- **Lerna**: `lerna.json`
- **Nx**: `nx.json`
- **npm / Yarn Workspaces**: `package.json` with `"workspaces": [...]`

### Unified Monorepo Graph

When Code Lense indexes a monorepo:

1. It establishes the monorepo root as the parent repository scope.
2. It detects each package in `packages/*`, `apps/*`, or `libs/*`.
3. It resolves cross-package dependency relationships (e.g., `@myorg/web` importing `@myorg/ui`).
4. Graph edges are saved with directional links (`imports`, `defines`, `calls`), allowing you to query dependencies across the entire monorepo.

---

## 5. Bit Workspace Intelligence

Code Lense provides first-class support for **Bit workspaces** (`workspace.jsonc`):

```jsonc
// workspace.jsonc
{
  "$schema": "https://static.bit.dev/teambit/schemas/schema.json",
  "teambit.workspace/workspace": {
    "name": "my-bit-workspace",
    "defaultScope": "my-company.scope",
  },
}
```

### What Code Lense Detects in Bit Repositories:

1. **Bit Workspace Marker**: Flags the repository as a Bit workspace upon detecting `workspace.jsonc`.
2. **Default Scope Identification**: Extracts the organization scope (e.g., `my-company.scope`).
3. **Component Boundaries**: Respects component encapsulation and dependency rules.
4. **Internal Bit Cache Filtering**: Automatically ignores Bit internal artifact paths (`.bit`, `.capsules`, `node_modules/.bit`) in the ignore engine.

---

## 6. Incremental Indexing & Change Isolation

Repository scoping is integrated with file-level change detection:

```text
Repository Scan (500 Files)
          │
          ├── SHA-256 Hash Unchanged (495 files) ──> SKIPPED in ~40ms
          │
          └── SHA-256 Hash Modified (5 files)
                    │
                    ├── Parse AST Symbols
                    ├── Compare Semantic Hash of Chunks
                    │         │
                    │         ├── Hash Match: Reuse Vector Embedding
                    │         └── Hash Diff: Generate New Embedding
                    │
                    └── Atomic SQLite Transaction Commit
```

- **Per-File Error Isolation**: If a developer introduces a syntax error into `src/broken.ts`, Code Lense logs the error for that single file and continues indexing all other 499 files successfully.
- **Cascade Pruning**: When a file is removed or renamed in Git, database triggers immediately cascade-delete its symbols, AST chunks, FTS5 index records, and vector embeddings.
