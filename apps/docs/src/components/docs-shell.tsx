'use client';

import { useState } from 'react';
import { LINK_HOVER_WHITE } from '../lib/docs-constants';
import { CodeCopyHandler } from './code-copy-handler';
import { Navbar } from './navbar';
import { SearchModal } from './search-modal';

export function DocsShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CodeCopyHandler />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Code Lense — Local-First Repository Intelligence.</p>
          <div className="flex items-center gap-6 text-zinc-400">
            <a
              href="https://github.com/hisham-pp/code-lens"
              target="_blank"
              rel="noreferrer"
              className={LINK_HOVER_WHITE}
            >
              GitHub
            </a>
            <a href="/docs/storage" className={LINK_HOVER_WHITE}>
              Storage Architecture
            </a>
            <a href="/docs/scoping" className={LINK_HOVER_WHITE}>
              Repo Scoping
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
