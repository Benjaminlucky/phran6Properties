"use strict";

const Admin = require("../models/Admin");
const Land = require("../models/Land");
const House = require("../models/House");
const { BlogPost } = require("../models/Blog");
const { Enquiry, Setting, Media } = require("../models/Misc");
const cloudinary = require("../config/cloudinary");
const {
  ok,
  created,
  fail,
  paginated,
  parsePagination,
} = require("../lib/helpers");

// ═══════════════════════════════════════════════════════
// ENQUIRIES — unchanged
// ═══════════════════════════════════════════════════════

exports.submitEnquiry = async (req, res, next) => {
  try {
    const { first_name, phone, message } = req.body;
    if (!first_name || !phone || !message)
      return fail(res, "Name, phone, and message are required");
    const enquiry = await Enquiry.create(req.body);
    return created(res, { id: enquiry._id }, "Enquiry submitted successfully");
  } catch (err) {
    next(err);
  }
};

exports.adminGetEnquiries = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [data, total] = await Promise.all([
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);
    return paginated(res, { data, total, page, perPage });
  } catch (err) {
    next(err);
  }
};

exports.adminGetEnquiry = async (req, res, next) => {
  try {
    const e = await Enquiry.findById(req.params.id).lean();
    if (!e) return fail(res, "Enquiry not found", 404);
    return ok(res, e);
  } catch (err) {
    next(err);
  }
};

exports.updateEnquiry = async (req, res, next) => {
  try {
    const e = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!e) return fail(res, "Enquiry not found", 404);
    return ok(res, e, "Enquiry updated");
  } catch (err) {
    next(err);
  }
};

exports.deleteEnquiry = async (req, res, next) => {
  try {
    const e = await Enquiry.findByIdAndDelete(req.params.id);
    if (!e) return fail(res, "Enquiry not found", 404);
    return ok(res, { id: req.params.id }, "Enquiry deleted");
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════
// SETTINGS — unchanged
// ═══════════════════════════════════════════════════════

exports.getPublicSettings = async (req, res, next) => {
  try {
    const rows = await Setting.find().lean();
    const settings = {};
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    return ok(res, { settings });
  } catch (err) {
    next(err);
  }
};

exports.adminGetSettings = async (req, res, next) => {
  try {
    const filter = req.query.group ? { group_name: req.query.group } : {};
    return ok(res, await Setting.find(filter).lean());
  } catch (err) {
    next(err);
  }
};

exports.adminUpdateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== "object")
      return fail(res, "settings object required");
    const ops = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: {
            key,
            value: value == null ? null : String(value),
            group_name: "general",
          },
        },
        upsert: true,
      },
    }));
    await Setting.bulkWrite(ops);
    return ok(res, null, "Settings updated");
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════
// MEDIA — uploadMedia and deleteMedia updated for Cloudinary
// ═══════════════════════════════════════════════════════

exports.getMedia = async (req, res, next) => {
  try {
    const { page, perPage, skip } = parsePagination(req.query);
    const filter = req.query.folder ? { folder: req.query.folder } : {};
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
};

exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) return fail(res, "No file uploaded");

    const folder = req.uploadFolder || "general";

    // multer-storage-cloudinary puts the full HTTPS URL in req.file.path
    // and the Cloudinary public_id in req.file.filename
    const fileUrl = req.file.path; // full https://res.cloudinary.com/... URL
    const publicId = req.file.filename; // Cloudinary public_id for later deletion

    const media = await Media.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: fileUrl, // store the full Cloudinary URL
      public_id: publicId, // store for deletion
      file_size: req.file.size || 0,
      mime_type: req.file.mimetype,
      folder,
      alt_text: req.body.alt_text || null,
      uploaded_by: req.admin._id,
    });

    return created(res, media, "File uploaded successfully");
  } catch (err) {
    next(err);
  }
};

exports.updateMedia = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { alt_text: req.body.alt_text || null },
      { new: true },
    );
    if (!media) return fail(res, "Media not found", 404);
    return ok(res, media, "Alt text updated");
  } catch (err) {
    next(err);
  }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return fail(res, "Media not found", 404);

    // Delete from Cloudinary if we have a public_id
    if (media.public_id) {
      await cloudinary.uploader
        .destroy(media.public_id)
        .catch((err) =>
          console.warn("[Cloudinary] Delete failed:", err.message),
        );
    }

    await media.deleteOne();
    return ok(res, null, "File deleted");
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════
// STATS — unchanged
// ═══════════════════════════════════════════════════════

exports.getDashboardStats = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      lands,
      houses,
      blogPosts,
      enquiries,
      newEnquiries,
      recentEnquiries,
      topLands,
      monthlyRaw,
    ] = await Promise.all([
      Land.countDocuments(),
      House.countDocuments(),
      BlogPost.countDocuments({ status: "published" }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: "new" }),
      Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
      Land.find()
        .sort({ views_count: -1 })
        .limit(5)
        .select("estate_name slug views_count")
        .lean(),
      Enquiry.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
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
        lands,
        houses,
        blog_posts: blogPosts,
        enquiries,
        new_enquiries: newEnquiries,
      },
      monthly_enquiries,
      recent_enquiries: recentEnquiries,
      top_lands: topLands,
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════
// TEAM — unchanged
// ═══════════════════════════════════════════════════════

exports.getTeam = async (req, res, next) => {
  try {
    return ok(
      res,
      await Admin.find().select("-password").sort({ createdAt: 1 }).lean(),
    );
  } catch (err) {
    next(err);
  }
};

exports.getTeamMember = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select("-password")
      .lean();
    if (!admin) return fail(res, "Team member not found", 404);
    return ok(res, admin);
  } catch (err) {
    next(err);
  }
};

exports.createTeamMember = async (req, res, next) => {
  try {
    const { name, email, password, role = "admin" } = req.body;
    if (!name || !email || !password)
      return fail(res, "Name, email, and password are required");
    if (!["admin", "editor"].includes(role)) return fail(res, "Invalid role");
    if (password.length < 8)
      return fail(res, "Password must be at least 8 characters");
    const admin = await Admin.create({ name, email, password, role });
    return created(res, admin.toSafeObject(), "Team member created");
  } catch (err) {
    if (err.code === 11000) return fail(res, "Email already in use", 409);
    next(err);
  }
};

exports.updateTeamMember = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const isSelf = req.admin._id.toString() === targetId;
    const isSuperAdmin = req.admin.role === "super_admin";
    if (!isSelf && !isSuperAdmin) return fail(res, "Forbidden", 403);

    const { name, email, role, is_active } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email.toLowerCase();
    if (isSuperAdmin && !isSelf) {
      if (role !== undefined) update.role = role;
      if (is_active !== undefined) update.is_active = is_active;
    }
    const admin = await Admin.findByIdAndUpdate(targetId, update, {
      new: true,
    }).select("-password");
    if (!admin) return fail(res, "Team member not found", 404);
    return ok(res, admin, "Team member updated");
  } catch (err) {
    if (err.code === 11000) return fail(res, "Email already in use", 409);
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const isSelf = req.admin._id.toString() === targetId;
    const isSuperAdmin = req.admin.role === "super_admin";
    if (!isSelf && !isSuperAdmin) return fail(res, "Forbidden", 403);

    const { current_password, new_password, confirm_password } = req.body;
    if (!new_password || new_password.length < 8)
      return fail(res, "New password must be at least 8 characters");
    if (new_password !== confirm_password)
      return fail(res, "Passwords do not match");

    const admin = await Admin.findById(targetId);
    if (!admin) return fail(res, "Admin not found", 404);
    if (isSelf) {
      if (!current_password) return fail(res, "Current password is required");
      const valid = await admin.comparePassword(current_password);
      if (!valid) return fail(res, "Current password is incorrect", 401);
    }
    admin.password = new_password;
    await admin.save();
    return ok(res, null, "Password updated successfully");
  } catch (err) {
    next(err);
  }
};

exports.deleteTeamMember = async (req, res, next) => {
  try {
    if (req.admin._id.toString() === req.params.id)
      return fail(res, "Cannot delete your own account");
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return fail(res, "Team member not found", 404);
    return ok(res, { id: req.params.id }, "Team member deleted");
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════
// SEARCH — unchanged
// ═══════════════════════════════════════════════════════

exports.search = async (req, res, next) => {
  try {
    const { q, type = "all" } = req.query;
    if (!q || q.trim().length < 2)
      return fail(res, "Query must be at least 2 characters");

    const [ls, hs, bs] = await Promise.all([
      type === "all" || type === "lands"
        ? Land.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } },
          )
            .sort({ score: { $meta: "textScore" } })
            .limit(10)
            .select("estate_name slug location state price status")
            .lean()
        : Promise.resolve(null),
      type === "all" || type === "houses"
        ? House.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } },
          )
            .sort({ score: { $meta: "textScore" } })
            .limit(10)
            .select("title slug location state price status")
            .lean()
        : Promise.resolve(null),
      type === "all" || type === "blog"
        ? BlogPost.find(
            { $text: { $search: q }, status: "published" },
            { score: { $meta: "textScore" } },
          )
            .sort({ score: { $meta: "textScore" } })
            .limit(10)
            .select("title slug excerpt")
            .lean()
        : Promise.resolve(null),
    ]);

    const results = {};
    if (ls) results.lands = ls.map((l) => ({ ...l, type: "land" }));
    if (hs) results.houses = hs.map((h) => ({ ...h, type: "house" }));
    if (bs) results.blog = bs.map((b) => ({ ...b, type: "blog" }));
    return ok(res, results);
  } catch (err) {
    next(err);
  }
};
