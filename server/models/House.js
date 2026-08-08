"use strict";

const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true, maxlength: 200 },
  slug:            { type: String, required: true, unique: true, maxlength: 300 },
  description:     { type: String, maxlength: 50000 },
  location:        { type: String, maxlength: 200 },
  state:           { type: String, maxlength: 100 },
  lga:             { type: String, maxlength: 120 },
  address:         { type: String, maxlength: 300 },
  price:           { type: Number },
  price_label:     { type: String, enum: ["outright","per_annum","on_request"], default: "outright" },
  status:          { type: String, enum: ["available","ready_to_move","off_plan","coming_soon","sold","reserved","rented"], default: "available" },
  category:        { type: String, enum: ["apartment","duplex","bungalow","terrace","penthouse","semi_detached","detached","commercial","shortlet","mini_flat"], default: "apartment" },
  bedrooms:        { type: Number },
  bathrooms:       { type: Number },
  garage:          { type: Number, default: 0 },
  feature_image:   { type: String, maxlength: 2000 },
  gallery:         { type: [String], default: [] },
  youtube_url:     { type: String, maxlength: 500 },
  size_sqm:        { type: Number },
  latitude:        { type: Number },
  longitude:       { type: Number },
  features:        { type: [String], default: [] },
  tags:            { type: [String], default: [] },
  meta_title:      { type: String, maxlength: 200 },
  meta_description:{ type: String, maxlength: 300 },
  featured:        { type: Boolean, default: false },
  views_count:     { type: Number, default: 0 },
}, { timestamps: true });

houseSchema.index({ status: 1 });
houseSchema.index({ state: 1 });
houseSchema.index({ category: 1 });
houseSchema.index({ featured: 1 });
houseSchema.index({ title: "text", description: "text", location: "text", state: "text" });

// ── Compound indexes for the public listing query ─────────────────
// GET /houses always sorts by { featured: -1, createdAt: -1 }. Compound
// keys follow the ESR rule: equality-filter field(s) first, then the two
// sort fields in the exact order/direction the sort uses, so the index
// satisfies both the predicate and the sort (no in-memory SORT stage).

// Unfiltered listing (the default page) + GET /houses/featured
// ({ featured: true } equality, then createdAt ordering).
houseSchema.index({ featured: -1, createdAt: -1 });

// Status-filtered listing — `status` is the most common equality filter.
houseSchema.index({ status: 1, featured: -1, createdAt: -1 });

// State-filtered listing. `state` is an exact-value filter (fixed Nigerian
// state list in the UI) queried under a case-insensitive collation, so this
// index is declared with the SAME collation — an index can only serve a
// query whose collation matches it. `category` is left as a residual filter:
// it is low-cardinality and cheap to apply after these keys narrow the scan.
houseSchema.index(
  { state: 1, featured: -1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } },
);

module.exports = mongoose.models.House || mongoose.model("House", houseSchema);
