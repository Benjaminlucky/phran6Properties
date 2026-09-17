const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Nigerian Realty";

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      process.env.NEXT_PUBLIC_SITE_DESC ||
      "Discover premium lands and houses for sale across Nigeria.",
    start_url: "/",
    display: "standalone",
    background_color: "#1b2f31",
    theme_color: "#1b2f31",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
