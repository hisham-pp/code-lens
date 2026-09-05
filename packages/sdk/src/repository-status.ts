import { GitIntelligence, ProjectRecognizer } from '@code-lense/core';
import type { RepositoryDatabase } from '@code-lense/database';
import type { RepositoryStatus } from './types.js';

export async function collectRepositoryStatus(
  rootPath: string,
  repositoryId: string,
  db: RepositoryDatabase,
): Promise<RepositoryStatus> {
  const git = await GitIntelligence.getState(rootPath);
  const project = await ProjectRecognizer.analyze(rootPath);

  const allFiles = db.files.findAll();
  const totalFiles = allFiles.length;
  const totalSymbols = db.symbols.count();
  const totalChunks = db.chunks.count();
  const totalEmbeddings = await db.vectors.count();

  const languages: Record<string, number> = {};
  for (const f of allFiles) {
    if (f.language) {
      languages[f.language] = (languages[f.language] || 0) + 1;
    }
  }

  const savedGit = db.git.getState();

  return {
    repositoryId,
    rootPath,
    git,
    project,
    totalFiles,
    totalSymbols,
    totalChunks,
    totalEmbeddings,
    languages,
    lastIndexedAt: savedGit?.indexedAt,
  };
}
