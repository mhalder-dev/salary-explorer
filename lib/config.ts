// Central place for anything you might want to tweak without hunting through components.

export const SITE = {
  name: "BD Faculty Salaries",
  title: "Private University Faculty Salaries in Bangladesh",
  tagline:
    "Crowd-sourced, self-reported monthly salaries for lecturers and faculty at private universities in Bangladesh — searchable by university, city, and employment type.",

  /** Canonical production URL (no trailing slash). Used for SEO metadata + sitemap. */
  url: "https://mhalder-dev.github.io/salary-explorer",

  // Where the "Submit / update salary info" button points.
  // Currently a structured GitHub Issue Form in this repo — submissions arrive
  // as issues for review. Swap for a Google Form / Tally URL anytime.
  submitFormUrl:
    "https://github.com/mhalder-dev/salary-explorer/issues/new?template=salary-submission.yml",

  // Attribution for the underlying data.
  sourceName: "Asif Saad",
  sourceUrl: "https://asif-saad.github.io/blog/salary-by-faculty/",

  // Last time the dataset in lib/salaries.ts was synced from the source.
  lastSynced: "July 2026",
} as const;
