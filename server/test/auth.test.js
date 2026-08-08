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
