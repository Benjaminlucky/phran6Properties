"use strict";

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  slug:            { type: String, required: true, unique: true },
  content:         { type: String },
  excerpt:         { type: String },
  cover_image:     { type: String },
  category:        { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory" },
  author:          { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  author_name:     { type: String },
  status:          { type: String, enum: ["draft","published"], default: "draft" },
  reading_time:    { type: Number, default: 5 },
  tags:            { type: [String], default: [] },
  meta_title:      { type: String },
  meta_description:{ type: String },
  views_count:     { type: Number, default: 0 },
  published_at:    { type: Date },
}, { timestamps: true });

postSchema.index({ status: 1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: "text", excerpt: "text", content: "text" });

const BlogCategory = mongoose.model("BlogCategory", categorySchema);
const BlogPost     = mongoose.model("BlogPost", postSchema);

module.exports = { BlogCategory, BlogPost };
