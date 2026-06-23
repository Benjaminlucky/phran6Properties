import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppWidget from "@/components/public/WhatsAppWidget";
import { serverFetch } from "@/lib/api";

async function getSiteSettings() {
  try {
    const data = await serverFetch("/settings", { next: { revalidate: 300 } });
    return data?.data?.settings || {};
  } catch {
    return {};
  }
}

export default async function PublicLayout({ children }) {
  const settings = await getSiteSettings();

  // Pass only plain serializable object — no functions, no class instances
  const safeSettings = JSON.parse(JSON.stringify(settings));

  return (
    <>
      <Navbar settings={safeSettings} />
      <main>{children}</main>
      <Footer settings={safeSettings} />
      <WhatsAppWidget settings={safeSettings} />
    </>
  );
}
