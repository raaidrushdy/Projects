import type { Metadata } from "next";
import { Fredoka, Manrope, Source_Serif_4 } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/Footer";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Geist for headings and monospace chrome (line numbers, counters, the
// loading log) — reaching for it deliberately this time, because the brief
// is explicitly "push this toward the Linear/Vercel aesthetic," and Geist is
// that aesthetic's own typeface. Manrope stays as the body/paragraph font
// (still very legible, gives headings something to contrast against rather
// than every size of the same face). Source Serif is unchanged for the
// tailored resume/cover letter output. Fredoka stays on the wordmark only.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Redrafted: tailor your LaTeX resume in seconds",
  description:
    "Paste your .tex resume and a job posting to get an AI-tailored resume and cover letter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${sourceSerif.variable} ${fredoka.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        {/* Sets data-theme before first paint (localStorage, else system
            preference) so there's no flash of the wrong theme. A plain text
            child, not dangerouslySetInnerHTML — the string is a fixed
            constant, never user input. */}
        <script>{THEME_INIT_SCRIPT}</script>
      </head>
      <body className="flex flex-col">
        {children}
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
