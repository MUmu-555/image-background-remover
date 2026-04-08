// Cloudflare Pages Function: GET /api/auth/callback
// 接收 Google 授权码，换取用户信息，写入 D1，设置登录 Cookie

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // 解析 Cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  // 验证 state
  if (!state || state !== cookies["oauth_state"]) {
    return redirectWithError("Invalid state. Please try again.");
  }

  if (!code) {
    return redirectWithError("No authorization code received.");
  }

  // 用 code 换 token
  let tokenData;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://image-backgroundremover.com/api/auth/callback",
        grant_type: "authorization_code",
      }),
    });
    tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
  } catch (e) {
    return redirectWithError("Failed to exchange authorization code.");
  }

  // 获取用户信息
  let userInfo;
  try {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    userInfo = await userRes.json();
    if (!userInfo.id) throw new Error("No user ID returned");
  } catch (e) {
    return redirectWithError("Failed to fetch user info.");
  }

  // 存入 D1
  try {
    await env.DB.prepare(
      `INSERT INTO users (google_id, email, name, avatar, last_login)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(google_id) DO UPDATE SET
         name = excluded.name,
         avatar = excluded.avatar,
         last_login = CURRENT_TIMESTAMP`
    )
      .bind(userInfo.id, userInfo.email, userInfo.name, userInfo.picture)
      .run();
  } catch (e) {
    return redirectWithError("Database error. Please try again.");
  }

  // 生成 session token（简单 JWT-like，用 HMAC-SHA256 签名）
  const payload = {
    sub: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    avatar: userInfo.picture,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7天
  };

  const sessionToken = await createSessionToken(payload, env.JWT_SECRET);

  // 设置登录 Cookie，清除 oauth_state
  const headers = new Headers({
    Location: "/",
    "Set-Cookie": [
      `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; Path=/`,
    ].join(", "),
  });
  // 清 oauth_state cookie
  headers.append(
    "Set-Cookie",
    `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`
  );

  return new Response(null, { status: 302, headers });
}

function redirectWithError(msg) {
  return Response.redirect(
    `/?auth_error=${encodeURIComponent(msg)}`,
    302
  );
}

// 简单 HMAC-SHA256 签名 token
async function createSessionToken(payload, secret) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(unsigned));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));

  return `${unsigned}.${sigB64}`;
}
