import { useState, useMemo } from "react";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import GoalCard from "../components/cards/GoalCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import StatCard from "../components/cards/StatCard";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { formatPhp } from "../utils/currency";
import {
  getSpendingRemaining,
  distributeToGoals,
} from "../utils/goals";

export default function Goals() {
  const savingsGoals = useFinanceStore((s) => s.savingsGoals);
  const addSavingsGoal = useFinanceStore((s) => s.addSavingsGoal);
  const updateSavingsGoal = useFinanceStore((s) => s.updateSavingsGoal);
  const removeSavingsGoal = useFinanceStore((s) => s.removeSavingsGoal);
  const savingsBalance = useFinanceStore((s) => s.savingsBalance);
  const addSavingsEntry = useFinanceStore((s) => s.addSavingsEntry);
  const transactions = useFinanceStore((s) => s.transactions);

  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const allocation = useSettingsStore((s) => s.allocation);

  const [goalModal, setGoalModal] = useState(false);
  const [fundModal, setFundModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [progressInput, setProgressInput] = useState("");
  const [goalForm, setGoalForm] = useState({
    name: "",
    target: "",
    targetDate: "",
    current: "0",
  });

  const [useSavings, setUseSavings] = useState(true);
  const [useSpending, setUseSpending] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState("");
  const [deductFromSavings, setDeductFromSavings] = useState(true);

  const spendingRemaining = useMemo(
    () => getSpendingRemaining(monthlyIncome, allocation, transactions),
    [monthlyIncome, allocation, transactions]
  );

  const savingsPool = useMemo(() => {
    const cap = parseFloat(savingsAmount);
    if (useSavings) {
      return isNaN(cap) || savingsAmount === ""
        ? savingsBalance
        : Math.min(savingsBalance, Math.max(0, cap));
    }
    return 0;
  }, [useSavings, savingsAmount, savingsBalance]);

  const totalPool =
    (useSavings ? savingsPool : 0) + (useSpending ? spendingRemaining : 0);

  const preview = useMemo(
    () => distributeToGoals(savingsGoals, totalPool),
    [savingsGoals, totalPool]
  );

  const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
  const totalSaved = savingsGoals.reduce((s, g) => s + g.current, 0);

  const handleAddGoal = (e) => {
    e.preventDefault();
    addSavingsGoal({
      id: crypto.randomUUID(),
      name: goalForm.name,
      target: parseFloat(goalForm.target),
      targetDate: goalForm.targetDate,
      current: parseFloat(goalForm.current) || 0,
    });
    setGoalModal(false);
    setGoalForm({ name: "", target: "", targetDate: "", current: "0" });
  };

  const applyFunding = () => {
    if (preview.updates.length === 0) return;
    preview.updates.forEach(({ id, current }) => {
      updateSavingsGoal(id, { current });
    });
    if (deductFromSavings && useSavings && preview.applied > 0) {
      addSavingsEntry({
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        amount: preview.applied,
        type: "withdrawal",
        note: "Allocated to savings goals",
        balance: 0,
      });
    }
    setFundModal(false);
  };

  return (
    <div className="page-shell">
      <TopBar title="Goals" subtitle="Save toward targets" />

      <PageHelp title="How Goals works">
        <ul className="list-inside list-disc space-y-2">
          <li>
            Create goals with a target amount and date. Progress is tracked per
            goal.
          </li>
          <li>
            <strong className="text-text-primary">Fund goals</strong> splits money
            equally across all goals. Choose savings balance, leftover spending
            budget, or both.
          </li>
          <li>
            Spending budget = what you have not spent this month (from Expenses).
            Savings = your actual bank balance on the Savings tab.
          </li>
        </ul>
      </PageHelp>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Goals" value={String(savingsGoals.length)} />
        <StatCard label="Total saved" value={formatPhp(totalSaved)} />
        <StatCard label="Combined targets" value={formatPhp(totalTarget)} />
      </div>

      <div className="card mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.length === 0 ? (
            <p className="text-text-secondary sm:col-span-2 lg:col-span-3">
              No goals yet — add your first goal below
            </p>
          ) : (
            savingsGoals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onDelete={removeSavingsGoal}
                onUpdateProgress={(goal) => {
                  setEditingGoal(goal);
                  setProgressInput(String(goal.current));
                  setProgressModal(true);
                }}
              />
            ))
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-start gap-3">
          <Button size="sm" onClick={() => setGoalModal(true)}>
            Add goal
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setFundModal(true)}
            disabled={savingsGoals.length === 0}
          >
            Fund goals
          </Button>
        </div>
      </div>

      <Modal
        open={goalModal}
        onClose={() => setGoalModal(false)}
        title="New goal"
      >
        <form id="new-goal-form" onSubmit={handleAddGoal} className="space-y-4">
          <Input
            label="Goal name"
            value={goalForm.name}
            onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
            required
          />
          <Input
            label="Target amount (PHP)"
            type="number"
            min="0"
            step="0.01"
            value={goalForm.target}
            onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
            required
          />
          <Input
            label="Already saved (PHP)"
            type="number"
            min="0"
            step="0.01"
            value={goalForm.current}
            onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
          />
          <Input
            label="Target date"
            type="date"
            value={goalForm.targetDate}
            onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
            required
          />
          <Button type="submit" className="mt-2 w-full">
            Create goal
          </Button>
        </form>
      </Modal>

      <Modal
        open={fundModal}
        onClose={() => setFundModal(false)}
        title="Fund goals"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Money is split equally across {savingsGoals.length} goal(s). Each
            goal stops at its target.
          </p>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={useSavings}
              onChange={(e) => setUseSavings(e.target.checked)}
            />
            <span>
              From savings balance ({formatPhp(savingsBalance)} available)
            </span>
          </label>
          {useSavings && (
            <div className="ml-6 space-y-2">
              <Input
                label="Amount from savings (leave empty = use full balance)"
                type="number"
                min="0"
                step="0.01"
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
              />
              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={deductFromSavings}
                  onChange={(e) => setDeductFromSavings(e.target.checked)}
                />
                Record as savings withdrawal
              </label>
            </div>
          )}

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={useSpending}
              onChange={(e) => setUseSpending(e.target.checked)}
            />
            <span>
              From unspent spending budget ({formatPhp(spendingRemaining)}{" "}
              left this month)
            </span>
          </label>

          <div className="rounded-[var(--radius-md)] border border-accent bg-bg-deepest p-3 font-mono text-sm">
            <p className="text-text-secondary">Total to distribute</p>
            <p className="text-white">{formatPhp(totalPool)}</p>
            <p className="mt-2 text-text-secondary">Per goal (before caps)</p>
            <p className="text-highlight">{formatPhp(preview.perGoal)}</p>
            <p className="mt-2 text-text-secondary">Actually applied</p>
            <p className="text-gain">{formatPhp(preview.applied)}</p>
          </div>

          <Button
            className="mt-2 w-full"
            onClick={applyFunding}
            disabled={totalPool <= 0}
          >
            Apply to goals
          </Button>
        </div>
      </Modal>

      <Modal
        open={progressModal}
        onClose={() => {
          setProgressModal(false);
          setEditingGoal(null);
        }}
        title={`Update — ${editingGoal?.name ?? ""}`}
      >
        <form
          id="goal-progress-form"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = parseFloat(progressInput);
            if (editingGoal && !isNaN(amount)) {
              updateSavingsGoal(editingGoal.id, { current: amount });
              setProgressModal(false);
              setEditingGoal(null);
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Amount saved toward this goal (PHP)"
            type="number"
            min="0"
            step="0.01"
            value={progressInput}
            onChange={(e) => setProgressInput(e.target.value)}
            required
          />
          <Button type="submit" className="mt-2 w-full">
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}
