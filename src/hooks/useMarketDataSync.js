import { useEffect } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { getChartCache, setChartCache, initChartCache } from "../utils/chartCache";

/** Load chart cache + sync ticker when holdings change. */
export function useMarketDataSync() {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const tickers = [...new Set(purchases.map((p) => p.ticker))];

  useEffect(() => {
    initChartCache();

    const legacy = useFinanceStore.getState().marketPriceHistory;
    const cached = getChartCache();
    if (
      Object.keys(cached.priceHistory).length === 0 &&
      legacy &&
      Object.keys(legacy).length > 0
    ) {
      setChartCache({
        priceHistory: legacy,
        chartTicker: useFinanceStore.getState().marketChartTicker || "",
        lastRefresh: useFinanceStore.getState().marketLastRefresh || null,
      });
    }

    try {
      const raw = localStorage.getItem("fintrack-market");
      if (raw && Object.keys(getChartCache().priceHistory).length === 0) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state;
        if (state?.priceHistory && Object.keys(state.priceHistory).length) {
          setChartCache({
            priceHistory: state.priceHistory,
            chartTicker: state.chartTicker || "",
            lastRefresh: state.lastRefresh || null,
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!tickers.length) return;
    const current = getChartCache().chartTicker;
    if (!current || !tickers.includes(current)) {
      setChartCache({ chartTicker: tickers[0] });
    }
  }, [tickers.join(",")]);
}
