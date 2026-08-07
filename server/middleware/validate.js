"use strict";

/**
 * Request-body validation built on zod.
 *
 * Two ways to use it:
 *
 *   1. As Express middleware, for routes whose body is already in its
 *      final shape when it reaches the handler:
 *
 *        router.post("/thing", requireAuth, validateBody(thingSchema), handler)
 *
 *   2. Inline inside a handler, for routes that must first normalize a
 *      multipart/FormData body (JSON-parsing stringified arrays, folding
 *      Cloudinary upload results into the payload, …) before the object
 *      is meaningful:
 *
 *        const parsed = thingSchema.safeParse(body);
 *        if (!parsed.success) return fail(res, formatIssues(parsed.error), 400);
 *
 * Either way the parsed result is the authoritative payload: zod objects
 * strip unknown keys, so a schema doubles as a write allowlist and no
 * hand-maintained denylist of immutable fields is needed.
 */

const { z } = require("zod");
const { fail } = require("../lib/helpers");

/** Turn a ZodError into a single human-readable string. */
function formatIssues(error) {
  return error.issues
    .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
    .join("; ");
}

/** Express middleware: validate + replace req.body with the parsed data. */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return fail(res, formatIssues(result.error), 400);
    }
    req.body = result.data;
    next();
  };
}

// ── Shared field helpers ──────────────────────────────────────────
// Admin forms submit "" for every untouched optional input, and
// multipart/FormData turns every value into a string. These helpers
// normalize both so a blank input is simply omitted rather than
// failing a type/enum check.

const blankToUndefined = (v) => (v === "" || v === null ? undefined : v);

const toBoolean = (v) => {
  if (v === "" || v === null) return undefined;
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
};

const optionalString = z.string().optional();
const requiredString = (message) => z.string().trim().min(1, message);
const optionalNumber = z.preprocess(
  blankToUndefined,
  z.coerce.number().optional(),
);
const optionalBoolean = z.preprocess(toBoolean, z.boolean().optional());
const optionalEnum = (values) =>
  z.preprocess(blankToUndefined, z.enum(values).optional());
const optionalStringArray = z.preprocess(
  blankToUndefined,
  z.array(z.string()).optional(),
);
const optionalDate = z.preprocess(blankToUndefined, z.coerce.date().optional());
/** A 24-char hex Mongo ObjectId, as a string. */
const optionalObjectId = z.preprocess(
  blankToUndefined,
  z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "must be a valid id")
    .optional(),
);

module.exports = {
  validateBody,
  formatIssues,
  blankToUndefined,
  optionalString,
  requiredString,
  optionalNumber,
  optionalBoolean,
  optionalEnum,
  optionalStringArray,
  optionalDate,
  optionalObjectId,
};
