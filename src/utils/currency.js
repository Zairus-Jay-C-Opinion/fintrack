export function phpToUsd(amountPhp, rate) {
  return amountPhp / rate;
}

export function usdToPhp(amountUsd, rate) {
  return amountUsd * rate;
}

export function formatPhp(amount) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsd(amount) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
