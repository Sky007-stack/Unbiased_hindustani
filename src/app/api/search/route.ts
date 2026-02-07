

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search?q=query — Search articles in DB + generate with AI if needed
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Search query must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    // 1. Search existing articles in the database
    const dbArticles = await prisma.newsArticle.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { fullContent: { contains: query } },
          { category: { contains: query } },
          { tags: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const formattedDbArticles = dbArticles.map((article) => ({
      id: article.id,
      title: article.title,
      summaryPoints: JSON.parse(article.summaryPoints),
      fullContent: article.fullContent,
      youtubeUrl: article.youtubeUrl,
      imageUrl: article.imageUrl,
      category: article.category,
      tags: article.tags ? JSON.parse(article.tags) : [],
      source: article.source,
      createdAt: article.createdAt,
      fromDatabase: true,
    }));

    // 2. If we have enough results from DB, return them
    if (formattedDbArticles.length >= 3) {
      return NextResponse.json({
        query,
        articles: formattedDbArticles,
        source: 'database',
        aiGenerated: false,
      });
    }

    // 3. Not enough results — generate with AI
    const googleKey =
      process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!googleKey) {
      return NextResponse.json({
        query,
        articles: formattedDbArticles,
        source: 'database',
        aiGenerated: false,
        message: 'Limited results found. AI generation unavailable.',
      });
    }

    const prompt = `You are an expert Indian news journalist for "Unbiased Hindustani.ai". A user searched for: "${query}"

Generate 1 detailed, factual, unbiased news article related to this search topic in the Indian context.

For the article, provide:
- title: A professional, unique news headline (8-15 words)
- category: One of [Politics, Technology, Business, Sports, Entertainment, Science, Education, Health, World, Environment]
- summaryPoints: An array of 5-6 concise bullet points (each 10-20 words)
- fullContent: A detailed 300-500 word article structured with "## Section Title" markdown headers. Cover: background, current developments, expert analysis, and future outlook.
- tags: An array of 4-6 relevant keywords

Return as a JSON array:
[{
  "title": "...",
  "category": "...",
  "summaryPoints": ["...", "...", "...", "...", "...", "..."],
  "fullContent": "...",
  "tags": ["...", "...", "...", "..."]
}]

Rules:
- Focus on REAL, current events and facts related to the search query
- Be factual and unbiased — present all sides
- Use Indian English conventions
- Use ## headers to structure fullContent into readable sections
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
            maxOutputTokens: 4096,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        aiSuccess = true;
        break;
      }
      console.warn(`Search: Model ${model.name} failed (${response.status}), trying next...`);
    }

    if (!aiSuccess) {
      return NextResponse.json({
        query,
        articles: formattedDbArticles,
        source: 'database',
        aiGenerated: false,
        message: 'AI quota exceeded. Showing database results. Please wait a moment and try again.',
      });
    }

    // Parse JSON from response
    const jsonMatch =
      aiText.match(/```json\n?([\s\S]*?)\n?```/) || aiText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiText;
    const aiArticles = JSON.parse(jsonText);

    if (!Array.isArray(aiArticles)) {
      return NextResponse.json({
        query,
        articles: formattedDbArticles,
        source: 'database',
        aiGenerated: false,
      });
    }

    // Save AI-generated articles to DB for future searches
    const savedAiArticles = [];
    for (const article of aiArticles) {
      try {
        const saved = await prisma.newsArticle.create({
          data: {
            title: article.title,
            summaryPoints: JSON.stringify(article.summaryPoints || []),
            fullContent: article.fullContent || null,
            category: article.category || 'Politics',
            tags: JSON.stringify(article.tags || []),
            source: 'Search Generated',
            published: true,
          },
        });

        savedAiArticles.push({
          id: saved.id,
          title: saved.title,
          summaryPoints: article.summaryPoints,
          fullContent: saved.fullContent,
          category: saved.category,
          tags: article.tags || [],
          source: 'Search Generated',
          createdAt: saved.createdAt,
          fromDatabase: false,
        });
      } catch (err) {
        console.error('Error saving AI article:', err);
      }
    }

    // Combine DB results + AI results
    const allArticles = [...formattedDbArticles, ...savedAiArticles];

    return NextResponse.json({
      query,
      articles: allArticles,
      source: 'mixed',
      aiGenerated: true,
      message: `Found ${formattedDbArticles.length} existing + generated ${savedAiArticles.length} new articles`,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
