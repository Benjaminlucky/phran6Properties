import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Nigerian Realty";
const SITE_DESC = process.env.NEXT_PUBLIC_SITE_DESC ||
  "Discover premium lands and houses for sale across Nigeria. Browse verified listings, investment properties, and estate developments.";

export const metadata = {
  title: `${SITE_NAME} — Premium Properties Across Nigeria`,
  description: SITE_DESC,
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-NG": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    title: `${SITE_NAME} — Premium Properties Across Nigeria`,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Premium Properties Across Nigeria`,
    description: SITE_DESC,
  },
};

const THEME_DEFAULTS = {
  theme_primary: "#b2ff70",
  theme_primary_dark: "#1b2f31",
  theme_primary_light: "#d4ffaa",
  theme_primary_muted: "#e8ffd6",
  theme_secondary: "#1b2f31",
  theme_secondary_dark: "#132224",
  theme_secondary_mid: "#2a4547",
  theme_secondary_light: "#3a5d60",
  theme_accent: "#b2ff70",
  theme_accent_light: "#d4ffaa",
  theme_surface: "#ffffff",
  theme_surface_2: "#f4f9f4",
  theme_surface_3: "#edf5ed",
  theme_border: "#e2e8e0",
  theme_text: "#0f1f20",
  theme_text_secondary: "#3d5a5c",
  theme_text_muted: "#a8c4c6",
  theme_radius: "0.625rem",
  theme_radius_lg: "1rem",
  theme_radius_xl: "1.5rem",
};

const VAR_MAP = [
  ["theme_primary", "--color-primary"],
  ["theme_primary_dark", "--color-primary-dark"],
  ["theme_primary_light", "--color-primary-light"],
  ["theme_primary_muted", "--color-primary-muted"],
  ["theme_secondary", "--color-secondary"],
  ["theme_secondary_dark", "--color-secondary-dark"],
  ["theme_secondary_mid", "--color-secondary-mid"],
  ["theme_secondary_light", "--color-secondary-light"],
  ["theme_accent", "--color-accent"],
  ["theme_accent_light", "--color-accent-light"],
  ["theme_surface", "--color-surface"],
  ["theme_surface_2", "--color-surface-2"],
  ["theme_surface_3", "--color-surface-3"],
  ["theme_border", "--color-border"],
  ["theme_text", "--color-text"],
  ["theme_text_secondary", "--color-text-secondary"],
  ["theme_text_muted", "--color-text-muted"],
  ["theme_radius", "--radius"],
  ["theme_radius_lg", "--radius-lg"],
  ["theme_radius_xl", "--radius-xl"],
];

async function getSettings() {
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
        next: { revalidate: 30 },
        signal: controller.signal,
      });
      if (!res.ok) return {};
      const json = await res.json();
      return json?.data?.settings || {};
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return {};
  }
}

// Strip characters that could break out of a <style> block.
// CSS variable values can't execute code, but </style> injection is a real risk.
function safeCssValue(v) {
  return String(v).replace(/[<>"'`\\]/g, "");
}

function buildThemeCss(settings) {
  const t = { ...THEME_DEFAULTS };
  for (const [k] of VAR_MAP) {
    if (settings[k] && String(settings[k]).trim()) {
      t[k] = safeCssValue(String(settings[k]).trim());
    }
  }
  const declarations = VAR_MAP.map(
    ([key, cssVar]) => `  ${cssVar}: ${t[key]};`,
  ).join("\n");
  const shadowDecl = `  --shadow-coral: 0 4px 16px ${t.theme_primary}55;`;
  return `:root,html,body {\n${declarations}\n${shadowDecl}\n}`;
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const themeCss = buildThemeCss(settings);
  const faviconUrl = settings.favicon || null;

  return (
    <html
      lang="en-NG"
      className={`${plusJakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss }} />
        {/* When a custom favicon is saved in admin settings it overrides
            the generated /icon and /apple-icon served by icon.js / apple-icon.js */}
        {faviconUrl && (
          <>
            <link rel="icon" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
          </>
        )}
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{ style: { fontFamily: "var(--font-body)" } }}
        />
      </body>
    </html>
  );
}
