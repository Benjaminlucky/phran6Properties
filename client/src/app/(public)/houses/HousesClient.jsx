"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
  BedDouble,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import HouseCard from "@/components/public/HouseCard";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { housesApi } from "@/lib/api";
import { NIGERIAN_STATES, HOUSE_CATEGORIES } from "@/config/site";

const BEDROOM_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Self-Con", value: "0" },
  { label: "1 Bedroom", value: "1" },
  { label: "2 Bedrooms", value: "2" },
  { label: "3 Bedrooms", value: "3" },
  { label: "4 Bedrooms", value: "4" },
  { label: "5+ Bedrooms", value: "5" },
];

const PRICE_OPTIONS = [
  { label: "Any Price", value: "" },
  { label: "Under ₦50M", value: "50000000" },
  { label: "Under ₦100M", value: "100000000" },
  { label: "Under ₦200M", value: "200000000" },
  { label: "Under ₦500M", value: "500000000" },
  { label: "Above ₦500M", value: "500000001" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Available", value: "available" },
  { label: "Ready to Move", value: "ready_to_move" },
  { label: "Off Plan", value: "off_plan" },
  { label: "For Rent", value: "rented" },
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

function FilterRadio({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(active ? "" : opt.value)}
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
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BedroomToggle({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {BEDROOM_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(active ? "" : opt.value)}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "var(--radius)",
              border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
              background: active
                ? "var(--color-primary)"
                : "var(--color-surface)",
              color: active ? "white" : "var(--color-text-secondary)",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function HousesClient({
  initialHouses,
  initialPage,
  totalPages: initTotalPages,
  totalCount: initTotal,
  initialFilters,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [houses, setHouses] = useState(initialHouses);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initTotalPages);
  const [totalCount, setTotalCount] = useState(initTotal);
  const [viewMode, setViewMode] = useState("grid");

  const [filters, setFilters] = useState({
    state: initialFilters.state || "",
    location: initialFilters.location || "",
    status: initialFilters.status || "",
    category: initialFilters.category || "",
    bedrooms: initialFilters.bedrooms || "",
    maxPrice: initialFilters.maxPrice || "",
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchHouses = useCallback(
    async (newFilters, page = 1) => {
      setLoading(true);
      try {
        const res = await housesApi.getAll({ ...newFilters, page });
        setHouses(res?.data || []);
        setTotalPages(res?.totalPages || 1);
        setTotalCount(res?.total || 0);
        setCurrentPage(page);
        const params = new URLSearchParams();
        Object.entries({ ...newFilters, page: String(page) }).forEach(
          ([k, v]) => {
            if (v) params.set(k, v);
          },
        );
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } catch {
        setHouses([]);
      } finally {
        setLoading(false);
      }
    },
    [pathname, router],
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchHouses(newFilters, 1);
  };

  const clearFilters = () => {
    const empty = {
      state: "",
      location: "",
      status: "",
      category: "",
      bedrooms: "",
      maxPrice: "",
    };
    setFilters(empty);
    fetchHouses(empty, 1);
  };

  const sidebarContent = (
    <div>
      {/* Location search */}
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
            placeholder="Search location..."
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

      <FilterSection label="Bedrooms">
        <BedroomToggle
          value={filters.bedrooms}
          onChange={(v) => handleFilterChange("bedrooms", v)}
        />
      </FilterSection>

      <FilterSection label="Property Type">
        <FilterRadio
          options={[
            { label: "All Types", value: "" },
            ...HOUSE_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
          ]}
          value={filters.category}
          onChange={(v) => handleFilterChange("category", v)}
        />
      </FilterSection>

      <FilterSection label="Status">
        <FilterRadio
          options={STATUS_OPTIONS}
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

      <FilterSection label="State" defaultOpen={false}>
        <FilterRadio
          options={[
            { label: "All States", value: "" },
            ...NIGERIAN_STATES.slice(0, 10).map((s) => ({ label: s, value: s })),
          ]}
          value={filters.state}
          onChange={(v) => handleFilterChange("state", v)}
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
        title="House Listings"
        subtitle="Find your perfect home across Nigeria's most desirable addresses."
        breadcrumbs={[{ label: "Houses" }]}
      >
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[
            "Apartments",
            "Duplexes",
            "Bungalows",
            "Penthouses",
            "For Rent",
          ].map((chip, i) => (
            <span
              key={chip}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.3rem 0.875rem",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-heading)",
                background:
                  i === 0 ? "var(--color-primary)" : "rgba(255,255,255,0.08)",
                color: i === 0 ? "white" : "rgba(255,255,255,0.6)",
                border: `1px solid ${i === 0 ? "var(--color-primary)" : "rgba(255,255,255,0.15)"}`,
              }}
            >
              {chip}
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
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {sidebarContent}
            </aside>

            {/* ── MAIN ── */}
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
                    {houses.length}
                  </strong>{" "}
                  of{" "}
                  <strong style={{ color: "var(--color-secondary)" }}>
                    {totalCount}
                  </strong>{" "}
                  properties
                  {filters.category && (
                    <>
                      {" "}
                      ·{" "}
                      <span
                        style={{
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {filters.category}
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

              {loading ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
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
                      <div className="skeleton" style={{ height: "220px" }} />
                      <div style={{ padding: "1rem" }}>
                        <div
                          className="skeleton"
                          style={{
                            height: "1rem",
                            marginBottom: "0.5rem",
                            width: "75%",
                          }}
                        />
                        <div
                          className="skeleton"
                          style={{ height: "0.75rem", width: "55%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : houses.length === 0 ? (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <EmptyState
                    title="No properties found"
                    message="Adjust your filters to find available properties."
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
                  {houses.map((house) => (
                    <HouseCard
                      key={house._id || house.id || house.slug}
                      house={house}
                    />
                  ))}
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  fetchHouses(filters, p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
