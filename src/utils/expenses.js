import { format, startOfMonth, parseISO, isValid } from "date-fns";

export const EXPENSE_CATEGORIES = [
  "Food & dining",
  "Transport",
  "Shopping",
  "Bills & utilities",
  "Education",
  "Health",
  "Entertainment",
  "Subscriptions",
  "Personal care",
  "Other",
];

export function getMonthKey(date = new Date()) {
  return format(startOfMonth(date), "yyyy-MM");
}

export function getExpensesForMonth(transactions, monthKey = getMonthKey()) {
  return transactions.filter(
    (t) =>
      t.type === "expense" &&
      t.date?.startsWith(monthKey)
  );
}

export function sumExpenses(transactions, monthKey = getMonthKey()) {
  return getExpensesForMonth(transactions, monthKey).reduce(
    (s, t) => s + (t.amount || 0),
    0
  );
}

export function groupExpensesByCategory(transactions, monthKey = getMonthKey()) {
  const groups = {};
  for (const t of getExpensesForMonth(transactions, monthKey)) {
    const cat = t.category || "Other";
    groups[cat] = (groups[cat] || 0) + t.amount;
  }
  return Object.entries(groups)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function parseMonthKey(monthKey) {
  const d = parseISO(`${monthKey}-01`);
  return isValid(d) ? d : new Date();
}
