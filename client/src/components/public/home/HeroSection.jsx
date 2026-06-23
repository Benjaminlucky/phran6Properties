"use client";

import { useState, useEffect, useRef } from "react";
import InquiryForm from "./InquiryForm";
import { buildWhatsAppLink } from "@/lib/utils";
import { SITE_CONFIG } from "@/config/site";

// ── CountUp hook ──────────────────────────────────────────────────
// Counts from 0 → target over `duration` ms using requestAnimationFrame.
// Returns the current display value as a number.
function useCountUp(target, duration = 1800, enabled = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Don't start until the element is in the viewport
    if (!enabled || target <= 0) return;

    // Cancel any previous animation before starting fresh
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    setCount(0);

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(target); // snap to exact final value
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled]);

  return count;
}

// ── Single animated stat ──────────────────────────────────────────
function AnimatedStat({ target, suffix = "+", label, enabled }) {
  const count = useCountUp(target, 1800, enabled);
  const display = enabled
    ? `${count.toLocaleString()}${suffix}`
    : `${target.toLocaleString()}${suffix}`;

  return (
    <div>
      <p
        className="text-2xl font-extrabold leading-none"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-primary)",
        }}
      >
        {display}
      </p>
      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </p>
    </div>
  );
}

// ── Stats row with IntersectionObserver trigger ───────────────────
function StatsRow({ stats }) {
  const rowRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el || hasEntered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect(); // fire once only
        }
      },
      { threshold: 0.25 }, // trigger when 25% of the row is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <div ref={rowRef} className="flex flex-wrap gap-8 mb-8">
      {stats.map((stat) => (
        <AnimatedStat
          key={stat.label}
          target={stat.target}
          suffix={stat.suffix}
          label={stat.label}
          enabled={hasEntered}
        />
      ))}
    </div>
  );
}

// ── WhatsApp button ───────────────────────────────────────────────
function WhatsAppButton({ href }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        background: "#25D366",
        color: "white",
        padding: "0.75rem 1.5rem",
        borderRadius: "9999px",
        fontFamily: "var(--font-heading)",
        fontWeight: 700,
        fontSize: "0.9375rem",
        textDecoration: "none",
        boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
        transition: "transform 150ms, box-shadow 150ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,211,102,0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,211,102,0.35)";
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ flexShrink: 0 }}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      Chat on WhatsApp
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────
/**
 * HeroSection — "use client" required for CountUp (useState, useEffect,
 * requestAnimationFrame, IntersectionObserver).
 *
 * Props:
 *   settings    — key/value from GET /settings (hero copy, whatsapp, etc.)
 *   publicStats — live counts from GET /stats/public:
 *                   { total_listings, total_enquiries, states_covered }
 *
 * Fallback chain for each counter:
 *   1. Live publicStats value (API, fetched server-side in page.jsx)
 *   2. Admin-overridden settings.stat_* value (parsed as a number)
 *   3. Hard-coded default number
 *
 * The stats row is invisible until the IntersectionObserver fires,
 * then CountUp animates each number from 0 → target in 1.8 s with
 * an ease-out cubic curve. Fires once per page load.
 */
export default function HeroSection({ settings, publicStats }) {
  const headline = settings?.hero_headline || "Your Trusted Gateway for";
  const highlight =
    settings?.hero_highlight || "Lands, Houses & Real Estate Investment";
  const subtext =
    settings?.hero_subtext ||
    "Find your perfect property across Nigeria. Verified listings, transparent pricing, trusted agents.";

  const whatsapp = settings?.whatsapp || SITE_CONFIG.whatsapp;
  const waLink = whatsapp
    ? buildWhatsAppLink(
        whatsapp,
        "Hello! I found you on your website and I'm interested in buying a property.\n\nPlease help me find the right option.",
      )
    : null;

  // ── Resolve stat targets ────────────────────────────────────────
  // Parse a settings string like "500+" or "2,000+" into a plain number.
  const parseSettingNum = (str) =>
    str ? parseInt(str.replace(/[^0-9]/g, ""), 10) || 0 : 0;

  const listingsTarget =
    publicStats?.total_listings != null
      ? publicStats.total_listings
      : parseSettingNum(settings?.stat_listings) || 500;

  const enquiriesTarget =
    publicStats?.total_enquiries != null
      ? publicStats.total_enquiries
      : parseSettingNum(settings?.stat_clients) || 2000;

  const statesTarget =
    publicStats?.states_covered != null
      ? publicStats.states_covered
      : parseSettingNum(settings?.stat_states) || 15;

  const stats = [
    { target: listingsTarget, suffix: "+", label: "Active Listings" },
    { target: enquiriesTarget, suffix: "+", label: "Happy Clients" },
    { target: statesTarget, suffix: "+", label: "States Covered" },
  ];

  return (
    <section
      className="hero-section relative min-h-screen flex items-center"
      style={{ paddingTop: "4rem" }}
    >
      {/* ── Decorative blobs ── */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />

      <div className="container-site w-full py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left: Headline + animated stats + WhatsApp ── */}
          <div className="animate-fade-in-up">
            {/* Eyebrow tag */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: "rgba(16,185,129,0.12)",
                color: "var(--color-primary)",
                border: "1px solid rgba(16,185,129,0.25)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-primary)" }}
              />
              Nigeria&apos;s Premium Property Marketplace
            </div>

            {/* Headline */}
            <h1
              className="font-extrabold leading-tight mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
                letterSpacing: "-0.03em",
                color: "white",
              }}
            >
              {headline} <span className="gradient-text">{highlight}</span>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed mb-8 max-w-lg"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {subtext}
            </p>

            {/* Animated stat counters — fire on viewport entry */}
            <StatsRow stats={stats} />

            {/* WhatsApp CTA */}
            <WhatsAppButton href={waLink} />
          </div>

          {/* ── Right: Inquiry Form ── */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <InquiryForm settings={settings} />
          </div>
        </div>
      </div>
    </section>
  );
}
