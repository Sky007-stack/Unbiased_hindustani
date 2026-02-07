import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/fact-check — AI-powered fact checking with DB caching
export async function POST(request: NextRequest) {
  const googleKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!googleKey) {
    return NextResponse.json(
      { error: 'AI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const article = await prisma.newsArticle.findUnique({
      where: { id: parseInt(articleId) },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // CHECK CACHE FIRST — return instantly if already fact-checked
    if (article.factCheckCache && article.factCheckedAt) {
      const cached = JSON.parse(article.factCheckCache);
      return NextResponse.json({
        success: true,
        articleId: article.id,
        articleTitle: article.title,
        factCheck: cached,
        cached: true,
      });
    }

    const summaryPoints = JSON.parse(article.summaryPoints);

    const prompt = `Fact-check this Indian news article concisely.

Title: "${article.title}"
Category: ${article.category}
Claims:
${summaryPoints.slice(0, 4).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

Return JSON:
{
  "overallVerdict": "TRUE|MOSTLY TRUE|PARTIALLY TRUE|MISLEADING|MOSTLY FALSE|FALSE|UNVERIFIED",
  "truthPercentage": <0-100>,
  "overallSummary": "<1 sentence>",
  "claimVerifications": [{"claim": "<claim>", "verdict": "TRUE|FALSE|UNVERIFIED|PARTIALLY TRUE|MISLEADING", "explanation": "<1 sentence>", "sources": ["<source>"]}],
  "sources": [{"name": "<source>", "type": "Government Data|News Outlet|Research Paper|Official Statement|Expert Analysis", "reliability": "High|Medium|Low"}],
  "redFlags": ["<concern>"],
  "context": "<1 sentence>"
}

Rules: Be honest. Mark AI-generated content as UNVERIFIED. Cite real Indian sources (PIB, RBI, PTI, Reuters etc). Be concise.`;

    // Use fastest models first
    const models = [
      { name: 'gemini-2.0-flash-lite', version: 'v1' },
      { name: 'gemini-2.0-flash', version: 'v1' },
      { name: 'gemini-2.5-flash-lite', version: 'v1' },
      { name: 'gemini-2.5-flash', version: 'v1' },
    ];
    let lastError = '';

    for (const model of models) {
      const apiUrl = `https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${googleKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const jsonMatch =
          text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
        const factCheckResult = JSON.parse(jsonText);

        // CACHE the result in DB for instant future lookups
        await prisma.newsArticle.update({
          where: { id: article.id },
          data: {
            factCheckCache: JSON.stringify(factCheckResult),
            factCheckedAt: new Date(),
          },
        }).catch(err => console.warn('Cache save failed:', err));

        return NextResponse.json({
          success: true,
          articleId: article.id,
          articleTitle: article.title,
          factCheck: factCheckResult,
          cached: false,
        });
      }

      const errText = await response.text();
      lastError = errText;
      console.warn(`Model ${model.name} failed (${response.status}), trying next...`);
    }

    console.error('All Gemini models failed. Last error:', lastError);
    return NextResponse.json(
      { error: 'AI quota exceeded. Please wait a minute and try again.' },
      { status: 429 }
    );
  } catch (error) {
    console.error('Fact-check error:', error);
    return NextResponse.json(
      { error: 'Failed to perform fact-check' },
      { status: 500 }
    );
  }
}
