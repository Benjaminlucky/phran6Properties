"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import Logo from "@/components/shared/Logo";
import NavSearch from "@/components/shared/NavSearch";
import { NAV_LINKS, SITE_CONFIG } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/utils";

export default function Navbar({ settings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const phone = settings?.phone || SITE_CONFIG.phone;
  const whatsapp = settings?.whatsapp || SITE_CONFIG.whatsapp;

  // Nav links from DB settings (admin-managed) or static fallback
  const navLinks = (() => {
    try {
      const parsed = JSON.parse(settings?.nav_links || "");
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* use fallback */
    }
    return NAV_LINKS;
  })();

  // ── Scroll detection ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close mobile menu on route change ────────────────────────
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(28, 28, 46, 0.97)"
          : "var(--color-secondary)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.3)" : "none",
        borderBottom: scrolled ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-site">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* ── Logo ── */}
          <Logo settings={settings} />

          {/* ── Desktop Nav Links ── */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: isActive(link.href)
                      ? "var(--color-primary)"
                      : "rgba(255,255,255,0.75)",
                    background: isActive(link.href)
                      ? "rgba(16,185,129,0.1)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Desktop right-side actions ── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <NavSearch />

            {/* Phone */}
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
            >
              <Phone size={14} />
              <span style={{ fontFamily: "var(--font-heading)" }}>{phone}</span>
            </a>

            {/* WhatsApp CTA */}
            <a
              href={buildWhatsAppLink(
                whatsapp,
                "Hello! I'd like to enquire about a property.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2 px-4"
            >
              Enquire Now
            </a>
          </div>

          {/* ── Mobile: search icon + hamburger ── */}
          <div className="md:hidden flex items-center gap-2">
            <NavSearch />
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: "white" }}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Menu ── */}
      {isOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: "var(--color-secondary-dark)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="container-site py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: isActive(link.href)
                    ? "var(--color-primary)"
                    : "rgba(255,255,255,0.75)",
                  background: isActive(link.href)
                    ? "rgba(16,185,129,0.1)"
                    : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="mt-4 pt-4 flex flex-col gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 px-4 py-2 text-sm"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                <Phone size={14} />
                {phone}
              </a>
              <a
                href={buildWhatsAppLink(
                  whatsapp,
                  "Hello! I'd like to enquire about a property.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm text-center justify-center"
              >
                Enquire Now
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
