/** Pick a ticker that actually has stored chart points. */
export function resolveChartTicker(tickers, chartTicker, priceHistory) {
  if (chartTicker && priceHistory?.[chartTicker]?.length) return chartTicker;
  for (const t of tickers) {
    if (priceHistory?.[t]?.length) return t;
  }
  return chartTicker || tickers[0] || "";
}
