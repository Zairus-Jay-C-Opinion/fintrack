import { format, parseISO } from "date-fns";

export function formatPercent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatCompact(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
}
