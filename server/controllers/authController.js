"use strict";

const jwt   = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { ok, fail } = require("../lib/helpers");

function signToken(admin) {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );
}

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, "Email and password are required");

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin || !admin.is_active) return fail(res, "Invalid email or password", 401);

    const valid = await admin.comparePassword(password);
    if (!valid) return fail(res, "Invalid email or password", 401);

    admin.last_login = new Date();
    await admin.save();

    const token = signToken(admin);
    return ok(res, {
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    }, "Login successful");
  } catch (err) { next(err); }
};

// GET /auth/me
exports.me = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    return ok(res, admin);
  } catch (err) { next(err); }
};

// GET /auth/verify
exports.verify = (req, res) => ok(res, { valid: true, admin: req.admin });

// POST /auth/logout
exports.logout = (req, res) => ok(res, null, "Logged out successfully");

// GET /setup
exports.setupStatus = async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();
    return ok(res, { setup_required: count === 0 });
  } catch (err) { next(err); }
};

// POST /setup
exports.setupCreate = async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) return fail(res, "Setup already completed", 403);

    const { name, email, password } = req.body;
    if (!name || !email || !password) return fail(res, "Name, email, and password are required");
    if (password.length < 8) return fail(res, "Password must be at least 8 characters");

    const admin = await Admin.create({ name: name.trim(), email, password, role: "super_admin" });
    return ok(res, { admin: admin.toSafeObject() }, "Admin account created", 201);
  } catch (err) {
    if (err.code === 11000) return fail(res, "Email already in use", 409);
    next(err);
  }
};
