import SalaryExplorer from "@/app/components/SalaryExplorer";
import StatFigure from "@/app/components/StatFigure";
import { SITE } from "@/lib/config";
import { salaries } from "@/lib/salaries";
import { computeStats, formatTaka } from "@/lib/format";

export default function Home() {
  const stats = computeStats(salaries);

  const monthly = salaries.filter((r) => r.total !== null);
  const highest = monthly.reduce((a, b) => ((a.total ?? 0) >= (b.total ?? 0) ? a : b));

  const supporting = [
    { label: "Records", value: stats.recordCount.toString() },
    { label: "Universities", value: stats.universityCount.toString() },
    {
      label: "Reported range",
      value: `${formatTaka(stats.minTotal)}–${formatTaka(stats.maxTotal)}`,
    },
    { label: "Highest reported", value: formatTaka(stats.maxTotal) },
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
      a: "Use the “Submit / update info” link in the masthead. It opens a structured submission form — your entry is reviewed and then added to the dataset.",
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

      {/* N6 · Newspaper masthead */}
      <header className="px-4 pt-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            A crowd-sourced reference · {stats.recordCount} records ·{" "}
            {stats.universityCount} universities · synced {SITE.lastSynced}
          </p>
          <h1 className="mt-3 font-sans text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[0.98] tracking-[-0.014em] text-ink">
            {SITE.title}
          </h1>
          <nav aria-label="Primary" className="mt-3">
            <a
              href={SITE.submitFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.08em] text-accent underline decoration-1 underline-offset-4 transition hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Submit / update info
            </a>
          </nav>
          <hr className="rule-double mt-5" aria-hidden="true" />
        </div>
      </header>

      {/* Stat-Led hero — the median is the story */}
      <section className="px-4 pb-4 pt-10 sm:pt-14" aria-labelledby="lead-stat">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-end gap-x-10 gap-y-6 sm:grid-cols-[auto_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              Median monthly
            </p>
            <p
              id="lead-stat"
              className="mt-1 text-[clamp(4rem,12vw,8.5rem)] font-bold leading-none tracking-[-0.02em] text-ink"
            >
              <StatFigure value={stats.medianTotal} prefix="৳" />
            </p>
          </div>
          <div className="max-w-md sm:pb-3">
            <p className="font-serif text-lg leading-snug text-ink-secondary sm:text-xl">
              — what a lecturer at a private university in Bangladesh reports
              taking home each month. Self-reported, approximate, and searchable
              below.
            </p>
          </div>
        </div>

        {/* Supporting stats — hairline-ruled columns, tabular figures */}
        <dl className="mx-auto mt-10 grid max-w-5xl grid-cols-2 border-t border-line sm:grid-cols-4">
          {supporting.map((s) => (
            <div
              key={s.label}
              className="border-b border-line px-1 py-4 sm:border-b-0"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                {s.label}
              </dt>
              <dd className="tnum mt-1.5 text-lg font-semibold text-ink">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The tool */}
      <main className="mx-auto max-w-5xl px-4 pb-8">
        <SalaryExplorer records={salaries} maxTotal={stats.maxTotal} />

        {/* FAQ — hairline-ruled Q&A, editorial voice */}
        <section aria-labelledby="faq-heading" className="mt-16">
          <h2
            id="faq-heading"
            className="text-xl font-bold tracking-tight text-ink"
          >
            Frequently asked questions
          </h2>
          <div className="mt-4 border-t border-line">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="grid grid-cols-1 gap-x-10 gap-y-2 border-b border-line py-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              >
                <h3 className="text-[15px] font-semibold leading-snug text-ink">
                  {f.q}
                </h3>
                <p className="text-sm leading-relaxed text-ink-secondary">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Ft4 · Dense colophon */}
      <footer className="border-t border-line-strong bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <p className="font-mono text-xs leading-relaxed text-ink-muted">
            {SITE.name}. Crowd-sourced and self-reported — treat every figure as
            approximate. Data originally compiled by{" "}
            <a
              href={SITE.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-1 underline-offset-2 hover:text-accent-strong"
            >
              {SITE.sourceName}
            </a>
            ; last synced {SITE.lastSynced}. {stats.recordCount} records ·{" "}
            {stats.universityCount} universities. Corrections and new entries
            via{" "}
            <a
              href={SITE.submitFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-1 underline-offset-2 hover:text-accent-strong"
            >
              the submission form
            </a>
            . Set in Hanken Grotesk, Newsreader &amp; IBM Plex Mono.
          </p>
        </div>
      </footer>
    </div>
  );
}
