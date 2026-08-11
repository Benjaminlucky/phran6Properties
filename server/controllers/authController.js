"use strict";

const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const Admin  = require("../models/Admin");
const { ok, fail } = require("../lib/helpers");
const { sendPasswordResetEmail } = require("../services/email");

const COOKIE_NAME = "nr_token";

// ── Password reset ─────────────────────────────────────────────────
const RESET_TOKEN_BYTES  = 32;            // 256 bits of entropy
const RESET_TTL_MS       = 60 * 60 * 1000; // 1 hour
// Deliberately identical for "no such account", "no token issued",
// "expired", and "wrong token" — same reasoning as login never saying
// whether the email or the password was the wrong half.
const RESET_INVALID_MSG =
  "This reset link is invalid or has expired. Please request a new one.";

const hashResetToken = (raw) =>
  crypto.createHash("sha256").update(String(raw)).digest("hex");

/** Constant-time compare of two hex digests; false (never a throw) on any mismatch. */
function tokenMatches(rawToken, storedHash) {
  if (!storedHash) return false;
  const a = Buffer.from(hashResetToken(rawToken), "utf8");
  const b = Buffer.from(String(storedHash), "utf8");
  // timingSafeEqual throws on unequal lengths; a different length is
  // itself a non-match, so short-circuit rather than let it throw.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ── Per-account login lockout ──────────────────────────────────────
// authLimiter in index.js only rate-limits by IP, which a distributed or
// low-and-slow credential-stuffing run against one known admin email walks
// straight past. These two constants add a second, per-account brake.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Cookie flags, branched on environment.
 *
 * Production: the API (Railway) and the client (Netlify) are on different
 * registrable domains, so the auth cookie is cross-site and MUST be
 * SameSite=None. Browsers reject SameSite=None unless Secure is also set.
 *
 * Development: plain http://localhost would never send a Secure cookie, so
 * fall back to lax + insecure. Do not hardcode either mode.
 */
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
}

function signToken(admin) {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, "Email and password are required");

    // `password` is `select: false` on the schema, so it must be explicitly
    // re-included here or comparePassword() would compare against undefined.
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!admin || !admin.is_active) return fail(res, "Invalid email or password", 401);

    // Locked accounts are rejected before the password is ever checked, so a
    // guess made during the window costs the attacker a 423 and no signal.
    if (admin.locked_until && admin.locked_until.getTime() > Date.now()) {
      const minutesLeft = Math.max(
        1,
        Math.ceil((admin.locked_until.getTime() - Date.now()) / 60000),
      );
      return fail(
        res,
        `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
        423,
      );
    }

    const valid = await admin.comparePassword(password);
    if (!valid) {
      // Count the miss; the Nth one converts the counter into a time lock.
      admin.failed_login_attempts = (admin.failed_login_attempts || 0) + 1;
      if (admin.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
        admin.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        admin.failed_login_attempts = 0;
      }
      await admin.save();
      return fail(res, "Invalid email or password", 401);
    }

    // Success clears both the counter and any expired lock still on record.
    admin.failed_login_attempts = 0;
    admin.locked_until = null;
    admin.last_login = new Date();
    await admin.save();

    const token = signToken(admin);
    const { exp } = jwt.decode(token) || {};
    const expiresAt = exp ? exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;

    // The raw JWT lives ONLY in this httpOnly cookie — never in the response body.
    const opts = cookieOptions();
    res.cookie(COOKIE_NAME, token, {
      ...opts,
      maxAge: Math.max(0, expiresAt - Date.now()),
    });

    return ok(res, {
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      expiresAt,
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
exports.logout = (req, res) => {
  // clearCookie only matches (and therefore only removes) the cookie when
  // path/sameSite/secure line up with how it was originally set.
  const opts = cookieOptions();
  res.clearCookie(COOKIE_NAME, {
    path: opts.path,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
  });
  return ok(res, null, "Logged out successfully");
};

// POST /auth/forgot-password
// Public. Always answers with the same message whether or not the address
// belongs to an account — otherwise this endpoint becomes a free oracle for
// enumerating which emails have admin access.
exports.forgotPassword = async (req, res, next) => {
  const GENERIC_OK =
    "If an account exists for that email, a password reset link has been sent.";
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // Unknown or deactivated account: identical response, no timing tell
    // worth chasing here since the DB lookup already happened.
    if (!admin || !admin.is_active) return ok(res, null, GENERIC_OK);

    const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
    admin.password_reset_token   = hashResetToken(rawToken);
    admin.password_reset_expires = new Date(Date.now() + RESET_TTL_MS);
    // pre("save") only re-hashes when `password` isModified, so writing
    // these two fields cannot double-hash the stored credential.
    await admin.save();

    const base = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const resetUrl =
      `${base}/admin/reset-password` +
      `?token=${rawToken}&email=${encodeURIComponent(admin.email)}`;

    try {
      await sendPasswordResetEmail(admin, resetUrl);
    } catch (err) {
      // sendPasswordResetEmail already swallows its own failures; this is
      // belt-and-braces. A mail outage must never change the response, or
      // it leaks that the account exists.
      console.error("[Auth] Password reset email failed:", err.message);
    }

    return ok(res, null, GENERIC_OK);
  } catch (err) { next(err); }
};

// POST /auth/reset-password
// Public. Consumes a single-use token issued by forgotPassword.
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, token, new_password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() })
      .select("+password_reset_token +password_reset_expires");

    if (
      !admin ||
      !admin.password_reset_token ||
      !admin.password_reset_expires ||
      admin.password_reset_expires.getTime() < Date.now()
    ) {
      return fail(res, RESET_INVALID_MSG, 400);
    }

    if (!tokenMatches(token, admin.password_reset_token)) {
      return fail(res, RESET_INVALID_MSG, 400);
    }

    admin.password = new_password;          // pre("save") hashes it
    admin.password_reset_token   = null;    // single use — burn it
    admin.password_reset_expires = null;
    // Proving control of the account's inbox is a stronger signal than the
    // failed-login counter, and clears the real deadlock of being locked out
    // *and* having forgotten the password.
    admin.failed_login_attempts = 0;
    admin.locked_until = null;
    await admin.save();

    return ok(res, null, "Password reset successfully. You can now sign in.");
  } catch (err) { next(err); }
};

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
