"use strict";

const router = require("express").Router();
const Review = require("../models/review");
const { ok, created, fail } = require("../lib/helpers");
const { requireAuth } = require("../middleware/auth");
const { revalidate } = require("../lib/revalidate");

// Reviews only affect the homepage Testimonials section
const REVIEW_PATHS = ["/"];

// ── GET /reviews — public ─────────────────────────────────────────
// Returns only active reviews, ordered by sort_order then createdAt.
// Consumed by the public homepage Testimonials section (ISR-cached).
router.get("/reviews", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const reviews = await Review.find({ is_active: true })
      .sort({ sort_order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    return ok(res, reviews);
  } catch (err) {
    next(err);
  }
});

// ── GET /admin/reviews — protected ───────────────────────────────
// Returns all reviews including inactive ones.
router.get("/admin/reviews", requireAuth, async (req, res, next) => {
  try {
    const reviews = await Review.find({})
      .sort({ sort_order: 1, createdAt: -1 })
      .lean();
    return ok(res, reviews);
  } catch (err) {
    next(err);
  }
});

// ── POST /admin/reviews ───────────────────────────────────────────
router.post("/admin/reviews", requireAuth, async (req, res, next) => {
  try {
    const { name, role, rating, review, avatar_url, is_active, sort_order } =
      req.body;
    if (!name?.trim()) return fail(res, "Name is required");
    if (!review?.trim()) return fail(res, "Review text is required");

    const doc = await Review.create({
      name: name.trim(),
      role: role?.trim() || "",
      rating: parseInt(rating) || 5,
      review: review.trim(),
      avatar_url: avatar_url?.trim() || "",
      is_active: is_active !== false,
      sort_order: parseInt(sort_order) || 0,
    });
    revalidate(REVIEW_PATHS);
    return created(res, doc, "Review created");
  } catch (err) {
    next(err);
  }
});

// ── PUT /admin/reviews/:id ────────────────────────────────────────
router.put("/admin/reviews/:id", requireAuth, async (req, res, next) => {
  try {
    const { name, role, rating, review, avatar_url, is_active, sort_order } =
      req.body;
    const doc = await Review.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(role !== undefined && { role: role.trim() }),
        ...(rating !== undefined && { rating: parseInt(rating) || 5 }),
        ...(review !== undefined && { review: review.trim() }),
        ...(avatar_url !== undefined && { avatar_url: avatar_url.trim() }),
        ...(is_active !== undefined && { is_active }),
        ...(sort_order !== undefined && {
          sort_order: parseInt(sort_order) || 0,
        }),
      },
      { new: true, runValidators: true },
    ).lean();
    if (!doc) return fail(res, "Review not found", 404);
    revalidate(REVIEW_PATHS);
    return ok(res, doc, "Review updated");
  } catch (err) {
    next(err);
  }
});

// ── DELETE /admin/reviews/:id ─────────────────────────────────────
router.delete("/admin/reviews/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Review.findByIdAndDelete(req.params.id);
    if (!doc) return fail(res, "Review not found", 404);
    revalidate(REVIEW_PATHS);
    return ok(res, null, "Review deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
