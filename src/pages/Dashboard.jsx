import { Link } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import StatCard from "../components/cards/StatCard";
import AllocationCard from "../components/cards/AllocationCard";
import NetWorthCard from "../components/cards/NetWorthCard";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import AIFinancialAdvisorCard from "../components/cards/AIFinancialAdvisorCard";
import { useNetWorth } from "../hooks/useNetWorth";
import { useSettingsStore } from "../store/useSettingsStore";
import { useFinanceStore } from "../store/useFinanceStore";
import { formatPhp } from "../utils/currency";
import { formatDate } from "../utils/formatters";
import { getNextPayday, daysUntil } from "../utils/finance";
import { sumExpenses, getMonthKey } from "../utils/expenses";
import { format } from "date-fns";
import {
  Calendar,
  ArrowRight,
  Receipt,
  ChevronRight,
  Plus,
} from "lucide-react";
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

  const nextPayday = getNextPayday(paydays);
  const days = daysUntil(nextPayday);

  const spentThisMonth = sumExpenses(transactions, getMonthKey());

  const recentTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    [transactions]
  );

  return (
    <div>
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

      <div className="mb-4 lg:hidden">
        <NetWorthCard
          netWorth={netWorth}
          breakdown={[
            { label: "Cash", value: formatPhp(cashOnHand) },
            { label: "Savings", value: formatPhp(savingsBalance) },
            { label: "Investments", value: formatPhp(investmentPhp) },
          ]}
          action={
            <Link
              to="/expenses"
              title="Log expense"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-bg-deepest shadow-lg transition-transform hover:scale-105"
            >
              <Plus size={18} />
            </Link>
          }
        />
      </div>

      <div className="mb-4">
        <AIFinancialAdvisorCard
          netWorth={netWorth}
          cashOnHand={cashOnHand}
          savingsBalance={savingsBalance}
          investmentPhp={investmentPhp}
          monthlyIncome={monthlyIncome}
          allocation={allocation}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <MonthlyBarChart
            monthlyIncome={monthlyIncome}
            transactions={transactions}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <AllocationCard allocation={allocation} amounts={allocAmounts} />
            <StatCard
              icon={Calendar}
              label="This Month's Income"
              value={formatPhp(monthlyIncome)}
              sub={paydayLabel}
            />
            <StatCard
              icon={Receipt}
              label="Spent this month"
              value={formatPhp(spentThisMonth)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="hidden lg:block">
            <NetWorthCard
              netWorth={netWorth}
              breakdown={[
                { label: "Cash", value: formatPhp(cashOnHand) },
                { label: "Savings", value: formatPhp(savingsBalance) },
                { label: "Investments", value: formatPhp(investmentPhp) },
              ]}
              action={
                <Link
                  to="/expenses"
                  title="Log expense"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-bg-deepest shadow-lg transition-transform hover:scale-105"
                >
                  <Plus size={18} />
                </Link>
              }
            />
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-white">
                Transactions
              </h3>
              <Link
                to="/expenses"
                className="flex items-center gap-0.5 text-xs text-highlight hover:underline"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <ul className="space-y-3">
              {recentTransactions.length === 0 ? (
                <li className="text-sm text-text-secondary">
                  No transactions yet
                </li>
              ) : (
                recentTransactions.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-secondary">
                      <Receipt size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">
                        {t.item || t.note || t.category || "Expense"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatDate(t.date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-loss">
                      -{formatPhp(t.amount)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card border-highlight/20 bg-gradient-to-br from-highlight/10 to-transparent">
            <div className="flex items-center gap-2 text-highlight">
              <Calendar size={20} />
              <span className="font-display font-semibold text-white">
                Next Payday
              </span>
            </div>
            {nextPayday ? (
              <>
                <p className="mt-4 text-3xl text-white">
                  {days} {days === 1 ? "day" : "days"}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {format(nextPayday, "EEEE, MMM d")}
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
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
      </div>
    </div>
  );
}
