import { useCallback, useState, useEffect } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import {
  fetchMultipleQuotes,
  fetchMultipleCandles,
} from "../utils/stockPrices";

/** Survives leaving the Investments route; only changes on Refresh live. */
const marketCache = {
  priceHistory: {},
  lastRefresh: null,
  chartTicker: "",
  quoteErrors: {},
  chartErrors: {},
  priceFallbacks: {},
};

function lastClose(points) {
  if (!points?.length) return null;
  return points[points.length - 1].price;
}

export function useStockPriceRefresh() {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const updateEtfPrice = useFinanceStore((s) => s.updateEtfPrice);

  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(marketCache.lastRefresh);
  const [quoteErrors, setQuoteErrors] = useState(marketCache.quoteErrors);
  const [chartErrors, setChartErrors] = useState(marketCache.chartErrors);
  const [priceFallbacks, setPriceFallbacks] = useState(marketCache.priceFallbacks);
  const [priceHistory, setPriceHistory] = useState(marketCache.priceHistory);
  const [chartTicker, setChartTickerState] = useState(marketCache.chartTicker);

  const tickers = [...new Set(purchases.map((p) => p.ticker))];

  const setChartTicker = useCallback((ticker) => {
    marketCache.chartTicker = ticker;
    setChartTickerState(ticker);
  }, []);

  const refreshPrices = useCallback(async () => {
    if (tickers.length === 0) return;
    setLoading(true);
    setQuoteErrors({});
    setChartErrors({});
    setPriceFallbacks({});
    marketCache.quoteErrors = {};
    marketCache.chartErrors = {};
    marketCache.priceFallbacks = {};

    try {
      const { history, errors: cErr } = await fetchMultipleCandles(tickers, 90);
      marketCache.priceHistory = history;
      marketCache.chartErrors = cErr;
      setPriceHistory(history);
      setChartErrors(cErr);

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

      marketCache.quoteErrors = remainingQuoteErrors;
      marketCache.priceFallbacks = fallbacks;
      setQuoteErrors(remainingQuoteErrors);
      setPriceFallbacks(fallbacks);

      const nextTicker =
        marketCache.chartTicker && tickers.includes(marketCache.chartTicker)
          ? marketCache.chartTicker
          : tickers[0];
      marketCache.chartTicker = nextTicker;
      setChartTickerState(nextTicker);

      const now = new Date();
      marketCache.lastRefresh = now;
      setLastRefresh(now);
    } catch (e) {
      const err = { _: e.message };
      marketCache.quoteErrors = err;
      setQuoteErrors(err);
    } finally {
      setLoading(false);
    }
  }, [tickers.join(","), updateEtfPrice]);

  useEffect(() => {
    if (tickers.length && !chartTicker) {
      const first = tickers[0];
      marketCache.chartTicker = first;
      setChartTickerState(first);
    } else if (
      chartTicker &&
      tickers.length &&
      !tickers.includes(chartTicker)
    ) {
      const first = tickers[0];
      marketCache.chartTicker = first;
      setChartTickerState(first);
    }
  }, [tickers.join(","), chartTicker]);

  return {
    refreshPrices,
    loading,
    lastRefresh,
    quoteErrors,
    chartErrors,
    priceFallbacks,
    priceHistory,
    chartTicker,
    setChartTicker,
    finnhubReady: true,
  };
}
