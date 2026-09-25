import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy: Redrafted",
  description: "What Redrafted does and doesn't do with your resume and job posting.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:max-w-4xl">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
            <p className="text-sm text-muted">Last updated September 2026.</p>
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-line bg-panel p-6 text-sm leading-relaxed sm:p-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">What we collect</h2>
              <p>
                The resume and job posting text you paste or upload, held in memory only for as
                long as it takes to generate your tailored resume and cover letter. Redrafted has
                no database and doesn&apos;t write that text to disk.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">Where it goes</h2>
              <p>
                Your resume and the job posting are sent to Anthropic&apos;s API to generate the
                tailored result. That&apos;s the only third party involved. Nothing you submit is
                used to train any model, ours or Anthropic&apos;s.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">Uploaded files</h2>
              <p>
                A .tex file you upload is read as plain text on our server and the file itself is
                discarded immediately after. We never store the original file.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">What stays on your device</h2>
              <p>
                Your theme preference (light or dark) and a count of how many times you&apos;ve
                used the free tier on this browser are kept in your browser&apos;s local storage.
                Neither ever leaves your device or reaches us.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">Analytics</h2>
              <p>
                We use Vercel Speed Insights to see aggregate page performance (load times, that
                kind of thing). It doesn&apos;t see your resume, your job posting, or anything you
                type.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">Cookies</h2>
              <p>Redrafted doesn&apos;t set cookies.</p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">Questions</h2>
              <p>
                Email{" "}
                <a
                  href="mailto:raaidrushdy@gmail.com"
                  className="font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:decoration-accent"
                >
                  raaidrushdy@gmail.com
                </a>{" "}
                and we&apos;ll get back to you.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
