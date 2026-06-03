# FinTrack

Personal finance dashboard (React + Vite).

**Your code is on GitHub:** https://github.com/Zairus-Jay-C-Opinion/fintrack

You only need **Vercel** for a live URL and your Finnhub key. Local `.env` is optional (already set up on your PC if you run `npm run dev`).

---

## What is `.env.example`? (in the repo, no secrets)

| File | In GitHub? | Contains your API key? |
|------|------------|-------------------------|
| **`.env.example`** | Yes | **No** — empty template, documents the variable name |
| **`.env`** | **No** (gitignored) | Yes — only on your computer |

`.env.example` is a **placeholder** so anyone cloning the repo knows they need `FINNHUB_API_KEY`. It is **not** your real environment file. Your real key lives in **Vercel** (production) and in **`.env`** locally (already created for you; never pushed).

You can ignore `.env.example` if you only use Vercel.

---

## Vercel setup (step by step)

### Before you start

- GitHub repo: **Zairus-Jay-C-Opinion/fintrack** (already pushed)
- Finnhub API key from https://finnhub.io/register (free) — use the same key you used before, or generate a new one

### Step 1 — Sign in to Vercel

1. Open https://vercel.com
2. Click **Sign Up** or **Log In**
3. Choose **Continue with GitHub**
4. Approve access when GitHub asks

### Step 2 — Import the project

1. On the Vercel dashboard, click **Add New…** → **Project**
2. Under **Import Git Repository**, find **fintrack** (org: **Zairus-Jay-C-Opinion**)
3. If you do not see it, click **Adjust GitHub App Permissions** and allow access to the **fintrack** repo (or all repos)
4. Click **Import** next to **fintrack**

### Step 3 — Configure the build (usually auto-detected)

On the **Configure Project** screen, confirm:

| Setting | Value |
|---------|--------|
| Framework Preset | **Vite** |
| Root Directory | `./` (leave default) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Do **not** deploy yet.

### Step 4 — Add your Finnhub key (required)

1. Expand **Environment Variables**
2. Add one variable:
   - **Key (name):** `FINNHUB_API_KEY`
   - **Value:** paste your Finnhub API key (no quotes)
   - **Environments:** check **Production**, **Preview**, and **Development**
3. Click **Add** (or the plus) to save the variable

Important:

- Use exactly `FINNHUB_API_KEY` (not `VITE_FINNHUB_API_KEY`)
- This stays on Vercel’s servers — it is **not** stored in GitHub

### Step 5 — Deploy

1. Click **Deploy**
2. Wait 1–3 minutes for the build to finish
3. When it shows **Congratulations**, click **Visit** (or open the URL shown, e.g. `https://fintrack-xxxxx.vercel.app`)

### Step 6 — Test on your phone

1. Open the Vercel URL in Safari or Chrome on your phone
2. Go to **Investments** → **Refresh live**
3. VOO (or your symbols) should update price and chart

Optional: **Share** → **Add to Home Screen** for an app-like icon.

### Step 7 — After you change code on GitHub

Every push to **master** on GitHub can auto-redeploy:

1. Vercel project → **Settings** → **Git**
2. Ensure **Production Branch** is `master`
3. Push changes from your PC; Vercel rebuilds automatically

If live prices break after deploy, check **Settings** → **Environment Variables** → `FINNHUB_API_KEY` is still set.

---

## Optional: run on your PC only

```powershell
cd "c:\Users\Zairus Jay Opinion\Documents\FINANCIAL 2"
npm install
npm run dev
```

Uses `.env` on your machine (not in Git). You do not need to touch `.env.example` for Vercel.

---

## How market data works

| Data | Source |
|------|--------|
| Live price | Finnhub via `/api/quote` (needs `FINNHUB_API_KEY` on Vercel) |
| Price chart | Yahoo Finance via `/api/stock-chart` (no key) |
