// Central place for anything you might want to tweak without hunting through components.

export const SITE = {
  name: "BD Faculty Salaries",
  title: "Bangladesh Private University — Faculty Salaries",
  tagline:
    "Crowd-sourced, self-reported monthly salaries for faculty at private universities in Bangladesh.",

  // Where the "Submit / Update salary info" button points.
  // Replace this with your OWN Google Form or Tally form URL (see README.md).
  // For now it points at the original crowd-sourcing page.
  submitFormUrl: "https://asif-saad.github.io/blog/salary-by-faculty/",

  // Attribution for the underlying data.
  sourceName: "Asif Saad",
  sourceUrl: "https://asif-saad.github.io/blog/salary-by-faculty/",

  // Last time the dataset in lib/salaries.ts was synced from the source.
  lastSynced: "July 2026",
} as const;
