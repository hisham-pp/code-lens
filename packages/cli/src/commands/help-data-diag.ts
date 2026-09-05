import { ARG_TARGET_PATH, CAT_AI, CAT_DIAG, OPT_JSON } from './help-constants.js';
import type { CommandDoc } from './help-data-indexing.js';

export const DIAG_COMMAND_DOCS: Record<string, CommandDoc> = {
  ask: {
    name: 'ask',
    summary: 'Ask natural-language questions with context-aware citations',
    category: CAT_AI,
    usage: 'code-lense ask [options] <question> [path]',
    args: [{ name: '<question>', desc: 'Natural language question to answer' }, ARG_TARGET_PATH],
    options: [
      { flags: '--provider <name>', desc: 'LLM provider (ollama, openai, mock)' },
      { flags: '--model <name>', desc: 'Model name (e.g. llama3, gpt-4o-mini)' },
      OPT_JSON,
    ],
    examples: [
      'code-lense ask "Where is user authentication handled?"',
      'code-lense ask "How do database migrations work?"',
    ],
  },
  doctor: {
    name: 'doctor',
    summary: 'Run system health checks on Node.js, Git, SQLite, and storage',
    category: CAT_DIAG,
    usage: 'code-lense doctor',
    examples: ['code-lense doctor'],
  },
  config: {
    name: 'config',
    summary: 'Inspect or update Code Lense configuration settings',
    category: CAT_DIAG,
    usage: 'code-lense config [key] [value]',
    args: [
      { name: '[key]', desc: 'Config property key (e.g. embedding.enabled)' },
      { name: '[value]', desc: 'New value to set' },
    ],
    examples: ['code-lense config', 'code-lense config embedding.enabled true'],
  },
  update: {
    name: 'update',
    summary: 'Update the globally installed Code Lense CLI to the latest version',
    category: CAT_DIAG,
    usage: 'code-lense update',
    examples: ['code-lense update'],
  },
  help: {
    name: 'help',
    summary: 'Display detailed help and usage examples for commands',
    category: CAT_DIAG,
    usage: 'code-lense help [command]',
    args: [{ name: '[command]', desc: 'Specific command name to inspect' }],
    examples: ['code-lense help', 'code-lense help search'],
  },
};
