'use client';

import { AlignLeft } from 'lucide-react';
import { type HeadingItem } from '../lib/docs-meta';

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <div className="w-56 shrink-0 hidden xl:block pl-6 py-8">
      <div className="sticky top-24 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <AlignLeft className="h-3.5 w-3.5" />
          <span>On this page</span>
        </div>
        <ul className="space-y-2 border-l border-zinc-800 text-xs">
          {headings.map((h) => {
            const isH3 = h.level === 3;
            return (
              <li key={h.id} className={isH3 ? 'pl-5' : 'pl-3'}>
                <a
                  href={`#${h.id}`}
                  className="block text-zinc-400 hover:text-indigo-400 transition-colors py-0.5 truncate"
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
