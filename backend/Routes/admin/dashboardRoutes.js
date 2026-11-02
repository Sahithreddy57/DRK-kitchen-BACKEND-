// const router = require("express").Router();
// const { getDashboard, getRecentOrders } = require("../../controllers/dashboardController");
// const auth = require("../../Middleware/authMiddleware");

// router.get("/", auth, getDashboard);
// router.get("/recent-orders", auth, getRecentOrders);

// module.exports = router;
const router = require("express").Router();
const {
  getDashboard,
  getRecentOrders,
  pauseOrders,
  resumeOrders,
} = require("../../controllers/dashboardController");
const auth = require("../../Middleware/authMiddleware");

router.get("/", auth, getDashboard);
router.get("/recent-orders", auth, getRecentOrders);
router.post("/pause-orders", auth, pauseOrders);
router.post("/resume-orders", auth, resumeOrders);

module.exports = router;