// const Category = require("../models/Category");
// const { success, error } = require("../utils/response");
// const { createAudit } = require("../utils/auditHelper");
// const { AUDIT_ACTIONS } = require("../utils/constants");
// // GET /api/admin/categories
// const getCategories = async (req, res) => {
//   const { search, status } = req.query;
//   const filter = {};
//   if (status) filter.status = status;
//   if (search) filter.name = { $regex: search, $options: "i" };
//   const categories = await Category.find(filter).sort({ display_order: 1, createdAt: -1 });
//   return success(res, categories);
// };
// // GET /api/admin/categories/:id
// const getCategory = async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");
//   return success(res, category);
// };

// // POST /api/admin/categories
// const createCategory = async (req, res) => {
//   const { name, description, display_order } = req.body;
//   const exists = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" }, status: "active" });
//   if (exists) return error(res, "An active category with this name already exists.", 409, "DUPLICATE");

//   const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
//   const category = await Category.create({ name: name.trim(), description, image_url, display_order });
//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, new_value: category, ip_address: req.ip });
//   return success(res, category, "Category created.", 201);
// };

// // PUT /api/admin/categories/:id
// const updateCategory = async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");

//   const { name, description, display_order } = req.body;
//   if (name) {
//     const exists = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" }, status: "active", _id: { $ne: category._id } });
//     if (exists) return error(res, "An active category with this name already exists.", 409, "DUPLICATE");
//   }

//   const old_value = category.toObject();
//   if (name) category.name = name.trim();
//   if (description !== undefined) category.description = description;
//   if (display_order !== undefined) category.display_order = display_order;
//   if (req.file) category.image_url = `/uploads/${req.file.filename}`;
//   await category.save();

//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, old_value, new_value: category, ip_address: req.ip });
//   return success(res, category, "Category updated.");
// };

// // PATCH /api/admin/categories/:id/status
// const updateCategoryStatus = async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");
//   const old_value = { status: category.status };
//   category.status = req.body.status;
//   await category.save();
//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, old_value, new_value: { status: category.status }, ip_address: req.ip });
//   return success(res, category, "Category status updated.");
// };

// // DELETE /api/admin/categories/:id
// const deleteCategory = async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");
//   await category.deleteOne();
//   await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, old_value: category, ip_address: req.ip });
//   return success(res, {}, "Category deleted.");
// };

// module.exports = { getCategories, getCategory, createCategory, updateCategory, updateCategoryStatus, deleteCategory };
const Category = require("../models/Category");
const Product = require("../models/Product"); // NEW
const { success, error } = require("../utils/response");
const { createAudit } = require("../utils/auditHelper");
const { AUDIT_ACTIONS } = require("../utils/constants");
// GET /api/admin/categories
const getCategories = async (req, res) => {
  const { search, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: "i" };
  const categories = await Category.find(filter).sort({ display_order: 1, createdAt: -1 });
  return success(res, categories);
};
// GET /api/admin/categories/:id
const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");
  return success(res, category);
};

// POST /api/admin/categories
const createCategory = async (req, res) => {
  const { name, description, display_order } = req.body;
  const exists = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" }, status: "active" });
  if (exists) return error(res, "An active category with this name already exists.", 409, "DUPLICATE");

  const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
  const category = await Category.create({ name: name.trim(), description, image_url, display_order });
  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, new_value: category, ip_address: req.ip });
  return success(res, category, "Category created.", 201);
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");

  const { name, description, display_order } = req.body;
  if (name) {
    const exists = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" }, status: "active", _id: { $ne: category._id } });
    if (exists) return error(res, "An active category with this name already exists.", 409, "DUPLICATE");
  }

  const old_value = category.toObject();
  if (name) category.name = name.trim();
  if (description !== undefined) category.description = description;
  if (display_order !== undefined) category.display_order = display_order;
  if (req.file) category.image_url = `/uploads/${req.file.filename}`;
  await category.save();

  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, old_value, new_value: category, ip_address: req.ip });
  return success(res, category, "Category updated.");
};

// PATCH /api/admin/categories/:id/status
const updateCategoryStatus = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");
  const old_value = { status: category.status };
  category.status = req.body.status;
  await category.save();
  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, old_value, new_value: { status: category.status }, ip_address: req.ip });
  return success(res, category, "Category status updated.");
};

// DELETE /api/admin/categories/:id
const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return error(res, "Category not found.", 404, "NOT_FOUND");

  // NEW: do not delete a category that still has dishes (they would be left without a category)
  const dishCount = await Product.countDocuments({ category_id: category._id });
  if (dishCount > 0) {
    return error(
      res,
      `This category has ${dishCount} dish${dishCount === 1 ? "" : "es"}. Move or delete them first.`,
      409,
      "CATEGORY_NOT_EMPTY"
    );
  }

  await category.deleteOne();
  await createAudit({ admin_id: req.admin._id, action: AUDIT_ACTIONS.CATEGORY_CHANGED, entity_type: "Category", entity_id: category._id, old_value: category, ip_address: req.ip });
  return success(res, {}, "Category deleted.");
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, updateCategoryStatus, deleteCategory };
