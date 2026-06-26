/**
 * src/app/(admin)/admin/page.jsx — Server Component wrapper
 *
 * Fetches dashboard stats server-side using the JWT token from the
 * nr_token cookie (set on login alongside localStorage).
 *
 * Passes data as props to DashboardClient so the browser sees
 * fully-rendered stats on first paint — no client-side fetch waterfall.
 *
 * Auth notes:
 *  - If the cookie is missing/invalid the API returns 401.
 *  - We pass null stats + an error message; DashboardClient shows the
 *    error state and the user can click Refresh once they're hydrated
 *    (which uses the localStorage token via the client-side fetcher).
 *  - The proxy middleware also guards /admin/* so unauthenticated users
 *    are redirected to /admin/login before this component even renders.
 */

import { cookies } from "next/headers";
import DashboardClient from "./DashboardClient";

const API_BASE = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://phran6properties-production.up.railway.app"
).replace(/\/$/, "");

async function fetchDashboardStats(token) {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      // No ISR caching — dashboard stats should always be fresh
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: body.message || `Error ${res.status}` };
    }

    const json = await res.json();
    return { data: json?.data || null, error: null };
  } catch (err) {
    return { data: null, error: err.message || "Failed to load stats" };
  }
}

export default async function AdminDashboardPage() {
  // Read JWT from the cookie Next.js sets on login
  const cookieStore = await cookies();
  const token = cookieStore.get("nr_token")?.value || null;

  const { data: initialStats, error: initialError } =
    await fetchDashboardStats(token);

  return (
    <DashboardClient initialStats={initialStats} initialError={initialError} />
  );
}
