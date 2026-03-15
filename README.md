# Finio — Production Budget Tracker

**Stack:** React 18 · Vite 5 · TypeScript · Supabase · Tailwind CSS · PWA

**Free hosting:** Vercel (frontend) + Supabase (backend/auth/db)

---

## Project Structure

```
finio/
├── src/
│   ├── types/index.ts          # All TypeScript interfaces
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client (reads from .env)
│   │   └── constants.ts        # Categories, defaults
│   ├── utils/index.ts          # fmt(), calcPredictions(), exportToCSV()
│   ├── context/
│   │   ├── AuthContext.tsx     # Google OAuth, email auth, profile
│   │   ├── ThemeContext.tsx    # Dark/light toggle
│   │   └── ToastContext.tsx    # Global toasts
│   ├── hooks/
│   │   └── useTransactions.ts  # All Supabase CRUD + realtime sync
│   ├── components/
│   │   ├── ui/index.tsx        # Button, Input, Card, Modal, Badge, Toggle
│   │   ├── charts/index.tsx    # BarChart, DonutChart, ForecastChart
│   │   └── layout/             # AppLayout, Sidebar, Topbar, AddTransactionModal
│   └── pages/
│       ├── auth/               # Login, Signup, ResetPassword
│       ├── dashboard/          # Dashboard with hero cards + AI snapshot
│       ├── transactions/       # Table with search, filter, CSV export
│       ├── analytics/          # 30-day trend, donut, category breakdown
│       ├── budgets/            # Per-category budget progress
│       ├── predictions/        # AI forecast engine + insights
│       ├── controls/           # Spend limits, no-spend mode, alerts
│       └── profile/            # Edit profile, stats, export, danger zone
├── supabase/
│   └── schema.sql              # Run once in Supabase SQL Editor
├── .env.example                # Copy to .env and add your keys
├── vercel.json                 # Vercel SPA routing + security headers
└── netlify.toml                # Netlify build config + redirects
```

---

## 1. Set up Supabase (5 min)

1. Go to **https://supabase.com** → sign up free → **New Project**
2. Name: `finio` · Region: closest to Pakistan (Singapore) · Create
3. Wait ~2 min for the project to boot
4. Go to **SQL Editor → New Query**
5. Paste the entire contents of `supabase/schema.sql` → **Run**
6. Go to **Settings → API** and copy:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public key** → `eyJ...`

### Enable Google OAuth (optional)

1. Go to **Authentication → Providers → Google → Enable**
2. You need a Google Cloud project:
   - Go to https://console.cloud.google.com
   - Create project → Enable "Google+ API"
   - Credentials → OAuth 2.0 Client → Web app
   - Add redirect URI: `https://xxxx.supabase.co/auth/v1/callback`
   - Copy Client ID + Secret into Supabase

### Disable email confirmation (for faster testing)

Go to **Authentication → Settings → Disable "Enable email confirmations"**
Re-enable before going public.

---

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Never commit `.env` to Git. It's already in `.gitignore`.

---

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## 4. Deploy to Vercel (free, 2 min)

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
# Follow prompts — framework: Vite, root: ./
```

Then add env vars in Vercel dashboard → Project Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option B — GitHub + Vercel (recommended, auto-deploys)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/finio.git
git push -u origin main
```

Then:
1. Go to **vercel.com** → Import Project → Select your repo
2. Framework: **Vite** (auto-detected)
3. Add env vars (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
4. Deploy → live URL in ~60 seconds

Every `git push` auto-deploys. Zero manual work.

---

## 5. Deploy to Netlify (alternative)

```bash
npm run build
```

Then drag the `dist/` folder to **netlify.com/drop**

Or connect via GitHub same as Vercel above. The `netlify.toml` handles all config.

---

## Add Supabase redirect URL

After deploying, go to **Supabase → Authentication → URL Configuration** and add:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

This is required for email confirmation and OAuth redirects to work in production.

---

## PWA Install

On mobile (Chrome/Safari), users will see an "Add to Home Screen" prompt automatically. The PWA is configured in `vite.config.ts` with:
- Offline caching for assets and fonts
- App manifest with name, icon, theme color
- Standalone display mode (no browser chrome)

---

## Supabase Free Tier Limits

| Resource        | Free Limit        |
|-----------------|-------------------|
| Database        | 500 MB            |
| Auth users      | 50,000            |
| API calls       | Unlimited         |
| Bandwidth       | 5 GB/month        |
| Realtime        | 200 concurrent    |
| Edge functions  | 500K invocations  |

More than enough for a personal finance app indefinitely.

---

## Customising Categories & Budgets

Edit `src/lib/constants.ts`:

```ts
export const CATEGORIES = {
  // Add your own:
  Travel: { icon: '✈️', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', label: 'Travel' },
}

export const DEFAULT_CAT_LIMITS = {
  Food: 15000,
  // Adjust to your monthly spending
}
```

---

## Tech Stack Summary

| Layer        | Technology                  | Cost  |
|--------------|-----------------------------|-------|
| Frontend     | React + Vite + TypeScript   | Free  |
| Styling      | Tailwind CSS                | Free  |
| Auth         | Supabase Auth (email+Google)| Free  |
| Database     | Supabase PostgreSQL         | Free  |
| Realtime     | Supabase Realtime           | Free  |
| Hosting      | Vercel                      | Free  |
| Domain       | Vercel subdomain            | Free  |
| SSL          | Automatic                   | Free  |
| **Total**    |                             | **₨0**|
