"use strict";

const { BlogPost, BlogCategory } = require("../models/Blog");
const {
  ok,
  created,
  fail,
  paginated,
  parsePagination,
  uniqueSlug,
} = require("../lib/helpers");

// ── Public ────────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { q, category } = req.query;
    const filter = { status: "published" };
    if (category) {
      const cat = await BlogCategory.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (q) filter.$text = { $search: q };

    const [data, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("category", "name slug")
        .sort({ published_at: -1, createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const cats = await BlogCategory.aggregate([
      {
        $lookup: {
          from: "blogposts",
          localField: "_id",
          foreignField: "category",
          as: "posts",
        },
      },
      {
        $addFields: {
          post_count: {
            $size: {
              $filter: {
                input: "$posts",
                as: "p",
                cond: { $eq: ["$$p.status", "published"] },
              },
            },
          },
        },
      },
      { $project: { posts: 0 } },
      { $sort: { name: 1 } },
    ]);
    return ok(res, cats);
  } catch (err) {
    next(err);
  }
};

exports.getRecent = async (req, res, next) => {
  try {
    const limit = Math.min(10, parseInt(req.query.limit) || 4);
    const data = await BlogPost.find({ status: "published" })
      .populate("category", "name slug")
      .sort({ published_at: -1 })
      .limit(limit)
      .lean();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("category", "name slug")
      .lean();
    if (!post) return fail(res, "Post not found", 404);
    BlogPost.findByIdAndUpdate(post._id, { $inc: { views_count: 1 } }).exec();
    return ok(res, post);
  } catch (err) {
    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────────
exports.adminGetAll = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { status, category_id } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category_id) filter.category = category_id;

    const [data, total] = await Promise.all([
      BlogPost.find(filter)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
};

exports.adminGetById = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate("category", "name slug")
      .lean();
    if (!post) return fail(res, "Post not found", 404);
    return ok(res, post);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, status = "draft" } = req.body;
    if (!title) return fail(res, "Title is required");
    const slug = await uniqueSlug(BlogPost, title);
    const post = await BlogPost.create({
      ...req.body,
      slug,
      author: req.admin._id,
      author_name: req.admin.name,
      published_at: status === "published" ? new Date() : null,
    });
    return created(res, post, "Blog post created");
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return fail(res, "Post not found", 404);
    if (req.body.title && req.body.title !== post.title) {
      req.body.slug = await uniqueSlug(BlogPost, req.body.title, post._id);
    }
    if (req.body.status === "published" && post.status === "draft") {
      req.body.published_at = new Date();
    }
    Object.assign(post, req.body);
    await post.save();
    return ok(res, post, "Blog post updated");
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return fail(res, "Post not found", 404);
    return ok(res, { id: req.params.id }, "Blog post deleted");
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return fail(res, "Category name required");
    const slug = await uniqueSlug(BlogCategory, name);
    const cat = await BlogCategory.create({ name, slug });
    return created(res, cat, "Category created");
  } catch (err) {
    if (err.code === 11000) return fail(res, "Category already exists", 409);
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await BlogPost.updateMany(
      { category: req.params.id },
      { $unset: { category: 1 } },
    );
    await BlogCategory.findByIdAndDelete(req.params.id);
    return ok(res, null, "Category deleted");
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return fail(res, "Name is required");
    const slug = await uniqueSlug(BlogCategory, name, req.params.id);
    const cat = await BlogCategory.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true },
    );
    if (!cat) return fail(res, "Category not found", 404);
    return ok(res, cat, "Category updated");
  } catch (err) {
    if (err.code === 11000)
      return fail(res, "Category name already exists", 409);
    next(err);
  }
};
