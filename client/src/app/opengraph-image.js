import { ImageResponse } from "next/og";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Nigerian Realty";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — Premium Properties Across Nigeria`;

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1b2f31",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 90px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(178,255,112,0.07)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: 200,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(178,255,112,0.04)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(178,255,112,0.05)",
            display: "flex",
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              background: "#b2ff70",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#1b2f31",
                fontSize: 36,
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: "sans-serif",
                letterSpacing: "-1px",
              }}
            >
              M
            </span>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 34,
              fontWeight: 700,
              fontFamily: "sans-serif",
              letterSpacing: "-0.5px",
            }}
          >
            {SITE_NAME}
          </span>
        </div>

        {/* Headline — line 1 in lime */}
        <div
          style={{
            color: "#b2ff70",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            marginBottom: 8,
            fontFamily: "sans-serif",
            display: "flex",
          }}
        >
          Premium Properties
        </div>

        {/* Headline — line 2 in white */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            marginBottom: 44,
            fontFamily: "sans-serif",
            display: "flex",
          }}
        >
          Across Nigeria.
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 28,
            fontWeight: 400,
            fontFamily: "sans-serif",
            display: "flex",
            letterSpacing: "0.2px",
          }}
        >
          Lands · Houses · Real Estate Investment
        </div>

        {/* Domain watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 54,
            right: 90,
            color: "rgba(255,255,255,0.22)",
            fontSize: 22,
            fontWeight: 500,
            fontFamily: "sans-serif",
            display: "flex",
          }}
        >
          {(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/^https?:\/\//, "") || SITE_NAME}
        </div>
      </div>
    ),
    { ...size },
  );
}
