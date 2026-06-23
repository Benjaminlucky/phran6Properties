import { notFound } from "next/navigation";
import { landsApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import LandDetailClient from "./LandDetailClient";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const [res, settingsRes] = await Promise.all([
      landsApi.getBySlug(slug),
      serverFetch("/settings", { next: { revalidate: 300 } }),
    ]);
    const land = res?.data;
    const s = settingsRes?.data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    if (!land) return { title: `Land Not Found — ${siteName}` };

    const title = land.meta_title || `${land.estate_name} — ${siteName}`;
    const description =
      land.meta_description ||
      `${land.estate_name} — ${land.size || ""} land for sale in ${land.location || land.state || "Nigeria"}. ${land.title_type ? `Title: ${land.title_type}.` : ""} ${land.price ? `Price: ₦${Number(land.price).toLocaleString("en-NG")}.` : ""}`.trim();

    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/lands/${slug}` },
      openGraph: {
        title,
        description,
        images: land.feature_image
          ? [{ url: land.feature_image, width: 1200, height: 630 }]
          : [
              {
                url: `${SITE_URL}/api/og?title=${encodeURIComponent(land.estate_name)}&subtitle=${encodeURIComponent([land.location, land.state].filter(Boolean).join(", "))}&type=land${land.price ? "&price=" + encodeURIComponent("₦" + Number(land.price).toLocaleString("en-NG")) : ""}`,
                width: 1200,
                height: 630,
              },
            ],
        url: `${SITE_URL}/lands/${slug}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: land.feature_image
          ? [land.feature_image]
          : [
              `${SITE_URL}/api/og?title=${encodeURIComponent(land.estate_name)}&type=land`,
            ],
      },
    };
  } catch {
    return { title: `Land Listing — ${SITE_CONFIG.name}` };
  }
}

// ── JSON-LD builder ───────────────────────────────────────────────
function buildBreadcrumbSchema(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

function buildLandSchema(land, settings) {
  const siteName = settings?.site_name || SITE_CONFIG.name;
  const pageUrl = `${SITE_URL}/lands/${land.slug}`;

  const titleLabels = {
    c_of_o: "Certificate of Occupancy",
    governors_consent: "Governor's Consent",
    deed_of_assignment: "Deed of Assignment",
    excision: "Excision",
    gazette: "Gazette",
    freehold: "Freehold",
    leasehold: "Leasehold",
    survey_plan: "Survey Plan",
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: land.estate_name,
    description:
      land.description ||
      `${land.estate_name} — ${land.size || ""} land for sale in ${land.location || ""}, ${land.state || "Nigeria"}.`,
    url: pageUrl,
    datePosted: land.createdAt || undefined,
    dateModified: land.updatedAt || undefined,
    image: land.feature_image
      ? [land.feature_image, ...(land.gallery || [])]
      : land.gallery || [],
    address: {
      "@type": "PostalAddress",
      addressLocality: land.location || "",
      addressRegion: land.state || "",
      addressCountry: "NG",
    },
    offers: land.price
      ? {
          "@type": "Offer",
          price: land.price,
          priceCurrency: "NGN",
          availability:
            land.status === "available"
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
          url: pageUrl,
        }
      : undefined,
    additionalProperty: [
      land.size && {
        "@type": "PropertyValue",
        name: "Land Size",
        value: land.size,
      },
      land.title_type && {
        "@type": "PropertyValue",
        name: "Title Type",
        value: titleLabels[land.title_type] || land.title_type,
      },
    ].filter(Boolean),
    provider: {
      "@type": "RealEstateAgent",
      name: siteName,
      url: SITE_URL,
    },
  };

  // Remove undefined top-level keys so the output is clean
  return JSON.parse(
    JSON.stringify(schema, (_, v) => (v === undefined ? undefined : v)),
  );
}

export default async function LandDetailPage({ params }) {
  const { slug } = await params;

  let land = null;
  let settings = {};
  let related = [];

  try {
    const [landRes, settingsRes] = await Promise.all([
      landsApi.getBySlug(slug),
      serverFetch("/settings", { next: { revalidate: 300 } }),
    ]);
    land = landRes?.data || null;
    settings = settingsRes?.data?.settings || {};
  } catch {
    notFound();
  }

  if (!land) notFound();

  // ── Fetch related listings server-side via serverFetch ──────────
  // Strategy: same state + available, exclude current slug.
  // If same-state yields fewer than 3 results, widen to any state.
  try {
    const qs = new URLSearchParams({
      state: land.state || "",
      status: "available",
      perPage: "4",
    }).toString();

    const relatedRes = await serverFetch(`/lands?${qs}`, {
      next: { revalidate: 300 },
    });

    let candidates = (relatedRes?.data || []).filter((l) => l.slug !== slug);

    // Fallback: if not enough same-state results, fetch without state filter
    if (candidates.length < 3) {
      const fallbackRes = await serverFetch(
        `/lands?status=available&perPage=5`,
        { next: { revalidate: 300 } },
      );
      const fallback = (fallbackRes?.data || []).filter(
        (l) => l.slug !== slug && !candidates.find((c) => c.slug === l.slug),
      );
      candidates = [...candidates, ...fallback];
    }

    related = candidates.slice(0, 3);
  } catch {
    related = [];
  }

  const jsonLd = buildLandSchema(land, settings);
  const breadcrumbLd = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Lands", url: `${SITE_URL}/lands` },
    { name: land.estate_name, url: `${SITE_URL}/lands/${land.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <LandDetailClient land={land} settings={settings} related={related} />
    </>
  );
}
