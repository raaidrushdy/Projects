import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import { FeedbackFooter } from "@/components/FeedbackFooter";
import "./globals.css";

// Manrope for app chrome (labels, buttons, UI text) — a deliberate choice
// over the unexamined Inter/Geist default. Source Serif for the tailored
// resume/cover letter output specifically: it's the one place in the app
// that should read as a document the user is about to submit somewhere,
// not as UI.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resumate — Tailor your resume in seconds",
  description:
    "Paste your resume and a job posting to get an AI-tailored resume and cover letter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <FeedbackFooter />
      </body>
    </html>
  );
}
