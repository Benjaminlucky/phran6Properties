"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Ruler,
  BedDouble,
  Bath,
  Car,
} from "lucide-react";
import PropertyCard from "@/components/public/PropertyCard";
import HouseCard from "@/components/public/HouseCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { API_URL } from "@/config/site";
import { formatPrice } from "@/lib/utils";

function getImgUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^uploads\//, "");
  return API_URL + "/uploads/" + clean;
}

// ════════════════════════════════════════════════════════════
// FEATURED LANDS — Premium editorial layout
// ════════════════════════════════════════════════════════════
export function FeaturedLands({ lands = [] }) {
  const PLACEHOLDER_LANDS = [
    {
      id: 1,
      slug: "aviara-residence-ibeju-lekki",
      estate_name: "The Aviara Residence",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: 35000000,
      size: "500 SQM",
      title_type: "governors_consent",
      status: "available",
      feature_image: null,
    },
    {
      id: 2,
      slug: "palmview-estate-epe",
      estate_name: "Palmview Estate",
      location: "Epe",
      state: "Lagos",
      price: 18500000,
      size: "300 SQM",
      title_type: "c_of_o",
      status: "available",
      feature_image: null,
    },
    {
      id: 3,
      slug: "greenfield-court-abuja",
      estate_name: "Greenfield Court",
      location: "Lugbe",
      state: "Abuja",
      price: 55000000,
      size: "600 SQM",
      title_type: "c_of_o",
      status: "reserved",
      feature_image: null,
    },
    {
      id: 4,
      slug: "sunrise-park-awoyaya",
      estate_name: "Sunrise Park",
      location: "Awoyaya",
      state: "Lagos",
      price: 22000000,
      size: "450 SQM",
      title_type: "excision",
      status: "available",
      feature_image: null,
    },
  ];

  const displayLands = lands.length ? lands : PLACEHOLDER_LANDS;
  const [hero, ...rest] = displayLands;

  const titleLabels = {
    c_of_o: "C of O",
    governors_consent: "Gov's Consent",
    deed_of_assignment: "Deed",
    excision: "Excision",
    gazette: "Gazette",
    freehold: "Freehold",
    leasehold: "Leasehold",
    survey_plan: "Survey Plan",
  };

  const bgGradients = [
    "linear-gradient(135deg, #1a2744 0%, #0F172A 100%)",
    "linear-gradient(135deg, #0d1f1a 0%, #0F172A 100%)",
    "linear-gradient(135deg, #1f1020 0%, #0F172A 100%)",
    "linear-gradient(135deg, #1a1a2e 0%, #0F172A 100%)",
  ];

  return (
    <section
      className="section-pad"
      style={{
        background: "var(--color-surface-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "radial-gradient(var(--color-secondary) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <div className="container-site" style={{ position: "relative" }}>
        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="section-label">Prime Properties</p>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--text-h2)",
                fontWeight: 800,
                color: "var(--color-secondary)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Featured Land Listings
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                marginTop: "0.5rem",
                fontSize: "0.9375rem",
              }}
            >
              Verified, titled land across Nigeria&apos;s fastest-growing
              corridors
            </p>
          </div>
          <Link
            href="/lands"
            className="btn-outline shrink-0"
            style={{ alignSelf: "flex-end" }}
          >
            View All Lands <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Asymmetric grid layout ── */}
        <div className="featured-lands-grid">
          {/* ── HERO CARD (spans 7 cols, tall) ── */}
          {hero && (
            <Link
              href={`/lands/${hero.slug}`}
              className="group featured-land-hero"
              style={{
                background: hero.feature_image ? undefined : bgGradients[0],
              }}
            >
              {/* ✅ plain <img> — avoids Next.js private-IP SSR blocking */}
              {hero.feature_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImgUrl(hero.feature_image)}
                  alt={hero.estate_name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 700ms",
                  }}
                  className="group-hover:scale-105"
                />
              )}

              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(5,10,20,0.97) 0%, rgba(5,10,20,0.5) 45%, rgba(5,10,20,0.1) 100%)",
                }}
              />

              {/* Dot pattern overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.06,
                  backgroundImage:
                    "radial-gradient(white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Top badges */}
              <div
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  left: "1.25rem",
                  right: "1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.3rem 0.8rem",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-heading)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    boxShadow: "var(--shadow-coral)",
                  }}
                >
                  Featured
                </span>
                {hero.title_type && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.3rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {titleLabels[hero.title_type] || hero.title_type}
                  </span>
                )}
              </div>

              {/* Bottom content */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "2rem 1.75rem",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "rgba(255,107,107,0.15)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: "var(--radius-full)",
                    padding: "0.25rem 0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <MapPin size={11} style={{ color: "var(--color-primary)" }} />
                  <span
                    style={{
                      color: "var(--color-primary)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {hero.location}, {hero.state}
                  </span>
                </div>

                <h3
                  style={{
                    color: "white",
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.4rem, 2.5vw, 1.875rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    marginBottom: "1rem",
                  }}
                >
                  {hero.estate_name}
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {hero.size && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <Ruler
                          size={13}
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        />
                        <span
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {hero.size}
                        </span>
                      </div>
                    )}
                    <span
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatPrice(hero.price)}
                    </span>
                  </div>

                  <span
                    className="group-hover:gap-3 transition-all"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "white",
                      color: "var(--color-secondary)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    Book Inspection <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* ── SMALLER CARDS (right column) ── */}
          {rest.slice(0, 3).map((land, i) => (
            <Link
              key={land.id || land.slug}
              href={`/lands/${land.slug}`}
              className="group featured-land-side"
              style={{
                background: land.feature_image ? undefined : bgGradients[i + 1],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-xl)";
                e.currentTarget.style.borderColor =
                  "var(--color-primary-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              {land.feature_image ? (
                <>
                  {/* ✅ plain <img> — avoids Next.js private-IP SSR blocking */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImgUrl(land.feature_image)}
                    alt={land.estate_name}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 500ms",
                    }}
                    className="group-hover:scale-105"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(5,10,20,0.95) 0%, rgba(5,10,20,0.35) 55%, transparent 100%)",
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: bgGradients[i + 1],
                  }}
                />
              )}

              {/* Dot pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.05,
                  backgroundImage:
                    "radial-gradient(white 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />

              {/* Title badge top */}
              {land.title_type && (
                <div
                  style={{
                    position: "absolute",
                    top: "0.875rem",
                    right: "0.875rem",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {titleLabels[land.title_type]}
                  </span>
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "1rem 1.125rem",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "0.7rem",
                    marginBottom: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <MapPin size={10} /> {land.location}, {land.state}
                </p>
                <h3
                  style={{
                    color: "white",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    marginBottom: "0.625rem",
                  }}
                >
                  {land.estate_name}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {formatPrice(land.price, true)}
                  </span>
                  {land.size && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <Ruler size={11} /> {land.size}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Bottom strip: trust signals ── */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1.25rem 1.75rem",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          {[
            {
              icon: "✓",
              label: "Verified Titles",
              desc: "All listings verified",
            },
            {
              icon: "⚲",
              label: "Physical Inspection",
              desc: "Schedule site visits",
            },
            {
              icon: "◈",
              label: "Flexible Payment",
              desc: "Installment plans available",
            },
            {
              icon: "⊙",
              label: "Legal Support",
              desc: "Documentation handled",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "var(--radius)",
                  background: "var(--color-primary-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                }}
              >
                {item.icon}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "var(--color-secondary)",
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    marginTop: "0.2rem",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// FEATURED HOUSES — Magazine-style with active slide spotlight
// ════════════════════════════════════════════════════════════
export function FeaturedHouses({ houses = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const PLACEHOLDER_HOUSES = [
    {
      id: 1,
      slug: "ultra-luxury-mansion-ikoyi",
      title: "Ultra-Luxury 5-Bedroom Mansion in Ikoyi",
      location: "Ikoyi",
      state: "Lagos",
      price: null,
      price_label: "on_request",
      bedrooms: 5,
      bathrooms: 6,
      garage: 2,
      category: "Fully Detached Duplex",
      status: "available",
      featured: true,
      feature_image: null,
      tags: ["New Listing", "Hot Offer"],
    },
    {
      id: 2,
      slug: "modern-penthouse-vi",
      title: "Modern 4-Bedroom Penthouse in Victoria Island",
      location: "Victoria Island",
      state: "Lagos",
      price: 450000000,
      price_label: "outright",
      bedrooms: 4,
      bathrooms: 5,
      garage: 2,
      category: "Penthouse",
      status: "available",
      featured: true,
      feature_image: null,
      tags: ["New Listing"],
    },
    {
      id: 3,
      slug: "executive-terrace-lekki",
      title: "Executive 3-Bedroom Terrace in Lekki Phase 1",
      location: "Lekki Phase 1",
      state: "Lagos",
      price: 180000000,
      price_label: "outright",
      bedrooms: 3,
      bathrooms: 4,
      garage: 1,
      category: "Terrace House",
      status: "available",
      featured: false,
      feature_image: null,
      tags: ["Hot Offer"],
    },
    {
      id: 4,
      slug: "smart-apartment-oniru",
      title: "Smart 2-Bedroom Apartment in Oniru Estate",
      location: "Oniru",
      state: "Lagos",
      price: 95000000,
      price_label: "outright",
      bedrooms: 2,
      bathrooms: 3,
      garage: 1,
      category: "Apartment",
      status: "available",
      featured: false,
      feature_image: null,
      tags: [],
    },
    {
      id: 5,
      slug: "luxury-bungalow-asokoro",
      title: "Luxury 5-Bedroom Bungalow in Asokoro",
      location: "Asokoro",
      state: "Abuja",
      price: 320000000,
      price_label: "outright",
      bedrooms: 5,
      bathrooms: 5,
      garage: 3,
      category: "Bungalow",
      status: "available",
      featured: false,
      feature_image: null,
      tags: ["New Listing"],
    },
  ];

  const displayHouses = houses.length ? houses : PLACEHOLDER_HOUSES;
  const active = displayHouses[activeIdx];

  const cardBgs = [
    "linear-gradient(160deg, #1a1f35 0%, #0F172A 100%)",
    "linear-gradient(160deg, #0d1f2d 0%, #0F172A 100%)",
    "linear-gradient(160deg, #1a1520 0%, #0F172A 100%)",
    "linear-gradient(160deg, #0d1a1a 0%, #0F172A 100%)",
    "linear-gradient(160deg, #1a150d 0%, #0F172A 100%)",
  ];

  const tagColors = {
    "New Listing": {
      bg: "rgba(56,189,248,0.15)",
      color: "var(--color-accent)",
      border: "rgba(56,189,248,0.3)",
    },
    "Hot Offer": {
      bg: "rgba(255,107,107,0.15)",
      color: "var(--color-primary)",
      border: "rgba(255,107,107,0.3)",
    },
    Featured: {
      bg: "rgba(245,158,11,0.15)",
      color: "#F59E0B",
      border: "rgba(245,158,11,0.3)",
    },
  };

  return (
    <section
      className="section-pad"
      style={{
        background: "var(--color-secondary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large faint number watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(12rem, 30vw, 22rem)",
          fontFamily: "var(--font-heading)",
          fontWeight: 900,
          color: "rgba(255,255,255,0.02)",
          pointerEvents: "none",
          lineHeight: 1,
          userSelect: "none",
          letterSpacing: "-0.05em",
          whiteSpace: "nowrap",
        }}
      >
        HOMES
      </div>

      <div className="container-site" style={{ position: "relative" }}>
        {/* ── Header row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "2rem",
                  height: "2px",
                  background: "var(--color-primary)",
                  borderRadius: "2px",
                }}
              />
              Premium Homes
            </p>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "var(--text-h2)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "white",
              }}
            >
              Featured Home Listings
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                marginTop: "0.5rem",
                fontSize: "0.9375rem",
              }}
            >
              Curated luxury and mid-range homes across Nigeria&apos;s top
              addresses
            </p>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {[
              { dir: "prev", icon: <ChevronLeft size={18} />, label: "Prev" },
              { dir: "next", icon: <ChevronRight size={18} />, label: "Next" },
            ].map(({ dir, icon, label }) => (
              <button
                key={dir}
                onClick={() => {
                  if (dir === "prev")
                    setActiveIdx((i) =>
                      i === 0 ? displayHouses.length - 1 : i - 1,
                    );
                  else
                    setActiveIdx((i) =>
                      i === displayHouses.length - 1 ? 0 : i + 1,
                    );
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-primary)";
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                {dir === "prev" && icon} {label} {dir === "next" && icon}
              </button>
            ))}

            <Link
              href="/houses"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Main layout: spotlight left + cards right ── */}
        <div className="featured-houses-grid">
          {/* ── LEFT: Active spotlight ── */}
          <Link
            href={`/houses/${active.slug}`}
            className="featured-house-spotlight"
            style={{
              background: active.feature_image
                ? undefined
                : cardBgs[activeIdx % cardBgs.length],
              transition: "opacity 300ms ease",
            }}
          >
            {/* ✅ plain <img> — avoids Next.js private-IP SSR blocking */}
            {active.feature_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImgUrl(active.feature_image)}
                alt={active.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}

            {/* Gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(5,10,20,0.98) 0%, rgba(5,10,20,0.5) 50%, rgba(5,10,20,0.1) 100%)",
              }}
            />

            {/* Dot pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.06,
                backgroundImage:
                  "radial-gradient(rgba(255,107,107,0.8) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Top: Featured + tags */}
            <div
              style={{
                position: "absolute",
                top: "1.25rem",
                left: "1.25rem",
                right: "1.25rem",
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {active.featured && (
                <span
                  style={{
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.7rem",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-heading)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    boxShadow: "var(--shadow-coral)",
                  }}
                >
                  Featured
                </span>
              )}
              {(active.tags || []).map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: tagColors[tag]?.bg || "rgba(255,255,255,0.1)",
                    color: tagColors[tag]?.color || "white",
                    border: `1px solid ${tagColors[tag]?.border || "rgba(255,255,255,0.2)"}`,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.7rem",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-heading)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Index indicator */}
            <div
              style={{ position: "absolute", top: "1.25rem", right: "1.25rem" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {String(activeIdx + 1).padStart(2, "0")} /{" "}
                {String(displayHouses.length).padStart(2, "0")}
              </span>
            </div>

            {/* Content */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "2rem 1.75rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  marginBottom: "0.75rem",
                  background: "rgba(255,107,107,0.15)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.25rem 0.75rem",
                }}
              >
                <MapPin size={11} style={{ color: "var(--color-primary)" }} />
                <span
                  style={{
                    color: "var(--color-primary)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {active.location}, {active.state}
                </span>
              </div>

              <h3
                style={{
                  color: "white",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                  marginBottom: "1.25rem",
                }}
              >
                {active.title}
              </h3>

              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    icon: <BedDouble size={14} />,
                    value:
                      active.bedrooms === 0
                        ? "Self Con"
                        : `${active.bedrooms} Beds`,
                  },
                  {
                    icon: <Bath size={14} />,
                    value: `${active.bathrooms} Baths`,
                  },
                  active.garage > 0 && {
                    icon: <Car size={14} />,
                    value: `${active.garage} Garage`,
                  },
                ]
                  .filter(Boolean)
                  .map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <span style={{ color: "var(--color-primary)" }}>
                        {stat.icon}
                      </span>
                      {stat.value}
                    </div>
                  ))}
                {active.category && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {active.category}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.7rem",
                      marginBottom: "0.2rem",
                      fontFamily: "var(--font-heading)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {active.price_label === "per_annum"
                      ? "Per Annum"
                      : "Asking Price"}
                  </p>
                  <p
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "1.5rem",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {active.price_label === "on_request"
                      ? "Price on Request"
                      : formatPrice(active.price)}
                  </p>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "white",
                    color: "var(--color-secondary)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    padding: "0.65rem 1.25rem",
                    borderRadius: "var(--radius)",
                  }}
                >
                  View Property <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>

          {/* ── RIGHT: Stacked cards ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            {displayHouses.map((house, idx) => (
              <button
                key={house.id || house.slug}
                onClick={() => setActiveIdx(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.125rem",
                  borderRadius: "var(--radius-lg)",
                  border: `1px solid ${activeIdx === idx ? "rgba(255,107,107,0.4)" : "rgba(255,255,255,0.07)"}`,
                  background:
                    activeIdx === idx
                      ? "rgba(255,107,107,0.08)"
                      : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 200ms ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (activeIdx !== idx) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeIdx !== idx) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.07)";
                  }
                }}
              >
                {/* Active indicator bar */}
                {activeIdx === idx && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "3px",
                      background: "var(--color-primary)",
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                )}

                {/* Thumbnail */}
                <div
                  style={{
                    width: "72px",
                    height: "64px",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    flexShrink: 0,
                    position: "relative",
                    background: cardBgs[idx % cardBgs.length],
                  }}
                >
                  {/* ✅ plain <img> — avoids Next.js private-IP SSR blocking */}
                  {house.feature_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImgUrl(house.feature_image)}
                      alt={house.title}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {/* Mini dot pattern */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.08,
                      backgroundImage:
                        "radial-gradient(white 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      marginBottom: "0.4rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {house.featured && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          color: "var(--color-primary)",
                          fontFamily: "var(--font-heading)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        ● Featured
                      </span>
                    )}
                    {(house.tags || []).slice(0, 1).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          color:
                            tagColors[tag]?.color || "rgba(255,255,255,0.5)",
                          fontFamily: "var(--font-heading)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        ● {tag}
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      color:
                        activeIdx === idx ? "white" : "rgba(255,255,255,0.65)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      lineHeight: 1.3,
                      marginBottom: "0.375rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {house.title}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.7rem",
                      }}
                    >
                      <MapPin size={9} /> {house.location}
                    </span>
                    <span
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "0.8125rem",
                      }}
                    >
                      {house.price_label === "on_request"
                        ? "On Request"
                        : formatPrice(house.price, true)}
                    </span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <ChevronRight
                  size={14}
                  style={{
                    color:
                      activeIdx === idx
                        ? "var(--color-primary)"
                        : "rgba(255,255,255,0.2)",
                    flexShrink: 0,
                    transition: "color 200ms",
                  }}
                />
              </button>
            ))}

            {/* Bottom CTA */}
            <Link
              href="/houses"
              className="btn-outline"
              style={{
                marginTop: "0.5rem",
                justifyContent: "center",
                borderColor: "rgba(255,107,107,0.4)",
                color: "var(--color-primary)",
              }}
            >
              Browse All Properties <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Progress dots ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "2rem",
          }}
        >
          {displayHouses.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              style={{
                width: activeIdx === idx ? "2rem" : "0.5rem",
                height: "0.5rem",
                borderRadius: "var(--radius-full)",
                background:
                  activeIdx === idx
                    ? "var(--color-primary)"
                    : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 300ms ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// POPULAR AREAS
// ════════════════════════════════════════════════════════════
export function PopularAreas({ areas = [] }) {
  // Initialise from prop immediately; self-fetch only once if prop is empty.
  // useRef guard prevents re-renders from re-triggering the fetch and
  // overwriting live DB data with the hardcoded fallback.
  const [displayAreas, setDisplayAreas] = useState(
    areas.length > 0 ? areas : null,
  );
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Props arrived with real data — use them, no fetch needed.
    if (areas.length > 0) {
      setDisplayAreas(areas);
      return;
    }
    // Guard: only self-fetch once, never on subsequent re-renders.
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const FALLBACK = [
      { name: "Lekki Phase 1", location: "Lagos", count: "24 Properties" },
      { name: "Ikate", location: "Lagos", count: "18 Properties" },
      { name: "Chevron Drive", location: "Lagos", count: "31 Properties" },
      { name: "Maitama", location: "Abuja", count: "15 Properties" },
      { name: "Asokoro", location: "Abuja", count: "22 Properties" },
      { name: "GRA", location: "Port Harcourt", count: "19 Properties" },
    ];

    fetch(API_URL + "/popular-areas")
      .then((r) => r.json())
      .then((json) => {
        const data = json?.data || [];
        setDisplayAreas(data.length > 0 ? data : FALLBACK);
      })
      .catch(() => setDisplayAreas(FALLBACK));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // While the self-fetch is in-flight show the fallback immediately
  const items = displayAreas ?? [
    { name: "Lekki Phase 1", location: "Lagos", count: "24 Properties" },
    { name: "Ikate", location: "Lagos", count: "18 Properties" },
    { name: "Chevron Drive", location: "Lagos", count: "31 Properties" },
    { name: "Maitama", location: "Abuja", count: "15 Properties" },
    { name: "Asokoro", location: "Abuja", count: "22 Properties" },
    { name: "GRA", location: "Port Harcourt", count: "19 Properties" },
  ];

  return (
    <section
      className="section-pad"
      style={{ background: "var(--color-surface-2)" }}
    >
      <div className="container-site">
        <SectionHeader
          title="Explore Our Most Popular Areas"
          subtitle="See which areas have the most to offer and find your perfect home"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 6).map((area) => {
            const imageUrl = area.image_url ? getImgUrl(area.image_url) : null;
            const href = area.link_path
              ? area.link_path
              : `/lands?location=${encodeURIComponent(area.name)}`;

            return (
              <Link
                key={area.name}
                href={href}
                className="group relative h-64 rounded-2xl overflow-hidden block"
              >
                {/* ✅ plain <img> — avoids Next.js private-IP SSR blocking */}
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={area.name}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 500ms",
                    }}
                    className="group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-light) 100%)`,
                    }}
                  />
                )}

                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(28,28,46,0.92) 0%, rgba(28,28,46,0.3) 60%, transparent 100%)",
                  }}
                />

                {/* Dot pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(var(--color-primary) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div
                    className="self-start px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(16,185,129,0.2)",
                      color: "var(--color-primary)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {area.count || "Properties Available"}
                  </div>

                  <div>
                    <div
                      className="flex items-center gap-1 text-xs mb-1"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      <MapPin size={11} />
                      {area.location}
                    </div>
                    <h3
                      className="text-xl font-bold text-white mb-3"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {area.name}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                      style={{
                        background: "var(--color-primary)",
                        color: "white",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      More Details <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// TESTIMONIALS
// ════════════════════════════════════════════════════════════
export function Testimonials({ testimonials = [] }) {
  const defaultTestimonials = [
    {
      id: 1,
      name: "Chukwuemeka Obi",
      role: "Land Buyer, Lekki",
      rating: 5,
      review:
        "I found my dream plot through this platform. The process was smooth, transparent, and the team was incredibly helpful throughout. I now have a C of O land in Lekki Phase 2. Highly recommended!",
      avatar: null,
    },
    {
      id: 2,
      name: "Fatima Al-Hassan",
      role: "Property Investor, Abuja",
      rating: 5,
      review:
        "As someone who invests in real estate across Nigeria, this is the most trustworthy platform I've used. The listings are verified, the agents are professional, and my investments have been solid.",
      avatar: null,
    },
    {
      id: 3,
      name: "Adaeze Nwosu",
      role: "First-time Buyer, Lagos",
      rating: 5,
      review:
        "I was skeptical about buying property online but the team put my fears to rest. From inspection to payment, everything was handled professionally. My family is so happy in our new home!",
      avatar: null,
    },
    {
      id: 4,
      name: "Babatunde Adeyemi",
      role: "Developer, Port Harcourt",
      rating: 5,
      review:
        "The quality of listings and the responsiveness of the team is unmatched. I've purchased 3 plots through this platform for my development projects. Always a pleasure doing business.",
      avatar: null,
    },
  ];

  const displayTestimonials = testimonials.length
    ? testimonials
    : defaultTestimonials;

  return (
    <section
      className="section-pad"
      style={{ background: "var(--color-secondary)" }}
    >
      <div className="container-site">
        <SectionHeader
          title="Our Clients' Reviews"
          subtitle="Don't take our word for it — hear from Nigerians who found their properties with us"
          light
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayTestimonials.map((t) => (
            <div
              key={t._id || t.id}
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill="var(--color-accent)"
                    style={{ color: "var(--color-accent)" }}
                  />
                ))}
              </div>

              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                &ldquo;{t.review}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: "var(--color-primary)",
                    color: "white",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {t.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// PARTNERS
// ════════════════════════════════════════════════════════════
export function Partners({ partners = [] }) {
  const FALLBACK = [
    { id: 1, name: "Landmark Group" },
    { id: 2, name: "CruxStone Realty" },
    { id: 3, name: "Quest Properties" },
    { id: 4, name: "Veritasi Homes" },
    { id: 5, name: "Mixta Africa" },
    { id: 6, name: "Propertymart" },
  ];

  // Initialise from prop immediately; self-fetch only once if prop is empty.
  // useRef guard prevents re-renders from re-triggering the fetch and
  // overwriting live DB data with the hardcoded fallback.
  const [displayPartners, setDisplayPartners] = useState(
    partners.length > 0 ? partners : null,
  );
  const partnerFetchedRef = useRef(false);

  useEffect(() => {
    // Props arrived with real data — use them, no fetch needed.
    if (partners.length > 0) {
      setDisplayPartners(partners);
      return;
    }
    // Guard: only self-fetch once, never on subsequent re-renders.
    if (partnerFetchedRef.current) return;
    partnerFetchedRef.current = true;

    fetch(API_URL + "/partners")
      .then((r) => r.json())
      .then((json) => {
        const data = json?.data || [];
        setDisplayPartners(data.length > 0 ? data : FALLBACK);
      })
      .catch(() => setDisplayPartners(FALLBACK));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // While the self-fetch is in-flight show the fallback immediately
  const shownPartners = displayPartners ?? FALLBACK;

  return (
    <section className="py-14" style={{ background: "var(--color-surface)" }}>
      <div className="container-site">
        <p
          className="text-center text-sm font-semibold mb-8 uppercase tracking-widest"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Our Partners — We are in partnership with companies driven by
          excellence
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {shownPartners.map((partner) => (
            <div
              key={partner._id || partner.id}
              className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              {partner.logo_url || partner.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partner.logo_url || partner.logo}
                  alt={partner.name}
                  style={{
                    height: "40px",
                    width: "auto",
                    maxWidth: "120px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-secondary)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
