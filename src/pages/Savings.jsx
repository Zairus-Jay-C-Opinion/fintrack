import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, PiggyBank, Target, ShieldCheck, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import StatCard from "../components/cards/StatCard";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Tabs from "../components/ui/Tabs";
import SavingsInterestChart from "../components/charts/SavingsInterestChart";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { formatPhp } from "../utils/currency";
import { formatDate } from "../utils/formatters";
import { format } from "date-fns";
import { PH_BANKS } from "../constants/banks";
import { useBankName } from "../hooks/useBankName";
import { projectSavingsGrowth } from "../utils/savingsInterest";

const horizonTabs = [
  { id: "6", label: "6 months" },
  { id: "12", label: "1 year" },
  { id: "24", label: "2 years" },
  { id: "60", label: "5 years" },
];

export default function Savings() {
  const savingsBalance = useFinanceStore((s) => s.savingsBalance);
  const savingsEntries = useFinanceStore((s) => s.savingsEntries);
  const addSavingsEntry = useFinanceStore((s) => s.addSavingsEntry);
  const updateSavingsEntry = useFinanceStore((s) => s.updateSavingsEntry);
  const removeSavingsEntry = useFinanceStore((s) => s.removeSavingsEntry);
  const savingsInterestRate = useFinanceStore((s) => s.savingsInterestRate);
  const setSavingsInterestRate = useFinanceStore((s) => s.setSavingsInterestRate);
  const emergencyFund = useFinanceStore((s) => s.emergencyFund);
  const setEmergencyFund = useFinanceStore((s) => s.setEmergencyFund);
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const allocation = useSettingsStore((s) => s.allocation);
  const savingsBank = useSettingsStore((s) => s.savingsBank);
  const savingsBankCustom = useSettingsStore((s) => s.savingsBankCustom);
  const setSavingsBank = useSettingsStore((s) => s.setSavingsBank);
  const setSavingsBankCustom = useSettingsStore((s) => s.setSavingsBankCustom);
  const bankName = useBankName();

  const monthlySavings = monthlyIncome * allocation.savings;
  const [txAmount, setTxAmount] = useState("");
  const [txNote, setTxNote] = useState("");
  const [emergencyInput, setEmergencyInput] = useState("");
  const [projectionMonths, setProjectionMonths] = useState("12");
  const [includeMonthlyDeposits, setIncludeMonthlyDeposits] = useState(true);
  const [entryModal, setEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryForm, setEntryForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    type: "deposit",
    note: "",
  });

  useEffect(() => {
    setEmergencyInput(emergencyFund ? String(emergencyFund) : "");
  }, [emergencyFund]);

  const monthlyContrib = includeMonthlyDeposits ? monthlySavings : 0;

  const interestChartData = useMemo(
    () =>
      projectSavingsGrowth({
        principal: savingsBalance,
        annualRatePercent: savingsInterestRate,
        monthlyContribution: monthlyContrib,
        months: parseInt(projectionMonths, 10),
      }),
    [savingsBalance, savingsInterestRate, monthlyContrib, projectionMonths]
  );

  const projectedEnd =
    interestChartData[interestChartData.length - 1]?.balance ?? savingsBalance;

  const postEntry = (type) => {
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) return;
    addSavingsEntry({
      id: crypto.randomUUID(),
      date: format(new Date(), "yyyy-MM-dd"),
      amount,
      type,
      note: txNote || (type === "deposit" ? "Deposit" : "Withdrawal"),
      balance: 0,
    });
    setTxAmount("");
    setTxNote("");
  };

  const handleEmergencyUpdate = () => {
    const val = parseFloat(emergencyInput);
    if (!isNaN(val)) setEmergencyFund(val);
  };

  const openEditEntry = (entry) => {
    setEditingEntry(entry);
    setEntryForm({
      date: entry.date,
      amount: String(entry.amount),
      type: entry.type,
      note: entry.note || "",
    });
    setEntryModal(true);
  };

  const handleSaveEntry = (e) => {
    e.preventDefault();
    const amount = parseFloat(entryForm.amount);
    const payload = {
      date: entryForm.date,
      amount,
      type: entryForm.type,
      note: entryForm.note,
    };
    if (editingEntry) {
      updateSavingsEntry(editingEntry.id, payload);
    } else {
      addSavingsEntry({
        id: crypto.randomUUID(),
        ...payload,
        balance: 0,
      });
    }
    setEntryModal(false);
    setEditingEntry(null);
  };

  return (
    <>
      <TopBar
        title="Savings"
        subtitle={`Track your ${bankName} balance and interest growth`}
      />

      <PageHelp title="How Savings works">
        <ul className="list-inside list-disc space-y-2">
          <li>
            Use <strong className="text-text-primary">Deposit</strong> or{" "}
            <strong className="text-text-primary">Withdrawal</strong> — you only
            enter the amount moved, not your full bank balance. The app adds or
            subtracts and shows the new total.
          </li>
          <li>
            <strong className="text-text-primary">Interest projection</strong> starts
            from your current computed balance, applies monthly compound interest,
            and optionally adds your monthly savings target each month.
          </li>
        </ul>
      </PageHelp>

      <div className="card mb-6">
        <h3 className="font-display text-lg font-semibold text-white">Savings bank</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-text-secondary">
            Bank
            <select
              className="field-input field-select mt-1.5"
              value={savingsBank}
              onChange={(e) => setSavingsBank(e.target.value)}
            >
              {PH_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          {savingsBank === "Other" && (
            <Input
              label="Bank name"
              value={savingsBankCustom}
              onChange={(e) => setSavingsBankCustom(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={PiggyBank} label={`${bankName} balance`} value={formatPhp(savingsBalance)} />
        <StatCard
          icon={Target}
          label="Monthly savings target"
          value={formatPhp(monthlySavings)}
          sub={`${(allocation.savings * 100).toFixed(0)}% of income`}
        />
        <StatCard icon={ShieldCheck} label="Emergency fund" value={formatPhp(emergencyFund)} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-display text-lg font-semibold text-white">
            Deposit or withdrawal
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Enter how much you moved — balance is calculated for you
          </p>
          <div className="mt-4 space-y-3">
            <Input
              label="Amount (PHP)"
              type="number"
              min="0"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
            />
            <Input
              label="Note (optional)"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => postEntry("deposit")}
                disabled={!txAmount}
              >
                Deposit
              </Button>
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => postEntry("withdrawal")}
                disabled={!txAmount}
              >
                Withdrawal
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              label="Emergency fund (PHP)"
              type="number"
              value={emergencyInput}
              onChange={(e) => setEmergencyInput(e.target.value)}
              className="flex-1"
            />
            <Button className="mt-6" size="sm" onClick={handleEmergencyUpdate}>
              Update
            </Button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-display text-lg font-semibold text-white">
            Interest projection
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Estimate only — not a bank guarantee
          </p>
          <div className="mt-4">
            <Input
              label="Annual interest rate (%)"
              type="number"
              step="0.1"
              value={savingsInterestRate}
              onChange={(e) =>
                setSavingsInterestRate(parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeMonthlyDeposits}
              onChange={(e) => setIncludeMonthlyDeposits(e.target.checked)}
            />
            Include monthly savings target ({formatPhp(monthlySavings)}/mo)
          </label>
          <p className="mt-2 text-xs text-text-secondary">
            Formula: start at {formatPhp(savingsBalance)} → each month earn interest
            on the balance, then add {includeMonthlyDeposits ? formatPhp(monthlySavings) : "₱0.00"}.
          </p>
          <div className="mt-4">
            <Tabs
              tabs={horizonTabs}
              active={projectionMonths}
              onChange={setProjectionMonths}
            />
          </div>
          <div className="mt-4 h-[240px]">
            <SavingsInterestChart data={interestChartData} />
          </div>
          <p className="mt-2 font-mono text-sm text-gain">
            Projected balance: {formatPhp(projectedEnd)} after{" "}
            {horizonTabs.find((t) => t.id === projectionMonths)?.label}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">History</h3>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingEntry(null);
              setEntryForm({
                date: format(new Date(), "yyyy-MM-dd"),
                amount: "",
                type: "deposit",
                note: "",
              });
              setEntryModal(true);
            }}
          >
            Log entry
          </Button>
        </div>
        {savingsEntries.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-text-secondary/60">
              <PiggyBank className="h-8 w-8" />
            </div>
            <h4 className="mb-1 font-medium text-white">No entries yet</h4>
            <p className="text-sm text-text-secondary">Record a deposit to get started.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-text-secondary">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Balance after</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {savingsEntries.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs capitalize ${
                          e.type === "deposit"
                            ? "border-gain/20 bg-gain/10 text-gain"
                            : "border-loss/20 bg-loss/10 text-loss"
                        }`}
                      >
                        {e.type === "deposit" ? (
                          <ArrowDownToLine size={12} />
                        ) : (
                          <ArrowUpFromLine size={12} />
                        )}
                        {e.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-mono ${
                        e.type === "deposit" ? "text-gain" : "text-loss"
                      }`}
                    >
                      {e.type === "deposit" ? "+" : "-"}
                      {formatPhp(e.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-white">
                      {formatPhp(e.balance)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{e.note}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEditEntry(e)}
                          className="rounded-full p-1.5 text-text-secondary hover:bg-white/5 hover:text-white"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this entry?"))
                              removeSavingsEntry(e.id);
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
      </div>

      <Modal
        open={entryModal}
        onClose={() => setEntryModal(false)}
        title={editingEntry ? "Edit entry" : "Log entry"}
      >
        <form onSubmit={handleSaveEntry} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={entryForm.date}
            onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
            required
          />
          <label className="block text-sm text-text-secondary">
            Type
            <select
              className="field-input field-select mt-1.5"
              value={entryForm.type}
              onChange={(e) => setEntryForm({ ...entryForm, type: e.target.value })}
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </label>
          <Input
            label="Amount"
            type="number"
            value={entryForm.amount}
            onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
            required
          />
          <Input
            label="Note"
            value={entryForm.note}
            onChange={(e) => setEntryForm({ ...entryForm, note: e.target.value })}
          />
          <Button type="submit">Save</Button>
        </form>
      </Modal>
    </>
  );
}
