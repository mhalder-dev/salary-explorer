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

/* --------------------------------------------------------------------------
 * The scope (interactive distribution) — domain + derived series.
 * Everything below is computed on the server and handed to the client as plain
 * data, so the histogram is in the static HTML for crawlers and no-JS readers.
 * ------------------------------------------------------------------------ */

/** Axis domain of the scope. 2,500-taka buckets expose the round-number spikes
 *  (30k / 35k / 40k) that a coarser binning would smooth away. */
export const SCOPE = { min: 20_000, max: 110_000, bucket: 2_500 } as const;

export interface Bucket {
  from: number;
  to: number;
  count: number;
}

export function buildHistogram(records: SalaryRecord[]): Bucket[] {
  const n = (SCOPE.max - SCOPE.min) / SCOPE.bucket;
  const buckets: Bucket[] = Array.from({ length: n }, (_, i) => ({
    from: SCOPE.min + i * SCOPE.bucket,
    to: SCOPE.min + (i + 1) * SCOPE.bucket,
    count: 0,
  }));
  for (const r of records) {
    if (r.total === null) continue;
    const i = Math.min(
      n - 1,
      Math.max(0, Math.floor((r.total - SCOPE.min) / SCOPE.bucket)),
    );
    buckets[i].count++;
  }
  return buckets;
}

/** One plotted salary, light enough to ship to the client for the scope. */
export interface ScopeMark {
  name: string;
  total: number;
}

/** Monthly totals ascending, paired with their university. */
export function scopeMarks(records: SalaryRecord[]): ScopeMark[] {
  return records
    .filter((r): r is SalaryRecord & { total: number } => r.total !== null)
    .map((r) => ({ name: r.shortName ?? r.university, total: r.total }))
    .sort((a, b) => a.total - b.total);
}
