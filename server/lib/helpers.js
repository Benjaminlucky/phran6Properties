"use strict";

const slugifyLib = require("slugify");

// ── Response helpers ──────────────────────────────────────────────
const ok = (res, data, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = "Created") =>
  ok(res, data, message, 201);

const fail = (res, message = "Error", status = 400) =>
  res.status(status).json({ success: false, message });

const paginated = (res, { data, total, page, perPage }) =>
  res.json({ success: true, message: "Success", data, total, page, perPage, totalPages: Math.ceil(total / perPage) });

// ── Pagination ────────────────────────────────────────────────────
function parsePagination(q) {
  const page    = Math.max(1, parseInt(q.page) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(q.perPage || q.per_page) || 12));
  const skip    = (page - 1) * perPage;
  return { page, perPage, skip };
}

// ── Slug generation ───────────────────────────────────────────────
function makeSlug(text) {
  return slugifyLib(text, { lower: true, strict: true, trim: true });
}

async function uniqueSlug(Model, baseText, excludeId = null) {
  const base = makeSlug(baseText);
  let slug = base, attempt = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.exists(query);
    if (!exists) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

module.exports = { ok, created, fail, paginated, parsePagination, makeSlug, uniqueSlug };
