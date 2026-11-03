// // const HundiPackage = require("../models/HundiPackage");
// // const { success, error } = require("../utils/response");
// // const { toFixed2 } = require("../utils/money");

// // // GET /api/admin/hundi
// // const getHundi = async (req, res) => {
// //   const packages = await HundiPackage.find().sort({ display_order: 1, member_count: 1 });
// //   return success(res, packages);
// // };

// // // POST /api/admin/hundi
// // const createHundi = async (req, res) => {
// //   const { name, member_count, price, display_order } = req.body;
// //   const exists = await HundiPackage.findOne({ member_count, status: "active" });
// //   if (exists) return error(res, "An active package with this member count already exists.", 409, "DUPLICATE");

// //   const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || undefined;
// //   const pkg = await HundiPackage.create({ name, member_count, price: toFixed2(price), display_order, image_url });
// //   return success(res, pkg, "Hundi package created.", 201);
// // };

// // // PUT /api/admin/hundi/:id
// // const updateHundi = async (req, res) => {
// //   const pkg = await HundiPackage.findById(req.params.id);
// //   if (!pkg) return error(res, "Package not found.", 404, "NOT_FOUND");
// //   const { name, member_count, price, display_order, status } = req.body;
// //   if (member_count && member_count !== pkg.member_count) {
// //     const exists = await HundiPackage.findOne({ member_count, status: "active", _id: { $ne: pkg._id } });
// //     if (exists) return error(res, "An active package with this member count already exists.", 409, "DUPLICATE");
// //     pkg.member_count = member_count;
// //   }
// //   if (name) pkg.name = name;
// //   if (price !== undefined) pkg.price = toFixed2(price);
// //   if (display_order !== undefined) pkg.display_order = display_order;
// //   if (status) pkg.status = status;
// //   if (req.file) pkg.image_url = `/uploads/${req.file.filename}`;
// //   else if (req.body.image_url !== undefined) pkg.image_url = req.body.image_url || null;
// //   await pkg.save();
// //   return success(res, pkg, "Hundi package updated.");
// // };
// // // PATCH /api/admin/hundi/:id/status
// // const updateHundiStatus = async (req, res) => {
// //   const pkg = await HundiPackage.findById(req.params.id);
// //   if (!pkg) return error(res, "Package not found.", 404, "NOT_FOUND");
// //   pkg.status = req.body.status;
// //   await pkg.save();
// //   return success(res, pkg, "Package status updated.");
// // };

// // // DELETE /api/admin/hundi/:id
// // const deleteHundi = async (req, res) => {
// //   const pkg = await HundiPackage.findById(req.params.id);
// //   if (!pkg) return error(res, "Package not found.", 404, "NOT_FOUND");
// //   await pkg.deleteOne();
// //   return success(res, {}, "Package deleted.");
// // };
// // const getActiveHundi = async (req, res) => {
// //   try {
// //     const packages = await HundiPackage.find({
// //       status: "active",
// //     }).sort({ display_order: 1, member_count: 1 });

// //     return success(res, packages);
// //   } catch (err) {
// //     return error(res, err.message, 500);
// //   }
// // };


// // const getHundiById = async (req, res) => {
// //   try {
// //     const pkg = await HundiPackage.findById(req.params.id);

// //     if (!pkg) {
// //       return error(res, "Hundi package not found.", 404, "NOT_FOUND");
// //     }

// //     return success(res, pkg);
// //   } catch (err) {
// //     if (err.name === "CastError") {
// //       return error(res, "Invalid Hundi package ID.", 400, "INVALID_ID");
// //     }

// //     return error(res, err.message, 500);
// //   }
// // };


// // const getMemberCounts = async (req, res) => {
// //   try {
// //     const allowedCounts = [5, 10, 15, 25];

// //     const activePackages = await HundiPackage.find({
// //       status: "active",
// //     }).select("member_count -_id");

// //     const usedCounts = activePackages.map((pkg) => pkg.member_count);

// //     const counts = allowedCounts.map((member_count) => ({
// //       member_count,
// //       available: !usedCounts.includes(member_count),
// //     }));

// //     return success(res, counts);
// //   } catch (err) {
// //     return error(res, err.message, 500);
// //   }
// // };


// // const checkMemberCount = async (req, res) => {
// //   try {
// //     const member_count = Number(req.params.count);

// //     if (!Number.isInteger(member_count) || member_count <= 0) {
// //       return error(res, "Member count must be a positive integer.", 400);
// //     }

// //     const exists = await HundiPackage.findOne({
// //       member_count,
// //       status: "active",
// //     });

// //     return success(res, {
// //       member_count,
// //       exists: Boolean(exists),
// //       available: !exists,
// //     });
// //   } catch (err) {
// //     return error(res, err.message, 500);
// //   }
// // };
// // module.exports = {
// //   getHundi,
// //   getActiveHundi,
// //   getHundiById,
// //   getMemberCounts,
// //   checkMemberCount,
// //   createHundi,
// //   updateHundi,
// //   updateHundiStatus,
// //   deleteHundi,
// // };
// const fs = require("fs");
// const path = require("path");
// const HundiPackage = require("../models/HundiPackage");
// const { success, error } = require("../utils/response");
// const { toFixed2 } = require("../utils/money");

// const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

// // Delete an image file inside /uploads (safe: ignores anything outside it).
// const removeImageFile = (imageUrl) => {
//   if (!imageUrl || typeof imageUrl !== "string") return;
//   if (!imageUrl.startsWith("/uploads/")) return;

//   const filePath = path.join(__dirname, "..", imageUrl);
//   if (!filePath.startsWith(UPLOADS_ROOT)) return;

//   fs.unlink(filePath, () => {});
// };

// // Delete a file that multer just saved (used when the request fails).
// const removeUploadedFile = (file) => {
//   if (file?.path) fs.unlink(file.path, () => {});
// };

// // GET /api/admin/hundi
// const getHundi = async (req, res) => {
//   const packages = await HundiPackage.find().sort({ display_order: 1, member_count: 1 });
//   return success(res, packages);
// };

// // POST /api/admin/hundi
// const createHundi = async (req, res) => {
//   const { name, member_count, price, display_order } = req.body;
//   const exists = await HundiPackage.findOne({ member_count, status: "active" });
//   if (exists) {
//     removeUploadedFile(req.file);
//     return error(res, "An active package with this member count already exists.", 409, "DUPLICATE");
//   }

//   const image_url = req.file
//     ? `/uploads/hundi/${req.file.filename}`
//     : req.body.image_url || undefined;

//   const pkg = await HundiPackage.create({ name, member_count, price: toFixed2(price), display_order, image_url });
//   return success(res, pkg, "Hundi package created.", 201);
// };

// // PUT /api/admin/hundi/:id
// const updateHundi = async (req, res) => {
//   const pkg = await HundiPackage.findById(req.params.id);
//   if (!pkg) {
//     removeUploadedFile(req.file);
//     return error(res, "Package not found.", 404, "NOT_FOUND");
//   }
//   const { name, member_count, price, display_order, status } = req.body;
//   if (member_count && member_count !== pkg.member_count) {
//     const exists = await HundiPackage.findOne({ member_count, status: "active", _id: { $ne: pkg._id } });
//     if (exists) {
//       removeUploadedFile(req.file);
//       return error(res, "An active package with this member count already exists.", 409, "DUPLICATE");
//     }
//     pkg.member_count = member_count;
//   }
//   if (name) pkg.name = name;
//   if (price !== undefined) pkg.price = toFixed2(price);
//   if (display_order !== undefined) pkg.display_order = display_order;
//   if (status) pkg.status = status;

//   const previousImage = pkg.image_url;

//   if (req.file) {
//     pkg.image_url = `/uploads/hundi/${req.file.filename}`;
//   } else if (req.body.image_url !== undefined) {
//     pkg.image_url = req.body.image_url || null;
//   }

//   await pkg.save();

//   // Remove the old image file after the new one is saved.
//   if (previousImage && previousImage !== pkg.image_url) {
//     removeImageFile(previousImage);
//   }

//   return success(res, pkg, "Hundi package updated.");
// };

// // PATCH /api/admin/hundi/:id/status
// const updateHundiStatus = async (req, res) => {
//   const pkg = await HundiPackage.findById(req.params.id);
//   if (!pkg) return error(res, "Package not found.", 404, "NOT_FOUND");
//   pkg.status = req.body.status;
//   await pkg.save();
//   return success(res, pkg, "Package status updated.");
// };

// // DELETE /api/admin/hundi/:id
// const deleteHundi = async (req, res) => {
//   const pkg = await HundiPackage.findById(req.params.id);
//   if (!pkg) return error(res, "Package not found.", 404, "NOT_FOUND");

//   const imageUrl = pkg.image_url;
//   await pkg.deleteOne();
//   removeImageFile(imageUrl);

//   return success(res, {}, "Package deleted.");
// };

// const getActiveHundi = async (req, res) => {
//   try {
//     const packages = await HundiPackage.find({
//       status: "active",
//     }).sort({ display_order: 1, member_count: 1 });

//     return success(res, packages);
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// const getHundiById = async (req, res) => {
//   try {
//     const pkg = await HundiPackage.findById(req.params.id);

//     if (!pkg) {
//       return error(res, "Hundi package not found.", 404, "NOT_FOUND");
//     }

//     return success(res, pkg);
//   } catch (err) {
//     if (err.name === "CastError") {
//       return error(res, "Invalid Hundi package ID.", 400, "INVALID_ID");
//     }

//     return error(res, err.message, 500);
//   }
// };

// const getMemberCounts = async (req, res) => {
//   try {
//     const allowedCounts = [5, 10, 15, 25];

//     const activePackages = await HundiPackage.find({
//       status: "active",
//     }).select("member_count -_id");

//     const usedCounts = activePackages.map((pkg) => pkg.member_count);

//     const counts = allowedCounts.map((member_count) => ({
//       member_count,
//       available: !usedCounts.includes(member_count),
//     }));

//     return success(res, counts);
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// const checkMemberCount = async (req, res) => {
//   try {
//     const member_count = Number(req.params.count);

//     if (!Number.isInteger(member_count) || member_count <= 0) {
//       return error(res, "Member count must be a positive integer.", 400);
//     }

//     const exists = await HundiPackage.findOne({
//       member_count,
//       status: "active",
//     });

//     return success(res, {
//       member_count,
//       exists: Boolean(exists),
//       available: !exists,
//     });
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// module.exports = {
//   getHundi,
//   getActiveHundi,
//   getHundiById,
//   getMemberCounts,
//   checkMemberCount,
//   createHundi,
//   updateHundi,
//   updateHundiStatus,
//   deleteHundi,
// };
const fs = require("fs");
const path = require("path");
const HundiPackage = require("../models/HundiPackage");
const { success, error } = require("../utils/response");
const { toFixed2 } = require("../utils/money");
const { getPreorderInfo, calculatePricing } = require("./preorder.js");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
// Delete an image file inside /uploads (safe: ignores anything outside it).

const removeImageFile = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return;
  if (!imageUrl.startsWith("/uploads/")) return;

  const filePath = path.join(__dirname, "..", imageUrl);
  if (!filePath.startsWith(UPLOADS_ROOT)) return;

  fs.unlink(filePath, () => {});
};

// Delete a file that multer just saved (used when the request fails).
const removeUploadedFile = (file) => {
  if (file?.path) fs.unlink(file.path, () => {});
};

// GET /api/admin/hundi
const getHundi = async (req, res) => {
  const packages = await HundiPackage.find().sort({ display_order: 1, member_count: 1 });
  return success(res, packages);
};

// POST /api/admin/hundi
const createHundi = async (req, res) => {
  const { name, member_count, price, display_order } = req.body;
  const exists = await HundiPackage.findOne({ member_count, status: "active" });
  if (exists) {
    removeUploadedFile(req.file);
    return error(res, "An active package with this member count already exists.", 409, "DUPLICATE");
  }

  const image_url = req.file
    ? `/uploads/hundi/${req.file.filename}`
    : req.body.image_url || undefined;

  const pkg = await HundiPackage.create({ name, member_count, price: toFixed2(price), display_order, image_url });
  return success(res, pkg, "Hundi package created.", 201);
};

// PUT /api/admin/hundi/:id
const updateHundi = async (req, res) => {
  const pkg = await HundiPackage.findById(req.params.id);
  if (!pkg) {
    removeUploadedFile(req.file);
    return error(res, "Package not found.", 404, "NOT_FOUND");
  }
  const { name, member_count, price, display_order, status } = req.body;
  if (member_count && member_count !== pkg.member_count) {
    const exists = await HundiPackage.findOne({ member_count, status: "active", _id: { $ne: pkg._id } });
    if (exists) {
      removeUploadedFile(req.file);
      return error(res, "An active package with this member count already exists.", 409, "DUPLICATE");
    }
    pkg.member_count = member_count;
  }
  if (name) pkg.name = name;
  if (price !== undefined) pkg.price = toFixed2(price);
  if (display_order !== undefined) pkg.display_order = display_order;
  if (status) pkg.status = status;

  const previousImage = pkg.image_url;

  if (req.file) {
    pkg.image_url = `/uploads/hundi/${req.file.filename}`;
  } else if (req.body.image_url !== undefined) {
    pkg.image_url = req.body.image_url || null;
  }

  await pkg.save();

  // Remove the old image file after the new one is saved.
  if (previousImage && previousImage !== pkg.image_url) {
    removeImageFile(previousImage);
  }

  return success(res, pkg, "Hundi package updated.");
};

// PATCH /api/admin/hundi/:id/status
const updateHundiStatus = async (req, res) => {
  const pkg = await HundiPackage.findById(req.params.id);
  if (!pkg) return error(res, "Package not found.", 404, "NOT_FOUND");
  pkg.status = req.body.status;
  await pkg.save();
  return success(res, pkg, "Package status updated.");
};
// DELETE /api/admin/hundi/:id
const deleteHundi = async (req, res) => {
  const pkg = await HundiPackage.findById(req.params.id);
  if (!pkg) return error(res, "Package not found.", 404, "NOT_FOUND");

  const imageUrl = pkg.image_url;
  await pkg.deleteOne();
  removeImageFile(imageUrl);

  return success(res, {}, "Package deleted.");
};

const getActiveHundi = async (req, res) => {
  try {
    const packages = await HundiPackage.find({
      status: "active",
    }).sort({ display_order: 1, member_count: 1 });

    return success(res, packages);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
const getHundiById = async (req, res) => {
  try {
    const pkg = await HundiPackage.findById(req.params.id);

    if (!pkg) {
      return error(res, "Hundi package not found.", 404, "NOT_FOUND");
    }

    return success(res, pkg);
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, "Invalid Hundi package ID.", 400, "INVALID_ID");
    }

    return error(res, err.message, 500);
  }
};

// GET /api/admin/hundi/:id/preorder?date=YYYY-MM-DD
const getHundiPreorder = async (req, res) => {
  try {
    const pkg = await HundiPackage.findById(req.params.id);

    if (!pkg) {
      return error(res, "Hundi package not found.", 404, "NOT_FOUND");
    }

    const preorder = await getPreorderInfo(req.query.date, { mode: "hundi" });

    if (!preorder) {
      return error(res, "Invalid date. Use YYYY-MM-DD.", 400, "INVALID_DATE");
    }

    if (pkg.status !== "active") {
      preorder.isOpen = false;
      preorder.status = "closed";
      preorder.message = "This Hundi package is currently unavailable.";
    }

    const pricing = calculatePricing(pkg.price);

    return success(res, {
      package: {
        _id: pkg._id,
        name: pkg.name,
        member_count: pkg.member_count,
        price: pkg.price,
        status: pkg.status,
      },
      preorder,
      pickup: pricing.pickup,
      delivery: pricing.delivery,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return error(res, "Invalid Hundi package ID.", 400, "INVALID_ID");
    }

    return error(res, err.message, 500);
  }
};

const getMemberCounts = async (req, res) => {
  try {
    const allowedCounts = [5, 10, 15, 25];

    const activePackages = await HundiPackage.find({
      status: "active",
    }).select("member_count -_id");

    const usedCounts = activePackages.map((pkg) => pkg.member_count);

    const counts = allowedCounts.map((member_count) => ({
      member_count,
      available: !usedCounts.includes(member_count),
    }));

    return success(res, counts);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const checkMemberCount = async (req, res) => {
  try {
    const member_count = Number(req.params.count);

    if (!Number.isInteger(member_count) || member_count <= 0) {
      return error(res, "Member count must be a positive integer.", 400);
    }

    const exists = await HundiPackage.findOne({
      member_count,
      status: "active",
    });

    return success(res, {
      member_count,
      exists: Boolean(exists),
      available: !exists,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  getHundi,
  getActiveHundi,
  getHundiById,
  getHundiPreorder,
  getMemberCounts,
  checkMemberCount,
  createHundi,
  updateHundi,
  updateHundiStatus,
  deleteHundi,
};