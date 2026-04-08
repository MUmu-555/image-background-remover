// Cloudflare Pages Function: GET /api/auth/me
// 返回当前登录用户信息（验证 session cookie）

export async function onRequestGet(context) {
  const { request, env } = context;

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  const sessionToken = cookies["session"];
  if (!sessionToken) {
    return Response.json({ user: null }, { status: 200 });
  }

  try {
    const user = await verifySessionToken(sessionToken, env.JWT_SECRET);
    if (!user) return Response.json({ user: null }, { status: 200 });
    return Response.json({ user }, { status: 200 });
  } catch {
    return Response.json({ user: null }, { status: 200 });
  }
}

async function verifySessionToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const unsigned = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(unsigned)
  );

  if (!valid) return null;

  const payload = JSON.parse(atob(body));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.avatar,
  };
}
