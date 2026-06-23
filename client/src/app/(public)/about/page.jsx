import { serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import AboutClient from "./AboutClient";

export const revalidate = 300;

export async function generateMetadata() {
  try {
    const [settingsRes, aboutRes] = await Promise.all([
      serverFetch("/settings", { next: { revalidate: 300 } }),
      serverFetch("/about", { next: { revalidate: 300 } }),
    ]);
    const s = settingsRes?.data?.settings || {};
    const a = aboutRes?.data || {};
    const name = s.site_name || SITE_CONFIG.name;
    const desc =
      a.tagline ||
      `Learn more about ${name} — Nigeria\'s trusted real estate platform.`;
    const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent("About " + name)}&subtitle=${encodeURIComponent("Nigeria\'s Trusted Real Estate Platform")}&type=default&site=${encodeURIComponent(name)}`;
    return {
      title: `About Us — ${name}`,
      description: desc,
      alternates: { canonical: `${SITE_URL}/about` },
      openGraph: {
        title: `About Us — ${name}`,
        description: desc,
        url: `${SITE_URL}/about`,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `About Us — ${name}`,
        description: desc,
        images: [ogImage],
      },
    };
  } catch {
    return { title: `About Us — ${SITE_CONFIG.name}` };
  }
}

export default async function AboutPage() {
  const [settingsRes, aboutRes] = await Promise.allSettled([
    serverFetch("/settings", { next: { revalidate: 300 } }),
    serverFetch("/about", { next: { revalidate: 300 } }),
  ]);

  const settings =
    settingsRes.status === "fulfilled"
      ? settingsRes.value?.data?.settings || {}
      : {};

  const about =
    aboutRes.status === "fulfilled" ? aboutRes.value?.data || {} : {};

  return <AboutClient about={about} settings={settings} />;
}
