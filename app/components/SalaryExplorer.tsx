"use client";

import { useMemo, useState } from "react";
import type { SalaryRecord } from "@/lib/salaries";
import { recordKey, updatedToSortKey } from "@/lib/format";
import SalaryCard from "@/app/components/SalaryCard";
import Dropdown from "@/app/components/Dropdown";

type SortKey = "salary-desc" | "salary-asc" | "university-asc" | "updated-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "salary-desc", label: "Highest pay first" },
  { value: "salary-asc", label: "Lowest pay first" },
  { value: "university-asc", label: "University A → Z" },
  { value: "updated-desc", label: "Recently updated" },
];

type EmploymentType = "all" | "permanent" | "contractual" | "probation" | "part-time";

const TYPE_CHIPS: { value: EmploymentType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "permanent", label: "Permanent" },
  { value: "contractual", label: "Contractual" },
  { value: "probation", label: "Probation" },
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

  /** Pay rank across the WHOLE dataset, so the number stays meaningful under
   *  every sort and filter. Non-monthly records have no rank. */
  const rankOf = useMemo(() => {
    const map = new Map<string, number>();
    records
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.total !== null)
      .sort((a, b) => (b.r.total ?? 0) - (a.r.total ?? 0))
      .forEach(({ r, i }, position) => map.set(recordKey(r, i), position + 1));
    return map;
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = records
      .map((r, i) => ({ record: r, key: recordKey(r, i) }))
      .filter(({ record: r }) => {
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
    result.sort(({ record: a }, { record: b }) => {
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

  const filtersOn = query !== "" || location !== "all" || type !== "all";
  const clearAll = () => {
    setQuery("");
    setLocation("all");
    setType("all");
  };

  return (
    <div>
      {/* ── Console ────────────────────────────────────────────────────────
          The machine's control panel: black, sticky, sits hard against the
          paper ladder below it. */}
      <div className="grain sticky top-0 z-30 border-y-2 border-rule-2 bg-slab">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slab-ink-2"
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
                aria-label="Search salary records"
                placeholder="Search university, designation, city, benefit…"
                className="h-9 w-full border border-slab-rule bg-slab-2/50 pl-8 pr-3 text-[13px] text-slab-ink outline-none transition placeholder:text-slab-ink-2 focus:border-signal"
              />
            </div>

            <Dropdown
              tone="console"
              ariaLabel="Filter by location"
              className="sm:w-40"
              value={location}
              onChange={setLocation}
              options={[
                { value: "all", label: "All locations" },
                ...locations.map((loc) => ({ value: loc, label: loc })),
              ]}
            />

            <Dropdown
              tone="console"
              ariaLabel="Sort records"
              className="sm:w-44"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={SORT_OPTIONS}
            />
          </div>

          <div
            className="mt-2 flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter by employment type"
          >
            {TYPE_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setType(chip.value)}
                aria-pressed={type === chip.value}
                className={
                  "inline-flex h-7 items-center border px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition " +
                  (type === chip.value
                    ? "border-signal bg-signal font-medium text-signal-ink"
                    : "border-slab-rule text-slab-ink-2 hover:border-signal-dim hover:text-signal")
                }
              >
                {chip.label}
              </button>
            ))}

            <span className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slab-ink-2 tnum">
              {filtersOn && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="underline decoration-dotted underline-offset-4 transition hover:text-signal"
                >
                  clear
                </button>
              )}
              <span>
                <span className="text-signal">{filtered.length}</span>
                <span className="text-slab-ink-2">/{records.length}</span>{" "}
                shown
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Ladder ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-[1.9rem_minmax(0,1fr)_auto_0.9rem] gap-x-3 border-b border-rule px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3 sm:gap-x-5 sm:px-4">
          <span>Rank</span>
          <span>University &amp; role</span>
          <span className="text-right">Monthly</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="border-b border-rule px-4 py-20 text-center">
            <p className="display text-2xl font-semibold text-ink">
              Nothing matches.
            </p>
            <p className="mt-1.5 text-sm text-ink-2">
              No record fits that combination of filters.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 inline-flex h-9 items-center border-2 border-rule-2 bg-paper px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition hover:bg-wash"
            >
              Reset the filters
            </button>
          </div>
        ) : (
          filtered.map(({ record, key }) => (
            <SalaryCard
              key={key}
              record={record}
              maxTotal={maxTotal}
              rank={rankOf.get(key) ?? null}
            />
          ))
        )}
      </div>
    </div>
  );
}
