# FinTrack — Full Architecture & Feature Specification

*Prepared as a design-handoff document for a UI rework. Every fact below is drawn directly from the current codebase — nothing here is speculative.*

---

## 1. App Overview

FinTrack is a personal finance dashboard for a single user (currently configured for one person in the Philippines) to track net worth, budget by percentage-based income allocation, log expenses, grow savings, invest in US-listed stocks/ETFs, set savings goals, and forecast long-term wealth growth. It converts between PHP (Philippine Peso, the user's home currency) and USD (the currency investments are priced in).

**Who it's built for:** An individual managing their own money — not a multi-user or team product. There is no login system; all data lives in the browser (or the Capacitor-wrapped mobile app) on one device.

**Core value proposition:** Take one monthly income number, split it by percentage into Investments / Savings / Spending, and give the user one dashboard that shows whether their real spending, saving, and investing behavior matches that target — plus tools (forecasting, AI advice, live stock prices) to help them act on it.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.2.6 |
| Build tool | Vite | 8.0.12 (`@vitejs/plugin-react` 6.0.1) |
| Routing | react-router-dom | 7.16.0 |
| Styling | Tailwind CSS | 3.4.19 (+ autoprefixer 10.5.0, postcss 8.5.15) |
| State management | Zustand | 5.0.14 (with `persist` middleware → localStorage) |
| Charting | Recharts | 3.8.1 |
| Animation | Framer Motion | 12.40.0 |
| Icons | lucide-react | 1.17.0 |
| Dates | date-fns | 4.4.0 |
| Mobile shell | Capacitor (android + ios + core) | 8.4.0 |
| PWA | vite-plugin-pwa | 1.3.0 |
| AI (advisor + receipt OCR) | Google Gemini 2.5 Flash (`generativelanguage.googleapis.com`), called directly from the client | — |
| Stock quotes | Finnhub (via serverless proxy) | free tier |
| Stock chart history | Yahoo Finance `query1.finance.yahoo.com` (via serverless proxy, no key required) | — |
| FX rate | `api.exchangerate-api.com` (called directly from client) | free tier |
| Deployment | Vercel (static + serverless functions), `vercel.json` rewrites all non-`/api` paths to `index.html` | — |
| Auth / database | **None.** No backend database, no user accounts. All data is client-side, in `localStorage`. | — |

There is no TypeScript — the codebase is plain JS/JSX throughout.

---

## 3. Routing & Pages

Defined in `src/App.jsx`. All routes render inside a persistent shell (`Sidebar` on desktop, `MobileNav` on mobile) wrapped by `MarketChartProvider` and `WalkthroughProvider`. **Every route is public** — there is no authentication, so "who can access it" is simply "anyone who opens the app on that device."

| Path | Component | Purpose |
|---|---|---|
| `/` | `Dashboard` | Home screen — net worth, income/allocation summary, AI advisor, key charts, next payday |
| `/expenses` | `Expenses` | Log and review day-to-day spending against the "spending" budget bucket |
| `/savings` | `Savings` | Track bank savings balance, deposits/withdrawals, interest projections |
| `/goals` | `Goals` | Create savings goals and fund them from savings balance and/or leftover spending budget |
| `/investments` | `Investments` | Log stock/ETF purchases, view holdings, live prices, price history charts |
| `/forecasting` | `Forecasting` | Long-horizon compound-growth projections, scenario comparisons, FX sensitivity |
| `/analytics` | `Analytics` | Financial health score, savings/investment rate trends, net worth history |
| `/settings` | `Settings` | Income, paydays, allocation, currency rate, notifications, live-price refresh, data export/import/reset, tour restart |
| `/more` | `More` | Mobile-only hub page — links to Forecasting, Analytics, Settings (these three don't fit in the 6-item mobile bottom nav) |

**Navigation structure:**
- Desktop: full `Sidebar` (`src/components/layout/Sidebar.jsx`) with all 8 primary items always visible.
- Mobile: bottom tab bar `MobileNav` (`src/components/layout/MobileNav.jsx`) with only 6 items — Home, Spend, Save, Goals, Invest, More — because there isn't room for Forecasting/Analytics/Settings, which are tucked under "More."

---

## 4. Authentication Flow

**There is no authentication.** FinTrack has no login, no signup, no user accounts, no session concept, and no protected-route logic. Every page is reachable directly. All "personal" data (income, transactions, holdings, etc.) is simply whatever is stored in that browser's `localStorage` under two keys (`fintrack-data`, `fintrack-settings` — see Section 6). Anyone with access to the device/browser has full access to the data. Export/Import JSON (Settings page) is the only mechanism for moving data between devices or backing it up.

---

## 5. Feature Inventory

### Dashboard (`/`)
- **Net worth summary card** — large number (cash + savings + investments in PHP) with a 3-item breakdown (Cash / Savings / Investments). Data: `useNetWorth()` hook. UI: `NetWorthCard`, an elevated hero card with animated number.
- **Stat card grid (4 cards)** — Total Net Worth, This Month's Income (+ payday label), Savings Balance, Investment Value (PHP equivalent). UI: `StatCard` × 4 in a responsive grid.
- **AI Financial Advisor** — free-text prompt box; sends the user's net worth/cash/savings/investments/income/allocation as context to Gemini 2.5 Flash and renders a markdown-ish formatted response. Persists prompt/response in `sessionStorage` (not saved permanently). UI: `AIFinancialAdvisorCard`, a full-width card with textarea + Ask/Clear buttons.
- **Monthly allocation breakdown** — donut chart (Investments/Savings/Spending %) plus a list with percentage and PHP amount per bucket. Data: `useSettingsStore` allocation + `useNetWorth` amounts. UI: `AllocationCard` (wraps `AllocationDonut`).
- **Income vs Expenses bar chart** — 6-month rolling bar chart, income (flat line per month) vs actual expenses (falls back to 13% of income estimate if no data logged). UI: `MonthlyBarChart`.
- **Portfolio growth line chart** — cumulative PHP invested over time, built from sorted investment purchase records. UI: `PortfolioGrowthChart`. Shows an empty state if no purchases exist.
- **Next Payday card** — countdown in days to the next configured payday, with a "recommended action" box telling the user how much to send to investments vs. savings on that date. Data: `getNextPayday`/`daysUntil` from `utils/finance.js`.
- **Collapsible page help** — every page has a `PageHelp` accordion explaining how the page's numbers are computed.

### Expenses (`/expenses`)
- **Spending budget bar** — visual progress bar of purchases logged this month vs. the "spending" allocation bucket, turns red/over-budget styled when exceeded, with a warning banner.
- **4-stat grid** — Spent this month, Spending budget, Savings target (monthly, informational only), Left to spend.
- **Purchase log table** — date, item, category, amount, edit/delete actions. Filtered to current month, sorted newest-first.
- **By-category breakdown list** — current month expenses grouped and summed by category, sorted descending.
- **Log purchase / Edit expense modal** — form (`AddExpenseForm`): date, item name, category dropdown (10 fixed categories), amount, optional note.
- **AI receipt scanning (camera)** — "Scan" button triggers a confirm dialog, opens the device camera (`capture="environment"`), sends the photo to Gemini Vision (`utils/geminiVision.js` → `analyzeReceipt`), which extracts item/amount/date/category as JSON, then pre-fills the Log-purchase modal for the user to confirm/edit before saving.
- **AI receipt scanning (upload)** — "Upload" button opens a normal file picker (no camera) for the same Gemini Vision extraction flow, for receipts already saved as photos.
- **Delete/Edit expense** — inline pencil/trash icons per row, with a native `confirm()` before delete.

### Savings (`/savings`)
- **Bank selector** — dropdown of Philippine bank names (`PH_BANKS` constant) + a free-text field if "Other" is chosen. Feeds the page subtitle and stat card label everywhere (`useBankName` hook).
- **3-stat grid** — {Bank} balance, Monthly savings target (% of income), Emergency fund.
- **Deposit/Withdrawal quick-entry** — amount + optional note, two buttons (Deposit / Withdrawal) that post directly without opening a modal; balance is auto-recalculated (not manually entered).
- **Emergency fund editor** — separate numeric field + "Update" button, stored independently from the running savings balance.
- **Interest projection panel** — annual interest rate input, checkbox to include the monthly savings target as a recurring contribution, horizon tabs (6mo/1yr/2yr/5yr), area chart of projected balance, and a one-line formula explanation.
- **History table** — full deposit/withdrawal ledger: date, type, amount (color-coded +/-), running balance after, note, edit/delete. Balances are recalculated across the whole ledger whenever any entry changes (`recalculateSavingsEntries` — entries are sorted oldest→newest to compute a running total, then reversed back to newest-first for display).
- **Log/Edit entry modal** — full form version of the deposit/withdrawal action (date, type dropdown, amount, note) used for history edits and the "Log entry" button.

### Goals (`/goals`)
- **3-stat grid** — Goals (count), Total saved, Combined targets.
- **Goal cards grid** — per-goal progress bar, name, target date, current/target amounts, % complete, "Remove" and "Update saved amount" actions. UI: `GoalCard`.
- **Add goal modal** — name, target amount, already-saved amount, target date.
- **Fund goals modal** — the most complex interaction on this page: user chooses to pull money from (a) savings balance (capped, optional partial amount, optional checkbox to record it as a savings withdrawal) and/or (b) unspent monthly spending budget (computed as spending allocation minus this month's logged expenses). The pooled total is split **equally** across all goals, capped per-goal at its target, with a live preview (total to distribute / per-goal amount / actually-applied amount after caps) before the user confirms.
- **Update progress modal** — manually overwrite a single goal's `current` saved amount.

### Investments (`/investments`)
- **4-stat grid** — Total Invested (USD), Current Value (USD + PHP sub-line), Unrealized P/L (USD, colored, % trend), Monthly DCA (PHP, from allocation).
- **Holdings table** — aggregated by ticker: symbol, asset type (hidden on mobile), shares, avg cost, current price, current value (USD + PHP), gain ($ and %), edit action. Empty state when no purchases.
- **DCA Tracker card** — days until next payday + recommended PHP contribution amount.
- **Current prices panel** — per-ticker manual price input + "Set" button, plus a "Refresh live" button that calls the Finnhub proxy for all tickers. Shows warnings for (a) tickers where the live quote failed but a chart-derived fallback price was used, and (b) tickers where both failed, including a specific hint about fixing `FINNHUB_API_KEY` on Vercel.
- **Price history chart** — per-ticker daily closing price line chart (green/red segments for up/down days) for ~90 days, ticker-switch tabs when multiple holdings exist, powered by the Yahoo Finance proxy. Shows "Tap Refresh live to load chart data" until first fetch.
- **Portfolio mix donut chart** — current USD value by ticker.
- **Purchase history table** — every individual purchase lot: date, symbol, type, shares, total USD, note, edit/delete.
- **Add/Edit purchase modal** — date, asset type dropdown (Stock/ETF/Mutual fund/REIT/Other), ticker (auto-uppercased), shares, price per share USD, live-computed total (USD + PHP), one-time fee (USD), note.
- **Edit Holding modal** — a secondary modal reached from the holdings table's pencil icon; lets the user quickly update a ticker's current price, and lists/edits/deletes every individual purchase lot for that ticker without leaving the modal.

### Forecasting (`/forecasting`)
- **4-input control row** — Monthly contribution (PHP, pre-filled from allocation), Expected annual return (%), Goal amount (PHP), and a read-only "Time to reach goal" computed card.
- **Portfolio projection chart** — horizon tabs (1/5/10/20/30 years), line chart of projected PHP portfolio value over that horizon (compound growth + monthly DCA, `futureValueDCA`), plus a row of milestone chips (value at each of the 5 fixed horizons regardless of selected tab).
- **Scenario comparison chart** — 3-line chart comparing the user's actual monthly contribution against two user-adjustable "Scenario B" and "Scenario C" monthly amounts, over the selected horizon.
- **Currency impact panel** — a single adjustable "simulated FX rate" input and a 3-row list showing the 10-year projected PHP value at (rate − 5), (rate), (rate + 5) — illustrates PHP/USD sensitivity.
- **Year-by-year breakdown table** — first 15 years of the selected horizon: year, projected PHP value, USD contributed-to-date estimate.

### Analytics (`/analytics`)
- **4-stat grid** — Financial Health (0–100 score, simple heuristic — 50 pts if any investment purchase exists and matches target allocation logic, 50 pts if any savings entry exists, else lower), Target savings rate, Target investment rate, Current net worth.
- **Savings & investment rates chart** — 6-month line chart with 4 series: actual savings rate %, actual investment rate %, target savings rate (dashed), target investment rate (dashed) — visually shows adherence to allocation targets over time.
- **Net worth progression chart** — cumulative area chart built by walking all purchases + savings entries chronologically and summing their PHP contributions, ending with a "Now" point equal to the live computed net worth.
- **Allocation targets list** — simple 3-row list (Investments/Savings/Spending) showing PHP amount and % for each, mirroring the Dashboard's allocation card in list form.

### Settings (`/settings`)
- **Allocation editor** — 3 custom-styled range sliders (Investments/Savings/Spending, 0–100 each) with live total validation (must sum to 100% ±0.5 to enable Save).
- **Income & paydays** — monthly income input; payday-of-month input (1–31) with an optional "add second payday" toggle for twice-monthly pay; both persist via a dedicated "Save paydays" button (separate from income, which saves on change).
- **Currency exchange rate** — manual PHP-per-USD rate input + "Fetch live" button that calls `exchangerate-api.com` directly from the browser; checkboxes to toggle whether PHP/USD amounts are shown elsewhere (`showPhp`/`showUsd` — flags exist in the store but are not yet consumed by any page in the current code).
- **Notifications** — enable-notifications button (browser Notification API permission prompt), two toggleable reminder types (US market open, Payday) each with their own hour/minute (market) or hour-range (payday) configuration fields. Notifications only fire while a FinTrack tab is open (`setInterval` polling every 60s in `useNotifications`), not real push notifications.
- **Live stock prices** — auto-refresh toggle + refresh-interval-in-minutes input (5–60) governing the Investments page's price polling. *(Note: `stockRefreshMinutes`/`autoRefreshStockPrices` are stored in settings but no interval/poll currently reads them — refresh today is always manual via the Investments page's "Refresh live" button.)*
- **Help & Onboarding** — "Restart Tour" button, re-triggers the full welcome/setup/spotlight-tour walkthrough.
- **Data management** — Export JSON (bundles finance store + relevant settings into a downloadable timestamped file), Import JSON (restores from that file, tolerant of legacy formats), Reset all data (double-confirmed, wipes both Zustand stores back to defaults).

### More (`/more`, mobile only)
- Simple link list (icon + title + description + chevron) to Forecasting, Analytics, Settings — exists purely because the mobile bottom nav can't fit 8 items.

### Cross-cutting: Onboarding / Walkthrough
- **Welcome modal** — first-run only (gated by `localStorage["fintrack_tour_done"]`), animated intro card with feature chips and "Start the tour" / "I'll explore on my own" CTAs.
- **Setup modal** — second onboarding step: enter monthly income + set target allocation (reuses `AllocationEditor` in a `hideSave` live-preview mode) before the tour begins.
- **Spotlight tour** — 12-step guided walkthrough (`WalkthroughOverlay`) that navigates between routes automatically, cuts a spotlight hole in a dark backdrop around each `data-tour="..."` tagged element, and shows a positioned tooltip card (auto left/right placement based on viewport) explaining that part of the UI. Steps cover: sidebar overview, Dashboard, Expenses, Savings, Goals, Investments (×2 steps), Exchange Rate (Settings), Live Prices (Settings), Forecasting, Analytics, Settings wrap-up.
- **Tour completion toast** — auto-dismissing (4s) success toast after the last step.
- Tour can be restarted any time from Settings.

---

## 6. Data & State Architecture

Two Zustand stores, both using the `persist` middleware (writes to `localStorage` as JSON on every change).

### `useFinanceStore` (`src/store/useFinanceStore.js`) — localStorage key: `fintrack-data`
Holds all of the user's actual financial records.

| State | Shape | Notes |
|---|---|---|
| `savingsEntries` | array of `{id, date, amount, type: 'deposit'\|'withdrawal', note, balance}` | `balance` is server-computed, not user-entered |
| `savingsBalance` | number | Derived/cached from the newest entry's computed balance |
| `savingsGoals` | array of `{id, name, target, targetDate, current}` | |
| `savingsInterestRate` | number (percent) | Default 2.5 |
| `emergencyFund` | number | Manually set, independent of `savingsBalance` |
| `cashOnHand` | number | Feeds net worth; no UI currently writes to it directly (not surfaced as an editable field on any page in this read) |
| `investmentPurchases` | array of `{id, date, assetType, ticker, shares, priceUSD, totalUSD, phpUsdRate, totalPHP, fee, note}` | One row per buy lot |
| `etfPrices` | `{ [ticker]: currentPriceUSD }` | Defaults `{VOO: 520, VTI: 240}`; updated by manual edit or live refresh |
| `transactions` | array of `{id, date, type: 'expense'\|'income', item, category, amount, note}` | Only `type: 'expense'` rows are currently surfaced in the UI (Expenses page) |
| `marketPriceHistory` | `{ [ticker]: [{timestamp, date, label, price}] }` | Cached chart data |
| `marketChartTicker` | string | Currently-selected ticker for the Investments price chart |
| `marketLastRefresh` | ISO date string \| null | |

Actions: `addSavingsEntry`/`updateSavingsEntry`/`removeSavingsEntry` (all trigger `recalculateSavingsEntries` to rebuild running balances), `addSavingsGoal`/`updateSavingsGoal`/`removeSavingsGoal`, `setSavingsInterestRate`, `setEmergencyFund`, `setCashOnHand`, `addInvestmentPurchase`/`updateInvestmentPurchase`/`removeInvestmentPurchase`, `updateEtfPrice`, `addTransaction`/`updateTransaction`/`removeTransaction`, `setMarketData` (patch), `resetFinanceData`, `exportData`/`importData` (JSON string in/out).

### `useSettingsStore` (`src/store/useSettingsStore.js`) — localStorage key: `fintrack-settings`
Holds configuration, not transactional data.

| State | Default | Notes |
|---|---|---|
| `allocation` | `{investments: 0, savings: 0, spending: 0}` | Must sum to 100% when edited via UI |
| `monthlyIncome` | 0 | |
| `paydays` | `[]` | Array of 1–2 day-of-month integers |
| `phpUsdRate` | 56.5 | |
| `showUsd` / `showPhp` | true / true | Stored but not currently read by any page |
| `savingsBank` / `savingsBankCustom` | "GoTyme" / "" | |
| `notificationsEnabled`, `notifyMarketOpen`, `notifyPayday`, `lastMarketNotifyDate`, `lastPaydayNotifyDate`, `marketNotifyHour`, `marketNotifyMinute`, `paydayNotifyHourStart`, `paydayNotifyHourEnd` | various | Drive `useNotifications` |
| `finnhubApiKey` | "" | Legacy/unused — Finnhub key now lives server-side only |
| `autoRefreshStockPrices`, `stockRefreshMinutes` | false / 15 | Stored but not currently wired to an active polling loop |

Actions are 1:1 setters plus `resetSettings`.

### Other persistence
- `fintrack_tour_done` (`localStorage`) — walkthrough completion flag, managed by `WalkthroughContext`.
- `fintrack-chart-v1` (`localStorage`) — legacy chart-cache key that `useMarketDataSync` still *reads* on mount as a one-time migration fallback, but nothing in the current code *writes* to it anymore (superseded by `marketPriceHistory` inside `fintrack-data`).
- `fintrack_ai_prompt` / `fintrack_ai_response` (`sessionStorage`) — AI Advisor's last prompt/response, cleared on tab close, so the box survives navigation within a session but not a reload... actually persists across reload too since sessionStorage survives reloads (cleared on tab close only).

### Data flow
`External API (Finnhub/Yahoo/exchangerate-api/Gemini)` → fetched by a hook or util (`useStockPriceRefresh`, `useExchangeRate`, `analyzeReceipt`, inline fetch in `AIFinancialAdvisorCard`) → written into the relevant Zustand store action → store's `persist` middleware syncs to `localStorage` → all subscribed components re-render via Zustand selectors (e.g. `useFinanceStore((s) => s.savingsBalance)`).

There is **no server-side database** and **no real-time sync** — everything is on-demand (user clicks "Refresh live," "Fetch live," or submits a form) except the 60-second notification-check interval and the initial hydration-gated app render (`main.jsx` waits for `persist.hasHydrated()` before mounting React, to avoid a flash of default/empty state).

---

## 7. API Integrations

### Finnhub (stock quotes)
- **Used for:** Live current price per ticker on the Investments page.
- **Endpoint called (server-side only):** `https://finnhub.io/api/v1/quote?symbol={TICKER}&token={FINNHUB_API_KEY}` inside `server/marketApi.js` → `fetchQuote()`.
- **Why the proxy exists:** Keeps the Finnhub API key out of the client bundle. The Vite dev server has a custom middleware (`marketApiDevPlugin` in `vite.config.js`) implementing `/api/quote` locally; in production this is `api/quote.js`, a Vercel serverless function.
- **Rate/tier limits:** Free tier. The client throttles itself with a 400ms delay between per-ticker requests (`fetchMultipleQuotes` in `utils/stockPrices.js`) to be gentle on the free quota. Finnhub's free tier does not include historical candles, which is why chart history uses Yahoo Finance instead.

### Yahoo Finance (chart history)
- **Used for:** ~90-day daily closing-price line chart per ticker on the Investments page.
- **Endpoint called (server-side only):** `https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}?interval=1d&range={1mo|3mo|6mo}` inside `server/marketApi.js` → `fetchChartHistory()`.
- **Why the proxy exists:** Same dev/prod dual-path pattern as Finnhub (`/api/stock-chart`), plus Yahoo blocks some direct browser requests — the server sets a `User-Agent` header. No API key required.
- **Rate/tier limits:** Unofficial/undocumented public endpoint; no key, informally rate-limited by Yahoo. Client throttles with a 300ms delay between tickers.

### exchangerate-api.com (FX rate)
- **Used for:** One-click "Fetch live" PHP/USD rate on the Settings page (`useExchangeRate` hook).
- **Endpoint called (directly from the browser, no proxy):** `https://api.exchangerate-api.com/v4/latest/USD`.
- **Why no proxy:** Free, keyless, public endpoint — no secret to protect.
- **Rate/tier limits:** Free tier, no key.

### Google Gemini 2.5 Flash (AI features)
- **Used for two features:**
  1. **AI Financial Advisor** (Dashboard) — free-text financial Q&A grounded in the user's live numbers.
  2. **Receipt scanning** (Expenses) — extracts `{item, amount, date, category}` from a photographed or uploaded receipt image.
- **Endpoint called (directly from the browser, NOT proxied):** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={VITE_GEMINI_API_KEY}`.
- **⚠️ Architecture note:** Unlike Finnhub, the Gemini API key is a `VITE_`-prefixed environment variable, which Vite inlines into the client bundle — meaning **the Gemini key is exposed to anyone who opens devtools**, unlike the Finnhub key which is properly proxied server-side. This is a pre-existing condition of the app, not something this document is asking to be fixed, but it's worth knowing if the rework touches how these features are wired.
- **Rate/tier limits:** Whatever the developer's personal Gemini API key tier allows.

---

## 8. Component Inventory

### `src/components/cards/`
| Component | Renders | Key props | Used on |
|---|---|---|---|
| `StatCard` | Small metric tile: label, big mono value, optional sub-label, optional colored trend % | `label, value, sub, trend, index` (index staggers a fade-in) | Dashboard, Expenses, Savings, Goals, Investments, Analytics |
| `NetWorthCard` | Hero card — large animated net worth number + 3-column breakdown | `netWorth, breakdown[]` | Dashboard |
| `AllocationCard` | Donut chart + list of allocation buckets with % and PHP amount | `allocation, amounts` | Dashboard |
| `GoalCard` | Single goal: name, target date, progress bar, amounts, remove/update-progress buttons | `goal, onDelete, onUpdateProgress` | Goals |
| `AIFinancialAdvisorCard` | Full AI chat-style card: textarea, ask/clear buttons, formatted markdown response | `netWorth, cashOnHand, savingsBalance, investmentPhp, monthlyIncome, allocation` | Dashboard |

### `src/components/charts/` (all Recharts wrappers, dark-themed via `constants/chartTheme.js`)
| Component | Chart type | Used on |
|---|---|---|
| `AllocationDonut` | Pie (donut) — 3-way allocation split | `AllocationCard` (Dashboard) |
| `HoldingsAllocationChart` | Pie (donut) + legend — portfolio mix by ticker value | Investments |
| `MonthlyBarChart` | Bar — income vs expenses, 6 months | Dashboard |
| `PortfolioGrowthChart` | Line — cumulative invested PHP over time | Dashboard |
| `ProjectionLineChart` | Line (single or multi-series via `lines` prop) — compound growth projections | Forecasting (×2 instances) |
| `SavingsInterestChart` | Area — projected savings balance over time | Savings |
| `StockPriceChart` | Line, dual-colored (green up-days / red down-days), width-observer for responsive sizing | Investments |

### `src/components/forms/`
| Component | Fields | Used on |
|---|---|---|
| `AddExpenseForm` | date, item, category (select), amount, note | Expenses (Log/Edit modal) |
| `AddInvestmentForm` | date, asset type (select), ticker, shares, price/share USD, live total preview, fee, note | Investments (Add/Edit modal) |
| `AddTransactionForm` | date, amount, type (expense/income select), note | Defined but **not referenced by any page** in the current codebase — appears to be a leftover/generic form superseded by `AddExpenseForm` |
| `AllocationEditor` | 3 sliders (investments/savings/spending) with live total validation; `hideSave` prop for live-preview embedding | Settings, `SetupModal` |
| `EditHoldingModal` | Current price editor + per-lot list (edit/delete each purchase for that ticker) | Investments |

### `src/components/layout/`
| Component | Renders | Notes |
|---|---|---|
| `Sidebar` | Desktop-only (`hidden md:flex`) full nav rail, logo, 8 nav items, active-state left border | `collapsed` prop exists but is never set to `true` anywhere (dead toggle) |
| `MobileNav` | Mobile-only (`md:hidden`) fixed bottom tab bar, 6 items | |
| `TopBar` | Page header: title, subtitle, optional hamburger (`onMenuClick`, currently unused — no page passes it), optional `actions` slot (also currently unused by any page) | Every page |
| `PageWrapper` | Animated (fade+slide-in) scrollable content container wrapping all routed page content | `App.jsx` |

### `src/components/ui/`
| Component | Purpose |
|---|---|
| `Badge` | Small pill label, 5 color variants (default/gain/loss/warning/highlight) — **not currently used by any page** in this read (defined but unreferenced) |
| `Button` | 4 variants (primary/secondary/ghost/danger) × 3 sizes (sm/md/lg) |
| `CustomRangeSlider` | Div-based custom slider (avoids native `<input type=range>` rendering issues in some browsers) |
| `FormSelect` | Labeled `<select>` wrapper matching `Input`'s styling |
| `Input` | Labeled `<input>` wrapper, special-cases `date`/`datetime-local` styling, optional error message |
| `Modal` | Portal-rendered bottom-sheet-on-mobile / centered-dialog-on-desktop, scroll-lock, backdrop click-to-close, Framer Motion enter/exit |
| `PageHelp` | Collapsible "How this page works" accordion box, present on every page |
| `SetupModal` | Onboarding step 2 — income + allocation entry before the guided tour starts |
| `Tabs` | Simple pill-style tab switcher (used for chart horizons and ticker selection) |
| `Tooltip` | Hover tooltip (CSS `group-hover`), generic wrapper — usage not found on any page in this read |
| `WalkthroughOverlay` | The 12-step spotlight tour engine — backdrop with SVG cutout mask + positioned tooltip cards |
| `WelcomeModal` | Onboarding step 1 — animated first-run welcome card |

---

## 9. Current Design System

### Color palette (exact values, from `tailwind.config.js` + `src/index.css`)

| Token | Hex | Usage |
|---|---|---|
| `bg-deepest` | `#06141B` | App background, deepest surface, input backgrounds |
| `bg-dark` | `#11212D` | Card backgrounds |
| `bg-mid` | `#253745` | Elevated cards, active nav state, progress track backgrounds |
| `accent` | `#4A5C6A` | Borders, dividers |
| `text-secondary` | `#9BA8AB` | Labels, muted text |
| `text-primary` | `#CCD0CF` | Body text |
| white | `#FFFFFF` | Headings, high-emphasis values |
| `gain` | `#4CAF7D` | Positive values (green) — gains, deposits, "on track" |
| `loss` | `#E05C5C` | Negative values (red) — losses, withdrawals, over-budget |
| `highlight` | `#5B8FA8` | Primary accent — active states, links, primary buttons, chart primary series |
| `warning` | `#D4A843` | Warnings, spending-bucket color in allocation charts |

This is a **fixed dark theme only** — there is no light mode and no theme toggle anywhere in the code.

### Typography
- **Display font:** Syne (600/700/800 weights) — page titles (`h1`), card section headings (`h3`), modal titles. Loaded from Google Fonts in `index.html`.
- **Body font:** DM Sans (300/400/500/600) — all body text, labels, buttons.
- **Mono font:** JetBrains Mono (400/500) — all numeric/currency values (`font-mono` / `.font-mono-num` utility), giving tabular alignment to money figures.

### Spacing / radius system (Tailwind `theme.extend` + CSS variables)
- Border radius scale: `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 20px` (Tailwind `xl`), `--radius-xl: 28px` (Tailwind `2xl`).
- No custom Tailwind spacing scale — uses Tailwind's default spacing (4px increments) throughout. No custom container widths defined.
- Shadow scale: `--shadow-card: 0 4px 24px rgba(0,0,0,0.4)`, `--shadow-elevated: 0 8px 40px rgba(0,0,0,0.6)`.

### Current visual patterns
- **Cards:** `.card` (bg-dark, 1px accent border, `radius-lg`, `shadow-card`, 16px padding mobile / 24px desktop) is the dominant container — nearly every section of every page is wrapped in one. `.card-elevated` (bg-mid, `radius-xl`, `shadow-elevated`, no border) is reserved for the single most important element per page (e.g. the Net Worth hero card).
- **Tables:** Plain HTML `<table>` with a bottom-border header row and per-row `border-accent/50` dividers, horizontally scrollable (`overflow-x-auto`) on narrow screens. Used on Expenses, Savings, Investments (×2), Forecasting.
- **Charts:** All Recharts, all sharing one theme object (`chartTheme.js`), consistently ~200–300px tall, always inside a `.card`.
- **Modals:** Bottom-sheet on mobile (slides up, rounded top corners only), centered dialog on desktop (fully rounded) — single `Modal` component handles both responsively.
- **Nav:** Sidebar (desktop) vs. bottom tabs (mobile) — no hamburger/drawer pattern despite `TopBar` having unused `onMenuClick` plumbing for one.
- **Progress bars:** Thin (8px / `h-2`) rounded bars in `bg-mid` track with `highlight` or `loss` (over-budget) fill — used for budgets and goal progress.
- **Stat grids:** Responsive `grid` of `StatCard`s, typically 2 cols mobile → 4 cols desktop.
- **Onboarding overlay system:** A fairly elaborate custom spotlight/tour system (SVG mask cutout + portal tooltips) layered on top of everything else — this is one of the most custom/bespoke pieces of UI in the app.

### Responsive breakpoints
Uses Tailwind's default breakpoints (no custom breakpoint config): `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. The most consequential breakpoint in this app is `md` (768px) — it's the sidebar/bottom-nav switchover point and the general "mobile vs. desktop" line used throughout (`.card` padding, table column hiding, grid column counts).

---

## 10. Visual Problems to Solve

1. **Repetitive stat-card walls.** Dashboard, Expenses, Savings, Goals, Investments, and Analytics all open with a near-identical 2×2/1×4 grid of `StatCard`s before showing anything else. Six pages doing the same "4 boxes at the top" pattern makes the app feel templated and makes it hard to tell pages apart at a glance.

2. **Tables everywhere, no density options.** `Expenses`, `Savings`, `Investments` (holdings + purchase history — two separate tables), and `Forecasting`'s year-by-year breakdown are all plain HTML tables with 5–8 columns that must horizontally scroll on mobile (`overflow-x-auto`, some with `min-w-[520px]` forcing scroll even on larger phones). This is the single biggest mobile-experience gap in the app — e.g. `Investments` holdings table.

3. **Investments page is overloaded.** It's the densest screen in the app: 4 stat cards, a holdings table, a DCA tracker card, a live-price-editing panel (with up to 3 different warning/error banner states), a price history chart with ticker tabs, a portfolio-mix donut, and a full purchase-history table — all stacked vertically with no tabs/sections to isolate them. A user has to scroll past everything to reach purchase history.

4. **Goals' "Fund goals" modal is functionally rich but visually flat.** It has real conditional complexity (two funding sources, each with its own sub-options, a live preview of three computed numbers) but is rendered as a single scrolling list of checkboxes/inputs with no visual hierarchy distinguishing "your choices" from "the computed result."

5. **Chart-vs-target overlays are hard to read.** `Analytics`'s "Savings & investment rates" chart plots 4 lines (2 solid + 2 dashed target lines) on one small (220px) canvas — distinguishing actual-vs-target for two different metrics simultaneously in that space is a genuine information-density problem, not just a styling one.

6. **Inconsistent card headers.** Section headings inside cards are just an `<h3 className="font-display text-lg font-semibold text-white">` repeated by hand in every file — no shared `CardHeader` component, so spacing/subtitle patterns already drift slightly between pages (some have a `<p>` subtitle under the heading, most don't).

7. **PageHelp accordions add friction, not clarity.** Every single page opens with a collapsed "How this page works" box. This is a symptom of the underlying UI not being self-explanatory enough — six separate explainer texts is a lot of documentation-as-UI. A rework that makes the numbers and their relationships legible in the layout itself could retire most of these.

8. **Warning/error banner proliferation on Investments.** Up to three different colored banners (highlight = "price from chart fallback", warning = "live price could not load" with troubleshooting copy, loss = general fetch error) can stack simultaneously above the price panel — this is important information buried in visually similar boxes.

9. **No dark/light theme option, but the palette is muted throughout.** Every surface sits in a narrow slice of dark blue-grays (`#06141B` → `#253745`); the only saturated colors are the 4 semantic ones (gain/loss/highlight/warning). This is a deliberate, coherent choice — not a "problem" per se — but it means the rework has very little existing color vocabulary to build affordances from beyond those 4 hues, so new UI (e.g. empty states, secondary actions) will need new color decisions, not just reuse.

10. **Mobile nav omits 3 of 8 sections behind a "More" page.** Forecasting, Analytics, and Settings require two taps on mobile (bottom nav → More → item) versus one tap for everything else — worth reconsidering given Analytics/Forecasting are arguably core value props, not overflow.

11. **Unused/dead UI surface.** `Badge` and `Tooltip` components exist but are wired into zero pages; `TopBar`'s `onMenuClick`/`actions` props and `Sidebar`'s `collapsed` prop are plumbed but never actually triggered. A rework is a natural point to either adopt or remove these.

---

## 11. UI Rework Goals

**Overall aesthetic goal:** Keep the dark, data-dense, mono-numeral financial-app identity (it's appropriate for the content and already fairly coherent) but reduce repetition and increase per-page visual distinctiveness. The goal is "confidently dense but scannable," not "minimal" — this is a numbers app and users expect numbers — but density should come from smart layout (sparklines inline with stats, collapsible secondary tables) rather than from stacking six identical stat-card rows across the app.

**Key screens needing the most work:**
- **Investments** — the most overloaded screen; needs internal structure (tabs or sections: Overview / Holdings / History) rather than one long scroll.
- **Dashboard** — first impression of the app; currently a good screen but could better integrate the AI advisor (currently a large full-width card that dominates regardless of whether the user wants it front-and-center) and reduce the number of visually-separate "boxes."
- **Expenses & Savings** — both share the "budget bar + table + secondary panel" pattern; a shared, more refined budget-visualization pattern (not just a thin progress bar) would elevate both at once.
- **Goals' Fund modal** — needs visual hierarchy work specifically (see Problem #4).

**Features that should be more prominent:**
- AI Financial Advisor (a genuine differentiator) and AI receipt scanning — both are currently a bit buried (advisor is one card among many on Dashboard; receipt scan is a small secondary button on Expenses).
- Forecasting and Analytics — currently mobile-second-class (behind "More"); consider promoting given they're where the app's actual insight lives.
- Net worth trend over time — currently only visible as one chart on Analytics; could be a persistent, glanceable element (e.g. a sparkline) across more of the app.

**Features that could be simplified or hidden by default:**
- The six-page-wide `PageHelp` explainer pattern — replace with inline microcopy or a single global "how this works" reference rather than a collapsible box on every screen.
- Investments' purchase-history table (the full lot-by-lot ledger) — this is genuinely secondary to "what do I own right now" (the holdings table) and could default to collapsed.
- The Forecasting page's "Currency impact" and "Scenario comparison" panels are power-user tools; consider a progressive-disclosure pattern (e.g. "Advanced" toggle) so the primary projection chart isn't competing with them for attention.

**Mobile-first considerations:**
- Every wide table (Expenses purchase log, Savings history, Investments holdings + purchase history, Forecasting year breakdown) needs a real mobile-native alternative to horizontal-scroll — e.g. a stacked-card list pattern for small screens, reserving the table for `md:` and up.
- Reconsider the mobile nav's 6-vs-"More" split now that Analytics/Forecasting are being flagged as more prominent (see above) — possibly a 5-item nav + a genuine "More" sheet, or restructure which 6 items are primary.

**Interaction patterns to introduce:**
- Inline sparklines on stat cards (net worth, portfolio value, savings balance) — currently stat cards are number-only with no trend visualization except a manually-passed `trend` percentage on a couple of them.
- Collapsible/expandable sections for secondary tables (see "hidden by default" above) instead of PageHelp accordions doing double duty as the only progressive-disclosure mechanism in the app.

**Interaction patterns to remove/reconsider:**
- The `PageHelp` accordion as the app's sole "explain this page" mechanism — six near-identical instances is a lot for one interaction pattern to carry.

---

## 12. Screen-by-Screen Redesign Targets

### Dashboard (`/`)
- **Current layout problems:** Net worth card, 4 stats, full-width AI advisor, allocation+expenses charts, portfolio+payday charts — six visually equal-weight sections stacked with no hierarchy beyond order.
- **Redesign priorities:** Net worth (with trend/sparkline) and the current allocation split are the two things a user checks daily — these should dominate above the fold. AI advisor is high-value but conversational/optional — could move to a slide-out or secondary position rather than full-width hero real estate.
- **Above the fold:** Net worth (with breakdown), allocation snapshot, next-payday countdown.
- **Secondary/collapsed:** AI advisor (still one tap away, not gone), income-vs-expenses and portfolio-growth charts (useful but retrospective, not the first thing needed).
- **New patterns to introduce:** Net worth sparkline; a unified "this month" summary strip instead of 4 separate stat cards.

### Expenses (`/expenses`)
- **Current layout problems:** Budget bar, 4 stats, and the purchase table+category list are three separate visual blocks that all describe the same underlying number (this month's spending) from different angles.
- **Redesign priorities:** Unify "how much have I spent vs. my budget" into one strong visual (the budget bar is close, but could absorb the redundant stat cards). Category breakdown deserves more visual weight — it's currently a plain text list.
- **Above the fold:** Spending budget progress (amount spent / remaining), scan/upload receipt actions (a genuine differentiator — currently secondary buttons below the table).
- **Secondary/collapsed:** Full purchase log table (could default to last 5–10 with "see all").
- **New patterns to introduce:** Category breakdown as a small horizontal bar chart or donut instead of a plain list; mobile card-list view for the purchase log.

### Savings (`/savings`)
- **Current layout problems:** Bank selector, 3 stats, deposit/withdrawal panel, interest-projection panel, and history table are five stacked blocks of similar visual weight; the deposit/withdrawal quick-entry (most frequent action) has no more prominence than the interest-rate-experimentation panel (least frequent action).
- **Redesign priorities:** Elevate the deposit/withdrawal action (it's the main thing users do here regularly); the interest projection is exploratory/occasional and could be secondary.
- **Above the fold:** Balance, deposit/withdrawal quick action.
- **Secondary/collapsed:** Interest projection panel (still important, but exploratory), full history table.
- **New patterns to introduce:** Mobile card-list for history instead of a table.

### Goals (`/goals`)
- **Current layout problems:** Goal cards are good; the "Fund goals" modal (Problem #4 above) is the weak point — dense, flat, no hierarchy.
- **Redesign priorities:** Goal cards stay prominent (they're already a good pattern — keep). Redesign the funding modal to visually separate "source selection" from "computed result preview," e.g. a two-step or two-panel layout.
- **Above the fold:** Goal cards grid.
- **Secondary/collapsed:** Nothing major needs hiding here — page is already reasonably lean.
- **New patterns to introduce:** A clearer funding-preview pattern (source → arrow → per-goal result) inside the Fund modal.

### Investments (`/investments`)
- **Current layout problems:** The single most overloaded page (see Problem #3) — 4 stats, holdings table, DCA card, price panel with up to 3 banner states, price chart, portfolio-mix chart, and a second full table (purchase history) all in one scroll.
- **Redesign priorities:** Split into clear zones — "what I own now" (holdings + value + mix chart) vs. "market data" (live prices + chart) vs. "history" (purchase log) — likely via tabs or a segmented layout rather than one long page.
- **Above the fold:** Total value, unrealized P/L, holdings table.
- **Secondary/collapsed:** Purchase history (full lot ledger — genuinely secondary to current holdings), the DCA tracker (useful but small, could integrate into the payday/dashboard flow instead of duplicating here).
- **New patterns to introduce:** Section tabs (Overview / Prices & Charts / History); consolidate the up-to-3 warning banners into a single expandable "data issues" indicator instead of stacked colored boxes.

### Forecasting (`/forecasting`)
- **Current layout problems:** 4 inputs, main projection chart + milestone chips, then two more charts (scenario comparison, currency impact) of roughly equal visual weight to the main chart, then a 15-row table — a lot of tools presented with equal prominence regardless of how often each is used.
- **Redesign priorities:** The main projection (given current real contribution + rate) is the primary answer; scenario comparison and FX sensitivity are power-user "what-if" tools.
- **Above the fold:** Inputs + main projection chart + "time to reach goal."
- **Secondary/collapsed:** Scenario comparison, currency impact, year-by-year table — group under an "Advanced / What-if" progressive-disclosure section.
- **New patterns to introduce:** An "Advanced" expandable section grouping the two secondary charts + table.

### Analytics (`/analytics`)
- **Current layout problems:** Health score sits as just another stat card despite being the page's headline number; the dual-target rate chart is visually dense for its size (Problem #5).
- **Redesign priorities:** Make the health score the clear headline of the page (it's currently visually equal to "current net worth," a much less interpretive number). Simplify or split the 4-line rate chart.
- **Above the fold:** Financial health score (larger, more prominent — perhaps a gauge/ring rather than a stat-card number), net worth progression.
- **Secondary/collapsed:** Allocation-targets list (redundant with Dashboard's allocation card — consider removing or deep-linking instead of duplicating).
- **New patterns to introduce:** A gauge/radial indicator for the health score instead of a plain "X/100" stat card; consider splitting the combined savings+investment rate chart into two smaller, clearer single-metric charts (actual vs. target) rather than 4 lines on one chart.

### Settings (`/settings`)
- **Current layout problems:** Reasonably well-organized already (grouped cards: Allocation, Income & Paydays, Notifications, Live Prices, Help, Data). Least in need of visual rework; mostly a forms page.
- **Redesign priorities:** Keep the grouped-card structure; could tighten the allocation slider + "must equal 100%" validation UX (currently text-only feedback) and clarify which settings are stubbed/inactive (e.g. auto-refresh toggle has no effect yet — see Section 6 note) so the rework doesn't visually promise functionality that isn't wired up, or flags it as a place to wire up if the rework project includes that.
- **Above the fold:** Allocation editor, income/paydays (the two most-touched settings).
- **Secondary/collapsed:** Notifications, live-price settings, help/data-management (already appropriately below the fold).
- **New patterns to introduce:** None critical — this page's existing card-grid pattern is fine; apply whatever new `Card`/`Input` primitives come out of the rework here last, as a consistency pass.

### More (`/more`, mobile only)
- **Current layout problems:** None significant — it's a simple, functional link list.
- **Redesign priorities:** Depends entirely on the mobile-nav restructuring decision (Section 11) — if Analytics/Forecasting get promoted into the primary bottom nav, this page may shrink to just Settings or be removable entirely.
- **Above the fold:** All 3 links (page is short).
- **Secondary/collapsed:** N/A.
- **New patterns to introduce:** N/A — resolve via nav-structure decision first.
