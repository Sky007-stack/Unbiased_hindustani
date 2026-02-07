import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/trending — fetch trending topics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const refresh = searchParams.get('refresh');

    // If refresh=true, fetch fresh trending topics using Gemini AI
    if (refresh === 'true') {
      await refreshTrendingTopics();
    }

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }

    const topics = await prisma.trendingTopic.findMany({
      where,
      orderBy: { trendScore: 'desc' },
      take: 200,
    });

    // Also get categories
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ topics, categories });
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending topics' },
      { status: 500 }
    );
  }
}

async function refreshTrendingTopics() {
  const googleKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!googleKey) return;

  const categories = [
    'Politics', 'Technology', 'Business', 'Sports',
    'Entertainment', 'Science', 'Education', 'Health',
    'World', 'Environment'
  ];

  const prompt = `You are a news analyst specializing in Indian current affairs. Generate EXACTLY 10 currently trending topics for EACH of the following categories, making a total of 100 trending topics:

Categories: ${categories.join(', ')}

For EACH category, provide exactly 10 trending topics. For each topic:
- title: A concise trending topic title (3-8 words)
- description: One sentence description (max 20 words)
- category: The category it belongs to (must be one of the listed categories)
- trendScore: A number 1-100 indicating how trending it is
- source: Either "Google Trends", "Social Media", "News Outlets", or "Public Interest"

Return as a flat JSON array (all 100 topics in one array):
[{"title": "", "description": "", "category": "", "trendScore": 0, "source": ""}]

CRITICAL RULES:
- Generate EXACTLY 10 topics per category (10 categories × 10 topics = 100 total)
- Each topic must have a UNIQUE title — no duplicates across any category
- Focus on CURRENT and REAL trending topics in India for February 2026
- Be specific — avoid vague titles like "Latest News"
- Cover diverse angles within each category
- Be factual and include topics that people are actually searching for`;

  try {
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
      console.warn(`Trending: Model ${model.name} failed (${response.status}), trying next...`);
    }

    if (!aiSuccess) return;

    // Parse JSON from response
    const jsonMatch = aiText.match(/```json\n?([\s\S]*?)\n?```/) || aiText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiText;
    const topics = JSON.parse(jsonText);

    if (Array.isArray(topics)) {
      // Clear old trending topics older than 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await prisma.trendingTopic.deleteMany({
        where: { fetchedAt: { lt: oneDayAgo } },
      });

      // Get existing topic titles to avoid duplicates
      const existingTopics = await prisma.trendingTopic.findMany({
        select: { title: true },
      });
      const existingTitles = new Set(
        existingTopics.map((t) => t.title.toLowerCase().trim())
      );

      // Insert only unique new topics
      let addedCount = 0;
      for (const topic of topics) {
        const title = (topic.title || '').trim();
        if (!title || existingTitles.has(title.toLowerCase())) continue;

        await prisma.trendingTopic.create({
          data: {
            title,
            description: topic.description,
            category: topic.category || 'Politics',
            source: topic.source || 'AI Generated',
            trendScore: topic.trendScore || 50,
            region: 'India',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  } catch (error) {
    console.error('Error refreshing trending topics:', error);
  }
}

// GET /api/trending/categories — fetch all categories
export async function POST(request: NextRequest) {
  try {
    await refreshTrendingTopics();
    
    const topics = await prisma.trendingTopic.findMany({
      orderBy: { trendScore: 'desc' },
      take: 200,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Trending topics refreshed',
      topics 
    });
  } catch (error) {
    console.error('Error refreshing topics:', error);
    return NextResponse.json(
      { error: 'Failed to refresh trending topics' },
      { status: 500 }
    );
  }
}
