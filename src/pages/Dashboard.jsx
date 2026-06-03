import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import StatCard from "../components/cards/StatCard";
import AllocationCard from "../components/cards/AllocationCard";
import NetWorthCard from "../components/cards/NetWorthCard";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import PortfolioGrowthChart from "../components/charts/PortfolioGrowthChart";
import { useNetWorth } from "../hooks/useNetWorth";
import { useSettingsStore } from "../store/useSettingsStore";
import { useFinanceStore } from "../store/useFinanceStore";
import { formatPhp } from "../utils/currency";
import { getNextPayday, daysUntil } from "../utils/finance";
import { format } from "date-fns";
import { Calendar, ArrowRight } from "lucide-react";
import { useMemo } from "react";

export default function Dashboard() {
  const {
    netWorth,
    savingsBalance,
    investmentPhp,
    allocAmounts,
    allocation,
    cashOnHand,
  } = useNetWorth();
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const paydays = useSettingsStore((s) => s.paydays);
  const paydayLabel =
    paydays.length === 1
      ? `Paid on day ${paydays[0]}`
      : paydays.length > 1
        ? `Paid on days ${paydays.join(" & ")}`
        : "Set payday in Settings";
  const transactions = useFinanceStore((s) => s.transactions);
  const purchases = useFinanceStore((s) => s.investmentPurchases);

  const nextPayday = getNextPayday(paydays);
  const days = daysUntil(nextPayday);

  const portfolioChartData = useMemo(() => {
    const sorted = [...purchases].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let cumulative = 0;
    return sorted.map((p) => {
      cumulative += p.totalPHP;
      return {
        label: format(new Date(p.date), "MMM yy"),
        value: cumulative,
      };
    });
  }, [purchases]);

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="Your complete financial picture at a glance"
      />

      <PageHelp title="How the Dashboard works">
        <p>
          Net worth = cash + savings balance + investments (in PHP). Income is
          split by your allocation % into investments, savings, and spending —
          each bucket is separate. Charts summarize trends; log data on other
          tabs to populate them.
        </p>
      </PageHelp>

      <div className="mb-6">
        <NetWorthCard
          netWorth={netWorth}
          breakdown={[
            { label: "Cash", value: formatPhp(cashOnHand) },
            { label: "Savings", value: formatPhp(savingsBalance) },
            { label: "Investments", value: formatPhp(investmentPhp) },
          ]}
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Total Net Worth"
          value={formatPhp(netWorth)}
        />
        <StatCard
          index={1}
          label="This Month's Income"
          value={formatPhp(monthlyIncome)}
          sub={paydayLabel}
        />
        <StatCard
          index={2}
          label="Savings Balance"
          value={formatPhp(savingsBalance)}
        />
        <StatCard
          index={3}
          label="Investment Value"
          value={formatPhp(investmentPhp)}
          sub="PHP equivalent"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <AllocationCard allocation={allocation} amounts={allocAmounts} />
        <MonthlyBarChart
          monthlyIncome={monthlyIncome}
          transactions={transactions}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PortfolioGrowthChart data={portfolioChartData} />
        </div>
        <div className="card flex flex-col justify-center">
          <div className="flex items-center gap-2 text-highlight">
            <Calendar size={20} />
            <span className="font-display font-semibold text-white">
              Next Payday
            </span>
          </div>
          {nextPayday ? (
            <>
              <p className="mt-4 font-mono text-3xl text-white">
                {days} {days === 1 ? "day" : "days"}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {format(nextPayday, "EEEE, MMM d")}
              </p>
              <div className="mt-6 rounded-[var(--radius-md)] border border-accent bg-bg-deepest p-4">
                <p className="text-xs text-text-secondary">Recommended action</p>
                <p className="mt-2 text-sm text-text-primary">
                  Allocate {formatPhp(allocAmounts.investments)} to ETF DCA and{" "}
                  {formatPhp(allocAmounts.savings)} to GoTyme savings.
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-highlight">
                  <ArrowRight size={14} /> Review on Investments page
                </p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-text-secondary">Configure paydays in Settings</p>
          )}
        </div>
      </div>
    </>
  );
}
