"use client";

import { useMemo, useState } from "react";
import type { SalaryRecord } from "@/lib/salaries";
import {
  formatTaka,
  formatTakaShort,
  recordKey,
  updatedToSortKey,
} from "@/lib/format";

type SortKey = "salary-desc" | "salary-asc" | "university-asc" | "updated-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "salary-desc", label: "Salary: High → Low" },
  { value: "salary-asc", label: "Salary: Low → High" },
  { value: "university-asc", label: "University: A → Z" },
  { value: "updated-desc", label: "Recently updated" },
];

type EmploymentType = "all" | "permanent" | "contractual" | "probation" | "part-time";

const TYPE_CHIPS: { value: EmploymentType; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "permanent", label: "Permanent" },
  { value: "contractual", label: "Contractual" },
  { value: "probation", label: "On probation" },
  { value: "part-time", label: "Part-time / Adjunct" },
];

function employmentType(designation: string): Exclude<EmploymentType, "all"> | null {
  const d = designation.toLowerCase();
  if (d.includes("contractual")) return "contractual";
  if (d.includes("probation")) return "probation";
  if (d.includes("part time") || d.includes("part-time") || d.includes("adjunct"))
    return "part-time";
  if (d.includes("permanent")) return "permanent";
  return null; // designation doesn't specify
}

export default function SalaryExplorer({
  records,
  maxTotal,
}: {
  records: SalaryRecord[];
  maxTotal: number;
}) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState<EmploymentType>("all");
  const [sort, setSort] = useState<SortKey>("salary-desc");

  const locations = useMemo(() => {
    const set = new Set(
      records.map((r) => r.location).filter((l) => l.trim() !== ""),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = records.filter((r) => {
      if (location !== "all" && r.location !== location) return false;
      if (type !== "all" && employmentType(r.designation) !== type) return false;
      if (q === "") return true;
      const haystack = [
        r.university,
        r.shortName ?? "",
        r.designation,
        r.location,
        r.facilities,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    // Records without a monthly total sort to the end for salary sorts.
    const NULL_LAST = -1;
    result.sort((a, b) => {
      switch (sort) {
        case "salary-asc":
          return (a.total ?? Infinity) - (b.total ?? Infinity);
        case "university-asc":
          return a.university.localeCompare(b.university);
        case "updated-desc":
          return updatedToSortKey(b.lastUpdated) - updatedToSortKey(a.lastUpdated);
        case "salary-desc":
        default:
          return (b.total ?? NULL_LAST) - (a.total ?? NULL_LAST);
      }
    });
    return result;
  }, [records, query, location, type, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-black/5 bg-[var(--background)]/85 px-4 py-4 backdrop-blur dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 3 3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search university, designation, city, benefits…"
              className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-white/15 dark:bg-white/5"
            aria-label="Filter by location"
          >
            <option value="all">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-white/15 dark:bg-white/5"
            aria-label="Sort records"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Employment-type chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by employment type">
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setType(chip.value)}
              aria-pressed={type === chip.value}
              className={
                type === chip.value
                  ? "rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-indigo-300"
              }
            >
              {chip.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {filtered.length}
            </span>{" "}
            of {records.length}
          </span>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 py-16 text-center dark:border-white/15">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No records match your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLocation("all");
              setType("all");
            }}
            className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((r, i) => (
            <SalaryCard key={recordKey(r, i)} record={r} maxTotal={maxTotal} />
          ))}
        </div>
      )}
    </div>
  );
}

function SalaryCard({
  record,
  maxTotal,
}: {
  record: SalaryRecord;
  maxTotal: number;
}) {
  const salaryLines = record.rawSalary.split(" | ").filter(Boolean);
  const facilityLines = record.facilities.split(" | ").filter(Boolean);

  return (
    <article className="group flex flex-col rounded-xl border border-black/10 bg-white p-5 transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
            {record.university}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {record.designation}
          </p>
        </div>
        {record.shortName && (
          <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {record.shortName}
          </span>
        )}
      </div>

      <div className="mt-4">
        {record.total !== null ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {formatTaka(record.total)}
              </span>
              <span className="text-xs text-zinc-400">/ month</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{
                  width: `${Math.max(4, Math.round((record.total / maxTotal) * 100))}%`,
                }}
              />
            </div>
          </>
        ) : (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              Pay varies — not a fixed monthly amount
            </span>
            {salaryLines.length > 0 && (
              <p className="mt-2 text-sm font-medium leading-snug text-zinc-700 dark:text-zinc-200">
                {salaryLines.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {record.location && (
          <span className="inline-flex items-center gap-1">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
            </svg>
            {record.location}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3.5a.75.75 0 0 1 .75.75v3.19l2.03 2.03a.75.75 0 1 1-1.06 1.06L7.47 8.53A.75.75 0 0 1 7.25 8V4.25A.75.75 0 0 1 8 3.5Z" />
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z" />
          </svg>
          Updated {record.lastUpdated}
        </span>
      </div>

      {(record.total !== null && (salaryLines.length > 1 || facilityLines.length > 0)) ||
      (record.total === null && facilityLines.length > 0) ? (
        <details className="mt-4 border-t border-black/5 pt-3 dark:border-white/10">
          <summary className="cursor-pointer list-none text-xs font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400">
            Breakdown &amp; benefits
          </summary>
          <div className="mt-3 space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
            {record.basic != null && (
              <div className="flex gap-4">
                <span>
                  <span className="text-zinc-400">Basic </span>
                  <span className="font-medium">{formatTakaShort(record.basic)}</span>
                </span>
                {record.allowances != null && (
                  <span>
                    <span className="text-zinc-400">Allowances </span>
                    <span className="font-medium">{formatTakaShort(record.allowances)}</span>
                  </span>
                )}
              </div>
            )}
            {record.total !== null && salaryLines.length > 1 && (
              <ul className="space-y-1">
                {salaryLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="text-zinc-500 dark:text-zinc-400">{line}</span>
                  </li>
                ))}
              </ul>
            )}
            {facilityLines.length > 0 && (
              <div>
                <p className="mb-1 font-medium text-zinc-500 dark:text-zinc-400">
                  Benefits
                </p>
                <ul className="space-y-1">
                  {facilityLines.map((line) => (
                    <li key={line} className="flex gap-2 leading-relaxed">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-indigo-400" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      ) : null}
    </article>
  );
}
