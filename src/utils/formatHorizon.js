/** Human-readable label for projection time horizons. */
export function formatHorizonLabel(months) {
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? "1 year" : `${years} years`;
  }
  return months === 1 ? "1 month" : `${months} months`;
}

export function formatHorizonShort(months) {
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? "1Y" : `${years}Y`;
  }
  return `${months}mo`;
}
