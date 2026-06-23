import { revalidatePath } from "next/cache";
import { REVALIDATE_SECRET } from "@/config/site";

/**
 * POST /api/revalidate
 *
 * Called by the Express backend after any create / update / delete
 * mutation on lands, houses, blog posts, reviews, or about page.
 *
 * Request body:
 *   { paths: ["/", "/lands", "/lands/aviara-lekki"] }
 *
 * Security: validated via x-revalidate-secret header.
 * The secret must match REVALIDATE_SECRET in both envs:
 *   - Netlify: REVALIDATE_SECRET env var
 *   - Render:  REVALIDATE_SECRET env var
 */
export async function POST(request) {
  try {
    // ── Auth check ──────────────────────────────────────────────
    const secret = request.headers.get("x-revalidate-secret");

    if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
      return Response.json(
        { success: false, message: "Invalid revalidation secret" },
        { status: 401 },
      );
    }

    // ── Parse body ───────────────────────────────────────────────
    let paths = [];
    try {
      const body = await request.json();
      paths = Array.isArray(body.paths) ? body.paths : [];
    } catch {
      return Response.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (paths.length === 0) {
      return Response.json(
        { success: false, message: "No paths provided" },
        { status: 400 },
      );
    }

    // ── Revalidate each path ──────────────────────────────────────
    const revalidated = [];
    const errors = [];

    for (const path of paths) {
      try {
        revalidatePath(path);
        revalidated.push(path);
      } catch (err) {
        errors.push({ path, error: err.message });
      }
    }

    console.log(`[/api/revalidate] Revalidated: ${revalidated.join(", ")}`);
    if (errors.length) {
      console.warn(`[/api/revalidate] Errors:`, errors);
    }

    return Response.json({
      success: true,
      revalidated,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error("[/api/revalidate] Unexpected error:", err);
    return Response.json(
      { success: false, message: "Internal error" },
      { status: 500 },
    );
  }
}

// Reject non-POST methods
export async function GET() {
  return Response.json(
    { success: false, message: "Method not allowed" },
    { status: 405 },
  );
}
