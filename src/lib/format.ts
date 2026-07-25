export const fmtPct = (v: number, digits = 2) => `${(v * 100).toFixed(digits)}%`;
export const fmtPctRaw = (v: number, digits = 2) => `${v.toFixed(digits)}%`;
export const fmtNum = (v: number, digits = 0) =>
  v.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
export const fmtCurrency = (v: number, digits = 0) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits });
export const fmtCompact = (v: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);
export const fmtSigned = (v: number, digits = 2, suffix = "") =>
  `${v > 0 ? "+" : ""}${v.toFixed(digits)}${suffix}`;
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
