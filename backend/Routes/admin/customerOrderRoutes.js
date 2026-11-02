// const router = require("express").Router();
// const { createMyOrder, getMyOrders, getMyOrder } = require("../../controllers/customerOrderController");
// const { getCustomerSlots } = require("../../controllers/preorderSchedule.controller");
// const validate = require("../../Middleware/validationMiddleware");
// const { createCustomerOrderValidator } = require("../../validators/orderValidator");

// // IMPORTANT: use the SAME customer auth middleware your customerAddressRoutes.js uses.
// // Open that file, copy its auth import line and paste it here instead of this one.
// const customerAuth = require("../../Middleware/customerAuthMiddleware");

// router.get("/slots", customerAuth, getCustomerSlots); // must stay above "/:id"
// router.post("/", customerAuth, createCustomerOrderValidator, validate, createMyOrder);
// router.get("/", customerAuth, getMyOrders);
// router.get("/:id", customerAuth, getMyOrder);

// module.exports = router;

// const router = require("express").Router();

// const {
//   createMyOrder,
//   getMyOrders,
//   getMyOrder,
//   cancelCustomerOrder,
// } = require("../../controllers/customerOrderController");

// const {
//   getCustomerSlots,
// } = require("../../controllers/preorderSchedule.controller");

// const validate = require("../../Middleware/validationMiddleware");

// const {
//   createCustomerOrderValidator,
// } = require("../../validators/orderValidator");

// // Same authentication middleware used by customer routes
// const customerAuth = require("../../Middleware/customerAuthMiddleware");

// // Slots route must stay above "/:id"
// router.get("/slots", customerAuth, getCustomerSlots);

// // Create a customer order
// router.post(
//   "/",
//   customerAuth,
//   createCustomerOrderValidator,
//   validate,
//   createMyOrder
// );

// // Get all orders belonging to the logged-in customer
// router.get("/", customerAuth, getMyOrders);

// // Cancel an order belonging to the logged-in customer
// router.post(
//   "/:id/cancel",
//   customerAuth,
//   cancelCustomerOrder
// );

// // Get one order by ID
// router.get("/:id", customerAuth, getMyOrder);

// module.exports = router;
// const router = require("express").Router();

// const {
//   createMyOrder,
//   getMyOrders,
//   getMyOrder,
//   cancelCustomerOrder,
// } = require("../../controllers/customerOrderController");

// const {
//   getCustomerSlots,
//   getCustomerDays, // NEW
// } = require("../../controllers/preorderSchedule.controller");

// // NEW
// const { orderingStatusHandler } = require("../../utils/orderingGate");

// const validate = require("../../Middleware/validationMiddleware");

// const {
//   createCustomerOrderValidator,
// } = require("../../validators/orderValidator");

// // Same authentication middleware used by customer routes
// const customerAuth = require("../../Middleware/customerAuthMiddleware");

// // Fixed routes must stay above "/:id", otherwise "slots" is read as an order id

// // NEW: pre-order date chips (available / full / closed + message)
// router.get("/slot-days", customerAuth, getCustomerDays);

// // Pre-order time slots of one date (full / blocked slots come back disabled + message)
// router.get("/slots", customerAuth, getCustomerSlots);

// // NEW: normal (immediate) orders: is the store accepting orders right now?
// router.get("/ordering-status", customerAuth, orderingStatusHandler);

// // Create a customer order
// router.post(
//   "/",
//   customerAuth,
//   createCustomerOrderValidator,
//   validate,
//   createMyOrder
// );

// // Get all orders belonging to the logged-in customer
// router.get("/", customerAuth, getMyOrders);

// // Cancel an order belonging to the logged-in customer
// router.post(
//   "/:id/cancel",
//   customerAuth,
//   cancelCustomerOrder
// );

// // Get one order by ID
// router.get("/:id", customerAuth, getMyOrder);

// module.exports = router;
const router = require("express").Router();

const {
  createMyOrder,
  getMyOrders,
  getMyOrder,
  cancelCustomerOrder,
} = require("../../controllers/customerOrderController");

// NEW: orders by mobile number (logged-in customer's own number)
const {
  getMyOrdersByMobile,
} = require("../../controllers/customerOrderLookupController");

const {
  getCustomerSlots,
  getCustomerDays, // NEW
} = require("../../controllers/preorderSchedule.controller");

// NEW
const { orderingStatusHandler } = require("../../utils/orderingGate");

const validate = require("../../Middleware/validationMiddleware");

const {
  createCustomerOrderValidator,
} = require("../../validators/orderValidator");

// Same authentication middleware used by customer routes
const customerAuth = require("../../Middleware/customerAuthMiddleware");

// Fixed routes must stay above "/:id", otherwise "slots" is read as an order id

// NEW: pre-order date chips (available / full / closed + message)
router.get("/slot-days", customerAuth, getCustomerDays);

// Pre-order time slots of one date (full / blocked slots come back disabled + message)
router.get("/slots", customerAuth, getCustomerSlots);

// NEW: normal (immediate) orders: is the store accepting orders right now?
router.get("/ordering-status", customerAuth, orderingStatusHandler);

// NEW: orders of the logged-in customer, checked with their mobile number
router.get("/by-mobile", customerAuth, getMyOrdersByMobile);

// Create a customer order
router.post(
  "/",
  customerAuth,
  createCustomerOrderValidator,
  validate,
  createMyOrder
);

// Get all orders belonging to the logged-in customer
router.get("/", customerAuth, getMyOrders);

// Cancel an order belonging to the logged-in customer
router.post(
  "/:id/cancel",
  customerAuth,
  cancelCustomerOrder
);

// Get one order by ID
router.get("/:id", customerAuth, getMyOrder);

module.exports = router;