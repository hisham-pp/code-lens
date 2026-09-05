import type { GitState, ProjectProfile } from '@code-lense/core';

export interface RepositoryStatus {
  repositoryId: string;
  rootPath: string;
  git: GitState;
  project: ProjectProfile;
  totalFiles: number;
  totalSymbols: number;
  totalChunks: number;
  totalEmbeddings: number;
  languages: Record<string, number>;
  lastIndexedAt?: number;
}
