// const router = require("express").Router();
// const { getProducts, getProduct, getProductPreorder, createProduct, updateProduct, updateProductStatus, updateProductAvailability, deleteProduct,   updateProductQuantity, } = require("../../controllers/productController");
// const { getVariants, createVariant } = require("../../controllers/variantController");
// const auth = require("../../Middleware/authMiddleware");
// const validate = require("../../Middleware/validationMiddleware");
// const { productValidator, productStatusValidator, productAvailabilityValidator } = require("../../validators/productValidator");
// const { variantValidator } = require("../../validators/variantValidator");
// const upload = require("../../utils/upload");
// router.get("/", auth, getProducts);
// router.post("/", auth, upload.single("image"), productValidator, validate, createProduct);
// router.get("/:id/preorder", auth, getProductPreorder);
// router.get("/:id", auth, getProduct);
// router.put("/:id", auth, upload.single("image"), productValidator, validate, updateProduct);
// router.patch("/:id/status", auth, productStatusValidator, validate, updateProductStatus);
// router.patch("/:id/availability", auth, productAvailabilityValidator, validate, updateProductAvailability);
// router.delete("/:id", auth, deleteProduct);
// router.patch("/:id/quantity", auth, updateProductQuantity);
// router.get("/:id/variants", auth, getVariants);
// router.post("/:id/variants", auth, variantValidator, validate, createVariant);
// module.exports = router;

// const router = require("express").Router();

// const {
//   getProducts,
//   getProduct,
//   getProductPreorder,
//   createProduct,
//   updateProduct,
//   updateProductStatus,
//   updateProductAvailability,
//   deleteProduct,
//   updateProductQuantity,
// } = require("../../controllers/productController");

// const {
//   getVariants,
//   createVariant,
// } = require("../../controllers/variantController");

// const auth = require("../../Middleware/authMiddleware");
// const validate = require("../../Middleware/validationMiddleware");

// const {
//   productValidator,
//   productStatusValidator,
//   productAvailabilityValidator,
// } = require("../../validators/productValidator");

// const { variantValidator } = require("../../validators/variantValidator");

// // IMPORTANT: Explicitly select Product uploader
// const { products: upload } = require("../../utils/upload");

// router.get("/", auth, getProducts);

// router.post(
//   "/",
//   auth,
//   upload.single("image"),
//   productValidator,
//   validate,
//   createProduct
// );

// router.get("/:id/preorder", auth, getProductPreorder);

// router.get("/:id", auth, getProduct);

// router.put(
//   "/:id",
//   auth,
//   upload.single("image"),
//   productValidator,
//   validate,
//   updateProduct
// );

// router.patch(
//   "/:id/status",
//   auth,
//   productStatusValidator,
//   validate,
//   updateProductStatus
// );

// router.patch(
//   "/:id/availability",
//   auth,
//   productAvailabilityValidator,
//   validate,
//   updateProductAvailability
// );

// router.delete("/:id", auth, deleteProduct);

// router.patch("/:id/quantity", auth, updateProductQuantity);

// router.get("/:id/variants", auth, getVariants);

// router.post(
//   "/:id/variants",
//   auth,
//   variantValidator,
//   validate,
//   createVariant
// );

// module.exports = router;
const router = require("express").Router();
const { getProducts, getProduct, getProductPreorder, createProduct, updateProduct, updateProductStatus, updateProductAvailability, deleteProduct,   updateProductQuantity, } = require("../../controllers/productController");
const { getVariants, createVariant } = require("../../controllers/variantController");
const auth = require("../../Middleware/authMiddleware");
const validate = require("../../Middleware/validationMiddleware");
const { productValidator, productStatusValidator, productAvailabilityValidator } = require("../../validators/productValidator");
const { variantValidator } = require("../../validators/variantValidator");
const { products: upload } = require("../../utils/upload");
router.get("/", auth, getProducts);
router.post("/", auth, upload.single("image"), productValidator, validate, createProduct);
router.get("/:id/preorder", auth, getProductPreorder);
router.get("/:id", auth, getProduct);
router.put("/:id", auth, upload.single("image"), productValidator, validate, updateProduct);
router.patch("/:id/status", auth, productStatusValidator, validate, updateProductStatus);
router.patch("/:id/availability", auth, productAvailabilityValidator, validate, updateProductAvailability);
router.delete("/:id", auth, deleteProduct);
router.patch("/:id/quantity", auth, updateProductQuantity);
router.get("/:id/variants", auth, getVariants);
router.post("/:id/variants", auth, variantValidator, validate, createVariant);
module.exports = router;