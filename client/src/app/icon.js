import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <span
          style={{
            color: "#b2ff70",
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "sans-serif",
            letterSpacing: "-1px",
          }}
        >
          M
        </span>
      </div>
    ),
    { ...size },
  );
}
