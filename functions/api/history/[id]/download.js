// Cloudflare Pages Function: GET /api/history/[id]/download
// 从 R2 返回指定历史记录的处理后图片

import { getSessionUser } from "../../../_lib/session.js";

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const sessionUser = await getSessionUser(request, env.JWT_SECRET);
  if (!sessionUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (!id || isNaN(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  if (!env.HISTORY_BUCKET) {
    return new Response("History storage not configured", { status: 503 });
  }

  try {
    // 查询记录，确保只能访问自己的历史
    const row = await env.DB.prepare(
      `SELECT r2_key, original_filename FROM history WHERE id = ? AND user_id = ?`
    )
      .bind(id, sessionUser.id)
      .first();

    if (!row) {
      return new Response("Not found", { status: 404 });
    }

    // 从 R2 获取对象
    const obj = await env.HISTORY_BUCKET.get(row.r2_key);
    if (!obj) {
      return new Response("Image not found in storage", { status: 404 });
    }

    const baseName = row.original_filename?.replace(/\.[^.]+$/, "") || "image";
    const filename = `${baseName}-removed.png`;

    return new Response(obj.body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("History download error:", e);
    return new Response("Failed to retrieve image", { status: 500 });
  }
}
