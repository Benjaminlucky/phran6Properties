/**
 * zod request validation on a write route: POST /houses/admin/houses.
 *
 * Two things are under test:
 *   1. Bad input is rejected with 400 and a message naming the offending field.
 *   2. The zod schema doubles as a *write allowlist* — because `z.object()`
 *      strips unknown keys, server-managed fields (_id, slug, views_count,
 *      timestamps) can never be set from the request body.
 *
 * The in-memory mongod and all env overrides are handled by test/setup.js.
 */

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

import app from "../index.js";
import Admin from "../models/Admin.js";
import House from "../models/House.js";

const CREDS = {
  name: "Validation Admin",
  email: "validation-test@example.com",
  password: "sup3r-secret-pw",
};

const ENDPOINT = "/houses/admin/houses";

let cookie;

beforeAll(async () => {
  await mongoose.connection.asPromise();
  await Admin.deleteMany({});
  await House.deleteMany({});

  await Admin.create(CREDS);

  // This route is behind requireAuth, so every case below needs a real cookie.
  const res = await request(app)
    .post("/auth/login")
    .send({ email: CREDS.email, password: CREDS.password });

  expect(res.status).toBe(200);
  cookie = (res.headers["set-cookie"] || []).find((c) => c.startsWith("nr_token="));
  expect(cookie).toBeDefined();
});

// No afterAll teardown needed: test/setup.js disconnects mongoose and stops the
// in-memory mongod, and each test file gets its own fresh instance.

describe("POST /houses/admin/houses — auth gate", () => {
  it("rejects an unauthenticated create with 401", async () => {
    const res = await request(app).post(ENDPOINT).send({ title: "No Cookie House" });
    expect(res.status).toBe(401);
  });
});

describe("POST /houses/admin/houses — validation", () => {
  it("rejects a missing required field with 400 naming the field", async () => {
    const res = await request(app)
      .post(ENDPOINT)
      .set("Cookie", cookie)
      .send({ location: "Lekki", price: 45000000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/title/i);
  });

  it("rejects an empty-string title with 400", async () => {
    const res = await request(app)
      .post(ENDPOINT)
      .set("Cookie", cookie)
      .send({ title: "   " });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title/i);
  });

  it("rejects an invalid enum value with 400 naming the field", async () => {
    const res = await request(app)
      .post(ENDPOINT)
      .set("Cookie", cookie)
      .send({ title: "Bad Status House", status: "not-a-real-status" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/status/i);

    // Nothing should have been persisted.
    expect(await House.countDocuments({ title: "Bad Status House" })).toBe(0);
  });

  it("rejects an invalid category enum with 400", async () => {
    const res = await request(app)
      .post(ENDPOINT)
      .set("Cookie", cookie)
      .send({ title: "Bad Category House", category: "spaceship" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/category/i);
  });
});

describe("POST /houses/admin/houses — happy path + write allowlist", () => {
  it("creates a house from a minimal payload", async () => {
    const res = await request(app)
      .post(ENDPOINT)
      .set("Cookie", cookie)
      .send({ title: "Minimal Payload Villa" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Minimal Payload Villa");
    // slug is server-generated from the title, never taken from the body.
    expect(res.body.data.slug).toBe("minimal-payload-villa");
    // Schema defaults, not client input.
    expect(res.body.data.views_count).toBe(0);
    expect(res.body.data.status).toBe("available");
  });

  it("strips server-managed fields smuggled in via the request body", async () => {
    const forgedId = new mongoose.Types.ObjectId().toString();
    const oldDate = new Date("2000-01-01T00:00:00.000Z").toISOString();

    const res = await request(app)
      .post(ENDPOINT)
      .set("Cookie", cookie)
      .send({
        title: "Allowlist Probe House",
        // none of the below are on houseCreateSchema — all must be dropped
        _id: forgedId,
        __v: 42,
        slug: "attacker-chosen-slug",
        views_count: 99999,
        createdAt: oldDate,
        updatedAt: oldDate,
        totally_made_up_field: "should not survive",
      });

    expect(res.status).toBe(201);

    const body = res.body.data;
    expect(body._id).not.toBe(forgedId);
    expect(mongoose.Types.ObjectId.isValid(body._id)).toBe(true);
    expect(body.views_count).toBe(0);
    expect(body.slug).toBe("allowlist-probe-house");
    expect(body.totally_made_up_field).toBeUndefined();
    expect(new Date(body.createdAt).getUTCFullYear()).toBeGreaterThan(2000);

    // And confirm it that way in the database too, not just in the response.
    const stored = await House.findOne({ title: "Allowlist Probe House" }).lean();
    expect(stored._id.toString()).not.toBe(forgedId);
    expect(stored.views_count).toBe(0);
    expect(stored.slug).toBe("allowlist-probe-house");
    expect(stored.totally_made_up_field).toBeUndefined();
  });

  it("keeps the fields that ARE on the schema", async () => {
    const res = await request(app)
      .post(ENDPOINT)
      .set("Cookie", cookie)
      .send({
        title: "Fully Specified Duplex",
        location: "Lekki Phase 1",
        price: 145000000,
        status: "ready_to_move",
        category: "duplex",
        bedrooms: 4,
        featured: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: "Fully Specified Duplex",
      location: "Lekki Phase 1",
      price: 145000000,
      status: "ready_to_move",
      category: "duplex",
      bedrooms: 4,
      featured: true,
    });
  });
});
