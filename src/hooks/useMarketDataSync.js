import { useEffect } from "react";
import { useFinanceStore } from "../store/useFinanceStore";

/** Keep chart ticker aligned with current holdings. */
export function useMarketDataSync() {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const chartTicker = useFinanceStore((s) => s.marketChartTicker);
  const setMarketData = useFinanceStore((s) => s.setMarketData);
  const tickers = [...new Set(purchases.map((p) => p.ticker))];

  useEffect(() => {
    if (!tickers.length) return;
    if (!chartTicker || !tickers.includes(chartTicker)) {
      setMarketData({ marketChartTicker: tickers[0] });
    }
  }, [tickers.join(","), chartTicker, setMarketData]);

  useEffect(() => {
    const state = useFinanceStore.getState();
    if (Object.keys(state.marketPriceHistory || {}).length > 0) return;
    try {
      const raw = localStorage.getItem("fintrack-chart-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.priceHistory || !Object.keys(parsed.priceHistory).length) return;
      setMarketData({
        marketPriceHistory: parsed.priceHistory,
        marketChartTicker: parsed.chartTicker || tickers[0] || "",
        marketLastRefresh: parsed.lastRefresh || null,
      });
    } catch {
      /* ignore */
    }
  }, [setMarketData, tickers.join(",")]);
}
