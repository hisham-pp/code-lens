import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import type { CodeLenseConfig } from '@code-lense/core';

const UTF8 = 'utf-8';

function mergeEmbedding(
  proj?: CodeLenseConfig['embedding'],
  glob?: CodeLenseConfig['embedding'],
): CodeLenseConfig['embedding'] {
  return {
    enabled: proj?.enabled ?? glob?.enabled ?? false,
    provider: proj?.provider ?? glob?.provider ?? 'mock',
    endpoint: proj?.endpoint ?? glob?.endpoint,
    model: proj?.model ?? glob?.model,
    apiKey: proj?.apiKey ?? glob?.apiKey,
  };
}

function mergeLlm(
  proj?: CodeLenseConfig['llm'],
  glob?: CodeLenseConfig['llm'],
): CodeLenseConfig['llm'] {
  return {
    enabled: proj?.enabled ?? glob?.enabled ?? false,
    provider: proj?.provider ?? glob?.provider ?? 'ollama',
    endpoint: proj?.endpoint ?? glob?.endpoint,
    model: proj?.model ?? glob?.model,
    apiKey: proj?.apiKey ?? glob?.apiKey,
  };
}

export class ConfigManager {
  private static globalConfigPath = path.join(os.homedir(), '.code-lense', 'config.json');

  public static async load(cwd: string = process.cwd()): Promise<CodeLenseConfig> {
    let globalConfig: CodeLenseConfig = {};
    let projectConfig: CodeLenseConfig = {};

    try {
      const globalRaw = await fs.readFile(this.globalConfigPath, UTF8);
      globalConfig = JSON.parse(globalRaw);
    } catch {
      // ignore
    }

    try {
      const localPath = path.join(cwd, '.repolensconfig');
      const localRaw = await fs.readFile(localPath, UTF8);
      projectConfig = JSON.parse(localRaw);
    } catch {
      // ignore
    }

    return {
      ...globalConfig,
      ...projectConfig,
      storageDir: projectConfig.storageDir || globalConfig.storageDir,
      embedding: mergeEmbedding(projectConfig.embedding, globalConfig.embedding),
      llm: mergeLlm(projectConfig.llm, globalConfig.llm),
    };
  }

  public static async saveGlobal(config: CodeLenseConfig): Promise<void> {
    const dir = path.dirname(this.globalConfigPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.globalConfigPath, JSON.stringify(config, null, 2), UTF8);
  }

  public static async initProjectConfig(cwd: string): Promise<string> {
    await fs.mkdir(cwd, { recursive: true });
    const localPath = path.join(cwd, '.repolensconfig');
    const template: CodeLenseConfig = {
      embedding: {
        enabled: false,
        provider: 'mock',
      },
      llm: {
        enabled: false,
        provider: 'ollama',
        model: 'llama3.2',
      },
      search: {
        defaultMode: 'hybrid',
        defaultLimit: 20,
        weights: {
          lexical: 0.35,
          semantic: 0.35,
          symbol: 0.15,
          path: 0.1,
          graph: 0.05,
        },
      },
    };

    await fs.writeFile(localPath, JSON.stringify(template, null, 2), UTF8);
    return localPath;
  }
}
