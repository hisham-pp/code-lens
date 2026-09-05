import { ARG_TARGET_PATH, CAT_SEARCH, OPT_JSON } from './help-constants.js';
import type { CommandDoc } from './help-data-indexing.js';

export const SEARCH_COMMAND_DOCS: Record<string, CommandDoc> = {
  status: {
    name: 'status',
    summary: 'Display repository statistics, language breakdown, and Git info',
    category: CAT_SEARCH,
    usage: 'code-lense status [path]',
    args: [ARG_TARGET_PATH],
    examples: ['code-lense status'],
  },
  search: {
    name: 'search',
    summary: 'Search repository via hybrid, lexical (BM25), semantic, or symbol search',
    category: CAT_SEARCH,
    usage: 'code-lense search [options] <query> [path]',
    args: [{ name: '<query>', desc: 'Search term or query string' }, ARG_TARGET_PATH],
    options: [
      { flags: '-m, --mode <mode>', desc: 'Search mode: hybrid, lexical, semantic, symbol' },
      { flags: '-l, --limit <n>', desc: 'Maximum results to return (default: 10)' },
      { flags: '--lang <language>', desc: 'Filter results by programming language' },
      { flags: '--path <subpath>', desc: 'Filter results by file path pattern' },
      OPT_JSON,
    ],
    examples: [
      'code-lense search "UserService"',
      'code-lense search "authenticate" --mode symbol',
      'code-lense search "JWT token" --mode semantic',
      'code-lense search "route" --lang typescript',
    ],
  },
  files: {
    name: 'files',
    summary: 'List indexed files in the repository with language and size',
    category: CAT_SEARCH,
    usage: 'code-lense files [options] [path]',
    args: [ARG_TARGET_PATH],
    options: [{ flags: '--lang <language>', desc: 'Filter files by language' }, OPT_JSON],
    examples: ['code-lense files', 'code-lense files --lang typescript'],
  },
  symbols: {
    name: 'symbols',
    summary: 'Search and inspect extracted AST symbols across the codebase',
    category: CAT_SEARCH,
    usage: 'code-lense symbols [options] [name] [path]',
    args: [{ name: '[name]', desc: 'Symbol name filter' }, ARG_TARGET_PATH],
    options: [
      { flags: '-t, --type <type>', desc: 'Filter by type (class, function, method, interface)' },
      OPT_JSON,
    ],
    examples: ['code-lense symbols', 'code-lense symbols auth --type function'],
  },
  graph: {
    name: 'graph',
    summary: 'Inspect import dependencies and dependent relationships',
    category: CAT_SEARCH,
    usage: 'code-lense graph <target> [path]',
    args: [{ name: '<target>', desc: 'File path or symbol name to inspect' }, ARG_TARGET_PATH],
    examples: ['code-lense graph src/auth.service.ts'],
  },
};
