import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { BIT, NEXTJS, PACKAGE_JSON, REACT } from './constants.js';

const SIMPLE_DEP_MAP: Record<string, string> = {
  '@nestjs/core': 'nestjs',
  express: 'express',
  fastify: 'fastify',
  vue: 'vue',
  nuxt: 'nuxt',
  astro: 'astro',
  tailwindcss: 'tailwind',
};

function checkReactAndNext(
  deps: Record<string, unknown>,
  entrySet: Set<string>,
  frameworks: Set<string>,
): void {
  const hasNextConfig =
    entrySet.has('next.config.js') ||
    entrySet.has('next.config.mjs') ||
    entrySet.has('next.config.ts');

  if (deps['next'] || hasNextConfig) {
    frameworks.add(NEXTJS);
    frameworks.add(REACT);
  } else if (deps[REACT]) {
    frameworks.add(REACT);
  }
}

export async function inspectPackageJson(
  rootPath: string,
  entrySet: Set<string>,
  frameworks: Set<string>,
): Promise<void> {
  if (!entrySet.has(PACKAGE_JSON)) return;
  try {
    const raw = await fs.readFile(path.join(rootPath, PACKAGE_JSON), 'utf-8');
    const pkg = JSON.parse(raw);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    checkReactAndNext(deps, entrySet, frameworks);

    if (deps['nest-cli.json'] || entrySet.has('nest-cli.json')) frameworks.add('nestjs');
    if (deps['svelte'] || deps['@sveltejs/kit']) frameworks.add('svelte');
    if (deps['@teambit/bit'] || deps['@bitdev/harmony']) frameworks.add(BIT);

    for (const [dep, fw] of Object.entries(SIMPLE_DEP_MAP)) {
      if (deps[dep]) frameworks.add(fw);
    }
  } catch {
    // Ignore invalid package.json
  }
}
