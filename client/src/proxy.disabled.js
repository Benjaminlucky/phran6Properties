import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/login", "/admin/setup"],
};

function isTokenValid(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const json = Buffer.from(
      parts[1].replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const payload = JSON.parse(json);

    // If no exp claim, check iat + 30 days fallback
    if (!payload.exp) {
      if (!payload.iat) return true; // no timing info — assume valid
      const fallback = 30 * 24 * 60 * 60 * 1000;
      return payload.iat * 1000 + fallback > Date.now();
    }

    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function proxy(request) {
  const token = request.cookies.get("nr_token")?.value;
  const valid = token ? isTokenValid(token) : false;

  // Already logged in — bounce to dashboard
  if (valid) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}
