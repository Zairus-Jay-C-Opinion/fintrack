import { useEffect } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { useMarketStore } from "../store/useMarketStore";

/** Keeps chart ticker in sync app-wide (desktop sidebar nav unmounts Investments). */
export function useMarketDataSync() {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const setMarket = useMarketStore((s) => s.setMarket);
  const tickers = [...new Set(purchases.map((p) => p.ticker))];

  useEffect(() => {
    if (!tickers.length) return;
    const current = useMarketStore.getState().chartTicker;
    if (!current || !tickers.includes(current)) {
      setMarket({ chartTicker: tickers[0] });
    }
  }, [tickers.join(","), setMarket]);
}
