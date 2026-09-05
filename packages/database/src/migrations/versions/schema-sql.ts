export const TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    root_path TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id TEXT NOT NULL,
    path TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    language TEXT,
    extension TEXT,
    size INTEGER NOT NULL,
    hash TEXT NOT NULL,
    is_binary INTEGER DEFAULT 0,
    is_generated INTEGER DEFAULT 0,
    is_minified INTEGER DEFAULT 0,
    is_vendor INTEGER DEFAULT 0,
    mtime_ms REAL NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE,
    UNIQUE(repository_id, relative_path)
  );

  CREATE INDEX IF NOT EXISTS idx_files_repo_relpath ON files(repository_id, relative_path);
  CREATE INDEX IF NOT EXISTS idx_files_repo_hash ON files(repository_id, hash);

  CREATE TABLE IF NOT EXISTS symbols (
    id TEXT PRIMARY KEY,
    file_id INTEGER NOT NULL,
    repository_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parent_id TEXT,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    start_byte INTEGER DEFAULT 0,
    end_byte INTEGER DEFAULT 0,
    signature TEXT,
    doc_comment TEXT,
    metadata_json TEXT,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES symbols(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_symbols_repo_name ON symbols(repository_id, name);
  CREATE INDEX IF NOT EXISTS idx_symbols_file_id ON symbols(file_id);
  CREATE INDEX IF NOT EXISTS idx_symbols_parent_id ON symbols(parent_id);

  CREATE TABLE IF NOT EXISTS chunks (
    id TEXT PRIMARY KEY,
    file_id INTEGER NOT NULL,
    repository_id TEXT NOT NULL,
    symbol_id TEXT,
    symbol_name TEXT,
    parent_symbol_id TEXT,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    start_byte INTEGER DEFAULT 0,
    end_byte INTEGER DEFAULT 0,
    chunk_type TEXT NOT NULL,
    content TEXT NOT NULL,
    hash TEXT NOT NULL,
    language TEXT,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE,
    FOREIGN KEY (symbol_id) REFERENCES symbols(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_chunks_hash ON chunks(hash);
  CREATE INDEX IF NOT EXISTS idx_chunks_file_id ON chunks(file_id);
  CREATE INDEX IF NOT EXISTS idx_chunks_symbol_name ON chunks(symbol_name);
`;
