import { serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import ContactClient from "./ContactClient";

export const revalidate = 3600;

export async function generateMetadata() {
  try {
    const data = await serverFetch("/settings", { next: { revalidate: 300 } });
    const s = data?.data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    const desc = `Get in touch with our team. We help you find the perfect land or home across Nigeria.`;
    const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent("Contact " + siteName)}&subtitle=Get+in+Touch+With+Our+Team&type=default&site=${encodeURIComponent(siteName)}`;
    return {
      title: `Contact Us — ${siteName}`,
      description: desc,
      alternates: { canonical: `${SITE_URL}/contact` },
      openGraph: {
        title: `Contact Us — ${siteName}`,
        description: desc,
        url: `${SITE_URL}/contact`,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `Contact Us — ${siteName}`,
        description: desc,
        images: [ogImage],
      },
    };
  } catch {
    return { title: `Contact Us — ${SITE_CONFIG.name}` };
  }
}

export default async function ContactPage() {
  let settings = {};
  try {
    const data = await serverFetch("/settings", { next: { revalidate: 300 } });
    settings = JSON.parse(JSON.stringify(data?.data?.settings || {}));
  } catch {}

  return <ContactClient settings={settings} />;
}
