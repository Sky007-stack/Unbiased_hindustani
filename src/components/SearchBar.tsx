'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchResult {
  id: number;
  title: string;
  summaryPoints: string[];
  fullContent?: string;
  youtubeUrl?: string;
  category: string;
  tags?: string[];
  source?: string;
  createdAt: string;
  fromDatabase?: boolean;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;

    setLoading(true);
    setSearched(true);
    setMessage('');

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        setResults([]);
      } else {
        setResults(data.articles || []);
        setMessage(data.message || '');
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setMessage('');
    inputRef.current?.focus();
  };

  const categoryColors: Record<string, string> = {
    Politics: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Technology: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Business: 'bg-green-500/20 text-green-300 border-green-500/30',
    Sports: 'bg-red-500/20 text-red-300 border-red-500/30',
    Entertainment: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    Science: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    World: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Education: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    Health: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Environment: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any news topic... (e.g., Budget 2025, Cricket, AI Policy)"
            className="w-full pl-12 pr-32 py-4 bg-gray-800/80 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-lg backdrop-blur-sm"
          />
          <div className="absolute right-2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-2">
          Powered by AI — search any topic and get instant news coverage
        </p>
      </form>

      {/* Search Results */}
      {searched && (
        <div className="mt-10 max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">
                Searching & generating news with AI...
              </p>
              <p className="text-gray-500 text-sm mt-1">
                This may take a few seconds
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-400">
                Try a different search term or topic
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Search Results for &quot;{query}&quot;
                </h3>
                {message && (
                  <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                    {message}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article) => (
                  <article
                    key={article.id}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group"
                  >
                    {/* Category & Source Badge */}
                    <div className="p-5 pb-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[article.category] ||
                            categoryColors['Politics']
                          }`}
                        >
                          {article.category}
                        </span>
                        {article.source && (
                          <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-full text-xs border border-purple-500/20">
                            {article.fromDatabase ? '📁 Existing' : '🤖 AI Generated'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 pt-2">
                      <h4 className="text-lg font-bold text-white mb-3 group-hover:text-orange-300 transition line-clamp-2">
                        {article.title}
                      </h4>

                      <ul className="space-y-2 mb-4">
                        {article.summaryPoints
                          .slice(0, 3)
                          .map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-300"
                            >
                              <span className="text-orange-400 mt-0.5 flex-shrink-0">
                                ▸
                              </span>
                              <span className="line-clamp-2">{point}</span>
                            </li>
                          ))}
                      </ul>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {article.tags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Read More */}
                    <div className="px-5 pb-5">
                      <a
                        href={`/article/${article.id}`}
                        className="inline-flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 font-medium transition"
                      >
                        Read Full Article
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
