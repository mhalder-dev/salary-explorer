import SalaryExplorer from "@/app/components/SalaryExplorer";
import { SITE } from "@/lib/config";
import { salaries } from "@/lib/salaries";
import { computeStats, formatTaka } from "@/lib/format";

export default function Home() {
  const stats = computeStats(salaries);

  const tiles = [
    { label: "Records", value: stats.recordCount.toString() },
    { label: "Universities", value: stats.universityCount.toString() },
    { label: "Median monthly", value: formatTaka(stats.medianTotal) },
    { label: "Highest monthly", value: formatTaka(stats.maxTotal) },
  ];

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <header className="border-b border-black/5 bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                🇧🇩 Bangladesh · Private universities
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                {SITE.title}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {SITE.tagline}
              </p>
            </div>

            <a
              href={SITE.submitFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 8 1Z" />
              </svg>
              Submit / update info
            </a>
          </div>

          {/* Stat tiles */}
          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((t) => (
              <div
                key={t.label}
                className="rounded-xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t.label}
                </dt>
                <dd className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {t.value}
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
      <footer className="border-t border-black/5 bg-white dark:border-white/10 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Data is crowd-sourced and self-reported — treat figures as
            approximate. Originally compiled by{" "}
            <a
              href={SITE.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
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
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
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
