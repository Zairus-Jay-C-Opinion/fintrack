import { useMemo } from "react";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import StatCard from "../components/cards/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { chartTheme } from "../constants/chartTheme";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useNetWorth } from "../hooks/useNetWorth";
import { formatPhp } from "../utils/currency";
import { formatPercent } from "../utils/formatters";
import { subMonths, format } from "date-fns";

export default function Analytics() {
  const transactions = useFinanceStore((s) => s.transactions);
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const savingsEntries = useFinanceStore((s) => s.savingsEntries);
  const { netWorth, allocation, allocAmounts } = useNetWorth();
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);

  const healthScore = useMemo(() => {
    const targetInv = allocation.investments;
    const targetSave = allocation.savings;
    const actualInv =
      purchases.length > 0 ? 1 : monthlyIncome > 0 ? 0.5 : 0;
    const actualSave = savingsEntries.length > 0 ? 1 : 0.5;
    const score = ((actualInv >= targetInv ? 50 : 25) + (actualSave >= targetSave ? 50 : 25));
    return Math.min(100, Math.round(score));
  }, [allocation, purchases, savingsEntries, monthlyIncome]);

  const monthlyMetrics = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const key = format(d, "yyyy-MM");
      const label = format(d, "MMM");
      const spent = transactions
        .filter((t) => t.date?.startsWith(key))
        .reduce((s, t) => s + (t.type === "expense" ? t.amount : 0), 0);
      const invested = purchases
        .filter((p) => p.date?.startsWith(key))
        .reduce((s, p) => s + p.totalPHP, 0);
      const saved = savingsEntries
        .filter((e) => e.date?.startsWith(key) && e.type === "deposit")
        .reduce((s, e) => s + e.amount, 0);
      return {
        month: label,
        savingsRate: monthlyIncome > 0 ? (saved / monthlyIncome) * 100 : allocation.savings * 100,
        investmentRate: monthlyIncome > 0 ? (invested / monthlyIncome) * 100 : 0,
        targetSavings: allocation.savings * 100,
        targetInvest: allocation.investments * 100,
        spending: spent || monthlyIncome * allocation.spending,
      };
    });
  }, [transactions, purchases, savingsEntries, monthlyIncome, allocation]);

  const netWorthHistory = useMemo(() => {
    let cumulative = 0;
    const points = [...purchases, ...savingsEntries]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => {
        cumulative += item.totalPHP ?? item.amount ?? 0;
        return {
          date: format(new Date(item.date), "MMM yy"),
          netWorth: cumulative,
        };
      });
    if (points.length === 0) {
      return [{ date: "Now", netWorth }];
    }
    points.push({ date: "Now", netWorth });
    return points;
  }, [purchases, savingsEntries, netWorth]);

  return (
    <>
      <TopBar
        title="Analytics"
        subtitle="Track savings rate, allocation adherence, and net worth growth"
      />

      <PageHelp title="How Analytics works">
        <p>
          Compares what you actually logged (expenses, savings entries, purchases)
          against your allocation targets over time. Health score is a simple
          checklist — not financial advice.
        </p>
      </PageHelp>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Financial Health"
          value={`${healthScore}/100`}
          sub={healthScore >= 80 ? "On track" : "Room to improve"}
        />
        <StatCard
          label="Target savings rate"
          value={formatPercent(allocation.savings)}
        />
        <StatCard
          label="Target investment rate"
          value={formatPercent(allocation.investments)}
        />
        <StatCard label="Current net worth" value={formatPhp(netWorth)} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="card min-h-[280px]">
          <h3 className="mb-4 font-display text-lg font-semibold text-white">
            Savings & investment rates
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="month" stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
              <YAxis stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
              <Line type="monotone" dataKey="savingsRate" name="Savings %" stroke={chartTheme.gain} strokeWidth={2} />
              <Line type="monotone" dataKey="investmentRate" name="Invest %" stroke={chartTheme.primary} strokeWidth={2} />
              <Line type="monotone" dataKey="targetSavings" name="Target save" stroke={chartTheme.gain} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="targetInvest" name="Target invest" stroke={chartTheme.primary} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card min-h-[280px]">
          <h3 className="mb-4 font-display text-lg font-semibold text-white">
            Net worth progression
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={netWorthHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="date" stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
              <YAxis stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
              <Tooltip formatter={(v) => formatPhp(v)} contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
              <Area type="monotone" dataKey="netWorth" stroke={chartTheme.primary} fill={chartTheme.primary} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display text-lg font-semibold text-white">
          Allocation targets vs monthly plan
        </h3>
        <ul className="mt-4 space-y-3">
          {[
            { label: "Investments", target: allocAmounts.investments, pct: allocation.investments },
            { label: "Savings", target: allocAmounts.savings, pct: allocation.savings },
            { label: "Spending", target: allocAmounts.spending, pct: allocation.spending },
          ].map((row) => (
            <li key={row.label} className="flex items-center justify-between border-b border-accent/50 pb-2">
              <span>{row.label}</span>
              <span className="font-mono text-white">
                {formatPhp(row.target)} ({formatPercent(row.pct)})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
