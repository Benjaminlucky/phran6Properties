"use strict";

const router = require("express").Router();
const ctrl   = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { z } = require("zod");
const { validateBody, requiredString } = require("../middleware/validate");

// Mirrors the REQUIREMENTS array in client SetupForm/PasswordStrength so the
// browser and the server agree on what counts as a strong password.
const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  token: requiredString("Reset token is required"),
  new_password: strongPassword,
});

router.post("/login",   ctrl.login);
router.get("/me",       requireAuth, ctrl.me);
router.get("/verify",   requireAuth, ctrl.verify);
router.post("/logout",  requireAuth, ctrl.logout);

// Intentionally unauthenticated — the whole point is regaining access
// without a session. Still covered by the authLimiter applied to this
// router at its mount points in index.js.
router.post("/forgot-password", validateBody(forgotPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password",  validateBody(resetPasswordSchema),  ctrl.resetPassword);

module.exports = router;
