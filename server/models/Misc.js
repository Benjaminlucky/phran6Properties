"use strict";

const mongoose = require("mongoose");

// ── Enquiry ───────────────────────────────────────────────────────
const enquirySchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, trim: true, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, required: true, trim: true },

    // Hero-form / inquiry-type fields
    inquiry_type: { type: String, trim: true, default: "" },
    property_type: { type: String, trim: true, default: "" }, // ← new
    budget: { type: String, trim: true, default: "" }, // ← new
    preferred_location: { type: String, trim: true, default: "" }, // ← new

    // Core message (required at DB level only when coming from contact/detail forms;
    // hero form resolves a fallback message in the route)
    message: { type: String, required: true },

    // Listing linkage
    listing_type: {
      type: String,
      enum: ["land", "house", "general"],
      default: "general",
    },
    listing_id: { type: mongoose.Schema.Types.ObjectId },

    // Meta
    source: { type: String, default: "website" },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });

// ── Setting ───────────────────────────────────────────────────────
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, default: "" },
    group_name: { type: String, default: "general" },
    label: { type: String, default: "" },
  },
  { timestamps: true },
);

// ── Media ─────────────────────────────────────────────────────────
const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    original_name: { type: String, required: true },
    file_path: { type: String, required: true }, // Cloudinary HTTPS URL
    public_id: { type: String, default: "" }, // Cloudinary public_id for deletion
    file_size: { type: Number, required: true },
    mime_type: { type: String, required: true },
    folder: { type: String, default: "general" },
    alt_text: { type: String, default: "" },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

const Enquiry = mongoose.model("Enquiry", enquirySchema);
const Setting = mongoose.model("Setting", settingSchema);
const Media = mongoose.model("Media", mediaSchema);

module.exports = { Enquiry, Setting, Media };
