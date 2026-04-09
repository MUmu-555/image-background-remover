// functions/_lib/paypal.js
// PayPal API 封装（中国版 paypal.cn，API endpoint 与国际版相同）

const PAYPAL_API_BASE = "https://api-m.paypal.com"; // 生产环境
const PAYPAL_SANDBOX_BASE = "https://api-m.sandbox.paypal.com"; // 沙盒

/**
 * 获取 PayPal API base URL
 */
function getApiBase(env) {
  return env.PAYPAL_MODE === "sandbox" ? PAYPAL_SANDBOX_BASE : PAYPAL_API_BASE;
}

/**
 * 获取 PayPal Access Token（client_credentials）
 */
export async function getPayPalAccessToken(env) {
  const base = getApiBase(env);
  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * 创建一次性支付订单（积分包购买）
 * @param {object} env - Cloudflare env
 * @param {object} pack - { credits, price, name }
 * @param {string} userId - Google ID（存在 custom_id）
 */
export async function createPayPalOrder(env, pack, userId) {
  const base = getApiBase(env);
  const token = await getPayPalAccessToken(env);

  const origin = env.SITE_ORIGIN || "https://image-backgroundremover.com";

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: `credits:${userId}:${pack.credits}`,
        description: `${pack.credits} Image Credits - image-backgroundremover.com`,
        amount: {
          currency_code: "USD",
          value: pack.price.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: "BG Remover",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${origin}/api/paypal/capture`,
      cancel_url: `${origin}/pricing`,
    },
  };

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * 捕获（完成）PayPal 订单
 */
export async function capturePayPalOrder(env, orderId) {
  const base = getApiBase(env);
  const token = await getPayPalAccessToken(env);

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${text}`);
  }

  return res.json();
}

// ─── 订阅相关 ──────────────────────────────────────────────────────────────

/**
 * 创建 PayPal 订阅（套餐升级）
 * @param {string} planId - PayPal Billing Plan ID（需要提前在后台建好）
 * @param {string} userId - Google ID
 */
export async function createPayPalSubscription(env, planId, userId) {
  const base = getApiBase(env);
  const token = await getPayPalAccessToken(env);

  const origin = env.SITE_ORIGIN || "https://image-backgroundremover.com";

  const body = {
    plan_id: planId,
    custom_id: `sub:${userId}`,
    application_context: {
      brand_name: "BG Remover",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      return_url: `${origin}/api/paypal/subscription/success`,
      cancel_url: `${origin}/pricing`,
    },
  };

  const res = await fetch(`${base}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create subscription failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * 获取订阅详情
 */
export async function getPayPalSubscription(env, subscriptionId) {
  const base = getApiBase(env);
  const token = await getPayPalAccessToken(env);

  const res = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal get subscription failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * 取消订阅
 */
export async function cancelPayPalSubscription(env, subscriptionId, reason = "User requested cancellation") {
  const base = getApiBase(env);
  const token = await getPayPalAccessToken(env);

  const res = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  // 204 No Content = success
  return res.status === 204;
}

/**
 * 验证 PayPal Webhook 签名
 * 注意：Cloudflare Workers 环境下需要用 crypto.subtle
 */
export async function verifyPayPalWebhook(env, headers, rawBody) {
  const base = getApiBase(env);
  const token = await getPayPalAccessToken(env);

  const verifyBody = {
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
    webhook_id: env.PAYPAL_WEBHOOK_ID,
    webhook_event: JSON.parse(rawBody),
  };

  const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verifyBody),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
