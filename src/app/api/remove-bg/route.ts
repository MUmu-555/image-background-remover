import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const REMOVEBG_API = "https://api.remove.bg/v1.0/removebg";

export async function POST(req: NextRequest) {
  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured." }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  // Size check (20MB)
  if (imageFile.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 20MB." }, { status: 400 });
  }

  // Forward to remove.bg
  const rbFormData = new FormData();
  rbFormData.append("image_file", imageFile);
  rbFormData.append("size", "auto");

  let rbRes: Response;
  try {
    rbRes = await fetch(REMOVEBG_API, {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: rbFormData,
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach remove.bg API." }, { status: 502 });
  }

  if (!rbRes.ok) {
    const errBody = await rbRes.json().catch(() => ({}));
    const msg =
      (errBody?.errors?.[0]?.title) ||
      (rbRes.status === 402 ? "API credits exhausted." : `remove.bg error ${rbRes.status}`);
    return NextResponse.json({ error: msg }, { status: rbRes.status });
  }

  const imageBuffer = await rbRes.arrayBuffer();

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="removed-background.png"',
      "Cache-Control": "no-store",
    },
  });
}
