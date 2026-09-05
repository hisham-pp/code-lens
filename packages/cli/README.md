# code-lense

> Local-first repository intelligence CLI for developers.

`code-lense` is a developer tool that indexes git repositories, extracts symbols across multiple languages (TypeScript, JavaScript, Python, Go, Rust), computes lexical and vector semantic embeddings, and provides fast local code exploration and AI-assisted search.

## Installation

```bash
# Global installation via npm
npm install -g code-lense

# Or run directly via npx
npx code-lense --help
```

## Quick Start

```bash
# Initialize a repository for Code Lense
code-lense init

# Index repository symbols and embeddings
code-lense index

# Search for functions, classes, or keywords
code-lense search "database connection pool"

# Check index and database status
code-lense status

# Run system and provider diagnostics
code-lense doctor
```

## Commands

- `init`: Initialize `.repolensconfig` and `.repolensignore` in the target repository.
- `index`: Scan and index files, symbols, chunks, and embeddings.
- `status`: Display indexed symbol counts, file counts, and storage metrics.
- `search <query>`: Execute hybrid lexical, semantic, and symbol search.
- `symbols`: List all indexed code symbols with signatures and file locations.
- `files`: List indexed files matching language, size, and category filters.
- `graph`: Inspect file dependency relationships and module connections.
- `ask <question>`: Query AI with repository context for code explanations.
- `watch`: Continuously watch for file changes and update the index incrementally.
- `doctor`: Validate SQLite database, vector extensions, and embedding providers.

## License

MIT © Hisham
