import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import AutoNewsFeed from '@/components/AutoNewsFeed';

// ISR: Revalidate every 60 seconds for fresh content
export const revalidate = 60;

async function getNewsArticles() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      summaryPoints: JSON.parse(article.summaryPoints),
      youtubeUrl: article.youtubeUrl || undefined,
      fullContent: article.fullContent || undefined,
      imageUrl: article.imageUrl || undefined,
      category: article.category,
      tags: article.tags ? JSON.parse(article.tags) : [],
      source: article.source || 'AI Generated',
      createdAt: article.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function Home() {
  const [newsItems, categories] = await Promise.all([
    getNewsArticles(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
            Unbiased Hindustani.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/trending" className="text-gray-400 hover:text-orange-400 transition text-sm font-medium">
              📈 Trending
            </Link>
            <Link href="/admin" className="text-gray-400 hover:text-green-400 transition text-sm font-medium">
              ⚙️ Admin
            </Link>
            <Link href="/login" className="px-4 py-1.5 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white text-sm rounded-lg hover:shadow-lg transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-green-500/20 border border-orange-500/30 rounded-full text-sm font-medium text-orange-200">
                🇮🇳 AI-Powered News Coverage
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent leading-tight">
              Know what India knows — instantly
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-10 leading-relaxed">
              Search any topic. Get AI-powered unbiased news in seconds.
            </p>

            {/* Search Bar */}
            <SearchBar />
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/10 to-green-500/10 blur-3xl rounded-full -z-10"></div>
      </header>

      {/* What We Offer Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="group bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Auto-generated news from trending topics using advanced AI analysis</p>
          </div>

          <div className="group bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Search any topic and get instant AI-generated news coverage</p>
          </div>

          <div className="group bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Unbiased</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Balanced perspectives on every story — no political bias</p>
          </div>
        </div>
      </section>

      {/* Category Browser */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat: any) => (
              <span
                key={cat.id}
                className="px-4 py-2 bg-gray-800/80 text-gray-300 rounded-full border border-gray-700 text-sm hover:border-orange-500/50 hover:text-orange-300 transition-all cursor-default"
              >
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Latest News Section — Auto-Generated Feed */}
      <main id="news" className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Latest AI-Generated News
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Auto-generated from trending topics across India — updated regularly
          </p>
        </div>

        <AutoNewsFeed initialArticles={newsItems} />
      </main>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-orange-500/10 via-white/5 to-green-500/10 backdrop-blur-sm rounded-3xl p-10 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent mb-1">100%</div>
              <div className="text-gray-400 text-sm font-medium">Unbiased</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent mb-1">24/7</div>
              <div className="text-gray-400 text-sm font-medium">Updates</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent mb-1">AI</div>
              <div className="text-gray-400 text-sm font-medium">Powered</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent mb-1">10+</div>
              <div className="text-gray-400 text-sm font-medium">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-orange-500/20 via-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-3xl p-10 lg:p-14 border border-white/10 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Beyond news, understanding.
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Search any topic or explore trending stories — AI delivers instant, balanced news coverage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#news"
              className="px-8 py-4 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Read News
            </a>
            <Link
              href="/trending"
              className="px-8 py-4 bg-gray-800/80 text-white font-semibold rounded-lg border border-gray-700 hover:border-orange-500/50 hover:scale-105 transition-all duration-300"
            >
              📈 Trending Topics
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent mb-3">
                Unbiased Hindustani.ai
              </h3>
              <p className="text-gray-400 text-sm">
                AI-powered unbiased news — search any topic, get instant coverage
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/#news" className="text-gray-400 hover:text-orange-500 transition text-sm">Latest News</Link></li>
                <li><Link href="/trending" className="text-gray-400 hover:text-orange-500 transition text-sm">Trending Topics</Link></li>
                <li><Link href="/admin" className="text-gray-400 hover:text-orange-500 transition text-sm">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Connect</h4>
              <div className="space-y-2">
                <a href="mailto:unbiasedhindustani@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition text-sm">
                  📧 Gmail
                </a>
                <a href="https://www.instagram.com/unbiased_hindustani" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition text-sm">
                  📸 Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Unbiased Hindustani.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
