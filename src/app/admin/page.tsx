'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NewsArticle {
  id: number;
  title: string;
  summaryPoints: string[];
  youtubeUrl: string;
  fullContent?: string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summaryPoints, setSummaryPoints] = useState(['', '', '', '', '']);
  const [fullContent, setFullContent] = useState('');
  const [category, setCategory] = useState('Politics');

  const categories = [
    'Politics', 'Technology', 'Business', 'Sports',
    'Entertainment', 'Science', 'World', 'Education',
    'Health', 'Environment'
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchArticles();
    }
  }, [session]);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?limit=100');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!youtubeUrl) {
      setMessage('Please enter a YouTube URL');
      return;
    }

    setGenerating(true);
    setMessage('🤖 Generating AI summary...');

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl }),
      });

      const data = await res.json();

      if (data.success) {
        setTitle(data.title);
        setSummaryPoints(data.summaryPoints);
        setFullContent(data.fullContent || '');
        setMessage('✅ AI summary generated! Review and publish.');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!title || summaryPoints.some((p) => !p.trim())) {
      setMessage('Please fill in the title and all 5 summary points');
      return;
    }

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summaryPoints: summaryPoints.filter((p) => p.trim()),
          fullContent,
          youtubeUrl,
          category,
          authorId: (session?.user as any)?.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Article published successfully!');
        resetForm();
        fetchArticles();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to publish article');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        setMessage('✅ Article deleted');
        fetchArticles();
      }
    } catch (error) {
      setMessage('❌ Failed to delete article');
    }
  };

  const resetForm = () => {
    setYoutubeUrl('');
    setTitle('');
    setSummaryPoints(['', '', '', '', '']);
    setFullContent('');
    setCategory('Politics');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) return null;

  const isAdmin = (session.user as any)?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent">
              Unbiased Hindustani.ai
            </a>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-semibold border border-orange-500/30">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:inline">
              {session.user?.name || session.user?.email}
              {isAdmin && (
                <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm border border-red-500/30"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <a href="/" className="text-gray-400 hover:text-white transition text-sm">← Homepage</a>
          <a href="/trending" className="text-gray-400 hover:text-orange-400 transition text-sm">📈 Trending Topics</a>
        </div>

        {!isAdmin ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You need admin privileges to access this panel.</p>
            <p className="text-gray-500 text-sm mt-2">Contact the administrator for access.</p>
          </div>
        ) : (
          <>
            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg border ${
                message.includes('✅') ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                message.includes('❌') ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}>
                {message}
              </div>
            )}

            {/* Add New Article */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">📝 Add New Article</h2>

              {/* YouTube URL + AI Generate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">YouTube Video URL</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                  <button
                    onClick={handleGenerateAI}
                    disabled={generating}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {generating ? '⏳ Generating...' : '🤖 Generate with AI'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Article Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter news headline"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Summary Points */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">5 Key Summary Points</label>
                <div className="space-y-3">
                  {summaryPoints.map((point, index) => (
                    <input
                      key={index}
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...summaryPoints];
                        newPoints[index] = e.target.value;
                        setSummaryPoints(newPoints);
                      }}
                      placeholder={`Point ${index + 1}`}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition text-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Full Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Content / Analysis</label>
                <textarea
                  value={fullContent}
                  onChange={(e) => setFullContent(e.target.value)}
                  rows={6}
                  placeholder="Detailed article content..."
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-y"
                />
              </div>

              {/* Publish Button */}
              <div className="flex gap-4">
                <button
                  onClick={handlePublish}
                  className="px-8 py-3 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-semibold rounded-lg hover:shadow-2xl hover:scale-[1.02] transition-all"
                >
                  📰 Publish Article
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                >
                  Clear Form
                </button>
              </div>
            </div>

            {/* Published Articles List */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                📋 Published Articles ({articles.length})
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              ) : articles.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No articles yet. Create your first one above!</p>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-gray-900/50 rounded-xl p-5 border border-gray-700/30 hover:border-gray-600/50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full">
                              #{article.id}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                              {article.category}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{article.title}</h3>
                          <p className="text-gray-500 text-xs">
                            {new Date(article.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm border border-red-500/20"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
