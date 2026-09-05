import type { LanguageDefinition } from './types.js';

const LANG_PHP = 'php';

export const CODE_LANGUAGES_SECONDARY: LanguageDefinition[] = [
  {
    id: 'kotlin',
    name: 'Kotlin',
    extensions: ['.kt', '.kts'],
    treeSitterParser: 'tree-sitter-kotlin',
    isCode: true,
  },
  {
    id: 'c',
    name: 'C',
    extensions: ['.c', '.h'],
    treeSitterParser: 'tree-sitter-c',
    isCode: true,
  },
  {
    id: 'cpp',
    name: 'C++',
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
    treeSitterParser: 'tree-sitter-cpp',
    isCode: true,
  },
  {
    id: 'csharp',
    name: 'C#',
    extensions: ['.cs'],
    treeSitterParser: 'tree-sitter-c-sharp',
    isCode: true,
  },
  {
    id: LANG_PHP,
    name: 'PHP',
    extensions: ['.php', '.phtml', '.php4', '.php5', '.php7'],
    shebangs: [LANG_PHP],
    treeSitterParser: 'tree-sitter-php',
    isCode: true,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extensions: ['.rb', '.rake', '.gemspec'],
    filenames: ['Gemfile', 'Rakefile'],
    shebangs: ['ruby'],
    treeSitterParser: 'tree-sitter-ruby',
    isCode: true,
  },
  {
    id: 'swift',
    name: 'Swift',
    extensions: ['.swift'],
    treeSitterParser: 'tree-sitter-swift',
    isCode: true,
  },
  {
    id: 'dart',
    name: 'Dart',
    extensions: ['.dart'],
    treeSitterParser: 'tree-sitter-dart',
    isCode: true,
  },
  {
    id: 'sql',
    name: 'SQL',
    extensions: ['.sql'],
    isCode: true,
  },
  {
    id: 'shell',
    name: 'Shell',
    extensions: ['.sh', '.bash', '.zsh'],
    shebangs: ['bash', 'sh', 'zsh'],
    treeSitterParser: 'tree-sitter-bash',
    isCode: true,
  },
];
