// functions/api/paypal/webhook.js
// POST /api/paypal/webhook
// 接收 PayPal Webhook 事件（订阅续费、取消等）

import { verifyPayPalWebhook } from "../../_lib/paypal.js";
import { getPayPalSubscription } from "../../_lib/paypal.js";
import { PLAN_LIMITS } from "../../_lib/credits.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const rawBody = await request.text();

  // 验证签名（防伪造）
  const isValid = await verifyPayPalWebhook(env, request.headers, rawBody);
  if (!isValid) {
    console.error("PayPal webhook signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type;
  console.log("PayPal webhook event:", eventType);

  try {
    await handleWebhookEvent(env, eventType, event.resource);
  } catch (err) {
    console.error("Webhook handler error:", err);
    // 仍然返回 200，避免 PayPal 重试
  }

  return Response.json({ received: true });
}

async function handleWebhookEvent(env, eventType, resource) {
  switch (eventType) {
    // 订阅激活（首次）
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      await handleSubscriptionActivated(env, resource);
      break;
    }

    // 订阅续费成功
    case "PAYMENT.SALE.COMPLETED":
    case "BILLING.SUBSCRIPTION.RENEWED": {
      await handleSubscriptionRenewed(env, resource);
      break;
    }

    // 订阅取消 / 暂停 / 到期
    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.SUSPENDED":
    case "BILLING.SUBSCRIPTION.EXPIRED": {
      await handleSubscriptionCancelled(env, resource);
      break;
    }

    // 订阅重新激活
    case "BILLING.SUBSCRIPTION.RE-ACTIVATED": {
      await handleSubscriptionActivated(env, resource);
      break;
    }

    default:
      console.log("Unhandled PayPal event:", eventType);
  }
}

async function handleSubscriptionActivated(env, resource) {
  const subscriptionId = resource.id;
  const userId = resource.custom_id?.replace("sub:", "");
  if (!userId) return;

  const plan = getPlanFromPlanId(env, resource.plan_id);
  if (!plan) return;

  await env.DB.prepare(
    `UPDATE users SET plan = ?, paypal_subscription_id = ?, credits_used = 0 WHERE google_id = ?`
  )
    .bind(plan, subscriptionId, userId)
    .run();
}

async function handleSubscriptionRenewed(env, resource) {
  // 续费成功：重置月度用量
  const subscriptionId = resource.billing_agreement_id || resource.id;
  if (!subscriptionId) return;

  // 通过 subscriptionId 查询用户
  const user = await env.DB.prepare(
    `SELECT google_id FROM users WHERE paypal_subscription_id = ?`
  )
    .bind(subscriptionId)
    .first();

  if (!user) return;

  // 重置月度用量
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);

  await env.DB.prepare(
    `UPDATE users SET credits_used = 0, credits_reset_at = ? WHERE google_id = ?`
  )
    .bind(nextReset.toISOString(), user.google_id)
    .run();
}

async function handleSubscriptionCancelled(env, resource) {
  const subscriptionId = resource.id;
  if (!subscriptionId) return;

  // 降级为 free plan
  await env.DB.prepare(
    `UPDATE users SET plan = 'free', paypal_subscription_id = NULL WHERE paypal_subscription_id = ?`
  )
    .bind(subscriptionId)
    .run();
}

function getPlanFromPlanId(env, planId) {
  if (planId === env.PAYPAL_PLAN_PRO_MONTHLY || planId === env.PAYPAL_PLAN_PRO_YEARLY)
    return "pro";
  if (planId === env.PAYPAL_PLAN_BUSINESS_MONTHLY || planId === env.PAYPAL_PLAN_BUSINESS_YEARLY)
    return "business";
  return null;
}
