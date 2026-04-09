// functions/api/paypal/subscription/success.js
// GET /api/paypal/subscription/success?subscription_id=xxx&ba_token=xxx
// PayPal 订阅激活成功回调

import { getPayPalSubscription } from "../../../_lib/paypal.js";

// 套餐名 -> plan 字段映射（根据 PayPal Plan ID 反推）
function getPlanFromPlanId(env, planId) {
  if (planId === env.PAYPAL_PLAN_PRO_MONTHLY || planId === env.PAYPAL_PLAN_PRO_YEARLY)
    return "pro";
  if (planId === env.PAYPAL_PLAN_BUSINESS_MONTHLY || planId === env.PAYPAL_PLAN_BUSINESS_YEARLY)
    return "business";
  return null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const subscriptionId = url.searchParams.get("subscription_id");
  const origin = env.SITE_ORIGIN || "https://image-backgroundremover.com";

  if (!subscriptionId) {
    return Response.redirect(`${origin}/pricing?error=missing_subscription_id`, 302);
  }

  try {
    const sub = await getPayPalSubscription(env, subscriptionId);

    // 接受 ACTIVE 或 APPROVAL_PENDING（用户刚完成订阅时可能还未激活）
    if (!["ACTIVE", "APPROVAL_PENDING"].includes(sub.status)) {
      console.error("Subscription not active:", sub.status);
      return Response.redirect(`${origin}/pricing?error=subscription_not_active`, 302);
    }

    // custom_id 格式: "sub:{userId}"
    const userId = sub.custom_id?.replace("sub:", "");
    if (!userId) {
      console.error("Subscription: missing userId in custom_id");
      return Response.redirect(`${origin}/pricing?error=invalid_data`, 302);
    }

    const plan = getPlanFromPlanId(env, sub.plan_id);
    if (!plan) {
      console.error("Subscription: unknown plan_id", sub.plan_id);
      return Response.redirect(`${origin}/pricing?error=unknown_plan`, 302);
    }

    // 更新 D1: 升级套餐，重置用量，记录订阅 ID
    await env.DB.prepare(
      `UPDATE users SET plan = ?, paypal_subscription_id = ?, credits_used = 0 WHERE google_id = ?`
    )
      .bind(plan, subscriptionId, userId)
      .run();

    // 记录支付
    try {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO payments (paypal_subscription_id, user_id, type, plan, status, created_at)
         VALUES (?, ?, 'subscription', ?, 'active', datetime('now'))`
      )
        .bind(subscriptionId, userId, plan)
        .run();
    } catch (e) {
      console.warn("Payment log failed:", e.message);
    }

    return Response.redirect(
      `${origin}/dashboard?success=subscription&plan=${plan}`,
      302
    );
  } catch (err) {
    console.error("Subscription success error:", err);
    return Response.redirect(`${origin}/pricing?error=server_error`, 302);
  }
}
