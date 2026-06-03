import { useCallback } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { useMarketStore } from "../store/useMarketStore";
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

  const priceHistory = useMarketStore((s) => s.priceHistory);
  const chartTicker = useMarketStore((s) => s.chartTicker);
  const lastRefresh = useMarketStore((s) => s.lastRefresh);
  const quoteErrors = useMarketStore((s) => s.quoteErrors);
  const chartErrors = useMarketStore((s) => s.chartErrors);
  const priceFallbacks = useMarketStore((s) => s.priceFallbacks);
  const loading = useMarketStore((s) => s.loading);
  const setMarket = useMarketStore((s) => s.setMarket);
  const clearMarketMessages = useMarketStore((s) => s.clearMarketMessages);

  const tickers = [...new Set(purchases.map((p) => p.ticker))];

  const setChartTicker = useCallback(
    (ticker) => setMarket({ chartTicker: ticker }),
    [setMarket]
  );

  const refreshPrices = useCallback(async () => {
    if (tickers.length === 0) return;
    setMarket({ loading: true });
    clearMarketMessages();

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

      const currentTicker = useMarketStore.getState().chartTicker;
      const nextTicker =
        currentTicker && tickers.includes(currentTicker)
          ? currentTicker
          : tickers[0];

      setMarket({
        priceHistory: history,
        chartErrors: cErr,
        quoteErrors: remainingQuoteErrors,
        priceFallbacks: fallbacks,
        chartTicker: nextTicker,
        lastRefresh: new Date().toISOString(),
        loading: false,
      });
    } catch (e) {
      setMarket({
        quoteErrors: { _: e.message },
        loading: false,
      });
    }
  }, [tickers.join(","), updateEtfPrice, setMarket, clearMarketMessages]);

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
