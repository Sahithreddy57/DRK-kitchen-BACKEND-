// // const mongoose = require("mongoose");
// // const Product = require("../models/Product");
// // const Category = require("../models/Category");

// // const ProductVariant = require("../models/ProductVariant");
// // const { success, error } = require("../utils/response");
// // const { createAudit } = require("../utils/auditHelper");
// // const { AUDIT_ACTIONS } = require("../utils/constants");
// // const { allVariantsUnavailable } = require("../utils/availabilityHelper");
// // const { getPreorderInfo, calculatePricing } = require("./preorder");
// // // GET /api/admin/products
// // const getProducts = async (req, res) => {
// //   const { search, status, category_id, page = 1, limit = 20 } = req.query;
// //   const filter = {};
// //   if (status) filter.status = status;
// //   if (category_id) filter.category_id = category_id;
// //   if (search) filter.name = { $regex: search, $options: "i" };
// //   const skip = (Number(page) - 1) * Number(limit);
// //   const [products, total] = await Promise.all([
// //     Product.find(filter).populate("category_id", "name").sort({ display_order: 1 }).skip(skip).limit(Number(limit)),
// //     Product.countDocuments(filter),
// //   ]);
// //   return success(res, { products, total, page: Number(page), limit: Number(limit) });
// // };
// // // GET /api/admin/products/:id
// // const getProduct = async (req, res) => {
// //   const product = await Product.findById(req.params.id).populate("category_id", "name");
// //   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
// //   return success(res, product);
// // };

// // // GET /api/admin/products/:id/preorder?date=YYYY-MM-DD
// // const getProductPreorder = async (req, res) => {
// //   try {
// //     const product = await Product.findById(req.params.id);
// //     if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

// //     const preorder = await getPreorderInfo(req.query.date);
// //     if (!preorder) {
// //       return error(res, "Invalid date. Use YYYY-MM-DD.", 400, "INVALID_DATE");
// //     }

// //     if (product.status !== "active" || !product.availability) {
// //       preorder.isOpen = false;
// //       preorder.status = "closed";
// //       preorder.message = "This product is currently unavailable.";
// //     }

// //     const variants = await ProductVariant.find({
// //       product_id: product._id,
// //       status: "active",
// //       availability: true,
// //     }).select("_id variant_name variant_type quantity_value quantity_unit member_count price");

// //     return success(res, {
// //       product: {
// //         _id: product._id,
// //         name: product.name,
// //       },
// //       preorder,
// //       variants: variants.map((variant) => ({
// //         _id: variant._id,
// //         variant_name: variant.variant_name,
// //         variant_type: variant.variant_type,
// //         quantity_value: variant.quantity_value,
// //         quantity_unit: variant.quantity_unit,
// //         member_count: variant.member_count,
// //         price: variant.price,
// //         pricing: calculatePricing(variant.price),
// //       })),
// //     });
// //   } catch (err) {
// //     if (err.name === "CastError") {
// //       return error(res, "Invalid product ID.", 400, "INVALID_ID");
// //     }

// //     return error(res, err.message, 500);
// //   }
// // };
// // // POST /api/admin/products
// // const createProduct = async (req, res) => {
// //   const {
// //     name,
// //     category_id,
// //     description,
// //     display_order,
// //     status,
// //     availability,
// //     preorder_above_kg,
// //     min_prep_hours,
// //   } = req.body;
// //   const category = await Category.findById(category_id);
// //   if (!category || category.status !== "active")
// //     return error(res, "Invalid or inactive category.", 422, "INVALID_CATEGORY");

// //   const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
// //   // const image_url = req.file
// //   // ? `/uploads/products/${req.file.filename}`
// //   // : undefined;
// //   const product = await Product.create({
// //     name: name.trim(),
// //     category_id,
// //     description,
// //     image_url,
// //     display_order,
// //     status,
// //     availability,
// //     ...(preorder_above_kg !== undefined && preorder_above_kg !== ""
// //       ? { preorder_above_kg: Number(preorder_above_kg) }
// //       : {}),
// //     min_prep_hours:
// //       min_prep_hours === undefined || min_prep_hours === ""
// //         ? 0
// //         : Number(min_prep_hours),
// //   });
// //   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_CREATED, entity_type: "Product", entity_id: product._id, new_value: product, ip_address: req.ip });
// //   return success(res, product, "Product created.", 201);
// // };
// // // PUT /api/admin/products/:id
// // const updateProduct = async (req, res) => {
// //   const product = await Product.findById(req.params.id);
// //   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

// //   const {
// //     name,
// //     category_id,
// //     description,
// //     display_order,
// //     status,
// //     availability,
// //     preorder_above_kg,
// //     min_prep_hours,
// //   } = req.body;
// //   if (category_id) {
// //     const category = await Category.findById(category_id);
// //     if (!category || category.status !== "active")
// //       return error(res, "Invalid or inactive category.", 422, "INVALID_CATEGORY");
// //     product.category_id = category_id;
// //   }

// //   const old_value = product.toObject();
// //   if (name) product.name = name.trim();
// //   if (description !== undefined) product.description = description;
// //   if (display_order !== undefined) product.display_order = display_order;
// //   if (status) product.status = status;
// //   if (availability !== undefined) product.availability = availability;
// //   if (preorder_above_kg !== undefined) {
// //     product.preorder_above_kg =
// //       preorder_above_kg === "" ? undefined : Number(preorder_above_kg);
// //   }
// //   if (min_prep_hours !== undefined) {
// //     product.min_prep_hours =
// //       min_prep_hours === "" ? 0 : Number(min_prep_hours);
// //   }
// //   if (req.file) product.image_url = `/uploads/${req.file.filename}`;
// // //   if (req.file) {
// // //   product.image_url = `/uploads/products/${req.file.filename}`;
// // // }
// //   await product.save();

// //   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_UPDATED, entity_type: "Product", entity_id: product._id, old_value, new_value: product, ip_address: req.ip });
// //   return success(res, product, "Product updated.");
// // };

// // // PATCH /api/admin/products/:id/status
// // const updateProductStatus = async (req, res) => {
// //   const product = await Product.findById(req.params.id);
// //   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
// //   const old_value = { status: product.status };
// //   product.status = req.body.status;
// //   await product.save();
// //   const action = product.status === "inactive" ? AUDIT_ACTIONS.PRODUCT_DISABLED : AUDIT_ACTIONS.PRODUCT_UPDATED;
// //   await createAudit({ admin_id: req.admin._id, action, entity_type: "Product", entity_id: product._id, old_value, new_value: { status: product.status }, ip_address: req.ip });
// //   return success(res, product, "Product status updated.");
// // };
// // // PATCH /api/admin/products/:id/availability
// // const updateProductAvailability = async (req, res) => {
// //   const product = await Product.findById(req.params.id);
// //   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
// //   const old_value = { availability: product.availability };
// //   product.availability = req.body.availability;
// //   await product.save();
// //   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_UPDATED, entity_type: "Product", entity_id: product._id, old_value, new_value: { availability: product.availability }, ip_address: req.ip });
// //   const allVariantsDown = product.availability === false ? await allVariantsUnavailable(product._id) : false;
// //   return success(res, { product, all_variants_unavailable: allVariantsDown }, "Product availability updated.");
// // };
// // // DELETE /api/admin/products/:id
// // const deleteProduct = async (req, res) => {
// //   const product = await Product.findById(req.params.id);
// //   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
// //   await product.deleteOne();
// //   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_DISABLED, entity_type: "Product", entity_id: product._id, old_value: product, ip_address: req.ip });
// //   return success(res, {}, "Product deleted.");
// // };
// // // PATCH /api/admin/products/:id/quantity
// // const updateProductQuantity = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { action, quantity } = req.body;

// //     // Validate Product ID
// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return error(res, "Invalid product ID.", 400, "INVALID_ID");
// //     }

// //     // Validate action
// //     if (!["increase", "decrease"].includes(action)) {
// //       return error(
// //         res,
// //         "Action must be increase or decrease.",
// //         400,
// //         "INVALID_ACTION"
// //       );
// //     }
// //     // Validate quantity
// //     if (
// //       !Number.isInteger(quantity) ||
// //       quantity <= 0
// //     ) {
// //       return error(
// //         res,
// //         "Quantity must be a positive integer.",
// //         400,
// //         "INVALID_QUANTITY"
// //       );
// //     }

// //     const product = await Product.findById(id);

// //     if (!product) {
// //       return error(res, "Product not found.", 404, "NOT_FOUND");
// //     }

// //     const oldQuantity = product.quantity || 0;

// //     // Prevent negative stock
// //     if (action === "decrease" && oldQuantity < quantity) {
// //       return error(
// //         res,
// //         "Insufficient product quantity.",
// //         400,
// //         "INSUFFICIENT_QUANTITY"
// //       );
// //     }
// //     const old_value = { quantity: oldQuantity };

// //     if (action === "increase") {
// //       product.quantity = oldQuantity + quantity;
// //     } else {
// //       product.quantity = oldQuantity - quantity;
// //     }

// //     await product.save();

// //     await createAudit({
// //       admin_id: req.admin._id,
// //       action: AUDIT_ACTIONS.PRODUCT_UPDATED,
// //       entity_type: "Product",
// //       entity_id: product._id,
// //       old_value,
// //       new_value: { quantity: product.quantity },
// //       ip_address: req.ip,
// //     });

// //     return success(
// //       res,
// //       {
// //         product_id: product._id,
// //         name: product.name,
// //         previous_quantity: oldQuantity,
// //         quantity: product.quantity,
// //         action,
// //         changed_by: quantity,
// //       },
// //       "Product quantity updated successfully."
// //     );
// //   } catch (err) {
// //     return error(res, err.message, 500, "SERVER_ERROR");
// //   }
// // };
// // module.exports = { getProducts, getProduct, getProductPreorder, createProduct, updateProduct, updateProductStatus, updateProductAvailability, deleteProduct, updateProductQuantity };
// const mongoose = require("mongoose");
// const Product = require("../models/Product");
// const Category = require("../models/Category");

// const ProductVariant = require("../models/ProductVariant");
// const { success, error } = require("../utils/response");
// const { createAudit } = require("../utils/auditHelper");
// const { AUDIT_ACTIONS } = require("../utils/constants");
// const { allVariantsUnavailable } = require("../utils/availabilityHelper");
// const { getPreorderInfo, calculatePricing } = require("./preorder");
// // GET /api/admin/products
// const getProducts = async (req, res) => {
//   const { search, status, category_id, page = 1, limit = 20 } = req.query;
//   const filter = {};
//   if (status) filter.status = status;
//   if (category_id) filter.category_id = category_id;
//   if (search) filter.name = { $regex: search, $options: "i" };
//   const skip = (Number(page) - 1) * Number(limit);
//   const [products, total] = await Promise.all([
//     Product.find(filter).populate("category_id", "name").sort({ display_order: 1 }).skip(skip).limit(Number(limit)),
//     Product.countDocuments(filter),
//   ]);
//   return success(res, { products, total, page: Number(page), limit: Number(limit) });
// };
// // GET /api/admin/products/:id
// const getProduct = async (req, res) => {
//   const product = await Product.findById(req.params.id).populate("category_id", "name");
//   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
//   return success(res, product);
// };

// // GET /api/admin/products/:id/preorder?date=YYYY-MM-DD
// const getProductPreorder = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

//     const preorder = await getPreorderInfo(req.query.date);
//     if (!preorder) {
//       return error(res, "Invalid date. Use YYYY-MM-DD.", 400, "INVALID_DATE");
//     }

//     if (product.status !== "active" || !product.availability) {
//       preorder.isOpen = false;
//       preorder.status = "closed";
//       preorder.message = "This product is currently unavailable.";
//     }

//     const variants = await ProductVariant.find({
//       product_id: product._id,
//       status: "active",
//       availability: true,
//     }).select("_id variant_name variant_type quantity_value quantity_unit member_count price");

//     return success(res, {
//       product: {
//         _id: product._id,
//         name: product.name,
//       },
//       preorder,
//       variants: variants.map((variant) => ({
//         _id: variant._id,
//         variant_name: variant.variant_name,
//         variant_type: variant.variant_type,
//         quantity_value: variant.quantity_value,
//         quantity_unit: variant.quantity_unit,
//         member_count: variant.member_count,
//         price: variant.price,
//         pricing: calculatePricing(variant.price),
//       })),
//     });
//   } catch (err) {
//     if (err.name === "CastError") {
//       return error(res, "Invalid product ID.", 400, "INVALID_ID");
//     }

//     return error(res, err.message, 500);
//   }
// };
// // POST /api/admin/products
// const createProduct = async (req, res) => {
//   const {
//     name,
//     category_id,
//     description,
//     display_order,
//     status,
//     availability,
//     preorder_above_kg,
//     min_prep_hours,
//   } = req.body;
//   const category = await Category.findById(category_id);
//   if (!category || category.status !== "active")
//     return error(res, "Invalid or inactive category.", 422, "INVALID_CATEGORY");

//   // Product images are saved in uploads/products
//   const image_url = req.file ? `/uploads/products/${req.file.filename}` : undefined;
//   const product = await Product.create({
//     name: name.trim(),
//     category_id,
//     description,
//     image_url,
//     display_order,
//     status,
//     availability,
//     ...(preorder_above_kg !== undefined && preorder_above_kg !== ""
//       ? { preorder_above_kg: Number(preorder_above_kg) }
//       : {}),
//     min_prep_hours:
//       min_prep_hours === undefined || min_prep_hours === ""
//         ? 0
//         : Number(min_prep_hours),
//   });
//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_CREATED, entity_type: "Product", entity_id: product._id, new_value: product, ip_address: req.ip });
//   return success(res, product, "Product created.", 201);
// };
// // PUT /api/admin/products/:id
// const updateProduct = async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

//   const {
//     name,
//     category_id,
//     description,
//     display_order,
//     status,
//     availability,
//     preorder_above_kg,
//     min_prep_hours,
//   } = req.body;
//   if (category_id) {
//     const category = await Category.findById(category_id);
//     if (!category || category.status !== "active")
//       return error(res, "Invalid or inactive category.", 422, "INVALID_CATEGORY");
//     product.category_id = category_id;
//   }

//   const old_value = product.toObject();
//   if (name) product.name = name.trim();
//   if (description !== undefined) product.description = description;
//   if (display_order !== undefined) product.display_order = display_order;
//   if (status) product.status = status;
//   if (availability !== undefined) product.availability = availability;
//   if (preorder_above_kg !== undefined) {
//     product.preorder_above_kg =
//       preorder_above_kg === "" ? undefined : Number(preorder_above_kg);
//   }
//   if (min_prep_hours !== undefined) {
//     product.min_prep_hours =
//       min_prep_hours === "" ? 0 : Number(min_prep_hours);
//   }
//   // Product images are saved in uploads/products
//   if (req.file) product.image_url = `/uploads/products/${req.file.filename}`;
//   await product.save();

//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_UPDATED, entity_type: "Product", entity_id: product._id, old_value, new_value: product, ip_address: req.ip });
//   return success(res, product, "Product updated.");
// };

// // PATCH /api/admin/products/:id/status
// const updateProductStatus = async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
//   const old_value = { status: product.status };
//   product.status = req.body.status;
//   await product.save();
//   const action = product.status === "inactive" ? AUDIT_ACTIONS.PRODUCT_DISABLED : AUDIT_ACTIONS.PRODUCT_UPDATED;
//   await createAudit({ admin_id: req.admin._id, action, entity_type: "Product", entity_id: product._id, old_value, new_value: { status: product.status }, ip_address: req.ip });
//   return success(res, product, "Product status updated.");
// };
// // PATCH /api/admin/products/:id/availability
// const updateProductAvailability = async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
//   const old_value = { availability: product.availability };
//   product.availability = req.body.availability;
//   await product.save();
//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_UPDATED, entity_type: "Product", entity_id: product._id, old_value, new_value: { availability: product.availability }, ip_address: req.ip });
//   const allVariantsDown = product.availability === false ? await allVariantsUnavailable(product._id) : false;
//   return success(res, { product, all_variants_unavailable: allVariantsDown }, "Product availability updated.");
// };
// // DELETE /api/admin/products/:id
// const deleteProduct = async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
//   await product.deleteOne();
//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_DISABLED, entity_type: "Product", entity_id: product._id, old_value: product, ip_address: req.ip });
//   return success(res, {}, "Product deleted.");
// };
// // PATCH /api/admin/products/:id/quantity
// const updateProductQuantity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { action, quantity } = req.body;

//     // Validate Product ID
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return error(res, "Invalid product ID.", 400, "INVALID_ID");
//     }

//     // Validate action
//     if (!["increase", "decrease"].includes(action)) {
//       return error(
//         res,
//         "Action must be increase or decrease.",
//         400,
//         "INVALID_ACTION"
//       );
//     }
//     // Validate quantity
//     if (
//       !Number.isInteger(quantity) ||
//       quantity <= 0
//     ) {
//       return error(
//         res,
//         "Quantity must be a positive integer.",
//         400,
//         "INVALID_QUANTITY"
//       );
//     }

//     const product = await Product.findById(id);

//     if (!product) {
//       return error(res, "Product not found.", 404, "NOT_FOUND");
//     }

//     const oldQuantity = product.quantity || 0;

//     // Prevent negative stock
//     if (action === "decrease" && oldQuantity < quantity) {
//       return error(
//         res,
//         "Insufficient product quantity.",
//         400,
//         "INSUFFICIENT_QUANTITY"
//       );
//     }
//     const old_value = { quantity: oldQuantity };

//     if (action === "increase") {
//       product.quantity = oldQuantity + quantity;
//     } else {
//       product.quantity = oldQuantity - quantity;
//     }

//     await product.save();

//     await createAudit({
//       admin_id: req.admin._id,
//       action: AUDIT_ACTIONS.PRODUCT_UPDATED,
//       entity_type: "Product",
//       entity_id: product._id,
//       old_value,
//       new_value: { quantity: product.quantity },
//       ip_address: req.ip,
//     });

//     return success(
//       res,
//       {
//         product_id: product._id,
//         name: product.name,
//         previous_quantity: oldQuantity,
//         quantity: product.quantity,
//         action,
//         changed_by: quantity,
//       },
//       "Product quantity updated successfully."
//     );
//   } catch (err) {
//     return error(res, err.message, 500, "SERVER_ERROR");
//   }
// };
// module.exports = { getProducts, getProduct, getProductPreorder, createProduct, updateProduct, updateProductStatus, updateProductAvailability, deleteProduct, updateProductQuantity };
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

const ProductVariant = require("../models/ProductVariant");
const { success, error } = require("../utils/response");
const { createAudit } = require("../utils/auditHelper");
const { AUDIT_ACTIONS } = require("../utils/constants");
const { allVariantsUnavailable } = require("../utils/availabilityHelper");
const { getPreorderInfo, calculatePricing } = require("./preorder");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");


const HUNDI_CATEGORY_PATTERN = /hundi/i;
// ---------------------------------------------------------------------


const isHundiItem = (category, body = {}) =>
  HUNDI_CATEGORY_PATTERN.test(String(category?.name || "")) ||
  String(body.is_hundi).toLowerCase() === "true" ||
  String(body.product_type || "").toLowerCase() === "hundi";


const placeUploadedImage = (file, hundi) => {
  const folder = hundi ? "hundi" : "products";
  const targetDir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(targetDir, { recursive: true });

  const target = path.join(targetDir, file.filename);
  if (path.resolve(file.path) !== path.resolve(target)) {
    fs.renameSync(file.path, target);
  }

  return `/uploads/${folder}/${file.filename}`;
};

// GET /api/admin/products
const getProducts = async (req, res) => {
  const { search, status, category_id, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category_id) filter.category_id = category_id;
  if (search) filter.name = { $regex: search, $options: "i" };
  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate("category_id", "name").sort({ display_order: 1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  return success(res, { products, total, page: Number(page), limit: Number(limit) });
};
// GET /api/admin/products/:id
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category_id", "name");
  if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
  return success(res, product);
};

// GET /api/admin/products/:id/preorder?date=YYYY-MM-DD
const getProductPreorder = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

    const preorder = await getPreorderInfo(req.query.date);
    if (!preorder) {
      return error(res, "Invalid date. Use YYYY-MM-DD.", 400, "INVALID_DATE");
    }

    if (product.status !== "active" || !product.availability) {
      preorder.isOpen = false;
      preorder.status = "closed";
      preorder.message = "This product is currently unavailable.";
    }

    const variants = await ProductVariant.find({
      product_id: product._id,
      status: "active",
      availability: true,
    }).select("_id variant_name variant_type quantity_value quantity_unit member_count price");

    return success(res, {
      product: {
        _id: product._id,
        name: product.name,
      },
      preorder,
      variants: variants.map((variant) => ({
        _id: variant._id,
        variant_name: variant.variant_name,
        variant_type: variant.variant_type,
        quantity_value: variant.quantity_value,
        quantity_unit: variant.quantity_unit,
        member_count: variant.member_count,
        price: variant.price,
        pricing: calculatePricing(variant.price),
      })),
    });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, "Invalid product ID.", 400, "INVALID_ID");
    }

    return error(res, err.message, 500);
  }
};
// POST /api/admin/products
const createProduct = async (req, res) => {
  const {
    name,
    category_id,
    description,
    display_order,
    status,
    availability,
    preorder_above_kg,
    min_prep_hours,
  } = req.body;
  const category = await Category.findById(category_id);
  if (!category || category.status !== "active")
    return error(res, "Invalid or inactive category.", 422, "INVALID_CATEGORY");

  // Hundi items -> uploads/hundi, normal products -> uploads/products
  const image_url = req.file
    ? placeUploadedImage(req.file, isHundiItem(category, req.body))
    : undefined;
  const product = await Product.create({
    name: name.trim(),
    category_id,
    description,
    image_url,
    display_order,
    status,
    availability,
    ...(preorder_above_kg !== undefined && preorder_above_kg !== ""
      ? { preorder_above_kg: Number(preorder_above_kg) }
      : {}),
    min_prep_hours:
      min_prep_hours === undefined || min_prep_hours === ""
        ? 0
        : Number(min_prep_hours),
  });
  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_CREATED, entity_type: "Product", entity_id: product._id, new_value: product, ip_address: req.ip });
  return success(res, product, "Product created.", 201);
};
// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

  const {
    name,
    category_id,
    description,
    display_order,
    status,
    availability,
    preorder_above_kg,
    min_prep_hours,
  } = req.body;

  let category = null;
  if (category_id) {
    category = await Category.findById(category_id);
    if (!category || category.status !== "active")
      return error(res, "Invalid or inactive category.", 422, "INVALID_CATEGORY");
    product.category_id = category_id;
  }

  const old_value = product.toObject();
  if (name) product.name = name.trim();
  if (description !== undefined) product.description = description;
  if (display_order !== undefined) product.display_order = display_order;
  if (status) product.status = status;
  if (availability !== undefined) product.availability = availability;
  if (preorder_above_kg !== undefined) {
    product.preorder_above_kg =
      preorder_above_kg === "" ? undefined : Number(preorder_above_kg);
  }
  if (min_prep_hours !== undefined) {
    product.min_prep_hours =
      min_prep_hours === "" ? 0 : Number(min_prep_hours);
  }
  // Hundi items -> uploads/hundi, normal products -> uploads/products
  if (req.file) {
    if (!category) category = await Category.findById(product.category_id).select("name");
    product.image_url = placeUploadedImage(req.file, isHundiItem(category, req.body));
  }
  await product.save();

  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_UPDATED, entity_type: "Product", entity_id: product._id, old_value, new_value: product, ip_address: req.ip });
  return success(res, product, "Product updated.");
};

// PATCH /api/admin/products/:id/status
const updateProductStatus = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
  const old_value = { status: product.status };
  product.status = req.body.status;
  await product.save();
  const action = product.status === "inactive" ? AUDIT_ACTIONS.PRODUCT_DISABLED : AUDIT_ACTIONS.PRODUCT_UPDATED;
  await createAudit({ admin_id: req.admin._id, action, entity_type: "Product", entity_id: product._id, old_value, new_value: { status: product.status }, ip_address: req.ip });
  return success(res, product, "Product status updated.");
};
// PATCH /api/admin/products/:id/availability
const updateProductAvailability = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
  const old_value = { availability: product.availability };
  product.availability = req.body.availability;
  await product.save();
  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_UPDATED, entity_type: "Product", entity_id: product._id, old_value, new_value: { availability: product.availability }, ip_address: req.ip });
  const allVariantsDown = product.availability === false ? await allVariantsUnavailable(product._id) : false;
  return success(res, { product, all_variants_unavailable: allVariantsDown }, "Product availability updated.");
};
// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");
  await product.deleteOne();
  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.PRODUCT_DISABLED, entity_type: "Product", entity_id: product._id, old_value: product, ip_address: req.ip });
  return success(res, {}, "Product deleted.");
};
// PATCH /api/admin/products/:id/quantity
const updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity } = req.body;

    // Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return error(res, "Invalid product ID.", 400, "INVALID_ID");
    }

    // Validate action
    if (!["increase", "decrease"].includes(action)) {
      return error(
        res,
        "Action must be increase or decrease.",
        400,
        "INVALID_ACTION"
      );
    }
    // Validate quantity
    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return error(
        res,
        "Quantity must be a positive integer.",
        400,
        "INVALID_QUANTITY"
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return error(res, "Product not found.", 404, "NOT_FOUND");
    }

    const oldQuantity = product.quantity || 0;

    // Prevent negative stock
    if (action === "decrease" && oldQuantity < quantity) {
      return error(
        res,
        "Insufficient product quantity.",
        400,
        "INSUFFICIENT_QUANTITY"
      );
    }
    const old_value = { quantity: oldQuantity };

    if (action === "increase") {
      product.quantity = oldQuantity + quantity;
    } else {
      product.quantity = oldQuantity - quantity;
    }

    await product.save();

    await createAudit({
      admin_id: req.admin._id,
      action: AUDIT_ACTIONS.PRODUCT_UPDATED,
      entity_type: "Product",
      entity_id: product._id,
      old_value,
      new_value: { quantity: product.quantity },
      ip_address: req.ip,
    });

    return success(
      res,
      {
        product_id: product._id,
        name: product.name,
        previous_quantity: oldQuantity,
        quantity: product.quantity,
        action,
        changed_by: quantity,
      },
      "Product quantity updated successfully."
    );
  } catch (err) {
    return error(res, err.message, 500, "SERVER_ERROR");
  }
};
module.exports = { getProducts, getProduct, getProductPreorder, createProduct, updateProduct, updateProductStatus, updateProductAvailability, deleteProduct, updateProductQuantity };