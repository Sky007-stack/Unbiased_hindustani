# Unbiased Hindustani — Development Update

**Date:** February 7, 2026
**Live URL:** [https://unbiased-hindustani-xi.vercel.app](https://unbiased-hindustani-xi.vercel.app)
**Repository:** [github.com/Sky007-stack/Unbiased_hindustani](https://github.com/Sky007-stack/Unbiased_hindustani)

---

## Core Features Built

### 1. AI-Powered News Generation
- Auto-generates detailed news articles from trending topics using Google Gemini AI
- 300–500 word structured articles with markdown headers
- Covers 10 categories: Politics, Technology, Business, Sports, Entertainment, Science, Education, Health, World, Environment
- Articles saved to database for instant future access

### 2. AI Search & Article Generation
- Search bar on homepage searches existing DB articles first
- If fewer than 3 results found, automatically generates a new AI article matching the query
- Generated articles are persisted in the database

### 3. Trending Topics (100 Topics, 10 Per Genre)
- 100 trending topics seeded across 10 categories
- Grouped view by category with color-coded cards and emoji icons
- Category filter tabs to browse by genre
- Trend score bars (Hot / Rising / Active / Moderate)
- AI refresh button to fetch fresh trending topics from Gemini
- Clickable cards — click any topic to read a full article

### 4. AI Fact-Check System
- "Verify This News" button on every article page
- Analyzes article claims against known facts via Gemini AI
- Returns: overall verdict, truth percentage, claim-by-claim analysis, sources with reliability ratings, red flags, context
- Color-coded verdict display (green / yellow / orange / red)
- Truth percentage bar visualization
- Results cached in database — second click is instant (< 1 second)

### 5. Authentication System
- NextAuth.js v4 with credentials provider
- JWT-based sessions with role support (admin / editor / user)
- Login page with email/password
- Registration endpoint (`/api/auth/register`)
- Admin role with elevated permissions

### 6. Admin Panel
- Protected admin page at `/admin`
- Article management interface

### 7. Article Detail Pages (SSR)
- Server-side rendered article pages
- Full content with markdown rendering
- Summary bullet points, category tags, related articles section
- Integrated fact-check button

### 8. Homepage (ISR)
- Server-side rendered with ISR (revalidates every 60 seconds)
- Latest 20 articles displayed
- Category filter and search bar integrated
- Auto news feed component

---

## Performance Optimizations

| Optimization | Detail |
|---|---|
| Fact-check DB caching | First check ~5s, every repeat < 1 second |
| DB-first trending lookup | Checks existing articles before calling AI |
| Fastest AI model priority | `gemini-2.0-flash-lite` first (fastest), fallback to heavier models |
| 4-model fallback chain | `2.0-flash-lite` → `2.0-flash` → `2.5-flash-lite` → `2.5-flash` |
| Shorter prompts | Fact-check prompt cut from ~500 words to ~100 words |
| Reduced token limits | Fact-check: 8192 → 2048, Search: 16384 → 4096 |
| Single article generation | Search generates 1 article (was 3) for 3× faster response |
| Vercel region `iad1` | Deployed in US East, same region as Neon DB |
| Trending API cached 5 min | `revalidate = 300` on trending endpoint |
| Homepage ISR 60s | Fresh content without rebuilding |
| Prisma singleton pattern | Prevents connection pool exhaustion in serverless |

---

## Infrastructure & Deployment

| Component | Detail |
|---|---|
| Framework | Next.js 16.1.6 (TypeScript) |
| Styling | TailwindCSS with dark theme |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 5.22.0 with `@db.Text` for long content |
| AI | Google Gemini API |
| Auth | NextAuth.js v4 (JWT + credentials) |
| Hosting | Vercel |
| Repo | GitHub — `Sky007-stack/Unbiased_hindustani` |
| Live URL | https://unbiased-hindustani-xi.vercel.app |
| Auto-deploy | Every `git push` triggers Vercel redeploy |

---

## Bug Fixes Applied (11 Total)

| # | Bug | Fix |
|---|---|---|
| 1 | Fake YouTube embeds (Rick Astley) | Removed hardcoded URLs, `youtubeUrl` made optional |
| 2 | Shallow article content (~100 words) | Prompt updated for 300–500 word minimum |
| 3 | Duplicate trending topics | Deduplication logic added |
| 4 | `.env.local` had quotes around API keys | Removed single quotes, fixed stray `import http` line |
| 5 | Trending click redirected to homepage | Shows error banner instead; DB-first lookup added |
| 6 | Fact-check API error (404/429) | Fixed model names, added 4-model fallback chain |
| 7 | Vercel "vulnerable Next.js" error | Updated from 15.5.6 → 16.1.6 |
| 8 | `vercel.json` catch-all rewrite breaking APIs | Removed rewrite, kept only framework config |
| 9 | Git push permission denied | Switched remote from `Shivams210` → `Sky007-stack` |
| 10 | Prisma EPERM on Windows | Kill node processes before `prisma generate` |
| 11 | SQLite incompatible with serverless | Migrated to PostgreSQL (Neon) |