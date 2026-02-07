# 🇮🇳 Unbiased Hindustani — AI-Powered News Platform

An AI-powered, unbiased Indian news platform that auto-generates factual news articles, verifies claims with AI fact-checking, and tracks trending topics across 10 categories — all deployed as a production-grade system.

**🔗 Live:** [https://unbiased-hindustani-xi.vercel.app](https://unbiased-hindustani-xi.vercel.app)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.6 (TypeScript, App Router) |
| **Styling** | TailwindCSS (dark theme) |
| **Database** | Neon PostgreSQL (serverless, free tier) |
| **ORM** | Prisma 5.22.0 |
| **AI** | Google Gemini API (2.0-flash-lite / 2.0-flash / 2.5-flash) |
| **Auth** | NextAuth.js v4 (JWT + credentials) |
| **Hosting** | Vercel (free tier, auto-deploy on push) |
| **Repository** | [GitHub](https://github.com/Sky007-stack/Unbiased_hindustani) |

---

## ✨ Features

### 1. 🤖 AI-Powered News Generation
- Auto-generates detailed news articles from trending topics using Google Gemini AI
- 300–500 word structured articles with markdown section headers
- Covers **10 categories**: Politics, Technology, Business, Sports, Entertainment, Science, Education, Health, World, Environment
- Articles saved to PostgreSQL for instant future access

### 2. 🔍 AI Search & Article Generation
- Search bar on homepage searches existing database articles first
- If fewer than 3 results found, automatically generates a new AI article matching the query
- Generated articles are persisted in the database so repeat searches are instant

### 3. 📈 Trending Topics (100 Topics, 10 Per Genre)
- 100 trending topics seeded across 10 categories
- Grouped view by category with color-coded cards and emoji icons
- Category filter tabs to browse by genre
- Trend score bars (🔥 Hot / 📈 Rising / ⚡ Active / 📊 Moderate)
- AI refresh button to fetch fresh trending topics from Gemini
- **Clickable cards** — click any topic to read a full article

### 4. ✅ AI Fact-Check System
- **"Verify This News"** button on every article page
- Analyzes article claims against known facts via Gemini AI
- Returns:
  - Overall verdict (TRUE → FALSE scale)
  - Truth percentage with color-coded bar
  - Claim-by-claim analysis with individual verdicts
  - Sources with reliability ratings (High / Medium / Low)
  - Red flags and additional context
- **Results cached in database** — second click is instant (< 1 second)

### 5. 🔐 Authentication System
- NextAuth.js v4 with credentials provider
- JWT-based sessions with role support (admin / editor / user)
- Login page with email/password
- Registration endpoint (`/api/auth/register`)

### 6. 🛡️ Admin Panel
- Protected admin page at `/admin`
- Article management interface
- Default admin credentials:
  - **Email:** `admin@unbiasedhindustani.ai`
  - **Password:** `admin123`

### 7. 📄 Article Detail Pages (SSR)
- Server-side rendered article pages
- Full content with markdown rendering
- Summary bullet points and category tags
- Related articles section
- Integrated AI fact-check button

### 8. 🏠 Homepage (ISR)
- Server-side rendered with Incremental Static Regeneration (revalidates every 60 seconds)
- Latest 20 articles displayed
- Category filter and search bar integrated
- Auto news feed component

---

## ⚡ Performance Optimizations

| Optimization | Detail |
|---|---|
| **Fact-check DB caching** | First check ~5s, every repeat **< 1 second** |
| **DB-first trending lookup** | Checks existing articles before calling AI |
| **Fastest AI model priority** | `gemini-2.0-flash-lite` first, fallback to heavier models |
| **4-model fallback chain** | `2.0-flash-lite` → `2.0-flash` → `2.5-flash-lite` → `2.5-flash` |
| **Shorter prompts** | Fact-check prompt cut from ~500 words to ~100 words |
| **Reduced token limits** | Fact-check: 2,048 tokens · Search: 4,096 tokens |
| **Single article generation** | Search generates 1 article (was 3) for 3× faster response |
| **Vercel region `iad1`** | Deployed in US East, same region as Neon DB |
| **Trending API cached 5 min** | `revalidate = 300` on trending endpoint |
| **Homepage ISR 60s** | Fresh content without full rebuilds |
| **Prisma singleton pattern** | Prevents connection pool exhaustion in serverless |

---

## 📂 Project Structure

```
├── prisma/
│   ├── schema.prisma              # Database schema (PostgreSQL)
│   ├── seed.js                    # Seeds 100 topics, 3 articles, admin user
│   └── migrations/                # Migration history
├── src/
│   ├── app/
│   │   ├── page.tsx               # Homepage (ISR)
│   │   ├── layout.tsx             # Root layout with dark theme
│   │   ├── globals.css            # TailwindCSS styles
│   │   ├── admin/page.tsx         # Admin panel
│   │   ├── login/page.tsx         # Login page
│   │   ├── trending/page.tsx      # Trending topics page
│   │   ├── article/[id]/page.tsx  # Article detail (SSR)
│   │   └── api/
│   │       ├── articles/route.ts       # CRUD articles + DB search
│   │       ├── search/route.ts         # Search + AI generation
│   │       ├── trending/route.ts       # Trending topics + AI refresh
│   │       ├── fact-check/route.ts     # AI fact-checking + caching
│   │       ├── auto-generate/route.ts  # Bulk article generation
│   │       ├── news/route.ts           # News feed
│   │       └── auth/
│   │           ├── [...nextauth]/route.ts  # NextAuth handler
│   │           └── register/route.ts       # User registration
│   ├── components/
│   │   ├── AuthProvider.tsx       # NextAuth session provider
│   │   ├── AutoNewsFeed.tsx       # Auto-refreshing news feed
│   │   ├── FactCheckButton.tsx    # AI fact-check UI component
│   │   ├── NewsCard.tsx           # Article card component
│   │   └── SearchBar.tsx          # Search bar component
│   ├── lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   └── prisma.ts              # Prisma client singleton
│   └── types/
│       └── next-auth.d.ts         # NextAuth type extensions
├── vercel.json                    # Vercel deployment config
├── DEPLOY.md                      # Step-by-step deployment guide
├── .env.example                   # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- A [Neon](https://neon.tech) PostgreSQL database (free)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free)

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/Sky007-stack/Unbiased_hindustani.git
cd Unbiased_hindustani

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Neon connection string and Gemini API key

# 4. Push schema to database
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. Seed the database
node prisma/seed.js

# 7. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `DIRECT_URL` | Neon PostgreSQL direct connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_AI_API_KEY` | Same as `GEMINI_API_KEY` (alias) |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` for dev) |

---

## 🌐 Deployment

Deployed on **Vercel** with **Neon PostgreSQL**. Every `git push` to `master` triggers an automatic redeploy.

See [DEPLOY.md](DEPLOY.md) for the full step-by-step deployment guide.

### Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Vercel** | 100 GB bandwidth/month, unlimited deploys |
| **Neon** | 0.5 GB storage, 190 compute hours/month |
| **Gemini API** | ~1,500 requests/day (resets at midnight PT) |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/articles` | GET | Fetch articles (`?q=`, `?category=`, `?limit=`, `?page=`) |
| `/api/search` | GET | Search + AI article generation (`?q=query`) |
| `/api/trending` | GET | Fetch trending topics (`?category=`) |
| `/api/trending` | POST | Refresh trending topics with AI |
| `/api/fact-check` | POST | AI fact-check an article (`{ articleId }`) |
| `/api/auto-generate` | POST | Bulk generate articles from trending topics |
| `/api/news` | GET | News feed |
| `/api/auth/[...nextauth]` | * | NextAuth.js authentication handler |
| `/api/auth/register` | POST | Register new user (`{ email, password, name }`) |

---

## 🐛 Bug Fixes Applied

| Bug | Fix |
|-----|-----|
| Fake YouTube embeds (Rick Astley) | Removed hardcoded URLs, `youtubeUrl` made optional |
| Shallow article content (~100 words) | Prompt updated for 300–500 word minimum |
| Duplicate trending topics | Deduplication logic added |
| `.env.local` had quotes around API keys | Removed single quotes, fixed stray `import http` line |
| Trending click redirected to homepage | Shows error banner instead; DB-first lookup added |
| Fact-check API error (404/429) | Fixed model names, added 4-model fallback chain |
| Vercel "vulnerable Next.js" error | Updated from 15.5.6 → 16.1.6 |
| `vercel.json` catch-all rewrite breaking APIs | Removed rewrite, kept only framework config |
| SQLite incompatible with serverless | Migrated to PostgreSQL (Neon) |
| Prisma EPERM on Windows | Kill node processes before `prisma generate` |
| 2-minute latency on Vercel | Region alignment, caching, shorter prompts, fastest models |

---

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ by Unbiased Hindustani Media**

**Version:** 2.0.0 | **Last Updated:** February 7, 2026
