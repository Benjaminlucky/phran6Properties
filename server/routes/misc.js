"use strict";

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const escapeRegex = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
const {
  ok,
  created,
  fail,
  paginated,
  parsePagination,
} = require("../lib/helpers");
const { requireAuth, requireSuperAdmin } = require("../middleware/auth");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const { Enquiry, Setting, Media } = require("../models/Misc");
const { PopularArea, Partner } = require("../models/Homepage");
const Admin = require("../models/Admin");
const Land = require("../models/Land");
const House = require("../models/House");
const { BlogPost } = require("../models/Blog");
const { sendEnquiryNotification } = require("../services/email");
const { revalidate } = require("../lib/revalidate");

// ══════════════════════════════════════════════════════════════════
// ENQUIRIES
// ══════════════════════════════════════════════════════════════════

// POST /enquiries — public submission
router.post("/enquiries", async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      inquiry_type,
      property_type,
      budget,
      preferred_location,
      message,
      listing_type,
      listing_id,
      source,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────
    if (!first_name?.trim()) {
      return fail(res, "First name is required");
    }
    if (!phone?.trim()) {
      return fail(res, "Phone number is required");
    }
    // message is optional from the hero form (additional_info maps here)
    // but we store something meaningful either way
    const resolvedMessage =
      message?.trim() ||
      [
        inquiry_type && `Inquiry type: ${inquiry_type}`,
        property_type && `Property type: ${property_type}`,
        budget && `Budget: ${budget}`,
        preferred_location && `Location: ${preferred_location}`,
      ]
        .filter(Boolean)
        .join("\n") ||
      "No additional details provided.";

    // ── Save to DB ────────────────────────────────────────────────
    const doc = await Enquiry.create({
      first_name: first_name.trim(),
      last_name: last_name?.trim() || "",
      email: email?.toLowerCase().trim() || "",
      phone: phone.trim(),
      inquiry_type: inquiry_type?.trim() || "",
      // Store hero-form extras as part of the enquiry
      property_type: property_type?.trim() || "",
      budget: budget?.trim() || "",
      preferred_location: preferred_location?.trim() || "",
      message: resolvedMessage,
      listing_type: listing_type || "general",
      listing_id:
        listing_id && mongoose.isValidObjectId(listing_id)
          ? listing_id
          : undefined,
      source: source || "website",
      status: "new",
    });

    // ── Email notification — fire-and-forget ──────────────────────
    setImmediate(async () => {
      try {
        const settingDocs = await Setting.find({
          key: { $in: ["notification_email", "email_from", "site_name"] },
        }).lean();
        const settings = settingDocs.reduce((acc, s) => {
          acc[s.key] = s.value;
          return acc;
        }, {});

        await sendEnquiryNotification(
          {
            ...doc.toObject(),
            property_type: doc.property_type || property_type,
            budget: doc.budget || budget,
            preferred_location: doc.preferred_location || preferred_location,
          },
          settings,
        );
      } catch (e) {
        console.error("[Enquiry] Post-save email error:", e.message);
      }
    });

    return created(res, doc, "Enquiry submitted successfully");
  } catch (err) {
    next(err);
  }
});

// GET /admin/enquiries
router.get("/admin/enquiries", requireAuth, async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { status, q } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (q) {
      const re = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [
        { first_name: re },
        { last_name: re },
        { email: re },
        { phone: re },
        { message: re },
      ];
    }

    const [data, total, newCount] = await Promise.all([
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Enquiry.countDocuments(filter),
      Enquiry.countDocuments({ status: "new" }),
    ]);

    return res.json({
      success: true,
      message: "Success",
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      newCount,
    });
  } catch (err) {
    next(err);
  }
});

// GET /admin/enquiries/:id
router.get("/admin/enquiries/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Enquiry.findById(req.params.id).lean();
    if (!doc) return fail(res, "Enquiry not found", 404);
    return ok(res, doc);
  } catch (err) {
    next(err);
  }
});

// PUT /admin/enquiries/:id — update status / notes
router.put("/admin/enquiries/:id", requireAuth, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const doc = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(notes !== undefined && { notes }) },
      { new: true },
    ).lean();
    if (!doc) return fail(res, "Enquiry not found", 404);
    return ok(res, doc, "Enquiry updated");
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/enquiries/:id
router.delete("/admin/enquiries/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Enquiry.findByIdAndDelete(req.params.id);
    if (!doc) return fail(res, "Enquiry not found", 404);
    return ok(res, null, "Enquiry deleted");
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ABOUT PAGE
// ══════════════════════════════════════════════════════════════════

// GET /about — public, ISR-cached by Next.js
router.get("/about", async (req, res, next) => {
  try {
    const doc = await Setting.findOne({ key: "about_page" }).lean();
    const data = doc?.value ? JSON.parse(doc.value) : {};
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

// PUT /admin/about — protected, saves the full about page JSON blob
router.put("/admin/about", requireAuth, async (req, res, next) => {
  try {
    const value = JSON.stringify(req.body);
    await Setting.findOneAndUpdate(
      { key: "about_page" },
      { key: "about_page", value, group_name: "about" },
      { upsert: true, new: true },
    );
    revalidate(["/about"]);
    return ok(res, null, "About page saved");
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════

// GET /settings — public
router.get("/settings", async (req, res, next) => {
  try {
    const docs = await Setting.find({ group_name: "general" }).lean();
    const settings = docs.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    return ok(res, { settings });
  } catch (err) {
    next(err);
  }
});

// GET /admin/settings
router.get("/admin/settings", requireAuth, async (req, res, next) => {
  try {
    const docs = await Setting.find({}).sort({ group_name: 1, key: 1 }).lean();
    const settings = docs.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    return ok(res, { settings, rows: docs });
  } catch (err) {
    next(err);
  }
});

// PUT /admin/settings
router.put("/admin/settings", requireAuth, async (req, res, next) => {
  try {
    const updates = req.body; // { key: value, ... }
    const ops = Object.entries(updates).map(([key, value]) =>
      Setting.findOneAndUpdate(
        { key },
        { key, value: value ?? "", group_name: "general" },
        { upsert: true, new: true },
      ),
    );
    await Promise.all(ops);
    return ok(res, null, "Settings saved");
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// MEDIA
// ══════════════════════════════════════════════════════════════════

// GET /admin/media
router.get("/admin/media", requireAuth, async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const { folder } = req.query;
    const filter = folder ? { folder } : {};
    const [data, total] = await Promise.all([
      Media.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Media.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
});

// POST /admin/media — upload via Cloudinary
// FIX: added uploadToCloudinary middleware so req.file.path is populated
// before we try to save it to MongoDB (was causing file_path required error)
router.post(
  "/admin/media",
  requireAuth,
  upload.single("file"),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      if (!req.file) return fail(res, "No file uploaded");

      const folder = req.uploadFolder || req.body.folder || "general";
      const doc = await Media.create({
        filename: req.file.filename || req.file.originalname,
        original_name: req.file.originalname,
        file_path: req.file.path, // Cloudinary HTTPS URL (set by uploadToCloudinary)
        public_id: req.file.filename, // Cloudinary public_id (set by uploadToCloudinary)
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        folder,
        uploaded_by: req.admin?._id,
      });

      return created(res, doc, "File uploaded");
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/media/:id
router.put("/admin/media/:id", requireAuth, async (req, res, next) => {
  try {
    const { alt_text } = req.body;
    const doc = await Media.findByIdAndUpdate(
      req.params.id,
      { alt_text },
      { new: true },
    ).lean();
    if (!doc) return fail(res, "Media not found", 404);
    return ok(res, doc, "Updated");
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/media/:id
router.delete("/admin/media/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Media.findById(req.params.id);
    if (!doc) return fail(res, "Media not found", 404);

    if (doc.public_id) {
      try {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(doc.public_id);
      } catch (e) {
        console.warn("[Media] Cloudinary delete failed:", e.message);
      }
    }

    await doc.deleteOne();
    return ok(res, null, "File deleted");
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════════════

router.get("/admin/stats", requireAuth, async (req, res, next) => {
  try {
    const [
      landsCount,
      housesCount,
      blogCount,
      enquiriesCount,
      newEnquiries,
      recentEnquiries,
      topLands,
    ] = await Promise.all([
      Land.countDocuments({}),
      House.countDocuments({}),
      BlogPost.countDocuments({ status: "published" }),
      Enquiry.countDocuments({}),
      Enquiry.countDocuments({ status: "new" }),
      Enquiry.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("first_name last_name phone inquiry_type status createdAt")
        .lean(),
      Land.find({})
        .sort({ views_count: -1 })
        .limit(5)
        .select("estate_name slug views_count")
        .lean(),
    ]);

    // Monthly enquiries — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRaw = await Enquiry.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthly_enquiries = monthlyRaw.map((m) => ({
      month: monthNames[parseInt(m._id.split("-")[1]) - 1],
      count: m.count,
    }));

    return ok(res, {
      counts: {
        lands: landsCount,
        houses: housesCount,
        blog_posts: blogCount,
        enquiries: enquiriesCount,
        new_enquiries: newEnquiries,
      },
      monthly_enquiries,
      recent_enquiries: recentEnquiries,
      top_lands: topLands,
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// PUBLIC STATS  — GET /stats/public
// ══════════════════════════════════════════════════════════════════

router.get("/stats/public", async (req, res, next) => {
  try {
    const [landsCount, housesCount, enquiriesCount, landStates, houseStates] =
      await Promise.all([
        Land.countDocuments({ status: { $ne: "coming_soon" } }),
        House.countDocuments({ status: { $ne: "coming_soon" } }),
        Enquiry.countDocuments({}),
        Land.distinct("state", { state: { $nin: ["", null] } }),
        House.distinct("state", { state: { $nin: ["", null] } }),
      ]);

    const stateSet = new Set([
      ...landStates.filter(Boolean),
      ...houseStates.filter(Boolean),
    ]);

    return ok(res, {
      total_listings: landsCount + housesCount,
      total_lands: landsCount,
      total_houses: housesCount,
      total_enquiries: enquiriesCount,
      states_covered: stateSet.size,
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════════════

router.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return ok(res, { lands: [], houses: [] });

    const re = new RegExp(escapeRegex(q.trim()), "i");

    const [lands, houses] = await Promise.all([
      Land.find({
        status: "available",
        $or: [{ estate_name: re }, { location: re }, { state: re }],
      })
        .select("estate_name slug location state price feature_image")
        .limit(5)
        .lean(),
      House.find({
        status: "available",
        $or: [{ title: re }, { location: re }, { state: re }],
      })
        .select("title slug location state price feature_image bedrooms")
        .limit(5)
        .lean(),
    ]);

    return ok(res, { lands, houses });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// TEAM
// ══════════════════════════════════════════════════════════════════

// GET /admin/team
router.get("/admin/team", requireAuth, async (req, res, next) => {
  try {
    const members = await Admin.find({}).sort({ createdAt: 1 }).lean();
    return ok(res, members);
  } catch (err) {
    next(err);
  }
});

// GET /admin/team/:id
router.get("/admin/team/:id", requireAuth, async (req, res, next) => {
  try {
    const member = await Admin.findById(req.params.id).lean();
    if (!member) return fail(res, "Team member not found", 404);
    return ok(res, member);
  } catch (err) {
    next(err);
  }
});

// POST /admin/team — super admin only
router.post(
  "/admin/team",
  requireAuth,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const {
        first_name,
        last_name,
        name,
        email,
        password,
        role = "admin",
      } = req.body;

      const resolvedName =
        name?.trim() ||
        [first_name?.trim(), last_name?.trim()].filter(Boolean).join(" ");

      if (!resolvedName || !email || !password) {
        return fail(res, "Name, email, and password are required");
      }
      const existing = await Admin.findOne({ email: email.toLowerCase() });
      if (existing) return fail(res, "Email already in use", 409);

      const member = await Admin.create({
        name: resolvedName,
        email,
        password,
        role,
      });
      return created(res, member.toSafeObject(), "Team member created");
    } catch (err) {
      if (err.code === 11000) return fail(res, "Email already in use", 409);
      next(err);
    }
  },
);

// PUT /admin/team/:id
router.put("/admin/team/:id", requireAuth, async (req, res, next) => {
  try {
    const { first_name, last_name, name, email, role, phone, bio } = req.body;

    const resolvedName =
      name?.trim() ||
      [first_name?.trim(), last_name?.trim()].filter(Boolean).join(" ") ||
      undefined;

    const update = {};
    if (resolvedName) update.name = resolvedName;
    if (email !== undefined) update.email = email;
    if (role !== undefined) update.role = role;
    if (phone !== undefined) update.phone = phone;
    if (bio !== undefined) update.bio = bio;

    const member = await Admin.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!member) return fail(res, "Team member not found", 404);
    return ok(res, member, "Updated");
  } catch (err) {
    next(err);
  }
});

// PUT /admin/team/:id/password
router.put("/admin/team/:id/password", requireAuth, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const member = await Admin.findById(req.params.id);
    if (!member) return fail(res, "Not found", 404);

    const isSelf = String(req.admin._id) === String(member._id);
    const isSuper = req.admin.role === "super_admin";
    if (!isSelf && !isSuper) return fail(res, "Forbidden", 403);

    if (isSelf && !isSuper) {
      const valid = await member.comparePassword(current_password);
      if (!valid) return fail(res, "Current password is incorrect", 401);
    }

    member.password = new_password;
    await member.save();
    return ok(res, null, "Password updated");
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/team/:id — super admin only
router.delete(
  "/admin/team/:id",
  requireAuth,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      if (String(req.admin._id) === String(req.params.id)) {
        return fail(res, "You cannot delete your own account");
      }
      const member = await Admin.findByIdAndDelete(req.params.id);
      if (!member) return fail(res, "Team member not found", 404);
      return ok(res, null, "Team member removed");
    } catch (err) {
      next(err);
    }
  },
);

// ══════════════════════════════════════════════════════════════════
// POPULAR AREAS
// ══════════════════════════════════════════════════════════════════

// GET /popular-areas — public, returns only active areas ordered by sort_order
router.get("/popular-areas", async (req, res, next) => {
  try {
    const areas = await PopularArea.find({ is_active: true })
      .sort({ sort_order: 1, createdAt: 1 })
      .lean();
    return ok(res, areas);
  } catch (err) {
    next(err);
  }
});

// GET /admin/popular-areas — all areas including inactive
router.get("/admin/popular-areas", requireAuth, async (req, res, next) => {
  try {
    const areas = await PopularArea.find({})
      .sort({ sort_order: 1, createdAt: 1 })
      .lean();
    return ok(res, areas);
  } catch (err) {
    next(err);
  }
});

// POST /admin/popular-areas
// FIX: added uploadToCloudinary so image is actually sent to Cloudinary
router.post(
  "/admin/popular-areas",
  requireAuth,
  upload.single("image"),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const { name, location, count, link_path, sort_order, is_active } =
        req.body;
      if (!name?.trim()) return fail(res, "Name is required");
      if (!location?.trim()) return fail(res, "Location is required");

      const image_url = req.file ? req.file.path : req.body.image_url || "";

      const area = await PopularArea.create({
        name: name.trim(),
        location: location.trim(),
        count: count?.trim() || "",
        link_path: link_path?.trim() || "",
        image_url,
        sort_order: parseInt(sort_order) || 0,
        is_active: is_active !== "false" && is_active !== false,
      });

      revalidate(["/"]);
      return created(res, area, "Popular area created");
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/popular-areas/:id
// FIX: added uploadToCloudinary so image is actually sent to Cloudinary
router.put(
  "/admin/popular-areas/:id",
  requireAuth,
  upload.single("image"),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const { name, location, count, link_path, sort_order, is_active } =
        req.body;

      const update = {};
      if (name !== undefined) update.name = name.trim();
      if (location !== undefined) update.location = location.trim();
      if (count !== undefined) update.count = count.trim();
      if (link_path !== undefined) update.link_path = link_path.trim();
      if (sort_order !== undefined)
        update.sort_order = parseInt(sort_order) || 0;
      if (is_active !== undefined)
        update.is_active = is_active !== "false" && is_active !== false;
      if (req.file) update.image_url = req.file.path;
      else if (req.body.image_url !== undefined)
        update.image_url = req.body.image_url;

      const area = await PopularArea.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      }).lean();
      if (!area) return fail(res, "Area not found", 404);

      revalidate(["/"]);
      return ok(res, area, "Popular area updated");
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /admin/popular-areas/:id
router.delete(
  "/admin/popular-areas/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      const area = await PopularArea.findByIdAndDelete(req.params.id);
      if (!area) return fail(res, "Area not found", 404);
      revalidate(["/"]);
      return ok(res, null, "Popular area deleted");
    } catch (err) {
      next(err);
    }
  },
);

// ══════════════════════════════════════════════════════════════════
// PARTNERS
// ══════════════════════════════════════════════════════════════════

// GET /partners — public, active only
router.get("/partners", async (req, res, next) => {
  try {
    const partners = await Partner.find({ is_active: true })
      .sort({ sort_order: 1, createdAt: 1 })
      .lean();
    return ok(res, partners);
  } catch (err) {
    next(err);
  }
});

// GET /admin/partners — all partners
router.get("/admin/partners", requireAuth, async (req, res, next) => {
  try {
    const partners = await Partner.find({})
      .sort({ sort_order: 1, createdAt: 1 })
      .lean();
    return ok(res, partners);
  } catch (err) {
    next(err);
  }
});

// POST /admin/partners
// FIX: added uploadToCloudinary so logo is actually sent to Cloudinary
router.post(
  "/admin/partners",
  requireAuth,
  upload.single("logo"),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const { name, website, sort_order, is_active } = req.body;
      if (!name?.trim()) return fail(res, "Name is required");

      const logo_url = req.file ? req.file.path : req.body.logo_url || "";

      const partner = await Partner.create({
        name: name.trim(),
        logo_url,
        website: website?.trim() || "",
        sort_order: parseInt(sort_order) || 0,
        is_active: is_active !== "false" && is_active !== false,
      });

      revalidate(["/"]);
      return created(res, partner, "Partner created");
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/partners/:id
// FIX: added uploadToCloudinary so logo is actually sent to Cloudinary
router.put(
  "/admin/partners/:id",
  requireAuth,
  upload.single("logo"),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const { name, website, sort_order, is_active } = req.body;

      const update = {};
      if (name !== undefined) update.name = name.trim();
      if (website !== undefined) update.website = website.trim();
      if (sort_order !== undefined)
        update.sort_order = parseInt(sort_order) || 0;
      if (is_active !== undefined)
        update.is_active = is_active !== "false" && is_active !== false;
      if (req.file) update.logo_url = req.file.path;
      else if (req.body.logo_url !== undefined)
        update.logo_url = req.body.logo_url;

      const partner = await Partner.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      }).lean();
      if (!partner) return fail(res, "Partner not found", 404);

      revalidate(["/"]);
      return ok(res, partner, "Partner updated");
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /admin/partners/:id
router.delete("/admin/partners/:id", requireAuth, async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return fail(res, "Partner not found", 404);
    revalidate(["/"]);
    return ok(res, null, "Partner deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
