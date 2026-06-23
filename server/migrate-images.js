/**
 * migrate-images.js
 * ─────────────────────────────────────────────────────────────────
 * One-time script to migrate local uploads → Cloudinary.
 *
 * What it does:
 *   1. Scans server/uploads/ for all images
 *   2. Uploads each to Cloudinary under naijarealty/<folder>/
 *   3. Updates every Land, House, BlogPost, and Media record
 *      whose feature_image / gallery / cover_image points to
 *      the old local path — replacing with the new Cloudinary URL
 *
 * Run once from inside the server/ folder:
 *   node migrate-images.js
 *
 * Safe to re-run — skips files already starting with "https://"
 */

"use strict";

require("dotenv").config();

const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// ── Cloudinary config ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ── MongoDB models (inline — no circular deps) ────────────────────
const Land = require("./models/Land");
const House = require("./models/House");
const { BlogPost } = require("./models/Blog");
const { Media } = require("./models/Misc");

// ── Config ────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "uploads");
const FOLDER_PREFIX = process.env.CLOUDINARY_FOLDER_PREFIX || "naijarealty";
const VALID_FOLDERS = ["lands", "houses", "blog", "general"];
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

// ── Helpers ───────────────────────────────────────────────────────

/** Returns true if path is already a Cloudinary or external URL */
function isRemoteUrl(p) {
  return (
    typeof p === "string" &&
    (p.startsWith("http://") || p.startsWith("https://"))
  );
}

/**
 * Convert a stored path like "uploads/lands/abc.jpg"
 * to an absolute local path.
 */
function toAbsPath(storedPath) {
  if (!storedPath || isRemoteUrl(storedPath)) return null;
  // Strip leading "uploads/" if present
  const rel = storedPath.replace(/^uploads\//, "");
  return path.join(UPLOADS_DIR, rel);
}

/**
 * Upload a single local file to Cloudinary.
 * Returns the secure URL, or null on failure.
 */
async function uploadToCloudinary(absPath, folder) {
  if (!fs.existsSync(absPath)) {
    console.warn(`  ⚠ File not found: ${absPath}`);
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(absPath, {
      folder: `${FOLDER_PREFIX}/${folder}`,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    return result.secure_url;
  } catch (err) {
    console.error(`  ✗ Cloudinary upload failed for ${absPath}:`, err.message);
    return null;
  }
}

/**
 * Migrate a single image path:
 *   - if already remote → return as-is
 *   - if local → upload to Cloudinary → return new URL
 */
async function migrateImage(storedPath, folder = "general") {
  if (!storedPath) return storedPath;
  if (isRemoteUrl(storedPath)) return storedPath; // already migrated
  const absPath = toAbsPath(storedPath);
  if (!absPath) return storedPath;
  const url = await uploadToCloudinary(absPath, folder);
  return url || storedPath; // keep old path if upload fails
}

/**
 * Migrate an array of image paths (gallery).
 */
async function migrateGallery(gallery, folder) {
  if (!Array.isArray(gallery) || gallery.length === 0) return gallery;
  const results = [];
  for (const img of gallery) {
    results.push(await migrateImage(img, folder));
  }
  return results;
}

// ── Migration functions per collection ───────────────────────────

async function migrateLands() {
  console.log("\n📍 Migrating Lands...");
  const lands = await Land.find({});
  let updated = 0;
  for (const land of lands) {
    let changed = false;

    // feature_image
    const newFeature = await migrateImage(land.feature_image, "lands");
    if (newFeature !== land.feature_image) {
      land.feature_image = newFeature;
      changed = true;
    }

    // gallery
    const newGallery = await migrateGallery(land.gallery, "lands");
    if (JSON.stringify(newGallery) !== JSON.stringify(land.gallery)) {
      land.gallery = newGallery;
      changed = true;
    }

    if (changed) {
      await land.save();
      console.log(`  ✓ Land updated: ${land.estate_name}`);
      updated++;
    }
  }
  console.log(`  Done — ${updated}/${lands.length} records updated`);
}

async function migrateHouses() {
  console.log("\n🏠 Migrating Houses...");
  const houses = await House.find({});
  let updated = 0;
  for (const house of houses) {
    let changed = false;

    const newFeature = await migrateImage(house.feature_image, "houses");
    if (newFeature !== house.feature_image) {
      house.feature_image = newFeature;
      changed = true;
    }

    const newGallery = await migrateGallery(house.gallery, "houses");
    if (JSON.stringify(newGallery) !== JSON.stringify(house.gallery)) {
      house.gallery = newGallery;
      changed = true;
    }

    if (changed) {
      await house.save();
      console.log(`  ✓ House updated: ${house.title}`);
      updated++;
    }
  }
  console.log(`  Done — ${updated}/${houses.length} records updated`);
}

async function migrateBlog() {
  console.log("\n📝 Migrating Blog Posts...");
  const posts = await BlogPost.find({});
  let updated = 0;
  for (const post of posts) {
    let changed = false;

    const newCover = await migrateImage(post.cover_image, "blog");
    if (newCover !== post.cover_image) {
      post.cover_image = newCover;
      changed = true;
    }

    if (changed) {
      await post.save();
      console.log(`  ✓ Post updated: ${post.title}`);
      updated++;
    }
  }
  console.log(`  Done — ${updated}/${posts.length} records updated`);
}

async function migrateMedia() {
  console.log("\n🖼  Migrating Media Library...");
  const items = await Media.find({});
  let updated = 0;
  for (const item of items) {
    if (isRemoteUrl(item.file_path)) continue; // already Cloudinary

    const folder = item.folder || "general";
    const absPath = toAbsPath(item.file_path);
    if (!absPath || !fs.existsSync(absPath)) {
      console.warn(`  ⚠ Missing file for Media ${item._id}: ${item.file_path}`);
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(absPath, {
        folder: `${FOLDER_PREFIX}/${folder}`,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      item.file_path = result.secure_url;
      item.public_id = result.public_id;
      await item.save();
      console.log(`  ✓ Media updated: ${item.original_name}`);
      updated++;
    } catch (err) {
      console.error(`  ✗ Failed: ${item.original_name}:`, err.message);
    }
  }
  console.log(`  Done — ${updated}/${items.length} records updated`);
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting image migration: Local → Cloudinary");
  console.log(`   Cloudinary account: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   Folder prefix:      ${FOLDER_PREFIX}`);
  console.log(`   Local uploads dir:  ${UPLOADS_DIR}\n`);

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || "naijarealty",
  });
  console.log("✓ MongoDB connected");

  await migrateLands();
  await migrateHouses();
  await migrateBlog();
  await migrateMedia();

  console.log("\n✅ Migration complete!");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
