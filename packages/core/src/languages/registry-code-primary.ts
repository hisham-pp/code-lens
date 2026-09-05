import type { LanguageDefinition } from './types.js';

export const CODE_LANGUAGES_PRIMARY: LanguageDefinition[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    extensions: ['.ts', '.mts', '.cts'],
    treeSitterParser: 'tree-sitter-typescript',
    isCode: true,
  },
  {
    id: 'tsx',
    name: 'TSX',
    extensions: ['.tsx'],
    treeSitterParser: 'tree-sitter-tsx',
    isCode: true,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extensions: ['.js', '.mjs', '.cjs'],
    shebangs: ['node', 'nodejs'],
    treeSitterParser: 'tree-sitter-javascript',
    isCode: true,
  },
  {
    id: 'jsx',
    name: 'JSX',
    extensions: ['.jsx'],
    treeSitterParser: 'tree-sitter-javascript',
    isCode: true,
  },
  {
    id: 'python',
    name: 'Python',
    extensions: ['.py', '.pyi', '.pyw'],
    shebangs: ['python', 'python3', 'python2'],
    treeSitterParser: 'tree-sitter-python',
    isCode: true,
  },
  {
    id: 'go',
    name: 'Go',
    extensions: ['.go'],
    treeSitterParser: 'tree-sitter-go',
    isCode: true,
  },
  {
    id: 'rust',
    name: 'Rust',
    extensions: ['.rs'],
    filenames: ['Cargo.toml'],
    treeSitterParser: 'tree-sitter-rust',
    isCode: true,
  },
  {
    id: 'java',
    name: 'Java',
    extensions: ['.java'],
    treeSitterParser: 'tree-sitter-java',
    isCode: true,
  },
];
