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
const Land = require("../models/Land");
const { revalidate } = require("../lib/revalidate");

const escapeRegex = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// ── Revalidation path sets ────────────────────────────────────────
// Called after every mutation so the public site reflects changes
// immediately without waiting for the 5-minute ISR window.
function landPaths(slug) {
  const base = ["/", "/lands"];
  return slug ? [...base, `/lands/${slug}`] : base;
}

// ══════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════

// GET /lands — public listing with filters + pagination
router.get("/", async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const {
      location,
      state,
      status,
      title_type,
      min_price,
      max_price,
      search,
      featured,
    } = req.query;

    const filter = {};
    if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };
    if (state) filter.state = { $regex: escapeRegex(state), $options: "i" };
    if (status) filter.status = status;
    if (title_type) filter.title_type = title_type;
    if (featured === "true") filter.featured = true;
    if (min_price || max_price) {
      filter.price = {};
      if (min_price) filter.price.$gte = Number(min_price);
      if (max_price) filter.price.$lte = Number(max_price);
    }
    if (search) {
      const s = escapeRegex(search);
      filter.$or = [
        { estate_name: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      Land.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Land.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
});

// GET /lands/featured
router.get("/featured", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const data = await Land.find({ featured: true, status: { $ne: "sold" } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /lands/:slug — public detail + increment views
router.get("/:slug", async (req, res, next) => {
  try {
    const land = await Land.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views_count: 1 } },
      { new: true },
    ).lean();
    if (!land) return fail(res, "Land listing not found", 404);
    return ok(res, land);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════

// GET /admin/lands/:id — full record for edit form
router.get("/admin/lands/:id", requireAuth, async (req, res, next) => {
  try {
    const land = await Land.findById(req.params.id).lean();
    if (!land) return fail(res, "Land listing not found", 404);
    return ok(res, land);
  } catch (err) {
    next(err);
  }
});

// GET /admin/lands
router.get("/admin/lands", requireAuth, async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const s = escapeRegex(search);
      filter.$or = [
        { estate_name: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
      ];
    }
    const [data, total] = await Promise.all([
      Land.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Land.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
});

// POST /admin/lands — create
router.post(
  "/admin/lands",
  requireAuth,
  upload.array("images", 10),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };

      // Parse JSON fields that may come as strings from FormData
      for (const f of ["amenities", "gallery", "installment_plan"]) {
        if (typeof body[f] === "string") {
          try {
            body[f] = JSON.parse(body[f]);
          } catch {
            delete body[f];
          }
        }
      }
      if (body.featured !== undefined)
        body.featured = body.featured === "true" || body.featured === true;
      if (body.price) body.price = Number(body.price);
      if (body.latitude) body.latitude = Number(body.latitude);
      if (body.longitude) body.longitude = Number(body.longitude);

      if (req.files?.length) {
        body.feature_image = req.files[0].path || req.files[0].secure_url;
        body.gallery = req.files.map((f) => f.path || f.secure_url);
      }

      if (!body.estate_name) return fail(res, "Estate name is required");
      if (!body.slug)
        body.slug = body.estate_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const land = await Land.create(body);

      // ── Revalidate public pages ──────────────────────────────────
      revalidate(landPaths(land.slug));

      return created(res, land, "Land listing created");
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/lands/:id — update
router.put(
  "/admin/lands/:id",
  requireAuth,
  upload.array("images", 10),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };

      // Strip immutable / server-managed fields the client may echo back
      for (const k of ["_id", "__v", "createdAt", "updatedAt", "views_count", "slug"]) {
        delete body[k];
      }

      for (const f of ["amenities", "gallery", "installment_plan"]) {
        if (typeof body[f] === "string") {
          try {
            body[f] = JSON.parse(body[f]);
          } catch {
            delete body[f];
          }
        }
      }
      if (body.featured !== undefined)
        body.featured = body.featured === "true" || body.featured === true;
      if (body.price !== undefined && body.price !== "") body.price = Number(body.price);
      else if (body.price === "") delete body.price;
      if (body.latitude !== undefined && body.latitude !== "") body.latitude = Number(body.latitude);
      else if (body.latitude === "") delete body.latitude;
      if (body.longitude !== undefined && body.longitude !== "") body.longitude = Number(body.longitude);
      else if (body.longitude === "") delete body.longitude;

      // Remove empty strings for enum fields so validators don't reject them
      for (const k of ["status", "title_type"]) {
        if (body[k] === "") delete body[k];
      }

      if (req.files?.length) {
        body.feature_image = req.files[0].path || req.files[0].secure_url;
        body.gallery = req.files.map((f) => f.path || f.secure_url);
      }

      const land = await Land.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      }).lean();
      if (!land) return fail(res, "Land listing not found", 404);

      // ── Revalidate public pages ──────────────────────────────────
      revalidate(landPaths(land.slug));

      return ok(res, land, "Land listing updated");
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /admin/lands/:id
router.delete("/admin/lands/:id", requireAuth, async (req, res, next) => {
  try {
    const land = await Land.findByIdAndDelete(req.params.id);
    if (!land) return fail(res, "Land listing not found", 404);

    // ── Revalidate public pages ──────────────────────────────────
    revalidate(landPaths(land.slug));

    return ok(res, null, "Land listing deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
