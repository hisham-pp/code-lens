import { useState, useEffect, useRef } from 'react';
import { type SearchResultItem } from './search-results';

function useKeyboardShortcut(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}

interface StaticDocItem {
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

async function queryStaticIndex(q: string): Promise<SearchResultItem[]> {
  try {
    const res = await fetch('/search-index.json');
    if (!res.ok) return [];
    const items = (await res.json()) as StaticDocItem[];
    const lower = q.toLowerCase();
    return items
      .filter(
        (d) => d.title.toLowerCase().includes(lower) || d.content.toLowerCase().includes(lower),
      )
      .slice(0, 8)
      .map((d) => ({ slug: d.slug, title: d.title, snippet: d.description, category: d.category }));
  } catch {
    return [];
  }
}

async function performSearch(query: string): Promise<SearchResultItem[]> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) return data.results;
    }
  } catch {
    // API route unavailable on static host
  }
  return queryStaticIndex(query);
}

function useDebouncedSearch(query: string) {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const searchRes = await performSearch(query);
      setResults(searchRes);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading, setResults };
}

export function useSearchModal(isOpen: boolean, onClose: () => void) {
  const [query, setQuery] = useState('');
  const { results, loading, setResults } = useDebouncedSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcut(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen, setResults]);

  return { query, setQuery, results, loading, inputRef };
}
