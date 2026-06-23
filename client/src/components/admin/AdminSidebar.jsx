"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Home,
  BookOpen,
  MessageSquare,
  Image,
  Settings,
  LogOut,
  Users,
  Building2,
  ChevronLeft,
  Menu,
  X,
  ExternalLink,
  Star,
  Info,
  LayoutTemplate,
} from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Lands", href: "/admin/lands", icon: MapPin },
  { label: "Houses", href: "/admin/houses", icon: Home },
  { label: "Blog", href: "/admin/blog", icon: BookOpen },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "About Page", href: "/admin/about", icon: Info },
  { label: "Homepage", href: "/admin/homepage", icon: LayoutTemplate },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Team", href: "/admin/settings/team", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ newEnquiries = 0 }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [siteName, setSiteName] = useState("");

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Fetch site name from DB so sidebar brand reflects admin settings
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((json) => {
        const name = json?.data?.settings?.site_name;
        if (name) setSiteName(name);
      })
      .catch(() => {});
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    toast.success("Signed out successfully", { id: "logout-success" });
    logout();
  };

  const sidebarWidth = collapsed ? "70px" : "240px";

  const sidebarContent = (
    <div
      style={{
        width: sidebarWidth,
        minHeight: "100%",
        background:
          "linear-gradient(180deg, var(--color-secondary-dark, #060B14) 0%, var(--color-secondary, #0F172A) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 250ms ease",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: collapsed ? "1.25rem 0" : "1.25rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          minHeight: "65px",
        }}
      >
        {!collapsed && (
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.5rem",
                background: "var(--color-primary, #FF6B6B)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Building2 size={14} style={{ color: "white" }} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  color: "white",
                  lineHeight: 1,
                }}
              >
                {siteName || "Admin Panel"}
              </p>
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Admin
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              background: "var(--color-primary, #FF6B6B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={14} style={{ color: "white" }} />
          </div>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
            width: "1.75rem",
            height: "1.75rem",
            borderRadius: "0.375rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.4)",
            transition: "all 150ms",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={14}
            style={{
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 250ms ease",
            }}
          />
        </button>
      </div>

      {/* ── Nav links ── */}
      <nav
        style={{
          flex: 1,
          padding: "0.75rem 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : "0.75rem",
                padding: collapsed ? "0.75rem" : "0.6875rem 0.875rem",
                borderRadius: "0.625rem",
                justifyContent: collapsed ? "center" : "flex-start",
                textDecoration: "none",
                // Active: solid primary bg with WHITE text — never a colour clash
                background: active
                  ? "var(--color-primary, #FF6B6B)"
                  : "transparent",
                border: `1px solid ${active ? "var(--color-primary, #FF6B6B)" : "transparent"}`,
                color: active ? "white" : "rgba(255,255,255,0.55)",
                transition: "all 150ms ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                }
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.875rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              )}
              {label === "Enquiries" && newEnquiries > 0 && (
                <span
                  style={{
                    marginLeft: collapsed ? 0 : "auto",
                    position: collapsed ? "absolute" : "static",
                    top: collapsed ? "6px" : "auto",
                    right: collapsed ? "6px" : "auto",
                    // On active (primary bg): invert to white bg + primary text
                    background: active
                      ? "white"
                      : "var(--color-primary, #FF6B6B)",
                    color: active ? "var(--color-primary, #FF6B6B)" : "white",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    width: "1.1rem",
                    height: "1.1rem",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {newEnquiries > 9 ? "9+" : newEnquiries}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div
        style={{
          padding: "0.75rem 0.625rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: collapsed ? "0.75rem" : "0.6rem 0.875rem",
            borderRadius: "0.625rem",
            textDecoration: "none",
            color: "rgba(255,255,255,0.3)",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "all 150ms",
            marginBottom: "0.375rem",
          }}
          title={collapsed ? "View site" : undefined}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.3)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ExternalLink size={15} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
              View Site
            </span>
          )}
        </a>

        {!collapsed && user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.625rem 0.875rem",
              marginBottom: "0.375rem",
            }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                background: "var(--color-primary, #FF6B6B)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: "rgba(255,255,255,0.85)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.3)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowLogoutModal(true)}
          title={collapsed ? "Sign out" : undefined}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : "0.75rem",
            padding: collapsed ? "0.75rem" : "0.6875rem 0.875rem",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "0.625rem",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "rgba(255,100,100,0.5)",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color = "#FCA5A5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,100,100,0.5)";
          }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="admin-sidebar-desktop">{sidebarContent}</div>

      {/* Mobile */}
      <div className="admin-sidebar-mobile">
        {/* Hamburger — hidden while sidebar is open so it never stacks on the close button */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            zIndex: 50,
            background: "var(--color-secondary, #0F172A)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.625rem",
            padding: "0.5rem",
            cursor: "pointer",
            color: "white",
            display: mobileOpen ? "none" : "flex",
            alignItems: "center",
          }}
        >
          <Menu size={20} />
        </button>

        {/* Backdrop */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* Slide-in panel */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 50,
            width: sidebarWidth,
            overflowY: "auto",
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 300ms ease",
          }}
        >
          {sidebarContent}
          {/* Close tab — only mounted when open so it never bleeds into viewport */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              style={{
                position: "absolute",
                top: "1rem",
                right: "-2.5rem",
                background: "var(--color-secondary-mid, #2a4547)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderLeft: "none",
                borderRadius: "0 0.5rem 0.5rem 0",
                padding: "0.5rem 0.5rem 0.5rem 0.375rem",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Logout modal */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-secondary, #0F172A)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.875rem",
              }}
            >
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "0.625rem",
                  background: "rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LogOut size={16} style={{ color: "#FCA5A5" }} />
              </div>
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "white",
                  margin: 0,
                }}
              >
                Sign out?
              </p>
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
                margin: "0 0 1.25rem",
              }}
            >
              You&apos;ll be returned to the login page. Any unsaved changes
              will be lost.
            </p>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  borderRadius: "0.625rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  borderRadius: "0.625rem",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  color: "white",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-sidebar-desktop { display: flex; }
        .admin-sidebar-mobile  { display: none; }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none; }
          .admin-sidebar-mobile  { display: block; }
        }
      `}</style>
    </>
  );
}
