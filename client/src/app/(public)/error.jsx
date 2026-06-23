"use client";

import { useEffect } from "react";

export default function PublicError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "var(--font-body, Inter, sans-serif)",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--color-primary-muted, #e8ffd6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          fontSize: "1.75rem",
        }}
      >
        ⚠
      </div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "var(--color-text, #0f1f20)",
          margin: "0 0 0.5rem",
          fontFamily: "var(--font-heading, Plus Jakarta Sans, sans-serif)",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          color: "var(--color-text-secondary, #3d5a5c)",
          maxWidth: "400px",
          margin: "0 auto 2rem",
          lineHeight: 1.6,
        }}
      >
        We couldn&apos;t load this page. Please check your connection and try again.
      </p>
      <button
        onClick={reset}
        style={{
          background: "var(--color-primary, #b2ff70)",
          color: "var(--color-secondary, #1b2f31)",
          border: "none",
          borderRadius: "var(--radius, 0.625rem)",
          padding: "0.75rem 2rem",
          fontWeight: 700,
          fontSize: "0.9rem",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
