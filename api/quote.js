import { fetchQuote } from "../server/marketApi.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const symbol = req.query?.symbol;
  const apiKey = process.env.FINNHUB_API_KEY?.trim();

  if (!apiKey) {
    res.status(503).json({
      error: "FINNHUB_API_KEY is not set. Add it in your host’s environment variables.",
    });
    return;
  }

  try {
    const data = await fetchQuote(symbol, apiKey);
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: e.message || "Quote request failed" });
  }
}
