"use client";
import Image from "next/image";

import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import { SITE_CONFIG } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/utils";
import { API_URL } from "@/config/site";
import {
  MapPin,
  Phone,
  Mail,
  Users,
  Target,
  Eye,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}/uploads/${path.replace(/^uploads\//, "")}`;
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({ children, bg = "var(--color-surface-2)", style = {} }) {
  return (
    <section className="section-pad" style={{ background: bg, ...style }}>
      <div className="container-site">{children}</div>
    </section>
  );
}

// ── Section label + heading ───────────────────────────────────────
function SectionTitle({
  label,
  title,
  subtitle,
  light = false,
  center = false,
}) {
  return (
    <div
      style={{ textAlign: center ? "center" : "left", marginBottom: "3rem" }}
    >
      {label && (
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
              width: "1.5rem",
              height: "2px",
              background: "var(--color-primary)",
              borderRadius: "2px",
            }}
          />
          {label}
        </p>
      )}
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          color: light ? "white" : "var(--color-secondary)",
          marginBottom: subtitle ? "0.875rem" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: light
              ? "rgba(255,255,255,0.6)"
              : "var(--color-text-secondary)",
            maxWidth: center ? "600px" : "100%",
            margin: center ? "0 auto" : 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Team member card ──────────────────────────────────────────────
function TeamCard({ member }) {
  const photo = imgUrl(member.photo);
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        transition: "transform 250ms, box-shadow 250ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "var(--shadow-xl)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Photo */}
      <div
        style={{
          height: "220px",
          background: "linear-gradient(135deg, #0F172A, #1E293B)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {photo ? (
          <Image
            src={photo}
            alt={member.name}
            fill
            sizes="(max-width:640px) 50vw, 220px"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--color-primary), #E85555)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "2rem",
                  color: "white",
                }}
              >
                {member.name?.charAt(0) || "?"}
              </span>
            </div>
          </div>
        )}
        {/* Dot overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "1.25rem" }}>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-secondary)",
            margin: "0 0 0.25rem",
          }}
        >
          {member.name}
        </h3>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-primary)",
            fontWeight: 600,
            marginBottom: "0.625rem",
          }}
        >
          {member.role}
        </p>
        {member.bio && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: "0.875rem",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {member.bio}
          </p>
        )}
        {/* Social links */}
        {(member.linkedin || member.twitter || member.email) && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "1.875rem",
                  height: "1.875rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#0A66C2";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-2)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <Linkedin size={14} />
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "1.875rem",
                  height: "1.875rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#000";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-2)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <Twitter size={14} />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                style={{
                  width: "1.875rem",
                  height: "1.875rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-primary)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-2)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <Mail size={14} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Value card ────────────────────────────────────────────────────
function ValueCard({ value, index }) {
  const icons = [Target, Eye, Award, CheckCircle, Star, Users];
  const Icon = icons[index % icons.length];
  const colors = [
    "#FF6B6B",
    "#38BDF8",
    "#F59E0B",
    "#22C55E",
    "#A78BFA",
    "#FB923C",
  ];
  const color = colors[index % colors.length];
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        transition: "background 200ms, border-color 200ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = `${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "0.625rem",
          background: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "1rem",
          color: "white",
          marginBottom: "0.5rem",
        }}
      >
        {value.title}
      </h3>
      <p
        style={{
          fontSize: "0.875rem",
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.65,
        }}
      >
        {value.description}
      </p>
    </div>
  );
}

// ── Stat badge ────────────────────────────────────────────────────
function StatBadge({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 900,
          fontSize: "clamp(2rem, 4vw, 3rem)",
          color: "var(--color-primary)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "0.875rem",
          color: "rgba(255,255,255,0.5)",
          marginTop: "0.375rem",
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function AboutClient({ about, settings }) {
  const siteName = settings?.site_name || SITE_CONFIG.name;
  const whatsapp = settings?.whatsapp || SITE_CONFIG.whatsapp;

  // Fallback defaults for each section
  const hero = {
    headline: about.headline || `About ${siteName}`,
    subheadline:
      about.subheadline || "Nigeria's most trusted real estate platform",
  };

  const story = {
    title: about.story_title || "Our Story",
    body:
      about.story_body ||
      `${siteName} was founded with a simple mission: to make property ownership accessible, transparent, and stress-free for every Nigerian. We've grown into a trusted marketplace connecting buyers with verified land and home listings across the country.`,
    founded: about.founded || "",
    image: about.story_image || null,
  };

  const mission =
    about.mission ||
    "To empower Nigerians to own land and property through transparent, verified, and accessible real estate listings.";
  const vision =
    about.vision ||
    "To become the most trusted real estate platform in West Africa, building generational wealth one property at a time.";

  const stats = about.stats?.length
    ? about.stats
    : [
        { value: "500+", label: "Properties Listed" },
        { value: "2,000+", label: "Happy Clients" },
        { value: "15+", label: "States Covered" },
        { value: "5+", label: "Years Experience" },
      ];

  const values = about.values?.length
    ? about.values
    : [
        {
          title: "Transparency",
          description:
            "Every listing is verified. No hidden fees, no surprises. What you see is what you get.",
        },
        {
          title: "Trust",
          description:
            "We've earned the confidence of thousands of buyers across Nigeria through consistent honesty.",
        },
        {
          title: "Excellence",
          description:
            "From listing quality to customer service, we hold ourselves to the highest standard.",
        },
        {
          title: "Accessibility",
          description:
            "Property ownership should be within reach for every Nigerian. We make it simpler.",
        },
      ];

  const team = about.team?.length ? about.team : [];

  const whyUs = about.why_us?.length
    ? about.why_us
    : [
        {
          title: "Verified Listings",
          description:
            "Every property is physically inspected and documents verified before listing.",
        },
        {
          title: "Legal Support",
          description:
            "We guide you through documentation, title transfers, and all legal processes.",
        },
        {
          title: "Flexible Payment",
          description:
            "Installment plans available on select properties to make buying easier.",
        },
        {
          title: "After-Sales Service",
          description:
            "Our relationship doesn't end at purchase. We support you through development.",
        },
        {
          title: "Nationwide Coverage",
          description:
            "From Lagos to Abuja, Port Harcourt to Asaba — we cover Nigeria's key markets.",
        },
        {
          title: "Expert Guidance",
          description:
            "Our team of property professionals are available to advise you every step of the way.",
        },
      ];

  const phone = settings?.phone || SITE_CONFIG.phone;
  const email = settings?.email || SITE_CONFIG.email;
  const address = settings?.address || SITE_CONFIG.address;

  const storyImage = imgUrl(story.image);

  return (
    <>
      {/* ── Hero ── */}
      <PageHero
        title={hero.headline}
        subtitle={hero.subheadline}
        breadcrumbs={[{ label: "About Us" }]}
      />

      {/* ── Stats bar ── */}
      <div
        style={{
          background: "var(--color-secondary)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="container-site">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              padding: "2.5rem 0",
            }}
          >
            {stats.map((s) => (
              <StatBadge key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Story ── */}
      <Section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: storyImage ? "1fr 1fr" : "1fr",
            gap: "4rem",
            alignItems: "center",
            maxWidth: storyImage ? "100%" : "720px",
            margin: "0 auto",
          }}
        >
          <div>
            <SectionTitle label="Our Story" title={story.title} />
            <div
              style={{
                fontSize: "1rem",
                lineHeight: 1.85,
                color: "var(--color-text-secondary)",
              }}
            >
              {story.body
                .split("\n")
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} style={{ marginBottom: "1.25em" }}>
                    {para}
                  </p>
                ))}
            </div>
            {story.founded && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  marginTop: "1rem",
                  padding: "0.625rem 1.25rem",
                  background: "var(--color-primary-muted)",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid rgba(255,107,107,0.2)",
                }}
              >
                <Award size={15} style={{ color: "var(--color-primary)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "var(--color-primary)",
                  }}
                >
                  Founded {story.founded}
                </span>
              </div>
            )}
          </div>

          {storyImage && (
            <div
              style={{
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                position: "relative",
                minHeight: "400px",
                background: "linear-gradient(135deg, #0F172A, #1E293B)",
              }}
            >
              <Image
                src={storyImage}
                alt="Our Story"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                style={{
                  objectFit: "cover",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.05,
                  backgroundImage:
                    "radial-gradient(white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
          )}
        </div>
      </Section>

      {/* ── Mission & Vision ── */}
      <Section bg="var(--color-secondary)">
        <SectionTitle
          label="Our Purpose"
          title="Mission & Vision"
          center
          light
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {[
            { icon: Target, label: "Mission", text: mission, color: "#FF6B6B" },
            { icon: Eye, label: "Vision", text: vision, color: "#38BDF8" },
          ].map(({ icon: Icon, label, text, color }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "var(--radius-xl)",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "0.875rem",
                  background: `${color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "1.125rem",
                  color: "white",
                  marginBottom: "0.875rem",
                }}
              >
                Our {label}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Core Values ── */}
      {values.length > 0 && (
        <Section bg="var(--color-secondary)" style={{ paddingTop: 0 }}>
          <SectionTitle
            label="What We Stand For"
            title="Our Core Values"
            center
            light
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {values.map((v, i) => (
              <ValueCard key={i} value={v} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Why Choose Us ── */}
      <Section>
        <SectionTitle
          label="Why Us"
          title="Why Choose Us"
          subtitle="What sets us apart in Nigeria's competitive real estate market"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {whyUs.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1.25rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                transition: "border-color 200ms, box-shadow 200ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-primary-light)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "50%",
                  background: "var(--color-primary-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircle
                  size={16}
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    color: "var(--color-secondary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.8375rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Team ── */}
      {team.length > 0 && (
        <Section bg="var(--color-surface-2)">
          <SectionTitle
            label="The People"
            title="Meet Our Team"
            subtitle="The dedicated professionals behind every successful property transaction"
            center
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {team.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
        </Section>
      )}

      {/* ── CTA ── */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 100%)",
          padding: "5rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage: "radial-gradient(white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 65%)",
          }}
        />
        <div
          className="container-site"
          style={{ position: "relative", textAlign: "center" }}
        >
          <p
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            Ready to Get Started?
          </p>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              color: "white",
              letterSpacing: "-0.03em",
              marginBottom: "1.25rem",
            }}
          >
            Let&apos;s Find Your Perfect Property
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "1rem",
              maxWidth: "520px",
              margin: "0 auto 2.5rem",
            }}
          >
            Browse our verified listings or talk to one of our property experts
            today.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/lands"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 2rem",
                borderRadius: "var(--radius)",
                background: "var(--color-primary)",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                textDecoration: "none",
                boxShadow: "var(--shadow-coral)",
                transition: "opacity 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Browse Listings <ArrowRight size={16} />
            </Link>
            {whatsapp && (
              <a
                href={buildWhatsAppLink(
                  whatsapp,
                  "Hello! I'd like to speak with a property expert.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.875rem 2rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Talk to an Expert
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
