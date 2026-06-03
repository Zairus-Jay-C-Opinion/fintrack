import { useEffect, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import {
  fetchMultipleQuotes,
  fetchMultipleCandles,
} from "../utils/stockPrices";

function lastClose(points) {
  if (!points?.length) return null;
  return points[points.length - 1].price;
}

export function useStockPriceRefresh() {
  const location = useLocation();
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const updateEtfPrice = useFinanceStore((s) => s.updateEtfPrice);
  const autoRefresh = useSettingsStore((s) => s.autoRefreshStockPrices);
  const refreshMinutes = useSettingsStore((s) => s.stockRefreshMinutes);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [quoteErrors, setQuoteErrors] = useState({});
  const [chartErrors, setChartErrors] = useState({});
  const [priceFallbacks, setPriceFallbacks] = useState({});
  const [priceHistory, setPriceHistory] = useState({});
  const [chartTicker, setChartTicker] = useState("");

  const tickers = [...new Set(purchases.map((p) => p.ticker))];

  const refreshPrices = useCallback(async () => {
    if (tickers.length === 0) return;
    setLoading(true);
    setQuoteErrors({});
    setChartErrors({});
    setPriceFallbacks({});
    try {
      const { history, errors: cErr } = await fetchMultipleCandles(tickers, 90);
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

      setQuoteErrors(remainingQuoteErrors);
      setPriceFallbacks(fallbacks);

      if (!chartTicker && tickers.length) {
        setChartTicker(tickers[0]);
      }
      setLastRefresh(new Date());
    } catch (e) {
      setQuoteErrors({ _: e.message });
    } finally {
      setLoading(false);
    }
  }, [tickers.join(","), updateEtfPrice, chartTicker]);

  useEffect(() => {
    if (tickers.length && !chartTicker) {
      setChartTicker(tickers[0]);
    }
  }, [tickers.join(","), chartTicker]);

  useEffect(() => {
    if (location.pathname !== "/investments" || !autoRefresh || tickers.length === 0) {
      return;
    }
    refreshPrices();
    const ms = Math.max(5, refreshMinutes) * 60 * 1000;
    const id = setInterval(refreshPrices, ms);
    return () => clearInterval(id);
  }, [location.pathname, autoRefresh, refreshMinutes, refreshPrices, tickers.length]);

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
