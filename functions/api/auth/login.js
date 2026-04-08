// Cloudflare Pages Function: GET /api/auth/login
// 重定向用户到 Google OAuth 授权页

export async function onRequestGet(context) {
  const { env } = context;

  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response("OAuth not configured", { status: 500 });
  }

  // 生成随机 state 防 CSRF
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: "https://image-backgroundremover.com/api/auth/callback",
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  const response = Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    302
  );

  // 把 state 存 Cookie，callback 时验证
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`
  );

  return new Response(null, { status: 302, headers });
}
