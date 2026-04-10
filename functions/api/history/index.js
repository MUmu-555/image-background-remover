// Cloudflare Pages Function: GET /api/history
// 返回当前登录用户的图片处理历史（分页）

import { getSessionUser } from "../../_lib/session.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  const sessionUser = await getSessionUser(request, env.JWT_SECRET);
  if (!sessionUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  try {
    // 查询历史记录
    const [rows, countRow] = await Promise.all([
      env.DB.prepare(
        `SELECT id, r2_key, original_filename, file_size, created_at
         FROM history
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
        .bind(sessionUser.id, limit, offset)
        .all(),
      env.DB.prepare(`SELECT COUNT(*) as total FROM history WHERE user_id = ?`)
        .bind(sessionUser.id)
        .first(),
    ]);

    const total = countRow?.total ?? 0;

    // 为每条记录生成临时下载 URL（有效期 1 小时）
    const items = await Promise.all(
      (rows.results || []).map(async (row) => {
        let downloadUrl = null;
        if (env.HISTORY_BUCKET) {
          try {
            // R2 presigned URL（1小时有效）
            const obj = await env.HISTORY_BUCKET.get(row.r2_key);
            // Cloudflare R2 不直接支持 presigned URL，改为走 /api/history/:id/download
            downloadUrl = `/api/history/${row.id}/download`;
          } catch {}
        }
        return {
          id: row.id,
          originalFilename: row.original_filename,
          fileSize: row.file_size,
          createdAt: row.created_at,
          downloadUrl,
          // 缩略图也走同一接口
          thumbnailUrl: `/api/history/${row.id}/download`,
        };
      })
    );

    return Response.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
    });
  } catch (e) {
    console.error("History fetch error:", e);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
