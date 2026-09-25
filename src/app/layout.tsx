import type { Metadata } from "next";
import { Fredoka, Manrope, Source_Serif_4 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/Footer";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Manrope for app chrome (labels, buttons, UI text) — a deliberate choice
// over the unexamined Inter/Geist default. Source Serif for the tailored
// resume/cover letter output specifically: it's the one place in the app
// that should read as a document the user is about to submit somewhere,
// not as UI. Fredoka for the wordmark only — one place for personality,
// not spread across the whole UI.
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
      className={`${manrope.variable} ${sourceSerif.variable} ${fredoka.variable} antialiased`}
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
