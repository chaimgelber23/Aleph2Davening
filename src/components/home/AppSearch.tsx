'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  route: string;
  title: string;
  description: string;
  found: boolean;
}

export function AppSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || 'Something went wrong');
        return;
      }

      const data = await res.json() as SearchResult;
      setResult(data);
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (result) setResult(null);
    if (error) setError(null);
  };

  const handleOpen = () => {
    if (result?.route) router.push(result.route);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sparkle / AI icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#5FA8D3] shrink-0">
            <path d="M12 2L9.09 8.26L2 9.27L7 14.14L5.82 21.02L12 17.77L18.18 21.02L17 14.14L22 9.27L14.91 8.26L12 2Z"
              fill="currentColor" />
          </svg>
          <span className="text-xs font-bold text-[#1B4965] uppercase tracking-wider">AI Search</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask: Shema, Hamotzi, learn letters…"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-[#FEFDFB] placeholder-gray-400"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#163d55] active:scale-[0.97] transition-all shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              ...
            </span>
          ) : '→'}
        </button>
      </div>

      {/* Result / Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[#C17767] px-1"
          >
            {error}
          </motion.p>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl p-4 flex items-start justify-between gap-3 ${
              result.found
                ? 'bg-primary/5 border border-primary/10'
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${result.found ? 'text-primary' : 'text-gray-500'}`}>
                {result.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {result.description}
              </p>
            </div>
            {result.found && (
              <button
                onClick={handleOpen}
                className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-lg hover:bg-primary/20 active:scale-[0.97] transition-all whitespace-nowrap"
              >
                Open →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
