import { createContext, useContext } from "react";
import { useStockPriceRefresh } from "../hooks/useStockPriceRefresh";

const MarketChartContext = createContext(null);

/** Keeps chart cache + refresh logic mounted while switching sidebar routes (PC). */
export function MarketChartProvider({ children }) {
  const value = useStockPriceRefresh();
  return (
    <MarketChartContext.Provider value={value}>
      {children}
    </MarketChartContext.Provider>
  );
}

export function useMarketChart() {
  const ctx = useContext(MarketChartContext);
  if (!ctx) {
    throw new Error("useMarketChart must be used within MarketChartProvider");
  }
  return ctx;
}
