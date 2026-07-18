import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default:
      "Private University Faculty Salary in Bangladesh — Lecturer Pay Data (BD)",
    template: `%s — ${SITE.name}`,
  },
  description:
    "How much do lecturers earn at private universities in Bangladesh? Crowd-sourced monthly salary data for 50+ universities — NSU, BRAC, EWU, AUST, UIU and more. Search by university, city, and employment type; see basic pay, allowances, bonuses and benefits.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
