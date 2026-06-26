/**
 * src/app/sitemap.js
 *
 * Next.js App Router native sitemap generation.
 * Fetched server-side at build time (or on-demand with ISR).
 * Outputs /sitemap.xml automatically — no extra config needed.
 *
 * Covers:
 *   - Static pages  (/, /lands, /houses, /blog, /about, /contact)
 *   - All published land listings      /lands/[slug]
 *   - All published house listings     /houses/[slug]
 *   - All published blog posts         /blog/[slug]
 *
 * Netlify env var required:  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "http://localhost:3000";

const API_BASE = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://phran6properties-production.up.railway.app"
).replace(/\/$/, "");

// Re-validate the sitemap every 12 hours so new listings appear quickly
export const revalidate = 43200;

// ── Helper: fetch all pages of a paginated endpoint ──────────────────────────
// Returns an array of { slug, updatedAt } for every record.
// Pass extraParams as a query-string fragment e.g. "&status=available"
async function fetchAllSlugs(endpoint, extraParams = "") {
  const results = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const url = `${API_BASE}${endpoint}?page=${page}&perPage=${perPage}${extraParams}`;
      const res = await fetch(url, {
        next: { revalidate: 43200 },
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      if (!res.ok) break;

      const json = await res.json();
      const items = json?.data || [];

      if (!Array.isArray(items) || items.length === 0) break;

      for (const item of items) {
        if (item.slug) {
          results.push({
            slug: item.slug,
            updatedAt: item.updatedAt || item.createdAt || null,
          });
        }
      }

      if (items.length < perPage) break;
      page++;
    } catch {
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  return results;
}

// ── Main sitemap export ───────────────────────────────────────────────────────
export default async function sitemap() {
  const now = new Date().toISOString();

  // ── 1. Static pages ─────────────────────────────────────────────
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/lands`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/houses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── 2. Dynamic slugs — fetch in parallel ────────────────────────
  // Only include available listings — sold/reserved/coming_soon
  // should not be indexed (they return 404 or show unavailable content).
  // Blog endpoint already filters to status=published server-side.
  const [landSlugs, houseSlugs, blogSlugs] = await Promise.all([
    fetchAllSlugs("/lands", "&status=available"),
    fetchAllSlugs("/houses", "&status=available"),
    fetchAllSlugs("/blog"),
  ]);

  // ── 3. Build land entries ────────────────────────────────────────
  const landEntries = landSlugs.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/lands/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt).toISOString() : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ── 4. Build house entries ───────────────────────────────────────
  const houseEntries = houseSlugs.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/houses/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt).toISOString() : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ── 5. Build blog entries ────────────────────────────────────────
  const blogEntries = blogSlugs.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt).toISOString() : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...landEntries, ...houseEntries, ...blogEntries];
}
