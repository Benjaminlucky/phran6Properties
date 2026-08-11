/**
 * Global test setup — runs once per test file, BEFORE that file's imports are
 * evaluated (this is why it is a vitest `setupFiles` entry and not a
 * `beforeAll` inside the test files).
 *
 * Why the ordering matters: `server/index.js` calls `connectDB()` at module
 * load time, and `connectDB()` reads `process.env.MONGODB_URI`. So the
 * in-memory Mongo instance has to exist and MONGODB_URI has to be rewritten
 * before anything requires the app.
 *
 * Safety note: `index.js` calls `require("dotenv").config()`, and dotenv does
 * NOT override variables that are already present in `process.env`. Every var
 * assigned below therefore *wins* over `server/.env`, which is what keeps the
 * suite off the real production MONGODB_URI, the real Cloudinary account, and
 * the real revalidation webhook.
 */

import { afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// ── Ephemeral MongoDB ─────────────────────────────────────────────
const mongod = await MongoMemoryServer.create();

process.env.MONGODB_URI = mongod.getUri();
process.env.DB_NAME = "phran6_test";

// ── Deterministic, throwaway app config ───────────────────────────
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-jwt-secret-do-not-use-in-production";
process.env.JWT_EXPIRES_IN = "1h";

// Empty secret => lib/revalidate.js returns early, so no HTTP call is made to
// the Next.js frontend during tests.
process.env.REVALIDATE_SECRET = "";
process.env.FRONTEND_URL = "http://localhost:3000";

// Same idea for outbound mail: an empty key makes services/email.js throw
// inside its own try/catch, so no HTTP request ever leaves the suite. Without
// this, the real RESEND_API_KEY from server/.env leaks in and every
// forgot-password test round-trips to Resend's API. This also exercises the
// path that matters most — a send failure must NOT change the response.
process.env.RESEND_API_KEY = "";

// Dummy Cloudinary creds so config/cloudinary.js never picks up real ones.
// No test uploads a file, so these are never actually exercised.
process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";

// Nothing should call app.listen() (index.js guards it behind
// `require.main === module`), but pin a harmless port just in case.
process.env.PORT = "0";

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
