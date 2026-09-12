import SalaryExplorer from "@/app/components/SalaryExplorer";
import Scope from "@/app/components/Scope";
import { SITE } from "@/lib/config";
import { salaries } from "@/lib/salaries";
import {
  buildHistogram,
  computeStats,
  formatTaka,
  scopeMarks,
} from "@/lib/format";

export default function Home() {
  const stats = computeStats(salaries);
  const buckets = buildHistogram(salaries);
  const marks = scopeMarks(salaries);

  const monthly = salaries.filter((r) => r.total !== null);
  const highest = monthly.reduce((a, b) => ((a.total ?? 0) >= (b.total ?? 0) ? a : b));
  const nonMonthly = salaries.length - monthly.length;
  const topMultiple = (stats.maxTotal / stats.medianTotal).toFixed(1);

  // Readings — three findings, written out. A wall of equal-weight stat tiles
  // says nothing; these say what the data actually shows.
  const readings = [
    {
      label: "The middle",
      figure: formatTaka(stats.medianTotal),
      note: `Half of every reported lecturer salary falls below this line. The single densest band sits between ${formatTaka(30_000)} and ${formatTaka(42_500)} — that is where most of the profession lives.`,
    },
    {
      label: "The ceiling",
      figure: formatTaka(stats.maxTotal),
      note: `${highest.shortName ?? highest.university}, ${highest.designation.toLowerCase()} — ${topMultiple}× the median. Only a handful of reports clear ${formatTaka(80_000)}, and the distribution above it is almost empty.`,
    },
    {
      label: "The floor",
      figure: formatTaka(stats.minTotal),
      note: `The lowest fixed monthly figure on record. A further ${nonMonthly} entries are not monthly at all — they are paid per course or per semester, so they sit outside the median entirely.`,
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
      a: "Use the “Add a salary” button in the header. It opens a structured submission form — your entry is reviewed and then added to the dataset.",
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
    <div className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <a
          href="#top"
          className="group flex items-center gap-2.5 no-underline"
          aria-label={SITE.name}
        >
          <span
            aria-hidden="true"
            className="size-3 bg-signal ring-1 ring-rule-2 transition group-hover:rotate-45"
          />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink">
            BD Faculty Salaries
          </span>
        </a>
        <a
          href={SITE.submitFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center rounded-full border-2 border-rule-2 bg-signal px-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-signal-ink transition hover:-translate-y-px hover:shadow-[0_3px_0_0_var(--rule-2)]"
        >
          Add a salary +
        </a>
      </header>

      {/* ── The slab: headline + the scope ───────────────────────────────── */}
      <section
        id="top"
        className="grain gridlines relative overflow-hidden border-y-2 border-rule-2 bg-slab"
      >
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-12 sm:pt-16">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slab-ink-2">
            <span className="text-signal">Crowd-sourced · unofficial</span>
            <span
              aria-hidden="true"
              className="hidden h-2.5 w-px bg-slab-ink-2/50 sm:block"
            />
            <span className="tnum">
              {stats.recordCount} records · {stats.universityCount} universities
              · synced {SITE.lastSynced}
            </span>
          </p>

          {/* Line breaks are set by hand: the marker swipe only reads as a
              gesture when it lands on a whole line of its own. */}
          <h1 className="display mt-6 text-[clamp(2.1rem,8.4vw,5.4rem)] font-extrabold leading-[0.98] text-slab-ink">
            <span className="block">Private university</span>
            <span className="hl hl-slab inline-block text-signal-ink">
              faculty salaries
            </span>
            <span className="block">in Bangladesh</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slab-ink-2 sm:text-base">
            {stats.recordCount} pay packets, reported by the people receiving
            them. Not a pay scale — a picture of what the job actually pays, and
            how far apart the top and the bottom of it really are.
          </p>

          <div className="mt-12 sm:mt-16">
            <Scope
              buckets={buckets}
              marks={marks}
              median={stats.medianTotal}
            />
          </div>
        </div>
      </section>

      {/* ── Readings ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="readings-heading" className="mx-auto max-w-5xl px-4 py-14">
        <h2
          id="readings-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3"
        >
          Three readings
        </h2>
        <div className="mt-5 grid gap-px border-t-2 border-rule-2 bg-rule sm:grid-cols-3">
          {readings.map((r) => (
            <div
              key={r.label}
              className="bg-paper pb-5 pr-4 pt-5 sm:pl-4 sm:first:pl-0"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                {r.label}
              </p>
              <p className="display mt-2 text-[clamp(2rem,5vw,2.9rem)] font-bold leading-none text-ink tnum">
                <span className="taka font-normal">
                  {r.figure.slice(0, 1)}
                </span>
                {r.figure.slice(1)}
              </p>
              <p className="mt-3 max-w-[34ch] text-[13.5px] leading-relaxed text-ink-2">
                {r.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The ladder ───────────────────────────────────────────────────── */}
      <main>
        <div className="mx-auto max-w-5xl px-4 pb-5">
          <h2 className="display text-[clamp(1.6rem,4vw,2.2rem)] font-bold leading-tight tracking-tight text-ink">
            Every record, ranked
          </h2>
          <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-ink-2">
            The shaded bar behind each row is that salary drawn to scale against
            the highest one reported. Open a row for the breakdown, bonuses and
            benefits.
          </p>
        </div>

        <SalaryExplorer records={salaries} maxTotal={stats.maxTotal} />

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="faq-heading"
          className="mx-auto max-w-5xl px-4 pb-16 pt-20"
        >
          <h2
            id="faq-heading"
            className="display text-[clamp(1.6rem,4vw,2.2rem)] font-bold leading-tight tracking-tight text-ink"
          >
            Questions people ask
          </h2>
          <div className="mt-6 border-t-2 border-rule-2">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-rule py-6 sm:gap-x-5 md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,3fr)]"
              >
                <span className="font-mono text-[11px] text-accent tnum">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display text-[16px] font-semibold leading-snug text-ink">
                  {f.q}
                </h3>
                <p className="col-start-2 mt-2 text-[14px] leading-relaxed text-ink-2 md:col-start-3 md:mt-0">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Colophon ─────────────────────────────────────────────────────── */}
      <footer className="grain relative border-t-2 border-rule-2 bg-slab">
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <p className="display text-xl font-bold text-slab-ink">
                Know a figure that is missing or wrong?
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slab-ink-2">
                Every row here came from somebody who filled in the form. One
                more entry makes the next person&rsquo;s picture sharper.
              </p>
            </div>
            <a
              href={SITE.submitFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full bg-signal px-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-signal-ink transition hover:-translate-y-px hover:shadow-[0_0_28px_-2px_var(--signal-dim)]"
            >
              Add a salary +
            </a>
          </div>

          <p className="mt-10 border-t border-slab-rule pt-5 font-mono text-[11px] leading-relaxed tracking-[0.02em] text-slab-ink-2">
            {SITE.name} · every figure is crowd-sourced, self-reported and
            approximate — check it before you negotiate with it. Data originally
            compiled by{" "}
            <a
              href={SITE.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal underline decoration-dotted underline-offset-4 hover:text-slab-ink"
            >
              {SITE.sourceName}
            </a>
            ; last synced {SITE.lastSynced}. {stats.recordCount} records ·{" "}
            {stats.universityCount} universities · {marks.length} monthly figures
            plotted. Set in Bricolage Grotesque, Instrument Sans &amp; JetBrains
            Mono.
          </p>
        </div>
      </footer>
    </div>
  );
}
