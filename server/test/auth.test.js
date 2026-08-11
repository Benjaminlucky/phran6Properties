/**
 * Auth flow, end-to-end against an ephemeral in-memory MongoDB.
 *
 * Focus: the recent move of the JWT out of the JSON response body and into an
 * httpOnly `nr_token` cookie. The point of these tests is to lock that in --
 * the token must never reappear in a response body.
 *
 * The in-memory mongod and all env overrides are handled by test/setup.js,
 * which vitest runs before this file's imports are evaluated.
 */

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import crypto from "node:crypto";

import app from "../index.js";
import Admin from "../models/Admin.js";

const CREDS = {
  name: "Test Admin",
  email: "auth-test@example.com",
  password: "sup3r-secret-pw",
};

/** Pull a single named cookie's full `Set-Cookie` string off a response. */
function getSetCookie(res, name) {
  const jar = res.headers["set-cookie"] || [];
  return jar.find((c) => c.startsWith(`${name}=`));
}

/** Log in and return the raw cookie header value to replay on later requests. */
async function login(password = CREDS.password) {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: CREDS.email, password });
  return { res, cookie: getSetCookie(res, "nr_token") };
}

beforeAll(async () => {
  // index.js kicks off connectDB() at import time; wait for it to land before
  // seeding, so the seed write isn't just sitting in mongoose's buffer.
  await mongoose.connection.asPromise();
  await Admin.deleteMany({});

  // Created through the model (not insertMany) so the pre("save") hook runs and
  // the stored password is a real bcrypt hash, exactly like production.
  await Admin.create(CREDS);
});

// No afterAll teardown needed: test/setup.js disconnects mongoose and stops the
// in-memory mongod, and each test file gets its own fresh instance.

describe("POST /auth/login", () => {
  it("returns 200 and sets an httpOnly nr_token cookie on valid credentials", async () => {
    const { res, cookie } = await login();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(CREDS.email);

    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\//i);
  });

  it("never puts the token in the response body", async () => {
    const { res, cookie } = await login();

    expect(res.body.data.token).toBeUndefined();
    expect(res.body.token).toBeUndefined();
    expect(res.body.data.user.token).toBeUndefined();

    // Stronger check: the actual JWT from the cookie must not appear anywhere
    // in the serialized body.
    const jwtFromCookie = cookie.split(";")[0].split("=")[1];
    expect(jwtFromCookie.length).toBeGreaterThan(20);
    expect(JSON.stringify(res.body)).not.toContain(jwtFromCookie);
  });

  it("rejects a wrong password with 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: CREDS.email, password: "definitely-not-the-password" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(getSetCookie(res, "nr_token")).toBeUndefined();
  });

  it("rejects an unknown email with 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: CREDS.password });

    expect(res.status).toBe(401);
  });
});

describe("per-account login lockout", () => {
  // A dedicated account, separate from CREDS, so its failed-attempt counter
  // can't be polluted by (or bleed into) the other tests in this file.
  const LOCK_CREDS = {
    name: "Lockout Test Admin",
    email: "lockout-test@example.com",
    password: "sup3r-secret-pw",
  };

  beforeAll(async () => {
    await Admin.create(LOCK_CREDS);
  });

  it("locks the account after 5 failed attempts, even with the correct password on the 6th try", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: LOCK_CREDS.email, password: "wrong-password" });
      expect(res.status).toBe(401);
    }

    // The 6th attempt uses the CORRECT password — if the lock weren't
    // enforced, this would succeed with 200.
    const res = await request(app)
      .post("/auth/login")
      .send({ email: LOCK_CREDS.email, password: LOCK_CREDS.password });

    expect(res.status).toBe(423);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/too many failed attempts/i);
    expect(getSetCookie(res, "nr_token")).toBeUndefined();
  });

  it("does not lock out a different account", async () => {
    // CREDS (the main test admin) had exactly one prior failed attempt from
    // an earlier test in this file — nowhere near the threshold — so a
    // correct-password login must still succeed normally.
    const { res } = await login();
    expect(res.status).toBe(200);
  });
});

describe("GET /auth/me", () => {
  it("returns 401 without a cookie or Authorization header", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns the admin identity when the login cookie is replayed", async () => {
    const { cookie } = await login();

    const res = await request(app).get("/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(CREDS.email);
    expect(res.body.data.name).toBe(CREDS.name);
    expect(res.body.data.role).toBe("admin");
  });

  it("never leaks the password hash", async () => {
    const { cookie } = await login();
    const res = await request(app).get("/auth/me").set("Cookie", cookie);

    const stored = await Admin.findOne({ email: CREDS.email }).select("+password");
    const body = JSON.stringify(res.body);

    expect(res.body.data.password).toBeUndefined();
    expect(body).not.toContain(stored.password);
    expect(body).not.toContain(CREDS.password);
    expect(body).not.toMatch(/\$2[aby]\$/); // no bcrypt hash of any flavour
  });
});

describe("POST /auth/logout", () => {
  it("returns 200 and expires the nr_token cookie", async () => {
    const { cookie } = await login();

    const res = await request(app).post("/auth/logout").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cleared = getSetCookie(res, "nr_token");
    expect(cleared).toBeDefined();
    // clearCookie() blanks the value and back-dates the expiry.
    expect(cleared).toMatch(/^nr_token=;/);
    expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970/i);
  });

  it("is itself an authenticated route — 401 without a cookie", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(401);
  });
});

describe("forgot-password / reset-password", () => {
  // The generic answer the forgot-password endpoint must give for BOTH a real
  // and a nonexistent address — anything else enumerates admin accounts.
  const GENERIC_OK =
    "If an account exists for that email, a password reset link has been sent.";
  const INVALID_MSG =
    "This reset link is invalid or has expired. Please request a new one.";

  const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");

  /**
   * Seed a reset token straight onto an admin. The HTTP flow only ever emails
   * the raw token (and no mail goes out in tests — RESEND_API_KEY is unset),
   * and the DB stores nothing but its hash, so the raw value can't be
   * recovered from either. Minting a known raw token here and storing its hash
   * exercises exactly the same verification path resetPassword runs in prod.
   */
  async function seedResetToken(email, { expiresAt = new Date(Date.now() + 3600e3) } = {}) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    await Admin.updateOne(
      { email },
      { $set: { password_reset_token: sha256(rawToken), password_reset_expires: expiresAt } },
    );
    return rawToken;
  }

  /** Fresh, isolated admin per test so token/lockout state can't bleed. */
  async function makeAdmin(suffix, extra = {}) {
    const email = `reset-${suffix}@example.com`;
    await Admin.deleteOne({ email });
    const admin = await Admin.create({
      name: "Reset Test Admin",
      email,
      password: "Original-pw1",
      ...extra,
    });
    return admin;
  }

  describe("POST /auth/forgot-password", () => {
    it("returns 200 with the generic message for a real account", async () => {
      await makeAdmin("known");

      const res = await request(app)
        .post("/auth/forgot-password")
        .send({ email: "reset-known@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(GENERIC_OK);
    });

    it("stores only a hash of the token, never anything replayable in the response", async () => {
      await makeAdmin("hashed");

      const res = await request(app)
        .post("/auth/forgot-password")
        .send({ email: "reset-hashed@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();

      const stored = await Admin.findOne({ email: "reset-hashed@example.com" })
        .select("+password_reset_token +password_reset_expires");

      // A sha256 hex digest, and an expiry roughly an hour out.
      expect(stored.password_reset_token).toMatch(/^[0-9a-f]{64}$/);
      expect(stored.password_reset_expires.getTime()).toBeGreaterThan(Date.now() + 55 * 60e3);
      expect(stored.password_reset_expires.getTime()).toBeLessThan(Date.now() + 65 * 60e3);
      // Whatever the hash is, it must not have travelled back to the client.
      expect(JSON.stringify(res.body)).not.toContain(stored.password_reset_token);
    });

    it("does not leak the reset fields on an ordinary query", async () => {
      await makeAdmin("select-false");
      await request(app)
        .post("/auth/forgot-password")
        .send({ email: "reset-select-false@example.com" });

      const plain = await Admin.findOne({ email: "reset-select-false@example.com" });
      expect(plain.password_reset_token).toBeUndefined();
      expect(plain.password_reset_expires).toBeUndefined();
    });

    it("returns the SAME generic message for an email with no account", async () => {
      const res = await request(app)
        .post("/auth/forgot-password")
        .send({ email: "definitely-nobody@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(GENERIC_OK); // byte-identical to the real-account case
    });

    it("rejects a malformed email with 400", async () => {
      const res = await request(app)
        .post("/auth/forgot-password")
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/valid email/i);
    });
  });

  describe("POST /auth/reset-password", () => {
    it("accepts a valid token, sets the new password, and burns the token", async () => {
      const email = "reset-happy@example.com";
      await makeAdmin("happy");
      const rawToken = await seedResetToken(email);

      const res = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "Brand-New-pw1" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/password reset successfully/i);

      // The new password actually works end-to-end.
      const login = await request(app)
        .post("/auth/login")
        .send({ email, password: "Brand-New-pw1" });
      expect(login.status).toBe(200);
      expect(getSetCookie(login, "nr_token")).toBeDefined();

      // …and the old one no longer does.
      const old = await request(app)
        .post("/auth/login")
        .send({ email, password: "Original-pw1" });
      expect(old.status).toBe(401);

      // Single use: the token is cleared, so replaying it fails.
      const stored = await Admin.findOne({ email })
        .select("+password_reset_token +password_reset_expires");
      expect(stored.password_reset_token).toBeNull();
      expect(stored.password_reset_expires).toBeNull();

      const replay = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "Third-Password1" });
      expect(replay.status).toBe(400);
      expect(replay.body.message).toBe(INVALID_MSG);
    });

    it("rejects a wrong token with 400 and the generic message", async () => {
      const email = "reset-wrong@example.com";
      await makeAdmin("wrong");
      await seedResetToken(email);

      const res = await request(app)
        .post("/auth/reset-password")
        .send({
          email,
          token: crypto.randomBytes(32).toString("hex"), // right shape, wrong value
          new_password: "Brand-New-pw1",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(INVALID_MSG);

      // Password untouched.
      const login = await request(app).post("/auth/login").send({ email, password: "Original-pw1" });
      expect(login.status).toBe(200);
    });

    it("rejects a malformed token of the wrong length without throwing", async () => {
      const email = "reset-malformed@example.com";
      await makeAdmin("malformed");
      await seedResetToken(email);

      const res = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: "short", new_password: "Brand-New-pw1" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(INVALID_MSG);
    });

    it("rejects an expired token with 400", async () => {
      const email = "reset-expired@example.com";
      await makeAdmin("expired");
      const rawToken = await seedResetToken(email, { expiresAt: new Date(Date.now() - 60e3) });

      const res = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "Brand-New-pw1" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(INVALID_MSG);
    });

    it("rejects a reset for an account that never requested one", async () => {
      const email = "reset-untokened@example.com";
      await makeAdmin("untokened");

      const res = await request(app)
        .post("/auth/reset-password")
        .send({
          email,
          token: crypto.randomBytes(32).toString("hex"),
          new_password: "Brand-New-pw1",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(INVALID_MSG);
    });

    it("rejects an unknown email with the same generic 400", async () => {
      const res = await request(app)
        .post("/auth/reset-password")
        .send({
          email: "definitely-nobody@example.com",
          token: crypto.randomBytes(32).toString("hex"),
          new_password: "Brand-New-pw1",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(INVALID_MSG);
    });

    it("rejects a weak new password with 400, naming the failed requirement", async () => {
      const email = "reset-weak@example.com";
      await makeAdmin("weak");
      const rawToken = await seedResetToken(email);

      const tooShort = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "Ab1" });
      expect(tooShort.status).toBe(400);
      expect(tooShort.body.message).toMatch(/at least 8 characters/i);

      const noUpper = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "all-lower1" });
      expect(noUpper.status).toBe(400);
      expect(noUpper.body.message).toMatch(/uppercase/i);

      const noNumber = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "NoDigitsHere" });
      expect(noNumber.status).toBe(400);
      expect(noNumber.body.message).toMatch(/number/i);

      // Rejected at the schema, so the token survives for a real attempt.
      const good = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "Strong-Enough1" });
      expect(good.status).toBe(200);
    });

    it("clears an active lockout — a locked-out admin can reset and sign straight in", async () => {
      const email = "reset-locked@example.com";
      await makeAdmin("locked", {
        failed_login_attempts: 5,
        locked_until: new Date(Date.now() + 15 * 60e3),
      });

      // Precondition: the account really is locked.
      const blocked = await request(app)
        .post("/auth/login")
        .send({ email, password: "Original-pw1" });
      expect(blocked.status).toBe(423);

      const rawToken = await seedResetToken(email);
      const reset = await request(app)
        .post("/auth/reset-password")
        .send({ email, token: rawToken, new_password: "Unlocked-Now1" });
      expect(reset.status).toBe(200);

      // No 423 — the reset lifted the lock as well as changing the password.
      const login = await request(app)
        .post("/auth/login")
        .send({ email, password: "Unlocked-Now1" });
      expect(login.status).toBe(200);
      expect(getSetCookie(login, "nr_token")).toBeDefined();

      const stored = await Admin.findOne({ email });
      expect(stored.locked_until).toBeNull();
      expect(stored.failed_login_attempts).toBe(0);
    });
  });
});
