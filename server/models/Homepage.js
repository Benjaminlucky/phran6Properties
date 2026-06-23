"use strict";

const mongoose = require("mongoose");

// ── Popular Area ──────────────────────────────────────────────────
const popularAreaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // city/state label
    image_url: { type: String, default: "" }, // Cloudinary URL
    count: { type: String, default: "" }, // e.g. "24 Properties"
    link_path: { type: String, default: "" }, // override href, e.g. /lands?location=Lekki
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

popularAreaSchema.index({ is_active: 1, sort_order: 1 });

// ── Partner ───────────────────────────────────────────────────────
const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo_url: { type: String, default: "" }, // Cloudinary URL
    website: { type: String, default: "" }, // optional click-through URL
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

partnerSchema.index({ is_active: 1, sort_order: 1 });

const PopularArea = mongoose.model("PopularArea", popularAreaSchema);
const Partner = mongoose.model("Partner", partnerSchema);

module.exports = { PopularArea, Partner };
