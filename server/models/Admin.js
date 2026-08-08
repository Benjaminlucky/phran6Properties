"use strict";

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  // select:false — never returned by default. Any query that needs to run
  // comparePassword() must opt in with .select("+password").
  password:  { type: String, required: true, minlength: 8, select: false },
  role:      { type: String, enum: ["super_admin", "admin", "editor"], default: "admin" },
  is_active: { type: Boolean, default: true },
  last_login:{ type: Date },
  // ── Per-account login lockout ──────────────────────────────────
  // The IP-based authLimiter can't stop a distributed / low-and-slow
  // credential-stuffing run against one known admin email, so failures
  // are also counted per account. Not select:false — the login handler
  // needs both fields on the .select("+password") lookup.
  failed_login_attempts: { type: Number, default: 0 },
  locked_until:          { type: Date, default: null },
}, { timestamps: true });

// Hash password before save
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never return password
adminSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
