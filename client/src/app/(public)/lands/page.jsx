import { landsApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import LandsClient from "./LandsClient";

export const revalidate = 300;

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
    try {
      const res = await landsApi.getAll({ ...params, perPage: 1 });
      isEmpty = (res?.total || 0) === 0;
    } catch {
      /* keep indexable if API fails */
    }
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
  const page = Number(params?.page || 1);
  const state = params?.state || "";
  const location = params?.location || "";
  const status = params?.status || "";
  const minPrice = params?.minPrice || "";
  const maxPrice = params?.maxPrice || "";
  const title = params?.title || "";
  const size = params?.size || "";

  let lands = [],
    totalPages = 1,
    totalCount = 0;

  try {
    const res = await landsApi.getAll({
      page,
      state,
      location,
      status,
      minPrice,
      maxPrice,
      title_type: title,
      size,
    });
    lands = res?.data || [];
    totalPages = res?.totalPages || 1;
    totalCount = res?.total || 0;
  } catch {
    lands = [];
  }

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
