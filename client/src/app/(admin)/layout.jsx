import { AuthProvider } from "@/context/AuthContext";

// Fetch site name server-side so the browser tab reflects the DB value
async function getSiteName() {
  try {
    const apiBase = (
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://phran6properties-production.up.railway.app"
    ).replace(/\/$/, "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${apiBase}/settings`, {
        next: { revalidate: 300 },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data?.settings?.site_name || null;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const name = (await getSiteName()) || "Admin";
  return {
    title: { default: `Admin — ${name}`, template: `%s | ${name} Admin` },
    robots: { index: false, follow: false },
  };
}

export default function AdminRootLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
