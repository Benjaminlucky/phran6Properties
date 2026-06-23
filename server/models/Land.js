"use strict";

const mongoose = require("mongoose");

const landSchema = new mongoose.Schema({
  estate_name:        { type: String, required: true, trim: true },
  slug:               { type: String, required: true, unique: true },
  price:              { type: Number },
  title_type:         { type: String, enum: ["c_of_o","governors_consent","deed_of_assignment","excision","gazette","freehold","leasehold","survey_plan"], default: "c_of_o" },
  size:               { type: String },
  overview_title:     { type: String },
  overview_body:      { type: String },
  amenities:          { type: [String], default: [] },
  neighborhood:       { type: [String], default: [] },
  description:        { type: String },
  installment_plan:   { type: [String], default: [] },
  latitude:           { type: Number },
  longitude:          { type: Number },
  payment_plan:       { type: String },
  initial_deposit_pct:{ type: Number },
  feature_image:      { type: String },
  gallery:            { type: [String], default: [] },
  youtube_url:        { type: String },
  address:            { type: String },
  location:           { type: String },
  state:              { type: String },
  lga:                { type: String },
  meta_title:         { type: String },
  meta_description:   { type: String },
  status:             { type: String, enum: ["available","sold","reserved","coming_soon"], default: "available" },
  featured:           { type: Boolean, default: false },
  views_count:        { type: Number, default: 0 },
}, { timestamps: true });

landSchema.index({ status: 1 });
landSchema.index({ state: 1 });
landSchema.index({ featured: 1 });
landSchema.index({ estate_name: "text", overview_body: "text", location: "text", state: "text" });

module.exports = mongoose.model("Land", landSchema);
