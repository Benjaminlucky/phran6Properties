"use strict";

// ── Public cache headers ──────────────────────────────────────────
// Adds `Cache-Control` to *public*, read-only GET responses so browsers
// and any CDN in front of the API can reuse them for a short window.
//
// This is deliberately a second, independent layer to the frontend's
// Next.js ISR (`next: { revalidate }` in client/src/lib/api.js) — ISR
// caches the rendered page, this caches the raw API response for direct
// consumers (admin panel client-side reads, curl, mobile clients).
//
// The max-age stays short on purpose: content freshness is guaranteed by
// on-demand revalidation (server/lib/revalidate.js) firing on every
// mutation, and a long max-age would let a browser keep serving a stale
// body long after that fired. 60s fresh + 300s stale-while-revalidate
// means a client never blocks on a refetch but never lags more than a
// minute behind a change.
//
// NEVER apply this to admin/protected routes or to mutations — those must
// stay uncached (no header → the browser's default "no reuse" behaviour).

const DEFAULT_MAX_AGE = 60;
const DEFAULT_SWR = 300;

function publicCache(seconds = DEFAULT_MAX_AGE, staleWhileRevalidate = DEFAULT_SWR) {
  const value = `public, max-age=${seconds}, stale-while-revalidate=${staleWhileRevalidate}`;

  return function publicCacheMiddleware(req, res, next) {
    // Only safe methods are ever cacheable here.
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    // Set the header at send time and only for successful responses —
    // a 404/500 body must not be cached for a minute.
    const sendJson = res.json.bind(res);
    res.json = function cachedJson(body) {
      if (res.statusCode < 400 && !res.headersSent) {
        res.setHeader("Cache-Control", value);
      }
      return sendJson(body);
    };

    next();
  };
}

module.exports = { publicCache, DEFAULT_MAX_AGE, DEFAULT_SWR };
