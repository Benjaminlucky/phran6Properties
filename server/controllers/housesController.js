"use strict";

const House = require("../models/House");
const { ok, created, fail, paginated, parsePagination, uniqueSlug } = require("../lib/helpers");

exports.getAll = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { q, status, state, category, bedrooms, maxPrice } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (state)    filter.state    = new RegExp(state, "i");
    if (category) filter.category = category;
    if (bedrooms !== undefined) filter.bedrooms = parseInt(bedrooms);
    if (maxPrice) filter.price = { $lte: parseFloat(maxPrice) };
    if (q) filter.$text = { $search: q };

    const [data, total] = await Promise.all([
      House.find(filter).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(perPage).lean(),
      House.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) { next(err); }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 6);
    const data  = await House.find({ featured: true, status: { $nin: ["sold","rented"] } }).sort({ createdAt: -1 }).limit(limit).lean();
    return ok(res, data);
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const house = await House.findOne({ slug: req.params.slug }).lean();
    if (!house) return fail(res, "House listing not found", 404);
    House.findByIdAndUpdate(house._id, { $inc: { views_count: 1 } }).exec();
    return ok(res, house);
  } catch (err) { next(err); }
};

exports.adminGetAll = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { q, status, state, category } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (state)    filter.state    = new RegExp(state, "i");
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const [data, total] = await Promise.all([
      House.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
      House.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) { next(err); }
};

exports.adminGetById = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id).lean();
    if (!house) return fail(res, "House listing not found", 404);
    return ok(res, house);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return fail(res, "Title is required");
    const slug  = await uniqueSlug(House, title);
    const house = await House.create({ ...req.body, slug });
    return created(res, house, "House listing created");
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return fail(res, "House listing not found", 404);
    if (req.body.title && req.body.title !== house.title) {
      req.body.slug = await uniqueSlug(House, req.body.title, house._id);
    }
    Object.assign(house, req.body);
    await house.save();
    return ok(res, house, "House listing updated");
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const house = await House.findByIdAndDelete(req.params.id);
    if (!house) return fail(res, "House listing not found", 404);
    return ok(res, { id: req.params.id }, "House listing deleted");
  } catch (err) { next(err); }
};
