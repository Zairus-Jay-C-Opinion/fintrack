import { fetchChartHistory } from "../server/marketApi.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const symbol = req.query?.symbol;
  const days = Math.min(180, Math.max(7, Number(req.query?.days) || 90));

  try {
    const points = await fetchChartHistory(symbol, days);
    res.status(200).json({ points });
  } catch (e) {
    res.status(502).json({ error: e.message || "Chart request failed" });
  }
}
