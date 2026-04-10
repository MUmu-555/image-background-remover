// functions/api/paypal/cancel-subscription.js
// POST /api/paypal/cancel-subscription
// 取消当前用户的 PayPal 订阅，并降级为 free

import { getSessionUser } from "../../_lib/session.js";
import { cancelPayPalSubscription } from "../../_lib/paypal.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const user = await getSessionUser(request, env.JWT_SECRET);
  if (!user) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  // 查找用户的订阅 ID
  const row = await env.DB.prepare(
    `SELECT paypal_subscription_id, plan FROM users WHERE google_id = ?`
  ).bind(user.id).first();

  if (!row || !row.paypal_subscription_id) {
    return Response.json({ error: "No active subscription found" }, { status: 400 });
  }

  if (row.plan === "free") {
    return Response.json({ error: "Already on free plan" }, { status: 400 });
  }

  try {
    const ok = await cancelPayPalSubscription(
      env,
      row.paypal_subscription_id,
      "User requested cancellation via dashboard"
    );

    if (!ok) {
      return Response.json({ error: "PayPal cancellation failed" }, { status: 500 });
    }

    // 降级为 free，清空 subscription_id
    await env.DB.prepare(
      `UPDATE users SET plan = 'free', paypal_subscription_id = NULL WHERE google_id = ?`
    ).bind(user.id).run();

    return Response.json({ success: true, message: "Subscription cancelled. You've been moved to the Free plan." });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return Response.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
