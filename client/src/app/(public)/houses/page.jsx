import { cache } from "react";
import { housesApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import HousesClient from "./HousesClient";

export const revalidate = 300;

// `generateMetadata` and the page component below both need this listing —
// metadata to decide whether a filtered result set is empty (and therefore
// noindex), the page to actually render it. They are separate functions, so
// React's cache() is what makes them share ONE fetch per request-render pass
// instead of two round-trips to /houses (metadata used to issue its own
// `perPage: 1` request purely to read `total`).
//
// Args are primitives on purpose: cache() keys on shallow-equal arguments, so
// an object literal built at each call site would miss the memo. Building the
// identical query here also means the underlying fetch URL is identical, so
// Next's Data Cache (`next: { revalidate: 300 }`, set in lib/api's fetcher)
// backs the dedup up as a second layer.
const getHouseListing = cache(async function getHouseListing(
  page,
  state,
  location,
  status,
  category,
  bedrooms,
  maxPrice,
) {
  try {
    return await housesApi.getAll({
      page,
      state,
      location,
      status,
      category,
      bedrooms,
      maxPrice,
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
    params?.category || "",
    params?.bedrooms || "",
    params?.maxPrice || "",
  ];
}

// Filter params that produce a narrowed result set. Any of them (or a
// page > 1) makes the URL a facet of /houses, not a page of its own.
const FILTER_PARAMS = [
  "state",
  "location",
  "status",
  "category",
  "bedrooms",
  "maxPrice",
];

function hasValue(v) {
  if (Array.isArray(v)) return v.some((x) => String(x).trim() !== "");
  return typeof v === "string" ? v.trim() !== "" : v != null;
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const hasFilters = Object.values(params || {}).some((v) => v && v !== "1");
  let isEmpty = false;
  if (hasFilters) {
    // Shared with the page component below — no extra network round-trip.
    const res = await getHouseListing(...listingArgs(params));
    // res === null means the API failed — keep the page indexable.
    if (res) isEmpty = (res.total || 0) === 0;
  }

  // Paginated + filtered result sets must not compete with the canonical
  // /houses page for indexing — noindex,follow them (links still crawled)
  // while the canonical keeps pointing at the bare listing URL below.
  const pageNum = Number(params?.page || 1);
  const isPaginated = Number.isFinite(pageNum) && pageNum > 1;
  const isFiltered = FILTER_PARAMS.some((k) => hasValue(params?.[k]));
  const noIndex = isEmpty || isPaginated || isFiltered;

  try {
    const data = await serverFetch("/settings", { next: { revalidate: 300 } });
    const s = data?.data?.settings || data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    const desc = `Browse verified house listings across Nigeria. Find apartments, duplexes, bungalows and more in Lagos, Abuja, Port Harcourt and beyond.`;
    const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent("House Listings")}&subtitle=Apartments%2C+Duplexes+%26+Homes+Across+Nigeria&type=house&site=${encodeURIComponent(siteName)}`;
    return {
      title: `House Listings — ${siteName}`,
      description: desc,
      // Always the unfiltered listing — tells search engines the "real"
      // page for any ?page= / ?state= / ?category= variant.
      alternates: { canonical: `${SITE_URL}/houses` },
      ...(noIndex && { robots: { index: false, follow: true } }),
      openGraph: {
        title: `House Listings — ${siteName}`,
        description: desc,
        url: `${SITE_URL}/houses`,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `House Listings — ${siteName}`,
        description: desc,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: `House Listings — ${SITE_CONFIG.name}`,
      alternates: { canonical: `${SITE_URL}/houses` },
      ...(noIndex && { robots: { index: false, follow: true } }),
    };
  }
}

export default async function HousesPage({ searchParams }) {
  const params = await searchParams;

  const args = listingArgs(params);
  const [page, state, location, status, category, bedrooms, maxPrice] = args;

  // Same memoized call generateMetadata made — served from React's per-request
  // cache, so this does not hit the network a second time.
  const res = await getHouseListing(...args);
  const houses = res?.data || [];
  const totalPages = res?.totalPages || 1;
  const totalCount = res?.total || 0;

  return (
    <HousesClient
      initialHouses={houses}
      initialPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      initialFilters={{ state, location, status, category, bedrooms, maxPrice }}
    />
  );
}
