"use strict";

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, trim: true, default: "", maxlength: 150 }, // e.g. "Land Buyer, Lekki"
    rating: { type: Number, min: 1, max: 5, default: 5 },
    review: { type: String, required: true, trim: true, maxlength: 5000 },
    avatar_url: { type: String, default: "", maxlength: 2000 }, // optional Cloudinary URL
    is_active: { type: Boolean, default: true }, // soft toggle — hide without delete
    sort_order: { type: Number, default: 0 }, // manual ordering
  },
  { timestamps: true },
);

reviewSchema.index({ is_active: 1, sort_order: 1 });

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
