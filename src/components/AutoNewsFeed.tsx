'use client';

import { useState, useEffect } from 'react';

interface NewsArticle {
  id: number;
  title: string;
  summaryPoints: string[];
  fullContent?: string | null;
  youtubeUrl?: string | null;
  imageUrl?: string | null;
  category: string;
  tags?: string[];
  source?: string;
  createdAt: string;
}

const categoryIcons: Record<string, string> = {
  Politics: '🏛️',
  Technology: '💻',
  Business: '📈',
  Sports: '⚽',
  Entertainment: '🎬',
  Science: '🔬',
  World: '🌍',
  Education: '📚',
  Health: '🏥',
  Environment: '🌿',
};

const categoryColors: Record<string, string> = {
  Politics:
    'from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40',
  Technology:
    'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
  Business:
    'from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40',
  Sports:
    'from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40',
  Entertainment:
    'from-pink-500/10 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40',
  Science:
    'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40',
  World:
    'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40',
  Education:
    'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-500/40',
  Health:
    'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40',
  Environment:
    'from-teal-500/10 to-teal-600/5 border-teal-500/20 hover:border-teal-500/40',
};

export default function AutoNewsFeed({
  initialArticles,
}: {
  initialArticles: NewsArticle[];
}) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Auto-generate articles if none exist
  useEffect(() => {
    if (initialArticles.length === 0) {
      generateArticles();
    }
  }, []);

  const generateArticles = async () => {
    setGenerating(true);
    try {
      // First ensure trending topics exist
      const trendRes = await fetch('/api/trending?refresh=true');
      await trendRes.json();

      // Then generate articles from trending topics
      const genRes = await fetch('/api/auto-generate', { method: 'POST' });
      const genData = await genRes.json();

      if (genData.success && genData.generated > 0) {
        // Refresh articles from DB
        const articlesRes = await fetch('/api/articles?limit=20');
        const articlesData = await articlesRes.json();
        if (articlesData.articles) {
          setArticles(articlesData.articles);
        }
      }
    } catch (error) {
      console.error('Error generating articles:', error);
    } finally {
      setGenerating(false);
    }
  };

  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const allCategories = [
    ...new Set(articles.map((a) => a.category)),
  ].sort();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div>
      {/* Category Filters + Generate Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#FF9933] to-[#138808] text-white shadow-lg'
                : 'bg-gray-800/80 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            All ({articles.length})
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FF9933] to-[#138808] text-white shadow-lg'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {categoryIcons[cat] || '📰'} {cat} (
              {articles.filter((a) => a.category === cat).length})
            </button>
          ))}
        </div>

        <button
          onClick={generateArticles}
          disabled={generating}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
              Generating...
            </>
          ) : (
            <>🤖 Generate Fresh News</>
          )}
        </button>
      </div>

      {/* Articles Grid */}
      {generating && articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Generating News with AI...
          </h3>
          <p className="text-gray-400">
            Fetching trending topics and creating articles. This takes 10-15
            seconds.
          </p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border border-gray-700/50">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-2xl font-bold text-white mb-3">
            No Articles Yet
          </h3>
          <p className="text-gray-400 mb-6">
            Click &quot;Generate Fresh News&quot; to create AI-powered articles
            from trending topics
          </p>
          <button
            onClick={generateArticles}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            🤖 Generate News Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const colors =
              categoryColors[article.category] || categoryColors['Politics'];
            const isExpanded = expandedId === article.id;

            return (
              <article
                key={article.id}
                className={`bg-gradient-to-br ${colors} backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 group cursor-pointer`}
                onClick={() =>
                  setExpandedId(isExpanded ? null : article.id)
                }
              >
                {/* Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xl">
                      {categoryIcons[article.category] || '📰'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-medium text-white/80">
                      {article.category}
                    </span>
                    {article.source && (
                      <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-full text-xs">
                        🤖 AI
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-orange-300 transition line-clamp-2">
                    {article.title}
                  </h3>
                </div>

                {/* Summary Points */}
                <div className="px-5 pb-3">
                  <ul className="space-y-1.5">
                    {(isExpanded
                      ? article.summaryPoints
                      : article.summaryPoints.slice(0, 3)
                    ).map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">
                          ▸
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {!isExpanded &&
                    article.summaryPoints.length > 3 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{article.summaryPoints.length - 3} more points — click
                        to expand
                      </p>
                    )}
                </div>

                {/* Expanded Content */}
                {isExpanded && article.fullContent && (
                  <div className="px-5 pb-4">
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {article.fullContent}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags & Links */}
                <div className="px-5 pb-4">
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-700/30 text-gray-400 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <a
                      href={`/article/${article.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-orange-400 hover:text-orange-300 font-medium transition flex items-center gap-1"
                    >
                      Read More
                      <svg
                        className="w-3.5 h-3.5"
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
                    {article.youtubeUrl && article.source !== 'AI Generated' && article.source !== 'Search Generated' && (
                      <a
                        href={article.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-red-400 hover:text-red-300 transition flex items-center gap-1"
                      >
                        ▶ YouTube
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
