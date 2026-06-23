"use strict";

const Land = require("../models/Land");
const { ok, created, fail, paginated, parsePagination, uniqueSlug } = require("../lib/helpers");

// ── Public ────────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { q, status, state, title_type, maxPrice, minPrice } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = { $ne: "sold" };
    if (state) filter.state = new RegExp(state, "i");
    if (title_type) filter.title_type = title_type;
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (q) filter.$text = { $search: q };

    const [data, total] = await Promise.all([
      Land.find(filter).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(perPage).lean(),
      Land.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) { next(err); }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 6);
    const data  = await Land.find({ featured: true, status: { $ne: "sold" } }).sort({ createdAt: -1 }).limit(limit).lean();
    return ok(res, data);
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const land = await Land.findOne({ slug: req.params.slug }).lean();
    if (!land) return fail(res, "Land listing not found", 404);
    Land.findByIdAndUpdate(land._id, { $inc: { views_count: 1 } }).exec();
    return ok(res, land);
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────────────
exports.adminGetAll = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { q, status, state, title_type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (state)  filter.state  = new RegExp(state, "i");
    if (title_type) filter.title_type = title_type;
    if (q) filter.$text = { $search: q };

    const [data, total] = await Promise.all([
      Land.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
      Land.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) { next(err); }
};

exports.adminGetById = async (req, res, next) => {
  try {
    const land = await Land.findById(req.params.id).lean();
    if (!land) return fail(res, "Land listing not found", 404);
    return ok(res, land);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { estate_name } = req.body;
    if (!estate_name) return fail(res, "Estate name is required");
    const slug = await uniqueSlug(Land, estate_name);
    const land = await Land.create({ ...req.body, slug });
    return created(res, land, "Land listing created");
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return fail(res, "Land listing not found", 404);
    if (req.body.estate_name && req.body.estate_name !== land.estate_name) {
      req.body.slug = await uniqueSlug(Land, req.body.estate_name, land._id);
    }
    Object.assign(land, req.body);
    await land.save();
    return ok(res, land, "Land listing updated");
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const land = await Land.findByIdAndDelete(req.params.id);
    if (!land) return fail(res, "Land listing not found", 404);
    return ok(res, { id: req.params.id }, "Land listing deleted");
  } catch (err) { next(err); }
};
