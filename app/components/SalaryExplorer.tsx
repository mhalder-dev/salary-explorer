"use client";

import { useMemo, useState } from "react";
import type { SalaryRecord } from "@/lib/salaries";
import { recordKey, updatedToSortKey } from "@/lib/format";
import SalaryCard from "@/app/components/SalaryCard";
import Dropdown from "@/app/components/Dropdown";

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
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-line bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
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
              placeholder="Search university, designation, city, benefits…"
              className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>

          <Dropdown
            ariaLabel="Filter by location"
            className="sm:w-44"
            value={location}
            onChange={setLocation}
            options={[
              { value: "all", label: "All locations" },
              ...locations.map((loc) => ({ value: loc, label: loc })),
            ]}
          />

          <Dropdown
            ariaLabel="Sort records"
            className="sm:w-48"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={SORT_OPTIONS}
          />
        </div>

        {/* Employment-type chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by employment type">
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setType(chip.value)}
              aria-pressed={type === chip.value}
              className={
                "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent/40 " +
                (type === chip.value
                  ? "border border-transparent bg-accent text-accent-contrast"
                  : "border border-line bg-surface text-ink-secondary hover:border-accent/50 hover:text-accent")
              }
            >
              {chip.label}
            </button>
          ))}
          <span className="ml-auto text-xs tabular-nums text-ink-muted">
            Showing{" "}
            <span className="font-semibold text-ink">{filtered.length}</span> of{" "}
            {records.length}
          </span>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface/50 py-16 text-center">
          <p className="text-sm text-ink-muted">
            No records match your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLocation("all");
              setType("all");
            }}
            className="mt-3 text-sm font-medium text-accent hover:text-accent-strong hover:underline"
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
