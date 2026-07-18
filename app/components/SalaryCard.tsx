import type { SalaryRecord } from "@/lib/salaries";
import { formatTaka, formatTakaShort } from "@/lib/format";

export default function SalaryCard({
  record,
  maxTotal,
}: {
  record: SalaryRecord;
  maxTotal: number;
}) {
  const salaryLines = record.rawSalary.split(" | ").filter(Boolean);
  const facilityLines = record.facilities.split(" | ").filter(Boolean);

  return (
    <article className="flex flex-col border border-line bg-surface p-5 transition hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight text-ink">
            {record.university}
          </h3>
          <p className="mt-1 text-sm text-ink-secondary">
            {record.designation}
          </p>
        </div>
        {record.shortName && (
          <span className="shrink-0 border border-line px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            {record.shortName}
          </span>
        )}
      </div>

      <div className="mt-4">
        {record.total !== null ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="tnum text-[26px] font-semibold leading-none tracking-tight text-ink">
                {formatTaka(record.total)}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                / month
              </span>
            </div>
            <div className="mt-3 h-0.5 w-full bg-track">
              <div
                className="h-full bg-accent"
                style={{
                  width: `${Math.max(4, Math.round((record.total / maxTotal) * 100))}%`,
                }}
              />
            </div>
          </>
        ) : (
          <div>
            <span className="inline-flex items-center gap-1.5 border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700">
              Pay varies — not a fixed monthly amount
            </span>
            {salaryLines.length > 0 && (
              <p className="mt-2 text-sm font-medium leading-snug text-ink">
                {salaryLines.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
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
        <details className="group mt-4 border-t border-line pt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-accent transition hover:text-accent-strong [&::-webkit-details-marker]:hidden">
            <svg
              className="size-3 transition-transform group-open:rotate-90"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Breakdown &amp; benefits
          </summary>
          <div className="mt-3 space-y-3 text-xs text-ink-secondary">
            {record.basic != null && (
              <div className="flex gap-4">
                <span>
                  <span className="text-ink-muted">Basic </span>
                  <span className="font-medium text-ink">
                    {formatTakaShort(record.basic)}
                  </span>
                </span>
                {record.allowances != null && (
                  <span>
                    <span className="text-ink-muted">Allowances </span>
                    <span className="font-medium text-ink">
                      {formatTakaShort(record.allowances)}
                    </span>
                  </span>
                )}
              </div>
            )}
            {record.total !== null && salaryLines.length > 1 && (
              <ul className="space-y-1">
                {salaryLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-muted/60" />
                    <span className="text-ink-muted">{line}</span>
                  </li>
                ))}
              </ul>
            )}
            {facilityLines.length > 0 && (
              <div>
                <p className="mb-1 font-medium text-ink-muted">Benefits</p>
                <ul className="space-y-1">
                  {facilityLines.map((line) => (
                    <li key={line} className="flex gap-2 leading-relaxed">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
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
