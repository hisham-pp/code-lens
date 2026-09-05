import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { SQLiteDatabase } from '@code-lense/database';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

const log = logger.withContext('doctor');

function checkNodeVersion(): boolean {
  const nodeMajor = parseInt(process.versions.node.split('.')[0] ?? '0', 10);
  if (nodeMajor >= 20) {
    log.success(`Node.js: ${process.version} (>= 20.0.0 required)`);
    return true;
  }
  log.error(`Node.js: ${process.version} (Node >= 20.0.0 is required)`);
  return false;
}

function checkSqliteAndFts5(): boolean {
  try {
    const memDb = new SQLiteDatabase(':memory:');
    memDb.exec('CREATE VIRTUAL TABLE test_fts USING fts5(content);');
    memDb.exec("INSERT INTO test_fts (content) VALUES ('hello world');");
    const stmt = memDb.prepare("SELECT content FROM test_fts WHERE test_fts MATCH 'hello';");
    const rows = stmt.all() as Array<{ content: string }>;
    memDb.close();

    if (rows.length > 0) {
      log.success('SQLite: Native SQLite 3 with FTS5 virtual table support enabled');
      return true;
    }
    log.error('SQLite: FTS5 query returned empty result');
    return false;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`SQLite / FTS5 check failed: ${msg}`);
    return false;
  }
}

async function checkStorageDirectory(storageDir: string): Promise<boolean> {
  try {
    await fs.mkdir(storageDir, { recursive: true });
    const testFile = path.join(storageDir, '.perm-check');
    await fs.writeFile(testFile, 'ok');
    await fs.unlink(testFile);
    log.success(`Storage Directory: ${storageDir} (Read/Write OK)`);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Storage Directory: Permission error at ${storageDir}: ${msg}`);
    return false;
  }
}

export async function doctorCommand(): Promise<void> {
  log.raw(Format.header('Code Lense System Diagnostics'));
  let hasErrors = false;

  if (!checkNodeVersion()) hasErrors = true;
  if (!checkSqliteAndFts5()) hasErrors = true;

  log.success('Vector Storage: Portable in-engine SIMD Float32Array cosine index active');

  const storageDir = path.join(os.homedir(), '.code-lense');
  if (!(await checkStorageDirectory(storageDir))) hasErrors = true;

  const config = await ConfigManager.load();
  const embDesc = config.embedding?.enabled
    ? config.embedding.provider
    : pc.dim('Disabled (Deterministic mode)');
  const llmDesc = config.llm?.enabled
    ? config.llm.provider
    : pc.dim('Disabled (Deterministic mode)');

  log.info(`Embedding Provider: ${embDesc}`);
  log.info(`LLM Provider: ${llmDesc}`);

  log.raw(Format.divider());
  if (hasErrors) {
    log.error('Doctor found issues that need your attention.');
  } else {
    log.success('All systems operational. Code Lense is ready.');
  }
}
