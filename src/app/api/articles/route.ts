import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/articles — fetch all published articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = { published: true };
    if (category && category !== 'all') {
      where.category = category;
    }

    // Quick search by title keyword (DB-only, no AI)
    const q = searchParams.get('q')?.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          author: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.newsArticle.count({ where }),
    ]);

    // Parse JSON fields
    const formattedArticles = articles.map((article) => ({
      ...article,
      summaryPoints: JSON.parse(article.summaryPoints),
      tags: article.tags ? JSON.parse(article.tags) : [],
    }));

    return NextResponse.json({
      articles: formattedArticles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/articles — create a new article (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summaryPoints, fullContent, youtubeUrl, category, tags, authorId } = body;

    if (!title || !summaryPoints) {
      return NextResponse.json(
        { error: 'Title and summary points are required' },
        { status: 400 }
      );
    }

    const article = await prisma.newsArticle.create({
      data: {
        title,
        summaryPoints: JSON.stringify(summaryPoints),
        fullContent: fullContent || null,
        youtubeUrl: youtubeUrl || null,
        category: category || 'Politics',
        tags: tags ? JSON.stringify(tags) : null,
        source: youtubeUrl ? 'YouTube' : 'Manual',
        authorId: authorId || null,
      },
    });

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        summaryPoints: JSON.parse(article.summaryPoints),
        tags: article.tags ? JSON.parse(article.tags) : [],
      },
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles — delete an article
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    await prisma.newsArticle.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
