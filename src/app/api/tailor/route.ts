import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { looksLikeLatex } from "@/lib/latex";

export const runtime = "nodejs";
// Adaptive thinking + a 16k output budget can comfortably exceed the platform's
// default serverless timeout; this is the max duration Vercel's Hobby plan allows.
export const maxDuration = 60;

const MAX_INPUT_CHARS = 20000;

interface TailorRequestBody {
  resume?: string;
  jobDescription?: string;
}

const TailorResultSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe("How well the ORIGINAL resume (before rewriting) matches the job description, 0-100."),
  missingKeywords: z
    .array(z.string())
    .max(5)
    .describe("Up to 5 skills/terms the job description emphasizes that the ORIGINAL resume is missing."),
  redFlags: z
    .array(z.string())
    .max(3)
    .describe(
      "Up to 3 short, specific issues a hiring manager would notice in the ORIGINAL resume within 10 seconds.",
    ),
  tailoredResume: z.string(),
  coverLetter: z.string(),
});

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Set it in .env.local to enable tailoring." },
      { status: 500 },
    );
  }

  let body: TailorRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const resume = body.resume?.trim() ?? "";
  const jobDescription = body.jobDescription?.trim() ?? "";

  if (!resume || !jobDescription) {
    return NextResponse.json(
      { error: "Both resume and jobDescription are required" },
      { status: 400 },
    );
  }

  if (resume.length > MAX_INPUT_CHARS || jobDescription.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Inputs must each be under ${MAX_INPUT_CHARS} characters` },
      { status: 400 },
    );
  }

  const client = new Anthropic({ apiKey });
  const isLatex = looksLikeLatex(resume);

  const rewriteInstruction = isLatex
    ? "2. The original resume is LaTeX source. Edit it in place: reword bullet " +
      "content, reorder items or sections where it helps the match, and work in " +
      "the missing keywords wherever truthful — but preserve the document's " +
      "existing structure, preamble, packages, and custom commands exactly. " +
      "Where the original supports it, phrase bullets as 'accomplished X, as " +
      "measured by Y, by doing Z' — but never invent a metric, employer, title, " +
      "or date that isn't in the original; if there's no real number to cite, " +
      "keep the bullet qualitative rather than fabricate one. tailoredResume must " +
      "be the ENTIRE document from \\documentclass through \\end{document} with " +
      "your edits applied — valid, compilable LaTeX, not a fragment, not rebuilt " +
      "from scratch, no markdown code fences, no commentary outside the source.\n"
    : "2. Rewrite the resume to close those gaps: naturally work in the missing " +
      "keywords wherever truthful, and fix the red flags. Where the original resume " +
      "supports it, phrase bullets as 'accomplished X, as measured by Y, by doing Z' " +
      "— but never invent a metric, employer, title, or date that isn't in the " +
      "original; if there's no real number to cite, keep the bullet qualitative " +
      "rather than fabricate one. The original resume text may come from a PDF or " +
      "Word doc, so it can contain stray formatting artifacts or layout whitespace " +
      "— read through those to the actual content, and output the tailored resume " +
      "as clean plain text.\n";

  try {
    const message = await client.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system:
        "You are an expert resume writer and a senior technical recruiter for the " +
        "exact company/role in the job description below. Work through this in order:\n\n" +
        "1. As the recruiter, score how well the ORIGINAL resume matches the job " +
        "description (0-100), list up to 5 important keywords/skills the posting " +
        "emphasizes that the original resume doesn't mention, and up to 3 specific red " +
        "flags a hiring manager would notice in the first 10 seconds (e.g. no measurable " +
        "impact, buried relevant experience, jargon mismatch with the posting). Read " +
        "through any markup (LaTeX commands, PDF/Word extraction artifacts) to the " +
        "actual content for this analysis.\n" +
        rewriteInstruction +
        "3. Re-read your rewrite as an ATS filter and as a hiring manager skimming 200 " +
        "resumes in one sitting — if any section would still get skipped, revise it.\n" +
        "4. Write a concise, specific cover letter (under 350 words) for the same " +
        "posting, as plain text.\n\n" +
        "Report matchScore, missingKeywords, and redFlags for the ORIGINAL resume " +
        "(step 1, before your rewrite) so the user can see what was wrong and what you " +
        "fixed — not a re-score of your own output.",
      messages: [
        {
          role: "user",
          content:
            `Job description:\n"""\n${jobDescription}\n"""\n\n` +
            `Original resume:\n"""\n${resume}\n"""`,
        },
      ],
      output_config: {
        format: zodOutputFormat(TailorResultSchema),
      },
    });

    if (!message.parsed_output) {
      throw new Error("Model response did not match the expected schema");
    }

    return NextResponse.json({ ...message.parsed_output, isLatex });
  } catch (error) {
    console.error("Tailoring failed:", error);
    return NextResponse.json(
      { error: "Failed to generate tailored resume. Please try again." },
      { status: 502 },
    );
  }
}
