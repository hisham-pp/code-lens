export const MANAGERS = ['npm', 'pnpm', 'yarn'] as const;
export type Manager = (typeof MANAGERS)[number];

export const INSTALL_CMD: Record<Manager, string> = {
  npm: 'npm install -g code-lense',
  pnpm: 'pnpm add -g code-lense',
  yarn: 'yarn global add code-lense',
};

export const SDK_CMD: Record<Manager, string> = {
  npm: 'npm install @code-lense/sdk',
  pnpm: 'pnpm add @code-lense/sdk',
  yarn: 'yarn add @code-lense/sdk',
};

export const QUICKSTART = [
  { step: '1', cmd: 'code-lense init', desc: 'Create config & ignore rules' },
  { step: '2', cmd: 'code-lense index', desc: 'Scan files, extract symbols, populate SQLite' },
  { step: '3', cmd: 'code-lense search "UserService" --mode hybrid', desc: 'BM25 + vector search' },
] as const;
