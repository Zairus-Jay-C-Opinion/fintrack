# FinTrack

A personal finance dashboard for tracking expenses, savings, investments, and long-term wealth — built for the Philippine peso with live USD market data.

**Live app:** https://fintrack-one-sigma.vercel.app

---

## Overview

FinTrack helps you see net worth and cash flow in one place, with a focus on **PHP** for day-to-day money and **USD** for brokerage holdings. Income is split into three buckets—**investments**, **savings**, and **spending**—using configurable percentages that must total 100%.

Data lives in the browser (`localStorage` via Zustand persist). Charts and summaries update from the data you enter; investment prices and history can be refreshed from external APIs when deployed with the required server environment.

The UI is responsive: a sidebar on desktop and a bottom navigation bar on mobile.

---

## Pages & Features

### Dashboard
Your complete financial picture at a glance. Shows total net worth broken down into cash, savings, and investments (all in PHP). Displays your monthly income, a payday countdown with a recommended allocation action for that day, a monthly spending bar chart, and a portfolio growth curve built from your investment history.
- **AI Financial Advisor:** Ask for tailored advice based on your current financial context using the Gemini API.

### Expenses
Tracks your day-to-day spending against your monthly spending allowance. Log purchases with a date, item name, and category. A visual budget bar shows how much of your allowance is left.

### Savings
Tracks your bank savings balance through deposits and withdrawals. Shows your monthly savings target, your emergency fund amount, and a selected bank. Includes an interest projection chart.

### Goals
Create savings goals with a target amount and deadline. Each goal shows a progress bar and how much is still needed. The **Fund goals** feature distributes money across all goals simultaneously.

### Investments
Tracks your stock and ETF portfolio. The holdings table shows average cost, current price, current value, and unrealized gain/loss. Live prices and ~90-day price history charts are fetched from market data. A portfolio mix donut chart shows allocation.

### Forecasting
Projects long-term investment growth using Dollar-Cost Averaging (DCA) and compound interest. A goal calculator shows how many years it will take to reach a target amount.

### Analytics
Tracks financial health trends over time. Shows a financial health score, your target vs. actual savings and investment rates, and a net worth progression area chart.

### Settings
Central configuration for the entire app. Set your monthly income, payday schedule, and PHP/USD exchange rate. The allocation editor lets you adjust the percentage split. Export or import full app data as JSON.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19, React Router 7 |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 with `persist` middleware |
| Charts | Recharts 3 |
| Serverless API | Vercel functions |

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `FINNHUB_API_KEY` | Server only (host env or local `.env`) | Authenticates live quote requests |
| `VITE_GEMINI_API_KEY` | Vite client (`.env` or Vercel env) | Powers the AI Financial Advisor |

`.env.example` documents the variable names for local setup. Client bundles do embed VITE_ variables, so keep them secure in production settings.

---

## Scripts

```bash
npm install    # Install dependencies
npm run dev    # Development server with hot reload
npm run build  # Production build to dist/
npm run preview # Serve production build locally
```
