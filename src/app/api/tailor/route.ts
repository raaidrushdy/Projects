import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { MAX_INPUT_CHARS } from "@/lib/limits";

export const runtime = "nodejs";
// Vercel Hobby's default AND maximum is actually 300s with Fluid Compute
// (enabled by default for any project created after April 2025, which this
// one is) — the old assumption baked into this file, that Hobby hard-caps at
// 60s, was outdated and this constant was the real bottleneck. 120s leaves
// large headroom over every observed run (worst case ~27s pre-optimization,
// well under that now) while stopping well short of the 300s ceiling, in
// case Fluid Compute somehow isn't active for this project — verify in the
// Vercel dashboard under Settings -> Functions -> Fluid Compute if timeouts
// still occur after this change ships.
export const maxDuration = 120;

// Above this, the analysis+rewrite call switches from Sonnet to Haiku (see
// below) for extra latency margin exactly where the risk concentrates: the
// call's generation time scales with input size, since it produces the full
// rewritten LaTeX document.
const LARGE_INPUT_THRESHOLD = 9000;

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
});

const CoverLetterResultSchema = z.object({
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

  const rewriteInstruction =
    "2. The original resume is LaTeX source. Edit it in place: reword bullet " +
    "content, reorder items or sections where it helps the match, and work in " +
    "the missing keywords wherever truthful — but preserve the document's " +
    "existing structure, preamble, packages, and custom commands exactly. " +
    "Where the original supports it, phrase bullets as 'accomplished X, as " +
    "measured by Y, by doing Z' — but never invent a metric, employer, title, " +
    "or date that isn't in the original; if there's no real number to cite, " +
    "keep the bullet qualitative rather than fabricate one. tailoredResume must " +
    "be the ENTIRE document from \\documentclass through \\end{document} with " +
    "your edits applied — valid, compilable LaTeX, not a fragment, not rebuilt " +
    "from scratch, no markdown code fences, no commentary outside the source.\n";

  const userContent =
    `Job description:\n"""\n${jobDescription}\n"""\n\n` + `Original resume:\n"""\n${resume}\n"""`;

  try {
    // A non-streaming call sits fully buffered until generation finishes, so
    // nothing comes back to Vercel until the last token is out — on a complex
    // LaTeX resume that can trip a bare, non-JSON 504 before our own error
    // handling below ever runs. Streaming (still awaited to one final
    // response here, nothing is pushed to the client mid-generation)
    // sidesteps that. maxDuration (see above) is still a hard cap on total
    // wall time regardless of streaming, and the original single-call
    // version generated the analysis, the full rewritten LaTeX, a
    // self-critique pass, AND the cover letter serially in one completion —
    // long enough on a large resume to blow through even the raised cap. The
    // cover letter doesn't depend on the rewritten resume (same underlying
    // facts, just different phrasing), so it's split into its own smaller,
    // lower-effort call and run concurrently with the analysis+rewrite call:
    // wall time is now roughly the slower of the two instead of their sum.
    //
    // Timeouts kept recurring in production even after that split, so the
    // remaining bottleneck (the analysis+rewrite call, since it generates the
    // full LaTeX document) is now effort "low" instead of "medium" — this
    // does trade some rewrite quality/thoroughness for a further latency
    // cut. On top of that, large inputs (see LARGE_INPUT_THRESHOLD above)
    // switch this call to Haiku, which is meaningfully faster per token than
    // Sonnet. Haiku 4.5 doesn't support output_config.effort (the API
    // rejects it) or thinking: {type: "adaptive"} (it only takes the older
    // budget_tokens form) — this rewrite doesn't need extended thinking, so
    // thinking is omitted entirely for the Haiku path rather than ported
    // over in its older shape.
    const analysisSystemPrompt =
      "You are an expert resume writer and a senior technical recruiter for the " +
      "exact company/role in the job description below. Work through this in order:\n\n" +
      "1. As the recruiter, score how well the ORIGINAL resume matches the job " +
      "description (0-100), list up to 5 important keywords/skills the posting " +
      "emphasizes that the original resume doesn't mention, and up to 3 specific red " +
      "flags a hiring manager would notice in the first 10 seconds (e.g. no measurable " +
      "impact, buried relevant experience, jargon mismatch with the posting). Read " +
      "through the LaTeX markup to the actual content for this analysis.\n" +
      rewriteInstruction +
      "3. Re-read your rewrite as an ATS filter and as a hiring manager skimming 200 " +
      "resumes in one sitting — if any section would still get skipped, revise it.\n\n" +
      "Report matchScore, missingKeywords, and redFlags for the ORIGINAL resume " +
      "(step 1, before your rewrite) so the user can see what was wrong and what you " +
      "fixed — not a re-score of your own output.";

    const isLargeInput = resume.length > LARGE_INPUT_THRESHOLD;

    const [analysis, coverLetter] = await Promise.all([
      client.messages
        .stream(
          isLargeInput
            ? {
                model: "claude-haiku-4-5",
                max_tokens: 12000,
                system: analysisSystemPrompt,
                messages: [{ role: "user", content: userContent }],
                output_config: { format: zodOutputFormat(TailorResultSchema) },
              }
            : {
                model: "claude-sonnet-5",
                max_tokens: 12000,
                thinking: { type: "adaptive" },
                system: analysisSystemPrompt,
                messages: [{ role: "user", content: userContent }],
                output_config: {
                  format: zodOutputFormat(TailorResultSchema),
                  effort: "low",
                },
              },
        )
        .finalMessage(),
      client.messages
        .stream({
          model: "claude-sonnet-5",
          max_tokens: 1500,
          thinking: { type: "adaptive" },
          system:
            "You are an expert resume writer helping a candidate apply for the exact role " +
            "in the job description below. Write a concise, specific cover letter (under " +
            "350 words) for this candidate applying to this posting, as plain text. Base it " +
            "only on the candidate's real resume content below (it's LaTeX source — read " +
            "through the markup to the actual content) — never invent a metric, employer, " +
            "title, or date that isn't in the original.",
          messages: [{ role: "user", content: userContent }],
          output_config: {
            format: zodOutputFormat(CoverLetterResultSchema),
            effort: "low",
          },
        })
        .finalMessage(),
    ]);

    if (!analysis.parsed_output || !coverLetter.parsed_output) {
      throw new Error("Model response did not match the expected schema");
    }

    return NextResponse.json({
      ...analysis.parsed_output,
      coverLetter: coverLetter.parsed_output.coverLetter,
    });
  } catch (error) {
    console.error("Tailoring failed:", error);
    return NextResponse.json(
      { error: "Failed to generate tailored resume. Please try again." },
      { status: 502 },
    );
  }
}
