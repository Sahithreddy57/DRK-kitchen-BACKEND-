
// const router = require("express").Router();

// const {
//   getHundi,
//   getActiveHundi,
//   getHundiById,
//   getHundiPreorder,
//   getMemberCounts,
//   checkMemberCount,
//   createHundi,
//   updateHundi,
//   updateHundiStatus,
//   deleteHundi,
// } = require("../../controllers/hundiController");

// const auth = require("../../Middleware/authMiddleware");
// const validate = require("../../Middleware/validationMiddleware");
// const {
//   hundiValidator,
//   hundiStatusValidator,
// } = require("../../validators/hundiValidator");

// // Hundi images are saved in uploads/hundi
// const upload = require("../../utils/uploadHundi");

// // GET all Hundi packages
// router.get("/", auth, getHundi);

// // GET active Hundi packages
// router.get("/active", auth, getActiveHundi);

// // GET dropdown member-count options
// router.get("/member-counts", auth, getMemberCounts);

// // CHECK whether a member count is available
// router.get("/check-member-count/:count", auth, checkMemberCount);

// // GET pre-order details + pickup/delivery pricing for one package
// router.get("/:id/preorder", auth, getHundiPreorder);

// // GET one Hundi package by MongoDB ID
// router.get("/:id", auth, getHundiById);

// // CREATE Hundi package
// router.post("/", auth, upload.single("photo"), hundiValidator, validate, createHundi);

// // UPDATE Hundi package
// router.put("/:id", auth, upload.single("photo"), hundiValidator, validate, updateHundi);

// // UPDATE Hundi package status
// router.patch("/:id/status", auth, hundiStatusValidator, validate, updateHundiStatus);

// // DELETE Hundi package
// router.delete("/:id", auth, deleteHundi);
// router.get("/test-preorder", (req, res) => {
//   res.json({ message: "Hundi preorder route is reachable" });
// });
// console.log(
//   "HUNDI ROUTES:",
//   router.stack
//     .filter((layer) => layer.route)
//     .map((layer) => ({
//       path: layer.route.path,
//       methods: Object.keys(layer.route.methods),
//     }))
// );

// module.exports = router;
const router = require("express").Router();

const {
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
} = require("../../controllers/hundiController");
const { hundi: upload } = require("../../utils/upload");
const auth = require("../../Middleware/authMiddleware");
const validate = require("../../Middleware/validationMiddleware");
const {
  hundiValidator,
  hundiStatusValidator,
} = require("../../validators/hundiValidator");

// Hundi images are saved in uploads/hundi (same utils/upload.js as products)
// const upload = require("../../utils/upload").hundi;

// GET all Hundi packages
router.get("/", auth, getHundi);

// GET active Hundi packages
router.get("/active", auth, getActiveHundi);

// GET dropdown member-count options
router.get("/member-counts", auth, getMemberCounts);

// CHECK whether a member count is available
router.get("/check-member-count/:count", auth, checkMemberCount);

// GET pre-order details + pickup/delivery pricing for one package
router.get("/:id/preorder", auth, getHundiPreorder);

// GET one Hundi package by MongoDB ID
router.get("/:id", auth, getHundiById);

// CREATE Hundi package
router.post("/", auth, upload.single("photo"), hundiValidator, validate, createHundi);

// UPDATE Hundi package
router.put("/:id", auth, upload.single("photo"), hundiValidator, validate, updateHundi);

// UPDATE Hundi package status
router.patch("/:id/status", auth, hundiStatusValidator, validate, updateHundiStatus);

// DELETE Hundi package
router.delete("/:id", auth, deleteHundi);
router.get("/test-preorder", (req, res) => {
  res.json({ message: "Hundi preorder route is reachable" });
});
console.log(
  "HUNDI ROUTES:",
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }))
);

module.exports = router;