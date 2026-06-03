import { useCallback, useState, useSyncExternalStore } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import {
  getChartCache,
  setChartCache,
  subscribeChartCache,
} from "../utils/chartCache";
import {
  fetchMultipleQuotes,
  fetchMultipleCandles,
} from "../utils/stockPrices";

function lastClose(points) {
  if (!points?.length) return null;
  return points[points.length - 1].price;
}

export function useStockPriceRefresh() {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const updateEtfPrice = useFinanceStore((s) => s.updateEtfPrice);

  const chartCache = useSyncExternalStore(
    subscribeChartCache,
    getChartCache,
    getChartCache
  );

  const [loading, setLoading] = useState(false);
  const [quoteErrors, setQuoteErrors] = useState({});
  const [chartErrors, setChartErrors] = useState({});
  const [priceFallbacks, setPriceFallbacks] = useState({});

  const tickers = [...new Set(purchases.map((p) => p.ticker))];
  const { priceHistory, chartTicker, lastRefresh } = chartCache;

  const setChartTicker = useCallback((ticker) => {
    setChartCache({ chartTicker: ticker });
  }, []);

  const refreshPrices = useCallback(async () => {
    if (tickers.length === 0) return;
    setLoading(true);
    setQuoteErrors({});
    setChartErrors({});
    setPriceFallbacks({});

    try {
      const { history, errors: cErr } = await fetchMultipleCandles(tickers, 90);

      const { results, errors: qErr } = await fetchMultipleQuotes(tickers);
      const remainingQuoteErrors = { ...qErr };
      const fallbacks = {};

      for (const ticker of tickers) {
        if (results[ticker] != null) {
          updateEtfPrice(ticker, results[ticker]);
          continue;
        }
        const close = lastClose(history[ticker]);
        if (close != null && close > 0) {
          updateEtfPrice(ticker, close);
          delete remainingQuoteErrors[ticker];
          fallbacks[ticker] =
            "Using latest chart close (Finnhub live quote unavailable on server).";
        }
      }

      const currentTicker = getChartCache().chartTicker;
      const nextTicker =
        currentTicker && tickers.includes(currentTicker)
          ? currentTicker
          : tickers[0];

      setChartCache({
        priceHistory: history,
        chartTicker: nextTicker,
        lastRefresh: new Date().toISOString(),
      });

      useFinanceStore.getState().setMarketData({
        marketPriceHistory: history,
        marketChartTicker: nextTicker,
        marketLastRefresh: new Date().toISOString(),
      });
      setChartErrors(cErr);
      setQuoteErrors(remainingQuoteErrors);
      setPriceFallbacks(fallbacks);
    } catch (e) {
      setQuoteErrors({ _: e.message });
    } finally {
      setLoading(false);
    }
  }, [tickers.join(","), updateEtfPrice]);

  const lastRefreshDate = lastRefresh ? new Date(lastRefresh) : null;

  return {
    refreshPrices,
    loading,
    lastRefresh: lastRefreshDate,
    quoteErrors,
    chartErrors,
    priceFallbacks,
    priceHistory,
    chartTicker,
    setChartTicker,
    finnhubReady: true,
  };
}
