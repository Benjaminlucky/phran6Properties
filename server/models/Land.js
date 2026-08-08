"use strict";

const mongoose = require("mongoose");

const landSchema = new mongoose.Schema({
  estate_name:        { type: String, required: true, trim: true, maxlength: 200 },
  slug:               { type: String, required: true, unique: true, maxlength: 300 },
  price:              { type: Number },
  title_type:         { type: String, enum: ["c_of_o","governors_consent","deed_of_assignment","excision","gazette","freehold","leasehold","survey_plan"], default: "c_of_o" },
  size:               { type: String, maxlength: 100 },
  overview_title:     { type: String, maxlength: 200 },
  overview_body:      { type: String, maxlength: 50000 },
  amenities:          { type: [String], default: [] },
  neighborhood:       { type: [String], default: [] },
  description:        { type: String, maxlength: 50000 },
  installment_plan:   { type: [String], default: [] },
  latitude:           { type: Number },
  longitude:          { type: Number },
  payment_plan:       { type: String, maxlength: 5000 },
  initial_deposit_pct:{ type: Number },
  feature_image:      { type: String, maxlength: 2000 },
  gallery:            { type: [String], default: [] },
  youtube_url:        { type: String, maxlength: 500 },
  address:            { type: String, maxlength: 300 },
  location:           { type: String, maxlength: 200 },
  state:              { type: String, maxlength: 100 },
  lga:                { type: String, maxlength: 120 },
  meta_title:         { type: String, maxlength: 200 },
  meta_description:   { type: String, maxlength: 300 },
  status:             { type: String, enum: ["available","sold","reserved","coming_soon"], default: "available" },
  featured:           { type: Boolean, default: false },
  views_count:        { type: Number, default: 0 },
}, { timestamps: true });

landSchema.index({ status: 1 });
landSchema.index({ state: 1 });
landSchema.index({ featured: 1 });
landSchema.index({ estate_name: "text", overview_body: "text", location: "text", state: "text" });

// ── Compound indexes for the public listing query ─────────────────
// GET /lands always sorts by { featured: -1, createdAt: -1 }. Compound keys
// follow the ESR rule: equality-filter field(s) first, then the two sort
// fields in the exact order/direction the sort uses, so one index satisfies
// both the predicate and the sort (no in-memory SORT stage).

// Unfiltered listing (the default page) + GET /lands/featured
// ({ featured: true } equality, then createdAt ordering).
landSchema.index({ featured: -1, createdAt: -1 });

// Status-filtered listing — `status` is the most common equality filter.
landSchema.index({ status: 1, featured: -1, createdAt: -1 });

// State-filtered listing. `state` is an exact-value filter (fixed Nigerian
// state list in the UI) queried under a case-insensitive collation, so this
// index is declared with the SAME collation — an index can only serve a
// query whose collation matches it. `title_type` is left as a residual
// filter: low-cardinality and cheap once these keys narrow the scan.
landSchema.index(
  { state: 1, featured: -1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } },
);

module.exports = mongoose.models.Land || mongoose.model("Land", landSchema);
