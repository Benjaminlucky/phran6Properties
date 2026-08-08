import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
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
        🧭
      </div>
      <p
        style={{
          fontFamily: "var(--font-heading, Plus Jakarta Sans, sans-serif)",
          fontWeight: 800,
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-primary-dark, #5ecb40)",
          margin: "0 0 0.75rem",
        }}
      >
        404 Error
      </p>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "var(--color-text, #0f1f20)",
          margin: "0 0 0.5rem",
          fontFamily: "var(--font-heading, Plus Jakarta Sans, sans-serif)",
        }}
      >
        We couldn&apos;t find that page
      </h1>
      <p
        style={{
          color: "var(--color-text-secondary, #3d5a5c)",
          maxWidth: "420px",
          margin: "0 auto 2rem",
          lineHeight: 1.6,
        }}
      >
        The listing or page you&apos;re looking for may have been moved, sold,
        or no longer exists. Try one of the links below instead.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          style={{
            background: "var(--color-primary, #b2ff70)",
            color: "var(--color-secondary, #1b2f31)",
            textDecoration: "none",
            borderRadius: "var(--radius, 0.625rem)",
            padding: "0.75rem 1.75rem",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          Back to Home
        </Link>
        <Link
          href="/houses"
          style={{
            background: "var(--color-surface, #ffffff)",
            color: "var(--color-text, #0f1f20)",
            border: "1px solid var(--color-border, #e2e8e0)",
            textDecoration: "none",
            borderRadius: "var(--radius, 0.625rem)",
            padding: "0.75rem 1.75rem",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          Browse Houses
        </Link>
        <Link
          href="/lands"
          style={{
            background: "var(--color-surface, #ffffff)",
            color: "var(--color-text, #0f1f20)",
            border: "1px solid var(--color-border, #e2e8e0)",
            textDecoration: "none",
            borderRadius: "var(--radius, 0.625rem)",
            padding: "0.75rem 1.75rem",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          Browse Lands
        </Link>
      </div>
    </div>
  );
}
