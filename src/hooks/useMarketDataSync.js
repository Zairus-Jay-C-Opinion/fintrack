import { useEffect } from "react";
import { useFinanceStore } from "../store/useFinanceStore";

/** Migrate legacy chart cache + keep ticker in sync app-wide. */
export function useMarketDataSync() {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const setMarketData = useFinanceStore((s) => s.setMarketData);
  const tickers = [...new Set(purchases.map((p) => p.ticker))];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fintrack-market");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const legacy = parsed?.state;
      if (!legacy?.priceHistory || !Object.keys(legacy.priceHistory).length) {
        return;
      }
      const current = useFinanceStore.getState().marketPriceHistory;
      if (Object.keys(current).length > 0) return;
      setMarketData({
        marketPriceHistory: legacy.priceHistory,
        marketChartTicker: legacy.chartTicker || "",
        marketLastRefresh: legacy.lastRefresh || null,
      });
    } catch {
      /* ignore */
    }
  }, [setMarketData]);

  useEffect(() => {
    if (!tickers.length) return;
    const current = useFinanceStore.getState().marketChartTicker;
    if (!current || !tickers.includes(current)) {
      setMarketData({ marketChartTicker: tickers[0] });
    }
  }, [tickers.join(","), setMarketData]);
}
