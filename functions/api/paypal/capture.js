// functions/api/paypal/capture.js
// GET /api/paypal/capture?token=xxx&PayerID=xxx
// PayPal 支付完成后的回调（积分包购买）

import { capturePayPalOrder } from "../../_lib/paypal.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token"); // PayPal order ID
  const origin = env.SITE_ORIGIN || "https://image-backgroundremover.com";

  if (!token) {
    return Response.redirect(`${origin}/pricing?error=missing_token`, 302);
  }

  try {
    const capture = await capturePayPalOrder(env, token);

    if (capture.status !== "COMPLETED") {
      console.error("PayPal capture not completed:", capture.status);
      return Response.redirect(`${origin}/pricing?error=payment_failed`, 302);
    }

    // 从 custom_id 中解析 userId 和 credits
    // custom_id 格式: "credits:{userId}:{credits}"
    const customId = capture.purchase_units?.[0]?.custom_id || "";
    const parts = customId.split(":");
    const userId = parts[1];
    const credits = parseInt(parts[2]) || 0;

    if (!userId || !credits) {
      console.error("PayPal capture: invalid custom_id", customId);
      return Response.redirect(`${origin}/pricing?error=invalid_data`, 302);
    }

    // 充值 credits_bonus 到 D1
    await env.DB.prepare(
      `UPDATE users SET credits_bonus = credits_bonus + ? WHERE google_id = ?`
    )
      .bind(credits, userId)
      .run();

    // 记录支付记录（可选，若有 payments 表）
    try {
      const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      const amount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
      await env.DB.prepare(
        `INSERT OR IGNORE INTO payments (paypal_order_id, paypal_capture_id, user_id, type, credits, amount_usd, status, created_at)
         VALUES (?, ?, ?, 'credits', ?, ?, 'completed', datetime('now'))`
      )
        .bind(token, captureId || "", userId, credits, parseFloat(amount) || 0)
        .run();
    } catch (e) {
      // payments 表可能还不存在，忽略错误
      console.warn("Payment log failed (table may not exist):", e.message);
    }

    return Response.redirect(
      `${origin}/dashboard?success=credits&credits=${credits}`,
      302
    );
  } catch (err) {
    console.error("PayPal capture error:", err);
    return Response.redirect(`${origin}/pricing?error=capture_failed`, 302);
  }
}
