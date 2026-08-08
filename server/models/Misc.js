"use strict";

const mongoose = require("mongoose");

// ── Enquiry ───────────────────────────────────────────────────────
const enquirySchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true, maxlength: 100 },
    last_name: { type: String, trim: true, default: "", maxlength: 100 },
    email: { type: String, lowercase: true, trim: true, default: "", maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },

    // Hero-form / inquiry-type fields
    inquiry_type: { type: String, trim: true, default: "", maxlength: 100 },
    property_type: { type: String, trim: true, default: "", maxlength: 100 }, // ← new
    budget: { type: String, trim: true, default: "", maxlength: 100 }, // ← new
    preferred_location: { type: String, trim: true, default: "", maxlength: 200 }, // ← new

    // Core message (required at DB level only when coming from contact/detail forms;
    // hero form resolves a fallback message in the route)
    message: { type: String, required: true, maxlength: 5000 },

    // Listing linkage
    listing_type: {
      type: String,
      enum: ["land", "house", "general"],
      default: "general",
    },
    listing_id: { type: mongoose.Schema.Types.ObjectId },

    // Meta
    source: { type: String, default: "website", maxlength: 100 },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
    },
    notes: { type: String, default: "", maxlength: 5000 },
  },
  { timestamps: true },
);

enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });

// ── Setting ───────────────────────────────────────────────────────
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, maxlength: 120 },
    // Settings hold long-form site copy (about text, footer blurbs), so this
    // is deliberately generous while still bounded.
    value: { type: String, default: "", maxlength: 20000 },
    group_name: { type: String, default: "general", maxlength: 60 },
    label: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: true },
);

// ── Media ─────────────────────────────────────────────────────────
const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, maxlength: 300 },
    original_name: { type: String, required: true, maxlength: 300 },
    file_path: { type: String, required: true, maxlength: 2000 }, // Cloudinary HTTPS URL
    public_id: { type: String, default: "", maxlength: 500 }, // Cloudinary public_id for deletion
    file_size: { type: Number, required: true },
    mime_type: { type: String, required: true, maxlength: 150 },
    folder: { type: String, default: "general", maxlength: 100 },
    alt_text: { type: String, default: "", maxlength: 500 },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);
const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);

module.exports = { Enquiry, Setting, Media };
