import SalaryExplorer from "@/app/components/SalaryExplorer";
import { SITE } from "@/lib/config";
import { salaries } from "@/lib/salaries";
import { computeStats, formatTaka } from "@/lib/format";

export default function Home() {
  const stats = computeStats(salaries);

  const monthly = salaries.filter((r) => r.total !== null);
  const highest = monthly.reduce((a, b) => ((a.total ?? 0) >= (b.total ?? 0) ? a : b));

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

  const faqs = [
    {
      q: "What is the salary of a lecturer at a private university in Bangladesh?",
      a: `Based on ${stats.recordCount} self-reported records covering ${stats.universityCount} private universities, monthly lecturer salaries range from about ${formatTaka(stats.minTotal)} to ${formatTaka(stats.maxTotal)}, with a median of ${formatTaka(stats.medianTotal)}. Most entries also include festival bonuses, yearly increments, and extra-credit teaching payments on top of the monthly figure.`,
    },
    {
      q: "Which private university pays lecturers the highest salary in Bangladesh?",
      a: `Among the reported records, the highest monthly salary is ${formatTaka(highest.total!)} for a ${highest.designation} at ${highest.university}. Other high-paying reports include BRAC University (৳85,500 permanent lecturer), East West University (৳79,000), and United International University (৳78,000).`,
    },
    {
      q: "Is this salary data official?",
      a: `No. All figures are crowd-sourced and self-reported by faculty members, originally compiled by ${SITE.sourceName}. Treat them as approximate indicators, not official pay scales. Each record shows when it was last updated.`,
    },
    {
      q: "How can I add or correct salary information?",
      a: "Use the “Submit / update info” button at the top of the page. It opens a structured submission form — your entry is reviewed and then added to the dataset.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        description: SITE.tagline,
      },
      {
        "@type": "Dataset",
        name: "Private University Faculty Salaries in Bangladesh",
        description:
          "Crowd-sourced, self-reported monthly salary records for lecturers and faculty at private universities in Bangladesh, including basic pay, allowances, bonuses and benefits.",
        url: SITE.url,
        creator: { "@type": "Person", name: SITE.sourceName, url: SITE.sourceUrl },
        keywords: [
          "lecturer salary Bangladesh",
          "private university faculty pay",
          "university teacher salary BD",
        ],
        variableMeasured: "Monthly salary (BDT)",
        temporalCoverage: "2023/2026",
        spatialCoverage: { "@type": "Country", name: "Bangladesh" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="flex-1 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="border-b border-line bg-gradient-to-b from-accent-wash to-surface">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:pt-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent-strong">
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
                <dd className="order-2 mt-3 text-[26px] font-semibold leading-none tracking-tight text-accent-strong">
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

        {/* FAQ — visible content backing the FAQPage structured data */}
        <section aria-labelledby="faq-heading" className="mt-16">
          <h2
            id="faq-heading"
            className="text-xl font-semibold tracking-tight text-ink"
          >
            Frequently asked questions
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <h3 className="text-sm font-semibold leading-snug text-ink">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
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
              className="font-medium text-accent-strong hover:underline"
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
              className="font-medium text-accent-strong hover:underline"
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
