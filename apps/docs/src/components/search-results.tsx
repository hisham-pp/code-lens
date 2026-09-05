'use client';

import { FileText } from 'lucide-react';
import Link from 'next/link';
import { EMPTY_SEARCH_CLASS } from '../lib/docs-constants';

export interface SearchResultItem {
  slug: string;
  title: string;
  snippet: string;
  category: string;
}

interface SearchResultsProps {
  loading: boolean;
  query: string;
  results: SearchResultItem[];
  onSelect: () => void;
}

export function SearchResults({ loading, query, results, onSelect }: SearchResultsProps) {
  if (loading) {
    return <div className={EMPTY_SEARCH_CLASS}>Searching documentation...</div>;
  }

  if (query && results.length === 0) {
    return (
      <div className={EMPTY_SEARCH_CLASS}>No documentation pages match &quot;{query}&quot;</div>
    );
  }

  if (!query) {
    return (
      <div className={EMPTY_SEARCH_CLASS}>Type keywords to search across Code Lense guides.</div>
    );
  }

  return (
    <div className="space-y-1">
      {results.map((r) => (
        <Link
          key={r.slug}
          href={`/docs/${r.slug}`}
          onClick={onSelect}
          className="group flex flex-col gap-1 p-3 rounded-xl hover:bg-zinc-800/60 transition-colors"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-zinc-400 group-hover:text-indigo-400" />
              {r.title}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase">{r.category}</span>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-2 pl-5">{r.snippet}</p>
        </Link>
      ))}
    </div>
  );
}
