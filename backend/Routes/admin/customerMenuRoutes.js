// const express = require("express");
// const router = express.Router();

// const authCustomer = require("../../Middleware/customerAuthMiddleware");
// const { getMenu, getMenuProduct } = require("../../controllers/customerMenuController");

// router.use(authCustomer);

// router.get("/", getMenu);
// router.get("/:id", getMenuProduct);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getMenu,
  getMenuCategories,
  getMenuProduct,
} = require("../../controllers/customerMenuController");

// Public menu: no token required. Ordering still needs the customer token.
router.get("/", getMenu);
router.get("/categories", getMenuCategories); // must stay above "/:id"
router.get("/:id", getMenuProduct);

module.exports = router;