import type { SalaryRecord } from "@/lib/salaries";
import { formatTaka, formatTakaShort } from "@/lib/format";

/**
 * One rung of the ladder.
 *
 * Not a card — a full-width ranked row with the salary drawn to scale as a
 * highlighter wash behind it, so 50 rows read as a chart you can scan rather
 * than 50 boxes you have to compare by hand. Expands in place.
 */
export default function SalaryCard({
  record,
  maxTotal,
  rank,
}: {
  record: SalaryRecord;
  maxTotal: number;
  /** Position in the whole dataset by pay, 1 = highest. null when pay isn't monthly. */
  rank: number | null;
}) {
  const salaryLines = record.rawSalary.split(" | ").filter(Boolean);
  const facilityLines = record.facilities.split(" | ").filter(Boolean);
  const expandable =
    facilityLines.length > 0 ||
    salaryLines.length > 1 ||
    record.basic != null ||
    record.total === null;

  const width =
    record.total !== null
      ? Math.max(3, Math.round((record.total / maxTotal) * 100))
      : 0;

  const meta = "font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3";

  const head = (
    <>
      {/* value drawn to scale, behind everything */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 bg-wash-soft transition-colors duration-200 group-hover:bg-wash group-open:bg-wash"
        style={{ width: `${width}%` }}
      />
      {record.total === null && (
        <div
          aria-hidden="true"
          className="hatch absolute inset-y-0 left-0 w-[12%] opacity-40"
        />
      )}

      <span className="relative z-10 pt-0.5 font-mono text-[11px] font-medium tracking-[0.04em] text-ink-3 tnum">
        {rank !== null ? String(rank).padStart(2, "0") : "··"}
      </span>

      <span className="relative z-10 min-w-0">
        <span className="flex items-baseline gap-2">
          <span className="display truncate text-[15px] font-semibold leading-snug text-ink sm:text-base">
            {record.university}
          </span>
          {record.shortName && (
            <span
              className={`shrink-0 border border-rule-2/25 px-1 py-px text-ink-2 ${meta}`}
            >
              {record.shortName}
            </span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] leading-snug text-ink-2">
          <span>{record.designation}</span>
          {record.location && (
            <>
              <span aria-hidden="true" className="text-ink-3/45">
                ·
              </span>
              <span className={meta}>{record.location}</span>
            </>
          )}
          <span aria-hidden="true" className="text-ink-3/45">
            ·
          </span>
          <span className={meta}>upd. {record.lastUpdated}</span>
        </span>
      </span>

      <span className="relative z-10 pt-0.5 text-right">
        {record.total !== null ? (
          <span className="display text-[19px] font-bold leading-none text-ink tnum sm:text-[23px]">
            <span className="taka font-normal">৳</span>
            {record.total.toLocaleString("en-US")}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-flag">
            not monthly
          </span>
        )}
      </span>
    </>
  );

  const shell =
    "relative grid grid-cols-[1.9rem_minmax(0,1fr)_auto_0.9rem] items-start gap-x-3 px-3 py-3 sm:gap-x-5 sm:px-4";

  if (!expandable) {
    return (
      <article className="group relative border-b border-rule">
        <div className={shell}>
          {head}
          <span />
        </div>
      </article>
    );
  }

  return (
    <details className="group relative border-b border-rule">
      <summary
        className={`${shell} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        {head}
        <span
          aria-hidden="true"
          className="relative z-10 inline-block pt-0.5 text-right font-mono text-[14px] leading-none text-ink-3 transition group-hover:text-accent group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="relative z-10 border-t border-dashed border-rule bg-paper-2/60 px-3 py-4 sm:px-4 sm:pl-[3.15rem]">
        <div className="grid gap-5 md:grid-cols-2">
          {(record.basic != null || salaryLines.length > 0) && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                Breakdown
              </p>
              {record.basic != null && (
                <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                  <div className="flex items-baseline gap-1.5">
                    <dt className="text-ink-3">Basic</dt>
                    <dd className="font-semibold text-ink tnum">
                      {formatTakaShort(record.basic)}
                    </dd>
                  </div>
                  {record.allowances != null && (
                    <div className="flex items-baseline gap-1.5">
                      <dt className="text-ink-3">Allowances</dt>
                      <dd className="font-semibold text-ink tnum">
                        {formatTakaShort(record.allowances)}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
              {salaryLines.length > 0 && (
                <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-ink-2">
                  {salaryLines.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[0.55em] h-px w-2 shrink-0 bg-ink-3" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
              {record.total === null && (
                <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                  Reported as per-course or per-semester pay, so it is excluded
                  from the median and the scope above.
                </p>
              )}
            </div>
          )}

          {facilityLines.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                Bonuses &amp; benefits
              </p>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-ink-2">
                {facilityLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[0.45em] size-1.5 shrink-0 bg-signal-dim" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {record.total !== null && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 tnum">
            {formatTaka(record.total)} / month · {width}% of the highest figure
            reported
          </p>
        )}
      </div>
    </details>
  );
}
