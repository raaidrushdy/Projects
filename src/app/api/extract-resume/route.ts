import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
// A large scanned PDF can take a while to parse; give it room on the platform's
// serverless timeout rather than risk a mid-parse cutoff.
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

type ExtractorResult = { text: string } | { error: string };

async function extractPdf(buffer: Buffer): Promise<ExtractorResult> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    // Use per-page text rather than result.text, which interleaves
    // "-- N of M --" page-separator markers into the concatenated string.
    return { text: result.pages.map((page) => page.text).join("\n\n") };
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractorResult> {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value };
}

function extractPlainText(buffer: Buffer): ExtractorResult {
  return { text: buffer.toString("utf-8") };
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let result: ExtractorResult;
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      result = await extractPdf(buffer);
    } else if (
      name.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      result = await extractDocx(buffer);
    } else if (name.endsWith(".tex") || name.endsWith(".txt")) {
      result = extractPlainText(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF, .docx, or .tex file." },
        { status: 400 },
      );
    }

    if ("error" in result) {
      return NextResponse.json(result, { status: 422 });
    }

    const text = result.text.trim();
    if (!text) {
      return NextResponse.json(
        { error: "Couldn't find any text in that file — it may be a scanned image." },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Resume extraction failed:", error);
    return NextResponse.json(
      { error: "Couldn't read that file. Try a different format or paste the text directly." },
      { status: 422 },
    );
  }
}
