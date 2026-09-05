import {
  CATEGORY_GETTING_STARTED,
  CATEGORY_ARCHITECTURE,
  CATEGORY_REFERENCE,
} from './docs-constants';

export interface DocItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  filePath: string;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface DocPageData {
  slug: string;
  title: string;
  description: string;
  category: string;
  htmlContent: string;
  headings: HeadingItem[];
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}

export const DOC_ITEMS: DocItem[] = [
  {
    slug: 'overview',
    title: 'Overview',
    description: 'Introduction to Code Lense architecture, capabilities, and philosophy',
    category: CATEGORY_GETTING_STARTED,
    filePath: 'README.md',
  },
  {
    slug: 'installation',
    title: 'Installation & Quickstart',
    description: 'How to install Code Lense, run diagnostics, and index your first repo',
    category: CATEGORY_GETTING_STARTED,
    filePath: 'installation.md',
  },
  {
    slug: 'storage',
    title: 'Storage & Architecture',
    description: 'Where repository data is saved, SQLite WAL engine, and vector BLOBs',
    category: CATEGORY_ARCHITECTURE,
    filePath: 'storage-and-architecture.md',
  },
  {
    slug: 'scoping',
    title: 'Repository Scoping',
    description: 'Deterministic repository ID generation, isolation, and workspace handling',
    category: CATEGORY_ARCHITECTURE,
    filePath: 'repo-scoping.md',
  },
  {
    slug: 'cli',
    title: 'CLI Reference',
    description: 'Complete documentation for all 12 Code Lense terminal commands',
    category: CATEGORY_REFERENCE,
    filePath: 'cli-reference.md',
  },
  {
    slug: 'sdk',
    title: 'TypeScript SDK',
    description: 'Programmatic API guide for embedding repository intelligence into apps',
    category: CATEGORY_REFERENCE,
    filePath: 'sdk-reference.md',
  },
  {
    slug: 'configuration',
    title: 'Configuration & Ignores',
    description: 'Customizing .repolensconfig options and .repolensignore engine rules',
    category: CATEGORY_REFERENCE,
    filePath: 'configuration.md',
  },
];

export function getAllDocItems(): DocItem[] {
  return DOC_ITEMS;
}
