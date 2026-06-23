"use client";
import Image from "next/image";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, User } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { blogApi } from "@/lib/api";
import { API_URL } from "@/config/site";

// ── Image URL helper — handles Cloudinary URLs and legacy local paths ──
function getCoverUrl(path) {
  if (!path) return null;
  // Cloudinary or any full URL — return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Legacy local path like "uploads/blog/filename.jpg"
  const clean = path.replace(/^uploads\//, "");
  return `${API_URL}/uploads/${clean}`;
}

const DEFAULT_CATEGORIES = [
  { id: "", name: "All Posts" },
  { id: "market-updates", name: "Market Updates" },
  { id: "investment-tips", name: "Investment Tips" },
  { id: "property-guides", name: "Property Guides" },
  { id: "news", name: "News" },
  { id: "lifestyle", name: "Lifestyle" },
];

// const PLACEHOLDER_POSTS = [
//   {
//     id: 1,
//     slug: "lekki-corridor-2025",
//     title:
//       "Why the Lekki Corridor Remains Nigeria's Hottest Real Estate Zone in 2025",
//     excerpt:
//       "From Free Trade Zone to Phase 1, we break down why savvy investors keep pouring money into this stretch of Lagos.",
//     cover_image: null,
//     category: "Market Updates",
//     reading_time: 5,
//     published_at: "2025-01-15",
//     author_name: "Chukwuemeka Adeyemi",
//   },
//   {
//     id: 2,
//     slug: "buying-land-guide-nigeria",
//     title:
//       "The Complete Guide to Buying Land in Nigeria Without Getting Scammed",
//     excerpt:
//       "Land fraud is rampant. Here's how to verify titles, conduct due diligence, and protect your investment.",
//     cover_image: null,
//     category: "Property Guides",
//     reading_time: 8,
//     published_at: "2025-01-10",
//     author_name: "Fatima Bello",
//   },
//   {
//     id: 3,
//     slug: "c-of-o-vs-gazette",
//     title:
//       "C of O vs Gazette vs Governor's Consent: Which Title Should You Buy?",
//     excerpt:
//       "Not all land titles are equal. We explain the hierarchy of Nigerian land titles and which carries the most legal weight.",
//     cover_image: null,
//     category: "Investment Tips",
//     reading_time: 6,
//     published_at: "2025-01-05",
//     author_name: "Tunde Olawale",
//   },
//   {
//     id: 4,
//     slug: "abuja-vs-lagos-investment",
//     title: "Abuja vs Lagos: Where Should You Invest in Real Estate in 2025?",
//     excerpt:
//       "A data-driven comparison of Nigeria's two biggest property markets — cap rates, growth trajectories, and risk profiles.",
//     cover_image: null,
//     category: "Investment Tips",
//     reading_time: 7,
//     published_at: "2024-12-28",
//     author_name: "Adaeze Nwosu",
//   },
//   {
//     id: 5,
//     slug: "off-plan-investment-risks",
//     title:
//       "Off-Plan Property Investment in Nigeria: Rewards, Risks & Red Flags",
//     excerpt:
//       "Off-plan can deliver 40%+ returns — but only if you know how to identify credible developers from fraudsters.",
//     cover_image: null,
//     category: "Investment Tips",
//     reading_time: 9,
//     published_at: "2024-12-20",
//     author_name: "Babatunde Olawale",
//   },
//   {
//     id: 6,
//     slug: "smart-homes-nigeria",
//     title: "Smart Homes Are Coming to Lagos: What Buyers Need to Know",
//     excerpt:
//       "From automated lighting to biometric access, we tour 5 of Lagos's most technologically advanced residential developments.",
//     cover_image: null,
//     category: "Lifestyle",
//     reading_time: 4,
//     published_at: "2024-12-15",
//     author_name: "Zainab Abubakar",
//   },
// ];

const cardBgs = [
  "linear-gradient(135deg, #0F172A 0%, #1a2744 100%)",
  "linear-gradient(135deg, #0d1f2d 0%, #1E293B 100%)",
  "linear-gradient(135deg, #1a150d 0%, #0F172A 100%)",
  "linear-gradient(135deg, #0d1a1a 0%, #1E293B 100%)",
  "linear-gradient(135deg, #1a1f35 0%, #0F172A 100%)",
  "linear-gradient(135deg, #1a0d1a 0%, #1E293B 100%)",
];

function BlogCard({ post, index }) {
  const imageUrl = getCoverUrl(post.cover_image);

  // Handle category: could be a string name or an object {name, slug}
  const categoryName =
    post.category?.name ||
    (typeof post.category === "string" ? post.category : null);

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group"
      style={{
        display: "block",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        transition:
          "transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "var(--shadow-xl)";
        e.currentTarget.style.borderColor = "var(--color-primary-light)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--color-border)";
      }}
    >
      {/* Cover image */}
      <div
        style={{
          position: "relative",
          height: "200px",
          background: cardBgs[index % cardBgs.length],
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            style={{
              objectFit: "cover",
              transition: "transform 500ms ease",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : null}
        {/* Dot pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* Category badge */}
        {categoryName && (
          <div
            style={{ position: "absolute", top: "0.875rem", left: "0.875rem" }}
          >
            <span
              style={{
                background: "var(--color-primary)",
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "0.25rem 0.7rem",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-heading)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {categoryName}
            </span>
          </div>
        )}
        {/* Reading time */}
        {post.reading_time && (
          <div
            style={{
              position: "absolute",
              bottom: "0.875rem",
              right: "0.875rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.65rem",
                fontWeight: 600,
                padding: "0.25rem 0.6rem",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <Clock size={9} /> {post.reading_time} min read
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          {date && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "var(--color-text-muted)",
                fontSize: "0.75rem",
              }}
            >
              <Calendar size={11} /> {date}
            </span>
          )}
          {post.author_name && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "var(--color-text-muted)",
                fontSize: "0.75rem",
              }}
            >
              <User size={11} /> {post.author_name}
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "var(--color-secondary)",
            lineHeight: 1.35,
            marginBottom: "0.625rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              marginBottom: "1rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "var(--color-primary)",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "0.8125rem",
          }}
        >
          Read Article <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}

export default function BlogClient({
  initialPosts,
  initialPage,
  totalPages: initTotal,
  totalCount: initCount,
  categories,
  initialCategory,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initTotal);
  const [totalCount, setTotalCount] = useState(initCount);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const displayPosts = posts.length ? posts : PLACEHOLDER_POSTS;
  const displayCategories = categories.length
    ? [{ _id: "", slug: "", name: "All Posts" }, ...categories]
    : DEFAULT_CATEGORIES;

  const fetchPosts = useCallback(
    async (category, page = 1) => {
      setLoading(true);
      try {
        const res = await blogApi.getAll({ category, page });
        setPosts(res?.data || []);
        setTotalPages(res?.totalPages || 1);
        setTotalCount(res?.total || 0);
        setCurrentPage(page);
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (page > 1) params.set("page", String(page));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [pathname, router],
  );

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    fetchPosts(cat, 1);
  };

  return (
    <>
      <PageHero
        title="Blog & Insights"
        subtitle="Expert real estate advice, market intelligence, and property guides for Nigerian buyers and investors."
        breadcrumbs={[{ label: "Blog" }]}
      />

      <div
        className="section-pad"
        style={{ background: "var(--color-surface-2)" }}
      >
        <div className="container-site">
          {/* Category tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "2.5rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {displayCategories.map((cat) => {
              const catId = cat.slug || cat.id || "";
              const active = activeCategory === catId;
              return (
                <button
                  key={catId || "all"}
                  onClick={() => handleCategoryChange(catId)}
                  style={{
                    padding: "0.5rem 1.125rem",
                    borderRadius: "var(--radius-full)",
                    border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: active
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                    color: active ? "white" : "var(--color-text-secondary)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    boxShadow: active ? "var(--shadow-coral)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor =
                        "var(--color-primary)";
                      e.currentTarget.style.color = "var(--color-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color =
                        "var(--color-text-secondary)";
                    }
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                alignSelf: "center",
              }}
            >
              {totalCount || displayPosts.length} articles
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
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
                  <div style={{ padding: "1.25rem" }}>
                    <div
                      className="skeleton"
                      style={{
                        height: "0.75rem",
                        width: "40%",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <div
                      className="skeleton"
                      style={{ height: "1rem", marginBottom: "0.5rem" }}
                    />
                    <div
                      className="skeleton"
                      style={{ height: "1rem", width: "80%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <EmptyState
              title="No articles found"
              message="No posts in this category yet. Check back soon!"
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {displayPosts.map((post, i) => (
                <BlogCard key={post._id || post.id} post={post} index={i} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              fetchPosts(activeCategory, p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>
    </>
  );
}
