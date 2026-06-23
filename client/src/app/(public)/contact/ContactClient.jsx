"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import PageHero from "@/components/shared/PageHero";
import { enquiriesApi } from "@/lib/api";
import { SITE_CONFIG } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/utils";

const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "var(--radius)",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-3)",
  color: "var(--color-text)",
  fontSize: "0.9375rem",
  outline: "none",
  transition: "border-color 200ms, background 200ms",
  fontFamily: "var(--font-body)",
};

const INQUIRY_TYPES = [
  "Buy Land",
  "Buy House",
  "Rent Property",
  "Investment Advice",
  "Property Valuation",
  "General Inquiry",
  "Partnership",
  "Other",
];

export default function ContactClient({ settings }) {
  const phone = settings?.phone || SITE_CONFIG.phone || "08053642425";
  const whatsapp = settings?.whatsapp || SITE_CONFIG.whatsapp || "08053642425";
  const email = settings?.email || SITE_CONFIG.email || "";
  const address = settings?.address || SITE_CONFIG.address || "Lagos, Nigeria";

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    inquiry_type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFocus = (e) => {
    e.target.style.borderColor = "var(--color-primary)";
    e.target.style.background = "var(--color-surface)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--color-border)";
    e.target.style.background = "var(--color-surface-3)";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.phone || !form.message) {
      toast.error("Please fill in your name, phone, and message.");
      return;
    }
    setLoading(true);
    try {
      await enquiriesApi.submit({
        ...form,
        listing_type: "general",
        source: "contact_page",
      });
      setSubmitted(true);
      toast.success("Message sent! We'll be in touch shortly.");
    } catch {
      toast.error("Failed to send. Please contact us directly via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      icon: <Phone size={20} />,
      label: "Phone",
      value: phone,
      sub: "Mon – Sat, 8am – 6pm",
      href: `tel:${phone}`,
      color: "#10B981",
    },
    {
      icon: <MessageCircle size={20} />,
      label: "WhatsApp",
      value: "Chat with us",
      sub: "Instant response",
      href: buildWhatsAppLink(
        whatsapp,
        "Hello! I'd like to enquire about a property.",
      ),
      color: "#25D366",
    },
    {
      icon: <Mail size={20} />,
      label: "Email",
      value: email || "Send us a mail",
      sub: "We reply within 24hrs",
      href: `mailto:${email}`,
      color: "var(--color-primary)",
    },
    {
      icon: <MapPin size={20} />,
      label: "Office",
      value: address,
      sub: "Visit us in person",
      href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      color: "#3B82F6",
    },
  ];

  const socials = [
    {
      icon: <Facebook size={16} />,
      href: settings?.social_facebook,
      label: "Facebook",
    },
    {
      icon: <Instagram size={16} />,
      href: settings?.social_instagram,
      label: "Instagram",
    },
    {
      icon: <Twitter size={16} />,
      href: settings?.social_twitter,
      label: "Twitter",
    },
    {
      icon: <Youtube size={16} />,
      href: settings?.social_youtube,
      label: "YouTube",
    },
  ].filter((s) => s.href);

  return (
    <>
      <PageHero
        title="Get In Touch"
        subtitle="Have a question about a property? Ready to buy or invest? Our team is here to help."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <div
        className="section-pad"
        style={{ background: "var(--color-surface-2)" }}
      >
        <div className="container-site">
          {/* ── Contact cards row ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "3.5rem",
            }}
          >
            {contactCards.map((card) => (
              <a
                key={card.label}
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1.25rem",
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.color;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${card.color}20`;
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "var(--radius)",
                    background: `${card.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {card.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "var(--color-secondary)",
                      marginBottom: "0.2rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {card.value}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {card.sub}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* ── Main grid: Form left, Info right ── */}
          <div className="detail-page-grid">
            {/* ── Contact Form ── */}
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
                padding: "2.5rem",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {submitted ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div
                    style={{
                      width: "4rem",
                      height: "4rem",
                      borderRadius: "50%",
                      background: "#DCFCE7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                    }}
                  >
                    <CheckCircle size={28} style={{ color: "#16A34A" }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      color: "var(--color-secondary)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Message Received!
                  </h3>
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      maxWidth: "360px",
                      margin: "0 auto 2rem",
                    }}
                  >
                    Thank you for reaching out. Our team will contact you within
                    24 hours. You can also reach us directly on WhatsApp for
                    faster response.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={buildWhatsAppLink(
                        whatsapp,
                        "Hello! I just filled your contact form.",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <MessageCircle size={15} /> Chat on WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setForm({
                          first_name: "",
                          last_name: "",
                          email: "",
                          phone: "",
                          inquiry_type: "",
                          message: "",
                        });
                        setSubmitted(false);
                      }}
                      className="btn-ghost"
                      style={{ fontSize: "0.875rem" }}
                    >
                      Send Another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "2rem" }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "1.375rem",
                        color: "var(--color-secondary)",
                        marginBottom: "0.5rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Send Us a Message
                    </h2>
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.9375rem",
                      }}
                    >
                      Fill in the form and we'll get back to you as soon as
                      possible.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.25rem",
                    }}
                  >
                    <div className="form-grid-2">
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: "var(--color-text)",
                            marginBottom: "0.375rem",
                          }}
                        >
                          First Name *
                        </label>
                        <input
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          placeholder="John"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: "var(--color-text)",
                            marginBottom: "0.375rem",
                          }}
                        >
                          Last Name
                        </label>
                        <input
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          placeholder="Doe"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: "var(--color-text)",
                            marginBottom: "0.375rem",
                          }}
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          placeholder="john@example.com"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: "var(--color-text)",
                            marginBottom: "0.375rem",
                          }}
                        >
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          placeholder="+234 800 000 0000"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          color: "var(--color-text)",
                          marginBottom: "0.375rem",
                        }}
                      >
                        Inquiry Type
                      </label>
                      <select
                        name="inquiry_type"
                        value={form.inquiry_type}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        <option value="">Select inquiry type</option>
                        {INQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          color: "var(--color-text)",
                          marginBottom: "0.375rem",
                        }}
                      >
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        rows={5}
                        placeholder="Tell us what you're looking for, your budget, preferred location, and any other details..."
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: "120px",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                      style={{
                        alignSelf: "flex-start",
                        opacity: loading ? 0.75 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* ── Right panel ── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Office hours */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    marginBottom: "1.25rem",
                  }}
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
                    }}
                  >
                    <Clock
                      size={14}
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "var(--color-secondary)",
                    }}
                  >
                    Office Hours
                  </h3>
                </div>
                {[
                  { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
                  { day: "Saturday", hours: "9:00 AM – 4:00 PM" },
                  { day: "Sunday", hours: "Closed" },
                ].map(({ day, hours }) => (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.625rem 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {day}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color:
                          hours === "Closed"
                            ? "var(--color-error)"
                            : "var(--color-secondary)",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      {hours}
                    </span>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={buildWhatsAppLink(
                  whatsapp,
                  "Hello! I'd like to enquire about a property.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.5rem",
                  background:
                    "linear-gradient(135deg, #128C7E 0%, #25D366 100%)",
                  borderRadius: "var(--radius-lg)",
                  textDecoration: "none",
                  transition: "transform 200ms, box-shadow 200ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(37,211,102,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MessageCircle size={22} style={{ color: "white" }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      color: "white",
                      fontSize: "0.9375rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Chat on WhatsApp
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.75rem",
                    }}
                  >
                    Get instant replies from our team
                  </p>
                </div>
              </a>

              {/* Social links */}
              {socials.length > 0 && (
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
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "var(--color-secondary)",
                      marginBottom: "1rem",
                    }}
                  >
                    Follow Us
                  </h3>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {socials.map(({ icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-secondary)",
                          transition: "all 150ms",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--color-primary)";
                          e.currentTarget.style.borderColor =
                            "var(--color-primary)";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor =
                            "var(--color-border)";
                          e.currentTarget.style.color =
                            "var(--color-text-secondary)";
                        }}
                      >
                        {icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div
                style={{
                  background: "var(--color-secondary)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    color: "white",
                    marginBottom: "1rem",
                  }}
                >
                  Quick Links
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                  }}
                >
                  {[
                    { label: "Browse Land Listings", href: "/lands" },
                    { label: "Browse House Listings", href: "/houses" },
                    { label: "Read Our Blog", href: "/blog" },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        padding: "0.375rem 0",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        transition: "color 150ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
                      }
                    >
                      {link.label}{" "}
                      <span style={{ fontSize: "0.75rem" }}>→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
