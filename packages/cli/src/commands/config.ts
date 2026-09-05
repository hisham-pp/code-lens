import pc from 'picocolors';
import { logger } from '@code-lense/core';
import { ConfigManager } from '../config/index.js';
import { Format } from '../output/format.js';

function getConfigValue(target: unknown, key: string): string {
  const parts = key.split('.');
  let val: unknown = target;
  for (const p of parts) {
    if (val && typeof val === 'object') {
      val = (val as Record<string, unknown>)[p];
    } else {
      return pc.dim('undefined');
    }
  }
  return val !== undefined ? String(val) : pc.dim('undefined');
}

function setConfigValue(targetObj: Record<string, unknown>, key: string, value: string): void {
  const parts = key.split('.');
  let target: Record<string, unknown> = targetObj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!;
    if (!target[p] || typeof target[p] !== 'object') {
      target[p] = {};
    }
    target = target[p] as Record<string, unknown>;
  }

  const lastKey = parts[parts.length - 1]!;
  if (value === 'true') {
    target[lastKey] = true;
  } else if (value === 'false') {
    target[lastKey] = false;
  } else if (!isNaN(Number(value))) {
    target[lastKey] = Number(value);
  } else {
    target[lastKey] = value;
  }
}

export async function configCommand(key?: string, value?: string): Promise<void> {
  const log = logger.withContext('config');
  const current = await ConfigManager.load();

  if (!key) {
    log.raw(Format.header('Current Configuration'));
    log.raw(JSON.stringify(current, null, 2));
    return;
  }

  if (!value) {
    log.raw(Format.kv(key, getConfigValue(current, key)));
    return;
  }

  setConfigValue(current as Record<string, unknown>, key, value);
  await ConfigManager.saveGlobal(current);
  log.success(`Updated global config ${pc.bold(key)} = ${pc.green(value)}`);
}
