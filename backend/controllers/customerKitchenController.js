const { getOrderingStatus } = require("../utils/orderingGate");
const { success, error } = require("../utils/response");

// GET /api/customer/kitchen/status
const getKitchenStatus = async (req, res) => {
  try {
    const gate = await getOrderingStatus(); // create-order వాడే అదే నిర్ణయం

    let status = "OPEN";
    let message = "Kitchen is open";

    if (!gate.is_open) {
      status = "CLOSED";
      message = "Kitchen is closed";
    } else if (gate.is_paused) {
      status = "PAUSED";
      message = gate.message;
    } else if (!gate.accepting) {
      status = "UNAVAILABLE"; // blocked slot / all slots full
      message = gate.message;
    }

    res.set("Cache-Control", "no-store"); // ఎల్లప్పుడూ తాజా స్థితి

    return success(res, {
      is_open: gate.is_open,
      is_paused: gate.is_paused,
      order_now_enabled: gate.accepting,
      // Pause వల్ల ప్రభావితం కాదు. అసలు dates/slots: /orders/slot-days, /orders/slots
      pre_order_enabled: true,
      status, // OPEN | PAUSED | CLOSED | UNAVAILABLE
      code: gate.code, // null | KITCHEN_PAUSED | STORE_CLOSED | ORDERING_BLOCKED | ALL_SLOTS_FULL
      message,
      open_time: gate.open_time,
      close_time: gate.close_time,
      paused_until: gate.paused_until, // null = "Until I resume" లేదా pause లేదు
      resumes_in_minutes: gate.resumes_in_minutes,
      server_time: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[KITCHEN STATUS ERROR]", e);
    return error(res, "Failed to fetch kitchen status.", 500, "SERVER_ERROR");
  }
};

module.exports = { getKitchenStatus };