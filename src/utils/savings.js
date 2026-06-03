/** Recalculate running balances after edits (entries stored newest-first). */
export function recalculateSavingsEntries(entries) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  let balance = 0;
  const withBalance = sorted.map((e) => {
    balance += e.type === "deposit" ? e.amount : -e.amount;
    return { ...e, balance };
  });
  return withBalance.reverse();
}
