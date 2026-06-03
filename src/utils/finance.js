export function futureValueDCA(
  monthlyContrib,
  annualRate,
  months,
  currentValue = 0
) {
  const r = annualRate / 12;
  if (r === 0) return currentValue + monthlyContrib * months;
  const FV_existing = currentValue * Math.pow(1 + r, months);
  const FV_contributions =
    monthlyContrib * ((Math.pow(1 + r, months) - 1) / r);
  return FV_existing + FV_contributions;
}

export function monthsToReachGoal(
  monthlyContrib,
  annualRate,
  target,
  currentValue = 0
) {
  if (monthlyContrib <= 0 && currentValue >= target) return 0;
  let months = 0;
  let value = currentValue;
  const maxMonths = 12 * 50;
  while (value < target && months < maxMonths) {
    months += 1;
    value = futureValueDCA(monthlyContrib, annualRate, months, currentValue);
  }
  return months <= maxMonths ? months : null;
}

export function getHoldingsSummary(purchases, etfPrices) {
  const byTicker = {};
  for (const p of purchases) {
    if (!byTicker[p.ticker]) {
      byTicker[p.ticker] = { shares: 0, costBasis: 0, assetType: p.assetType || "Stock" };
    }
    byTicker[p.ticker].shares += p.shares;
    byTicker[p.ticker].costBasis += p.totalUSD;
    if (p.assetType) byTicker[p.ticker].assetType = p.assetType;
  }
  return Object.entries(byTicker).map(([ticker, data]) => {
    const price = etfPrices[ticker] ?? 0;
    const currentValue = data.shares * price;
    const gain = currentValue - data.costBasis;
    const gainPct = data.costBasis > 0 ? (gain / data.costBasis) * 100 : 0;
    return {
      ticker,
      assetType: data.assetType,
      shares: data.shares,
      avgCost: data.shares > 0 ? data.costBasis / data.shares : 0,
      costBasis: data.costBasis,
      currentPrice: price,
      currentValue,
      gain,
      gainPct,
    };
  });
}

export function getTotalInvestedUSD(purchases) {
  return purchases.reduce((sum, p) => sum + p.totalUSD, 0);
}

export function getPortfolioValueUSD(purchases, etfPrices) {
  return getHoldingsSummary(purchases, etfPrices).reduce(
    (sum, h) => sum + h.currentValue,
    0
  );
}

export function getNextPayday(paydays) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const candidates = [];
  for (let m = 0; m <= 2; m++) {
    const d = new Date(year, month + m, 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    for (const day of paydays) {
      const payday = Math.min(day, lastDay);
      const date = new Date(d.getFullYear(), d.getMonth(), payday);
      if (date >= today) candidates.push(date);
    }
  }
  candidates.sort((a, b) => a - b);
  return candidates[0] ?? null;
}

export function daysUntil(date) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}
