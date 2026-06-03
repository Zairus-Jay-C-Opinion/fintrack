# FinTrack

Personal finance dashboard (React + Vite). Track spending, savings, goals, and investments.

## Local development

```powershell
cd "c:\Users\Zairus Jay Opinion\Documents\FINANCIAL 2"
npm install
copy .env.example .env
```

1. Open `.env` and set `FINNHUB_API_KEY` from [finnhub.io/register](https://finnhub.io/register) (free).
2. Run `npm run dev` and open http://localhost:5173

**Security:** Never commit `.env`. If a key was ever pasted into source code, rotate it on Finnhub and use only `.env` / Vercel env vars.

## Publish (free URL on Vercel)

1. Push this folder to a **GitHub** repository (private is fine).
2. Sign in at [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Framework preset: **Vite** (defaults are fine).
4. **Environment variables** → add:
   - Name: `FINNHUB_API_KEY`
   - Value: your Finnhub API key
5. Deploy. Vercel gives you a URL like `https://fintrack-xyz.vercel.app`.

Optional: connect a custom domain under Project → Settings → Domains.

### CLI deploy (alternative)

```powershell
npm i -g vercel
vercel login
vercel
```

When prompted, link the project and add `FINNHUB_API_KEY` in the Vercel dashboard for production.

## How market data works

| Data | Source |
|------|--------|
| Live price (Refresh live) | Finnhub quote API (free tier) via `/api/quote` |
| Price chart (~90 days) | Yahoo Finance via `/api/stock-chart` |

Finnhub’s **free plan does not include** historical candle data (that’s why VOO showed “history request failed”). Charts use Yahoo on the server so your key stays private and charts work on the free tier.

## Mobile

The app uses a bottom tab bar on small screens, safe-area padding for notched phones, and touch-friendly controls. Add to Home Screen on iOS/Android for an app-like experience.
