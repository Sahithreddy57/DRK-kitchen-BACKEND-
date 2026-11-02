// const Order = require("../models/Order");
// const Payment = require("../models/Payment");
// const { success } = require("../utils/response");
// const { ORDER_STATUS, PAYMENT_STATUS } = require("../utils/constants");

// // GET /api/admin/dashboard
// const getDashboard = async (req, res) => {
//   const todayStart = new Date();
//   todayStart.setHours(0, 0, 0, 0);
//   const todayEnd = new Date();
//   todayEnd.setHours(23, 59, 59, 999);

//   const [counts, salesAgg] = await Promise.all([
//     Order.aggregate([
//       { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
//       { $group: { _id: "$status", count: { $sum: 1 } } },
//     ]),
//     Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: todayStart, $lte: todayEnd },
//           status: { $in: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.COMPLETED] },
//           payment_status: PAYMENT_STATUS.SUCCESS,
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$total_amount" } } },
//     ]),
//   ]);

//   const countMap = {};
//   counts.forEach(({ _id, count }) => (countMap[_id] = count));

//   return success(res, {
//     today_orders: Object.values(countMap).reduce((a, b) => a + b, 0),
//     confirmed: countMap[ORDER_STATUS.CONFIRMED] || 0,
//     pending_payment: countMap[ORDER_STATUS.PAYMENT_PENDING] || 0,
//     processing: countMap[ORDER_STATUS.PROCESSING] || 0,
//     completed: countMap[ORDER_STATUS.COMPLETED] || 0,
//     cancelled: countMap[ORDER_STATUS.CANCELLED] || 0,
//     pre_orders: await Order.countDocuments({ order_type: "PRE_ORDER", createdAt: { $gte: todayStart, $lte: todayEnd } }),
//     today_sales: salesAgg[0]?.total || 0,
//   });
// };

// // GET /api/admin/dashboard/recent-orders
// const getRecentOrders = async (req, res) => {
//   const orders = await Order.find()
//     .sort({ createdAt: -1 })
//     .limit(10)
//     .populate("customer_id", "name mobile");
//   return success(res, orders);
// };

// module.exports = { getDashboard, getRecentOrders };
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const PreorderSettings = require("../models/PreorderSettings");
const KitchenStatus = require("../models/KitchenStatus");
const { success } = require("../utils/response");
const { ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS } = require("../utils/constants");
const { describeWhen } = require("./preorderSchedule.controller");

const S = ORDER_STATUS;
const PAID = PAYMENT_STATUS.PAID ?? PAYMENT_STATUS.SUCCESS ?? PAYMENT_STATUS.COMPLETED;
const list = (...values) => values.filter(Boolean);

const DEAD = list(S.CANCELLED, S.PAYMENT_FAILED, S.PAYMENT_EXPIRED);
const ACCEPT_SLA_MIN = 5;
const IST_OFFSET_MS = 330 * 60000;

const PAUSE_DURATIONS = [15, 30, 60, null]; // null = until I resume
const PAUSE_REASONS = ["Too many orders", "Ingredient shortage", "Staff break", "Other"];

// Orders page లో ఉన్న అదే logic (scheduled pre-orders queue లోకి రావు)
const scheduledCond = () => ({
  order_type: ORDER_TYPES.PRE_ORDER,
  status: { $in: list(S.NEW, S.CONFIRMED) },
  payment_status: PAID,
});

const QUEUE = {
  needs_action: () => ({
    status: { $in: list(S.NEW, S.PAYMENT_PENDING) },
    $nor: [scheduledCond()],
  }),
  kitchen: () => ({
    status: { $in: list(S.CONFIRMED, S.PROCESSING) },
    $nor: [scheduledCond()],
  }),
  ready: () => ({
    status: { $in: list(S.READY_FOR_PICKUP, S.OUT_FOR_DELIVERY) },
  }),
};

const slotLabel = (date, settings) => {
  try {
    const info = describeWhen(date, settings);
    if (info && info.label) return info.label;
  } catch (e) {
    /* fallback below */
  }
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const now = new Date();
  const today = { createdAt: { $gte: todayStart, $lte: todayEnd } };
  const slaCutoff = new Date(now.getTime() - ACCEPT_SLA_MIN * 60000);
  const in48h = new Date(now.getTime() + 48 * 3600000);

  const [
    counts,
    salesAgg,
    netAgg,
    validAgg,
    preOrdersToday,
    kitchenDoc,
    needsAction,
    kitchenList,
    readyList,
    needsCount,
    kitchenCount,
    readyCount,
    waitingOver,
    upcomingRaw,
    soldOutRows,
    settings,
    slotOrders,
  ] = await Promise.all([
    Order.aggregate([
      { $match: today },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    // existing: today_sales
    Order.aggregate([
      {
        $match: {
          ...today,
          status: { $in: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.COMPLETED] },
          payment_status: PAYMENT_STATUS.SUCCESS,
        },
      },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]),
    // net revenue: paid, cancelled/failed/refunded తీసేసి
    Order.aggregate([
      { $match: { ...today, payment_status: PAID, status: { $nin: DEAD } } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]),
    // avg order value: ఈరోజు place అయిన valid orders
    Order.aggregate([
      { $match: { ...today, status: { $nin: DEAD } } },
      { $group: { _id: null, total: { $sum: "$total_amount" }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ order_type: "PRE_ORDER", ...today }),
    KitchenStatus.get(),

    // Live queue (state-based, date filter లేదు)
    Order.find(QUEUE.needs_action()).sort({ createdAt: 1 }).limit(50).populate("customer_id", "name mobile").lean(),
    Order.find(QUEUE.kitchen()).sort({ createdAt: 1 }).limit(50).populate("customer_id", "name mobile").lean(),
    Order.find(QUEUE.ready()).sort({ createdAt: -1 }).limit(20).populate("customer_id", "name mobile").lean(),
    Order.countDocuments(QUEUE.needs_action()),
    Order.countDocuments(QUEUE.kitchen()),
    Order.countDocuments(QUEUE.ready()),

    // accept కోసం 5 నిమిషాలు దాటి waiting
    Order.countDocuments({
      status: S.NEW,
      createdAt: { $lte: slaCutoff },
      $nor: [scheduledCond()],
    }),

    // Upcoming pre-orders (paid, ఇంకా రాబోయేవి)
    Order.find({
      order_type: ORDER_TYPES.PRE_ORDER,
      payment_status: PAID,
      status: { $nin: DEAD },
      requested_at: { $gte: new Date(now.getTime() - 30 * 60000) },
    })
      .sort({ requested_at: 1 })
      .limit(5)
      .populate("customer_id", "name mobile")
      .lean(),

    // Sold out dishes
    Product.find({ status: "active", availability: false }).select("name").limit(10).lean(),

    PreorderSettings.get(),

    // Full slots లెక్కించడానికి (రాబోయే 48 గంటలు)
    Order.find({
      order_type: ORDER_TYPES.PRE_ORDER,
      status: { $nin: DEAD },
      requested_at: { $gte: now, $lte: in48h },
    })
      .select("requested_at")
      .lean(),
  ]);

  const countMap = {};
  counts.forEach(({ _id, count }) => (countMap[_id] = count));

  // upcoming pre-orders కి items attach
  const upIds = upcomingRaw.map((o) => o._id);
  const upItems = upIds.length ? await OrderItem.find({ order_id: { $in: upIds } }).lean() : [];
  const itemsByOrder = {};
  for (const it of upItems) {
    (itemsByOrder[String(it.order_id)] ||= []).push({
      name: `${it.product_name_snapshot || "Item"} ${it.variant_name_snapshot || ""}`.trim(),
      quantity: it.quantity,
    });
  }
  const upcoming_pre_orders = upcomingRaw.map((o) => ({
    ...o,
    items: itemsByOrder[String(o._id)] || [],
  }));

  // Full slots
  const slotMs = (settings?.slotMinutes || 60) * 60000;
  const cap = settings?.capacityPerSlot || 2;
  const bySlot = new Map();
  for (const o of slotOrders) {
    const t = new Date(o.requested_at).getTime();
    const key = Math.floor((t + IST_OFFSET_MS) / slotMs);
    const cur = bySlot.get(key) || { count: 0, at: t };
    cur.count += 1;
    cur.at = Math.min(cur.at, t);
    bySlot.set(key, cur);
  }
  const full_slots = [...bySlot.values()]
    .filter((s) => s.count >= cap)
    .sort((a, b) => a.at - b.at)
    .map((s) => slotLabel(new Date(s.at), settings));

  const paused = KitchenStatus.isPaused(kitchenDoc);

  const cancelled_today = DEAD.reduce((sum, st) => sum + (countMap[st] || 0), 0);
  const valid = validAgg[0] || { total: 0, count: 0 };
  const avg_order_value = valid.count > 0 ? Math.round(Number(valid.total) / valid.count) : 0;

  return success(res, {
    // ---- existing fields ----
    today_orders: Object.values(countMap).reduce((a, b) => a + b, 0),
    confirmed: countMap[ORDER_STATUS.CONFIRMED] || 0,
    pending_payment: countMap[ORDER_STATUS.PAYMENT_PENDING] || 0,
    processing: countMap[ORDER_STATUS.PROCESSING] || 0,
    completed: countMap[ORDER_STATUS.COMPLETED] || 0,
    cancelled: countMap[ORDER_STATUS.CANCELLED] || 0,
    pre_orders: preOrdersToday,
    today_sales: salesAgg[0]?.total || 0,

    // ---- KPI cards ----
    cancelled_today,
    net_revenue: netAgg[0]?.total || 0,
    avg_order_value,
    waiting_on_you: needsCount,
    in_kitchen: kitchenCount,
    waiting_over_5_min: waitingOver,

    // ---- Needs attention ----
    sold_out_items: soldOutRows.map((p) => p.name),
    full_slots,

    // ---- Upcoming pre-orders ----
    upcoming_pre_orders,

    // ---- Live queue ----
    queue: {
      needs_action: needsAction,
      kitchen: kitchenList,
      ready: readyList,
      counts: { needs_action: needsCount, kitchen: kitchenCount, ready: readyCount },
    },

    // ---- Kitchen pause ----
    accepting_orders: !paused,
    paused_until: paused ? kitchenDoc.paused_until : null,
    pause_reason: paused ? kitchenDoc.pause_reason : null,
  });
};

// GET /api/admin/dashboard/recent-orders
const getRecentOrders = async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("customer_id", "name mobile");
  return success(res, orders);
};

// POST /api/admin/dashboard/pause-orders
// body: { duration_minutes: 15 | 30 | 60 | null, reason: string }
const pauseOrders = async (req, res) => {
  const { duration_minutes = null, reason } = req.body || {};

  if (!PAUSE_DURATIONS.includes(duration_minutes)) {
    return res.status(400).json({ success: false, message: "Invalid pause duration." });
  }
  if (!PAUSE_REASONS.includes(reason)) {
    return res.status(400).json({ success: false, message: "Invalid pause reason." });
  }

  const at = new Date();
  const paused_until = duration_minutes ? new Date(at.getTime() + duration_minutes * 60000) : null;

  const kitchen = await KitchenStatus.findOneAndUpdate(
    { key: "kitchen" },
    {
      $set: {
        paused: true,
        paused_until,
        pause_reason: reason,
        paused_at: at,
        paused_by: req.admin?._id || null,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return success(res, {
    accepting_orders: false,
    paused_until: kitchen.paused_until,
    pause_reason: kitchen.pause_reason,
  });
};

// POST /api/admin/dashboard/resume-orders
const resumeOrders = async (req, res) => {
  await KitchenStatus.findOneAndUpdate(
    { key: "kitchen" },
    { $set: { paused: false, paused_until: null, pause_reason: null, paused_at: null, paused_by: null } },
    { upsert: true, returnDocument: "after" }
  );
  return success(res, { accepting_orders: true, paused_until: null });
};

module.exports = { getDashboard, getRecentOrders, pauseOrders, resumeOrders };