import { blogApi, serverFetch } from "@/lib/api";
import { SITE_CONFIG, SITE_URL } from "@/config/site";
import BlogClient from "./BlogClient";

export const revalidate = 300;

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  // Noindex category filter pages that return no posts
  const category = params?.category || "";
  let isEmpty = false;
  if (category) {
    try {
      const res = await blogApi.getAll({ category, perPage: 1 });
      isEmpty = (res?.total || 0) === 0;
    } catch {
      /* keep indexable if API fails */
    }
  }

  try {
    const data = await serverFetch("/settings", { next: { revalidate: 300 } });
    const s = data?.data?.settings || {};
    const siteName = s.site_name || SITE_CONFIG.name;
    const desc = `Real estate insights, property investment tips, and market updates for Nigerian property buyers and investors.`;
    const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent("Blog & Insights")}&subtitle=Real+Estate+News+%26+Investment+Tips&type=blog&site=${encodeURIComponent(siteName)}`;
    return {
      title: `Blog & News — ${siteName}`,
      description: desc,
      alternates: { canonical: `${SITE_URL}/blog` },
      ...(isEmpty && { robots: { index: false, follow: true } }),
      openGraph: {
        title: `Blog & News — ${siteName}`,
        description: desc,
        url: `${SITE_URL}/blog`,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `Blog & News — ${siteName}`,
        description: desc,
        images: [ogImage],
      },
    };
  } catch {
    return { title: `Blog — ${SITE_CONFIG.name}` };
  }
}

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page || 1);
  const category = params?.category || "";

  let posts = [],
    totalPages = 1,
    totalCount = 0,
    categories = [];

  try {
    const [postsRes, catsRes] = await Promise.allSettled([
      blogApi.getAll({ page, category }),
      blogApi.getCategories?.() || Promise.resolve({ data: [] }),
    ]);
    posts = postsRes.status === "fulfilled" ? postsRes.value?.data || [] : [];
    totalPages =
      postsRes.status === "fulfilled" ? postsRes.value?.totalPages || 1 : 1;
    totalCount =
      postsRes.status === "fulfilled" ? postsRes.value?.total || 0 : 0;
    categories =
      catsRes.status === "fulfilled" ? catsRes.value?.data || [] : [];
  } catch {
    posts = [];
  }

  return (
    <BlogClient
      initialPosts={posts}
      initialPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      categories={categories}
      initialCategory={category}
    />
  );
}
