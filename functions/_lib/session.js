// functions/_lib/session.js
// 解析并验证 session cookie

// URL-safe base64 解码（兼容 Unicode）
function base64UrlDecode(str) {
  // 补全 padding，转回标准 base64
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  // 解码为 bytes 再转 UTF-8 字符串
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function getSessionUser(request, jwtSecret) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  const token = cookies["session"];
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const unsigned = `${header}.${body}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // 将 URL-safe base64 sig 还原为标准 base64 再解码
    const sigStd = sig.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((sig.length * 3) % 4 === 0 ? 4 : (sig.length * 3) % 4);
    const sigBytes = Uint8Array.from(atob(sigStd), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(unsigned)
    );

    if (!valid) return null;

    const payload = JSON.parse(base64UrlDecode(body));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.avatar,
    };
  } catch {
    return null;
  }
}
