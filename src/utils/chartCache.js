const STORAGE_KEY = "fintrack-chart-v1";

const empty = () => ({
  priceHistory: {},
  chartTicker: "",
  lastRefresh: null,
});

let memory = empty();
const listeners = new Set();

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return {
      priceHistory: parsed.priceHistory ?? {},
      chartTicker: parsed.chartTicker ?? "",
      lastRefresh: parsed.lastRefresh ?? null,
    };
  } catch {
    return empty();
  }
}

function readFinancePersist() {
  try {
    const raw = localStorage.getItem("fintrack-data");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const s = parsed?.state;
    if (!s?.marketPriceHistory || !Object.keys(s.marketPriceHistory).length) {
      return null;
    }
    return {
      priceHistory: s.marketPriceHistory,
      chartTicker: s.marketChartTicker ?? "",
      lastRefresh: s.marketLastRefresh ?? null,
    };
  } catch {
    return null;
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

export function initChartCache() {
  memory = readStorage();
  if (Object.keys(memory.priceHistory).length === 0) {
    const fromFinance = readFinancePersist();
    if (fromFinance) {
      memory = fromFinance;
      writeStorage(memory);
    }
  }
}

export function getChartCache() {
  return memory;
}

export function setChartCache(patch) {
  memory = {
    priceHistory: patch.priceHistory ?? memory.priceHistory,
    chartTicker: patch.chartTicker ?? memory.chartTicker,
    lastRefresh: patch.lastRefresh ?? memory.lastRefresh,
  };
  writeStorage(memory);
  listeners.forEach((fn) => fn());
}

export function subscribeChartCache(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** First ticker in list that has chart points, else fallback. */
export function resolveChartTicker(tickers, chartTicker, priceHistory) {
  if (chartTicker && priceHistory?.[chartTicker]?.length) return chartTicker;
  for (const t of tickers) {
    if (priceHistory?.[t]?.length) return t;
  }
  return chartTicker || tickers[0] || "";
}
