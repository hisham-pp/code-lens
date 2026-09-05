import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const docsDir = path.resolve(__dirname, '../../../docs');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const CATEGORY_GETTING_STARTED = 'Getting Started';
const CATEGORY_ARCHITECTURE = 'Architecture';
const CATEGORY_REFERENCE = 'Reference';

const docsMeta = [
  {
    slug: 'overview',
    title: 'Overview',
    category: CATEGORY_GETTING_STARTED,
    filePath: 'README.md',
    description: 'Introduction to Code Lense architecture, capabilities, and philosophy',
  },
  {
    slug: 'installation',
    title: 'Installation & Quickstart',
    category: CATEGORY_GETTING_STARTED,
    filePath: 'installation.md',
    description: 'How to install Code Lense, run diagnostics, and index your first repo',
  },
  {
    slug: 'storage',
    title: 'Storage & Architecture',
    category: CATEGORY_ARCHITECTURE,
    filePath: 'storage-and-architecture.md',
    description: 'Where repository data is saved, SQLite WAL engine, and vector BLOBs',
  },
  {
    slug: 'scoping',
    title: 'Repository Scoping',
    category: CATEGORY_ARCHITECTURE,
    filePath: 'repo-scoping.md',
    description: 'Deterministic repository ID generation, isolation, and workspace handling',
  },
  {
    slug: 'cli',
    title: 'CLI Reference',
    category: CATEGORY_REFERENCE,
    filePath: 'cli-reference.md',
    description: 'Complete documentation for all 12 Code Lense terminal commands',
  },
  {
    slug: 'sdk',
    title: 'TypeScript SDK',
    category: CATEGORY_REFERENCE,
    filePath: 'sdk-reference.md',
    description: 'Programmatic API guide for embedding repository intelligence into apps',
  },
  {
    slug: 'configuration',
    title: 'Configuration & Ignores',
    category: CATEGORY_REFERENCE,
    filePath: 'configuration.md',
    description: 'Customizing .repolensconfig options and .repolensignore engine rules',
  },
];

const index = docsMeta.map((doc) => {
  const fullPath = path.join(docsDir, doc.filePath);
  const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '';
  return {
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    description: doc.description,
    content: content.replace(/[#*`_]/g, ' ').replace(/\s+/g, ' '),
  };
});

fs.writeFileSync(path.join(publicDir, 'search-index.json'), JSON.stringify(index, null, 2));
