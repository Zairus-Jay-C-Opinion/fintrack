import { formatPhp } from "./currency";

/**
 * Explain how spending relates to savings goals (separate budgets).
 */
export function getGoalExpenseInsight(goal, { spent, spendingBudget, savingsBudget, savingsBalance }) {
  const stillNeed = Math.max(0, goal.target - goal.current);
  const spendingRemaining = Math.max(0, spendingBudget - spent);
  const monthlySaveTarget = savingsBudget;

  return {
    stillNeed,
    spendingRemaining,
    monthlySaveTarget,
    messages: [
      {
        label: "Saved toward this goal",
        value: formatPhp(goal.current),
        detail: `of ${formatPhp(goal.target)} target`,
      },
      {
        label: "Still needed",
        value: formatPhp(stillNeed),
        detail: "Update progress on the Savings page when you add money",
      },
      {
        label: "Your spending budget (separate)",
        value: `${formatPhp(spent)} / ${formatPhp(spendingBudget)}`,
        detail:
          spent <= spendingBudget
            ? `${formatPhp(spendingRemaining)} left for purchases this month`
            : `${formatPhp(spent - spendingBudget)} over your spending allowance`,
      },
      {
        label: "Monthly savings you plan to set aside",
        value: formatPhp(monthlySaveTarget),
        detail: `Bank balance: ${formatPhp(savingsBalance)} (not auto-linked to goals)`,
      },
    ],
  };
}
