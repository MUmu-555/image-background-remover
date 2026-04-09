// functions/api/paypal/create-order.js
// POST /api/paypal/create-order
// 创建积分包一次性支付订单

import { getSessionUser } from "../../_lib/session.js";
import { createPayPalOrder } from "../../_lib/paypal.js";

// 积分包定义（与前端保持一致）
const CREDIT_PACKS = {
  starter: { credits: 10, price: 3.4, name: "Starter Pack" },
  popular: { credits: 30, price: 9.9, name: "Popular Pack" },
  pro: { credits: 80, price: 24.9, name: "Pro Pack" },
  bulk: { credits: 200, price: 59.9, name: "Bulk Pack" },
};

export async function onRequestPost(context) {
  const { request, env } = context;

  // 验证登录状态（getSessionUser 第二个参数为 JWT secret）
  const user = await getSessionUser(request, env.SESSION_SECRET);
  if (!user) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const pack = CREDIT_PACKS[body.pack];
  if (!pack) {
    return Response.json({ error: "Invalid pack" }, { status: 400 });
  }

  try {
    // user.id 是 Google ID（session payload 中的 sub 字段）
    const order = await createPayPalOrder(env, pack, user.id);
    // 找到 approve URL
    const approveLink = order.links?.find((l) => l.rel === "approve");
    return Response.json({
      orderId: order.id,
      approveUrl: approveLink?.href,
    });
  } catch (err) {
    console.error("PayPal create order error:", err);
    return Response.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
