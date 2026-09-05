# CLI Reference

The `code-lense` command line interface provides a complete suite of developer tooling for repository analysis, search, diagnostics, and AI assistance.

```text
Usage: code-lense <command> [options] [path]
```

---

## Command Overview

| Command                               | Category     | Description                                                      |
| ------------------------------------- | ------------ | ---------------------------------------------------------------- |
| [`doctor`](#code-lense-doctor)        | Diagnostics  | Check system environment and storage prerequisites               |
| [`init`](#code-lense-init)            | Setup        | Initialize `.repolensconfig` and `.repolensignore` in repository |
| [`index`](#code-lense-index)          | Indexing     | Scan and index repository files, symbols, chunks, and Git state  |
| [`status`](#code-lense-status)        | Intelligence | Display indexed repository summary, languages, and Git stats     |
| [`search`](#code-lense-search-query)  | Search       | Perform lexical, semantic, symbol, or hybrid search              |
| [`ask`](#code-lense-ask-question)     | AI           | Ask natural language questions with contextual code citations    |
| [`files`](#code-lense-files)          | Explorer     | List and filter indexed files by language, size, or pattern      |
| [`symbols`](#code-lense-symbols-name) | Intelligence | Inspect extracted functions, classes, types, and components      |
| [`graph`](#code-lense-graph-file)     | Intelligence | Inspect dependency and dependent relationships                   |
| [`watch`](#code-lense-watch)          | Indexing     | Watch repository for changes and re-index incrementally          |
| [`config`](#code-lense-config)        | Config       | View or modify global and local Code Lense configuration         |
| [`help`](#code-lense-help-command)    | Reference    | Show interactive documentation and usage examples                |

---

## `code-lense doctor`

Runs comprehensive environment diagnostics to ensure Code Lense can run smoothly on your system.

```bash
code-lense doctor
```

### Options

- `--json`: Output diagnostic results in structured JSON.

### Checks Performed

- Node.js runtime version ($\ge 20.0.0$)
- Git executable availability and version
- SQLite database driver and in-memory execution
- SQLite FTS5 extension compilation
- Float32Array SIMD vector buffer support
- Storage directory read and write permissions (`~/.code-lense`)

---

## `code-lense init`

Scaffolds initial configuration and ignore files in the current repository root.

```bash
code-lense init [path]
```

### Options

- `--force`: Overwrite existing `.repolensconfig` and `.repolensignore` files.

### Files Created

- `.repolensconfig`: Project settings (embedding provider, search weights, storage path overrides).
- `.repolensignore`: Repository ignore patterns (caches, build outputs, proprietary assets).

---

## `code-lense index`

Scans and indexes the repository. By default, executes an incremental index that only processes added or modified files.

```bash
code-lense index [path] [options]
```

### Options

- `--full`: Force a full re-index from scratch, clearing existing cache.
- `--no-embeddings`: Skip vector embedding generation (faster index for pure AST/FTS search).
- `--storage-dir <dir>`: Custom base storage directory.
- `--json`: Output report as JSON.

### Example Output

```text
[15:12:01.402] [INFO]    [index] Scanning repository /home/user/my-app...
[15:12:01.810] [SUCCESS] [index] Indexing complete:
  Files Indexed:      500
  Files Skipped:      0
  Symbols Extracted:  2,140
  Chunks Created:     2,140
  Duration:           540.27 ms
  Throughput:         925 files/sec
```

---

## `code-lense status`

Displays a rich terminal dashboard summarizing the current state of the indexed repository.

```bash
code-lense status [path] [options]
```

### Options

- `--json`: Output status summary as JSON.

### What it Displays

- Repository root path & computed repository ID (`<name>-<hash8>`)
- Total file count and size
- Language breakdown percentages with visual progress bars
- Extracted symbol count (classes, interfaces, functions, components)
- Git tracking information (branch, HEAD commit, dirty status)

---

## `code-lense search <query>`

Executes multi-signal search across the codebase with syntax-highlighted snippets.

```bash
code-lense search "<query>" [options]
```

### Options

- `--mode <lexical|semantic|symbol|hybrid>`: Search strategy (default: `hybrid`).
- `--limit <number>`: Maximum number of results to return (default: `10`).
- `--language <name>`: Filter results by programming language (e.g. `typescript`, `python`, `go`).
- `--path <glob>`: Filter results by file path pattern (e.g. `src/services/**`).
- `--json`: Output results as JSON.

### Example

```bash
code-lense search "validateToken" --mode hybrid --limit 5
```

---

## `code-lense ask <question>`

Asks a natural language question about the repository using local or cloud LLMs with grounded code citations.

```bash
code-lense ask "<question>" [options]
```

### Options

- `--model <name>`: LLM model name (e.g. `llama3`, `mistral`, `gpt-4o`).
- `--provider <ollama|openai|mock>`: AI provider (default: `mock` or as set in `.repolensconfig`).
- `--max-tokens <num>`: Context budget limit in tokens (default: `4000`).
- `--json`: Output answer and citations in JSON.

### Example

```bash
code-lense ask "How are payment webhooks authenticated and handled?"
```

---

## `code-lense files`

Explores indexed files within the repository.

```bash
code-lense files [options]
```

### Options

- `--language <name>`: Filter by language (e.g. `typescript`, `python`).
- `--pattern <glob>`: Filter by file path glob.
- `--limit <num>`: Maximum results (default: `50`).

---

## `code-lense symbols <name>`

Inspects extracted symbols matching a query name or pattern.

```bash
code-lense symbols [name] [options]
```

### Options

- `--kind <class|function|interface|type|component|hook>`: Filter by symbol kind.
- `--file <path>`: Filter symbols within a specific file.
- `--json`: Output in JSON format.

---

## `code-lense graph <file>`

Analyzes dependencies and dependents for a given source file or symbol.

```bash
code-lense graph <file> [options]
```

### Options

- `--direction <both|dependencies|dependents>`: Traversal direction (default: `both`).
- `--depth <number>`: Traversal recursion depth (default: `1`).

---

## `code-lense watch`

Runs a continuous background file watcher with debounced auto-reindexing.

```bash
code-lense watch [path] [options]
```

### Options

- `--debounce <ms>`: Debounce window in milliseconds (default: `500`).

---

## `code-lense config`

Inspects and updates configuration settings.

```bash
code-lense config [get|set] [key] [value] [options]
```

### Options

- `--global`: Apply change to global user config (`~/.repolensconfig`).

---

## `code-lense help [command]`

Displays formatted help, categories, flags, and workflow examples.

```bash
# Show overview of all commands
code-lense help

# Show detailed help for a specific command
code-lense help search
```
