import { notFound } from "next/navigation";
import { housesApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import HouseDetailClient from "./HouseDetailClient";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const [res, settingsRes] = await Promise.all([
      housesApi.getBySlug(slug),
      serverFetch("/settings", { next: { revalidate: 300 } }),
    ]);
    const house = res?.data;
    const s = settingsRes?.data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    if (!house) return { title: `Property Not Found — ${siteName}` };

    const title = house.meta_title || `${house.title} — ${siteName}`;
    const bedsText =
      house.bedrooms != null
        ? house.bedrooms === 0
          ? "Self Contain"
          : `${house.bedrooms}-Bedroom`
        : "";
    const description =
      house.meta_description ||
      `${bedsText} ${house.category || ""} for sale in ${house.location || house.state || "Nigeria"}. ${house.price ? `Price: ₦${Number(house.price).toLocaleString("en-NG")}.` : ""}`.trim();

    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/houses/${slug}` },
      openGraph: {
        title,
        description,
        images: house.feature_image
          ? [{ url: house.feature_image, width: 1200, height: 630 }]
          : [
              {
                url: `${SITE_URL}/api/og?title=${encodeURIComponent(house.title)}&subtitle=${encodeURIComponent([house.location, house.state].filter(Boolean).join(", "))}&type=house${house.price ? "&price=" + encodeURIComponent("₦" + Number(house.price).toLocaleString("en-NG")) : ""}`,
                width: 1200,
                height: 630,
              },
            ],
        url: `${SITE_URL}/houses/${slug}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: house.feature_image
          ? [house.feature_image]
          : [
              `${SITE_URL}/api/og?title=${encodeURIComponent(house.title)}&type=house`,
            ],
      },
    };
  } catch {
    return { title: `House Listing — ${SITE_CONFIG.name}` };
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

function buildHouseSchema(house, settings) {
  const siteName = settings?.site_name || SITE_CONFIG.name;
  const pageUrl = `${SITE_URL}/houses/${house.slug}`;

  // Map category to the closest Schema.org residential type
  const typeMap = {
    "Fully Detached Duplex": "SingleFamilyResidence",
    "Semi-Detached Duplex": "SingleFamilyResidence",
    "Terrace House": "TownhouseOrRowHouse",
    Bungalow: "SingleFamilyResidence",
    Penthouse: "Apartment",
    Apartment: "Apartment",
    "Block of Flats": "ApartmentComplex",
    "Mini Flat": "Apartment",
    "Self Contain": "Apartment",
  };
  const schemaType = typeMap[house.category] || "Residence";

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: house.title,
    description:
      house.description ||
      `${house.title} for sale in ${house.location || ""}, ${house.state || "Nigeria"}.`,
    url: pageUrl,
    datePosted: house.createdAt || undefined,
    dateModified: house.updatedAt || undefined,
    image: house.feature_image
      ? [house.feature_image, ...(house.gallery || [])]
      : house.gallery || [],
    address: {
      "@type": "PostalAddress",
      addressLocality: house.location || "",
      addressRegion: house.state || "",
      addressCountry: "NG",
    },
    numberOfRooms: house.bedrooms || undefined,
    numberOfBathroomsTotal: house.bathrooms || undefined,
    floorSize: house.size
      ? { "@type": "QuantitativeValue", value: house.size, unitCode: "MTK" }
      : undefined,
    amenityFeature: (house.features || []).map((f) => ({
      "@type": "LocationFeatureSpecification",
      name: f,
      value: true,
    })),
    offers: house.price
      ? {
          "@type": "Offer",
          price: house.price,
          priceCurrency: "NGN",
          availability:
            house.status === "available"
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
          url: pageUrl,
        }
      : undefined,
    provider: {
      "@type": "RealEstateAgent",
      name: siteName,
      url: SITE_URL,
    },
  };

  return JSON.parse(
    JSON.stringify(schema, (_, v) => (v === undefined ? undefined : v)),
  );
}

export default async function HouseDetailPage({ params }) {
  const { slug } = await params;

  let house = null;
  let settings = {};
  let related = [];

  try {
    const [houseRes, settingsRes] = await Promise.all([
      housesApi.getBySlug(slug),
      serverFetch("/settings", { next: { revalidate: 300 } }),
    ]);
    house = houseRes?.data || null;
    settings = settingsRes?.data?.settings || {};
  } catch {
    notFound();
  }

  if (!house) notFound();

  // Fetch related houses — same state + category, exclude current
  try {
    const relatedRes = await housesApi.getAll({
      state: house.state,
      category: house.category,
      perPage: 4,
    });
    related = (relatedRes?.data || [])
      .filter((h) => h.slug !== slug)
      .slice(0, 3);
  } catch {
    related = [];
  }

  const jsonLd = buildHouseSchema(house, settings);
  const breadcrumbLd = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Houses", url: `${SITE_URL}/houses` },
    { name: house.title, url: `${SITE_URL}/houses/${house.slug}` },
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
      <HouseDetailClient house={house} settings={settings} related={related} />
    </>
  );
}
