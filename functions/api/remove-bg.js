// Cloudflare Pages Function: POST /api/remove-bg
// 用量控制版：登录用户按计划额度，访客 IP 限流 3次/天

import { getSessionUser } from "../_lib/session.js";
import { getUserCredits, consumeCredit, checkGuestRateLimit } from "../_lib/credits.js";

const REMOVEBG_API = "https://api.remove.bg/v1.0/removebg";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.REMOVEBG_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Service not configured." }, { status: 500 });
  }

  // ── 用量检查 ─────────────────────────────────────────────
  const sessionUser = await getSessionUser(request, env.JWT_SECRET);

  if (sessionUser) {
    // 登录用户：检查月度额度 + 积分包
    const credits = await getUserCredits(env.DB, sessionUser.id);
    if (!credits) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }
    if (!credits.canUse) {
      return Response.json(
        {
          error: "credits_exhausted",
          message: `You've used all ${credits.limit} free credits this month. Purchase a credit pack to continue.`,
          credits,
        },
        { status: 429 }
      );
    }
  } else {
    // 访客：IP 限流 3次/天
    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "unknown";

    const rateLimit = await checkGuestRateLimit(env.RATE_LIMIT, ip);
    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: "guest_limit_reached",
          message: `You've used your 1 free monthly try. Sign in to get 5 free credits per month.`,
          remaining: 0,
        },
        { status: 429 }
      );
    }
  }

  // ── 图片校验 ─────────────────────────────────────────────
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid request. Please upload a valid image." }, { status: 400 });
  }

  const imageFile = formData.get("image");
  if (!imageFile) {
    return Response.json({ error: "No image provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    return Response.json({ error: "Please upload an image file (JPG, PNG, WEBP)." }, { status: 400 });
  }
  if (imageFile.size > MAX_SIZE) {
    return Response.json({ error: "Image must be under 20MB." }, { status: 400 });
  }

  // ── 调用 remove.bg ───────────────────────────────────────
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
    return Response.json({ error: "Failed to reach the processing service. Please try again." }, { status: 502 });
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

  // ── 扣减用量（调用成功后才扣）────────────────────────────
  if (sessionUser) {
    await consumeCredit(env.DB, sessionUser.id);
  }

  // ── 返回结果 ─────────────────────────────────────────────
  const imageBuffer = await rbRes.arrayBuffer();

  // 如果是登录用户，在响应头里带上最新额度
  const headers = {
    "Content-Type": "image/png",
    "Content-Disposition": 'attachment; filename="removed-background.png"',
    "Cache-Control": "no-store",
  };

  if (sessionUser) {
    const updatedCredits = await getUserCredits(env.DB, sessionUser.id);
    if (updatedCredits) {
      headers["X-Credits-Remaining"] = String(updatedCredits.totalRemaining);
      headers["X-Credits-Monthly-Remaining"] = String(updatedCredits.monthlyRemaining);
    }
  }

  return new Response(imageBuffer, { status: 200, headers });
}
