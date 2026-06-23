import { serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import HomeClient from "./Homeclient";

export const revalidate = 300;

export async function generateMetadata() {
  try {
    const res = await serverFetch("/settings", { next: { revalidate: 300 } });
    const s = res?.data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    const description =
      s.hero_subtext ||
      "Find your perfect property across Nigeria. Verified listings, transparent pricing, trusted agents.";
    const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(siteName + " — Premium Properties")}&subtitle=Lands+%26+Houses+Across+Nigeria&type=default&site=${encodeURIComponent(siteName)}`;
    return {
      title: `${siteName} — Lands, Houses & Real Estate Investment`,
      description,
      alternates: { canonical: SITE_URL },
      openGraph: {
        title: `${siteName} — Lands, Houses & Real Estate Investment`,
        description,
        url: SITE_URL,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${siteName} — Lands, Houses & Real Estate Investment`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: SITE_CONFIG.name };
  }
}

export default async function HomePage() {
  const [
    settingsRes,
    featuredLandsRes,
    featuredHousesRes,
    publicStatsRes,
    reviewsRes,
    popularAreasRes,
    partnersRes,
  ] = await Promise.allSettled([
    serverFetch("/settings", { next: { revalidate: 300 } }),
    serverFetch("/lands/featured?limit=6", { next: { revalidate: 300 } }),
    serverFetch("/houses/featured?limit=6", { next: { revalidate: 300 } }),
    serverFetch("/stats/public", { next: { revalidate: 300 } }),
    serverFetch("/reviews?limit=20", { next: { revalidate: 300 } }),
    serverFetch("/popular-areas", { next: { revalidate: 300 } }),
    serverFetch("/partners", { next: { revalidate: 300 } }),
  ]);

  const settings =
    settingsRes.status === "fulfilled"
      ? settingsRes.value?.data?.settings || {}
      : {};

  const lands =
    featuredLandsRes.status === "fulfilled"
      ? featuredLandsRes.value?.data || []
      : [];

  const houses =
    featuredHousesRes.status === "fulfilled"
      ? featuredHousesRes.value?.data || []
      : [];

  const publicStats =
    publicStatsRes.status === "fulfilled"
      ? publicStatsRes.value?.data || null
      : null;

  const testimonials =
    reviewsRes.status === "fulfilled" ? reviewsRes.value?.data || [] : [];

  const popularAreas =
    popularAreasRes.status === "fulfilled"
      ? popularAreasRes.value?.data || []
      : [];

  const partners =
    partnersRes.status === "fulfilled" ? partnersRes.value?.data || [] : [];

  return (
    <HomeClient
      lands={lands}
      houses={houses}
      settings={settings}
      publicStats={publicStats}
      testimonials={testimonials}
      popularAreas={popularAreas}
      partners={partners}
    />
  );
}
