"use client";
import Image from "next/image";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  ChevronRight,
  ArrowRight,
  Tag,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, readingTime, buildWhatsAppLink } from "@/lib/utils";
import { SITE_CONFIG, SITE_URL, API_URL } from "@/config/site";

// ── WhatsApp SVG ──────────────────────────────────────────────────
function WAIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Image URL helper ──────────────────────────────────────────────
function getCoverUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/uploads/${path.replace(/^uploads\//, "")}`;
}

// ── Read progress bar ─────────────────────────────────────────────
function ReadProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "3px",
        background: "rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--color-primary)",
          transition: "width 100ms linear",
        }}
      />
    </div>
  );
}

// ── Social share buttons ──────────────────────────────────────────
function ShareButtons({ url, title, whatsapp, vertical = false }) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const waMessage = `Check out this article: *${title}*\n${url}`;
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, waMessage)
    : `https://wa.me/?text=${encodedTitle}%20${encoded}`;

  const buttons = [
    {
      label: "Facebook",
      icon: <Facebook size={15} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: "#1877F2",
    },
    {
      label: "Twitter / X",
      icon: <Twitter size={15} />,
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      color: "#000000",
    },
    {
      label: "LinkedIn",
      icon: <Linkedin size={15} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      color: "#0A66C2",
    },
    {
      label: "WhatsApp",
      icon: <WAIcon size={15} />,
      href: waLink,
      color: "#25D366",
    },
  ];

  const btnBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vertical ? "0.5rem" : 0,
    width: vertical ? "100%" : "2.375rem",
    height: "2.375rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text-secondary)",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "0.8125rem",
    fontWeight: 600,
    fontFamily: "var(--font-heading)",
    transition: "all 150ms",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        gap: "0.5rem",
      }}
    >
      {buttons.map(({ label, icon, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${label}`}
          style={btnBase}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = color;
            e.currentTarget.style.borderColor = color;
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-surface)";
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
        >
          {icon}
          {vertical && <span>{label}</span>}
        </a>
      ))}
      <button
        onClick={handleCopy}
        title="Copy link"
        style={{ ...btnBase, border: "1px solid var(--color-border)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-secondary)";
          e.currentTarget.style.borderColor = "var(--color-secondary)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--color-surface)";
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
      >
        <Link2 size={15} />
        {vertical && <span>Copy Link</span>}
      </button>
    </div>
  );
}

// ── Related post card — matches BlogClient's BlogCard style ───────
const cardBgs = [
  "linear-gradient(135deg, #0F172A 0%, #1a2744 100%)",
  "linear-gradient(135deg, #0d1f2d 0%, #1E293B 100%)",
  "linear-gradient(135deg, #1a150d 0%, #0F172A 100%)",
];

function RelatedCard({ post, index }) {
  const imageUrl = getCoverUrl(post.cover_image);
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
      style={{
        display: "block",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        textDecoration: "none",
        transition: "transform 250ms, box-shadow 250ms, border-color 250ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--shadow-xl)";
        e.currentTarget.style.borderColor = "var(--color-primary-light)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--color-border)";
      }}
    >
      <div
        style={{
          height: "180px",
          background: cardBgs[index % cardBgs.length],
          position: "relative",
          overflow: "hidden",
        }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 90vw, 80vw"
            priority
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {categoryName && (
          <div
            style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}
          >
            <span
              style={{
                background: "var(--color-primary)",
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
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
        {post.reading_time && (
          <div
            style={{
              position: "absolute",
              bottom: "0.75rem",
              right: "0.75rem",
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
                padding: "0.2rem 0.55rem",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <Clock size={9} /> {post.reading_time} min
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: "1rem" }}>
        {date && (
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              color: "var(--color-text-muted)",
              fontSize: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <Calendar size={11} /> {date}
          </p>
        )}
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "var(--color-secondary)",
            lineHeight: 1.35,
            marginBottom: "0.75rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.title}
        </h3>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            color: "var(--color-primary)",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}
        >
          Read Article <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function BlogPostClient({ post, settings, related }) {
  const contentRef = useRef(null);
  const [activeHeading, setActiveHeading] = useState("");

  const {
    title,
    slug,
    content,
    excerpt,
    cover_image,
    category,
    author_name,
    published_at,
    reading_time,
    views_count,
  } = post;

  const whatsapp = settings?.whatsapp || SITE_CONFIG.whatsapp;
  const postUrl = `${SITE_URL}/blog/${slug}`;
  const coverUrl = getCoverUrl(cover_image);
  const categoryName =
    category?.name || (typeof category === "string" ? category : null);
  const categorySlug = category?.slug || "";

  // Auto-calculate reading time from content if DB value is missing
  const rt =
    reading_time ||
    (content
      ? Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200)
      : 5);

  const pubDate = published_at
    ? new Date(published_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // ── Track active heading for TOC highlight ──────────────────────
  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll("h2, h3");
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    headings.forEach((h) => {
      if (!h.id)
        h.id = h.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      observer.observe(h);
    });
    return () => observer.disconnect();
  }, [content]);

  // ── Extract TOC headings from HTML content ──────────────────────
  const tocHeadings = (() => {
    if (!content) return [];
    const matches = [...content.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)];
    return matches.map(([, level, text]) => ({
      level: parseInt(level),
      text: text.replace(/<[^>]*>/g, ""),
      id: text
        .replace(/<[^>]*>/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    }));
  })();

  return (
    <>
      <ReadProgressBar />

      {/* ── Page header ── */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 60%, #1E2D4A 100%)",
          paddingTop: "7rem",
          paddingBottom: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.025,
            backgroundImage: "radial-gradient(white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        <div
          className="container-site"
          style={{ position: "relative", maxWidth: "860px" }}
        >
          {/* Breadcrumb */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}
            >
              Home
            </Link>
            <ChevronRight
              size={12}
              style={{ color: "rgba(255,255,255,0.25)" }}
            />
            <Link
              href="/blog"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}
            >
              Blog
            </Link>
            {categoryName && (
              <>
                <ChevronRight
                  size={12}
                  style={{ color: "rgba(255,255,255,0.25)" }}
                />
                <Link
                  href={`/blog?category=${categorySlug}`}
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "0.8rem",
                  }}
                >
                  {categoryName}
                </Link>
              </>
            )}
          </nav>

          {/* Category pill */}
          {categoryName && (
            <Link
              href={`/blog?category=${categorySlug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                background: "rgba(255,107,107,0.15)",
                color: "var(--color-primary)",
                border: "1px solid rgba(255,107,107,0.3)",
                padding: "0.3rem 0.875rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 700,
                fontFamily: "var(--font-heading)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                textDecoration: "none",
                marginBottom: "1.25rem",
              }}
            >
              <Tag size={11} /> {categoryName}
            </Link>
          )}

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 900,
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            {title}
          </h1>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            {author_name && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--color-primary), #E85555)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={13} style={{ color: "white" }} />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {author_name}
                </span>
              </div>
            )}
            <div
              style={{
                width: "1px",
                height: "1rem",
                background: "rgba(255,255,255,0.2)",
              }}
            />
            {pubDate && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "0.8125rem",
                }}
              >
                <Calendar size={13} /> {pubDate}
              </span>
            )}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.8125rem",
              }}
            >
              <Clock size={13} /> {rt} min read
            </span>
            {views_count > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.8125rem",
                }}
              >
                <Eye size={13} /> {views_count} views
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ background: "var(--color-surface-2)" }}>
        <div
          className="container-site"
          style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: "3rem",
              alignItems: "start",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            {/* ── LEFT: Article ── */}
            <article>
              {/* Cover image */}
              {coverUrl && (
                <div
                  style={{
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    marginBottom: "2.5rem",
                    background: "#1e293b",
                  }}
                >
                  <Image
                    src={coverUrl}
                    alt={title}
                    fill
                    sizes="(max-width:640px) 100vw, 33vw"
                    style={{
                      objectFit: "cover",
                      maxHeight: "480px",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.parentElement.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Excerpt / lead paragraph */}
              {excerpt && (
                <p
                  style={{
                    fontSize: "1.125rem",
                    lineHeight: 1.75,
                    color: "var(--color-text-secondary)",
                    fontStyle: "italic",
                    borderLeft: "3px solid var(--color-primary)",
                    paddingLeft: "1.25rem",
                    marginBottom: "2rem",
                    background: "var(--color-surface)",
                    borderRadius: "0 var(--radius) var(--radius) 0",
                    padding: "1rem 1.25rem",
                  }}
                >
                  {excerpt}
                </p>
              )}

              {/* ── Article body ── */}
              {content ? (
                <div
                  ref={contentRef}
                  className="prose-article"
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    color: "var(--color-text-secondary)",
                  }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  Content not available.
                </p>
              )}

              {/* ── Bottom share bar ── */}
              <div
                style={{
                  marginTop: "3rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--color-text)",
                      marginBottom: "0.625rem",
                    }}
                  >
                    Found this helpful? Share it:
                  </p>
                  <ShareButtons
                    url={postUrl}
                    title={title}
                    whatsapp={whatsapp}
                  />
                </div>
                {categoryName && (
                  <Link
                    href={`/blog?category=${categorySlug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      background: "var(--color-surface-3)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                      padding: "0.5rem 1rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-heading)",
                      textDecoration: "none",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-primary)";
                      e.currentTarget.style.color = "var(--color-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color =
                        "var(--color-text-secondary)";
                    }}
                  >
                    <Tag size={13} /> More in {categoryName}
                  </Link>
                )}
              </div>

              {/* ── Author card ── */}
              {author_name && (
                <div
                  style={{
                    marginTop: "2rem",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.5rem",
                    display: "flex",
                    gap: "1.25rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, var(--color-primary), #E85555)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <User size={22} style={{ color: "white" }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--color-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {author_name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Real estate writer & property market analyst
                    </p>
                  </div>
                </div>
              )}
            </article>

            {/* ── RIGHT SIDEBAR ── */}
            <aside
              style={{
                position: "sticky",
                top: "6rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Article meta */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  padding: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-text-muted)",
                    marginBottom: "1rem",
                  }}
                >
                  Article Info
                </p>
                {[
                  pubDate && { label: "Published", value: pubDate },
                  { label: "Reading Time", value: `${rt} min` },
                  categoryName && { label: "Category", value: categoryName },
                  views_count > 0 && { label: "Views", value: views_count },
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--color-secondary)",
                          fontFamily: "var(--font-heading)",
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Share sidebar */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  padding: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--color-text)",
                    marginBottom: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <Share2 size={15} style={{ color: "var(--color-primary)" }} />{" "}
                  Share Article
                </p>
                <ShareButtons
                  url={postUrl}
                  title={title}
                  whatsapp={whatsapp}
                  vertical
                />
              </div>

              {/* TOC — only render if article has headings */}
              {tocHeadings.length > 1 && (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border)",
                    padding: "1.25rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--color-text)",
                      marginBottom: "0.875rem",
                    }}
                  >
                    In This Article
                  </p>
                  <nav>
                    {tocHeadings.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        style={{
                          display: "block",
                          padding: "0.375rem 0",
                          paddingLeft: h.level === 3 ? "1rem" : 0,
                          fontSize: "0.8125rem",
                          color:
                            activeHeading === h.id
                              ? "var(--color-primary)"
                              : "var(--color-text-secondary)",
                          fontWeight: activeHeading === h.id ? 600 : 400,
                          textDecoration: "none",
                          borderLeft: `2px solid ${activeHeading === h.id ? "var(--color-primary)" : "transparent"}`,
                          paddingLeft: h.level === 3 ? "1.25rem" : "0.5rem",
                          transition: "color 150ms, border-color 150ms",
                          lineHeight: 1.4,
                        }}
                        onMouseEnter={(e) => {
                          if (activeHeading !== h.id)
                            e.currentTarget.style.color = "var(--color-text)";
                        }}
                        onMouseLeave={(e) => {
                          if (activeHeading !== h.id)
                            e.currentTarget.style.color =
                              "var(--color-text-secondary)";
                        }}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Back to blog */}
              <Link
                href="/blog"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                <ArrowLeft size={15} /> Back to Blog
              </Link>
            </aside>
          </div>

          {/* ── Related posts ── */}
          {related.length > 0 && (
            <div style={{ maxWidth: "1100px", margin: "4rem auto 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "1.375rem",
                    color: "var(--color-secondary)",
                  }}
                >
                  Keep Reading
                </h2>
                <Link
                  href="/blog"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontFamily: "var(--font-heading)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  All Articles <ArrowRight size={14} />
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {related.map((p, i) => (
                  <RelatedCard key={p._id || p.slug} post={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Prose styles injected via a style tag ── */}
      <style>{`
        .prose-article h1,
        .prose-article h2,
        .prose-article h3,
        .prose-article h4 {
          font-family: var(--font-heading);
          font-weight: 800;
          color: var(--color-secondary);
          line-height: 1.3;
          margin-top: 2em;
          margin-bottom: 0.75em;
          letter-spacing: -0.02em;
          scroll-margin-top: 6rem;
        }
        .prose-article h2 { font-size: 1.375rem; }
        .prose-article h3 { font-size: 1.125rem; color: var(--color-text); }
        .prose-article h4 { font-size: 1rem; }
        .prose-article p  { margin-bottom: 1.25em; }
        .prose-article a  {
          color: var(--color-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
        }
        .prose-article a:hover { text-decoration: none; }
        .prose-article ul,
        .prose-article ol {
          margin: 1em 0 1.25em 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4em;
        }
        .prose-article ul { list-style: disc; }
        .prose-article ol { list-style: decimal; }
        .prose-article li { padding-left: 0.25rem; }
        .prose-article blockquote {
          border-left: 3px solid var(--color-primary);
          padding: 0.875rem 1.25rem;
          margin: 1.5em 0;
          background: var(--color-surface);
          border-radius: 0 var(--radius) var(--radius) 0;
          font-style: italic;
          color: var(--color-text-secondary);
        }
        .prose-article blockquote p { margin-bottom: 0; }
        .prose-article code {
          background: var(--color-surface-3);
          padding: 0.15em 0.45em;
          border-radius: var(--radius-sm);
          font-size: 0.875em;
          color: var(--color-primary);
          font-family: var(--font-mono);
        }
        .prose-article pre {
          background: var(--color-secondary);
          color: rgba(255,255,255,0.85);
          padding: 1.25rem;
          border-radius: var(--radius-lg);
          overflow-x: auto;
          margin: 1.5em 0;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .prose-article pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: inherit;
        }
        .prose-article img {
          border-radius: var(--radius-lg);
          max-width: 100%;
          height: auto;
          margin: 1.5em 0;
        }
        .prose-article hr {
          border: none;
          border-top: 1px solid var(--color-border);
          margin: 2.5em 0;
        }
        .prose-article strong { font-weight: 700; color: var(--color-text); }
        .prose-article em { font-style: italic; }
        .prose-article table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.9375rem;
        }
        .prose-article th {
          background: var(--color-secondary);
          color: white;
          padding: 0.625rem 0.875rem;
          text-align: left;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.8125rem;
        }
        .prose-article td {
          padding: 0.625rem 0.875rem;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-secondary);
        }
        .prose-article tr:nth-child(even) td {
          background: var(--color-surface-2);
        }
      `}</style>
    </>
  );
}
