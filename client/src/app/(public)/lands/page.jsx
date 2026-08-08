import { cache } from "react";
import { landsApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import LandsClient from "./LandsClient";

export const revalidate = 300;

// `generateMetadata` and the page component below both need this listing —
// metadata to decide whether a filtered result set is empty (and therefore
// noindex), the page to actually render it. They are separate functions, so
// React's cache() is what makes them share ONE fetch per request-render pass
// instead of two round-trips to /lands (metadata used to issue its own
// `perPage: 1` request purely to read `total`).
//
// Args are primitives on purpose: cache() keys on shallow-equal arguments, so
// an object literal built at each call site would miss the memo. Building the
// identical query here also means the underlying fetch URL is identical, so
// Next's Data Cache (`next: { revalidate: 300 }`, set in lib/api's fetcher)
// backs the dedup up as a second layer.
const getLandListing = cache(async function getLandListing(
  page,
  state,
  location,
  status,
  minPrice,
  maxPrice,
  title,
  size,
) {
  try {
    return await landsApi.getAll({
      page,
      state,
      location,
      status,
      minPrice,
      maxPrice,
      title_type: title,
      size,
    });
  } catch {
    return null; // caller treats null as "API failed", not "no results"
  }
});

// Normalizes searchParams into the exact argument tuple both call sites pass.
function listingArgs(params) {
  return [
    Number(params?.page || 1),
    params?.state || "",
    params?.location || "",
    params?.status || "",
    params?.minPrice || "",
    params?.maxPrice || "",
    params?.title || "",
    params?.size || "",
  ];
}

// Filter params that produce a narrowed result set. Any of them (or a
// page > 1) makes the URL a facet of /lands, not a page of its own.
const FILTER_PARAMS = [
  "state",
  "location",
  "status",
  "minPrice",
  "maxPrice",
  "title",
  "size",
];

function hasValue(v) {
  if (Array.isArray(v)) return v.some((x) => String(x).trim() !== "");
  return typeof v === "string" ? v.trim() !== "" : v != null;
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  // Check if filters are active and if they yield results —
  // noindex filtered/paginated pages with no results to avoid thin-content penalties
  const hasFilters = Object.values(params || {}).some((v) => v && v !== "1");
  let isEmpty = false;
  if (hasFilters) {
    // Shared with the page component below — no extra network round-trip.
    const res = await getLandListing(...listingArgs(params));
    // res === null means the API failed — keep the page indexable.
    if (res) isEmpty = (res.total || 0) === 0;
  }

  // Paginated + filtered result sets must not compete with the canonical
  // /lands page for indexing — noindex,follow them (links still crawled)
  // while the canonical keeps pointing at the bare listing URL below.
  const pageNum = Number(params?.page || 1);
  const isPaginated = Number.isFinite(pageNum) && pageNum > 1;
  const isFiltered = FILTER_PARAMS.some((k) => hasValue(params?.[k]));
  const noIndex = isEmpty || isPaginated || isFiltered;

  try {
    const data = await serverFetch("/settings", { next: { revalidate: 300 } });
    const s = data?.data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    const desc = `Browse verified land listings across Nigeria. Find titled plots in Lagos, Abuja, Port Harcourt and more.`;
    const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent("Land Listings")}&subtitle=Verified+Titled+Land+Across+Nigeria&type=land&site=${encodeURIComponent(siteName)}`;
    return {
      title: `Land Listings — ${siteName}`,
      description: desc,
      // Always the unfiltered listing — tells search engines the "real"
      // page for any ?page= / ?state= / ?status= variant.
      alternates: { canonical: `${SITE_URL}/lands` },
      // Noindex for paginated/filtered/empty result sets — prevents
      // duplicate + thin-content pages competing with /lands.
      ...(noIndex && { robots: { index: false, follow: true } }),
      openGraph: {
        title: `Land Listings — ${siteName}`,
        description: desc,
        url: `${SITE_URL}/lands`,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `Land Listings — ${siteName}`,
        description: desc,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: `Land Listings — ${SITE_CONFIG.name}`,
      alternates: { canonical: `${SITE_URL}/lands` },
      ...(noIndex && { robots: { index: false, follow: true } }),
    };
  }
}

export default async function LandsPage({ searchParams }) {
  const params = await searchParams;
  const args = listingArgs(params);
  const [page, state, location, status, minPrice, maxPrice, title, size] = args;

  // Same memoized call generateMetadata made — served from React's per-request
  // cache, so this does not hit the network a second time.
  const res = await getLandListing(...args);
  const lands = res?.data || [];
  const totalPages = res?.totalPages || 1;
  const totalCount = res?.total || 0;

  return (
    <LandsClient
      initialLands={lands}
      initialPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      initialFilters={{
        state,
        location,
        status,
        minPrice,
        maxPrice,
        title,
        size,
      }}
    />
  );
}
