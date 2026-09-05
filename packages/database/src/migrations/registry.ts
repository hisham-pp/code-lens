import type { Migration } from './types.js';
import { migration001InitialSchema } from './versions/001-initial-schema.js';

export const MIGRATIONS: readonly Migration[] = [migration001InitialSchema];
