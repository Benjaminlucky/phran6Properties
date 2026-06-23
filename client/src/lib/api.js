/**
 * NaijaRealty API Client
 * No global 401 handler — each component handles auth errors itself
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://realtymartnew-production.up.railway.app"
).replace(/\/$/, "");

// These are no-ops now — kept for compatibility but do nothing
export function setUnauthorizedHandler(fn) {}

async function fetcher(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nr_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error(`Cannot reach server at ${API_URL}. Make sure NEXT_PUBLIC_API_URL is set and the backend is running.`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Non-JSON response (${res.status})`);
  }

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || `Request failed: ${res.status}`);
    err.status = res.status; // ← attach status so AuthContext can check it
    throw err;
  }
  return data;
}

export async function serverFetch(endpoint, options = {}) {
  const base = process.env.API_URL || API_URL;
  const res = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    next: options.next || { revalidate: 300 },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.message || `Server fetch failed: ${res.status}`);
  }
  return res.json();
}

function clean(p) {
  return Object.fromEntries(
    Object.entries(p).filter(([, v]) => v !== "" && v != null),
  );
}

export const setupApi = {
  getStatus: () => fetcher("/setup"),
  create: (d) => fetcher("/setup", { method: "POST", body: JSON.stringify(d) }),
};

export const authApi = {
  login: (d) =>
    fetcher("/auth/login", { method: "POST", body: JSON.stringify(d) }),
  logout: () => fetcher("/auth/logout", { method: "POST" }),
  me: () => fetcher("/auth/me"),
  verify: () => fetcher("/auth/verify"),
};

export const landsApi = {
  getAll: (p = {}) => fetcher("/lands?" + new URLSearchParams(clean(p))),
  getFeatured: (n = 6) => fetcher(`/lands/featured?limit=${n}`),
  getBySlug: (slug) => fetcher(`/lands/${slug}`),
  adminGetAll: (p = {}) =>
    fetcher("/lands/admin/lands?" + new URLSearchParams(clean(p))),
  adminGetById: (id) => fetcher(`/lands/admin/lands/${id}`),
  create: (d) =>
    fetcher("/lands/admin/lands", { method: "POST", body: JSON.stringify(d) }),
  update: (id, d) =>
    fetcher(`/lands/admin/lands/${id}`, {
      method: "PUT",
      body: JSON.stringify(d),
    }),
  delete: (id) => fetcher(`/lands/admin/lands/${id}`, { method: "DELETE" }),
};

export const housesApi = {
  getAll: (p = {}) => fetcher("/houses?" + new URLSearchParams(clean(p))),
  getFeatured: (n = 6) => fetcher(`/houses/featured?limit=${n}`),
  getBySlug: (slug) => fetcher(`/houses/${slug}`),
  adminGetAll: (p = {}) =>
    fetcher("/houses/admin/houses?" + new URLSearchParams(clean(p))),
  adminGetById: (id) => fetcher(`/houses/admin/houses/${id}`),
  create: (d) =>
    fetcher("/houses/admin/houses", {
      method: "POST",
      body: JSON.stringify(d),
    }),
  update: (id, d) =>
    fetcher(`/houses/admin/houses/${id}`, {
      method: "PUT",
      body: JSON.stringify(d),
    }),
  delete: (id) => fetcher(`/houses/admin/houses/${id}`, { method: "DELETE" }),
};

export const blogApi = {
  getAll: (p = {}) => fetcher("/blog?" + new URLSearchParams(clean(p))),
  getCategories: () => fetcher("/blog/categories"),
  getRecent: (n = 4) => fetcher(`/blog/recent?limit=${n}`),
  getBySlug: (slug) => fetcher(`/blog/${slug}`),
  adminGetAll: (p = {}) =>
    fetcher("/blog/admin/blog?" + new URLSearchParams(clean(p))),
  adminGetById: (id) => fetcher(`/blog/admin/blog/${id}`),
  create: (d) =>
    fetcher("/blog/admin/blog", { method: "POST", body: JSON.stringify(d) }),
  update: (id, d) =>
    fetcher(`/blog/admin/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(d),
    }),
  delete: (id) => fetcher(`/blog/admin/blog/${id}`, { method: "DELETE" }),
  createCategory: (d) =>
    fetcher("/blog/admin/blog/categories", {
      method: "POST",
      body: JSON.stringify(d),
    }),
  deleteCategory: (id) =>
    fetcher(`/blog/admin/blog/categories/${id}`, { method: "DELETE" }),

  updateCategory: (id, data) =>
    fetcher(`/blog/admin/blog/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const enquiriesApi = {
  submit: (d) =>
    fetcher("/enquiries", { method: "POST", body: JSON.stringify(d) }),
  adminGetAll: (p = {}) =>
    fetcher("/admin/enquiries?" + new URLSearchParams(clean(p))),
  adminGetById: (id) => fetcher(`/admin/enquiries/${id}`),
  update: (id, d) =>
    fetcher(`/admin/enquiries/${id}`, {
      method: "PUT",
      body: JSON.stringify(d),
    }),
  delete: (id) => fetcher(`/admin/enquiries/${id}`, { method: "DELETE" }),
};

export const settingsApi = {
  getPublic: () => fetcher("/settings"),
  getAdmin: (group) =>
    fetcher("/admin/settings" + (group ? `?group=${group}` : "")),
  update: (d) =>
    fetcher("/admin/settings", { method: "PUT", body: JSON.stringify(d) }),
};

export const mediaApi = {
  getAll: (p = {}) => fetcher("/admin/media?" + new URLSearchParams(clean(p))),
  upload: (file, folder = "general", altText = "") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    form.append("alt_text", altText);
    const headers = {};
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("nr_token");
      if (t) headers["Authorization"] = `Bearer ${t}`;
    }
    return fetch(`${API_URL}/admin/media`, {
      method: "POST",
      headers,
      body: form,
    }).then((r) => r.json());
  },
  updateAlt: (id, alt) =>
    fetcher(`/admin/media/${id}`, {
      method: "PUT",
      body: JSON.stringify({ alt_text: alt }),
    }),
  delete: (id) => fetcher(`/admin/media/${id}`, { method: "DELETE" }),
};

export const teamApi = {
  getAll: () => fetcher("/admin/team"),
  getById: (id) => fetcher(`/admin/team/${id}`),
  create: (d) =>
    fetcher("/admin/team", { method: "POST", body: JSON.stringify(d) }),
  update: (id, d) =>
    fetcher(`/admin/team/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  changePassword: (id, d) =>
    fetcher(`/admin/team/${id}/password`, {
      method: "PUT",
      body: JSON.stringify(d),
    }),
  delete: (id) => fetcher(`/admin/team/${id}`, { method: "DELETE" }),
};

export const statsApi = { getDashboard: () => fetcher("/admin/stats") };
export const searchApi = {
  search: (q, type = "all") =>
    fetcher(`/search?q=${encodeURIComponent(q)}&type=${type}`),
};

// ── Add this export to client/src/lib/api.js ─────────────────────
// Paste at the bottom of the file, before any closing exports.

export const reviewsApi = {
  // Public — used by homepage (server-side via serverFetch in page.jsx)
  getPublic: (limit = 20) => fetcher(`/reviews?limit=${limit}`),

  // Admin — all reviews including hidden
  getAll: () => fetcher("/admin/reviews"),

  create: (d) =>
    fetcher("/admin/reviews", { method: "POST", body: JSON.stringify(d) }),

  update: (id, d) =>
    fetcher(`/admin/reviews/${id}`, { method: "PUT", body: JSON.stringify(d) }),

  delete: (id) => fetcher(`/admin/reviews/${id}`, { method: "DELETE" }),
};

export const aboutApi = {
  get: () => serverFetch("/about", { cache: "no-store" }),
  save: (d) =>
    fetcher("/admin/about", { method: "PUT", body: JSON.stringify(d) }),
};

// ── Popular Areas ────────────────────────────────────────────────
export const popularAreasApi = {
  getPublic: () => fetcher("/popular-areas"),
  getAll: () => fetcher("/admin/popular-areas"),
  create: (formData) => {
    const headers = {};
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("nr_token");
      if (t) headers["Authorization"] = `Bearer ${t}`;
    }
    return fetch(`${API_URL}/admin/popular-areas`, {
      method: "POST",
      headers,
      body: formData,
    }).then((r) => r.json());
  },
  update: (id, formData) => {
    const headers = {};
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("nr_token");
      if (t) headers["Authorization"] = `Bearer ${t}`;
    }
    return fetch(`${API_URL}/admin/popular-areas/${id}`, {
      method: "PUT",
      headers,
      body: formData,
    }).then((r) => r.json());
  },
  delete: (id) => fetcher(`/admin/popular-areas/${id}`, { method: "DELETE" }),
};

// ── Partners ─────────────────────────────────────────────────────
export const partnersApi = {
  getPublic: () => fetcher("/partners"),
  getAll: () => fetcher("/admin/partners"),
  create: (formData) => {
    const headers = {};
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("nr_token");
      if (t) headers["Authorization"] = `Bearer ${t}`;
    }
    return fetch(`${API_URL}/admin/partners`, {
      method: "POST",
      headers,
      body: formData,
    }).then((r) => r.json());
  },
  update: (id, formData) => {
    const headers = {};
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("nr_token");
      if (t) headers["Authorization"] = `Bearer ${t}`;
    }
    return fetch(`${API_URL}/admin/partners/${id}`, {
      method: "PUT",
      headers,
      body: formData,
    }).then((r) => r.json());
  },
  delete: (id) => fetcher(`/admin/partners/${id}`, { method: "DELETE" }),
};
