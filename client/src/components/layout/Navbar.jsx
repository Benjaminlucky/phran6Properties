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
        background: "var(--color-surface, #ffffff)",
        boxShadow: scrolled ? "0 2px 20px rgba(15,31,32,0.08)" : "none",
        borderBottom: scrolled
          ? "none"
          : "1px solid var(--color-border, #e2e8e0)",
      }}
    >
      <div className="container-site">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* ── Logo ── */}
          <Logo settings={settings} textColor="var(--color-secondary)" />

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
                      ? "var(--color-primary-dark, #1b2f31)"
                      : "var(--color-text-secondary, #3d5a5c)",
                    background: isActive(link.href)
                      ? "var(--color-primary-muted, #e8ffd6)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color =
                        "var(--color-secondary, #1b2f31)";
                      e.currentTarget.style.background =
                        "var(--color-surface-2, #f4f9f4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color =
                        "var(--color-text-secondary, #3d5a5c)";
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
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Search */}
            <NavSearch />

            {/* Phone — hidden below lg so the search + nav links + CTA don't
                crowd each other on tablet-width screens */}
            <a
              href={`tel:${phone}`}
              className="hidden lg:flex items-center gap-2 text-sm transition-colors duration-200"
              style={{ color: "var(--color-text-secondary, #3d5a5c)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-secondary, #1b2f31)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  "var(--color-text-secondary, #3d5a5c)")
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
              style={{ color: "var(--color-secondary, #1b2f31)" }}
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
            background: "var(--color-surface, #ffffff)",
            borderColor: "var(--color-border, #e2e8e0)",
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
                    ? "var(--color-primary-dark, #1b2f31)"
                    : "var(--color-text-secondary, #3d5a5c)",
                  background: isActive(link.href)
                    ? "var(--color-primary-muted, #e8ffd6)"
                    : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="mt-4 pt-4 flex flex-col gap-3"
              style={{ borderTop: "1px solid var(--color-border, #e2e8e0)" }}
            >
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 px-4 py-2 text-sm"
                style={{ color: "var(--color-text-secondary, #3d5a5c)" }}
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
