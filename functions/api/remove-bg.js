// Cloudflare Pages Function: /api/remove-bg
// Runs on Cloudflare Edge — replaces the Next.js API route

const REMOVEBG_API = "https://api.remove.bg/v1.0/removebg";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.REMOVEBG_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Service not configured. Please try again later." },
      { status: 500 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Invalid request. Please upload a valid image." },
      { status: 400 }
    );
  }

  const imageFile = formData.get("image");
  if (!imageFile) {
    return Response.json({ error: "No image provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    return Response.json(
      { error: "Please upload an image file (JPG, PNG, WEBP)." },
      { status: 400 }
    );
  }

  if (imageFile.size > MAX_SIZE) {
    return Response.json(
      { error: "Image must be under 20MB." },
      { status: 400 }
    );
  }

  // Forward to remove.bg
  const rbFormData = new FormData();
  rbFormData.append("image_file", imageFile);
  rbFormData.append("size", "auto");

  let rbRes;
  try {
    rbRes = await fetch(REMOVEBG_API, {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: rbFormData,
    });
  } catch {
    return Response.json(
      { error: "Failed to reach the processing service. Please try again." },
      { status: 502 }
    );
  }

  if (!rbRes.ok) {
    let msg = `Server error ${rbRes.status}.`;
    try {
      const errBody = await rbRes.json();
      const title = errBody?.errors?.[0]?.title;
      if (title) msg = title;
      else if (rbRes.status === 402) msg = "API credits exhausted.";
      else if (rbRes.status === 403) msg = "Invalid API key.";
      else if (rbRes.status === 429) msg = "Too many requests. Please try again later.";
    } catch {}
    return Response.json({ error: msg }, { status: rbRes.status });
  }

  const imageBuffer = await rbRes.arrayBuffer();

  return new Response(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="removed-background.png"',
      "Cache-Control": "no-store",
    },
  });
}
