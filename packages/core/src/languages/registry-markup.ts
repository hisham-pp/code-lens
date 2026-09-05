import type { LanguageDefinition } from './types.js';

export const MARKUP_LANGUAGES: LanguageDefinition[] = [
  {
    id: 'toml',
    name: 'TOML',
    extensions: ['.toml'],
    isCode: false,
  },
  {
    id: 'html',
    name: 'HTML',
    extensions: ['.html', '.htm'],
    treeSitterParser: 'tree-sitter-html',
    isCode: false,
  },
  {
    id: 'css',
    name: 'CSS',
    extensions: ['.css'],
    treeSitterParser: 'tree-sitter-css',
    isCode: false,
  },
  {
    id: 'scss',
    name: 'SCSS',
    extensions: ['.scss', '.sass'],
    isCode: false,
  },
  {
    id: 'less',
    name: 'Less',
    extensions: ['.less'],
    isCode: false,
  },
  {
    id: 'json',
    name: 'JSON',
    extensions: ['.json', '.jsonc', '.json5'],
    treeSitterParser: 'tree-sitter-json',
    isCode: false,
  },
  {
    id: 'yaml',
    name: 'YAML',
    extensions: ['.yaml', '.yml'],
    isCode: false,
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extensions: ['.md', '.mdx'],
    treeSitterParser: 'tree-sitter-markdown',
    isCode: false,
  },
  {
    id: 'dockerfile',
    name: 'Dockerfile',
    extensions: ['.dockerfile'],
    filenames: ['Dockerfile', 'dockerfile', 'Containerfile'],
    isCode: false,
  },
  {
    id: 'makefile',
    name: 'Makefile',
    extensions: ['.mk'],
    filenames: ['Makefile', 'makefile', 'GNUMakefile'],
    isCode: false,
  },
];
