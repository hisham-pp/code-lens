'use client';

import { Search, X } from 'lucide-react';
import { SearchResults } from './search-results';
import { useSearchModal } from './use-search-modal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { query, setQuery, results, loading, inputRef } = useSearchModal(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search docs (e.g. storage, SQLite, doctor, CLI)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          <SearchResults loading={loading} query={query} results={results} onSelect={onClose} />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-[11px] text-zinc-500 bg-zinc-950/50">
          <span>Navigate with mouse or arrow keys</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
