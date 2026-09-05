export const AUX_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id TEXT NOT NULL,
    source_file_path TEXT NOT NULL,
    target_path TEXT,
    specifier TEXT NOT NULL,
    imported_symbols_json TEXT,
    is_dynamic INTEGER DEFAULT 0,
    is_type_only INTEGER DEFAULT 0,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_deps_source ON dependencies(repository_id, source_file_path);

  CREATE TABLE IF NOT EXISTS graph_edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relation TEXT NOT NULL,
    metadata_json TEXT,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_graph_source ON graph_edges(repository_id, source_id);
  CREATE INDEX IF NOT EXISTS idx_graph_target ON graph_edges(repository_id, target_id);

  CREATE TABLE IF NOT EXISTS git_state (
    repository_id TEXT PRIMARY KEY,
    branch TEXT NOT NULL,
    commit_hash TEXT NOT NULL,
    is_clean INTEGER DEFAULT 1,
    staged_json TEXT,
    unstaged_json TEXT,
    untracked_json TEXT,
    indexed_at INTEGER NOT NULL,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS vectors (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL,
    embedding_blob BLOB NOT NULL,
    dimension INTEGER NOT NULL,
    metadata_json TEXT,
    FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_vectors_repo ON vectors(repository_id);

  CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
    chunk_id UNINDEXED,
    repository_id UNINDEXED,
    content,
    file_path,
    symbol_name,
    language,
    tokenize='porter unicode61'
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS symbols_fts USING fts5(
    symbol_id UNINDEXED,
    repository_id UNINDEXED,
    name,
    signature,
    file_path,
    tokenize='porter unicode61'
  );

  CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
    DELETE FROM chunks_fts WHERE chunk_id = old.id;
  END;

  CREATE TRIGGER IF NOT EXISTS symbols_ad AFTER DELETE ON symbols BEGIN
    DELETE FROM symbols_fts WHERE symbol_id = old.id;
  END;
`;

export const DROP_ALL_SQL = `
  DROP TRIGGER IF EXISTS symbols_ad;
  DROP TRIGGER IF EXISTS chunks_ad;
  DROP TABLE IF EXISTS symbols_fts;
  DROP TABLE IF EXISTS chunks_fts;
  DROP TABLE IF EXISTS vectors;
  DROP TABLE IF EXISTS git_state;
  DROP TABLE IF EXISTS graph_edges;
  DROP TABLE IF EXISTS dependencies;
  DROP TABLE IF EXISTS chunks;
  DROP TABLE IF EXISTS symbols;
  DROP TABLE IF EXISTS files;
  DROP TABLE IF EXISTS repositories;
`;
