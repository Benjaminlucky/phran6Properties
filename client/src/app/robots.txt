/**
 * src/app/robots.js
 *
 * Next.js App Router native robots.txt generation.
 * Outputs /robots.txt automatically — no extra config needed.
 *
 * Rules:
 *   - All crawlers allowed on all public pages
 *   - /admin/* and /api/* blocked from indexing
 *   - Sitemap URL declared so Google Search Console picks it up automatically
 *
 * Netlify env var required:  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "http://localhost:3000";

export default function robots() {
  return {
    rules: [
      {
        // Allow all well-behaved crawlers everywhere except admin + API
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        // Explicitly block common scrapers and AI training bots
        // from hammering the API and admin endpoints
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Host hint for Google (especially useful during domain migrations)
    host: SITE_URL,
  };
}