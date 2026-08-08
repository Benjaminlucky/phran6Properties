"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/context/useAuth";
import { statsApi } from "@/lib/api";
import Link from "next/link";
import {
  LayoutDashboard,
  MapPin,
  Home,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Eye,
  Plus,
  RefreshCw,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

// recharts is ~100kB of JS that only this one card needs, so it is pulled in
// as its own chunk after hydration rather than shipped in the initial /admin
// bundle. ssr:false because a chart renders nothing meaningful without JS.
// The fallback mirrors EnquiryChart's own `loading` skeleton so the swap is
// visually seamless (the `pulse` keyframes live in this file's <style> tag).
const EnquiryChart = dynamic(() => import("./DashboardChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

function ChartSkeleton() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <TrendingUp size={16} style={{ color: "#FF6B6B" }} />
        <h2
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#0F172A",
            margin: 0,
          }}
        >
          Enquiries — Last 6 Months
        </h2>
      </div>
      <div
        style={{
          height: "200px",
          borderRadius: "0.75rem",
          background: "#F8FAFC",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, href, loading }) {
  const card = (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: "1rem",
        background: "white",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 150ms, transform 150ms",
        cursor: href ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        if (!href) return;
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "0.625rem",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      {loading ? (
        <div
          style={{
            height: "2.5rem",
            borderRadius: "0.5rem",
            background: "#F1F5F9",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ) : (
        <p
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 800,
            fontSize: "2rem",
            color: "#0F172A",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          {value ?? "—"}
        </p>
      )}
    </div>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {card}
    </Link>
  ) : (
    card
  );
}

// ── Enquiry row ───────────────────────────────────────────────────
function EnquiryRow({ enquiry }) {
  const sc = {
    new: { bg: "#DCFCE7", color: "#16A34A" },
    read: { bg: "#E0F2FE", color: "#0369A1" },
    replied: { bg: "#FEF9C3", color: "#92400E" },
    closed: { bg: "#F1F5F9", color: "#64748B" },
  }[enquiry.status] || { bg: "#DCFCE7", color: "#16A34A" };
  const name = [enquiry.first_name, enquiry.last_name]
    .filter(Boolean)
    .join(" ");
  const date = new Date(enquiry.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.875rem 0",
        borderBottom: "1px solid #F8FAFC",
      }}
    >
      <div
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B6B, #0F172A)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 700 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "#0F172A",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </p>
        <p style={{ fontSize: "0.75rem", color: "#94A3B8", margin: 0 }}>
          {enquiry.inquiry_type || "General"} · {enquiry.phone}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            padding: "0.2rem 0.6rem",
            borderRadius: "9999px",
            background: sc.bg,
            color: sc.color,
            textTransform: "uppercase",
          }}
        >
          {enquiry.status}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{date}</span>
      </div>
    </div>
  );
}

// ── Quick action ──────────────────────────────────────────────────
function QuickAction({ label, description, icon: Icon, href, color }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
          borderRadius: "0.875rem",
          border: "1px solid #E2E8F0",
          background: "white",
          transition: "all 150ms",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${color}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.625rem",
            background: `${color}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#0F172A",
              margin: 0,
            }}
          >
            {label}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#94A3B8", margin: 0 }}>
            {description}
          </p>
        </div>
        <ArrowRight
          size={14}
          style={{ color: "#CBD5E1", marginLeft: "auto" }}
        />
      </div>
    </Link>
  );
}

// ── Main dashboard ──────────────────────────────────────────────────
// Stats are fetched client-side: the auth session lives in an httpOnly
// cookie scoped to the API's own domain (cross-origin from this app), so
// the Next.js server can't read it to prefetch this page's data — only
// the browser can, via credentials: "include" on the request to the API.
// initialStats/initialError are accepted for backward compatibility but
// are no longer populated by the server component.
export default function DashboardClient({
  initialStats = null,
  initialError = null,
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(!initialStats);
  const [error, setError] = useState(initialError);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await statsApi.getDashboard();
      setStats(res.data);
    } catch (err) {
      setError(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialStats) fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = stats?.counts || {};
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AdminShell newEnquiries={counts.new_enquiries || 0}>
      <div style={{ padding: "2rem", maxWidth: "1200px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.25rem",
              }}
            >
              <LayoutDashboard size={20} style={{ color: "#FF6B6B" }} />
              <h1
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                Dashboard
              </h1>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: 0 }}>
              {greeting}
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Here&apos;s
              what&apos;s happening.
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.625rem",
              border: "1px solid #E2E8F0",
              background: "white",
              color: "#475569",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />{" "}
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 1.25rem",
              borderRadius: "0.875rem",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              marginBottom: "1.5rem",
            }}
          >
            <AlertCircle
              size={16}
              style={{ color: "#EF4444", flexShrink: 0 }}
            />
            <p style={{ color: "#DC2626", fontSize: "0.875rem", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            label="Land Listings"
            value={counts.lands}
            icon={MapPin}
            color="#FF6B6B"
            href="/admin/lands"
            loading={loading}
          />
          <StatCard
            label="House Listings"
            value={counts.houses}
            icon={Home}
            color="#38BDF8"
            href="/admin/houses"
            loading={loading}
          />
          <StatCard
            label="Blog Posts"
            value={counts.blog_posts}
            icon={BookOpen}
            color="#F59E0B"
            href="/admin/blog"
            loading={loading}
          />
          <StatCard
            label="Total Enquiries"
            value={counts.enquiries}
            icon={MessageSquare}
            color="#22C55E"
            href="/admin/enquiries"
            loading={loading}
          />
          {(counts.new_enquiries > 0 || loading) && (
            <StatCard
              label="New Enquiries"
              value={counts.new_enquiries}
              icon={TrendingUp}
              color="#EF4444"
              href="/admin/enquiries"
              loading={loading}
            />
          )}
        </div>

        {/* Chart — full width */}
        <div
          style={{
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: "1rem",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            marginBottom: "1.5rem",
          }}
        >
          <EnquiryChart data={stats?.monthly_enquiries} loading={loading} />
        </div>

        {/* Recent enquiries + Quick actions */}
        <div
          className="dashboard-split-grid"
          style={{
            display: "grid",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Enquiries */}
          <div
            style={{
              background: "white",
              border: "1px solid #E2E8F0",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <MessageSquare size={16} style={{ color: "#FF6B6B" }} />
                <h2
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  Recent Enquiries
                </h2>
              </div>
              <Link
                href="/admin/enquiries"
                style={{
                  fontSize: "0.8125rem",
                  color: "#FF6B6B",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View all →
              </Link>
            </div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: "0.875rem 0",
                    borderBottom: "1px solid #F8FAFC",
                  }}
                >
                  <div
                    style={{
                      height: "0.875rem",
                      borderRadius: "0.25rem",
                      background: "#F1F5F9",
                      marginBottom: "0.4rem",
                      width: "60%",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      height: "0.75rem",
                      borderRadius: "0.25rem",
                      background: "#F1F5F9",
                      width: "40%",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              ))
            ) : stats?.recent_enquiries?.length ? (
              stats.recent_enquiries.map((e) => (
                <EnquiryRow key={e._id || e.id} enquiry={e} />
              ))
            ) : (
              <p
                style={{
                  color: "#94A3B8",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  padding: "2rem 0",
                  margin: 0,
                }}
              >
                No enquiries yet
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div
            style={{
              background: "white",
              border: "1px solid #E2E8F0",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              <Plus size={16} style={{ color: "#FF6B6B" }} />
              <h2
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                Quick Actions
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              <QuickAction
                label="Add Land Listing"
                description="Create a new plot or estate"
                icon={MapPin}
                href="/admin/lands"
                color="#FF6B6B"
              />
              <QuickAction
                label="Add House Listing"
                description="Add a property for sale/rent"
                icon={Home}
                href="/admin/houses"
                color="#38BDF8"
              />
              <QuickAction
                label="Write Blog Post"
                description="Publish a new article"
                icon={BookOpen}
                href="/admin/blog"
                color="#F59E0B"
              />
              <QuickAction
                label="Manage Team"
                description="Invite or update staff"
                icon={Users}
                href="/admin/settings/team"
                color="#22C55E"
              />
            </div>
          </div>
        </div>

        {/* Top viewed lands */}
        {stats?.top_lands?.length > 0 && (
          <div
            style={{
              background: "white",
              border: "1px solid #E2E8F0",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              <Eye size={16} style={{ color: "#FF6B6B" }} />
              <h2
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                Top Viewed Lands
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {stats.top_lands.map((land, i) => (
                <div
                  key={land._id || land.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.625rem 0",
                    borderBottom:
                      i < stats.top_lands.length - 1
                        ? "1px solid #F8FAFC"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      borderRadius: "50%",
                      background: i === 0 ? "#FF6B6B" : "#F1F5F9",
                      color: i === 0 ? "white" : "#94A3B8",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {i + 1}
                  </span>
                  <p
                    style={{
                      flex: 1,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    {land.estate_name}
                  </p>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.8rem",
                      color: "#94A3B8",
                    }}
                  >
                    <Eye size={12} /> {(land.views_count || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        /* Enquiries + Quick Actions: fixed 340px side column collapses to a
           single stacked column once it can no longer sit comfortably next
           to the main content (roughly tablet width and below). */
        .dashboard-split-grid { grid-template-columns: 1fr 340px; }
        @media (max-width: 900px) {
          .dashboard-split-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </AdminShell>
  );
}
