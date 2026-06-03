async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchStockQuote(ticker) {
  const symbol = ticker.trim().toUpperCase();
  if (!symbol) throw new Error("Invalid ticker");

  const res = await fetch(
    `/api/quote?symbol=${encodeURIComponent(symbol)}`
  );
  const data = await parseJson(res);
  return { price: data.price, source: data.source || "Finnhub" };
}

/** Daily closing prices for charts (~90 days). Uses server proxy (not Finnhub candles — paid tier). */
export async function fetchStockCandles(ticker, days = 90) {
  const symbol = ticker.trim().toUpperCase();
  if (!symbol) throw new Error("Invalid ticker");

  const res = await fetch(
    `/api/stock-chart?symbol=${encodeURIComponent(symbol)}&days=${days}`
  );
  const data = await parseJson(res);
  if (!data.points?.length) {
    throw new Error(`No history for ${symbol}`);
  }
  return data.points;
}

export async function fetchMultipleQuotes(tickers, _apiKeyOverride, onProgress) {
  const results = {};
  const errors = {};
  for (const ticker of tickers) {
    try {
      const { price } = await fetchStockQuote(ticker);
      results[ticker] = price;
      onProgress?.(ticker, price, null);
    } catch (e) {
      errors[ticker] = e.message;
      onProgress?.(ticker, null, e.message);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return { results, errors };
}

export async function fetchMultipleCandles(tickers, days = 90) {
  const history = {};
  const errors = {};
  for (const ticker of tickers) {
    try {
      history[ticker] = await fetchStockCandles(ticker, days);
    } catch (e) {
      errors[ticker] = e.message;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return { history, errors };
}
