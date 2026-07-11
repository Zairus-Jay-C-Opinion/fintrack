import { useState, useMemo } from "react";
import { Pencil, Trash2, Receipt, Wallet, Target, PiggyBank } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import StatCard from "../components/cards/StatCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import AddExpenseForm from "../components/forms/AddExpenseForm";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { formatPhp } from "../utils/currency";
import { formatDate } from "../utils/formatters";
import {
  sumExpenses,
  groupExpensesByCategory,
  getMonthKey,
} from "../utils/expenses";
import { format, parseISO } from "date-fns";
import { analyzeReceipt } from "../utils/geminiVision";
import { Camera, Image, Loader2 } from "lucide-react";
import { useRef } from "react";

function BudgetBar({ label, spent, budget, hint }) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const over = spent > budget;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className={`font-mono ${over ? "text-loss" : "text-text-primary"}`}>
          {formatPhp(spent)} / {formatPhp(budget)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-loss" : "bg-highlight"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        {over
          ? `${formatPhp(spent - budget)} over this budget`
          : `${formatPhp(budget - spent)} remaining`}
      </p>
      {hint && <p className="mt-1 text-xs text-text-secondary/80">{hint}</p>}
    </div>
  );
}

export default function Expenses() {
  const transactions = useFinanceStore((s) => s.transactions);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const removeTransaction = useFinanceStore((s) => s.removeTransaction);
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const allocation = useSettingsStore((s) => s.allocation);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const monthKey = getMonthKey();

  const spent = sumExpenses(transactions, monthKey);
  const investmentBudget = monthlyIncome * allocation.investments;
  const savingsBudget = monthlyIncome * allocation.savings;
  const spendingBudget = monthlyIncome * allocation.spending;
  const byCategory = groupExpensesByCategory(transactions, monthKey);

  const monthExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense" && t.date?.startsWith(monthKey))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, monthKey]
  );

  const monthLabel = format(parseISO(`${monthKey}-01`), "MMMM yyyy");

  const handleSubmit = (expense) => {
    if (editing && !editing.isNew) {
      updateTransaction(editing.id, expense);
    } else {
      addTransaction(expense);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const openLog = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleScanClick = () => {
    const wantsToScan = window.confirm(
      "FinTrack needs access to your camera to scan the receipt. Proceed?"
    );
    if (wantsToScan) {
      fileInputRef.current?.click();
    }
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be scanned again if needed
    e.target.value = "";
    setIsScanning(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      const result = await analyzeReceipt(base64Image, file.type);
      
      // Open the modal pre-filled with the scanned data
      setEditing({ ...result, isNew: true });
      setModalOpen(true);
    } catch (err) {
      alert("Failed to scan receipt: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="page-shell">
      <TopBar title="Expenses" subtitle={`${monthLabel} spending`} />

      <PageHelp title="How budgets work">
        <p>
          Your ₱{monthlyIncome.toLocaleString()} income is split into three
          separate buckets — they do not add together:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs">
          <li>
            Investments {(allocation.investments * 100).toFixed(0)}% ={" "}
            {formatPhp(investmentBudget)}
          </li>
          <li>
            Savings {(allocation.savings * 100).toFixed(0)}% ={" "}
            {formatPhp(savingsBudget)}
          </li>
          <li>
            Spending {(allocation.spending * 100).toFixed(0)}% ={" "}
            {formatPhp(spendingBudget)} ← only this bucket is tracked here
          </li>
        </ul>
        <p className="mt-2">
          Log purchases here to see how much of your spending allowance you have
          left. Savings and investments are managed on their own tabs.
        </p>
      </PageHelp>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Receipt} label="Spent this month" value={formatPhp(spent)} />
        <StatCard
          icon={Target}
          label="Spending budget"
          value={formatPhp(spendingBudget)}
          sub={`${(allocation.spending * 100).toFixed(0)}% of income`}
        />
        <StatCard
          icon={PiggyBank}
          label="Savings target (monthly)"
          value={formatPhp(savingsBudget)}
          sub="Set aside on payday — separate from expenses"
        />
        <StatCard
          icon={Wallet}
          label="Left to spend"
          value={formatPhp(Math.max(0, spendingBudget - spent))}
          sub={spent > spendingBudget ? "Over spending budget" : "On track"}
        />
      </div>

      <div className="card mb-6 space-y-5">
        <h3 className="font-display text-lg font-semibold text-white">
          Spending budget
        </h3>
        <BudgetBar
          label={`Purchases vs. spending allowance (${(allocation.spending * 100).toFixed(0)}%)`}
          spent={spent}
          budget={spendingBudget}
          hint="Only money in this bucket is for day-to-day purchases."
        />
        {spent > spendingBudget && (
          <p className="rounded-[var(--radius-sm)] border border-loss/40 bg-loss/10 px-3 py-2 text-sm text-loss">
            You&apos;ve exceeded your spending allowance. That extra may be coming
            from savings or money meant for investments.
          </p>
        )}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-white">
            Purchase log
          </h3>
          {monthExpenses.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-text-secondary/60">
                <Receipt className="h-8 w-8" />
              </div>
              <h4 className="mb-1 font-medium text-white">No expenses yet</h4>
              <p className="text-sm text-text-secondary">
                Log your first purchase for {monthLabel} to see it here.
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-text-secondary">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Item</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="w-20 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {monthExpenses.map((e) => (
                    <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-3 py-3 text-text-secondary">{formatDate(e.date)}</td>
                      <td className="px-3 py-3 text-white">
                        {e.item || e.note || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-text-secondary">
                          {e.category || "Other"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-loss">
                        {formatPhp(e.amount)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(e);
                              setModalOpen(true);
                            }}
                            className="rounded-full p-1.5 text-text-secondary hover:bg-white/5 hover:text-white"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Delete this expense?"))
                                removeTransaction(e.id);
                            }}
                            className="rounded-full p-1.5 text-text-secondary hover:bg-loss/10 hover:text-loss"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3 sm:items-center">
            <Button size="sm" onClick={openLog} className="w-full sm:w-auto justify-center">
              Log purchase
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={handleScanClick}
                disabled={isScanning}
                className="flex flex-1 items-center justify-center gap-2 sm:flex-none"
              >
                {isScanning ? (
                  <><Loader2 className="animate-spin" size={16} /> Scanning</>
                ) : (
                  <><Camera size={16} /> Scan</>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={handleUploadClick}
                disabled={isScanning}
                className="flex flex-1 items-center justify-center gap-2 sm:flex-none"
              >
                <Image size={16} /> Upload
              </Button>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              accept="image/*"
              ref={uploadInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="font-display text-lg font-semibold text-white">
            By category
          </h3>
          <ul className="mt-4 space-y-2">
            {byCategory.length === 0 ? (
              <li className="text-sm text-text-secondary">No data yet</li>
            ) : (
              byCategory.map(({ category, amount }) => (
                <li key={category} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{category}</span>
                  <span className="font-mono text-white">{formatPhp(amount)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing && !editing.isNew ? "Edit expense" : "Log a purchase"}
      >
        <AddExpenseForm
          key={editing?.id ?? "new"}
          formId="add-expense-form"
          initialData={editing}
          submitLabel={editing && !editing.isNew ? "Save changes" : "Log purchase"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
