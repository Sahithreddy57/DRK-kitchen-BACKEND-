// const router = require("express").Router();
// const { getCategories, getCategory, createCategory, updateCategory, updateCategoryStatus, deleteCategory } = require("../../controllers/categoryController");
// const auth = require("../../Middleware/authMiddleware");
// const validate = require("../../Middleware/validationMiddleware");
// const { categoryValidator, categoryStatusValidator } = require("../../validators/categoryValidator");
// const upload = require("../../utils/upload");

// router.get("/", auth, getCategories);
// router.get("/:id", auth, getCategory);
// router.post("/", auth, upload.single("image"), categoryValidator, validate, createCategory);
// router.put("/:id", auth, upload.single("image"), categoryValidator, validate, updateCategory);
// router.patch("/:id/status", auth, categoryStatusValidator, validate, updateCategoryStatus);
// router.delete("/:id", auth, deleteCategory);

// module.exports = router;
const router = require("express").Router();

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} = require("../../controllers/categoryController");

const auth = require("../../Middleware/authMiddleware");
const validate = require("../../Middleware/validationMiddleware");

const {
  categoryValidator,
  categoryStatusValidator,
} = require("../../validators/categoryValidator");

// IMPORTANT: Import categories Multer instance
const { categories: upload } = require("../../utils/upload");

router.get("/", auth, getCategories);
router.get("/:id", auth, getCategory);

router.post(
  "/",
  auth,
  upload.single("image"),
  categoryValidator,
  validate,
  createCategory
);

router.put(
  "/:id",
  auth,
  upload.single("image"),
  categoryValidator,
  validate,
  updateCategory
);

router.patch(
  "/:id/status",
  auth,
  categoryStatusValidator,
  validate,
  updateCategoryStatus
);

router.delete("/:id", auth, deleteCategory);

module.exports = router;