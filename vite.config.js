import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fetchQuote, fetchChartHistory } from "./server/marketApi.js";

function marketApiDevPlugin(finnhubKey) {
  return {
    name: "fintrack-market-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "/", "http://localhost");

        if (url.pathname === "/api/quote" && req.method === "GET") {
          const symbol = url.searchParams.get("symbol");
          if (!finnhubKey) {
            res.statusCode = 503;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error:
                  "FINNHUB_API_KEY missing. Copy .env.example to .env and add your key.",
              })
            );
            return;
          }
          try {
            const data = await fetchQuote(symbol, finnhubKey);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        if (url.pathname === "/api/stock-chart" && req.method === "GET") {
          const symbol = url.searchParams.get("symbol");
          const days = Math.min(
            180,
            Math.max(7, Number(url.searchParams.get("days")) || 90)
          );
          try {
            const points = await fetchChartHistory(symbol, days);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ points }));
          } catch (e) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const finnhubKey = (env.FINNHUB_API_KEY || env.VITE_FINNHUB_API_KEY || "").trim();

  return {
    plugins: [react(), marketApiDevPlugin(finnhubKey)],
  };
});
