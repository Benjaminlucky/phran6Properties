import { notFound } from "next/navigation";
import { blogApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import BlogPostClient from "./BlogDetailClient";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const [res, settingsRes] = await Promise.all([
      blogApi.getBySlug(slug),
      serverFetch("/settings", { next: { revalidate: 300 } }),
    ]);
    const post = res?.data;
    const s = settingsRes?.data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    if (!post) return { title: `Post Not Found — ${siteName}` };

    const title = post.meta_title || `${post.title} — ${siteName}`;
    const description =
      post.meta_description ||
      post.excerpt ||
      `${post.title} — Read on ${siteName}`;

    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/blog/${slug}` },
      openGraph: {
        title,
        description,
        images: post.cover_image
          ? [{ url: post.cover_image, width: 1200, height: 630 }]
          : [
              {
                url: `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&type=blog${post.category?.name ? "&subtitle=" + encodeURIComponent(post.category.name) : ""}`,
                width: 1200,
                height: 630,
              },
            ],
        url: `${SITE_URL}/blog/${slug}`,
        type: "article",
        publishedTime: post.published_at,
        authors: post.author_name ? [post.author_name] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: post.cover_image
          ? [post.cover_image]
          : [
              `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&type=blog`,
            ],
      },
    };
  } catch {
    return { title: `Blog — ${SITE_CONFIG.name}` };
  }
}

// ── JSON-LD builder ───────────────────────────────────────────────
function buildBreadcrumbSchema(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

function buildArticleSchema(post, settings) {
  const siteName = settings?.site_name || SITE_CONFIG.name;
  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/blog/${post.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description || post.title,
    url: pageUrl,
    datePublished: post.published_at || post.createdAt || undefined,
    dateModified: post.updatedAt || post.published_at || undefined,
    image: post.cover_image
      ? {
          "@type": "ImageObject",
          url: post.cover_image,
          contentUrl: post.cover_image,
        }
      : undefined,
    author: post.author_name
      ? { "@type": "Person", name: post.author_name }
      : { "@type": "Organization", name: siteName, url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: settings?.logo
        ? { "@type": "ImageObject", url: settings.logo }
        : undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    keywords: (post.tags || []).join(", ") || undefined,
    articleSection: post.category?.name || undefined,
    inLanguage: "en-NG",
  };

  return JSON.parse(
    JSON.stringify(schema, (_, v) => (v === undefined ? undefined : v)),
  );
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  let post = null;
  let settings = {};
  let related = [];

  try {
    const [postRes, settingsRes] = await Promise.all([
      blogApi.getBySlug(slug),
      serverFetch("/settings", { next: { revalidate: 300 } }),
    ]);
    post = postRes?.data || null;
    settings = settingsRes?.data?.settings || {};
  } catch {
    notFound();
  }

  if (!post) notFound();

  // Fetch related posts — same category, exclude current slug
  try {
    const catSlug = post.category?.slug || "";
    const relatedRes = await blogApi.getAll({
      category: catSlug,
      perPage: 4,
    });
    related = (relatedRes?.data || [])
      .filter((p) => p.slug !== slug)
      .slice(0, 3);

    // If not enough from same category, fall back to recent
    if (related.length < 3) {
      const recentRes = await blogApi.getRecent(6);
      const recent = (recentRes?.data || []).filter(
        (p) => p.slug !== slug && !related.find((r) => r.slug === p.slug),
      );
      related = [...related, ...recent].slice(0, 3);
    }
  } catch {
    related = [];
  }

  const jsonLd = buildArticleSchema(post, settings);
  const breadcrumbLd = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    ...(post.category?.name
      ? [
          {
            name: post.category.name,
            url: `${SITE_URL}/blog?category=${post.category.slug || ""}`,
          },
        ]
      : []),
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BlogPostClient post={post} settings={settings} related={related} />
    </>
  );
}
