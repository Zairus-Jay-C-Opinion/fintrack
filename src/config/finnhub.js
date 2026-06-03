/**
 * Market data is fetched through server routes (/api/quote, /api/stock-chart)
 * so your Finnhub key never ships in the browser bundle.
 *
 * Local: set FINNHUB_API_KEY in .env (see .env.example)
 * Production (Vercel): Project → Settings → Environment Variables → FINNHUB_API_KEY
 *
 * Free Finnhub key: https://finnhub.io/register
 */

export function isFinnhubConfigured() {
  return true;
}
