"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { SITE_CONFIG, POPULAR_LOCATIONS, NAV_LINKS } from "@/config/site";

export default function Footer({ settings }) {
  const phone = settings?.phone || SITE_CONFIG.phone;
  const email = settings?.email || SITE_CONFIG.email;
  const address = settings?.address || SITE_CONFIG.address;
  const year = new Date().getFullYear();

  const socials = [
    { icon: Facebook, href: settings?.social_facebook, label: "Facebook" },
    { icon: Instagram, href: settings?.social_instagram, label: "Instagram" },
    { icon: Twitter, href: settings?.social_twitter, label: "Twitter" },
    { icon: Youtube, href: settings?.social_youtube, label: "YouTube" },
    { icon: Linkedin, href: settings?.social_linkedin, label: "LinkedIn" },
  ].filter((s) => s.href);

  const discoverLinks = POPULAR_LOCATIONS.slice(0, 6).map((l) => ({
    label: l.label,
    href: `/lands?location=${encodeURIComponent(l.value)}`,
  }));

  const quickLinks = [
    { label: "Land Listings", href: "/lands" },
    { label: "House Listings", href: "/houses" },
    { label: "Blog & News", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <footer style={{ background: "var(--color-secondary-dark)" }}>
      {/* ── Main Footer ── */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="container-site py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* ── Col 1: Brand ── */}
            <div className="lg:col-span-1">
              <Logo settings={settings} className="mb-4" />
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {settings?.tagline || SITE_CONFIG.tagline}. Your most trusted
                partner for land and property investments across Nigeria.
              </p>

              {/* Social links */}
              {socials.length > 0 && (
                <div className="flex items-center gap-3">
                  {socials.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--color-primary)";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      }}
                    >
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* ── Col 2: Discover ── */}
            <div>
              <h4
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Discover
              </h4>
              <ul className="space-y-3">
                {discoverLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 3: Quick Links ── */}
            <div>
              <h4
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 4: Contact ── */}
            <div>
              <h4
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Contact Us
              </h4>
              <ul className="space-y-4">
                {address && (
                  <li className="flex gap-3">
                    <MapPin
                      size={15}
                      className="shrink-0 mt-0.5"
                      style={{ color: "var(--color-primary)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {address}
                    </span>
                  </li>
                )}
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-3 text-sm transition-colors"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                      }
                    >
                      <Phone
                        size={15}
                        style={{ color: "var(--color-primary)" }}
                      />
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 text-sm transition-colors"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--color-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                      }
                    >
                      <Mail
                        size={15}
                        style={{ color: "var(--color-primary)" }}
                      />
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="container-site py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            © {year} {settings?.site_name || SITE_CONFIG.name}. All rights
            reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            {settings?.footer_credit || "Built with ❤️ for Nigerian Realtors by Mark V Technologies Limited"}
          </p>
        </div>
      </div>
    </footer>
  );
}
