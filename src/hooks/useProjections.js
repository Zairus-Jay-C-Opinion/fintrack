import { useMemo } from "react";
import { futureValueDCA } from "../utils/finance";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { getPortfolioValueUSD } from "../utils/finance";
import { usdToPhp } from "../utils/currency";
import { formatHorizonLabel, formatHorizonShort } from "../utils/formatHorizon";

const HORIZONS = [
  { label: "1 year", short: "1Y", months: 12 },
  { label: "5 years", short: "5Y", months: 60 },
  { label: "10 years", short: "10Y", months: 120 },
  { label: "20 years", short: "20Y", months: 240 },
  { label: "30 years", short: "30Y", months: 360 },
];

export function useProjections({
  monthlyContrib,
  annualRate = 0.1,
  months: customMonths,
} = {}) {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const etfPrices = useFinanceStore((s) => s.etfPrices);
  const allocation = useSettingsStore((s) => s.allocation);
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const phpUsdRate = useSettingsStore((s) => s.phpUsdRate);

  const contrib =
    monthlyContrib ?? monthlyIncome * allocation.investments;
  const currentUsd = getPortfolioValueUSD(purchases, etfPrices);
  const currentPhp = usdToPhp(currentUsd, phpUsdRate);

  const projectionSeries = useMemo(() => {
    const monthsList = customMonths
      ? [
          {
            label: formatHorizonLabel(customMonths),
            short: formatHorizonShort(customMonths),
            months: customMonths,
          },
        ]
      : HORIZONS;
    return monthsList.map(({ label, short, months }) => ({
      label,
      short,
      months,
      valuePhp: usdToPhp(
        futureValueDCA(contrib / phpUsdRate, annualRate, months, currentUsd),
        phpUsdRate
      ),
      valueUsd: futureValueDCA(
        contrib / phpUsdRate,
        annualRate,
        months,
        currentUsd
      ),
    }));
  }, [contrib, annualRate, currentUsd, phpUsdRate, customMonths]);

  const yearlyBreakdown = useMemo(() => {
    const years = customMonths ? Math.ceil(customMonths / 12) : 30;
    const rows = [];
    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      rows.push({
        year: y,
        valueUsd: futureValueDCA(
          contrib / phpUsdRate,
          annualRate,
          months,
          currentUsd
        ),
        valuePhp: usdToPhp(
          futureValueDCA(
            contrib / phpUsdRate,
            annualRate,
            months,
            currentUsd
          ),
          phpUsdRate
        ),
        contributed: (contrib / phpUsdRate) * months + currentUsd,
      });
    }
    return rows;
  }, [contrib, annualRate, currentUsd, phpUsdRate, customMonths]);

  const chartData = useMemo(() => {
    const points = [];
    const totalMonths = customMonths ?? 360;
    for (let m = 0; m <= totalMonths; m += Math.max(1, Math.floor(totalMonths / 60))) {
      const years = m / 12;
      points.push({
        month: m,
        year: years === 0 ? "Now" : years < 1 ? `${m} mo` : `${years.toFixed(0)} yr`,
        value: usdToPhp(
          futureValueDCA(contrib / phpUsdRate, annualRate, m, currentUsd),
          phpUsdRate
        ),
      });
    }
    return points;
  }, [contrib, annualRate, currentUsd, phpUsdRate, customMonths]);

  return {
    monthlyContrib: contrib,
    currentValuePhp: currentPhp,
    currentValueUsd: currentUsd,
    projectionSeries,
    yearlyBreakdown,
    chartData,
  };
}
