const router = require("express").Router();

const { getKitchenStatus } = require("../../controllers/customerKitchenController");

// Same authentication middleware used by customer routes
const customerAuth = require("../../Middleware/customerAuthMiddleware");

// GET /api/customer/kitchen/status
router.get("/status", customerAuth, getKitchenStatus);

module.exports = router;