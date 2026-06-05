# FinTrack

A personal finance dashboard for tracking income allocation, expenses, savings, goals, and investments. Built as a single-page React app with client-side storage—no user accounts or central database.

## Overview

FinTrack helps you see net worth and cash flow in one place, with a focus on **PHP** for day-to-day money and **USD** for brokerage holdings. Income is split into three buckets—**investments**, **savings**, and **spending**—using configurable percentages that must total 100%.

Data lives in the browser (`localStorage` via Zustand persist). Charts and summaries update from the data you enter; investment prices and history can be refreshed from external APIs when deployed with the required server environment.

The UI is responsive: a sidebar on desktop and a bottom navigation bar on mobile (including a **More** hub for Forecasting, Analytics, and Settings).

---

## Features by section

### Dashboard
- **Net worth** breakdown: cash on hand, savings balance, investments (converted to PHP).
- **Allocation** card showing target vs. implied amounts from monthly income.
- **Next payday** countdown from configured paydays.
- **Monthly spending** bar chart from expense transactions.
- **Portfolio growth** chart from investment purchase history.

### Expenses
- Log transactions with date, category, amount, and optional notes.
- Month filter and totals for the selected period.

### Savings
- Savings ledger with running balance and interest rate.
- Emergency fund and cash-on-hand fields.
- Savings-over-time chart.

### Goals
- Savings goals with target amount, optional deadline, and progress.
- Contribution tracking toward each goal.

### Investments
- Holdings built from purchase log (ticker, shares, price, fees, date).
- Portfolio stats: total invested, current value, unrealized P/L, monthly DCA estimate.
- **Refresh live** for quotes and ~90-day price history charts.
- Per-ticker chart tabs when multiple symbols are held.
- Holdings allocation donut and editable manual prices.
- PHP/USD rate display with optional live FX refresh.

### Forecasting
- Long-horizon projection charts (1–30 years) with adjustable contribution and return assumptions.
- Goal time-to-target and scenario comparisons.

### Analytics
- Financial health score, savings rate, allocation snapshot, and trend charts derived from stored data.

### Settings
- **Allocation** sliders (investments / savings / spending).
- Monthly income and one or two monthly paydays.
- PHP/USD rate and currency display toggles.
- Browser notifications (payday reminders, optional market-related alerts).
- Optional automatic stock price refresh interval.
- **Export / import** full app data as JSON.
- Reset finance or settings data.

---

## Market data

| Data | Source | Notes |
|------|--------|--------|
| Live stock quote | Finnhub | Proxied through `/api/quote` on the host; requires `FINNHUB_API_KEY` in server environment |
| Price history chart | Yahoo Finance | Proxied through `/api/stock-chart`; no API key |
| FX (PHP/USD) | External rate endpoint used by the exchange-rate hook | Fetched on demand from the client |

Chart history and last refresh time are stored in the finance store and persist across navigation and reloads. Manual **Refresh live** on Investments is the primary way to load or update charts; automatic refresh is optional in Settings.

If live quotes fail (missing key, rate limits, or network issues), the app may fall back to the latest closing price from chart data when available.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19, React Router 7 |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 with `persist` middleware |
| Charts | Recharts 3 |
| Motion | Framer Motion |
| Icons | Lucide React |
| Dates | date-fns |
| Serverless API | Vercel-style functions in `/api` (`quote.js`, `stock-chart.js`) |

Local development can proxy `/api/*` through Vite middleware (`vite.config.js` + `server/marketApi.js`).

---

## Data & privacy

- All finance and settings records are stored **only in the browser** under `fintrack-data` and `fintrack-settings`.
- Export produces a JSON file you control; import merges into the current device.
- API keys for Finnhub must **not** be committed to the repository. Use environment variables on the deployment host and optionally a local `.env` file (gitignored) for development.
- The app does not implement authentication; anyone with access to the device/browser profile can see stored data.

---

## Project structure

```
api/                 Serverless quote + chart endpoints
server/              Shared market API logic for dev proxy
src/
  components/        UI, charts, forms, layout
  contexts/          App-wide providers (e.g. market chart)
  hooks/             Data fetching, projections, notifications
  pages/             Route-level screens
  store/             Zustand finance + settings stores
  utils/             Currency, finance math, formatters
public/              Static assets and PWA icons
```

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `FINNHUB_API_KEY` | Server only (host env or local `.env`) | Authenticates live quote requests |

`.env.example` documents the variable name for local setup. Client bundles do not embed this key.

---

## Scripts

```bash
npm install    # Install dependencies
npm run dev    # Development server with hot reload
npm run build  # Production build to dist/
npm run preview # Serve production build locally
npm run lint   # ESLint
```

For local dev with live quotes, set `FINNHUB_API_KEY` in `.env` (see `.env.example`).

---

## Deployment notes

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **SPA routing:** non-API routes should rewrite to `index.html` (see `vercel.json`).
- Set `FINNHUB_API_KEY` in the hosting platform’s environment for Production (and Preview if you test branches there).

---

## Browser support

Works in modern Chromium-based browsers (Chrome, Edge, Opera GX), Firefox, and Safari. Some features (notifications, `localStorage` quotas) depend on browser permissions and storage policies. After deployments, a normal navigation or cache clear may be needed if an older cached bundle is still served.
