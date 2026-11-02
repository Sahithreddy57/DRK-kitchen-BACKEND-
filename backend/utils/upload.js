// const multer = require("multer");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// const MAX_SIZE = 5 * 1024 * 1024; // 5MB
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null,path.join(__dirname, "../uploads")),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     cb(null, `${uuidv4()}${ext}`);
//   },
// });
// const fileFilter = (req, file, cb) => {
//   if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
//   else cb(new Error("Invalid file type. Allowed: JPG, JPEG, PNG, WEBP"), false);
// };
// const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

// module.exports = upload;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 5 * 1024 * 1024;

const UPLOADS_ROOT = path.resolve(__dirname, "../uploads");

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed: JPG, JPEG, PNG, WEBP"), false);
  }
};

const createUploader = (folder) => {
  const uploadPath = path.join(UPLOADS_ROOT, folder);

  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: MAX_SIZE,
    },
  });
};

const products = createUploader("products");
const hundi = createUploader("hundi");
const categories = createUploader("categories");

module.exports = {
  products,
  hundi,
  categories,
};