import { ARG_TARGET_PATH, CAT_INDEXING } from './help-constants.js';

export interface CommandDoc {
  name: string;
  summary: string;
  category: 'Indexing' | 'Search & Intelligence' | 'AI' | 'Diagnostics & Config';
  usage: string;
  args?: Array<{ name: string; desc: string }>;
  options?: Array<{ flags: string; desc: string }>;
  examples: string[];
}

export const INDEXING_COMMAND_DOCS: Record<string, CommandDoc> = {
  init: {
    name: 'init',
    summary: 'Initialize Code Lense configuration and ignore rules in a repository',
    category: CAT_INDEXING,
    usage: 'code-lense init [path]',
    args: [ARG_TARGET_PATH],
    examples: ['code-lense init', 'code-lense init /path/to/repo'],
  },
  index: {
    name: 'index',
    summary: 'Scan and incrementally index repository files, symbols, and dependencies',
    category: CAT_INDEXING,
    usage: 'code-lense index [options] [path]',
    args: [ARG_TARGET_PATH],
    options: [
      { flags: '-f, --force', desc: 'Force full re-indexing of all files (bypass cache)' },
      { flags: '-v, --verbose', desc: 'Show real-time file-by-file indexing progress' },
    ],
    examples: ['code-lense index', 'code-lense index --force', 'code-lense index -v'],
  },
  watch: {
    name: 'watch',
    summary: 'Start live file watcher with automatic debounced re-indexing',
    category: CAT_INDEXING,
    usage: 'code-lense watch [path]',
    args: [ARG_TARGET_PATH],
    examples: ['code-lense watch'],
  },
};
