import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1b2f31",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            background: "#b2ff70",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#1b2f31",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1,
              fontFamily: "sans-serif",
              letterSpacing: "-3px",
            }}
          >
            M
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
