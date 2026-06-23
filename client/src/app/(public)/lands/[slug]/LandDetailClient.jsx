"use client";

import Image from "next/image";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Ruler,
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  MessageCircle,
  Share2,
  Eye,
  ArrowLeft,
  Play,
  Home,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatPrice,
  buildWhatsAppLink,
  getStatusBadge,
  getStatusLabel,
  getYouTubeEmbed,
  formatDate,
} from "@/lib/utils";
import { enquiriesApi } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import PropertyCard from "@/components/public/PropertyCard";

// ── WhatsApp SVG ──────────────────────────────────────────────────
function WAIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Title type labels ─────────────────────────────────────────────
const TITLE_LABELS = {
  c_of_o: "Certificate of Occupancy (C of O)",
  governors_consent: "Governor's Consent",
  deed_of_assignment: "Deed of Assignment",
  excision: "Excision",
  gazette: "Gazette",
  freehold: "Freehold",
  leasehold: "Leasehold",
  survey_plan: "Survey Plan Only",
};

// ── Gallery Lightbox ──────────────────────────────────────────────
// FIX: added title prop so thumbnail alt doesn't reference estate_name from outer scope
function Lightbox({ images, startIndex, onClose, title = "Property" }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          background: "rgba(255,255,255,0.1)",
          border: "none",
          borderRadius: "50%",
          width: "2.5rem",
          height: "2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          zIndex: 1,
        }}
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.875rem",
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
        }}
      >
        {current + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={prev}
          style={{
            position: "absolute",
            left: "1rem",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "50%",
            width: "3rem",
            height: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[current]}
        alt={`Gallery image ${current + 1}`}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          objectFit: "contain",
          borderRadius: "0.5rem",
        }}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={next}
          style={{
            position: "absolute",
            right: "1rem",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "50%",
            width: "3rem",
            height: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.5rem",
            maxWidth: "90vw",
            overflowX: "auto",
          }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                flexShrink: 0,
                width: "56px",
                height: "44px",
                borderRadius: "0.375rem",
                overflow: "hidden",
                border: `2px solid ${i === current ? "var(--color-primary)" : "rgba(255,255,255,0.2)"}`,
                background: "none",
                padding: 0,
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${title} — gallery photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inline Enquiry Form ───────────────────────────────────────────
function EnquiryForm({ land, settings }) {
  const [form, setForm] = useState({
    first_name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    setLoading(true);
    try {
      await enquiriesApi.submit({
        first_name: form.first_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message:
          form.message.trim() ||
          `I am interested in ${land.estate_name} (${land.location || land.state}). Please contact me with more details.`,
        listing_type: "land",
        listing_id: land._id,
        inquiry_type: "Buy Land",
        source: "land_detail_page",
      });
      setSent(true);
      toast.success("Enquiry sent! We'll be in touch shortly.");
    } catch (err) {
      toast.error("Failed to submit. Please try WhatsApp instead.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface-3)",
    color: "var(--color-text)",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "var(--font-body)",
    transition: "border-color 200ms",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: "0.375rem",
    color: "var(--color-text-secondary)",
    fontFamily: "var(--font-heading)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
        <div
          style={{
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "50%",
            background: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          <CheckCircle2 size={28} style={{ color: "#16A34A" }} />
        </div>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-text)",
            marginBottom: "0.5rem",
          }}
        >
          Enquiry Received!
        </p>
        <p
          style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
        >
          Our team will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>
            Name <span style={{ color: "var(--color-primary)" }}>*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="Your name"
            required
            style={inputStyle}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-primary)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Phone <span style={{ color: "var(--color-primary)" }}>*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+234..."
            required
            style={inputStyle}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-primary)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="email@example.com"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us your requirements..."
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.75rem",
          background: "var(--color-primary)",
          color: "var(--color-secondary)",
          border: "none",
          borderRadius: "var(--radius)",
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "0.9375rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.75 : 1,
          transition: "opacity 150ms",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send size={16} /> Send Enquiry
          </>
        )}
      </button>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function LandDetailClient({ land, settings, related }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const {
    _id,
    estate_name,
    slug,
    price,
    title_type,
    size,
    status,
    overview_title,
    overview_body,
    amenities = [],
    neighborhood = [],
    payment_plan,
    initial_deposit_pct,
    feature_image,
    gallery = [],
    youtube_url,
    address,
    location,
    state,
    lga,
    views_count,
    createdAt,
  } = land;

  const whatsapp = settings?.whatsapp || SITE_CONFIG.whatsapp;
  const phone = settings?.phone || SITE_CONFIG.phone;
  const propertyUrl = `${SITE_URL}/lands/${slug}`;

  // Build all images: feature first, then gallery (deduped)
  const allImages = [
    ...(feature_image ? [feature_image] : []),
    ...gallery.filter((img) => img !== feature_image),
  ];

  const waMessage =
    `Hello! I'm interested in this land listing:\n\n` +
    `*${estate_name}*\n` +
    `📍 ${[location, state].filter(Boolean).join(", ")}\n` +
    (price ? `💰 ${formatPrice(price)}\n` : "") +
    (size ? `📐 ${size}\n` : "") +
    `\n${propertyUrl}\n\nPlease send me more details.`;

  const waLink = whatsapp ? buildWhatsAppLink(whatsapp, waMessage) : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: estate_name, url: propertyUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(propertyUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const isSold = status === "sold";

  return (
    <>
      {/* Lightbox — FIX: pass title={estate_name} so Lightbox has it in scope */}
      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          title={estate_name}
        />
      )}

      {/* ── Page header ── */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 60%, #1E2D4A 100%)",
          paddingTop: "7rem",
          paddingBottom: "2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgb(178 255 112 / 0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div className="container-site" style={{ position: "relative" }}>
          {/* Breadcrumb */}
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
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}
            >
              Home
            </Link>
            <span
              style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}
            >
              ›
            </span>
            <Link
              href="/lands"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}
            >
              Lands
            </Link>
            <span
              style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}
            >
              ›
            </span>
            <span
              style={{
                color: "var(--color-primary)",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {estate_name}
            </span>
          </nav>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  color: "white",
                  marginBottom: "0.625rem",
                  lineHeight: 1.2,
                }}
              >
                {estate_name}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <span className={getStatusBadge(status)}>
                  {getStatusLabel(status)}
                </span>
                {title_type && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.8)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {TITLE_LABELS[title_type] || title_type}
                  </span>
                )}
                {location && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <MapPin size={13} />
                    {[location, state].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
              <button
                onClick={handleShare}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius)",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <Share2 size={14} /> Share
              </button>
              <Link
                href="/lands"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <ArrowLeft size={14} /> All Lands
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ background: "var(--color-surface-2)" }}>
        <div
          className="container-site"
          style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}
        >
          <div className="detail-page-grid">
            {/* ── LEFT COLUMN ── */}
            <div>
              {/* ── Gallery ── */}
              {allImages.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  {/* Hero image */}
                  <div
                    onClick={() => setLightboxIndex(0)}
                    style={{
                      position: "relative",
                      height: "420px",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      cursor: "zoom-in",
                      marginBottom: "0.5rem",
                      background: "#1e293b",
                    }}
                  >
                    <Image
                      src={allImages[0]}
                      alt={estate_name}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1200px) 80vw, 70vw"
                      priority
                      style={{ objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "1rem",
                        right: "1rem",
                        background: "rgba(0,0,0,0.55)",
                        color: "white",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "var(--radius)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontFamily: "var(--font-heading)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <Eye size={13} /> {allImages.length} photo
                      {allImages.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Thumbnail strip */}
                  {allImages.length > 1 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "0.5rem",
                      }}
                    >
                      {allImages.slice(1, 6).map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setLightboxIndex(i + 1)}
                          style={{
                            height: "80px",
                            borderRadius: "var(--radius)",
                            overflow: "hidden",
                            cursor: "zoom-in",
                            position: "relative",
                            background: "#1e293b",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`${estate_name} — photo ${i + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {/* Show "+N more" on last thumbnail */}
                          {i === 4 && allImages.length > 6 && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.55)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                fontFamily: "var(--font-heading)",
                              }}
                            >
                              +{allImages.length - 5}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No images placeholder */}
              {allImages.length === 0 && (
                <div
                  style={{
                    height: "280px",
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, #0f172a, #1e293b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "2rem",
                  }}
                >
                  <MapPin size={48} style={{ color: "#475569" }} />
                </div>
              )}

              {/* ── Key facts bar ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "0.75rem",
                  marginBottom: "2rem",
                }}
              >
                {[
                  { label: "Plot Size", value: size || "—" },
                  {
                    label: "Title",
                    value: TITLE_LABELS[title_type] || title_type || "—",
                  },
                  {
                    label: "Location",
                    value: [location, state].filter(Boolean).join(", ") || "—",
                  },
                  { label: "Status", value: getStatusLabel(status) },
                  ...(views_count > 0
                    ? [{ label: "Views", value: `${views_count} views` }]
                    : []),
                ].map((fact) => (
                  <div
                    key={fact.label}
                    style={{
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                      padding: "0.875rem 1rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-heading)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {fact.label}
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "var(--color-secondary)",
                        fontFamily: "var(--font-heading)",
                        lineHeight: 1.3,
                      }}
                    >
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Overview ── */}
              {(overview_title || overview_body) && (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                    padding: "1.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1.125rem",
                      color: "var(--color-secondary)",
                      marginBottom: "0.875rem",
                    }}
                  >
                    {overview_title || "About This Property"}
                  </h2>
                  {overview_body && (
                    <div
                      style={{
                        fontSize: "0.9375rem",
                        lineHeight: 1.75,
                        color: "var(--color-text-secondary)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {overview_body}
                    </div>
                  )}
                </div>
              )}

              {/* ── Amenities ── */}
              {amenities.length > 0 && (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                    padding: "1.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1.125rem",
                      color: "var(--color-secondary)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Estate Amenities
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "0.625rem",
                    }}
                  >
                    {amenities.map((a) => (
                      <div
                        key={a}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <CheckCircle2
                          size={16}
                          style={{
                            color: "var(--color-primary)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {a}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Neighborhood ── */}
              {neighborhood.length > 0 && (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                    padding: "1.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1.125rem",
                      color: "var(--color-secondary)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    What's Nearby
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "0.625rem",
                    }}
                  >
                    {neighborhood.map((n) => (
                      <div
                        key={n}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <MapPin
                          size={14}
                          style={{
                            color: "var(--color-primary)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {n}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Payment Plan ── */}
              {(payment_plan || initial_deposit_pct) && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(178 255 112 / 0.06), rgb(178 255 112 / 0.02))",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgb(178 255 112 / 0.2)",
                    padding: "1.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1.125rem",
                      color: "var(--color-secondary)",
                      marginBottom: "0.875rem",
                    }}
                  >
                    Payment Plan
                  </h2>
                  {initial_deposit_pct && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <span
                        style={{
                          fontSize: "2rem",
                          fontWeight: 800,
                          color: "var(--color-secondary)",
                          fontFamily: "var(--font-heading)",
                        }}
                      >
                        {initial_deposit_pct}%
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                          marginLeft: "0.5rem",
                        }}
                      >
                        Initial Deposit
                      </span>
                    </div>
                  )}
                  {payment_plan && (
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        lineHeight: 1.7,
                        color: "var(--color-text-secondary)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {payment_plan}
                    </p>
                  )}
                </div>
              )}

              {/* ── YouTube video ── */}
              {youtube_url && getYouTubeEmbed(youtube_url) && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1.125rem",
                      color: "var(--color-secondary)",
                      marginBottom: "1rem",
                    }}
                  >
                    Property Video
                  </h2>
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      background: "#000",
                    }}
                  >
                    <iframe
                      src={getYouTubeEmbed(youtube_url)}
                      title={`${estate_name} video`}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* ── Location details ── */}
              {(address || lga) && (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                    padding: "1.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1.125rem",
                      color: "var(--color-secondary)",
                      marginBottom: "1rem",
                    }}
                  >
                    Location Details
                  </h2>
                  {[
                    address && { label: "Address", value: address },
                    location && { label: "Area", value: location },
                    lga && { label: "LGA", value: lga },
                    state && { label: "State", value: state },
                  ]
                    .filter(Boolean)
                    .map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          gap: "1rem",
                          paddingBottom: "0.625rem",
                          marginBottom: "0.625rem",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-muted)",
                            fontWeight: 600,
                            minWidth: "80px",
                            fontFamily: "var(--font-heading)",
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <aside
              style={{
                position: "sticky",
                top: "6rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Price card */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-heading)",
                    marginBottom: "0.375rem",
                  }}
                >
                  Asking Price
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900,
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    color: "var(--color-secondary)",
                    marginBottom: "1.25rem",
                    lineHeight: 1,
                  }}
                >
                  {price ? formatPrice(price) : "Price on Request"}
                </p>

                {/* WhatsApp CTA — primary action */}
                {waLink && !isSold && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      width: "100%",
                      padding: "0.875rem",
                      borderRadius: "var(--radius)",
                      background: "#25D366",
                      color: "white",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textDecoration: "none",
                      marginBottom: "0.625rem",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#1ebe5a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#25D366")
                    }
                  >
                    <WAIcon size={18} /> Chat on WhatsApp
                  </a>
                )}

                {/* Phone call button */}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "var(--radius)",
                      background: "var(--color-surface-3)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      textDecoration: "none",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--color-secondary)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "var(--color-surface-3)";
                      e.currentTarget.style.color =
                        "var(--color-text-secondary)";
                    }}
                  >
                    <Phone size={16} /> {phone}
                  </a>
                )}

                {/* Status notice for sold */}
                {isSold && (
                  <div
                    style={{
                      background: "#FEE2E2",
                      borderRadius: "var(--radius)",
                      padding: "0.75rem 1rem",
                      marginTop: "0.625rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#991B1B",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      This property has been sold. Contact us for similar
                      available listings.
                    </p>
                  </div>
                )}
              </div>

              {/* Enquiry form card */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: "var(--color-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Send an Enquiry
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "1.25rem",
                  }}
                >
                  We'll get back to you within 24 hours.
                </p>
                <EnquiryForm land={land} settings={settings} />
              </div>

              {/* Trust badges */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  padding: "1.25rem",
                }}
              >
                {[
                  { icon: Shield, text: "Verified Title Documents" },
                  { icon: CheckCircle2, text: "No Hidden Charges" },
                  { icon: Home, text: "Site Inspection Available" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <Icon
                      size={16}
                      style={{ color: "var(--color-primary)", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {/* ── Related Listings ── */}
          {related.length > 0 && (
            <div style={{ marginTop: "4rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "1.375rem",
                    color: "var(--color-secondary)",
                  }}
                >
                  Similar Land Listings
                </h2>
                <Link
                  href={`/lands?state=${encodeURIComponent(state || "")}`}
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  View all in {state} →
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                {related.map((l) => (
                  <PropertyCard key={l._id} land={l} whatsapp={whatsapp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
