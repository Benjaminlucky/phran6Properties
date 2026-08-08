"use strict";

const router = require("express").Router();
const {
  ok,
  created,
  fail,
  paginated,
  parsePagination,
  withFeatureImageFallback,
  withFeatureImageFallbackList,
} = require("../lib/helpers");
const { requireAuth } = require("../middleware/auth");
const { publicCache } = require("../middleware/cache");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const House = require("../models/House");
const { revalidate } = require("../lib/revalidate");
const { z } = require("zod");
const {
  formatIssues,
  optionalString,
  requiredString,
  optionalNumber,
  optionalBoolean,
  optionalEnum,
  optionalStringArray,
} = require("../middleware/validate");

// Escape user input before using in a MongoDB $regex to prevent ReDoS
const escapeRegex = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// `state` is an exact-value filter, not free text — both the public filter UI
// and the admin form pick from the fixed NIGERIAN_STATES list. It used to be
// matched with an unanchored case-insensitive $regex, which MongoDB can never
// serve from a B-tree index (it forces a COLLSCAN regardless of `state: 1`).
// An exact match under a case-insensitive collation stays case-insensitive
// while remaining index-eligible. The matching collation is declared on the
// { state, featured, createdAt } index in models/House.js — an index only
// serves a query whose collation matches its own. Applied only when a state
// filter is present so unfiltered queries keep using the simple-collation
// compound indexes.
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

function housePaths(slug) {
  const base = ["/", "/houses"];
  return slug ? [...base, `/houses/${slug}`] : base;
}

// ── Write allowlist ───────────────────────────────────────────────
// Mirrors models/House.js. Server-managed fields (_id, __v, slug,
// views_count, createdAt, updatedAt) are deliberately absent — zod
// strips unknown keys, so anything not listed here can never reach
// House.create() / findByIdAndUpdate() no matter what a client sends.
const houseBaseSchema = z.object({
  title: requiredString("Title is required"),
  description: optionalString,
  location: optionalString,
  state: optionalString,
  lga: optionalString,
  address: optionalString,
  price: optionalNumber,
  price_label: optionalEnum(["outright", "per_annum", "on_request"]),
  status: optionalEnum([
    "available",
    "ready_to_move",
    "off_plan",
    "coming_soon",
    "sold",
    "reserved",
    "rented",
  ]),
  category: optionalEnum([
    "apartment",
    "duplex",
    "bungalow",
    "terrace",
    "penthouse",
    "semi_detached",
    "detached",
    "commercial",
    "shortlet",
    "mini_flat",
  ]),
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  garage: optionalNumber,
  feature_image: optionalString,
  gallery: optionalStringArray,
  youtube_url: optionalString,
  size_sqm: optionalNumber,
  latitude: optionalNumber,
  longitude: optionalNumber,
  features: optionalStringArray,
  tags: optionalStringArray,
  meta_title: optionalString,
  meta_description: optionalString,
  featured: optionalBoolean,
});

const houseCreateSchema = houseBaseSchema;
// Updates are PATCH-style — every field is optional, including title.
const houseUpdateSchema = houseBaseSchema.partial();

// ══════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════

// GET /houses
router.get("/", publicCache(), async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const {
      location,
      state,
      status,
      category,
      bedrooms,
      min_price,
      max_price,
      search,
      featured,
    } = req.query;

    const filter = {};
    if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };
    if (state) filter.state = String(state).trim();
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (bedrooms !== undefined) filter.bedrooms = Number(bedrooms);
    if (featured === "true") filter.featured = true;
    if (min_price || max_price) {
      filter.price = {};
      if (min_price) filter.price.$gte = Number(min_price);
      if (max_price) filter.price.$lte = Number(max_price);
    }
    if (search) {
      const s = escapeRegex(search);
      filter.$or = [
        { title: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    const listQuery = House.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();
    const countQuery = House.countDocuments(filter);
    if (state) {
      listQuery.collation(CASE_INSENSITIVE);
      countQuery.collation(CASE_INSENSITIVE);
    }

    const [data, total] = await Promise.all([listQuery, countQuery]);
    return paginated(res, { data: withFeatureImageFallbackList(data), total, page, perPage });
  } catch (err) {
    next(err);
  }
});

// GET /houses/featured
router.get("/featured", publicCache(), async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const data = await House.find({ featured: true, status: { $ne: "sold" } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return ok(res, withFeatureImageFallbackList(data));
  } catch (err) {
    next(err);
  }
});

// GET /houses/:slug — public detail + increment views
router.get("/:slug", publicCache(), async (req, res, next) => {
  try {
    const house = await House.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views_count: 1 } },
      { new: true },
    ).lean();
    if (!house) return fail(res, "House listing not found", 404);
    return ok(res, withFeatureImageFallback(house));
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════

// GET /admin/houses/:id — full record for edit form
router.get("/admin/houses/:id", requireAuth, async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id).lean();
    if (!house) return fail(res, "House listing not found", 404);
    return ok(res, withFeatureImageFallback(house));
  } catch (err) {
    next(err);
  }
});

// GET /admin/houses
router.get("/admin/houses", requireAuth, async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const s = escapeRegex(search);
      filter.$or = [
        { title: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
      ];
    }
    const [data, total] = await Promise.all([
      House.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      House.countDocuments(filter),
    ]);
    return paginated(res, { data: withFeatureImageFallbackList(data), total, page, perPage });
  } catch (err) {
    next(err);
  }
});

// POST /admin/houses — create
router.post(
  "/admin/houses",
  requireAuth,
  upload.array("images", 10),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };

      for (const f of ["features", "gallery", "tags"]) {
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
      if (body.bedrooms !== undefined) body.bedrooms = Number(body.bedrooms);
      if (body.bathrooms !== undefined) body.bathrooms = Number(body.bathrooms);
      if (body.garage !== undefined) body.garage = Number(body.garage);
      if (body.size_sqm !== undefined) body.size_sqm = Number(body.size_sqm);
      if (body.latitude) body.latitude = Number(body.latitude);
      if (body.longitude) body.longitude = Number(body.longitude);

      if (req.files?.length) {
        body.feature_image = req.files[0].path || req.files[0].secure_url;
        body.gallery = req.files.map((f) => f.path || f.secure_url);
      }

      // The admin form's Feature Image and Gallery uploaders are
      // independent — if only the gallery was used, default the
      // feature image to the first gallery photo instead of blank.
      if (!body.feature_image && Array.isArray(body.gallery) && body.gallery.length) {
        body.feature_image = body.gallery[0];
      }

      if (!body.title) return fail(res, "Title is required");

      // ── Validate + allowlist the normalized payload ─────────────
      const parsed = houseCreateSchema.safeParse(body);
      if (!parsed.success) return fail(res, formatIssues(parsed.error), 400);
      const data = parsed.data;

      // slug is server-generated — never taken from the request
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const house = await House.create(data);

      // ── Revalidate public pages ──────────────────────────────────
      revalidate(housePaths(house.slug));

      return created(res, house, "House listing created");
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/houses/:id — update
router.put(
  "/admin/houses/:id",
  requireAuth,
  upload.array("images", 10),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const body = { ...req.body };

      for (const f of ["features", "gallery", "tags"]) {
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
      if (body.bedrooms !== undefined && body.bedrooms !== "") body.bedrooms = Number(body.bedrooms);
      else if (body.bedrooms === "") delete body.bedrooms;
      if (body.bathrooms !== undefined && body.bathrooms !== "") body.bathrooms = Number(body.bathrooms);
      else if (body.bathrooms === "") delete body.bathrooms;
      if (body.garage !== undefined) body.garage = Number(body.garage) || 0;
      if (body.size_sqm !== undefined && body.size_sqm !== "") body.size_sqm = Number(body.size_sqm);
      else if (body.size_sqm === "") delete body.size_sqm;
      if (body.latitude !== undefined && body.latitude !== "") body.latitude = Number(body.latitude);
      else if (body.latitude === "") delete body.latitude;
      if (body.longitude !== undefined && body.longitude !== "") body.longitude = Number(body.longitude);
      else if (body.longitude === "") delete body.longitude;

      // Remove empty strings for enum fields so validators don't reject them
      for (const k of ["status", "category", "price_label"]) {
        if (body[k] === "") delete body[k];
      }

      if (req.files?.length) {
        body.feature_image = req.files[0].path || req.files[0].secure_url;
        body.gallery = req.files.map((f) => f.path || f.secure_url);
      }

      // Same self-heal as create: don't let an edit save over a real
      // gallery with a blank feature image.
      if (!body.feature_image && Array.isArray(body.gallery) && body.gallery.length) {
        body.feature_image = body.gallery[0];
      }

      // ── Validate + allowlist the normalized payload ─────────────
      // Replaces the old immutable-field denylist: only fields defined
      // on the schema survive, so _id / __v / slug / views_count /
      // timestamps (and anything else) are dropped automatically.
      const parsed = houseUpdateSchema.safeParse(body);
      if (!parsed.success) return fail(res, formatIssues(parsed.error), 400);

      const house = await House.findByIdAndUpdate(req.params.id, parsed.data, {
        new: true,
        runValidators: true,
      }).lean();
      if (!house) return fail(res, "House listing not found", 404);

      // ── Revalidate public pages ──────────────────────────────────
      revalidate(housePaths(house.slug));

      return ok(res, house, "House listing updated");
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /admin/houses/:id
router.delete("/admin/houses/:id", requireAuth, async (req, res, next) => {
  try {
    const house = await House.findByIdAndDelete(req.params.id);
    if (!house) return fail(res, "House listing not found", 404);

    // ── Revalidate public pages ──────────────────────────────────
    revalidate(housePaths(house.slug));

    return ok(res, null, "House listing deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
