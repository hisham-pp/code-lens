import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { ProjectProfile } from '../types/index.js';
import { BIT, PACKAGE_JSON, PYPROJECT_TOML, WORKSPACE_JSONC } from './constants.js';
import { inspectPackageJson } from './package-json-inspector.js';

function detectBit(
  entrySet: Set<string>,
  configFiles: string[],
  frameworks: Set<string>,
): { pm?: ProjectProfile['packageManager']; isMono?: boolean } {
  if (!entrySet.has(WORKSPACE_JSONC) && !entrySet.has('.bitmap') && !entrySet.has('bit.json')) {
    return {};
  }
  frameworks.add(BIT);
  if (entrySet.has(WORKSPACE_JSONC)) {
    configFiles.push(WORKSPACE_JSONC);
    return { pm: BIT, isMono: true };
  }
  return { isMono: true };
}

function detectNodePm(
  entrySet: Set<string>,
  configFiles: string[],
): { pm?: ProjectProfile['packageManager']; isMono?: boolean } {
  if (entrySet.has('pnpm-lock.yaml') || entrySet.has('pnpm-workspace.yaml')) {
    configFiles.push('pnpm-lock.yaml');
    return { pm: 'pnpm', isMono: entrySet.has('pnpm-workspace.yaml') };
  }
  if (entrySet.has('bun.lockb') || entrySet.has('bun.lock')) {
    configFiles.push('bun.lock');
    return { pm: 'bun' };
  }
  if (entrySet.has('yarn.lock')) {
    configFiles.push('yarn.lock');
    return { pm: 'yarn' };
  }
  if (entrySet.has(PACKAGE_JSON)) {
    configFiles.push('package-lock.json');
    return { pm: 'npm' };
  }
  return {};
}

function detectBackend(
  entrySet: Set<string>,
  configFiles: string[],
  frameworks: Set<string>,
): ProjectProfile['packageManager'] | undefined {
  if (entrySet.has('Cargo.toml')) {
    configFiles.push('Cargo.toml');
    frameworks.add('rust');
    return 'cargo';
  }
  if (entrySet.has('go.mod')) {
    configFiles.push('go.mod');
    frameworks.add('go');
    return 'go';
  }
  if (entrySet.has(PYPROJECT_TOML) || entrySet.has('requirements.txt') || entrySet.has('Pipfile')) {
    const isPoetry = entrySet.has(PYPROJECT_TOML);
    configFiles.push(isPoetry ? PYPROJECT_TOML : 'requirements.txt');
    frameworks.add('python');
    return isPoetry ? 'poetry' : 'pip';
  }
  return undefined;
}

export async function analyzeProject(rootPath: string): Promise<ProjectProfile> {
  const dirents = await fs.readdir(rootPath, { withFileTypes: true }).catch(() => []);
  const entrySet = new Set(dirents.map((e) => e.name));
  const configFiles: string[] = [];
  const frameworks = new Set<string>();

  const bit = detectBit(entrySet, configFiles, frameworks);
  const node = detectNodePm(entrySet, configFiles);
  const backend = detectBackend(entrySet, configFiles, frameworks);
  const packageManager = bit.pm || node.pm || backend || 'unknown';

  let isMonorepo = bit.isMono || node.isMono || false;
  for (const m of ['turbo.json', 'lerna.json', 'nx.json']) {
    if (entrySet.has(m)) {
      isMonorepo = true;
      configFiles.push(m);
    }
  }

  if (entrySet.has(PACKAGE_JSON)) configFiles.push(PACKAGE_JSON);
  await inspectPackageJson(rootPath, entrySet, frameworks);

  return {
    name: path.basename(rootPath),
    rootPath,
    packageManager,
    primaryLanguage: undefined,
    languages: {},
    frameworks: Array.from(frameworks),
    isMonorepo,
    configFiles,
  };
}
