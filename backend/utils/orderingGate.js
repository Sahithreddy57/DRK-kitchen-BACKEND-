// // const { DateTime } = require("luxon");
// // const PreorderSettings = require("../models/PreorderSettings");
// // const { success } = require("./response");
// // const { getTodayDayState } = require("../controllers/preorderSchedule.controller");

// // const TZ = "Asia/Kolkata";

// // const toMin = (t) => {
// //   const [h, m] = String(t).split(":").map(Number);
// //   return h * 60 + m;
// // };

// // // Can customers place a NORMAL (immediate) order right now?
// // const getOrderingStatus = async () => {
// //   const s = await PreorderSettings.get();
// //   const now = DateTime.now().setZone(TZ);
// //   const date = now.toISODate();
// //   const nowMin = now.hour * 60 + now.minute;
// //   const dow = now.weekday % 7; // luxon: Mon=1..Sun=7  ->  0=Sunday..6=Saturday

// //   // 1) Day closed (admin "close day" override, or a normally closed weekday)
// //   const override = s.dayOverrides.find((o) => o.date === date);
// //   const cfg = s.weekly.find((w) => w.day === dow);
// //   const closed = override ? override.closed : !cfg || !cfg.open;

// //   if (closed) {
// //     return {
// //       accepting: false,
// //       code: "STORE_CLOSED",
// //       message: "We are closed today. You can pre-order for another day.",
// //     };
// //   }

// //   // 2) Current time falls inside a slot the admin blocked
// //   const blocked = s.blockedSlots.some((b) => {
// //     if (b.date !== date) return false;
// //     const start = toMin(b.start);
// //     return nowMin >= start && nowMin < start + s.slotMinutes;
// //   });

// //   if (blocked) {
// //     return {
// //       accepting: false,
// //       code: "ORDERING_BLOCKED",
// //       message:
// //         "Orders are temporarily unavailable. Please try again later or pre-order for another time.",
// //     };
// //   }

// //   // 3) All remaining slots of today are filled / blocked
// //   const today = await getTodayDayState();

// //   if (today.allFull) {
// //     return {
// //       accepting: false,
// //       code: "ALL_SLOTS_FULL",
// //       message: "All slots are filled for today. Please pre-order for another day.",
// //     };
// //   }

// //   return { accepting: true, code: null, message: "" };
// // };

// // // GET /api/customer/orders/ordering-status
// // const orderingStatusHandler = async (req, res) => {
// //   return success(res, await getOrderingStatus());
// // };

// // module.exports = { getOrderingStatus, orderingStatusHandler };
// const { DateTime } = require("luxon");
// const PreorderSettings = require("../models/PreorderSettings");
// const { success } = require("./response");
// const { getTodayDayState } = require("../controllers/preorderSchedule.controller");

// const TZ = "Asia/Kolkata";

// const toMin = (t) => {
//   const [h, m] = String(t).split(":").map(Number);
//   return h * 60 + m;
// };

// // 17:00 -> "5 PM", 17:30 -> "5:30 PM"
// const fmtTime = (mins) => {
//   const h = Math.floor(mins / 60);
//   const m = mins % 60;
//   const ap = h >= 12 ? "PM" : "AM";
//   const h12 = h % 12 || 12;
//   return m ? `${h12}:${String(m).padStart(2, "0")} ${ap}` : `${h12} ${ap}`;
// };

// // Can customers place a NORMAL (immediate / Order Now) order right now?
// const getOrderingStatus = async () => {
//   const s = await PreorderSettings.get();
//   const now = DateTime.now().setZone(TZ);
//   const date = now.toISODate();
//   const nowMin = now.hour * 60 + now.minute;
//   const dow = now.weekday % 7; // luxon: Mon=1..Sun=7  ->  0=Sunday..6=Saturday

//   // helps to spot phone-clock vs server-clock differences
//   const base = { server_time: now.toFormat("d LLL, h:mm a") };

//   // 1) Day closed (admin "close day" override, or a normally closed weekday)
//   const override = s.dayOverrides.find((o) => o.date === date);
//   const cfg = s.weekly.find((w) => w.day === dow);
//   const closed = override ? override.closed : !cfg || !cfg.open;

//   if (closed) {
//     return {
//       ...base,
//       accepting: false,
//       code: "STORE_CLOSED",
//       message: "We are closed today. You can pre-order for another day.",
//     };
//   }

//   // 2) Current time falls inside a slot the admin blocked
//   const blockedStarts = s.blockedSlots
//     .filter((b) => b.date === date)
//     .map((b) => toMin(b.start));

//   const current = blockedStarts.find(
//     (start) => nowMin >= start && nowMin < start + s.slotMinutes
//   );

//   if (current !== undefined) {
//     // join back-to-back blocked slots (e.g. 4-5 PM and 5-6 PM -> until 6 PM)
//     let end = current + s.slotMinutes;
//     while (blockedStarts.includes(end)) end += s.slotMinutes;

//     return {
//       ...base,
//       accepting: false,
//       code: "ORDERING_BLOCKED",
//       message: `Orders are paused until ${fmtTime(end)}. Please try again then or pre-order for another time.`,
//       blocked_from: fmtTime(current),
//       reopens_at: fmtTime(end),
//     };
//   }

//   // 3) All remaining slots of today are filled / blocked
//   const today = await getTodayDayState();

//   if (today.allFull) {
//     return {
//       ...base,
//       accepting: false,
//       code: "ALL_SLOTS_FULL",
//       message: "All slots are filled for today. Please pre-order for another day.",
//     };
//   }

//   return { ...base, accepting: true, code: null, message: "" };
// };

// // GET /api/customer/orders/ordering-status
// const orderingStatusHandler = async (req, res) => {
//   return success(res, await getOrderingStatus());
// };
const { DateTime } = require("luxon");
const PreorderSettings = require("../models/PreorderSettings");
const KitchenStatus = require("../models/KitchenStatus");
const { success } = require("./response");
const { getTodayDayState } = require("../controllers/preorderSchedule.controller");

const TZ = "Asia/Kolkata";

// true  (default): a blocked slot also stops Order Now while the clock is inside it
// false           : blocked slots only affect pre-orders
const BLOCK_NOW_ON_BLOCKED_SLOT =
  String(process.env.BLOCK_ORDER_NOW_ON_BLOCKED_SLOT ?? "true").toLowerCase() !== "false";

// true  (default): Order Now is accepted only between the day's open and close time
// false           : only closed days stop Order Now (old behaviour)
const ENFORCE_ORDER_NOW_HOURS =
  String(process.env.ENFORCE_ORDER_NOW_HOURS ?? "true").toLowerCase() !== "false";

// Customer కి చూపే సురక్షిత messages (admin ఎంచుకున్న internal reason నేరుగా బయటకు వెళ్ళదు)
const PAUSE_MESSAGES = {
  "Too many orders": "Kitchen temporarily paused due to too many orders",
};
const DEFAULT_PAUSE_MESSAGE = "Kitchen is temporarily paused. Please try again shortly.";

const toMin = (t) => {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + m;
};

// 17:00 -> "5 PM", 17:30 -> "5:30 PM"
const fmtTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${ap}` : `${h12} ${ap}`;
};

// Can customers place a NORMAL (immediate / Order Now) order right now?
const getOrderingStatus = async () => {
  const [s, kitchen] = await Promise.all([PreorderSettings.get(), KitchenStatus.get()]);
  const now = DateTime.now().setZone(TZ);
  const date = now.toISODate();
  const nowMin = now.hour * 60 + now.minute;
  const dow = now.weekday % 7; // luxon: Mon=1..Sun=7  ->  0=Sunday..6=Saturday

  const blockedStarts = s.blockedSlots
    .filter((b) => b.date === date)
    .map((b) => toMin(b.start));

  // Day open / closed (admin "close day" override, or a normally closed weekday)
  const override = s.dayOverrides.find((o) => o.date === date);
  const cfg = s.weekly.find((w) => w.day === dow);
  const closed = override ? override.closed : !cfg || !cfg.open;

  // Today's opening hours (closed day => null)
  const openTime = !closed && cfg ? cfg.openTime : null;
  const closeTime = !closed && cfg ? cfg.closeTime : null;
  const withinHours =
    !closed &&
    openTime &&
    closeTime &&
    nowMin >= toMin(openTime) &&
    nowMin < toMin(closeTime);

  // Kitchen pause (15 / 30 / 1hr / until resumed). paused_until దాటితే ఆటోమేటిక్ గా false
  const isPaused = KitchenStatus.isPaused(kitchen);
  const pausedUntil = isPaused ? kitchen.paused_until : null;
  const resumesInMinutes = pausedUntil
    ? Math.max(Math.ceil((new Date(pausedUntil) - Date.now()) / 60000), 0)
    : null;

  // helps to see what the server sees (server clock vs phone clock, what is blocked today)
  const base = {
    server_time: now.toFormat("d LLL, h:mm a"),
    server_date: date,
    blocked_slots_today: [...blockedStarts].sort((a, b) => a - b).map(fmtTime),

    // NEW: kitchen status API కోసం
    is_open: Boolean(withinHours),
    is_paused: isPaused,
    open_time: openTime,
    close_time: closeTime,
    paused_until: pausedUntil,
    resumes_in_minutes: resumesInMinutes,
  };

  // 1) Day closed
  if (closed) {
    console.log(`[ORDERING GATE] STORE_CLOSED on ${date}`);
    return {
      ...base,
      accepting: false,
      code: "STORE_CLOSED",
      message: "We are closed today. You can pre-order for another day.",
    };
  }

  // 1b) NEW: day is open but the clock is outside opening hours
  if (ENFORCE_ORDER_NOW_HOURS && !withinHours) {
    console.log(`[ORDERING GATE] STORE_CLOSED (outside hours) ${base.server_time}`);
    return {
      ...base,
      accepting: false,
      code: "STORE_CLOSED",
      message: `We are closed right now. Opening hours: ${fmtTime(toMin(openTime))} - ${fmtTime(
        toMin(closeTime)
      )}. You can pre-order for another time.`,
    };
  }

  // 2) NEW: kitchen paused by admin
  if (isPaused) {
    console.log(`[ORDERING GATE] KITCHEN_PAUSED until ${pausedUntil || "resumed"}`);
    return {
      ...base,
      accepting: false,
      code: "KITCHEN_PAUSED",
      message: PAUSE_MESSAGES[kitchen.pause_reason] || DEFAULT_PAUSE_MESSAGE,
    };
  }

  // 3) Current time falls inside a slot the admin blocked
  if (BLOCK_NOW_ON_BLOCKED_SLOT) {
    const current = blockedStarts.find(
      (start) => nowMin >= start && nowMin < start + s.slotMinutes
    );

    if (current !== undefined) {
      // join back-to-back blocked slots (e.g. 4-5 PM and 5-6 PM -> until 6 PM)
      let end = current + s.slotMinutes;
      while (blockedStarts.includes(end)) end += s.slotMinutes;

      console.log(
        `[ORDERING GATE] ORDERING_BLOCKED: server time ${base.server_time}, ` +
          `blocked slot ${fmtTime(current)} - ${fmtTime(end)} on ${date}`
      );

      return {
        ...base,
        accepting: false,
        code: "ORDERING_BLOCKED",
        message: `Orders are paused until ${fmtTime(end)}. Please try again then or pre-order for another time.`,
        blocked_from: fmtTime(current),
        reopens_at: fmtTime(end),
      };
    }
  }

  // 4) All remaining slots of today are filled / blocked
  const today = await getTodayDayState();

  if (today.allFull) {
    console.log(`[ORDERING GATE] ALL_SLOTS_FULL on ${date}`);
    return {
      ...base,
      accepting: false,
      code: "ALL_SLOTS_FULL",
      message: "All slots are filled for today. Please pre-order for another day.",
    };
  }

  return { ...base, accepting: true, code: null, message: "" };
};

// GET /api/customer/orders/ordering-status
const orderingStatusHandler = async (req, res) => {
  return success(res, await getOrderingStatus());
};

module.exports = { getOrderingStatus, orderingStatusHandler };