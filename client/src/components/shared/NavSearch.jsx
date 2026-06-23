"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Home, Loader2 } from "lucide-react";
import { searchApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { API_URL } from "@/config/site";

// ── Tiny image helper (same pattern used across the codebase) ─────
function getThumb(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}/uploads/${path.replace(/^uploads\//, "")}`;
}

// ── Debounce hook ─────────────────────────────────────────────────
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NavSearch() {
  const router = useRouter();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false); // search bar visible
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // null = no query yet
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  // ── Fetch results when debounced query changes ────────────────
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchApi
      .search(debouncedQuery.trim())
      .then((res) => {
        if (!cancelled) setResults(res?.data || { lands: [], houses: [] });
      })
      .catch(() => {
        if (!cancelled) setResults({ lands: [], houses: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // ── Close dropdown on outside click ──────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Close search bar + clear on Escape ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (query) {
          setQuery("");
          setResults(null);
        } else {
          setOpen(false);
          setFocused(false);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [query]);

  // ── Full-page search on Enter ─────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      router.push(`/lands?location=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setFocused(false);
      setQuery("");
      setResults(null);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setOpen(false);
    setFocused(false);
    setQuery("");
    setResults(null);
  };

  // ── Open the search bar and focus the input ───────────────────
  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const totalResults = results
    ? (results.lands?.length ?? 0) + (results.houses?.length ?? 0)
    : 0;

  const showDropdown =
    focused && query.trim().length >= 2 && (loading || results !== null);

  // ── Collapsed state: just an icon button ─────────────────────
  if (!open) {
    return (
      <button
        onClick={handleOpen}
        aria-label="Search properties"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "var(--radius)",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
          transition: "all 150ms",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.14)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
        }}
      >
        <Search size={16} />
      </button>
    );
  }

  // ── Expanded state: input + dropdown ─────────────────────────
  return (
    <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }}>
      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "260px",
          background: "rgba(255,255,255,0.1)",
          border: `1px solid ${focused ? "var(--color-primary)" : "rgba(255,255,255,0.18)"}`,
          borderRadius: "var(--radius)",
          overflow: "hidden",
          transition: "border-color 150ms, width 250ms",
        }}
      >
        <Search
          size={14}
          style={{
            flexShrink: 0,
            marginLeft: "0.625rem",
            color: focused ? "var(--color-primary)" : "rgba(255,255,255,0.45)",
            transition: "color 150ms",
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search lands, houses…"
          style={{
            flex: 1,
            padding: "0.5rem 0.5rem",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "0.875rem",
            fontFamily: "var(--font-body)",
          }}
        />
        {/* Loading spinner or clear button */}
        {loading ? (
          <Loader2
            size={14}
            style={{
              flexShrink: 0,
              marginRight: "0.625rem",
              color: "var(--color-primary)",
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : query ? (
          <button
            onClick={handleClear}
            style={{
              flexShrink: 0,
              marginRight: "0.375rem",
              padding: "0.25rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        ) : (
          /* Close search bar when empty */
          <button
            onClick={() => {
              setOpen(false);
              setFocused(false);
            }}
            style={{
              flexShrink: 0,
              marginRight: "0.375rem",
              padding: "0.25rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "360px",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-xl)",
            overflow: "hidden",
            zIndex: 200,
          }}
        >
          {/* Loading state */}
          {loading && (
            <div
              style={{
                padding: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
              }}
            >
              <Loader2
                size={15}
                style={{
                  animation: "spin 0.8s linear infinite",
                  color: "var(--color-primary)",
                  flexShrink: 0,
                }}
              />
              Searching…
            </div>
          )}

          {/* Results */}
          {!loading && results && (
            <>
              {/* Lands section */}
              {results.lands?.length > 0 && (
                <section>
                  <div
                    style={{
                      padding: "0.625rem 1rem 0.375rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-heading)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-text-muted)",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    Land Listings
                  </div>
                  {results.lands.map((land) => (
                    <a
                      key={land._id || land.slug}
                      href={`/lands/${land.slug}`}
                      onClick={handleResultClick}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        textDecoration: "none",
                        borderBottom: "1px solid var(--color-border)",
                        transition: "background 150ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--color-surface-2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: "44px",
                          height: "38px",
                          borderRadius: "var(--radius-sm)",
                          background:
                            "linear-gradient(135deg, #0f172a, #1e293b)",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {getThumb(land.feature_image) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getThumb(land.feature_image)}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            color: "var(--color-secondary)",
                            marginBottom: "0.2rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {land.estate_name}
                        </p>
                        <p
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          <MapPin size={10} style={{ flexShrink: 0 }} />
                          {[land.location, land.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                      {/* Price */}
                      {land.price && (
                        <span
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700,
                            fontSize: "0.8125rem",
                            color: "var(--color-primary)",
                            flexShrink: 0,
                          }}
                        >
                          {formatPrice(land.price, true)}
                        </span>
                      )}
                    </a>
                  ))}
                </section>
              )}

              {/* Houses section */}
              {results.houses?.length > 0 && (
                <section>
                  <div
                    style={{
                      padding: "0.625rem 1rem 0.375rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-heading)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-text-muted)",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    House Listings
                  </div>
                  {results.houses.map((house) => (
                    <a
                      key={house._id || house.slug}
                      href={`/houses/${house.slug}`}
                      onClick={handleResultClick}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        textDecoration: "none",
                        borderBottom: "1px solid var(--color-border)",
                        transition: "background 150ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--color-surface-2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: "44px",
                          height: "38px",
                          borderRadius: "var(--radius-sm)",
                          background:
                            "linear-gradient(135deg, #0f172a, #1e293b)",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {getThumb(house.feature_image) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getThumb(house.feature_image)}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            color: "var(--color-secondary)",
                            marginBottom: "0.2rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {house.title}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            <MapPin size={10} style={{ flexShrink: 0 }} />
                            {[house.location, house.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                          {house.bedrooms != null && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.2rem",
                              }}
                            >
                              <Home size={10} style={{ flexShrink: 0 }} />
                              {house.bedrooms === 0
                                ? "Self Con"
                                : `${house.bedrooms} bed`}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Price */}
                      {house.price && house.price_label !== "on_request" && (
                        <span
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700,
                            fontSize: "0.8125rem",
                            color: "var(--color-primary)",
                            flexShrink: 0,
                          }}
                        >
                          {formatPrice(house.price, true)}
                        </span>
                      )}
                    </a>
                  ))}
                </section>
              )}

              {/* Empty state */}
              {totalResults === 0 && (
                <div
                  style={{
                    padding: "1.5rem 1rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "var(--color-text)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Try a different location, estate name, or state.
                  </p>
                </div>
              )}

              {/* "View all" footer — only shown when there are results */}
              {totalResults > 0 && (
                <a
                  href={`/lands?location=${encodeURIComponent(query.trim())}`}
                  onClick={handleResultClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.75rem",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    background: "var(--color-surface-2)",
                    borderTop: "1px solid var(--color-border)",
                    transition: "background 150ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--color-surface-3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "var(--color-surface-2)")
                  }
                >
                  View all results for &ldquo;{query}&rdquo; →
                </a>
              )}
            </>
          )}
        </div>
      )}

      {/* Spinner keyframe — needed since Tailwind animate-spin isn't available inline */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
