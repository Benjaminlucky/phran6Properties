/**
 * /api/og — Dynamic Open Graph image generation
 *
 * Uses Next.js built-in ImageResponse (next/og) — no extra package needed.
 *
 * Query params:
 *   title    — main headline text (required)
 *   subtitle — second line e.g. location, category (optional)
 *   price    — formatted price string (optional)
 *   type     — "land" | "house" | "blog" | "default" (optional)
 *   image    — background image URL (optional, Cloudinary URL)
 *
 * Usage in generateMetadata:
 *   openGraph: {
 *     images: [`${SITE_URL}/api/og?title=${encodeURIComponent(title)}&subtitle=...`]
 *   }
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Brand colours — match the default theme
const PRIMARY = "#FF6B6B";
const SECONDARY = "#0F172A";
const WHITE = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.55)";

// Type labels and accent colours
const TYPE_CONFIG = {
  land: { label: "Land Listing", accent: "#FF6B6B" },
  house: { label: "House Listing", accent: "#38BDF8" },
  blog: { label: "Blog & Insights", accent: "#F59E0B" },
  default: { label: "NaijaRealty", accent: "#FF6B6B" },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const title =
    searchParams.get("title") || "Premium Properties Across Nigeria";
  const subtitle = searchParams.get("subtitle") || "";
  const price = searchParams.get("price") || "";
  const type = searchParams.get("type") || "default";
  const imageUrl = searchParams.get("image") || "";
  const siteName = searchParams.get("site") || "NaijaRealty";

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.default;

  // Truncate title if too long for the card
  const displayTitle = title.length > 72 ? title.slice(0, 70) + "…" : title;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background: SECONDARY,
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* Background image (blurred, darkened) */}
      {imageUrl && (
        <img
          src={imageUrl}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.18,
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${SECONDARY}EE 0%, ${SECONDARY}BB 60%, ${SECONDARY}88 100%)`,
          display: "flex",
        }}
      />

      {/* Dot grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          display: "flex",
        }}
      />

      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          background: config.accent,
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: "52px 72px 52px 80px",
        }}
      >
        {/* Top: site name + type badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Logo mark */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: config.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                color: WHITE,
              }}
            >
              N
            </div>
            <span
              style={{
                color: WHITE,
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "-0.5px",
              }}
            >
              {siteName}
            </span>
          </div>

          {/* Type badge */}
          <div
            style={{
              background: `${config.accent}22`,
              border: `1px solid ${config.accent}66`,
              borderRadius: "999px",
              padding: "8px 18px",
              color: config.accent,
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {config.label}
          </div>
        </div>

        {/* Middle: main title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <div
            style={{
              color: WHITE,
              fontSize: displayTitle.length > 50 ? "44px" : "54px",
              fontWeight: "800",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            {displayTitle}
          </div>

          {subtitle && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: MUTED,
                fontSize: "22px",
                fontWeight: "500",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "2px",
                  background: config.accent,
                  borderRadius: "2px",
                  display: "flex",
                  flexShrink: 0,
                }}
              />
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: price + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {price ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span
                style={{
                  color: MUTED,
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Asking Price
              </span>
              <span
                style={{
                  color: config.accent,
                  fontSize: "36px",
                  fontWeight: "900",
                  letterSpacing: "-1px",
                }}
              >
                {price}
              </span>
            </div>
          ) : (
            <div />
          )}

          {/* Site URL */}
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            {SITE_URL.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
