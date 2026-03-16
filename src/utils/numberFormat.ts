export const formatCompactCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return "0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const format = (divisor: number, suffix: string) => {
    const num = abs / divisor;
    // Use at most 2 decimal places, but trim trailing zeros
    let str = num.toFixed(num >= 100 || num % 1 === 0 ? 0 : num >= 10 ? 1 : 2);
    // Strip trailing zeros and optional dot
    str = str.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
    return `${sign}${str}${suffix}`;
  };

  if (abs >= 1_000_000_000_000) return format(1_000_000_000_000, "T");
  if (abs >= 1_000_000_000) return format(1_000_000_000, "B");
  if (abs >= 1_000_000) return format(1_000_000, "M");
  if (abs >= 1_000) return format(1_000, "K");

  return value.toLocaleString();
};

