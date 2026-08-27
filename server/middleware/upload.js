"use strict";

const multer = require("multer");
const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);
const MAX = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
const VALID_FOLDERS = ["lands", "houses", "blog", "general", "logos"];
const FOLDER_PREFIX = process.env.CLOUDINARY_FOLDER_PREFIX || "naijarealty";

function fileFilter(req, file, cb) {
  ALLOWED.has(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPEG, PNG, WebP, GIF, SVG, and ICO images are allowed"));
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX },
});

/**
 * Uploads a single file buffer to Cloudinary.
 * Attaches result to req.cloudinaryResult and the resolved folder to req.uploadFolder.
 * Call after upload.single() or upload.array() in your route middleware chain.
 */
function uploadToCloudinary(req, res, next) {
  // Support both single file (req.file) and multiple files (req.files)
  const files = req.file
    ? [req.file]
    : Array.isArray(req.files)
      ? req.files
      : [];

  if (!files.length) return next();

  const raw = req.body?.folder || req.query?.folder || "general";
  const folder = VALID_FOLDERS.includes(raw) ? raw : "general";
  req.uploadFolder = folder;

  const uploadOne = (file) =>
    new Promise((resolve, reject) => {
      // SVG is a vector format — the raster resize/quality transform below
      // doesn't apply to it (and Cloudinary requires SVG delivery to stay
      // untouched), so only attach it for raster uploads.
      const isSvg = file.mimetype === "image/svg+xml";
      const uploadParams = {
        folder: `${FOLDER_PREFIX}/${folder}`,
        ...(isSvg
          ? {}
          : {
              // "limit" only downscales images that exceed these bounds — it
              // never upscales a smaller source and preserves aspect ratio.
              // Without this, a very large source photo (e.g. an 8000px
              // camera original) is stored and re-transformed at full size
              // on every delivery request.
              transformation: [
                { width: 2560, height: 2560, crop: "limit", quality: "auto", fetch_format: "auto" },
              ],
            }),
      };
      const stream = cloudinary.uploader.upload_stream(
        uploadParams,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(stream);
    });

  Promise.all(files.map(uploadOne))
    .then((results) => {
      // Attach results the same way multer-storage-cloudinary did —
      // directly onto each file object so existing route code keeps working
      if (req.file) {
        req.file.path = results[0].secure_url;
        req.file.filename = results[0].public_id;
        req.cloudinaryResult = results[0];
      } else {
        req.files = req.files.map((file, i) => ({
          ...file,
          path: results[i].secure_url,
          filename: results[i].public_id,
        }));
        req.cloudinaryResults = results;
      }
      next();
    })
    .catch(next);
}

module.exports = { upload, uploadToCloudinary };
