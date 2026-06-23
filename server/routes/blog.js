"use strict";

const router = require("express").Router();
const {
  ok,
  created,
  fail,
  paginated,
  parsePagination,
} = require("../lib/helpers");
const { requireAuth } = require("../middleware/auth");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const { BlogPost, BlogCategory } = require("../models/Blog");
const { revalidate } = require("../lib/revalidate");

const escapeRegex = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

function blogPaths(slug) {
  const base = ["/blog"];
  return slug ? [...base, `/blog/${slug}`] : base;
}

// ══════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════

// GET /blog
router.get("/", async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { category, search, tag } = req.query;

    const filter = { status: "published" };

    // category param is a slug — must resolve to ObjectId first
    if (category) {
      const cat = await BlogCategory.findOne({ slug: category }).lean();
      if (cat) filter.category = cat._id;
      else filter.category = null; // no match → return empty
    }

    if (tag) filter.tags = tag;
    if (search) {
      const s = escapeRegex(search);
      filter.$or = [
        { title: { $regex: s, $options: "i" } },
        { excerpt: { $regex: s, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("category", "name slug")
        .sort({ published_at: -1 })
        .skip(skip)
        .limit(perPage)
        .select("-content")
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
});

// GET /blog/recent
router.get("/recent", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const data = await BlogPost.find({ status: "published" })
      .sort({ published_at: -1 })
      .limit(limit)
      .select("-content")
      .lean();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /blog/categories
router.get("/categories", async (req, res, next) => {
  try {
    const data = await BlogCategory.find({}).sort({ name: 1 }).lean();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /blog/:slug — public detail + increment views
router.get("/:slug", async (req, res, next) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug, status: "published" },
      { $inc: { views_count: 1 } },
      { new: true },
    ).lean();
    if (!post) return fail(res, "Blog post not found", 404);
    return ok(res, post);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════

// GET /admin/blog
router.get("/admin/blog", requireAuth, async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const s = escapeRegex(search);
      filter.$or = [
        { title: { $regex: s, $options: "i" } },
        { author_name: { $regex: s, $options: "i" } },
      ];
    }
    const [data, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .select("-content")
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
});

// GET /admin/blog/:id — full post for editor
router.get("/admin/blog/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id).lean();
    if (!post) return fail(res, "Post not found", 404);
    return ok(res, post);
  } catch (err) {
    next(err);
  }
});

// POST /admin/blog — create
router.post(
  "/admin/blog",
  requireAuth,
  upload.single("cover_image"),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };

      if (typeof body.tags === "string") {
        try {
          body.tags = JSON.parse(body.tags);
        } catch {
          body.tags = body.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
      if (typeof body.category === "string") {
        try {
          body.category = JSON.parse(body.category);
        } catch {}
      }
      if (body.reading_time) body.reading_time = Number(body.reading_time);

      if (req.file) body.cover_image = req.file.path || req.file.secure_url;

      if (!body.title) return fail(res, "Title is required");
      if (!body.slug)
        body.slug = body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      if (body.status === "published" && !body.published_at) {
        body.published_at = new Date();
      }

      const post = await BlogPost.create(body);

      // ── Revalidate when published ──────────────────────────────
      // Only revalidate for published posts — drafts don't affect public pages
      if (post.status === "published") {
        revalidate(blogPaths(post.slug));
      }

      return created(res, post, "Blog post created");
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/blog/:id — update
router.put(
  "/admin/blog/:id",
  requireAuth,
  upload.single("cover_image"),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };

      if (typeof body.tags === "string") {
        try {
          body.tags = JSON.parse(body.tags);
        } catch {
          body.tags = body.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
      if (typeof body.category === "string") {
        try {
          body.category = JSON.parse(body.category);
        } catch {}
      }
      if (body.reading_time) body.reading_time = Number(body.reading_time);

      if (req.file) body.cover_image = req.file.path || req.file.secure_url;

      if (body.status === "published" && !body.published_at) {
        body.published_at = new Date();
      }

      const post = await BlogPost.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      }).lean();
      if (!post) return fail(res, "Post not found", 404);

      // ── Revalidate whenever post is published or updated ────────
      if (post.status === "published") {
        revalidate(blogPaths(post.slug));
      }

      return ok(res, post, "Blog post updated");
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /admin/blog/:id
router.delete("/admin/blog/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return fail(res, "Post not found", 404);

    // ── Revalidate blog listing after deletion ─────────────────
    revalidate(blogPaths(post.slug));

    return ok(res, null, "Blog post deleted");
  } catch (err) {
    next(err);
  }
});

// ── Blog Categories CRUD ──────────────────────────────────────────

router.post("/admin/blog/categories", requireAuth, async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name) return fail(res, "Category name is required");
    const cat = await BlogCategory.create({
      name: name.trim(),
      slug: slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });
    return created(res, cat, "Category created");
  } catch (err) {
    next(err);
  }
});

router.put(
  "/admin/blog/categories/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      const { name, slug } = req.body;
      if (!name?.trim()) return fail(res, "Category name is required");
      const cat = await BlogCategory.findByIdAndUpdate(
        req.params.id,
        {
          name: name.trim(),
          slug: slug?.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
        { new: true, runValidators: true },
      ).lean();
      if (!cat) return fail(res, "Category not found", 404);
      return ok(res, cat, "Category updated");
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/admin/blog/categories/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      const cat = await BlogCategory.findByIdAndDelete(req.params.id);
      if (!cat) return fail(res, "Category not found", 404);
      return ok(res, null, "Category deleted");
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
