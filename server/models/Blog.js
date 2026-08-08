"use strict";

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, maxlength: 200 },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true, maxlength: 250 },
  slug:            { type: String, required: true, unique: true, maxlength: 300 },
  content:         { type: String, maxlength: 100000 },
  excerpt:         { type: String, maxlength: 1000 },
  cover_image:     { type: String, maxlength: 2000 },
  category:        { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory" },
  author:          { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  author_name:     { type: String, maxlength: 120 },
  status:          { type: String, enum: ["draft","published"], default: "draft" },
  reading_time:    { type: Number, default: 5 },
  tags:            { type: [String], default: [] },
  meta_title:      { type: String, maxlength: 200 },
  meta_description:{ type: String, maxlength: 300 },
  views_count:     { type: Number, default: 0 },
  published_at:    { type: Date },
}, { timestamps: true });

postSchema.index({ status: 1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: "text", excerpt: "text", content: "text" });

const BlogCategory = mongoose.models.BlogCategory || mongoose.model("BlogCategory", categorySchema);
const BlogPost     = mongoose.models.BlogPost || mongoose.model("BlogPost", postSchema);

module.exports = { BlogCategory, BlogPost };
