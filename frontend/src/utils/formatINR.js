export function formatINR(value, options = {}) {
  const amount = Number(value || 0);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: options.decimals ?? 0,
    maximumFractionDigits: options.decimals ?? 0,
  }).format(amount);

  return options.withSymbol === false ? formatted : `₹${formatted}`;
}

export function formatPercent(value, decimals = 1) {
  const num = Number(value || 0);
  return `${num.toFixed(decimals)}%`;
}

export function formatCompactINR(value) {
  const amount = Number(value || 0);
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatINR(amount);
}
