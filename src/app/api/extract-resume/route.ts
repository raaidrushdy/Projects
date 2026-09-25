import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

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

  if (!file.name.toLowerCase().endsWith(".tex")) {
    return NextResponse.json({ error: "Unsupported file type. Upload a .tex file." }, { status: 400 });
  }

  const text = (await file.text()).trim();
  if (!text) {
    return NextResponse.json({ error: "That file is empty." }, { status: 422 });
  }

  return NextResponse.json({ text });
}
