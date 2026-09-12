import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import localFont from "next/font/local";
import { SITE } from "@/lib/config";
import "./globals.css";

// "Instrument" type system:
//   Bricolage — display + every numeral. The wdth axis lets headline sizes be
//   pulled narrow and machined (see .display in globals.css). Its opsz axis is
//   deliberately NOT requested: it added 52 kB to the critical path for a
//   refinement the manual letter-spacing already covers.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Instrument Sans — running text and UI. Slightly condensed, un-Inter.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

// JetBrains Mono — machine labels, readouts, axis ticks.
const jet = JetBrains_Mono({
  variable: "--font-jet",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Latin faces have no ৳ (U+09F3): without a face that carries it, the taka sign
// falls back to an arbitrary system font and sits visibly wrong against the
// numerals. The full Bengali family costs ~230 kB for that one glyph, so this is
// Noto Sans Bengali subset to U+09F3 alone — 812 bytes. Chained into every font
// stack in globals.css and scoped by unicode-range, so it is used for ৳ and
// nothing else.
const bengali = localFont({
  src: "./fonts/noto-taka-subset.woff2",
  variable: "--font-bengali",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+09F3" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default:
      "Private University Faculty Salary in Bangladesh — Lecturer Pay Data (BD)",
    template: `%s — ${SITE.name}`,
  },
  description:
    "How much do lecturers earn at private universities in Bangladesh? Crowd-sourced monthly salary data for 50+ universities — NSU, BRAC, EWU, AUST, UIU and more. Drag the scope to see where any salary lands in the distribution, then search by university, city, and employment type.",
  keywords: [
    "private university lecturer salary Bangladesh",
    "faculty salary Bangladesh",
    "university teacher salary BD",
    "lecturer pay private university",
    "NSU lecturer salary",
    "BRAC University lecturer salary",
    "assistant lecturer salary Bangladesh",
    "university job salary BD",
  ],
  alternates: { canonical: "./" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: "Private University Faculty Salaries in Bangladesh",
    description:
      "Searchable, crowd-sourced monthly salary data for faculty at 50+ private universities in Bangladesh.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Private University Faculty Salaries in Bangladesh",
    description:
      "Searchable, crowd-sourced monthly salary data for faculty at 50+ private universities in Bangladesh.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${jet.variable} ${bengali.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper">{children}</body>
    </html>
  );
}
