import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Chart & quote cache — persisted so it survives tab changes on desktop and mobile. */
export const useMarketStore = create(
  persist(
    (set) => ({
      priceHistory: {},
      chartTicker: "",
      lastRefresh: null,
      quoteErrors: {},
      chartErrors: {},
      priceFallbacks: {},
      loading: false,

      setMarket: (patch) => set((state) => ({ ...state, ...patch })),

      clearMarketMessages: () =>
        set({ quoteErrors: {}, chartErrors: {}, priceFallbacks: {} }),
    }),
    {
      name: "fintrack-market",
      partialize: (state) => ({
        priceHistory: state.priceHistory,
        chartTicker: state.chartTicker,
        lastRefresh: state.lastRefresh,
      }),
    }
  )
);
