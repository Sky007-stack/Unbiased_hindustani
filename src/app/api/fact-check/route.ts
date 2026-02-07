import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/fact-check — AI-powered fact checking for an article
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

    const summaryPoints = JSON.parse(article.summaryPoints);

    const prompt = `You are an expert fact-checker and journalist working for a credible Indian news verification agency. Your job is to rigorously fact-check news articles.

ARTICLE TO FACT-CHECK:
Title: "${article.title}"
Category: ${article.category}
Key Claims:
${summaryPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

Full Content:
${article.fullContent || 'Not available'}

INSTRUCTIONS:
Analyze each claim in the article and verify it against known facts. For each major claim:
1. Identify the specific claim
2. Assess whether it is TRUE, PARTIALLY TRUE, MISLEADING, UNVERIFIED, or FALSE
3. Provide a brief explanation of your verification
4. Cite what credible sources would confirm or deny this claim

Then provide an overall assessment.

Return your response as a JSON object:
{
  "overallVerdict": "TRUE" | "MOSTLY TRUE" | "PARTIALLY TRUE" | "MISLEADING" | "MOSTLY FALSE" | "FALSE" | "UNVERIFIED",
  "truthPercentage": <number 0-100>,
  "overallSummary": "<2-3 sentence summary of the fact-check>",
  "claimVerifications": [
    {
      "claim": "<the specific claim being checked>",
      "verdict": "TRUE" | "PARTIALLY TRUE" | "MISLEADING" | "UNVERIFIED" | "FALSE",
      "explanation": "<1-2 sentence explanation>",
      "sources": ["<source name 1>", "<source name 2>"]
    }
  ],
  "sources": [
    {
      "name": "<source name>",
      "type": "Government Data" | "News Outlet" | "Research Paper" | "Official Statement" | "Expert Analysis" | "Public Records",
      "reliability": "High" | "Medium" | "Low"
    }
  ],
  "redFlags": ["<any red flags or concerns about the article>"],
  "context": "<additional context that helps understand the claims better>"
}

IMPORTANT RULES:
- Be rigorous and honest in your assessment
- If claims are about future events or predictions, mark them as "UNVERIFIED" 
- If claims are broadly accurate but lack specific verifiable details, mark as "PARTIALLY TRUE"
- Always cite realistic, credible Indian and international sources (e.g., PIB, RBI, SEBI, PTI, Reuters, WHO, NASSCOM, etc.)
- For AI-generated articles, note that the content is AI-generated and facts should be independently verified
- Do NOT fabricate specific URLs — just cite source organization names
- Be balanced and fair in your assessment`;

    // Try multiple models with retry for rate limits
    const models = [
      { name: 'gemini-2.5-flash', version: 'v1' },
      { name: 'gemini-2.0-flash', version: 'v1' },
      { name: 'gemini-2.5-flash-lite', version: 'v1' },
      { name: 'gemini-2.0-flash-lite', version: 'v1' },
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
            temperature: 0.3,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        const jsonMatch =
          text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
        const factCheckResult = JSON.parse(jsonText);

        return NextResponse.json({
          success: true,
          articleId: article.id,
          articleTitle: article.title,
          factCheck: factCheckResult,
        });
      }

      // If rate limited (429), try next model
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
