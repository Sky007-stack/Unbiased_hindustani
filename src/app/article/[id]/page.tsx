import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FactCheckButton from '@/components/FactCheckButton';

export const revalidate = 60;

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = parseInt(id);

  if (isNaN(articleId)) {
    notFound();
  }

  const article = await prisma.newsArticle.findUnique({
    where: { id: articleId },
    include: { author: { select: { name: true } } },
  });

  if (!article) {
    notFound();
  }

  const summaryPoints = JSON.parse(article.summaryPoints);
  const tags = article.tags ? JSON.parse(article.tags) : [];

  // Get related articles (same category)
  const related = await prisma.newsArticle.findMany({
    where: {
      category: article.category,
      id: { not: article.id },
      published: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent"
          >
            Unbiased Hindustani.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-orange-400 transition text-sm font-medium"
            >
              ← Back to News
            </Link>
            <Link
              href="/trending"
              className="text-gray-400 hover:text-orange-400 transition text-sm font-medium"
            >
              📈 Trending
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Category & Meta */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="px-4 py-1.5 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
            {categoryIcons[article.category] || '📰'} {article.category}
          </span>
          {article.source && (
            <span className="px-3 py-1 bg-purple-500/15 text-purple-300 rounded-full text-xs border border-purple-500/20">
              🤖 {article.source}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {formatDate(article.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-8 leading-tight">
          {article.title}
        </h1>

        {/* Author */}
        {article.author?.name && (
          <p className="text-gray-400 mb-8">
            By{' '}
            <span className="text-orange-300 font-medium">
              {article.author.name}
            </span>
          </p>
        )}

        {/* YouTube Embed — only for articles sourced from YouTube, not AI-generated */}
        {article.youtubeUrl && article.source !== 'AI Generated' && article.source !== 'Search Generated' && (
          <div className="mb-10">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-700/50">
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoId(article.youtubeUrl)}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Key Points */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <span className="text-orange-400">▎</span> Key Points
          </h2>
          <div className="bg-gradient-to-br from-orange-500/10 to-green-500/5 rounded-2xl p-6 border border-orange-500/20">
            <ul className="space-y-3">
              {summaryPoints.map((point: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-gray-200"
                >
                  <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Full Content */}
        {article.fullContent && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="text-green-400">▎</span> Full Analysis
            </h2>
            <div className="prose prose-invert prose-lg max-w-none">
              {renderFullContent(article.fullContent)}
            </div>
          </section>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gray-800/80 text-gray-400 rounded-full text-sm border border-gray-700 hover:border-orange-500/30 hover:text-orange-300 transition cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Fact-Check */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <span className="text-blue-400">▎</span> Verify This News
          </h2>
          <FactCheckButton articleId={article.id} />
        </section>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              More in {article.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((rel) => {
                const relPoints = JSON.parse(rel.summaryPoints);
                return (
                  <Link
                    key={rel.id}
                    href={`/article/${rel.id}`}
                    className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-orange-500/30 transition group"
                  >
                    <h3 className="text-sm font-bold text-white mb-2 group-hover:text-orange-300 transition line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {relPoints[0]}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">
            © 2025 Unbiased Hindustani.ai — AI-powered unbiased news
          </p>
        </div>
      </footer>
    </div>
  );
}

// Render full content with support for ## markdown headers
function renderFullContent(content: string) {
  const blocks = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        elements.push(
          <p key={key++} className="text-gray-300 leading-relaxed text-base mb-4">
            {text}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  for (const line of blocks) {
    if (line.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <h3
          key={key++}
          className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2"
        >
          <span className="text-orange-400">▸</span>
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      flushParagraph();
      elements.push(
        <h4
          key={key++}
          className="text-lg font-semibold text-white/90 mt-4 mb-2"
        >
          {line.replace('### ', '')}
        </h4>
      );
    } else if (line.trim() === '') {
      flushParagraph();
    } else {
      currentParagraph.push(line);
    }
  }

  flushParagraph();
  return <>{elements}</>;
}

function extractVideoId(url: string): string {
  try {
    if (url.includes('/embed/')) return url.split('/embed/')[1].split('?')[0];
    if (url.includes('watch?v='))
      return new URL(url).searchParams.get('v') || '';
    if (url.includes('youtu.be/'))
      return url.split('youtu.be/')[1].split('?')[0];
  } catch {
    // ignore
  }
  return '';
}
