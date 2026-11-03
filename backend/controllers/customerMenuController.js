// const mongoose = require("mongoose");
// const Product = require("../models/Product");
// const ProductVariant = require("../models/ProductVariant");
// const { success, error } = require("../utils/response");

// const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// // "available" mirrors the checks the order API makes, so the app never shows
// // something the customer cannot actually order.
// const shapeVariant = (v, productAvailable) => {
//   const available = Boolean(v.availability);
//   return {
//     variant_id: v._id,
//     variant_type: v.variant_type,
//     variant_name: v.variant_name,
//     quantity_value: v.quantity_value,
//     quantity_unit: v.quantity_unit,
//     member_count: v.member_count,
//     price: v.price,
//     order_type: v.order_type || "instock",
//     available,
//     orderable: productAvailable && available,
//   };
// };

// const shapeProduct = (p, variants) => {
//   const available = Boolean(p.availability);
//   return {
//     product_id: p._id,
//     name: p.name,
//     description: p.description || "",
//     image: p.image || p.image_url || null,
//     category_id: p.category_id || null,
//     available,
//     preorder_above_kg: p.preorder_above_kg ?? null,
//     min_prep_hours: p.min_prep_hours || 0,
//     variants: variants.map((v) => shapeVariant(v, available)),
//   };
// };

// // GET /api/customer/menu?search=&category_id=&page=1&limit=50
// const getMenu = async (req, res) => {
//   try {
//     const page = Math.max(1, Number(req.query.page) || 1);
//     const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

//     const filter = { status: "active" };
//     if (req.query.category_id) {
//       if (!mongoose.isValidObjectId(req.query.category_id)) {
//         return error(res, "Invalid category_id.", 400, "INVALID_ID");
//       }
//       filter.category_id = req.query.category_id;
//     }
//     if (req.query.search && String(req.query.search).trim()) {
//       filter.name = new RegExp(esc(String(req.query.search).trim()), "i");
//     }

//     const [products, total] = await Promise.all([
//       Product.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
//       Product.countDocuments(filter),
//     ]);

//     const variants = await ProductVariant.find({
//       product_id: { $in: products.map((p) => p._id) },
//       status: "active",
//     })
//       .sort({ createdAt: 1 })
//       .lean();

//     const byProduct = {};
//     for (const v of variants) (byProduct[String(v.product_id)] ||= []).push(v);

//     return success(res, {
//       products: products.map((p) => shapeProduct(p, byProduct[String(p._id)] || [])),
//       total,
//       page,
//       limit,
//     });
//   } catch (err) {
//     console.error("Customer menu error:", err);
//     return error(res, "Failed to load menu.", 500, "SERVER_ERROR");
//   }
// };

// // GET /api/customer/menu/:id
// const getMenuProduct = async (req, res) => {
//   try {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return error(res, "Invalid product id.", 400, "INVALID_ID");
//     }
//     const product = await Product.findOne({ _id: req.params.id, status: "active" }).lean();
//     if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

//     const variants = await ProductVariant.find({ product_id: product._id, status: "active" })
//       .sort({ createdAt: 1 })
//       .lean();

//     return success(res, shapeProduct(product, variants));
//   } catch (err) {
//     console.error("Customer menu product error:", err);
//     return error(res, "Failed to load product.", 500, "SERVER_ERROR");
//   }
// };

// module.exports = { getMenu, getMenuProduct };

const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const Category = require("../models/Category");
const { success, error } = require("../utils/response");

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "available" mirrors the checks the order API makes, so the app never shows
// something the customer cannot actually order.
const shapeVariant = (v, productAvailable) => {
  const available = Boolean(v.availability);
  return {
    variant_id: v._id,
    variant_type: v.variant_type,
    variant_name: v.variant_name,
    quantity_value: v.quantity_value,
    quantity_unit: v.quantity_unit,
    member_count: v.member_count,
    price: v.price,
    order_type: v.order_type || "instock",
    available,
    orderable: productAvailable && available,
  };
};

const shapeProduct = (p, variants) => {
  const available = Boolean(p.availability);
  return {
    product_id: p._id,
    name: p.name,
    description: p.description || "",
    image: p.image || p.image_url || null,
    category_id: p.category_id || null,
    available,
    preorder_above_kg: p.preorder_above_kg ?? null,
    min_prep_hours: p.min_prep_hours || 0,
    variants: variants.map((v) => shapeVariant(v, available)),
  };
};

const shapeCategory = (c) => ({
  category_id: c._id,
  name: c.name,
  description: c.description || "",
  image: c.image || c.image_url || null,
  display_order: c.display_order ?? null,
});

// GET /api/customer/menu/categories
const getMenuCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" }).lean();

    categories.sort((a, b) => {
      const ao = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return String(a.name).localeCompare(String(b.name));
    });

    return success(res, { categories: categories.map(shapeCategory), total: categories.length });
  } catch (err) {
    console.error("Customer menu categories error:", err);
    return error(res, "Failed to load categories.", 500, "SERVER_ERROR");
  }
};

// GET /api/customer/menu?search=&category_id=&page=1&limit=50
const getMenu = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const filter = { status: "active" };
    if (req.query.category_id) {
      if (!mongoose.isValidObjectId(req.query.category_id)) {
        return error(res, "Invalid category_id.", 400, "INVALID_ID");
      }
      filter.category_id = req.query.category_id;
    }
    if (req.query.search && String(req.query.search).trim()) {
      filter.name = new RegExp(esc(String(req.query.search).trim()), "i");
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const variants = await ProductVariant.find({
      product_id: { $in: products.map((p) => p._id) },
      status: "active",
    })
      .sort({ createdAt: 1 })
      .lean();

    const byProduct = {};
    for (const v of variants) (byProduct[String(v.product_id)] ||= []).push(v);

    return success(res, {
      products: products.map((p) => shapeProduct(p, byProduct[String(p._id)] || [])),
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("Customer menu error:", err);
    return error(res, "Failed to load menu.", 500, "SERVER_ERROR");
  }
};

// GET /api/customer/menu/:id
const getMenuProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return error(res, "Invalid product id.", 400, "INVALID_ID");
    }
    const product = await Product.findOne({ _id: req.params.id, status: "active" }).lean();
    if (!product) return error(res, "Product not found.", 404, "NOT_FOUND");

    const variants = await ProductVariant.find({ product_id: product._id, status: "active" })
      .sort({ createdAt: 1 })
      .lean();

    return success(res, shapeProduct(product, variants));
  } catch (err) {
    console.error("Customer menu product error:", err);
    return error(res, "Failed to load product.", 500, "SERVER_ERROR");
  }
};

module.exports = { getMenu, getMenuCategories, getMenuProduct };