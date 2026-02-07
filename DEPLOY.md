# Deploying Unbiased Hindustani to Production

Deploy your AI news platform to the internet for **free** using **Vercel** (hosting) + **Neon** (PostgreSQL database).

---

## Architecture

```
User → Vercel (Next.js app) → Neon PostgreSQL (database)
                             → Google Gemini API (AI content)
```

---

## Step 1: Create a Free Neon PostgreSQL Database

1. Go to **[https://neon.tech](https://neon.tech)** and sign up (free)
2. Click **"New Project"**
3. Name it `unbiased-hindustani`, pick the closest region, and click **Create Project**
4. You'll see a connection string like:
   ```
   postgresql://neondb_owner:abc123@ep-cool-frost-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Copy this connection string** — you'll need it in Step 3

---

## Step 2: Push Code to GitHub

Open a terminal in the project folder and run:

```powershell
git add -A
git commit -m "Prepare for production deployment"
git push origin master
```

Your code is already on GitHub at:
**https://github.com/Shivams210/Unbiased_hindustani**

---

## Step 3: Deploy to Vercel

1. Go to **[https://vercel.com](https://vercel.com)** and sign up with your **GitHub account**
2. Click **"Add New Project"**
3. Import your repository: `Shivams210/Unbiased_hindustani`
4. **Configure Environment Variables** — click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgresql://neondb_owner:abc123@ep-xxx.neon.tech/neondb?sslmode=require` (your Neon connection string) |
   | `DIRECT_URL` | Same as DATABASE_URL |
   | `GEMINI_API_KEY` | Your Google Gemini API key |
   | `GOOGLE_AI_API_KEY` | Same as GEMINI_API_KEY |
   | `NEXTAUTH_SECRET` | Any random string (e.g., run `openssl rand -base64 32`) |
   | `NEXTAUTH_URL` | Leave blank for now — update after first deploy |

5. Click **"Deploy"** — Vercel will build and deploy automatically

---

## Step 4: Initialize the Production Database

After Vercel deploys successfully, push the schema to Neon:

```powershell
# In your project folder, set the production DATABASE_URL temporarily
$env:DATABASE_URL = "postgresql://neondb_owner:abc123@ep-xxx.neon.tech/neondb?sslmode=require"
$env:DIRECT_URL = $env:DATABASE_URL

# Push schema to Neon
npx prisma db push

# Seed the database with initial data
node prisma/seed.js
```

---

## Step 5: Update NEXTAUTH_URL

1. After deploy, Vercel gives you a URL like `https://unbiased-hindustani.vercel.app`
2. Go to **Vercel Dashboard → Project → Settings → Environment Variables**
3. Set `NEXTAUTH_URL` = `https://unbiased-hindustani.vercel.app`
4. Click **Redeploy** (Deployments tab → ⋯ → Redeploy)

---

## Step 6: Visit Your Live Site!

Open your Vercel URL in any browser. Share it with anyone — it's live on the internet.

---

## Important Notes

### Free Tier Limits (all generous)
| Service | Free Tier |
|---------|-----------|
| **Vercel** | 100 GB bandwidth/month, unlimited deploys |
| **Neon** | 0.5 GB storage, 190 compute hours/month |
| **Gemini API** | ~1,500 requests/day (resets at midnight PT) |

### Custom Domain (Optional)
1. Buy a domain (e.g., `unbiasedhindustani.com` from Namecheap/GoDaddy)
2. In Vercel: **Settings → Domains → Add Domain**
3. Point your domain's DNS to Vercel (they guide you through it)
4. Update `NEXTAUTH_URL` to your custom domain

### Auto-Deploy
Every time you `git push` to `master`, Vercel automatically redeploys. No manual steps needed.

### Local Development After This Change
For local development, create/update your `.env.local`:
```
GEMINI_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key
DATABASE_URL=postgresql://neondb_owner:abc123@ep-xxx.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:abc123@ep-xxx.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=unbiased-hindustani-super-secret-key
NEXTAUTH_URL=http://localhost:3000
```
Or if you want to keep using SQLite locally, change `schema.prisma` back to `provider = "sqlite"` and use `DATABASE_URL="file:./dev.db"`.

---

## Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Vercel | Check Vercel build logs. Usually a missing env var. |
| "PrismaClientInitializationError" | `DATABASE_URL` is wrong or Neon DB is paused (wake it by visiting Neon dashboard) |
| Login doesn't work | Set `NEXTAUTH_URL` to your exact Vercel domain |
| AI features return errors | Check Gemini free tier quota — resets daily at midnight PT |
| Neon DB is slow first request | Free tier auto-pauses after 5 min inactivity. First request wakes it (~1-2s). |
