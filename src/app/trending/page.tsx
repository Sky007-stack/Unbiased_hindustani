'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TrendingTopic {
  id: number;
  title: string;
  description: string | null;
  category: string;
  source: string | null;
  trendScore: number;
  region: string;
  fetchedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

const categoryColors: Record<string, string> = {
  Politics: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-300',
  Technology: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300',
  Business: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-300',
  Sports: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-300',
  Entertainment: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-300',
  Science: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300',
  World: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-300',
  Education: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300',
  Health: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300',
  Environment: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-300',
};

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

export default function TrendingPage() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTopicId, setLoadingTopicId] = useState<number | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTrending();
  }, [selectedCategory]);

  const fetchTrending = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      
      const res = await fetch(`/api/trending?${params.toString()}`);
      const data = await res.json();
      setTopics(data.topics || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/trending', { method: 'POST' });
      await fetchTrending();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTopicClick = async (topic: TrendingTopic) => {
    setLoadingTopicId(topic.id);
    setTopicError(null);
    try {
      // Search for existing article or generate one via search API
      const res = await fetch(`/api/search?q=${encodeURIComponent(topic.title)}`);
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        // Navigate to the first matching article
        router.push(`/article/${data.articles[0].id}`);
      } else {
        // No articles found even after AI generation — show error
        setTopicError(`Could not generate article for "${topic.title}". Please try again.`);
        setLoadingTopicId(null);
      }
    } catch (error) {
      console.error('Error loading topic article:', error);
      setTopicError('Failed to load article. Please try again.');
      setLoadingTopicId(null);
    }
  };

  const getTrendBar = (score: number) => {
    if (score >= 90) return { width: `${score}%`, color: 'bg-red-500', label: '🔥 Hot' };
    if (score >= 75) return { width: `${score}%`, color: 'bg-orange-500', label: '📈 Rising' };
    if (score >= 50) return { width: `${score}%`, color: 'bg-yellow-500', label: '⚡ Active' };
    return { width: `${score}%`, color: 'bg-blue-500', label: '📊 Moderate' };
  };

  // Group topics by category
  const groupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, TrendingTopic[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full text-sm font-medium text-red-200">
                📈 Live Trending
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
              Trending Topics
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              What India is talking about right now — across politics, tech, sports, entertainment, and more
            </p>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Refreshing with AI...
                </>
              ) : (
                <>🤖 Refresh with AI</>
              )}
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/10 to-orange-500/10 blur-3xl rounded-full -z-10"></div>
      </header>

      <div className="container mx-auto px-4 pb-20">
        {/* Error Message */}
        {topicError && (
          <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center justify-between">
            <span>❌ {topicError}</span>
            <button onClick={() => setTopicError(null)} className="text-red-400 hover:text-red-200 ml-4">✕</button>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#FF9933] to-[#138808] text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            🌐 All Topics
          </button>
          {Object.keys(categoryIcons).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FF9933] to-[#138808] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {categoryIcons[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trending topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Trending Topics</h3>
            <p className="text-gray-400 mb-6">Click "Refresh with AI" to fetch the latest trending topics</p>
          </div>
        ) : selectedCategory === 'all' ? (
          /* Grouped by Category View */
          <div className="space-y-12">
            {Object.entries(groupedTopics).map(([cat, catTopics]) => (
              <div key={cat}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">{categoryIcons[cat] || '📰'}</span>
                  {cat}
                  <span className="text-sm font-normal text-gray-500">({catTopics.length} topics)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catTopics.map((topic) => {
                    const trend = getTrendBar(topic.trendScore);
                    const colors = categoryColors[topic.category] || categoryColors['Politics'];
                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleTopicClick(topic)}
                        className={`bg-gradient-to-br ${colors} backdrop-blur-sm rounded-xl p-5 border hover:scale-[1.02] transition-all duration-300 cursor-pointer relative ${loadingTopicId === topic.id ? 'opacity-70' : ''}`}
                      >
                        {loadingTopicId === topic.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10">
                            <div className="flex items-center gap-2 text-white text-sm">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Loading article...
                            </div>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white flex-1">{topic.title}</h3>
                          <span className="text-xs px-2 py-1 bg-white/10 rounded-full whitespace-nowrap ml-2">
                            {trend.label}
                          </span>
                        </div>
                        {topic.description && (
                          <p className="text-gray-300 text-sm mb-4">{topic.description}</p>
                        )}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Trend Score</span>
                            <span>{topic.trendScore}/100</span>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div
                              className={`${trend.color} rounded-full h-2 transition-all duration-500`}
                              style={{ width: trend.width }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">{topic.source}</span>
                          <span className="text-xs text-gray-500">{topic.region}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-xs font-medium text-white/70 hover:text-white transition flex items-center gap-1">
                            📖 Read Full Article →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Category View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => {
              const trend = getTrendBar(topic.trendScore);
              const colors = categoryColors[topic.category] || categoryColors['Politics'];
              return (
                <div
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className={`bg-gradient-to-br ${colors} backdrop-blur-sm rounded-xl p-5 border hover:scale-[1.02] transition-all duration-300 cursor-pointer relative ${loadingTopicId === topic.id ? 'opacity-70' : ''}`}
                >
                  {loadingTopicId === topic.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading article...
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex-1">{topic.title}</h3>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full whitespace-nowrap ml-2">
                      {trend.label}
                    </span>
                  </div>
                  {topic.description && (
                    <p className="text-gray-300 text-sm mb-4">{topic.description}</p>
                  )}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Trend Score</span>
                      <span>{topic.trendScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className={`${trend.color} rounded-full h-2 transition-all duration-500`}
                        style={{ width: trend.width }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">{topic.source}</span>
                    <span className="text-xs text-gray-500">{topic.region}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs font-medium text-white/70 hover:text-white transition flex items-center gap-1">
                      📖 Read Full Article →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-16">
          <a
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-block"
          >
            ← Back to News
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">
            © 2025 Unbiased Hindustani.ai — Trending topics powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}
