"use strict";

/**
 * revalidate.js
 *
 * Fire-and-forget helper called by Express route handlers after any
 * create / update / delete mutation. POSTs to the Next.js
 * /api/revalidate endpoint which calls revalidatePath() server-side.
 *
 * Never throws — a revalidation failure must never break the API response.
 * Errors are logged but swallowed silently.
 *
 * Usage:
 *   const { revalidate } = require("../lib/revalidate");
 *
 *   // After saving a land listing:
 *   revalidate(["/", "/lands", `/lands/${slug}`]);
 *
 *   // After saving a blog post:
 *   revalidate(["/blog", `/blog/${slug}`]);
 */

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";

/**
 * @param {string[]} paths  Next.js paths to revalidate e.g. ["/", "/lands"]
 */
async function revalidate(paths = []) {
  if (!REVALIDATE_SECRET) {
    // Secret not configured — skip silently in dev, warn in prod
    if (process.env.NODE_ENV === "production") {
      console.warn("[revalidate] REVALIDATE_SECRET is not set. Skipping.");
    }
    return;
  }

  const url = `${FRONTEND_URL}/api/revalidate`;

  // Fire-and-forget: don't await, don't block the response
  (async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-secret": REVALIDATE_SECRET,
        },
        body: JSON.stringify({ paths }),
        signal: AbortSignal.timeout(8000), // 8s timeout
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn(
          `[revalidate] HTTP ${res.status} for paths ${paths.join(", ")}: ${text}`,
        );
      } else {
        console.log(`[revalidate] ✓ Revalidated: ${paths.join(", ")}`);
      }
    } catch (err) {
      // Network errors (Next.js sleeping on free tier, etc.) — log, never throw
      console.warn(
        `[revalidate] Failed for paths ${paths.join(", ")}: ${err.message}`,
      );
    }
  })();
}

module.exports = { revalidate };
