# Configuration & Ignore Engine

Code Lense provides granular control over repository scanning, ignore rules, embedding providers, and search weights via project configuration and ignore files.

---

## 1. Project Configuration (`.repolensconfig`)

You can create a `.repolensconfig` JSON file in your repository root (or globally at `~/.repolensconfig`):

```bash
code-lense init
```

### Full Configuration Example

```json
{
  "storageDir": "~/.code-lense",
  "maxFileSize": 1048576,
  "includeHidden": false,
  "embeddings": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "dimensions": 768,
    "baseUrl": "http://localhost:11434"
  },
  "llm": {
    "provider": "ollama",
    "model": "llama3",
    "baseUrl": "http://localhost:11434"
  },
  "search": {
    "weights": {
      "lexical": 0.35,
      "semantic": 0.35,
      "symbol": 0.15,
      "path": 0.1,
      "graph": 0.05
    }
  }
}
```

### Configuration Options

| Option                | Type      | Default         | Description                                          |
| --------------------- | --------- | --------------- | ---------------------------------------------------- |
| `storageDir`          | `string`  | `~/.code-lense` | Custom directory for repository SQLite databases     |
| `maxFileSize`         | `number`  | `1048576` (1MB) | Maximum file size in bytes to index                  |
| `includeHidden`       | `boolean` | `false`         | Whether to process dotfiles (e.g. `.env`, `.github`) |
| `embeddings.provider` | `string`  | `"mock"`        | Embedding provider (`mock`, `ollama`, `openai`)      |
| `embeddings.model`    | `string`  | varies          | Embedding model identifier                           |
| `llm.provider`        | `string`  | `"mock"`        | LLM provider for `code-lense ask`                    |
| `search.weights.*`    | `number`  | see table       | Multi-signal linear weights for hybrid reranking     |

---

## 2. Ignore Engine & Precedence (`.repolensignore`)

Code Lense evaluates files through a **three-tier hierarchical ignore matcher**:

```text
Target File Path
       │
       ├── Tier 1: Built-in Safety Rules
       │   (node_modules, .git, dist, build, *.lock, .env*, secrets, binary inspection)
       │   └── If matched ──> IGNORED
       │
       ├── Tier 2: Repository .gitignore
       │   (Standard Git ignore patterns from project root)
       │   └── If matched ──> IGNORED
       │
       └── Tier 3: Custom .repolensignore
           (Code Lense specific ignore rules)
           └── If matched ──> IGNORED
```

### Built-in Hardcoded Ignores

The engine automatically excludes:

- Dependencies: `node_modules/`, `vendor/`, `.pnpm/`
- Build outputs: `dist/`, `build/`, `out/`, `target/`, `.next/`
- Version control: `.git/`, `.svn/`, `.hg/`
- Binary files: `.png`, `.jpg`, `.pdf`, `.zip`, `.exe`, `.tar`, and any file containing null bytes in its first 8KB.
- Secret files: `.env*`, `*.pem`, `*.key`, `id_rsa`
- Monorepo tool caches: `.turbo/`, `.bit/`, `.capsules/`

### Custom `.repolensignore` Syntax

Standard gitignore pattern syntax is supported:

```gitignore
# Ignore documentation generator output
docs/.vitepress/dist/
apps/docs/.next/

# Ignore large mock data fixtures
test/fixtures/large-dumps/

# Ignore minified bundles
**/*.bundle.js
**/*.min.js
```
