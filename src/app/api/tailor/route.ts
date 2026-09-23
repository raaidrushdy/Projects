import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const runtime = "nodejs";

const MAX_INPUT_CHARS = 20000;

interface TailorRequestBody {
  resume?: string;
  jobDescription?: string;
}

const TailorResultSchema = z.object({
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

  try {
    const message = await client.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      system:
        "You are an expert resume writer and career coach. You rewrite resumes to " +
        "highlight the experience most relevant to a specific job posting, without " +
        "inventing new facts, employers, titles, or dates that are not present in the " +
        "original resume. You also write a concise, specific cover letter (under 350 " +
        "words) tailored to the same job posting. The original resume text may come " +
        "from a PDF, Word doc, or LaTeX source, so it can contain stray formatting " +
        "artifacts, layout whitespace, or LaTeX commands — read through those to the " +
        "actual content and output the tailored resume as clean plain text regardless " +
        "of the input format.",
      messages: [
        {
          role: "user",
          content:
            `Job description:\n"""\n${jobDescription}\n"""\n\n` +
            `Original resume:\n"""\n${resume}\n"""\n\n` +
            "Tailor the resume to this job description (reorder, re-emphasize, and " +
            "rephrase existing bullet points/skills to match the posting's language and " +
            "priorities) and write a matching cover letter.",
        },
      ],
      output_config: {
        format: zodOutputFormat(TailorResultSchema),
      },
    });

    if (!message.parsed_output) {
      throw new Error("Model response did not match the expected schema");
    }

    return NextResponse.json(message.parsed_output);
  } catch (error) {
    console.error("Tailoring failed:", error);
    return NextResponse.json(
      { error: "Failed to generate tailored resume. Please try again." },
      { status: 502 },
    );
  }
}
