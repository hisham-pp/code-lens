'use client';

import { Sparkles, HardDrive, Compass, Terminal, Code2, Sliders, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_ITEMS } from '../lib/docs-meta';

const ICON_MAP: Record<string, React.ElementType> = {
  overview: Sparkles,
  installation: PlayCircle,
  storage: HardDrive,
  scoping: Compass,
  cli: Terminal,
  sdk: Code2,
  configuration: Sliders,
};

export function Sidebar() {
  const pathname = usePathname();
  const categories = Array.from(new Set(DOC_ITEMS.map((item) => item.category)));

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-zinc-800/80 pr-6 py-8">
      <div className="sticky top-24 space-y-8">
        {categories.map((category) => {
          const items = DOC_ITEMS.filter((item) => item.category === category);
          return (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 px-3">
                {category}
              </h4>
              <ul className="space-y-1">
                {items.map((item) => {
                  const href = `/docs/${item.slug}`;
                  const isActive = pathname === href;
                  const Icon = ICON_MAP[item.slug] || Sparkles;

                  return (
                    <li key={item.slug}>
                      <Link
                        href={href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
