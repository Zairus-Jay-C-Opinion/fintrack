import { useState, useMemo } from "react";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import ProjectionLineChart from "../components/charts/ProjectionLineChart";
import Input from "../components/ui/Input";
import Tabs from "../components/ui/Tabs";
import { useProjections } from "../hooks/useProjections";
import { useSettingsStore } from "../store/useSettingsStore";
import { futureValueDCA, monthsToReachGoal } from "../utils/finance";
import { formatPhp, usdToPhp } from "../utils/currency";
import { formatHorizonLabel } from "../utils/formatHorizon";

const horizonTabs = [
  { id: "360", label: "30 years" },
  { id: "240", label: "20 years" },
  { id: "120", label: "10 years" },
  { id: "60", label: "5 years" },
  { id: "12", label: "1 year" },
];

export default function Forecasting() {
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const allocation = useSettingsStore((s) => s.allocation);
  const phpUsdRate = useSettingsStore((s) => s.phpUsdRate);

  const [monthlyContrib, setMonthlyContrib] = useState(
    monthlyIncome * allocation.investments
  );
  const [annualRate, setAnnualRate] = useState(10);
  const [horizon, setHorizon] = useState("360");
  const [goalTarget, setGoalTarget] = useState(1000000);
  const [scenarioB, setScenarioB] = useState(monthlyIncome * 0.5);
  const [scenarioC, setScenarioC] = useState(monthlyIncome * 0.8);
  const [fxRate, setFxRate] = useState(phpUsdRate);

  const horizonMonths = parseInt(horizon, 10);
  const horizonLabel = formatHorizonLabel(horizonMonths);

  const { chartData, projectionSeries, yearlyBreakdown, currentValuePhp } =
    useProjections({
      monthlyContrib,
      annualRate: annualRate / 100,
      months: horizonMonths,
    });

  const monthsToGoal = monthsToReachGoal(
    monthlyContrib,
    annualRate / 100,
    goalTarget,
    currentValuePhp
  );

  const scenarioData = useMemo(() => {
    const months = horizonMonths;
    const r = annualRate / 100;
    const points = [];
    for (let m = 0; m <= months; m += Math.max(1, Math.floor(months / 40))) {
      const years = m / 12;
      const contribA = monthlyContrib / phpUsdRate;
      const contribB = scenarioB / phpUsdRate;
      const contribC = scenarioC / phpUsdRate;
      const cv = currentValuePhp / phpUsdRate;
      points.push({
        year: years === 0 ? "Now" : years < 1 ? `${m} mo` : `${years.toFixed(0)} yr`,
        base: usdToPhp(futureValueDCA(contribA, r, m, cv), phpUsdRate),
        moderate: usdToPhp(futureValueDCA(contribB, r, m, cv), phpUsdRate),
        aggressive: usdToPhp(futureValueDCA(contribC, r, m, cv), phpUsdRate),
      });
    }
    return points;
  }, [
    horizonMonths,
    annualRate,
    monthlyContrib,
    scenarioB,
    scenarioC,
    currentValuePhp,
    phpUsdRate,
  ]);

  const fxImpact = useMemo(() => {
    const months = 120;
    const r = annualRate / 100;
    const contribUsd = monthlyContrib / fxRate;
    const cvUsd = currentValuePhp / fxRate;
    return [
      { rate: fxRate - 5, label: `${(fxRate - 5).toFixed(0)}` },
      { rate: fxRate, label: `${fxRate.toFixed(0)}` },
      { rate: fxRate + 5, label: `${(fxRate + 5).toFixed(0)}` },
    ].map(({ rate, label }) => ({
      label,
      value: usdToPhp(futureValueDCA(contribUsd, r, months, cvUsd), rate),
    }));
  }, [fxRate, monthlyContrib, annualRate, currentValuePhp]);

  return (
    <>
      <TopBar
        title="Forecasting"
        subtitle="Simulate long-term wealth with DCA and compound growth"
      />

      <PageHelp title="How Forecasting works">
        <p>
          Projects your <strong className="text-text-primary">investment</strong>{" "}
          portfolio using compound growth + monthly DCA. Savings bank interest is
          on the Savings tab. Assumes steady returns — real markets vary.
        </p>
      </PageHelp>

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <Input
          label="Monthly contribution (PHP)"
          type="number"
          value={monthlyContrib}
          onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Expected annual return (%)"
          type="number"
          value={annualRate}
          onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Goal amount (PHP)"
          type="number"
          value={goalTarget}
          onChange={(e) => setGoalTarget(parseFloat(e.target.value) || 0)}
        />
        <div className="card flex flex-col justify-center">
          <p className="text-sm text-text-secondary">Time to reach goal</p>
          <p className="font-mono text-xl text-white">
            {monthsToGoal != null
              ? `${(monthsToGoal / 12).toFixed(1)} years`
              : "50+ years"}
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Portfolio projection
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Showing growth over <span className="text-highlight">{horizonLabel}</span> — X-axis is years from today
            </p>
          </div>
        </div>
        <Tabs tabs={horizonTabs} active={horizon} onChange={setHorizon} />
        <div className="mt-4">
          <ProjectionLineChart data={chartData} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs text-text-secondary">
            Projected value at end of {horizonLabel}
          </p>
          <div className="flex flex-wrap gap-4">
            {projectionSeries.map((p) => (
              <div
                key={p.months}
                className="rounded-[var(--radius-md)] border border-accent bg-bg-deepest px-4 py-2"
              >
                <span className="text-xs text-text-secondary">{p.label}</span>
                <p className="font-mono text-white">{formatPhp(p.valuePhp)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-display text-lg font-semibold text-white">
            Scenario comparison
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Compare different monthly contribution amounts over {horizonLabel}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              label="Scenario B (PHP/mo)"
              type="number"
              value={scenarioB}
              onChange={(e) => setScenarioB(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Scenario C (PHP/mo)"
              type="number"
              value={scenarioC}
              onChange={(e) => setScenarioC(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="mt-4 h-[260px]">
            <ProjectionLineChart
              data={scenarioData}
              lines={[
                { dataKey: "base", name: "Current", color: "#5B8FA8" },
                { dataKey: "moderate", name: "Moderate", color: "#D4A843" },
                { dataKey: "aggressive", name: "Higher", color: "#4CAF7D" },
              ]}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="font-display text-lg font-semibold text-white">
            Currency impact (10 years @ varying PHP/USD)
          </h3>
          <Input
            className="mt-4"
            label="Simulated rate"
            type="number"
            value={fxRate}
            onChange={(e) => setFxRate(parseFloat(e.target.value) || phpUsdRate)}
          />
          <ul className="mt-4 space-y-2">
            {fxImpact.map((row) => (
              <li
                key={row.label}
                className="flex justify-between font-mono text-sm"
              >
                <span className="text-text-secondary">₱{row.label}/USD</span>
                <span className="text-white">{formatPhp(row.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-display text-lg font-semibold text-white">
          Year-by-year breakdown
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          First 15 years of the {horizonLabel} projection
        </p>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-accent text-text-secondary">
              <th className="pb-2 pr-4">Year</th>
              <th className="pb-2 pr-4">Portfolio (PHP)</th>
              <th className="pb-2">Contributed (USD est.)</th>
            </tr>
          </thead>
          <tbody>
            {yearlyBreakdown.slice(0, 15).map((row) => (
              <tr key={row.year} className="border-b border-accent/50">
                <td className="py-2 pr-4">Year {row.year}</td>
                <td className="py-2 pr-4 font-mono text-gain">
                  {formatPhp(row.valuePhp)}
                </td>
                <td className="py-2 font-mono text-text-secondary">
                  $
                  {row.contributed.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
