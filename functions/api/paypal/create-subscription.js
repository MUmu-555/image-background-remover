// functions/api/paypal/create-subscription.js
// POST /api/paypal/create-subscription
// 创建订阅（Pro / Business 套餐）

import { getSessionUser } from "../../_lib/session.js";
import { createPayPalSubscription } from "../../_lib/paypal.js";

// PayPal Billing Plan IDs（需要在 PayPal 后台创建，然后填入环境变量）
function getPlanId(env, plan, billing) {
  const key = `PAYPAL_PLAN_${plan.toUpperCase()}_${billing.toUpperCase()}`;
  return env[key];
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 验证登录
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

  const { plan, billing } = body;
  if (!["pro", "business"].includes(plan) || !["monthly", "yearly"].includes(billing)) {
    return Response.json({ error: "Invalid plan or billing period" }, { status: 400 });
  }

  const planId = getPlanId(env, plan, billing);
  if (!planId) {
    return Response.json(
      { error: `PayPal plan not configured: ${plan}_${billing}` },
      { status: 500 }
    );
  }

  try {
    // user.id 是 Google ID
    const subscription = await createPayPalSubscription(env, planId, user.id);
    const approveLink = subscription.links?.find((l) => l.rel === "approve");
    return Response.json({
      subscriptionId: subscription.id,
      approveUrl: approveLink?.href,
    });
  } catch (err) {
    console.error("PayPal create subscription error:", err);
    return Response.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
