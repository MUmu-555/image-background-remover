// Cloudflare Pages Function: GET /api/auth/me
// 返回当前登录用户信息 + 用量数据

import { getSessionUser } from "../../_lib/session.js";
import { getUserCredits } from "../../_lib/credits.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  const user = await getSessionUser(request, env.JWT_SECRET);
  if (!user) {
    return Response.json({ user: null }, { status: 200 });
  }

  // 获取用量信息
  const credits = await getUserCredits(env.DB, user.id);

  return Response.json(
    {
      user: {
        ...user,
        credits: credits ?? {
          plan: "free",
          limit: 5,
          used: 0,
          monthlyRemaining: 5,
          bonusCredits: 0,
          totalRemaining: 5,
          canUse: true,
        },
      },
    },
    { status: 200 }
  );
}
