"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import PropertyCard from "@/components/public/PropertyCard";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { landsApi } from "@/lib/api";
import {
  NIGERIAN_STATES,
  POPULAR_LOCATIONS,
  LAND_TITLES,
  PROPERTY_STATUS,
} from "@/config/site";

const PRICE_OPTIONS = [
  { label: "Any Price", value: "" },
  { label: "Under ₦5M", value: "5000000" },
  { label: "Under ₦20M", value: "20000000" },
  { label: "Under ₦50M", value: "50000000" },
  { label: "Under ₦100M", value: "100000000" },
  { label: "Under ₦500M", value: "500000000" },
];

const SIZE_OPTIONS = [
  { label: "Any Size", value: "" },
  { label: "Under 300 SQM", value: "300" },
  { label: "300–500 SQM", value: "500" },
  { label: "500–1000 SQM", value: "1000" },
  { label: "Above 1000 SQM", value: "1000+" },
];

function FilterSection({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-border)",
        paddingBottom: "1.25rem",
        marginBottom: "1.25rem",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginBottom: open ? "0.875rem" : 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "0.8125rem",
            color: "var(--color-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: "var(--color-text-muted)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 200ms",
          }}
        />
      </button>
      {open && children}
    </div>
  );
}

function FilterRadio({
  options,
  value,
  onChange,
  nameKey = "label",
  valueKey = "value",
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt[valueKey];
        const label = typeof opt === "string" ? opt : opt[nameKey];
        const active = value === val;
        return (
          <button
            key={val}
            onClick={() => onChange(active ? "" : val)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem 0",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: "1rem",
                height: "1rem",
                borderRadius: "50%",
                border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border-dark)"}`,
                background: active ? "var(--color-primary)" : "transparent",
                flexShrink: 0,
                transition: "all 150ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {active && (
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "white",
                  }}
                />
              )}
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                color: active
                  ? "var(--color-secondary)"
                  : "var(--color-text-secondary)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function LandsClient({
  initialLands,
  initialPage,
  totalPages: initTotalPages,
  totalCount: initTotal,
  initialFilters,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [lands, setLands] = useState(initialLands);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initTotalPages);
  const [totalCount, setTotalCount] = useState(initTotal);
  const [viewMode, setViewMode] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    state: initialFilters.state || "",
    location: initialFilters.location || "",
    status: initialFilters.status || "",
    maxPrice: initialFilters.maxPrice || "",
    title: initialFilters.title || "",
    size: initialFilters.size || "",
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const fetchLands = useCallback(
    async (newFilters, page = 1) => {
      setLoading(true);
      try {
        const res = await landsApi.getAll({ ...newFilters, page });
        setLands(res?.data || []);
        setTotalPages(res?.totalPages || 1);
        setTotalCount(res?.total || 0);
        setCurrentPage(page);
        // Update URL
        const params = new URLSearchParams();
        Object.entries({ ...newFilters, page: String(page) }).forEach(
          ([k, v]) => {
            if (v) params.set(k, v);
          },
        );
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } catch {
        setLands([]);
      } finally {
        setLoading(false);
      }
    },
    [pathname, router],
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchLands(newFilters, 1);
  };

  const clearFilters = () => {
    const empty = {
      state: "",
      location: "",
      status: "",
      maxPrice: "",
      title: "",
      size: "",
    };
    setFilters(empty);
    fetchLands(empty, 1);
  };

  const handlePageChange = (page) => {
    fetchLands(filters, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sidebarContent = (
    <div>
      {/* Search by keyword */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search estates..."
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "2.25rem",
              paddingRight: "0.875rem",
              paddingTop: "0.625rem",
              paddingBottom: "0.625rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              fontSize: "0.875rem",
              background: "var(--color-surface-3)",
              color: "var(--color-text)",
              outline: "none",
            }}
          />
        </div>
      </div>

      <FilterSection label="State">
        <FilterRadio
          options={[
            { label: "All States", value: "" },
            ...NIGERIAN_STATES.slice(0, 10).map((s) => ({
              label: s,
              value: s,
            })),
          ]}
          value={filters.state}
          onChange={(v) => handleFilterChange("state", v)}
        />
      </FilterSection>

      <FilterSection label="Status">
        <FilterRadio
          options={[
            { label: "All Status", value: "" },
            { label: "Available", value: "available" },
            { label: "Reserved", value: "reserved" },
            { label: "Coming Soon", value: "coming_soon" },
            { label: "Sold", value: "sold" },
          ]}
          value={filters.status}
          onChange={(v) => handleFilterChange("status", v)}
        />
      </FilterSection>

      <FilterSection label="Max Budget">
        <FilterRadio
          options={PRICE_OPTIONS}
          value={filters.maxPrice}
          onChange={(v) => handleFilterChange("maxPrice", v)}
        />
      </FilterSection>

      <FilterSection label="Title Type">
        <FilterRadio
          options={[
            { label: "All Titles", value: "" },
            ...LAND_TITLES.map((t) => ({ label: t.label, value: t.value })),
          ]}
          value={filters.title}
          onChange={(v) => handleFilterChange("title", v)}
        />
      </FilterSection>

      <FilterSection label="Plot Size" defaultOpen={false}>
        <FilterRadio
          options={SIZE_OPTIONS}
          value={filters.size}
          onChange={(v) => handleFilterChange("size", v)}
        />
      </FilterSection>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="btn-outline"
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: "0.5rem",
            fontSize: "0.8125rem",
            padding: "0.6rem 1rem",
          }}
        >
          <X size={13} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHero
        title="Land Listings"
        subtitle="Browse our verified land inventory across Nigeria's fastest-growing corridors."
        breadcrumbs={[{ label: "Lands" }]}
      >
        {/* Stats chips */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[
            { label: `${initTotal || "500"}+ Listings`, active: true },
            { label: "C of O Available" },
            { label: "Gov's Consent" },
            { label: "Flexible Payment" },
          ].map((chip) => (
            <span
              key={chip.label}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.3rem 0.875rem",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-heading)",
                background: chip.active
                  ? "var(--color-primary)"
                  : "rgba(255,255,255,0.08)",
                color: chip.active ? "white" : "rgba(255,255,255,0.6)",
                border: `1px solid ${chip.active ? "var(--color-primary)" : "rgba(255,255,255,0.15)"}`,
              }}
            >
              {chip.label}
            </span>
          ))}
        </div>
      </PageHero>

      {/* Mobile filter backdrop */}
      <div
        className={`mobile-filter-backdrop${mobileFiltersOpen ? " open" : ""}`}
        onClick={() => setMobileFiltersOpen(false)}
      />

      {/* Mobile filter drawer */}
      <div className={`mobile-filter-panel${mobileFiltersOpen ? " open" : ""}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <SlidersHorizontal size={15} style={{ color: "var(--color-primary)" }} />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "var(--color-secondary)",
              }}
            >
              Filters
            </span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  width: "1.25rem",
                  height: "1.25rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </div>

      <div
        className="section-pad"
        style={{ background: "var(--color-surface-2)" }}
      >
        <div className="container-site">
          <div className="listings-page-grid">
            {/* ── SIDEBAR (desktop only) ── */}
            <aside
              className="listings-sidebar-desktop"
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                padding: "1.5rem",
                position: "sticky",
                top: "5.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <SlidersHorizontal
                    size={15}
                    style={{ color: "var(--color-primary)" }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "var(--color-secondary)",
                    }}
                  >
                    Filters
                  </span>
                </div>
                {activeFilterCount > 0 && (
                  <span
                    style={{
                      background: "var(--color-primary)",
                      color: "white",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      width: "1.25rem",
                      height: "1.25rem",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {sidebarContent}
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main>
              {/* Mobile filter toggle */}
              <div className="mobile-filter-toggle">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  <SlidersHorizontal size={15} />
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </button>
              </div>

              {/* Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Showing{" "}
                  <strong style={{ color: "var(--color-secondary)" }}>
                    {lands.length}
                  </strong>{" "}
                  of{" "}
                  <strong style={{ color: "var(--color-secondary)" }}>
                    {totalCount}
                  </strong>{" "}
                  land listings
                  {filters.state && (
                    <>
                      {" "}
                      in{" "}
                      <span
                        style={{
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {filters.state}
                      </span>
                    </>
                  )}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {[
                    { mode: "grid", Icon: LayoutGrid },
                    { mode: "list", Icon: List },
                  ].map(({ mode, Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background:
                          viewMode === mode
                            ? "var(--color-secondary)"
                            : "var(--color-surface)",
                        color:
                          viewMode === mode
                            ? "white"
                            : "var(--color-text-muted)",
                        cursor: "pointer",
                        transition: "all 150ms",
                      }}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading state */}
              {loading ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      viewMode === "grid"
                        ? "repeat(auto-fill, minmax(280px, 1fr))"
                        : "1fr",
                    gap: "1.25rem",
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="skeleton" style={{ height: "200px" }} />
                      <div style={{ padding: "1rem" }}>
                        <div
                          className="skeleton"
                          style={{
                            height: "1rem",
                            marginBottom: "0.5rem",
                            width: "70%",
                          }}
                        />
                        <div
                          className="skeleton"
                          style={{ height: "0.75rem", width: "50%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : lands.length === 0 ? (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <EmptyState
                    title="No land listings found"
                    message="Try adjusting your filters or broadening your search criteria."
                    action={
                      <button
                        onClick={clearFilters}
                        className="btn-primary"
                        style={{ fontSize: "0.875rem" }}
                      >
                        Clear Filters
                      </button>
                    }
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      viewMode === "grid"
                        ? "repeat(auto-fill, minmax(280px, 1fr))"
                        : "1fr",
                    gap: "1.25rem",
                  }}
                >
                  {lands.map((land) =>
                    viewMode === "grid" ? (
                      <PropertyCard
                        key={land._id || land.id || land.slug}
                        land={land}
                      />
                    ) : (
                      <PropertyListItem
                        key={land._id || land.id || land.slug}
                        land={land}
                      />
                    ),
                  )}
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

// ── List view item ──
function PropertyListItem({ land }) {
  const {
    slug,
    estate_name,
    location,
    state,
    price,
    size,
    title_type,
    status,
  } = land;
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
  const statusColors = {
    available: { bg: "#DCFCE7", color: "#15803D" },
    sold: { bg: "#FEE2E2", color: "#991B1B" },
    reserved: { bg: "#E0F2FE", color: "#0369A1" },
    coming_soon: { bg: "#FEF3C7", color: "#92400E" },
  };
  const sc = statusColors[status] || statusColors.available;
  import("@/lib/utils").then(() => {});

  return (
    <a
      href={`/lands/${slug}`}
      style={{
        display: "flex",
        gap: "1.25rem",
        alignItems: "center",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        textDecoration: "none",
        transition: "all 200ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-primary-light)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "80px",
          height: "72px",
          borderRadius: "var(--radius)",
          background:
            "linear-gradient(135deg, var(--color-secondary) 0%, #1E2D4A 100%)",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "var(--color-secondary)",
            marginBottom: "0.25rem",
          }}
        >
          {estate_name}
        </h3>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.8125rem",
            marginBottom: "0.5rem",
          }}
        >
          {location}
          {state ? `, ${state}` : ""}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {title_type && (
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-full)",
                background: "var(--color-surface-3)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {titleLabels[title_type]}
            </span>
          )}
          {size && (
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-full)",
                background: "var(--color-surface-3)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {size}
            </span>
          )}
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-full)",
              background: sc.bg,
              color: sc.color,
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {status?.replace("_", " ")}
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "1rem",
            color: "var(--color-primary)",
            marginBottom: "0.5rem",
          }}
        >
          ₦{(price / 1000000).toFixed(1)}M
        </p>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-primary)",
            fontFamily: "var(--font-heading)",
          }}
        >
          View →
        </span>
      </div>
    </a>
  );
}
