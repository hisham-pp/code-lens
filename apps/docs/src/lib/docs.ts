import * as fs from 'fs';
import * as path from 'path';
import { processGitHubAlerts } from './docs-alerts';
import { DOC_ITEMS, type HeadingItem, type DocPageData } from './docs-meta';
import { createMarkedParser } from './markdown-renderer';

export * from './docs-meta';

function getDocsDir(): string {
  const primary = path.resolve(process.cwd(), '../../docs');
  if (fs.existsSync(primary)) return primary;
  const secondary = path.resolve(process.cwd(), 'docs');
  if (fs.existsSync(secondary)) return secondary;
  return path.resolve(process.cwd(), '../docs');
}

export async function getDocPageData(slug: string): Promise<DocPageData | null> {
  const idx = DOC_ITEMS.findIndex((d) => d.slug === slug);
  if (idx === -1) return null;

  const item = DOC_ITEMS[idx]!;
  const fullPath = path.join(getDocsDir(), item.filePath);
  if (!fs.existsSync(fullPath)) return null;

  const raw = processGitHubAlerts(fs.readFileSync(fullPath, 'utf-8'));
  const headings: HeadingItem[] = [];
  const parser = createMarkedParser(headings);
  const htmlContent = await parser.parse(raw);

  const prev =
    idx > 0 ? { slug: DOC_ITEMS[idx - 1]!.slug, title: DOC_ITEMS[idx - 1]!.title } : undefined;
  const next =
    idx < DOC_ITEMS.length - 1
      ? { slug: DOC_ITEMS[idx + 1]!.slug, title: DOC_ITEMS[idx + 1]!.title }
      : undefined;

  return {
    slug,
    title: item.title,
    description: item.description,
    category: item.category,
    htmlContent,
    headings,
    prev,
    next,
  };
}

export function searchDocs(
  query: string,
): Array<{ slug: string; title: string; snippet: string; category: string }> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: Array<{ slug: string; title: string; snippet: string; category: string }> = [];
  const docsDir = getDocsDir();

  for (const doc of DOC_ITEMS) {
    const fullPath = path.join(docsDir, doc.filePath);
    if (!fs.existsSync(fullPath)) continue;

    const raw = fs.readFileSync(fullPath, 'utf-8');
    const pos = raw.toLowerCase().indexOf(q);

    if (pos !== -1 || doc.title.toLowerCase().includes(q)) {
      const start = Math.max(0, pos - 40);
      const end = Math.min(raw.length, pos + q.length + 60);
      const snippet =
        pos !== -1
          ? `...${raw.slice(start, end).replace(/[#*`]/g, '').trim()}...`
          : doc.description;

      results.push({ slug: doc.slug, title: doc.title, snippet, category: doc.category });
    }
  }

  return results.slice(0, 8);
}
