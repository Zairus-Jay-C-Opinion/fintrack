import { create } from "zustand";

/** Chart & quote cache — survives tab changes (global Zustand, not tied to Investments mount). */
export const useMarketStore = create((set) => ({
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
}));
