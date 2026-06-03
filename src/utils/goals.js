import { sumExpenses, getMonthKey } from "./expenses";

export function getSpendingRemaining(monthlyIncome, allocation, transactions) {
  const budget = monthlyIncome * allocation.spending;
  const spent = sumExpenses(transactions, getMonthKey());
  return Math.max(0, budget - spent);
}

/** Split pool equally across goals; cap each at target. Returns updates per goal id. */
export function distributeToGoals(goals, totalPool) {
  if (!goals.length || totalPool <= 0) {
    return { updates: [], perGoal: 0, applied: 0 };
  }

  const perGoal = totalPool / goals.length;
  let applied = 0;
  const updates = goals.map((g) => {
    const room = Math.max(0, g.target - g.current);
    const add = Math.min(perGoal, room);
    applied += add;
    return { id: g.id, current: g.current + add };
  });

  return { updates, perGoal, applied };
}
