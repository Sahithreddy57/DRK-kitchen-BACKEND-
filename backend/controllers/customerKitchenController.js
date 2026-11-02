// const { getOrderingStatus } = require("../utils/orderingGate");
// const { success, error } = require("../utils/response");

// // GET /api/customer/kitchen/status
// const getKitchenStatus = async (req, res) => {
//   try {
//     const gate = await getOrderingStatus(); // create-order వాడే అదే నిర్ణయం

//     let status = "OPEN";
//     let message = "Kitchen is open";

//     if (!gate.is_open) {
//       status = "CLOSED";
//       message = "Kitchen is closed";
//     } else if (gate.is_paused) {
//       status = "PAUSED";
//       message = gate.message;
//     } else if (!gate.accepting) {
//       status = "UNAVAILABLE"; // blocked slot / all slots full
//       message = gate.message;
//     }

//     res.set("Cache-Control", "no-store"); // ఎల్లప్పుడూ తాజా స్థితి

//     return success(res, {
//       is_open: gate.is_open,
//       is_paused: gate.is_paused,
//       order_now_enabled: gate.accepting,
//       // Pause వల్ల ప్రభావితం కాదు. అసలు dates/slots: /orders/slot-days, /orders/slots
//       pre_order_enabled: true,
//       status, // OPEN | PAUSED | CLOSED | UNAVAILABLE
//       code: gate.code, // null | KITCHEN_PAUSED | STORE_CLOSED | ORDERING_BLOCKED | ALL_SLOTS_FULL
//       message,
//       open_time: gate.open_time,
//       close_time: gate.close_time,
//       paused_until: gate.paused_until, // null = "Until I resume" లేదా pause లేదు
//       resumes_in_minutes: gate.resumes_in_minutes,
//       server_time: new Date().toISOString(),
//     });
//   } catch (e) {
//     console.error("[KITCHEN STATUS ERROR]", e);
//     return error(res, "Failed to fetch kitchen status.", 500, "SERVER_ERROR");
//   }
// };

// module.exports = { getKitchenStatus };
const { getOrderingStatus } = require("../utils/orderingGate");
const { success, error } = require("../utils/response");

// ఈ status అందరికీ ఒకటే (customer ని బట్టి మారదు), కాబట్టి కొద్దిసేపు cache చేస్తాం.
// Order create ఈ cache ని వాడదు, అది నేరుగా live gate చూస్తుంది.
const CACHE_TTL_MS = 3000;
const SLOW_LOG_MS = 300;

let cache = { at: 0, data: null, inflight: null };

// ఒక్కసారి లెక్కించే భాగం
const compute = async () => {
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

  return {
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
  };
};

// cache + ఒకేసారి వచ్చే requests కి ఒకే లెక్కింపు
const getSnapshot = async () => {
  const now = Date.now();

  if (cache.data && now - cache.at < CACHE_TTL_MS) {
    return { data: cache.data, source: "cache" };
  }

  if (!cache.inflight) {
    cache.inflight = compute()
      .then((data) => {
        cache.data = data;
        cache.at = Date.now();
        return data;
      })
      .finally(() => {
        cache.inflight = null;
      });
  }

  try {
    return { data: await cache.inflight, source: "db" };
  } catch (e) {
    // లెక్కింపు విఫలమైతే చివరి సరైన status ఇవ్వండి (ఉంటే)
    if (cache.data) {
      console.error("[KITCHEN STATUS] compute failed, serving last known:", e.message);
      return { data: cache.data, source: "stale" };
    }
    throw e;
  }
};

// GET /api/customer/kitchen/status
const getKitchenStatus = async (req, res) => {
  const started = Date.now();

  try {
    const { data, source } = await getSnapshot();

    const ms = Date.now() - started;
    if (ms > SLOW_LOG_MS) {
      console.warn(`[KITCHEN STATUS] slow: ${ms}ms (source: ${source})`);
    }

    res.set("Cache-Control", "no-store");
    res.set("X-Response-Time-Ms", String(ms));

    return success(res, {
      ...data,
      server_time: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[KITCHEN STATUS ERROR]", e);
    return error(res, "Failed to fetch kitchen status.", 500, "SERVER_ERROR");
  }
};

module.exports = { getKitchenStatus };