"use strict";

const jwt   = require("jsonwebtoken");
const Admin = require("../models/Admin");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Authentication required" });

    const token = header.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
    }

    const admin = await Admin.findById(payload.id).select("-password");
    if (!admin)
      return res.status(401).json({ success: false, message: "Admin not found" });
    if (!admin.is_active)
      return res.status(401).json({ success: false, message: "Account deactivated" });

    req.admin = admin;
    next();
  } catch (err) { next(err); }
}

function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== "super_admin")
    return res.status(403).json({ success: false, message: "Super admin access required" });
  next();
}

function requireAdmin(req, res, next) {
  if (!["super_admin","admin"].includes(req.admin?.role))
    return res.status(403).json({ success: false, message: "Admin access required" });
  next();
}

module.exports = { requireAuth, requireSuperAdmin, requireAdmin };
