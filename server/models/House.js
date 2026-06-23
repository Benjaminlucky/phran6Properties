"use strict";

const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  slug:            { type: String, required: true, unique: true },
  description:     { type: String },
  location:        { type: String },
  state:           { type: String },
  lga:             { type: String },
  address:         { type: String },
  price:           { type: Number },
  price_label:     { type: String, enum: ["outright","per_annum","on_request"], default: "outright" },
  status:          { type: String, enum: ["available","ready_to_move","off_plan","coming_soon","sold","reserved","rented"], default: "available" },
  category:        { type: String, enum: ["apartment","duplex","bungalow","terrace","penthouse","semi_detached","detached","commercial","shortlet","mini_flat"], default: "apartment" },
  bedrooms:        { type: Number },
  bathrooms:       { type: Number },
  garage:          { type: Number, default: 0 },
  feature_image:   { type: String },
  gallery:         { type: [String], default: [] },
  youtube_url:     { type: String },
  size_sqm:        { type: Number },
  latitude:        { type: Number },
  longitude:       { type: Number },
  features:        { type: [String], default: [] },
  tags:            { type: [String], default: [] },
  meta_title:      { type: String },
  meta_description:{ type: String },
  featured:        { type: Boolean, default: false },
  views_count:     { type: Number, default: 0 },
}, { timestamps: true });

houseSchema.index({ status: 1 });
houseSchema.index({ state: 1 });
houseSchema.index({ category: 1 });
houseSchema.index({ featured: 1 });
houseSchema.index({ title: "text", description: "text", location: "text", state: "text" });

module.exports = mongoose.model("House", houseSchema);
