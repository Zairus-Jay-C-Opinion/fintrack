import { format } from "date-fns";

/** Live quote via Finnhub (free tier). */
export async function fetchQuote(symbol, apiKey) {
  const sym = symbol.trim().toUpperCase();
  if (!sym) throw new Error("Invalid ticker");
  if (!apiKey) throw new Error("FINNHUB_API_KEY not configured on server");

  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${apiKey}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || data.message || `Finnhub error (${res.status})`;
    throw new Error(msg);
  }
  if (data.c == null || data.c === 0) {
    throw new Error(`No price for ${sym}`);
  }
  return { price: data.c, source: "Finnhub" };
}

/** Daily OHLC history via Yahoo Finance (works on free tier; Finnhub candles are paid). */
export async function fetchChartHistory(symbol, days = 90) {
  const sym = symbol.trim().toUpperCase();
  if (!sym) throw new Error("Invalid ticker");

  const range = days <= 30 ? "1mo" : days <= 90 ? "3mo" : "6mo";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=${range}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "FinTrack/1.0 (personal finance app)" },
  });
  if (!res.ok) throw new Error(`Chart data unavailable (${res.status})`);

  const payload = await res.json();
  const result = payload?.chart?.result?.[0];
  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;

  if (!timestamps?.length || !closes?.length) {
    throw new Error(`No chart history for ${sym}`);
  }

  const points = [];
  for (let i = 0; i < timestamps.length; i++) {
    const price = closes[i];
    if (price == null) continue;
    const d = new Date(timestamps[i] * 1000);
    points.push({
      timestamp: timestamps[i],
      date: format(d, "yyyy-MM-dd"),
      label: format(d, "MMM d"),
      price,
    });
  }

  if (points.length === 0) throw new Error(`No chart history for ${sym}`);
  return points;
}
