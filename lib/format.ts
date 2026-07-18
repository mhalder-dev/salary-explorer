import type { SalaryRecord } from "./salaries";

/** Format a BDT amount like 61000 -> "৳61,000". */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString("en-US")}`;
}

/** Short form like 61000 -> "৳61k", 105000 -> "৳105k". */
export function formatTakaShort(amount: number): string {
  if (amount >= 1000) {
    const k = amount / 1000;
    const rounded = Number.isInteger(k) ? k.toString() : k.toFixed(1);
    return `৳${rounded}k`;
  }
  return `৳${amount}`;
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** Turn "August 2024" into a sortable number (higher = more recent). Unknown -> 0. */
export function updatedToSortKey(lastUpdated: string): number {
  const parts = lastUpdated.trim().toLowerCase().split(/\s+/);
  if (parts.length !== 2) return 0;
  const monthIndex = MONTHS.indexOf(parts[0]);
  const year = parseInt(parts[1], 10);
  if (monthIndex === -1 || Number.isNaN(year)) return 0;
  return year * 12 + monthIndex;
}

export interface DatasetStats {
  recordCount: number;
  universityCount: number;
  medianTotal: number;
  maxTotal: number;
  minTotal: number;
}

/**
 * Headline numbers computed once on the server.
 * Records with total: null (non-monthly pay structures) are excluded from
 * median/max/min but still counted in recordCount.
 */
export function computeStats(records: SalaryRecord[]): DatasetStats {
  const totals = records
    .map((r) => r.total)
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);
  const universities = new Set(records.map((r) => r.university));

  const mid = Math.floor(totals.length / 2);
  const medianTotal =
    totals.length === 0
      ? 0
      : totals.length % 2 === 0
        ? Math.round((totals[mid - 1] + totals[mid]) / 2)
        : totals[mid];

  return {
    recordCount: records.length,
    universityCount: universities.size,
    medianTotal,
    maxTotal: totals[totals.length - 1] ?? 0,
    minTotal: totals[0] ?? 0,
  };
}

/** Stable key for React lists. */
export function recordKey(r: SalaryRecord, index: number): string {
  return `${r.university}-${r.designation}-${index}`;
}
