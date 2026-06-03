/** Monthly compound with optional monthly contributions. */
export function projectSavingsGrowth({
  principal,
  annualRatePercent,
  monthlyContribution = 0,
  months,
}) {
  const r = annualRatePercent / 100 / 12;
  const points = [];
  let balance = principal;
  for (let m = 0; m <= months; m++) {
    const years = m / 12;
    points.push({
      month: m,
      label: m === 0 ? "Now" : years >= 1 && m % 12 === 0 ? `${years}y` : `${m}mo`,
      balance: Math.round(balance * 100) / 100,
      contributed: principal + monthlyContribution * m,
    });
    if (m < months) {
      balance = balance * (1 + r) + monthlyContribution;
    }
  }
  return points;
}
