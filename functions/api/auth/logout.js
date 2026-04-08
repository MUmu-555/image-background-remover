// Cloudflare Pages Function: POST /api/auth/logout
// 清除 session cookie

export async function onRequestPost(context) {
  const headers = new Headers({
    Location: "/",
    "Set-Cookie": `session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`,
  });
  return new Response(null, { status: 302, headers });
}
