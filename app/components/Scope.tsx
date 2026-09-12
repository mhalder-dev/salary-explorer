"use client";

import { useMemo, useState } from "react";
import { SCOPE, formatTaka, type Bucket, type ScopeMark } from "@/lib/format";

const AXIS_TICKS = [20_000, 40_000, 60_000, 80_000, 100_000];

function pos(value: number): number {
  return ((value - SCOPE.min) / (SCOPE.max - SCOPE.min)) * 100;
}

/**
 * The scope — every reported monthly salary binned into a skyline, with a
 * draggable needle laid over it. Drag anywhere on the chart to place a salary
 * in the distribution and read its percentile.
 *
 * The chart itself is plain server-rendered markup; only the needle and the
 * readout are interactive, so the shape of the data is in the static HTML.
 */
export default function Scope({
  buckets,
  marks,
  median,
}: {
  buckets: Bucket[];
  marks: ScopeMark[]; // ascending by total
  median: number;
}) {
  const [value, setValue] = useState(median);

  const maxCount = useMemo(
    () => buckets.reduce((m, b) => Math.max(m, b.count), 1),
    [buckets],
  );
  const modal = useMemo(
    () => buckets.find((b) => b.count === maxCount),
    [buckets, maxCount],
  );
  // Interquartile range — the band the middle half of all reports falls in.
  // Drawn behind the bars, because "where most people actually are" is the
  // thing a reader wants and a bare histogram never states outright.
  const q1 = marks[Math.floor(marks.length * 0.25)].total;
  const q3 = marks[Math.floor(marks.length * 0.75)].total;

  const below = useMemo(
    () => marks.filter((m) => m.total < value).length,
    [marks, value],
  );
  const pct = Math.round((below / marks.length) * 100);
  const under = marks[below - 1];
  const over = marks.find((m) => m.total > value);

  return (
    <section aria-labelledby="scope-heading" className="relative">
      {/* Readout ------------------------------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-slab-rule pb-5">
        <div>
          <h2
            id="scope-heading"
            className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-signal"
          >
            Pay scope
          </h2>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-slab-ink-2">
            Drag the needle
          </p>
          <output
            aria-live="polite"
            className="display mt-0.5 block text-[clamp(2.8rem,8vw,5rem)] font-bold leading-[0.86] tracking-tight text-slab-ink tnum"
          >
            <span className="taka">৳</span>
            {value.toLocaleString("en-US")}
          </output>
        </div>

        <div className="max-w-[22rem] pb-1">
          <p className="text-[15px] leading-snug text-slab-ink">
            Higher than{" "}
            <span className="display text-[1.9em] font-bold leading-none tracking-tight text-signal tnum align-baseline">
              {pct}%
            </span>{" "}
            of reported salaries.
          </p>
          <p className="mt-1.5 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-slab-ink-2 tnum">
            {below} of {marks.length} monthly figures sit below this line
            {under && over ? (
              <>
                {" · "}
                <span className="text-slab-ink">{under.name}</span> just under,{" "}
                <span className="text-slab-ink">{over.name}</span> just over
              </>
            ) : over ? (
              <>
                {" · "}nothing reported below this
              </>
            ) : (
              <>
                {" · "}nothing reported above this
              </>
            )}
          </p>
          {value !== median && (
            <button
              type="button"
              onClick={() => setValue(median)}
              className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-signal underline decoration-dotted underline-offset-4 transition hover:text-slab-ink"
            >
              ↺ back to median
            </button>
          )}
        </div>
      </div>

      {/* Skyline + needle ---------------------------------------------- */}
      <div className="relative mt-8 select-none">
        <div className="relative h-[clamp(120px,20vw,190px)]">
          {/* bars */}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {buckets.map((b, i) => {
              const filled =
                value >= b.to
                  ? 1
                  : value <= b.from
                    ? 0
                    : (value - b.from) / (b.to - b.from);
              const h = b.count ? 10 + (b.count / maxCount) * 90 : 0;
              return (
                <div key={b.from} className="relative h-full flex-1">
                  {/* baseline stub keeps the axis continuous across empty bins */}
                  <div className="absolute bottom-0 h-[2px] w-full bg-slab-rule" />
                  {b.count > 0 && (
                    <div
                      title={`${b.count} record${b.count > 1 ? "s" : ""} · ${formatTaka(b.from)}–${formatTaka(b.to)}`}
                      className="rise absolute bottom-0 w-full"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 13}ms`,
                        background:
                          filled === 1
                            ? "var(--signal)"
                            : filled === 0
                              ? "var(--bar-idle)"
                              : `linear-gradient(to right, var(--signal) ${filled * 100}%, var(--bar-idle) ${filled * 100}%)`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* median reference — stays put while the needle moves */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 border-l border-dashed border-slab-ink-2/60"
            style={{ left: `${pos(median)}%` }}
          >
            <span className="absolute -top-0.5 left-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-slab-ink-2">
              median
            </span>
          </div>

          {/* the needle — transparent range input over the whole chart */}
          <input
            type="range"
            className="needle absolute inset-0 h-full w-full"
            min={SCOPE.min}
            max={SCOPE.max}
            step={500}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label="Compare a monthly salary against the distribution"
            aria-valuetext={`${formatTaka(value)}, higher than ${pct} percent of reported salaries`}
          />
        </div>

        {/* ruler edge + caliper + axis */}
        <div className="ruler mt-0 h-2.5 border-t border-slab-ink-2/40" />
        <div className="relative h-3" aria-hidden="true">
          <div
            className="absolute top-0 h-px bg-signal-dim"
            style={{ left: `${pos(q1)}%`, width: `${pos(q3) - pos(q1)}%` }}
          >
            <span className="absolute left-0 top-0 h-2 w-px bg-signal-dim" />
            <span className="absolute right-0 top-0 h-2 w-px bg-signal-dim" />
          </div>
        </div>
        <div className="relative h-4">
          {AXIS_TICKS.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 font-mono text-[10px] tracking-[0.06em] text-slab-ink-2 tnum"
              style={{ left: `${pos(t)}%` }}
            >
              {t / 1000}k
            </span>
          ))}
        </div>

        {/* what the chart is saying, in words */}
        <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-slab-ink-2 tnum">
          <span className="mr-1.5 inline-block h-1.5 w-4 border-x border-t border-signal-dim align-middle" />
          Caliper = middle half of all reports,{" "}
          <span className="text-slab-ink">
            {formatTaka(q1)}–{formatTaka(q3)}
          </span>
          {modal && (
            <>
              {" · "}densest single band{" "}
              <span className="text-slab-ink">
                {formatTaka(modal.from)}–{formatTaka(modal.to)}
              </span>{" "}
              with {modal.count} reports
            </>
          )}
        </p>
      </div>
    </section>
  );
}
