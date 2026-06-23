"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function PageHero({
  title,
  subtitle,
  breadcrumbs = [],
  children,
}) {
  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 60%, #1E2D4A 100%)",
        paddingTop: "7rem",
        paddingBottom: "3.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Coral glow top right */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: "radial-gradient(white 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      <div className="container-site" style={{ position: "relative" }}>
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.8rem",
                transition: "color 150ms",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
              }
            >
              <Home size={12} /> Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <ChevronRight
                  size={12}
                  style={{ color: "rgba(255,255,255,0.25)" }}
                />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "0.8rem",
                      transition: "color 150ms",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                    }
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      color: "var(--color-primary)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "var(--text-h1)",
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: subtitle ? "0.75rem" : 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "1rem",
              maxWidth: "520px",
            }}
          >
            {subtitle}
          </p>
        )}
        {children && <div style={{ marginTop: "1.5rem" }}>{children}</div>}
      </div>
    </section>
  );
}
