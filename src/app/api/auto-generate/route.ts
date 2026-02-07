import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/auto-generate — Generate news articles from trending topics using Gemini AI
export async function POST(request: NextRequest) {
  const googleKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!googleKey) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Get trending topics that don't yet have articles
    const trendingTopics = await prisma.trendingTopic.findMany({
      orderBy: { trendScore: 'desc' },
      take: 10,
    });

    if (trendingTopics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No trending topics to generate from',
        generated: 0,
      });
    }

    // Check which topics already have recent articles (avoid duplicates)
    const existingTitles = await prisma.newsArticle.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }, // Last 12 hours
      },
      select: { title: true },
    });

    const existingTitleSet = new Set(
      existingTitles.map((a) => a.title.toLowerCase().trim())
    );

    // Filter out topics that already have articles
    const topicsToGenerate = trendingTopics.filter(
      (t) => !existingTitleSet.has(t.title.toLowerCase().trim())
    );

    if (topicsToGenerate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All trending topics already have articles',
        generated: 0,
      });
    }

    // Take top 5 to avoid too many API calls
    const batch = topicsToGenerate.slice(0, 5);

    // Generate articles in parallel (max 5 at a time)
    const topicsList = batch
      .map(
        (t, i) =>
          `${i + 1}. Topic: "${t.title}" | Category: ${t.category} | Description: ${t.description || 'N/A'}`
      )
      .join('\n');

    const prompt = `You are an expert Indian news journalist for "Unbiased Hindustani.ai". Generate detailed, factual, unbiased news articles for these trending topics in India:

${topicsList}

For EACH topic, generate:
- title: A professional news headline (8-15 words)
- category: The category from the topic
- summaryPoints: An array of 6-8 concise bullet points (each 10-20 words) covering key facts
- fullContent: A VERY detailed 500-800 word article with proper structure. Break it into sections using "## Section Title" markdown headers. Cover: background/context, current developments, key stakeholders and their positions, data/statistics, expert opinions, impact on common people, and future outlook. Make it comprehensive enough that a reader feels fully informed.
- tags: An array of 4-6 relevant tags/keywords

Return as a JSON array:
[{
  "title": "...",
  "category": "...",
  "summaryPoints": ["point1", "point2", "point3", "point4", "point5", "point6"],
  "fullContent": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}]

Rules:
- Each article must have a UNIQUE title — no duplicates
- Be factual and unbiased — present all sides
- Use Indian English conventions
- For political topics, cover both ruling party and opposition perspectives
- Include recent context, background history, and implications
- Use ## headers to structure the fullContent into readable sections
- Write fullContent that is AT LEAST 500 words — readers want depth
- Do NOT fabricate specific statistics or quotes`;

    // Try multiple models with fallback for rate limits
    const models = [
      { name: 'gemini-2.5-flash', version: 'v1' },
      { name: 'gemini-2.0-flash', version: 'v1' },
      { name: 'gemini-2.5-flash-lite', version: 'v1' },
      { name: 'gemini-2.0-flash-lite', version: 'v1' },
    ];
    let aiText = '';
    let aiSuccess = false;

    for (const model of models) {
      const apiUrl = `https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${googleKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16384,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        aiSuccess = true;
        break;
      }
      console.warn(`Auto-generate: Model ${model.name} failed (${response.status}), trying next...`);
    }

    if (!aiSuccess) {
      return NextResponse.json(
        { error: 'AI quota exceeded. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    // Parse JSON from response
    const jsonMatch =
      aiText.match(/```json\n?([\s\S]*?)\n?```/) || aiText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiText;
    const articles = JSON.parse(jsonText);

    if (!Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      );
    }

    // Save articles to database
    const created = [];
    for (const article of articles) {
      try {
        const saved = await prisma.newsArticle.create({
          data: {
            title: article.title || 'Untitled',
            summaryPoints: JSON.stringify(article.summaryPoints || []),
            fullContent: article.fullContent || null,
            category: article.category || 'Politics',
            tags: JSON.stringify(article.tags || []),
            source: 'AI Generated',
            published: true,
          },
        });
        created.push(saved);
      } catch (err) {
        console.error('Error saving article:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${created.length} articles from trending topics`,
      generated: created.length,
      articles: created.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
      })),
    });
  } catch (error) {
    console.error('Auto-generate error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-generate articles' },
      { status: 500 }
    );
  }
}

// GET /api/auto-generate — Check status / trigger if needed
export async function GET() {
  try {
    const recentCount = await prisma.newsArticle.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      },
    });

    const totalCount = await prisma.newsArticle.count();
    const trendingCount = await prisma.trendingTopic.count();

    return NextResponse.json({
      recentArticles: recentCount,
      totalArticles: totalCount,
      trendingTopics: trendingCount,
      needsGeneration: recentCount < 5 && trendingCount > 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
