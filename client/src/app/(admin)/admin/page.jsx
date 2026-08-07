/**
 * src/app/(admin)/admin/page.jsx — Server Component wrapper
 *
 * The admin session is an httpOnly JWT cookie scoped to the API's own
 * domain (Railway), which is cross-origin from this app (Netlify) — the
 * browser never sends it to this Next.js server, so it can't be read here
 * with next/headers' cookies() to prefetch stats server-side. DashboardClient
 * fetches its own stats client-side instead, where credentials: "include"
 * lets the browser attach the cookie directly to the API request.
 */

import DashboardClient from "./DashboardClient";

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
