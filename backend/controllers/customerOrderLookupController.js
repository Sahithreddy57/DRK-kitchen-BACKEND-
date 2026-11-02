const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const { success, error } = require("../utils/response");

// customerOrderController లో ఉన్న అదే logic
const customerIdOf = (req) =>
  req.customer?._id ||
  req.customer?.id ||
  req.user?._id ||
  req.user?.id ||
  req.customerId ||
  null;

// +91 / spaces / dashes తీసేసి చివరి 10 అంకెలు
const normalizeMobile = (value) =>
  String(value || "").replace(/\D/g, "").slice(-10);

const shape = (order, items = []) => ({
  order_id: order._id,
  order_number: order.order_number,
  order_type: order.order_type,
  fulfillment_type: order.fulfillment_type,
  requested_at: order.requested_at || null,
  status: order.status,
  payment_status: order.payment_status,
  subtotal: order.subtotal,
  packing_charge: order.packing_charge,
  delivery_charge: order.delivery_charge,
  total_amount: order.total_amount,
  notes: order.notes || "",
  delivery_address:
    order.fulfillment_type === "DELIVERY" ? order.delivery_address || null : null,
  items: items.map((item) => ({
    item_type: item.item_type || "PRODUCT",
    product_name: item.product_name_snapshot || "",
    variant_name: item.variant_name_snapshot || "",
    unit_price: item.unit_price_snapshot,
    quantity: item.quantity,
    subtotal: item.subtotal,
  })),
  created_at: order.createdAt,
});

// GET /api/customer/orders/by-mobile?mobile=9876543210&page=1&limit=20
const getMyOrdersByMobile = async (req, res) => {
  try {
    const customer_id = customerIdOf(req);

    if (!customer_id || !mongoose.isValidObjectId(customer_id)) {
      return error(res, "Customer not authenticated.", 401, "UNAUTHORIZED");
    }

    const mobile = normalizeMobile(req.query.mobile);

    if (mobile.length !== 10) {
      return error(res, "A valid 10-digit mobile number is required.", 422, "INVALID_MOBILE");
    }

    const customer = await Customer.findById(customer_id).select("name mobile").lean();

    if (!customer) {
      return error(res, "Customer not found.", 404, "CUSTOMER_NOT_FOUND");
    }

    // లాగిన్ అయిన customer నంబర్ తోనే match అవ్వాలి
    if (normalizeMobile(customer.mobile) !== mobile) {
      return error(
        res,
        "This mobile number does not belong to the logged-in customer.",
        403,
        "MOBILE_MISMATCH"
      );
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const [orders, total] = await Promise.all([
      Order.find({ customer_id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments({ customer_id }),
    ]);

    const itemRows = await OrderItem.find({
      order_id: { $in: orders.map((o) => o._id) },
    }).lean();

    const byOrder = {};
    for (const it of itemRows) {
      (byOrder[String(it.order_id)] ||= []).push(it);
    }

    return success(res, {
      customer: { name: customer.name, mobile: customer.mobile },
      orders: orders.map((o) => shape(o, byOrder[String(o._id)] || [])),
      total,
      page,
      limit,
    });
  } catch (e) {
    console.error("[CUSTOMER ORDERS BY MOBILE ERROR]", e);
    return error(res, e.message || "Failed to fetch orders.", 500, "SERVER_ERROR");
  }
};

module.exports = { getMyOrdersByMobile };