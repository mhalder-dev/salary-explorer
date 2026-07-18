import SalaryExplorer from "@/app/components/SalaryExplorer";
import { SITE } from "@/lib/config";
import { salaries } from "@/lib/salaries";
import { computeStats, formatTaka } from "@/lib/format";

export default function Home() {
  const stats = computeStats(salaries);

  const tiles = [
    {
      label: "Records",
      value: stats.recordCount.toString(),
      caption: "Self-reported entries",
    },
    {
      label: "Universities",
      value: stats.universityCount.toString(),
      caption: "Institutions covered",
    },
    {
      label: "Median monthly",
      value: formatTaka(stats.medianTotal),
      caption: "Across all records",
    },
    {
      label: "Highest monthly",
      value: formatTaka(stats.maxTotal),
      caption: "Single reported record",
    },
  ];

  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:pt-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
                Bangladesh — Private universities
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.12]">
                {SITE.title}
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
                {SITE.tagline}
              </p>
            </div>

            <a
              href={SITE.submitFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-contrast shadow-sm transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 8 1Z" />
              </svg>
              Submit / update info
            </a>
          </div>

          {/* Stat strip */}
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="flex flex-col">
                <dd className="order-2 mt-3 text-[26px] font-semibold leading-none tracking-tight text-accent">
                  {t.value}
                </dd>
                <dt className="order-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-secondary">
                  <span
                    aria-hidden
                    className="mb-2.5 block h-0.5 w-6 rounded-full bg-accent"
                  />
                  {t.label}
                </dt>
                <dd className="order-3 mt-1.5 text-xs text-ink-muted">
                  {t.caption}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Explorer */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <SalaryExplorer records={salaries} maxTotal={stats.maxTotal} />
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm leading-relaxed text-ink-muted">
          <p>
            Data is crowd-sourced and self-reported — treat figures as
            approximate. Originally compiled by{" "}
            <a
              href={SITE.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:text-accent-strong hover:underline"
            >
              {SITE.sourceName}
            </a>
            . Last synced {SITE.lastSynced}.
          </p>
          <p className="mt-2">
            Spotted something wrong or missing?{" "}
            <a
              href={SITE.submitFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:text-accent-strong hover:underline"
            >
              Submit an update
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
