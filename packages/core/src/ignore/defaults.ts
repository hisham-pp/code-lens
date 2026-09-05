export const DEFAULT_IGNORES = [
  // Version control
  '.git/**',
  '.svn/**',
  '.hg/**',

  // Dependencies
  'node_modules/**',
  'vendor/**',
  'third_party/**',
  'bower_components/**',
  '.pnpm-store/**',

  // Build outputs
  'dist/**',
  'build/**',
  'out/**',
  'target/**',
  '.next/**',
  '.nuxt/**',
  '.astro/**',
  '.svelte-kit/**',
  'coverage/**',
  '.turbo/**',
  '.cache/**',
  'tmp/**',
  'temp/**',

  // Package lockfiles (large metadata, indexed via project profile instead)
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb',
  'bun.lock',
  'Cargo.lock',
  'composer.lock',
  'poetry.lock',
  'Gemfile.lock',

  // Minified files & source maps
  '*.min.js',
  '*.min.css',
  '*.map',
  '*.bundle.js',

  // Sensitive files & secrets
  '.env',
  '.env.*',
  '*.pem',
  '*.key',
  '*.crt',
  '*.cer',
  '*.pfx',
  '*.p12',
  'id_rsa',
  'id_rsa.*',
  'credentials.json',
  'secret.json',

  // Database files & system logs
  '*.sqlite',
  '*.sqlite3',
  '*.db',
  '*.log',
  '.DS_Store',
  'Thumbs.db',

  // Code Lense storage directory
  '.code-lense/**',
];
