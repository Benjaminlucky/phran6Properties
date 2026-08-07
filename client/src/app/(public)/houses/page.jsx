import { housesApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import HousesClient from "./HousesClient";

export const revalidate = 300;

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
    try {
      const res = await housesApi.getAll({ ...params, perPage: 1 });
      isEmpty = (res?.total || 0) === 0;
    } catch {
      /* keep indexable if API fails */
    }
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

  const page = Number(params?.page || 1);
  const state = params?.state || "";
  const location = params?.location || "";
  const status = params?.status || "";
  const category = params?.category || "";
  const bedrooms = params?.bedrooms || "";
  const maxPrice = params?.maxPrice || "";

  let houses = [],
    totalPages = 1,
    totalCount = 0;

  try {
    const res = await housesApi.getAll({
      page,
      state,
      location,
      status,
      category,
      bedrooms,
      maxPrice,
    });
    houses = res?.data || [];
    totalPages = res?.totalPages || 1;
    totalCount = res?.total || 0;
  } catch {
    houses = [];
  }

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
