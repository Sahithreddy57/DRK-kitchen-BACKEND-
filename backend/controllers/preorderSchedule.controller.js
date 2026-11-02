// // const Order = require('../models/Order')
// // const OrderItem = require('../models/OrderItem')
// // const PreorderSettings = require('../models/PreorderSettings')
// // const { ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, VALID_TRANSITIONS } = require('../utils/constants')
// // const { emitToAdmins } = require('../sockets')

// // // Payment model is optional: if it fails to load, payment method/reference stay blank
// // let Payment = null
// // try {
// //   Payment = require('../models/Payment')
// // } catch {}

// // /* ------------------- constants resolved from YOUR constants.js ------------------- */
// // const pickVal = (obj, ...keys) => {
// //   for (const k of keys) if (obj && obj[k] !== undefined) return obj[k]
// // }
// // const PREORDER_TYPE =
// //   ORDER_TYPES.PRE_ORDER || Object.values(ORDER_TYPES || {}).find((v) => /pre/i.test(String(v)))

// // const ST = {
// //   cancelled: pickVal(ORDER_STATUS, 'CANCELLED', 'CANCELED'),
// //   preparing: pickVal(ORDER_STATUS, 'PROCESSING', 'PREPARING', 'IN_PROGRESS'),
// //   ready: pickVal(ORDER_STATUS, 'READY', 'READY_FOR_PICKUP'),
// //   done: ['COMPLETED', 'DELIVERED', 'PICKED_UP', 'OUT_FOR_DELIVERY']
// //     .map((k) => ORDER_STATUS[k])
// //     .filter(Boolean),
// // }
// // const PAID = pickVal(PAYMENT_STATUS, 'PAID', 'SUCCESS', 'COMPLETED')

// // // These statuses do NOT hold a slot
// // const NOT_BOOKED = ['CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED']

// // const canMove = (from, to) => (VALID_TRANSITIONS[from] || []).includes(to)

// // // screen status: scheduled | preparing | ready | completed | cancelled
// // const uiStatus = (st) => {
// //   if (st === ST.cancelled) return 'cancelled'
// //   if (st === ST.preparing) return 'preparing'
// //   if (st === ST.ready) return 'ready'
// //   if (ST.done.includes(st)) return 'completed'
// //   return 'scheduled'
// // }

// // /* ----------------------------- time helpers (IST) ---------------------------- */
// // const IST_MS = 330 * 60000
// // const pad = (n) => String(n).padStart(2, '0')
// // const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// // const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// // const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
// // const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

// // const ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
// // const todayIST = () => ymd(new Date(Date.now() + IST_MS))
// // const addDays = (s, n) => {
// //   const d = new Date(`${s}T00:00:00Z`)
// //   d.setUTCDate(d.getUTCDate() + n)
// //   return ymd(d)
// // }
// // const weekday = (s) => new Date(`${s}T00:00:00Z`).getUTCDay()
// // const toMin = (t) => {
// //   const [h, m] = t.split(':').map(Number)
// //   return h * 60 + m
// // }
// // const toHHmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
// // const instant = (date, hhmm) => new Date(`${date}T${hhmm}:00+05:30`).getTime()
// // const istOf = (d) => {
// //   const x = new Date(new Date(d).getTime() + IST_MS)
// //   return { date: ymd(x), mins: x.getUTCHours() * 60 + x.getUTCMinutes() }
// // }

// // const fmtTime = (m) => {
// //   const h = Math.floor(m / 60)
// //   const mm = m % 60
// //   const ap = h >= 12 ? 'PM' : 'AM'
// //   const h12 = h % 12 || 12
// //   return mm ? `${h12}:${pad(mm)} ${ap}` : `${h12} ${ap}`
// // }
// // const slotLabel = (s, e) => `${fmtTime(toMin(s))} – ${fmtTime(toMin(e))}`

// // const dayLabel = (s) => {
// //   const t = todayIST()
// //   if (s === t) return 'Today'
// //   if (s === addDays(t, 1)) return 'Tomorrow'
// //   const d = new Date(`${s}T00:00:00Z`)
// //   return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
// // }
// // const tabLabel = (s) => {
// //   const t = todayIST()
// //   if (s === t) return 'Today'
// //   if (s === addDays(t, 1)) return 'Tomorrow'
// //   return WD[weekday(s)]
// // }
// // const fmtPlaced = (createdAt) => {
// //   const { date, mins } = istOf(createdAt)
// //   const t = todayIST()
// //   const rel =
// //     date === t
// //       ? 'Today'
// //       : date === addDays(t, -1)
// //       ? 'Yesterday'
// //       : `${Number(date.slice(8))} ${MON[Number(date.slice(5, 7)) - 1]}`
// //   return `${rel} ${fmtTime(mins)}`
// // }
// // const cap = (s = '') => {
// //   const t = String(s).toLowerCase().replace(/_/g, ' ')
// //   return t.charAt(0).toUpperCase() + t.slice(1)
// // }

// // /* --------------------------------- plumbing --------------------------------- */
// // const httpError = (status, message) => Object.assign(new Error(message), { status })
// // const wrap = (fn) => async (req, res) => {
// //   try {
// //     await fn(req, res)
// //   } catch (e) {
// //     res.status(e.status || 500).json({ success: false, message: e.message || 'Server error' })
// //   }
// // }
// // const ok = (res, data) => res.json({ success: true, data })
// // const needDate = (v) => {
// //   if (!DATE_RE.test(v || '')) throw httpError(400, 'date must be YYYY-MM-DD')
// //   return v
// // }
// // const needTime = (v) => {
// //   if (!TIME_RE.test(v || '')) throw httpError(400, 'start must be HH:mm')
// //   return v
// // }

// // /* ----------------------------- order queries/mapping ----------------------------- */
// // const rangeFilter = (fromMs, toMs) => {
// //   const f = {
// //     requested_at: { $gte: new Date(fromMs), $lt: new Date(toMs) },
// //     status: { $nin: NOT_BOOKED },
// //   }
// //   if (PREORDER_TYPE) f.order_type = PREORDER_TYPE
// //   return f
// // }
// // const dayRange = (date) => [instant(date, '00:00'), instant(addDays(date, 1), '00:00')]

// // const slotStartFor = (s, date, mins) => {
// //   const cfg = s.weekly.find((w) => w.day === weekday(date))
// //   const open = toMin(cfg?.openTime || '11:00')
// //   const idx = Math.max(0, Math.floor((mins - open) / s.slotMinutes))
// //   return toHHmm(open + idx * s.slotMinutes)
// // }

// // const normalizeItem = (r) => ({
// //   name: r.product_name_snapshot || 'Item',
// //   nameTe: '',
// //   sizeLabel: r.variant_name_snapshot || '',
// //   qty: r.quantity,
// //   lineTotal: r.subtotal,
// // })

// // async function loadItems(orderIds) {
// //   if (!orderIds.length) return {}
// //   const rows = await OrderItem.find({ order_id: { $in: orderIds } }).lean()
// //   const map = {}
// //   for (const r of rows) (map[String(r.order_id)] ||= []).push(normalizeItem(r))
// //   return map
// // }
// // const loadPayment = async (orderId) =>
// //   Payment ? Payment.findOne({ order_id: orderId }).sort({ createdAt: -1 }).lean() : null

// // const customerOf = (o) => ({
// //   name: o.customer_id?.name || 'Guest',
// //   phone: o.customer_id?.mobile || '',
// // })

// // const mapBooking = (o, items, s) => {
// //   const { date, mins } = istOf(o.requested_at)
// //   const start = slotStartFor(s, date, mins)
// //   return {
// //     id: o._id,
// //     orderNumber: o.order_number,
// //     status: uiStatus(o.status),
// //     summary: (items || []).map((i) => `${i.name}${i.sizeLabel ? ' ' + i.sizeLabel : ''} ×${i.qty}`).join(', '),
// //     customerName: customerOf(o).name,
// //     typeLabel: cap(o.fulfillment_type || 'pickup'),
// //     startLabel: fmtTime(toMin(start)),
// //     total: o.total_amount,
// //   }
// // }

// // const mapOrderDetail = (o, items, payment, s) => {
// //   let when = '—'
// //   if (o.requested_at) {
// //     const { date, mins } = istOf(o.requested_at)
// //     const start = slotStartFor(s, date, mins)
// //     const end = toHHmm(toMin(start) + s.slotMinutes)
// //     when = `${dayLabel(date)} · ${slotLabel(start, end)}`
// //   }
// //   return {
// //     id: o._id,
// //     orderNumber: o.order_number,
// //     status: uiStatus(o.status),
// //     placed: fmtPlaced(o.createdAt),
// //     type: cap(o.fulfillment_type || 'pickup'),
// //     when,
// //     kotPrinted: !!o.kot_printed_at,
// //     customer: customerOf(o),
// //     items: items || [],
// //     subtotal: o.subtotal,
// //     packing: o.packing_charge || 0,
// //     delivery: o.delivery_charge || 0,
// //     total: o.total_amount,
// //     payment: {
// //       method: String(payment?.method || payment?.payment_method || '').toUpperCase(),
// //       status: cap(o.payment_status || ''),
// //       reference:
// //         payment?.gateway_payment_id ||
// //         payment?.razorpay_payment_id ||
// //         payment?.transaction_id ||
// //         payment?.reference ||
// //         '',
// //     },
// //   }
// // }

// // /* ------------------------------ schedule engine ------------------------------ */
// // const isClosed = (s, date) => {
// //   const o = s.dayOverrides.find((x) => x.date === date)
// //   if (o) return o.closed
// //   const cfg = s.weekly.find((w) => w.day === weekday(date))
// //   return !cfg || !cfg.open
// // }

// // async function countsFor(dates, s) {
// //   const from = instant(dates[0], '00:00')
// //   const to = instant(addDays(dates[dates.length - 1], 1), '00:00')
// //   const rows = await Order.find(rangeFilter(from, to)).select('requested_at has_hundi').lean()

// //   const slot = {}
// //   const total = {}
// //   const hundi = {}
// //   for (const r of rows) {
// //     const { date, mins } = istOf(r.requested_at)
// //     const start = slotStartFor(s, date, mins)
// //     ;(slot[date] ||= {})[start] = (slot[date][start] || 0) + 1
// //     total[date] = (total[date] || 0) + 1
// //     if (r.has_hundi) hundi[date] = (hundi[date] || 0) + 1
// //   }
// //   return { slot, total, hundi }
// // }

// // function buildDay(date, s, slotCounts = {}) {
// //   const cfg = s.weekly.find((w) => w.day === weekday(date)) || { openTime: '11:00', closeTime: '22:00' }
// //   const closed = isClosed(s, date)
// //   const now = Date.now()
// //   const earliest = now + s.leadTimeMinutes * 60000
// //   const slots = []
// //   let firstBookable = null

// //   if (!closed) {
// //     const open = toMin(cfg.openTime)
// //     const close = toMin(cfg.closeTime)
// //     for (let m = open; m + s.slotMinutes <= close; m += s.slotMinutes) {
// //       const start = toHHmm(m)
// //       const end = toHHmm(m + s.slotMinutes)
// //       const startAt = instant(date, start)
// //       const endAt = instant(date, end)
// //       const booked = slotCounts[start] || 0
// //       const blocked = s.blockedSlots.some((b) => b.date === date && b.start === start)

// //       let status = 'open'
// //       if (endAt <= now) status = 'past'
// //       else if (blocked) status = 'blocked'
// //       else if (startAt < earliest) status = 'too_soon'
// //       else if (booked >= s.capacityPerSlot) status = 'full'

// //       if (!firstBookable && startAt >= earliest) firstBookable = fmtTime(m)

// //       slots.push({ start, end, label: slotLabel(start, end), booked, capacity: s.capacityPerSlot, status })
// //     }
// //   }
// //   return { closed, openTime: cfg.openTime, closeTime: cfg.closeTime, slots, firstBookable }
// // }

// // /**
// //  * Used by orderController.validateAndCreateOrder before saving a pre-order.
// //  * Throws an error with .status (400/409) and a customer-friendly .message.
// //  */
// // // exports.assertSlotAvailable = async (requestedAt, { hasHundi = false } = {}) => {
// // //   const s = await PreorderSettings.get()
// // //   const { date, mins } = istOf(requestedAt)
// // //   const c = await countsFor([date], s)
// // //   const day = buildDay(date, s, c.slot[date])
// // //   if (day.closed) throw httpError(409, 'We are closed on that day')
// // //   const start = slotStartFor(s, date, mins)
// // //   const slot = day.slots.find((x) => x.start === start)
// // //   if (!slot) throw httpError(400, 'That time is outside our pre-order hours')
// // //   const reasons = {
// // //     past: 'That slot has already passed',
// // //     blocked: 'That slot is not available',
// // //     too_soon: `Pre-orders need at least ${Math.round(s.leadTimeMinutes / 60)} hours notice`,
// // //     full: 'That slot is full',
// // //   }
// // //   if (slot.status !== 'open') throw httpError(409, reasons[slot.status])
// // //   if (hasHundi && (c.hundi[date] || 0) >= s.hundiCapacityPerDay) {
// // //     throw httpError(409, 'Hundi bookings are full for that day')
// // //   }
// // // }

// // exports.assertSlotAvailable = async (requestedAt, { hasHundi = false } = {}) => {
// //   const s = await PreorderSettings.get();

// //   const { date, mins } = istOf(requestedAt);

// //   const c = await countsFor([date], s);
// //   const day = buildDay(date, s, c.slot[date]);

// //   if (day.closed) {
// //     throw httpError(409, "We are closed on that day");
// //   }

// //   const start = slotStartFor(s, date, mins);

// //   // Only accept the exact start time of a generated slot.
// //   // Example: 11:00 is valid, but 11:15 is not.
// //   if (mins !== toMin(start)) {
// //     throw httpError(400, "Please select a valid pre-order slot");
// //   }

// //   const slot = day.slots.find((item) => item.start === start);

// //   if (!slot) {
// //     throw httpError(400, "That time is outside our pre-order hours");
// //   }

// //   const reasons = {
// //     past: "That slot has already passed",
// //     blocked: "That slot is not available",
// //     too_soon: `Pre-orders need at least ${s.leadTimeMinutes} minutes notice`,
// //     full: "That slot is full",
// //   };

// //   if (slot.status !== "open") {
// //     throw httpError(
// //       409,
// //       reasons[slot.status] || "That slot is unavailable"
// //     );
// //   }

// //   if (
// //     hasHundi &&
// //     (c.hundi[date] || 0) >= s.hundiCapacityPerDay
// //   ) {
// //     throw httpError(409, "Hundi bookings are full for that day");
// //   }
// // };

// // /* --------------------------------- handlers --------------------------------- */
// // exports.getWeek = wrap(async (req, res) => {
// //   const today = todayIST()
// //   const from = req.query.from ? needDate(req.query.from) : today
// //   const dates = Array.from({ length: 7 }, (_, i) => addDays(from, i))
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor(dates, s)

// //   ok(res, {
// //     today,
// //     days: dates.map((date) => ({
// //       date,
// //       tabLabel: tabLabel(date),
// //       dayNumber: Number(date.slice(8)),
// //       closed: isClosed(s, date),
// //       booked: c.total[date] || 0,
// //     })),
// //   })
// // })

// // exports.getDay = wrap(async (req, res) => {
// //   const date = needDate(req.query.date)
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor([date], s)
// //   const day = buildDay(date, s, c.slot[date])

// //   const [from, to] = dayRange(date)
// //   const orders = await Order.find(rangeFilter(from, to))
// //     .populate('customer_id', 'name mobile')
// //     .sort({ requested_at: 1, createdAt: 1 })
// //     .lean()
// //   const itemsMap = await loadItems(orders.map((o) => o._id))

// //   const isToday = date === todayIST()
// //   ok(res, {
// //     date,
// //     label: dayLabel(date),
// //     isToday,
// //     closed: day.closed,
// //     openTime: day.openTime,
// //     closeTime: day.closeTime,
// //     capacityPerSlot: s.capacityPerSlot,
// //     hundi: { used: c.hundi[date] || 0, capacity: s.hundiCapacityPerDay },
// //     sameDayFrom: isToday ? day.firstBookable : null,
// //     slots: day.slots,
// //     bookings: orders.map((o) => mapBooking(o, itemsMap[String(o._id)], s)),
// //   })
// // })

// // exports.blockSlot = wrap(async (req, res) => {
// //   const date = needDate(req.body.date)
// //   const start = needTime(req.body.start)
// //   const s = await PreorderSettings.get()
// //   if (!s.blockedSlots.some((b) => b.date === date && b.start === start)) {
// //     s.blockedSlots.push({ date, start })
// //     await s.save()
// //   }
// //   ok(res, { date, start, blocked: true })
// // })

// // exports.unblockSlot = wrap(async (req, res) => {
// //   const date = needDate(req.body.date)
// //   const start = needTime(req.body.start)
// //   const s = await PreorderSettings.get()
// //   s.blockedSlots = s.blockedSlots.filter((b) => !(b.date === date && b.start === start))
// //   await s.save()
// //   ok(res, { date, start, blocked: false })
// // })

// // exports.setDayClosed = wrap(async (req, res) => {
// //   const date = needDate(req.body.date)
// //   if (typeof req.body.closed !== 'boolean') throw httpError(400, 'closed must be true or false')
// //   const s = await PreorderSettings.get()
// //   s.dayOverrides = s.dayOverrides.filter((o) => o.date !== date)
// //   s.dayOverrides.push({ date, closed: req.body.closed })
// //   await s.save()
// //   ok(res, { date, closed: req.body.closed })
// // })

// // exports.getSettings = wrap(async (req, res) => {
// //   ok(res, await PreorderSettings.get())
// // })

// // exports.updateSettings = wrap(async (req, res) => {
// //   const b = req.body
// //   const s = await PreorderSettings.get()
// //   const int = (v, min, max, name) => {
// //     if (!Number.isInteger(v) || v < min || v > max) throw httpError(400, `${name} must be ${min}-${max}`)
// //     return v
// //   }
// //   if (b.leadTimeMinutes !== undefined) s.leadTimeMinutes = int(b.leadTimeMinutes, 0, 10080, 'leadTimeMinutes')
// //   if (b.slotMinutes !== undefined) s.slotMinutes = int(b.slotMinutes, 15, 480, 'slotMinutes')
// //   if (b.capacityPerSlot !== undefined) s.capacityPerSlot = int(b.capacityPerSlot, 1, 500, 'capacityPerSlot')
// //   if (b.hundiCapacityPerDay !== undefined) s.hundiCapacityPerDay = int(b.hundiCapacityPerDay, 0, 500, 'hundiCapacityPerDay')
// //   if (b.weekly !== undefined) {
// //     if (!Array.isArray(b.weekly) || b.weekly.length !== 7) throw httpError(400, 'weekly needs 7 entries')
// //     s.weekly = b.weekly.map((w) => {
// //       if (!TIME_RE.test(w.openTime) || !TIME_RE.test(w.closeTime) || toMin(w.openTime) >= toMin(w.closeTime)) {
// //         throw httpError(400, 'Invalid open/close time')
// //       }
// //       return { day: int(w.day, 0, 6, 'day'), open: !!w.open, openTime: w.openTime, closeTime: w.closeTime }
// //     })
// //   }
// //   await s.save()
// //   ok(res, s)
// // })

// // /* ---------------------------- order drawer actions ---------------------------- */
// // const loadOrder = async (id) => {
// //   const o = await Order.findById(id).populate('customer_id', 'name mobile')
// //   if (!o) throw httpError(404, 'Order not found')
// //   return o
// // }
// // const detailOf = async (o) => {
// //   const s = await PreorderSettings.get()
// //   const items = (await loadItems([o._id]))[String(o._id)] || []
// //   const payment = await loadPayment(o._id)
// //   return mapOrderDetail(o, items, payment, s)
// // }

// // exports.getOrder = wrap(async (req, res) => {
// //   ok(res, await detailOf(await loadOrder(req.params.id)))
// // })

// // exports.startOrder = wrap(async (req, res) => {
// //   if (!ST.preparing) throw httpError(500, 'ORDER_STATUS has no PROCESSING value; set it in utils/constants.js')
// //   const o = await loadOrder(req.params.id)
// //   if (!canMove(o.status, ST.preparing)) {
// //     throw httpError(409, `Cannot start preparing: order is ${cap(o.status)}. Confirm it first.`)
// //   }
// //   o.status = ST.preparing
// //   await o.save()
// //   emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
// //   ok(res, await detailOf(o))
// // })

// // exports.cancelOrder = wrap(async (req, res) => {
// //   if (!ST.cancelled) throw httpError(500, 'ORDER_STATUS has no CANCELLED value; set it in utils/constants.js')
// //   const o = await loadOrder(req.params.id)
// //   if (!canMove(o.status, ST.cancelled)) {
// //     throw httpError(409, `Cannot cancel an order that is ${cap(o.status)}.`)
// //   }
// //   o.status = ST.cancelled
// //   o.cancelled_at = new Date()
// //   o.cancel_reason = (req.body.reason || 'Cancelled by admin').toString().slice(0, 200)
// //   o.refund_status = PAID && o.payment_status === PAID ? 'pending' : 'none'
// //   // TODO: call your payment gateway refund here, then set o.refund_status = 'refunded'
// //   await o.save()
// //   emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
// //   ok(res, await detailOf(o))
// // })

// // exports.printKot = wrap(async (req, res) => {
// //   const o = await loadOrder(req.params.id)
// //   if (!o.kot_printed_at) {
// //     o.kot_printed_at = new Date()
// //     await o.save()
// //   }
// //   const d = await detailOf(o)
// //   ok(res, {
// //     orderNumber: d.orderNumber,
// //     when: d.when,
// //     type: d.type,
// //     customer: d.customer.name,
// //     items: d.items.map((i) => ({ name: i.name, sizeLabel: i.sizeLabel, qty: i.qty })),
// //   })
// // })
// // // GET /api/customer/orders/slots?date=YYYY-MM-DD  (customer app: which slots can I pick?)
// // exports.getCustomerSlots = wrap(async (req, res) => {
// //   const date = needDate(req.query.date)
// //   if (date < todayIST()) throw httpError(400, 'Date cannot be in the past')
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor([date], s)
// //   const day = buildDay(date, s, c.slot[date])

// //   const label = { open: 'available', full: 'full', too_soon: 'too_soon', blocked: 'unavailable', past: 'past' }
// //   ok(res, {
// //     date,
// //     label: dayLabel(date),
// //     closed: day.closed,
// //     openTime: day.openTime,
// //     closeTime: day.closeTime,
// //     slots: day.slots.map((x) => ({
// //       start: x.start,
// //       end: x.end,
// //       label: x.label,
// //       available: x.status === 'open',
// //       status: label[x.status],
// //       requested_at: `${date}T${x.start}:00+05:30`, // send this value as requested_at when ordering
// //     })),
// //   })
// // })
// // // Describe the requested pre-order time for the Orders page.
// // const describeWhen = (requestedAt, settings) => {
// //   if (!requestedAt || !settings) return null;

// //   const { date, mins } = istOf(requestedAt);
// //   const start = slotStartFor(settings, date, mins);
// //   const end = toHHmm(toMin(start) + settings.slotMinutes);

// //   return {
// //     date,
// //     startAt: instant(date, start),
// //     label: `${dayLabel(date)} · ${slotLabel(start, end)}`,
// //   };
// // };
// // exports.describeWhen = describeWhen;
// // const crypto = require('crypto') // NEW
// // const Order = require('../models/Order')
// // const OrderItem = require('../models/OrderItem')
// // const PreorderSettings = require('../models/PreorderSettings')
// // const SlotLock = require('../models/SlotLock') // NEW
// // const { ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, VALID_TRANSITIONS } = require('../utils/constants')
// // const { emitToAdmins } = require('../sockets')

// // // Payment model is optional: if it fails to load, payment method/reference stay blank
// // let Payment = null
// // try {
// //   Payment = require('../models/Payment')
// // } catch {}

// // /* ------------------- constants resolved from YOUR constants.js ------------------- */
// // const pickVal = (obj, ...keys) => {
// //   for (const k of keys) if (obj && obj[k] !== undefined) return obj[k]
// // }
// // const PREORDER_TYPE =
// //   ORDER_TYPES.PRE_ORDER || Object.values(ORDER_TYPES || {}).find((v) => /pre/i.test(String(v)))

// // const ST = {
// //   cancelled: pickVal(ORDER_STATUS, 'CANCELLED', 'CANCELED'),
// //   preparing: pickVal(ORDER_STATUS, 'PROCESSING', 'PREPARING', 'IN_PROGRESS'),
// //   ready: pickVal(ORDER_STATUS, 'READY', 'READY_FOR_PICKUP'),
// //   done: ['COMPLETED', 'DELIVERED', 'PICKED_UP', 'OUT_FOR_DELIVERY']
// //     .map((k) => ORDER_STATUS[k])
// //     .filter(Boolean),
// // }
// // const PAID = pickVal(PAYMENT_STATUS, 'PAID', 'SUCCESS', 'COMPLETED')

// // // These statuses do NOT hold a slot
// // const NOT_BOOKED = ['CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED']

// // const canMove = (from, to) => (VALID_TRANSITIONS[from] || []).includes(to)

// // // screen status: scheduled | preparing | ready | completed | cancelled
// // const uiStatus = (st) => {
// //   if (st === ST.cancelled) return 'cancelled'
// //   if (st === ST.preparing) return 'preparing'
// //   if (st === ST.ready) return 'ready'
// //   if (ST.done.includes(st)) return 'completed'
// //   return 'scheduled'
// // }

// // /* ------------------- slot status -> what the screens show ------------------- */
// // // NEW: only "open" slots can be selected. full / blocked / too_soon / past are disabled.
// // const SLOT_UI = {
// //   open: { disabled: false, label: 'Available', customerStatus: 'available' },
// //   full: { disabled: true, label: 'Slot filled', customerStatus: 'full' },
// //   blocked: { disabled: true, label: 'Unavailable', customerStatus: 'unavailable' },
// //   too_soon: { disabled: true, label: 'Not available', customerStatus: 'too_soon' },
// //   past: { disabled: true, label: 'Time passed', customerStatus: 'past' },
// // }
// // /* ----------------------------- time helpers (IST) ---------------------------- */
// // const IST_MS = 330 * 60000
// // const pad = (n) => String(n).padStart(2, '0')
// // const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// // const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// // const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
// // const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

// // const ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
// // const todayIST = () => ymd(new Date(Date.now() + IST_MS))
// // const addDays = (s, n) => {
// //   const d = new Date(`${s}T00:00:00Z`)
// //   d.setUTCDate(d.getUTCDate()+n)
// //   return ymd(d)
// // }
// // const weekday = (s) => new Date(`${s}T00:00:00Z`).getUTCDay()
// // const toMin = (t) => {
// //   const [h, m] = t.split(':').map(Number)
// //   return h * 60+m
// // }
// // const toHHmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
// // const instant = (date, hhmm) => new Date(`${date}T${hhmm}:00+05:30`).getTime()
// // const istOf = (d) => {
// //   const x = new Date(new Date(d).getTime() + IST_MS)
// //   return { date: ymd(x), mins: x.getUTCHours() * 60 + x.getUTCMinutes() }
// // }

// // const fmtTime = (m) => {
// //   const h = Math.floor(m / 60)
// //   const mm = m % 60
// //   const ap = h >= 12 ? 'PM' : 'AM'
// //   const h12 = h % 12 || 12
// //   return mm ? `${h12}:${pad(mm)} ${ap}` : `${h12} ${ap}`
// // }
// // const slotLabel = (s, e) => `${fmtTime(toMin(s))} – ${fmtTime(toMin(e))}`

// // const dayLabel = (s) => {
// //   const t = todayIST()
// //   if (s === t) return 'Today'
// //   if (s === addDays(t, 1)) return 'Tomorrow'
// //   const d = new Date(`${s}T00:00:00Z`)
// //   return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
// // }
// // const tabLabel = (s) => {
// //   const t = todayIST()
// //   if (s === t) return 'Today'
// //   if (s === addDays(t, 1)) return 'Tomorrow'
// //   return WD[weekday(s)]
// // }
// // const fmtPlaced = (createdAt) => {
// //   const { date, mins } = istOf(createdAt)
// //   const t = todayIST()
// //   const rel =
// //     date === t
// //       ? 'Today'
// //       : date === addDays(t, -1)
// //       ? 'Yesterday'
// //       : `${Number(date.slice(8))} ${MON[Number(date.slice(5, 7)) - 1]}`
// //   return `${rel} ${fmtTime(mins)}`
// // }
// // const cap = (s = '') => {
// //   const t = String(s).toLowerCase().replace(/_/g, ' ')
// //   return t.charAt(0).toUpperCase() + t.slice(1)
// // }
// // /* --------------------------------- plumbing --------------------------------- */
// // // NEW: errors now carry a code (SLOT_FULL, SLOT_BLOCKED, ...)
// // const httpError = (status, message, code) =>
// //   Object.assign(new Error(message), { status, code })
// // const wrap = (fn) => async (req, res) => {
// //   try {
// //     await fn(req, res)
// //   } catch (e) {
// //     res
// //       .status(e.status || 500)
// //       .json({ success: false, message: e.message || 'Server error', code: e.code })
// //   }
// // }
// // const ok = (res, data) => res.json({ success: true, data })
// // const needDate = (v) => {
// //   if (!DATE_RE.test(v || '')) throw httpError(400, 'date must be YYYY-MM-DD')
// //   return v
// // }
// // const needTime = (v) => {
// //   if (!TIME_RE.test(v || '')) throw httpError(400, 'start must be HH:mm')
// //   return v
// // }

// // /* ----------------------------- order queries/mapping ----------------------------- */
// // const rangeFilter = (fromMs, toMs) => {
// //   const f = {
// //     requested_at: { $gte: new Date(fromMs), $lt: new Date(toMs) },
// //     status: { $nin: NOT_BOOKED },
// //   }
// //   if (PREORDER_TYPE) f.order_type = PREORDER_TYPE
// //   return f
// // }
// // const dayRange = (date) => [instant(date, '00:00'), instant(addDays(date, 1), '00:00')]

// // const slotStartFor = (s, date, mins) => {
// //   const cfg = s.weekly.find((w) => w.day === weekday(date))
// //   const open = toMin(cfg?.openTime || '11:00')
// //   const idx = Math.max(0, Math.floor((mins - open) / s.slotMinutes))
// //   return toHHmm(open + idx * s.slotMinutes)
// // }

// // const normalizeItem = (r) => ({
// //   name: r.product_name_snapshot || 'Item',
// //   nameTe: '',
// //   sizeLabel: r.variant_name_snapshot || '',
// //   qty: r.quantity,
// //   lineTotal: r.subtotal,
// // })

// // async function loadItems(orderIds) {
// //   if (!orderIds.length) return {}
// //   const rows = await OrderItem.find({ order_id: { $in: orderIds } }).lean()
// //   const map = {}
// //   for (const r of rows) (map[String(r.order_id)] ||= []).push(normalizeItem(r))
// //   return map
// // }
// // const loadPayment = async (orderId) =>
// //   Payment ? Payment.findOne({ order_id: orderId }).sort({ createdAt: -1 }).lean() : null

// // const customerOf = (o) => ({
// //   name: o.customer_id?.name || 'Guest',
// //   phone: o.customer_id?.mobile || '',
// // })

// // const mapBooking = (o, items, s) => {
// //   const { date, mins } = istOf(o.requested_at)
// //   const start = slotStartFor(s, date, mins)
// //   return {
// //     id: o._id,
// //     orderNumber: o.order_number,
// //     status: uiStatus(o.status),
// //     summary: (items || []).map((i) => `${i.name}${i.sizeLabel ? ' ' + i.sizeLabel : ''} ×${i.qty}`).join(', '),
// //     customerName: customerOf(o).name,
// //     typeLabel: cap(o.fulfillment_type || 'pickup'),
// //     startLabel: fmtTime(toMin(start)),
// //     total: o.total_amount,
// //   }
// // }

// // const mapOrderDetail = (o, items, payment, s) => {
// //   let when = '—'
// //   if (o.requested_at) {
// //     const { date, mins } = istOf(o.requested_at)
// //     const start = slotStartFor(s, date, mins)
// //     const end = toHHmm(toMin(start) + s.slotMinutes)
// //     when = `${dayLabel(date)} · ${slotLabel(start, end)}`
// //   }
// //   return {
// //     id: o._id,
// //     orderNumber: o.order_number,
// //     status: uiStatus(o.status),
// //     placed: fmtPlaced(o.createdAt),
// //     type: cap(o.fulfillment_type || 'pickup'),
// //     when,
// //     kotPrinted: !!o.kot_printed_at,
// //     customer: customerOf(o),
// //     items: items || [],
// //     subtotal: o.subtotal,
// //     packing: o.packing_charge || 0,
// //     delivery: o.delivery_charge || 0,
// //     total: o.total_amount,
// //     payment: {
// //       method: String(payment?.method || payment?.payment_method || '').toUpperCase(),
// //       status: cap(o.payment_status || ''),
// //       reference:
// //         payment?.gateway_payment_id ||
// //         payment?.razorpay_payment_id ||
// //         payment?.transaction_id ||
// //         payment?.reference ||
// //         '',
// //     },
// //   }
// // }

// // /* ------------------------------ schedule engine ------------------------------ */
// // const isClosed = (s, date) => {
// //   const o = s.dayOverrides.find((x) => x.date === date)
// //   if (o) return o.closed
// //   const cfg = s.weekly.find((w) => w.day === weekday(date))
// //   return !cfg || !cfg.open
// // }

// // async function countsFor(dates, s) {
// //   const from = instant(dates[0], '00:00')
// //   const to = instant(addDays(dates[dates.length - 1], 1), '00:00')
// //   const rows = await Order.find(rangeFilter(from, to)).select('requested_at has_hundi').lean()

// //   const slot = {}
// //   const total = {}
// //   const hundi = {}
// //   for (const r of rows) {
// //     const { date, mins } = istOf(r.requested_at)
// //     const start = slotStartFor(s, date, mins)
// //     ;(slot[date] ||= {})[start] = (slot[date][start] || 0) + 1
// //     total[date] = (total[date] || 0) + 1
// //     if (r.has_hundi) hundi[date] = (hundi[date] || 0) + 1
// //   }
// //   return { slot, total, hundi }
// // }

// // // extraLeadMinutes: optional longer lead time (e.g. items that need long preparation)
// // function buildDay(date, s, slotCounts = {}, extraLeadMinutes = 0) {
// //   const cfg = s.weekly.find((w) => w.day === weekday(date)) || { openTime: '11:00', closeTime: '22:00' }
// //   const closed = isClosed(s, date)
// //   const now = Date.now()
// //   const earliest = now + Math.max(s.leadTimeMinutes, extraLeadMinutes) * 60000
// //   const slots = []
// //   let firstBookable = null

// //   if (!closed) {
// //     const open = toMin(cfg.openTime)
// //     const close = toMin(cfg.closeTime)
// //     for (let m = open; m + s.slotMinutes <= close; m += s.slotMinutes) {
// //       const start = toHHmm(m)
// //       const end = toHHmm(m + s.slotMinutes)
// //       const startAt = instant(date, start)
// //       const endAt = instant(date, end)
// //       const booked = slotCounts[start] || 0
// //       const blocked = s.blockedSlots.some((b) => b.date === date && b.start === start)

// //       let status = 'open'
// //       if (endAt <= now) status = 'past'
// //       else if (blocked) status = 'blocked'
// //       else if (startAt < earliest) status = 'too_soon'
// //       else if (booked >= s.capacityPerSlot) status = 'full'

// //       if (!firstBookable && startAt >= earliest) firstBookable = fmtTime(m)

// //       slots.push({
// //         start,
// //         end,
// //         label: slotLabel(start, end),
// //         booked,
// //         capacity: s.capacityPerSlot,
// //         status,
// //         disabled: SLOT_UI[status].disabled, // NEW: true for full / blocked / too_soon / past
// //         statusLabel: SLOT_UI[status].label, // NEW: "Slot filled", "Unavailable", ...
// //       })
// //     }
// //   }
// //   return { closed, openTime: cfg.openTime, closeTime: cfg.closeTime, slots, firstBookable }
// // }

// // // NEW: summary of a whole day for the customer app
// // const dayState = (day) => {
// //   if (day.closed) {
// //     return { openSlots: 0, status: 'closed', message: 'We are closed on this day.' }
// //   }
// //   const openSlots = day.slots.filter((x) => !x.disabled).length
// //   if (openSlots > 0) return { openSlots, status: 'available', message: '' }

// //   const filled = day.slots.some((x) => x.status === 'full' || x.status === 'blocked')
// //   return filled
// //     ? {
// //         openSlots: 0,
// //         status: 'full',
// //         message: 'All slots are filled for this day. Please choose another date.',
// //       }
// //     : { openSlots: 0, status: 'unavailable', message: 'No slots available for this day.' }
// // }

// // // NEW
// // const prepMinutes = (hours) => {
// //   const h = Number(hours)
// //   return Number.isFinite(h) && h > 0 ? Math.min(h, 168) * 60 : 0
// // }

// // /**
// //  * Used by orderController.validateAndCreateOrder before saving a pre-order.
// //  * Checks closed day, exact slot, lead time, blocked slot, slot capacity and
// //  * daily Hundi capacity. Throws an error with .status, .code and .message.
// //  * Call it INSIDE withDayLock so two customers cannot take the last seat together.
// //  */
// // exports.assertSlotAvailable = async (requestedAt, { hasHundi = false } = {}) => {
// //   const s = await PreorderSettings.get()

// //   const { date, mins } = istOf(requestedAt)

// //   const c = await countsFor([date], s)
// //   const day = buildDay(date, s, c.slot[date])

// //   if (day.closed) {
// //     throw httpError(409, 'We are closed on that day', 'DAY_CLOSED')
// //   }

// //   const start = slotStartFor(s, date, mins)

// //   // Only accept the exact start time of a generated slot (11:00 ok, 11:15 not ok)
// //   if (mins !== toMin(start)) {
// //     throw httpError(400, 'Please select a valid pre-order slot', 'INVALID_SLOT')
// //   }

// //   const slot = day.slots.find((item) => item.start === start)

// //   if (!slot) {
// //     throw httpError(400, 'That time is outside our pre-order hours', 'INVALID_SLOT')
// //   }

// //   const reasons = {
// //     past: { message: 'That slot has already passed', code: 'SLOT_PAST' },
// //     blocked: { message: 'This slot is unavailable. Please choose another slot.', code: 'SLOT_BLOCKED' },
// //     too_soon: {
// //       message: `Pre-orders need at least ${s.leadTimeMinutes} minutes notice`,
// //       code: 'SLOT_TOO_SOON',
// //     },
// //     full: { message: 'This slot is filled. Please choose another slot.', code: 'SLOT_FULL' },
// //   }

// //   if (slot.status !== 'open') {
// //     const r = reasons[slot.status] || { message: 'That slot is unavailable', code: 'SLOT_UNAVAILABLE' }
// //     throw httpError(409, r.message, r.code)
// //   }

// //   if (hasHundi && (c.hundi[date] || 0) >= s.hundiCapacityPerDay) {
// //     throw httpError(409, 'Hundi bookings are full for that day', 'HUNDI_FULL')
// //   }
// // }

// // // NEW: runs fn() while holding a short lock for that pre-order day,
// // // so two customers cannot both take the last seat of a slot.
// // exports.withDayLock = async (requestedAt, fn) => {
// //   const { date } = istOf(requestedAt)
// //   const key = `preorder:${date}`
// //   const token = crypto.randomUUID()
// //   const LOCK_MS = 15000
// //   let locked = false

// //   for (let i = 0; i < 20 && !locked; i++) {
// //     const now = new Date()
// //     try {
// //       await SlotLock.findOneAndUpdate(
// //         { key, expiresAt: { $lt: now } },
// //         { $set: { token, expiresAt: new Date(now.getTime() + LOCK_MS) } },
// //         { upsert: true }
// //       )
// //       locked = true
// //     } catch (e) {
// //       if (e.code !== 11000) throw e // 11000 = another request holds the lock
// //       await new Promise((r) => setTimeout(r, 150))
// //     }
// //   }

// //   if (!locked) {
// //     throw httpError(503, 'Too many bookings at once. Please try again.', 'SLOT_BUSY')
// //   }

// //   try {
// //     return await fn()
// //   } finally {
// //     await SlotLock.deleteOne({ key, token })
// //   }
// // }

// // /* --------------------------------- handlers --------------------------------- */
// // exports.getWeek = wrap(async (req, res) => {
// //   const today = todayIST()
// //   const from = req.query.from ? needDate(req.query.from) : today
// //   const dates = Array.from({ length: 7 }, (_, i) => addDays(from, i))
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor(dates, s)

// //   ok(res, {
// //     today,
// //     days: dates.map((date) => ({
// //       date,
// //       tabLabel: tabLabel(date),
// //       dayNumber: Number(date.slice(8)),
// //       closed: isClosed(s, date),
// //       booked: c.total[date] || 0,
// //     })),
// //   })
// // })

// // exports.getDay = wrap(async (req, res) => {
// //   const date = needDate(req.query.date)
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor([date], s)
// //   const day = buildDay(date, s, c.slot[date])

// //   const [from, to] = dayRange(date)
// //   const orders = await Order.find(rangeFilter(from, to))
// //     .populate('customer_id', 'name mobile')
// //     .sort({ requested_at: 1, createdAt: 1 })
// //     .lean()
// //   const itemsMap = await loadItems(orders.map((o) => o._id))

// //   const isToday = date === todayIST()
// //   ok(res, {
// //     date,
// //     label: dayLabel(date),
// //     isToday,
// //     closed: day.closed,
// //     openTime: day.openTime,
// //     closeTime: day.closeTime,
// //     capacityPerSlot: s.capacityPerSlot,
// //     hundi: { used: c.hundi[date] || 0, capacity: s.hundiCapacityPerDay },
// //     sameDayFrom: isToday ? day.firstBookable : null,
// //     slots: day.slots,
// //     bookings: orders.map((o) => mapBooking(o, itemsMap[String(o._id)], s)),
// //   })
// // })

// // exports.blockSlot = wrap(async (req, res) => {
// //   const date = needDate(req.body.date)
// //   const start = needTime(req.body.start)
// //   const s = await PreorderSettings.get()
// //   if (!s.blockedSlots.some((b) => b.date === date && b.start === start)) {
// //     s.blockedSlots.push({ date, start })
// //     await s.save()
// //   }
// //   ok(res, { date, start, blocked: true })
// // })

// // exports.unblockSlot = wrap(async (req, res) => {
// //   const date = needDate(req.body.date)
// //   const start = needTime(req.body.start)
// //   const s = await PreorderSettings.get()
// //   s.blockedSlots = s.blockedSlots.filter((b) => !(b.date === date && b.start === start))
// //   await s.save()
// //   ok(res, { date, start, blocked: false })
// // })

// // exports.setDayClosed = wrap(async (req, res) => {
// //   const date = needDate(req.body.date)
// //   if (typeof req.body.closed !== 'boolean') throw httpError(400, 'closed must be true or false')
// //   const s = await PreorderSettings.get()
// //   s.dayOverrides = s.dayOverrides.filter((o) => o.date !== date)
// //   s.dayOverrides.push({ date, closed: req.body.closed })
// //   await s.save()
// //   ok(res, { date, closed: req.body.closed })
// // })

// // exports.getSettings = wrap(async (req, res) => {
// //   ok(res, await PreorderSettings.get())
// // })

// // exports.updateSettings = wrap(async (req, res) => {
// //   const b = req.body
// //   const s = await PreorderSettings.get()
// //   const int = (v, min, max, name) => {
// //     if (!Number.isInteger(v) || v < min || v > max) throw httpError(400, `${name} must be ${min}-${max}`)
// //     return v
// //   }
// //   if (b.leadTimeMinutes !== undefined) s.leadTimeMinutes = int(b.leadTimeMinutes, 0, 10080, 'leadTimeMinutes')
// //   if (b.slotMinutes !== undefined) s.slotMinutes = int(b.slotMinutes, 15, 480, 'slotMinutes')
// //   if (b.capacityPerSlot !== undefined) s.capacityPerSlot = int(b.capacityPerSlot, 1, 500, 'capacityPerSlot')
// //   if (b.hundiCapacityPerDay !== undefined) s.hundiCapacityPerDay = int(b.hundiCapacityPerDay, 0, 500, 'hundiCapacityPerDay')
// //   if (b.weekly !== undefined) {
// //     if (!Array.isArray(b.weekly) || b.weekly.length !== 7) throw httpError(400, 'weekly needs 7 entries')
// //     s.weekly = b.weekly.map((w) => {
// //       if (!TIME_RE.test(w.openTime) || !TIME_RE.test(w.closeTime) || toMin(w.openTime) >= toMin(w.closeTime)) {
// //         throw httpError(400, 'Invalid open/close time')
// //       }
// //       return { day: int(w.day, 0, 6, 'day'), open: !!w.open, openTime: w.openTime, closeTime: w.closeTime }
// //     })
// //   }
// //   await s.save()
// //   ok(res, s)
// // })

// // /* ---------------------------- order drawer actions ---------------------------- */
// // const loadOrder = async (id) => {
// //   const o = await Order.findById(id).populate('customer_id', 'name mobile')
// //   if (!o) throw httpError(404, 'Order not found')
// //   return o
// // }
// // const detailOf = async (o) => {
// //   const s = await PreorderSettings.get()
// //   const items = (await loadItems([o._id]))[String(o._id)] || []
// //   const payment = await loadPayment(o._id)
// //   return mapOrderDetail(o, items, payment, s)
// // }

// // exports.getOrder = wrap(async (req, res) => {
// //   ok(res, await detailOf(await loadOrder(req.params.id)))
// // })

// // exports.startOrder = wrap(async (req, res) => {
// //   if (!ST.preparing) throw httpError(500, 'ORDER_STATUS has no PROCESSING value; set it in utils/constants.js')
// //   const o = await loadOrder(req.params.id)
// //   if (!canMove(o.status, ST.preparing)) {
// //     throw httpError(409, `Cannot start preparing: order is ${cap(o.status)}. Confirm it first.`)
// //   }
// //   o.status = ST.preparing
// //   await o.save()
// //   emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
// //   ok(res, await detailOf(o))
// // })

// // exports.cancelOrder = wrap(async (req, res) => {
// //   if (!ST.cancelled) throw httpError(500, 'ORDER_STATUS has no CANCELLED value; set it in utils/constants.js')
// //   const o = await loadOrder(req.params.id)
// //   if (!canMove(o.status, ST.cancelled)) {
// //     throw httpError(409, `Cannot cancel an order that is ${cap(o.status)}.`)
// //   }
// //   o.status = ST.cancelled
// //   o.cancelled_at = new Date()
// //   o.cancel_reason = (req.body.reason || 'Cancelled by admin').toString().slice(0, 200)
// //   o.refund_status = PAID && o.payment_status === PAID ? 'pending' : 'none'
// //   // TODO: call your payment gateway refund here, then set o.refund_status = 'refunded'
// //   await o.save()
// //   emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
// //   ok(res, await detailOf(o))
// // })

// // exports.printKot = wrap(async (req, res) => {
// //   const o = await loadOrder(req.params.id)
// //   if (!o.kot_printed_at) {
// //     o.kot_printed_at = new Date()
// //     await o.save()
// //   }
// //   const d = await detailOf(o)
// //   ok(res, {
// //     orderNumber: d.orderNumber,
// //     when: d.when,
// //     type: d.type,
// //     customer: d.customer.name,
// //     items: d.items.map((i) => ({ name: i.name, sizeLabel: i.sizeLabel, qty: i.qty })),
// //   })
// // })

// // /* ------------------------------- customer app ------------------------------- */
// // // NEW: GET /api/customer/orders/slot-days?from=YYYY-MM-DD&days=7&prep_hours=3
// // // Date chips: a day whose slots are all filled comes back with available=false and a message.
// // exports.getCustomerDays = wrap(async (req, res) => {
// //   const today = todayIST()
// //   let from = req.query.from ? needDate(req.query.from) : today
// //   if (from < today) from = today
// //   const count = Math.min(14, Math.max(1, Number(req.query.days) || 7))
// //   const extra = prepMinutes(req.query.prep_hours)

// //   const dates = Array.from({ length: count }, (_, i) => addDays(from, i))
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor(dates, s)

// //   ok(res, {
// //     today,
// //     days: dates.map((date) => {
// //       const day = buildDay(date, s, c.slot[date], extra)
// //       const st = dayState(day)
// //       return {
// //         date,
// //         tabLabel: tabLabel(date),
// //         dayNumber: Number(date.slice(8)),
// //         label: dayLabel(date),
// //         status: st.status, // available | full | closed | unavailable
// //         available: st.openSlots > 0,
// //         open_slots: st.openSlots,
// //         message: st.message,
// //       }
// //     }),
// //   })
// // })

// // // GET /api/customer/orders/slots?date=YYYY-MM-DD&prep_hours=3  (customer app: which slots can I pick?)
// // // Full / blocked slots come back with disabled=true and a message.
// // exports.getCustomerSlots = wrap(async (req, res) => {
// //   const date = needDate(req.query.date)
// //   if (date < todayIST()) throw httpError(400, 'Date cannot be in the past')
// //   const extra = prepMinutes(req.query.prep_hours)

// //   const s = await PreorderSettings.get()
// //   const c = await countsFor([date], s)
// //   const day = buildDay(date, s, c.slot[date], extra)
// //   const st = dayState(day)

// //   ok(res, {
// //     date,
// //     label: dayLabel(date),
// //     closed: day.closed,
// //     openTime: day.openTime,
// //     closeTime: day.closeTime,
// //     available: st.openSlots > 0,
// //     all_full: st.status === 'full',
// //     message: st.message, // e.g. "All slots are filled for this day. Please choose another date."
// //     slots: day.slots.map((x) => ({
// //       start: x.start,
// //       end: x.end,
// //       label: x.label,
// //       available: !x.disabled,
// //       disabled: x.disabled, // true => grey out and block the tap
// //       status: SLOT_UI[x.status].customerStatus, // available | full | unavailable | too_soon | past
// //       message: x.disabled ? SLOT_UI[x.status].label : '', // "Slot filled", "Unavailable", ...
// //       requested_at: `${date}T${x.start}:00+05:30`, // send this value as requested_at when ordering
// //     })),
// //   })
// // })

// // // NEW: used by utils/orderingGate.js (normal orders):
// // // allFull is true when every slot of TODAY that is not already past is full or blocked.
// // // exports.getTodayDayState = async () => {
// // //   const date = todayIST()
// // //   const s = await PreorderSettings.get()
// // //   const c = await countsFor([date], s)
// // //   const day = buildDay(date, s, c.slot[date])

// // //   const remaining = day.slots.filter((x) => x.status !== 'past')
// // //   const allFull =
// // //     !day.closed &&
// // //     remaining.length > 0 &&
// // //     remaining.every((x) => x.status === 'full' || x.status === 'blocked')

// // //   return { date, closed: day.closed, allFull }
// // // }
// // // Used by utils/orderingGate.js (normal orders):
// // // allFull is true when every slot of TODAY that is not already past is booked-full or blocked.
// // // (lead-time "too_soon" is ignored here: normal orders are not bound by the 2 hour lead time)
// // exports.getTodayDayState = async () => {
// //   const date = todayIST()
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor([date], s)
// //   const day = buildDay(date, s, c.slot[date])

// //   const remaining = day.slots.filter((x) => x.status !== 'past')
// //   const allFull =
// //     !day.closed &&
// //     remaining.length > 0 &&
// //     remaining.every((x) => x.status === 'blocked' || x.booked >= x.capacity)

// //   return { date, closed: day.closed, allFull }
// // }
// // // Describe the requested pre-order time for the Orders page.
// // const describeWhen = (requestedAt, settings) => {
// //   if (!requestedAt || !settings) return null

// //   const { date, mins } = istOf(requestedAt)
// //   const start = slotStartFor(settings, date, mins)
// //   const end = toHHmm(toMin(start) + settings.slotMinutes)
// //   return {
// //     date,
// //     startAt: instant(date, start),
// //     label: `${dayLabel(date)} · ${slotLabel(start, end)}`,
// //   }
// // }
// // exports.describeWhen = describeWhen
// const crypto = require('crypto') // NEW
// const Order = require('../models/Order')
// const OrderItem = require('../models/OrderItem')
// const PreorderSettings = require('../models/PreorderSettings')
// const SlotLock = require('../models/SlotLock') // NEW
// const { ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, VALID_TRANSITIONS } = require('../utils/constants')
// const { emitToAdmins } = require('../sockets')

// // Payment model is optional: if it fails to load, payment method/reference stay blank
// let Payment = null
// try {
//   Payment = require('../models/Payment')
// } catch {}

// /* ------------------- constants resolved from YOUR constants.js ------------------- */
// const pickVal = (obj, ...keys) => {
//   for (const k of keys) if (obj && obj[k] !== undefined) return obj[k]
// }
// const PREORDER_TYPE =
//   ORDER_TYPES.PRE_ORDER || Object.values(ORDER_TYPES || {}).find((v) => /pre/i.test(String(v)))

// const ST = {
//   cancelled: pickVal(ORDER_STATUS, 'CANCELLED', 'CANCELED'),
//   preparing: pickVal(ORDER_STATUS, 'PROCESSING', 'PREPARING', 'IN_PROGRESS'),
//   ready: pickVal(ORDER_STATUS, 'READY', 'READY_FOR_PICKUP'),
//   done: ['COMPLETED', 'DELIVERED', 'PICKED_UP', 'OUT_FOR_DELIVERY']
//     .map((k) => ORDER_STATUS[k])
//     .filter(Boolean),
// }
// const PAID = pickVal(PAYMENT_STATUS, 'PAID', 'SUCCESS', 'COMPLETED')

// // These statuses do NOT hold a slot
// // (also matches the exact values in utils/constants, whatever their spelling)
// const NOT_BOOKED = [
//   ...new Set(
//     [
//       'CANCELLED',
//       'PAYMENT_FAILED',
//       'PAYMENT_EXPIRED',
//       ORDER_STATUS.CANCELLED,
//       ORDER_STATUS.PAYMENT_FAILED,
//       ORDER_STATUS.PAYMENT_EXPIRED,
//     ].filter(Boolean)
//   ),
// ]

// const canMove = (from, to) => (VALID_TRANSITIONS[from] || []).includes(to)

// // screen status: scheduled | preparing | ready | completed | cancelled
// const uiStatus = (st) => {
//   if (st === ST.cancelled) return 'cancelled'
//   if (st === ST.preparing) return 'preparing'
//   if (st === ST.ready) return 'ready'
//   if (ST.done.includes(st)) return 'completed'
//   return 'scheduled'
// }

// /* ------------------- slot status -> what the screens show ------------------- */
// // NEW: only "open" slots can be selected. full / blocked / too_soon / past are disabled.
// const SLOT_UI = {
//   open: { disabled: false, label: 'Available', customerStatus: 'available' },
//   full: { disabled: true, label: 'Slot filled', customerStatus: 'full' },
//   blocked: { disabled: true, label: 'Unavailable', customerStatus: 'unavailable' },
//   too_soon: { disabled: true, label: 'Not available', customerStatus: 'too_soon' },
//   past: { disabled: true, label: 'Time passed', customerStatus: 'past' },
//   // NEW: the day's Hundi limit is reached, so no slot can take a Hundi order
//   hundi_full: { disabled: true, label: 'Hundi full', customerStatus: 'hundi_full' },
// }
// /* ----------------------------- time helpers (IST) ---------------------------- */
// const IST_MS = 330 * 60000
// const pad = (n) => String(n).padStart(2, '0')
// const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
// const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

// const ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
// const todayIST = () => ymd(new Date(Date.now() + IST_MS))
// const addDays = (s, n) => {
//   const d = new Date(`${s}T00:00:00Z`)
//   d.setUTCDate(d.getUTCDate()+n)
//   return ymd(d)
// }
// const weekday = (s) => new Date(`${s}T00:00:00Z`).getUTCDay()
// const toMin = (t) => {
//   const [h, m] = t.split(':').map(Number)
//   return h * 60+m
// }
// const toHHmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
// const instant = (date, hhmm) => new Date(`${date}T${hhmm}:00+05:30`).getTime()
// const istOf = (d) => {
//   const x = new Date(new Date(d).getTime() + IST_MS)
//   return { date: ymd(x), mins: x.getUTCHours() * 60 + x.getUTCMinutes() }
// }

// const fmtTime = (m) => {
//   const h = Math.floor(m / 60)
//   const mm = m % 60
//   const ap = h >= 12 ? 'PM' : 'AM'
//   const h12 = h % 12 || 12
//   return mm ? `${h12}:${pad(mm)} ${ap}` : `${h12} ${ap}`
// }
// const slotLabel = (s, e) => `${fmtTime(toMin(s))} – ${fmtTime(toMin(e))}`

// const dayLabel = (s) => {
//   const t = todayIST()
//   if (s === t) return 'Today'
//   if (s === addDays(t, 1)) return 'Tomorrow'
//   const d = new Date(`${s}T00:00:00Z`)
//   return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
// }
// const tabLabel = (s) => {
//   const t = todayIST()
//   if (s === t) return 'Today'
//   if (s === addDays(t, 1)) return 'Tomorrow'
//   return WD[weekday(s)]
// }
// const fmtPlaced = (createdAt) => {
//   const { date, mins } = istOf(createdAt)
//   const t = todayIST()
//   const rel =
//     date === t
//       ? 'Today'
//       : date === addDays(t, -1)
//       ? 'Yesterday'
//       : `${Number(date.slice(8))} ${MON[Number(date.slice(5, 7)) - 1]}`
//   return `${rel} ${fmtTime(mins)}`
// }
// const cap = (s = '') => {
//   const t = String(s).toLowerCase().replace(/_/g, ' ')
//   return t.charAt(0).toUpperCase() + t.slice(1)
// }
// /* --------------------------------- plumbing --------------------------------- */
// // NEW: errors now carry a code (SLOT_FULL, SLOT_BLOCKED, ...)
// const httpError = (status, message, code) =>
//   Object.assign(new Error(message), { status, code })
// const wrap = (fn) => async (req, res) => {
//   try {
//     await fn(req, res)
//   } catch (e) {
//     res
//       .status(e.status || 500)
//       .json({ success: false, message: e.message || 'Server error', code: e.code })
//   }
// }
// const ok = (res, data) => res.json({ success: true, data })
// const needDate = (v) => {
//   if (!DATE_RE.test(v || '')) throw httpError(400, 'date must be YYYY-MM-DD')
//   return v
// }
// const needTime = (v) => {
//   if (!TIME_RE.test(v || '')) throw httpError(400, 'start must be HH:mm')
//   return v
// }

// /* ----------------------------- order queries/mapping ----------------------------- */
// const rangeFilter = (fromMs, toMs) => {
//   const f = {
//     requested_at: { $gte: new Date(fromMs), $lt: new Date(toMs) },
//     status: { $nin: NOT_BOOKED },
//   }
//   if (PREORDER_TYPE) f.order_type = PREORDER_TYPE
//   return f
// }
// const dayRange = (date) => [instant(date, '00:00'), instant(addDays(date, 1), '00:00')]

// const slotStartFor = (s, date, mins) => {
//   const cfg = s.weekly.find((w) => w.day === weekday(date))
//   const open = toMin(cfg?.openTime || '11:00')
//   const idx = Math.max(0, Math.floor((mins - open) / s.slotMinutes))
//   return toHHmm(open + idx * s.slotMinutes)
// }

// const normalizeItem = (r) => ({
//   name: r.product_name_snapshot || 'Item',
//   nameTe: '',
//   sizeLabel: r.variant_name_snapshot || '',
//   qty: r.quantity,
//   lineTotal: r.subtotal,
// })

// async function loadItems(orderIds) {
//   if (!orderIds.length) return {}
//   const rows = await OrderItem.find({ order_id: { $in: orderIds } }).lean()
//   const map = {}
//   for (const r of rows) (map[String(r.order_id)] ||= []).push(normalizeItem(r))
//   return map
// }
// const loadPayment = async (orderId) =>
//   Payment ? Payment.findOne({ order_id: orderId }).sort({ createdAt: -1 }).lean() : null

// const customerOf = (o) => ({
//   name: o.customer_id?.name || 'Guest',
//   phone: o.customer_id?.mobile || '',
// })

// const mapBooking = (o, items, s) => {
//   const { date, mins } = istOf(o.requested_at)
//   const start = slotStartFor(s, date, mins)
//   return {
//     id: o._id,
//     orderNumber: o.order_number,
//     status: uiStatus(o.status),
//     summary: (items || []).map((i) => `${i.name}${i.sizeLabel ? ' ' + i.sizeLabel : ''} ×${i.qty}`).join(', '),
//     customerName: customerOf(o).name,
//     typeLabel: cap(o.fulfillment_type || 'pickup'),
//     startLabel: fmtTime(toMin(start)),
//     total: o.total_amount,
//   }
// }

// const mapOrderDetail = (o, items, payment, s) => {
//   let when = '—'
//   if (o.requested_at) {
//     const { date, mins } = istOf(o.requested_at)
//     const start = slotStartFor(s, date, mins)
//     const end = toHHmm(toMin(start) + s.slotMinutes)
//     when = `${dayLabel(date)} · ${slotLabel(start, end)}`
//   }
//   return {
//     id: o._id,
//     orderNumber: o.order_number,
//     status: uiStatus(o.status),
//     placed: fmtPlaced(o.createdAt),
//     type: cap(o.fulfillment_type || 'pickup'),
//     when,
//     kotPrinted: !!o.kot_printed_at,
//     customer: customerOf(o),
//     items: items || [],
//     subtotal: o.subtotal,
//     packing: o.packing_charge || 0,
//     delivery: o.delivery_charge || 0,
//     total: o.total_amount,
//     payment: {
//       method: String(payment?.method || payment?.payment_method || '').toUpperCase(),
//       status: cap(o.payment_status || ''),
//       reference:
//         payment?.gateway_payment_id ||
//         payment?.razorpay_payment_id ||
//         payment?.transaction_id ||
//         payment?.reference ||
//         '',
//     },
//   }
// }

// /* ------------------------------ schedule engine ------------------------------ */
// const isClosed = (s, date) => {
//   const o = s.dayOverrides.find((x) => x.date === date)
//   if (o) return o.closed
//   const cfg = s.weekly.find((w) => w.day === weekday(date))
//   return !cfg || !cfg.open
// }

// async function countsFor(dates, s) {
//   const from = instant(dates[0], '00:00')
//   const to = instant(addDays(dates[dates.length - 1], 1), '00:00')
//   const rows = await Order.find(rangeFilter(from, to)).select('requested_at has_hundi').lean()

//   const slot = {}
//   const total = {}
//   const hundi = {}
//   const hundiSlot = {}
//   for (const r of rows) {
//     const { date, mins } = istOf(r.requested_at)
//     const start = slotStartFor(s, date, mins)
//     ;(slot[date] ||= {})[start] = (slot[date][start] || 0) + 1
//     total[date] = (total[date] || 0) + 1
//     if (r.has_hundi) {
//       hundi[date] = (hundi[date] || 0) + 1
//       ;(hundiSlot[date] ||= {})[start] = (hundiSlot[date][start] || 0) + 1
//     }
//   }
//   return { slot, total, hundi, hundiSlot }
// }

// // Hundi limit.
// //   Default: hundiCapacityPerDay = Hundi pre-orders allowed per DAY (all slots together).
// //   If hundiCapacityPerSlot > 0 (pre-order settings) the limit is per SLOT instead
// //   and the day limit is ignored.
// // Each Hundi pre-order counts as 1, whatever its quantity.
// const hundiPerSlotCap = (s) => Math.max(0, Number(s.hundiCapacityPerSlot) || 0)

// const hundiLimitFor = (s, c, date) => {
//   const perSlot = hundiPerSlotCap(s)
//   return {
//     perSlot,
//     dayFull: perSlot === 0 && (c.hundi[date] || 0) >= s.hundiCapacityPerDay,
//     slotCounts: c.hundiSlot[date] || {},
//   }
// }

// // extraLeadMinutes: optional longer lead time (e.g. items that need long preparation)
// // hundiLimit: optional, from hundiLimitFor(). Pass it when the cart has Hundi:
// // slots that the Hundi limit closes are shown as disabled "Hundi full".
// function buildDay(date, s, slotCounts = {}, extraLeadMinutes = 0, hundiLimit = null) {
//   const cfg = s.weekly.find((w) => w.day === weekday(date)) || { openTime: '11:00', closeTime: '22:00' }
//   const closed = isClosed(s, date)
//   const now = Date.now()
//   const earliest = now + Math.max(s.leadTimeMinutes, extraLeadMinutes) * 60000
//   const slots = []
//   let firstBookable = null

//   if (!closed) {
//     const open = toMin(cfg.openTime)
//     const close = toMin(cfg.closeTime)
//     for (let m = open; m + s.slotMinutes <= close; m += s.slotMinutes) {
//       const start = toHHmm(m)
//       const end = toHHmm(m + s.slotMinutes)
//       const startAt = instant(date, start)
//       const endAt = instant(date, end)
//       const booked = slotCounts[start] || 0
//       const blocked = s.blockedSlots.some((b) => b.date === date && b.start === start)

//       let status = 'open'
//       if (endAt <= now) status = 'past'
//       else if (blocked) status = 'blocked'
//       else if (startAt < earliest) status = 'too_soon'
//       else if (booked >= s.capacityPerSlot) status = 'full'
//       else if (
//         hundiLimit &&
//         (hundiLimit.dayFull || (hundiLimit.perSlot > 0 && (hundiLimit.slotCounts[start] || 0) >= hundiLimit.perSlot))
//       )
//         status = 'hundi_full'

//       if (!firstBookable && startAt >= earliest) firstBookable = fmtTime(m)

//       slots.push({
//         start,
//         end,
//         label: slotLabel(start, end),
//         booked,
//         capacity: s.capacityPerSlot,
//         status,
//         disabled: SLOT_UI[status].disabled, // NEW: true for full / blocked / too_soon / past
//         statusLabel: SLOT_UI[status].label, // NEW: "Slot filled", "Unavailable", ...
//       })
//     }
//   }
//   return { closed, openTime: cfg.openTime, closeTime: cfg.closeTime, slots, firstBookable }
// }

// // NEW: summary of a whole day for the customer app
// const dayState = (day) => {
//   if (day.closed) {
//     return { openSlots: 0, status: 'closed', message: 'We are closed on this day.' }
//   }
//   const openSlots = day.slots.filter((x) => !x.disabled).length
//   if (openSlots > 0) return { openSlots, status: 'available', message: '' }

//   if (day.slots.some((x) => x.status === 'hundi_full')) {
//     return {
//       openSlots: 0,
//       status: 'hundi_full',
//       message: 'Hundi bookings are full for this day. Please choose another date.',
//     }
//   }

//   const filled = day.slots.some((x) => x.status === 'full' || x.status === 'blocked')
//   return filled
//     ? {
//         openSlots: 0,
//         status: 'full',
//         message: 'All slots are filled for this day. Please choose another date.',
//       }
//     : { openSlots: 0, status: 'unavailable', message: 'No slots available for this day.' }
// }

// // NEW
// const prepMinutes = (hours) => {
//   const h = Number(hours)
//   return Number.isFinite(h) && h > 0 ? Math.min(h, 168) * 60 : 0
// }

// /**
//  * Used by orderController.validateAndCreateOrder before saving a pre-order.
//  * Checks closed day, exact slot, lead time, blocked slot, slot capacity and
//  * daily Hundi capacity. Throws an error with .status, .code and .message.
//  * Call it INSIDE withDayLock so two customers cannot take the last seat together.
//  */
// exports.assertSlotAvailable = async (requestedAt, { hasHundi = false } = {}) => {
//   const s = await PreorderSettings.get()

//   const { date, mins } = istOf(requestedAt)

//   const c = await countsFor([date], s)
//   const day = buildDay(date, s, c.slot[date])

//   if (day.closed) {
//     throw httpError(409, 'We are closed on that day', 'DAY_CLOSED')
//   }

//   const start = slotStartFor(s, date, mins)

//   // Only accept the exact start time of a generated slot (11:00 ok, 11:15 not ok)
//   if (mins !== toMin(start)) {
//     throw httpError(400, 'Please select a valid pre-order slot', 'INVALID_SLOT')
//   }

//   const slot = day.slots.find((item) => item.start === start)

//   if (!slot) {
//     throw httpError(400, 'That time is outside our pre-order hours', 'INVALID_SLOT')
//   }

//   const reasons = {
//     past: { message: 'That slot has already passed', code: 'SLOT_PAST' },
//     blocked: { message: 'This slot is unavailable. Please choose another slot.', code: 'SLOT_BLOCKED' },
//     too_soon: {
//       message: `Pre-orders need at least ${s.leadTimeMinutes} minutes notice`,
//       code: 'SLOT_TOO_SOON',
//     },
//     full: { message: 'This slot is filled. Please choose another slot.', code: 'SLOT_FULL' },
//   }

//   if (slot.status !== 'open') {
//     const r = reasons[slot.status] || { message: 'That slot is unavailable', code: 'SLOT_UNAVAILABLE' }
//     throw httpError(409, r.message, r.code)
//   }

//   if (hasHundi) {
//     const perSlot = hundiPerSlotCap(s)

//     if (perSlot > 0) {
//       // Per-slot mode: only THIS slot's Hundi bookings matter
//       if (((c.hundiSlot[date] || {})[start] || 0) >= perSlot) {
//         throw httpError(409, 'Hundi bookings are full for this slot. Please choose another slot.', 'HUNDI_SLOT_FULL')
//       }
//     } else if ((c.hundi[date] || 0) >= s.hundiCapacityPerDay) {
//       throw httpError(409, 'Hundi bookings are full for that day', 'HUNDI_FULL')
//     }
//   }
// }

// // NEW: runs fn() while holding a short lock for that pre-order day,
// // so two customers cannot both take the last seat of a slot.
// exports.withDayLock = async (requestedAt, fn) => {
//   const { date } = istOf(requestedAt)
//   const key = `preorder:${date}`
//   const token = crypto.randomUUID()
//   const LOCK_MS = 15000
//   let locked = false

//   for (let i = 0; i < 20 && !locked; i++) {
//     const now = new Date()
//     try {
//       await SlotLock.findOneAndUpdate(
//         { key, expiresAt: { $lt: now } },
//         { $set: { token, expiresAt: new Date(now.getTime() + LOCK_MS) } },
//         { upsert: true }
//       )
//       locked = true
//     } catch (e) {
//       if (e.code !== 11000) throw e // 11000 = another request holds the lock
//       await new Promise((r) => setTimeout(r, 150))
//     }
//   }

//   if (!locked) {
//     throw httpError(503, 'Too many bookings at once. Please try again.', 'SLOT_BUSY')
//   }

//   try {
//     return await fn()
//   } finally {
//     await SlotLock.deleteOne({ key, token })
//   }
// }

// /* --------------------------------- handlers --------------------------------- */
// exports.getWeek = wrap(async (req, res) => {
//   const today = todayIST()
//   const from = req.query.from ? needDate(req.query.from) : today
//   const dates = Array.from({ length: 7 }, (_, i) => addDays(from, i))
//   const s = await PreorderSettings.get()
//   const c = await countsFor(dates, s)

//   ok(res, {
//     today,
//     days: dates.map((date) => ({
//       date,
//       tabLabel: tabLabel(date),
//       dayNumber: Number(date.slice(8)),
//       closed: isClosed(s, date),
//       booked: c.total[date] || 0,
//     })),
//   })
// })

// exports.getDay = wrap(async (req, res) => {
//   const date = needDate(req.query.date)
//   const s = await PreorderSettings.get()
//   const c = await countsFor([date], s)
//   const day = buildDay(date, s, c.slot[date])

//   const [from, to] = dayRange(date)
//   const orders = await Order.find(rangeFilter(from, to))
//     .populate('customer_id', 'name mobile')
//     .sort({ requested_at: 1, createdAt: 1 })
//     .lean()
//   const itemsMap = await loadItems(orders.map((o) => o._id))

//   const isToday = date === todayIST()
//   ok(res, {
//     date,
//     label: dayLabel(date),
//     isToday,
//     closed: day.closed,
//     openTime: day.openTime,
//     closeTime: day.closeTime,
//     capacityPerSlot: s.capacityPerSlot,
//     // mode "per_day": capacity = Hundi orders allowed for the whole day.
//     // mode "per_slot": capacity_per_slot = Hundi orders allowed in each slot.
//     // full = true means a Hundi order for this day will be refused.
//     hundi: (() => {
//       const perSlot = hundiPerSlotCap(s)
//       const used = c.hundi[date] || 0
//       const slotCounts = c.hundiSlot[date] || {}
//       const full =
//         perSlot > 0
//           ? !day.closed && !day.slots.some((x) => x.status === 'open' && (slotCounts[x.start] || 0) < perSlot)
//           : used >= s.hundiCapacityPerDay
//       return {
//         used,
//         capacity: s.hundiCapacityPerDay,
//         mode: perSlot > 0 ? 'per_slot' : 'per_day',
//         capacity_per_slot: perSlot,
//         full,
//       }
//     })(),
//     sameDayFrom: isToday ? day.firstBookable : null,
//     slots: day.slots.map((x) => ({ ...x, hundi_booked: (c.hundiSlot[date] || {})[x.start] || 0 })),
//     bookings: orders.map((o) => mapBooking(o, itemsMap[String(o._id)], s)),
//   })
// })

// exports.blockSlot = wrap(async (req, res) => {
//   const date = needDate(req.body.date)
//   const start = needTime(req.body.start)
//   const s = await PreorderSettings.get()
//   if (!s.blockedSlots.some((b) => b.date === date && b.start === start)) {
//     s.blockedSlots.push({ date, start })
//     await s.save()
//   }
//   ok(res, { date, start, blocked: true })
// })

// exports.unblockSlot = wrap(async (req, res) => {
//   const date = needDate(req.body.date)
//   const start = needTime(req.body.start)
//   const s = await PreorderSettings.get()
//   s.blockedSlots = s.blockedSlots.filter((b) => !(b.date === date && b.start === start))
//   await s.save()
//   ok(res, { date, start, blocked: false })
// })

// exports.setDayClosed = wrap(async (req, res) => {
//   const date = needDate(req.body.date)
//   if (typeof req.body.closed !== 'boolean') throw httpError(400, 'closed must be true or false')
//   const s = await PreorderSettings.get()
//   s.dayOverrides = s.dayOverrides.filter((o) => o.date !== date)
//   s.dayOverrides.push({ date, closed: req.body.closed })
//   await s.save()
//   ok(res, { date, closed: req.body.closed })
// })

// exports.getSettings = wrap(async (req, res) => {
//   ok(res, await PreorderSettings.get())
// })

// exports.updateSettings = wrap(async (req, res) => {
//   const b = req.body
//   const s = await PreorderSettings.get()
//   const int = (v, min, max, name) => {
//     if (!Number.isInteger(v) || v < min || v > max) throw httpError(400, `${name} must be ${min}-${max}`)
//     return v
//   }
//   if (b.leadTimeMinutes !== undefined) s.leadTimeMinutes = int(b.leadTimeMinutes, 0, 10080, 'leadTimeMinutes')
//   if (b.slotMinutes !== undefined) s.slotMinutes = int(b.slotMinutes, 15, 480, 'slotMinutes')
//   if (b.capacityPerSlot !== undefined) s.capacityPerSlot = int(b.capacityPerSlot, 1, 500, 'capacityPerSlot')
//   if (b.hundiCapacityPerDay !== undefined) s.hundiCapacityPerDay = int(b.hundiCapacityPerDay, 0, 500, 'hundiCapacityPerDay')
//   // 0 = off (use the per-day Hundi limit); 1+ = Hundi limit per slot, day limit ignored
//   if (b.hundiCapacityPerSlot !== undefined) s.hundiCapacityPerSlot = int(b.hundiCapacityPerSlot, 0, 500, 'hundiCapacityPerSlot')
//   if (b.weekly !== undefined) {
//     if (!Array.isArray(b.weekly) || b.weekly.length !== 7) throw httpError(400, 'weekly needs 7 entries')
//     s.weekly = b.weekly.map((w) => {
//       if (!TIME_RE.test(w.openTime) || !TIME_RE.test(w.closeTime) || toMin(w.openTime) >= toMin(w.closeTime)) {
//         throw httpError(400, 'Invalid open/close time')
//       }
//       return { day: int(w.day, 0, 6, 'day'), open: !!w.open, openTime: w.openTime, closeTime: w.closeTime }
//     })
//   }
//   await s.save()
//   ok(res, s)
// })

// /* ---------------------------- order drawer actions ---------------------------- */
// const loadOrder = async (id) => {
//   const o = await Order.findById(id).populate('customer_id', 'name mobile')
//   if (!o) throw httpError(404, 'Order not found')
//   return o
// }
// const detailOf = async (o) => {
//   const s = await PreorderSettings.get()
//   const items = (await loadItems([o._id]))[String(o._id)] || []
//   const payment = await loadPayment(o._id)
//   return mapOrderDetail(o, items, payment, s)
// }

// exports.getOrder = wrap(async (req, res) => {
//   ok(res, await detailOf(await loadOrder(req.params.id)))
// })

// exports.startOrder = wrap(async (req, res) => {
//   if (!ST.preparing) throw httpError(500, 'ORDER_STATUS has no PROCESSING value; set it in utils/constants.js')
//   const o = await loadOrder(req.params.id)
//   if (!canMove(o.status, ST.preparing)) {
//     throw httpError(409, `Cannot start preparing: order is ${cap(o.status)}. Confirm it first.`)
//   }
//   o.status = ST.preparing
//   await o.save()
//   emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
//   ok(res, await detailOf(o))
// })

// exports.cancelOrder = wrap(async (req, res) => {
//   if (!ST.cancelled) throw httpError(500, 'ORDER_STATUS has no CANCELLED value; set it in utils/constants.js')
//   const o = await loadOrder(req.params.id)
//   if (!canMove(o.status, ST.cancelled)) {
//     throw httpError(409, `Cannot cancel an order that is ${cap(o.status)}.`)
//   }
//   o.status = ST.cancelled
//   o.cancelled_at = new Date()
//   o.cancel_reason = (req.body.reason || 'Cancelled by admin').toString().slice(0, 200)
//   o.refund_status = PAID && o.payment_status === PAID ? 'pending' : 'none'
//   // TODO: call your payment gateway refund here, then set o.refund_status = 'refunded'
//   await o.save()
//   emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
//   ok(res, await detailOf(o))
// })

// exports.printKot = wrap(async (req, res) => {
//   const o = await loadOrder(req.params.id)
//   if (!o.kot_printed_at) {
//     o.kot_printed_at = new Date()
//     await o.save()
//   }
//   const d = await detailOf(o)
//   ok(res, {
//     orderNumber: d.orderNumber,
//     when: d.when,
//     type: d.type,
//     customer: d.customer.name,
//     items: d.items.map((i) => ({ name: i.name, sizeLabel: i.sizeLabel, qty: i.qty })),
//   })
// })

// /* ------------------------------- customer app ------------------------------- */
// // NEW: send has_hundi=true on slot-days / slots when the cart contains a Hundi.
// // A day whose Hundi limit is reached then comes back disabled ("Hundi full"),
// // matching the HUNDI_FULL check done when the order is placed.
// const wantsHundi = (req) => ['1', 'true', 'yes'].includes(String(req.query.has_hundi || '').toLowerCase())

// // NEW: GET /api/customer/orders/slot-days?from=YYYY-MM-DD&days=7&prep_hours=3&has_hundi=true
// // Date chips: a day whose slots are all filled comes back with available=false and a message.
// exports.getCustomerDays = wrap(async (req, res) => {
//   const today = todayIST()
//   let from = req.query.from ? needDate(req.query.from) : today
//   if (from < today) from = today
//   const count = Math.min(14, Math.max(1, Number(req.query.days) || 7))
//   const extra = prepMinutes(req.query.prep_hours)

//   const dates = Array.from({ length: count }, (_, i) => addDays(from, i))
//   const s = await PreorderSettings.get()
//   const c = await countsFor(dates, s)

//   ok(res, {
//     today,
//     days: dates.map((date) => {
//       const day = buildDay(date, s, c.slot[date], extra, wantsHundi(req) ? hundiLimitFor(s, c, date) : null)
//       const st = dayState(day)
//       return {
//         date,
//         tabLabel: tabLabel(date),
//         dayNumber: Number(date.slice(8)),
//         label: dayLabel(date),
//         status: st.status, // available | full | closed | unavailable | hundi_full
//         available: st.openSlots > 0,
//         open_slots: st.openSlots,
//         message: st.message,
//       }
//     }),
//   })
// })

// // GET /api/customer/orders/slots?date=YYYY-MM-DD&prep_hours=3  (customer app: which slots can I pick?)
// // Full / blocked slots come back with disabled=true and a message.
// exports.getCustomerSlots = wrap(async (req, res) => {
//   const date = needDate(req.query.date)
//   if (date < todayIST()) throw httpError(400, 'Date cannot be in the past')
//   const extra = prepMinutes(req.query.prep_hours)

//   const s = await PreorderSettings.get()
//   const c = await countsFor([date], s)
//   const day = buildDay(date, s, c.slot[date], extra, wantsHundi(req) ? hundiLimitFor(s, c, date) : null)
//   const st = dayState(day)

//   ok(res, {
//     date,
//     label: dayLabel(date),
//     closed: day.closed,
//     openTime: day.openTime,
//     closeTime: day.closeTime,
//     available: st.openSlots > 0,
//     all_full: st.status === 'full',
//     hundi_full: st.status === 'hundi_full',
//     message: st.message, // e.g. "All slots are filled for this day. Please choose another date."
//     slots: day.slots.map((x) => ({
//       start: x.start,
//       end: x.end,
//       label: x.label,
//       available: !x.disabled,
//       disabled: x.disabled, // true => grey out and block the tap
//       status: SLOT_UI[x.status].customerStatus, // available | full | unavailable | too_soon | past | hundi_full
//       message: x.disabled ? SLOT_UI[x.status].label : '', // "Slot filled", "Unavailable", ...
//       requested_at: `${date}T${x.start}:00+05:30`, // send this value as requested_at when ordering
//     })),
//   })
// })

// // NEW: GET /api/customer/orders/hundi-availability?from=YYYY-MM-DD&days=14
// // Daily Hundi availability, so the app can disable fully booked dates BEFORE checkout.
// // mode "per_day" (default): the limit is hundiCapacityPerDay for the whole day.
// // mode "per_slot": hundiCapacityPerSlot is the limit for each slot (day limit ignored).
// // Each Hundi pre-order counts as 1, whatever its quantity.
// // Cancelled / payment-failed / payment-expired orders do not count; pending ones do.
// exports.getHundiAvailability = wrap(async (req, res) => {
//   const today = todayIST()
//   let from = req.query.from ? needDate(req.query.from) : today
//   if (from < today) from = today
//   const count = Math.min(31, Math.max(1, Number(req.query.days) || 14))

//   const dates = Array.from({ length: count }, (_, i) => addDays(from, i))
//   const s = await PreorderSettings.get()
//   const c = await countsFor(dates, s)
//   const capacityPerDay = Number(s.hundiCapacityPerDay) || 0
//   const perSlot = hundiPerSlotCap(s)

//   ok(res, {
//     today,
//     mode: perSlot > 0 ? 'per_slot' : 'per_day',
//     capacity_per_day: capacityPerDay,
//     capacity_per_slot: perSlot,
//     days: dates.map((date) => {
//       const used = c.hundi[date] || 0
//       const closed = isClosed(s, date)
//       // slots a Hundi can still be booked in (normal slot rules + Hundi limit)
//       const day = buildDay(date, s, c.slot[date], 0, hundiLimitFor(s, c, date))
//       const slotCounts = c.hundiSlot[date] || {}
//       const openSlots = day.slots.filter((x) => !x.disabled).length
//       const hundiFull = !closed && day.slots.some((x) => x.status === 'hundi_full') && openSlots === 0
//       const remaining =
//         perSlot > 0
//           ? day.slots
//               .filter((x) => x.status === 'open')
//               .reduce((n, x) => n + Math.max(0, perSlot - (slotCounts[x.start] || 0)), 0)
//           : Math.max(0, capacityPerDay - used)
//       return {
//         date,
//         label: dayLabel(date),
//         closed,
//         used,
//         capacity: perSlot > 0 ? perSlot : capacityPerDay, // per slot or per day, see mode
//         remaining,
//         open_slots: openSlots,
//         full: hundiFull,
//         available: !closed && openSlots > 0,
//         message: closed
//           ? 'We are closed on this day.'
//           : hundiFull
//             ? 'Hundi bookings are full for this day. Please choose another date.'
//             : openSlots === 0
//               ? 'No slots available for this day.'
//               : '',
//       }
//     }),
//   })
// })

// // NEW: used by utils/orderingGate.js (normal orders):
// // allFull is true when every slot of TODAY that is not already past is full or blocked.
// // exports.getTodayDayState = async () => {
// //   const date = todayIST()
// //   const s = await PreorderSettings.get()
// //   const c = await countsFor([date], s)
// //   const day = buildDay(date, s, c.slot[date])

// //   const remaining = day.slots.filter((x) => x.status !== 'past')
// //   const allFull =
// //     !day.closed &&
// //     remaining.length > 0 &&
// //     remaining.every((x) => x.status === 'full' || x.status === 'blocked')

// //   return { date, closed: day.closed, allFull }
// // }
// // Used by utils/orderingGate.js (normal orders):
// // allFull is true when every slot of TODAY that is not already past is booked-full or blocked.
// // (lead-time "too_soon" is ignored here: normal orders are not bound by the 2 hour lead time)
// exports.getTodayDayState = async () => {
//   const date = todayIST()
//   const s = await PreorderSettings.get()
//   const c = await countsFor([date], s)
//   const day = buildDay(date, s, c.slot[date])

//   const remaining = day.slots.filter((x) => x.status !== 'past')
//   const allFull =
//     !day.closed &&
//     remaining.length > 0 &&
//     remaining.every((x) => x.status === 'blocked' || x.booked >= x.capacity)

//   return { date, closed: day.closed, allFull }
// }
// // Describe the requested pre-order time for the Orders page.
// const describeWhen = (requestedAt, settings) => {
//   if (!requestedAt || !settings) return null

//   const { date, mins } = istOf(requestedAt)
//   const start = slotStartFor(settings, date, mins)
//   const end = toHHmm(toMin(start) + settings.slotMinutes)
//   return {
//     date,
//     startAt: instant(date, start),
//     label: `${dayLabel(date)} · ${slotLabel(start, end)}`,
//   }
// }
// exports.describeWhen = describeWhen
const crypto = require('crypto') // NEW
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const PreorderSettings = require('../models/PreorderSettings')
const SlotLock = require('../models/SlotLock') // NEW
const { ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, VALID_TRANSITIONS } = require('../utils/constants')
const { emitToAdmins } = require('../sockets')

// Payment model is optional: if it fails to load, payment method/reference stay blank
let Payment = null
try {
  Payment = require('../models/Payment')
} catch {}

/* ------------------- constants resolved from YOUR constants.js ------------------- */
const pickVal = (obj, ...keys) => {
  for (const k of keys) if (obj && obj[k] !== undefined) return obj[k]
}
const PREORDER_TYPE =
  ORDER_TYPES.PRE_ORDER || Object.values(ORDER_TYPES || {}).find((v) => /pre/i.test(String(v)))

const ST = {
  cancelled: pickVal(ORDER_STATUS, 'CANCELLED', 'CANCELED'),
  preparing: pickVal(ORDER_STATUS, 'PROCESSING', 'PREPARING', 'IN_PROGRESS'),
  ready: pickVal(ORDER_STATUS, 'READY', 'READY_FOR_PICKUP'),
  done: ['COMPLETED', 'DELIVERED', 'PICKED_UP', 'OUT_FOR_DELIVERY']
    .map((k) => ORDER_STATUS[k])
    .filter(Boolean),
}
const PAID = pickVal(PAYMENT_STATUS, 'PAID', 'SUCCESS', 'COMPLETED')

// These statuses do NOT hold a slot
// (also matches the exact values in utils/constants, whatever their spelling)
const NOT_BOOKED = [
  ...new Set(
    [
      'CANCELLED',
      'PAYMENT_FAILED',
      'PAYMENT_EXPIRED',
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.PAYMENT_FAILED,
      ORDER_STATUS.PAYMENT_EXPIRED,
    ].filter(Boolean)
  ),
]

const canMove = (from, to) => (VALID_TRANSITIONS[from] || []).includes(to)

// screen status: scheduled | preparing | ready | completed | cancelled
const uiStatus = (st) => {
  if (st === ST.cancelled) return 'cancelled'
  if (st === ST.preparing) return 'preparing'
  if (st === ST.ready) return 'ready'
  if (ST.done.includes(st)) return 'completed'
  return 'scheduled'
}

/* ------------------- slot status -> what the screens show ------------------- */
// NEW: only "open" slots can be selected. full / blocked / too_soon / past are disabled.
// REMOVED: the "hundi_full" status. Hundi no longer has its own daily/slot limit.
const SLOT_UI = {
  open: { disabled: false, label: 'Available', customerStatus: 'available' },
  full: { disabled: true, label: 'Slot filled', customerStatus: 'full' },
  blocked: { disabled: true, label: 'Unavailable', customerStatus: 'unavailable' },
  too_soon: { disabled: true, label: 'Not available', customerStatus: 'too_soon' },
  past: { disabled: true, label: 'Time passed', customerStatus: 'past' },
}
/* ----------------------------- time helpers (IST) ---------------------------- */
const IST_MS = 330 * 60000
const pad = (n) => String(n).padStart(2, '0')
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
const todayIST = () => ymd(new Date(Date.now() + IST_MS))
const addDays = (s, n) => {
  const d = new Date(`${s}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate()+n)
  return ymd(d)
}
const weekday = (s) => new Date(`${s}T00:00:00Z`).getUTCDay()
const toMin = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60+m
}
const toHHmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
const instant = (date, hhmm) => new Date(`${date}T${hhmm}:00+05:30`).getTime()
const istOf = (d) => {
  const x = new Date(new Date(d).getTime() + IST_MS)
  return { date: ymd(x), mins: x.getUTCHours() * 60 + x.getUTCMinutes() }
}

const fmtTime = (m) => {
  const h = Math.floor(m / 60)
  const mm = m % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return mm ? `${h12}:${pad(mm)} ${ap}` : `${h12} ${ap}`
}
const slotLabel = (s, e) => `${fmtTime(toMin(s))} – ${fmtTime(toMin(e))}`

const dayLabel = (s) => {
  const t = todayIST()
  if (s === t) return 'Today'
  if (s === addDays(t, 1)) return 'Tomorrow'
  const d = new Date(`${s}T00:00:00Z`)
  return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
}
const tabLabel = (s) => {
  const t = todayIST()
  if (s === t) return 'Today'
  if (s === addDays(t, 1)) return 'Tomorrow'
  return WD[weekday(s)]
}
const fmtPlaced = (createdAt) => {
  const { date, mins } = istOf(createdAt)
  const t = todayIST()
  const rel =
    date === t
      ? 'Today'
      : date === addDays(t, -1)
      ? 'Yesterday'
      : `${Number(date.slice(8))} ${MON[Number(date.slice(5, 7)) - 1]}`
  return `${rel} ${fmtTime(mins)}`
}
const cap = (s = '') => {
  const t = String(s).toLowerCase().replace(/_/g, ' ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}
/* --------------------------------- plumbing --------------------------------- */
// NEW: errors now carry a code (SLOT_FULL, SLOT_BLOCKED, ...)
const httpError = (status, message, code) =>
  Object.assign(new Error(message), { status, code })
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res)
  } catch (e) {
    res
      .status(e.status || 500)
      .json({ success: false, message: e.message || 'Server error', code: e.code })
  }
}
const ok = (res, data) => res.json({ success: true, data })
const needDate = (v) => {
  if (!DATE_RE.test(v || '')) throw httpError(400, 'date must be YYYY-MM-DD')
  return v
}
const needTime = (v) => {
  if (!TIME_RE.test(v || '')) throw httpError(400, 'start must be HH:mm')
  return v
}

/* ----------------------------- order queries/mapping ----------------------------- */
const rangeFilter = (fromMs, toMs) => {
  const f = {
    requested_at: { $gte: new Date(fromMs), $lt: new Date(toMs) },
    status: { $nin: NOT_BOOKED },
  }
  if (PREORDER_TYPE) f.order_type = PREORDER_TYPE
  return f
}
const dayRange = (date) => [instant(date, '00:00'), instant(addDays(date, 1), '00:00')]

const slotStartFor = (s, date, mins) => {
  const cfg = s.weekly.find((w) => w.day === weekday(date))
  const open = toMin(cfg?.openTime || '11:00')
  const idx = Math.max(0, Math.floor((mins - open) / s.slotMinutes))
  return toHHmm(open + idx * s.slotMinutes)
}

const normalizeItem = (r) => ({
  name: r.product_name_snapshot || 'Item',
  nameTe: '',
  sizeLabel: r.variant_name_snapshot || '',
  qty: r.quantity,
  lineTotal: r.subtotal,
})

async function loadItems(orderIds) {
  if (!orderIds.length) return {}
  const rows = await OrderItem.find({ order_id: { $in: orderIds } }).lean()
  const map = {}
  for (const r of rows) (map[String(r.order_id)] ||= []).push(normalizeItem(r))
  return map
}
const loadPayment = async (orderId) =>
  Payment ? Payment.findOne({ order_id: orderId }).sort({ createdAt: -1 }).lean() : null

const customerOf = (o) => ({
  name: o.customer_id?.name || 'Guest',
  phone: o.customer_id?.mobile || '',
})

const mapBooking = (o, items, s) => {
  const { date, mins } = istOf(o.requested_at)
  const start = slotStartFor(s, date, mins)
  return {
    id: o._id,
    orderNumber: o.order_number,
    status: uiStatus(o.status),
    summary: (items || []).map((i) => `${i.name}${i.sizeLabel ? ' ' + i.sizeLabel : ''} ×${i.qty}`).join(', '),
    customerName: customerOf(o).name,
    typeLabel: cap(o.fulfillment_type || 'pickup'),
    startLabel: fmtTime(toMin(start)),
    total: o.total_amount,
  }
}

const mapOrderDetail = (o, items, payment, s) => {
  let when = '—'
  if (o.requested_at) {
    const { date, mins } = istOf(o.requested_at)
    const start = slotStartFor(s, date, mins)
    const end = toHHmm(toMin(start) + s.slotMinutes)
    when = `${dayLabel(date)} · ${slotLabel(start, end)}`
  }
  return {
    id: o._id,
    orderNumber: o.order_number,
    status: uiStatus(o.status),
    placed: fmtPlaced(o.createdAt),
    type: cap(o.fulfillment_type || 'pickup'),
    when,
    kotPrinted: !!o.kot_printed_at,
    customer: customerOf(o),
    items: items || [],
    subtotal: o.subtotal,
    packing: o.packing_charge || 0,
    delivery: o.delivery_charge || 0,
    total: o.total_amount,
    payment: {
      method: String(payment?.method || payment?.payment_method || '').toUpperCase(),
      status: cap(o.payment_status || ''),
      reference:
        payment?.gateway_payment_id ||
        payment?.razorpay_payment_id ||
        payment?.transaction_id ||
        payment?.reference ||
        '',
    },
  }
}

/* ------------------------------ schedule engine ------------------------------ */
const isClosed = (s, date) => {
  const o = s.dayOverrides.find((x) => x.date === date)
  if (o) return o.closed
  const cfg = s.weekly.find((w) => w.day === weekday(date))
  return !cfg || !cfg.open
}

async function countsFor(dates, s) {
  const from = instant(dates[0], '00:00')
  const to = instant(addDays(dates[dates.length - 1], 1), '00:00')
  const rows = await Order.find(rangeFilter(from, to)).select('requested_at has_hundi').lean()

  const slot = {}
  const total = {}
  const hundi = {}
  const hundiSlot = {}
  for (const r of rows) {
    const { date, mins } = istOf(r.requested_at)
    const start = slotStartFor(s, date, mins)
    ;(slot[date] ||= {})[start] = (slot[date][start] || 0) + 1
    total[date] = (total[date] || 0) + 1
    if (r.has_hundi) {
      hundi[date] = (hundi[date] || 0) + 1
      ;(hundiSlot[date] ||= {})[start] = (hundiSlot[date][start] || 0) + 1
    }
  }
  return { slot, total, hundi, hundiSlot }
}

// REMOVED: the Hundi daily / per-slot limit (hundiCapacityPerDay, hundiCapacityPerSlot).
// A Hundi pre-order now follows exactly the same rules as any other pre-order:
// closed day, lead time, blocked slot and slot capacity (capacityPerSlot).
// Hundi counts are still calculated (countsFor) for information on the admin day view only.

// extraLeadMinutes: optional longer lead time (e.g. items that need long preparation)
function buildDay(date, s, slotCounts = {}, extraLeadMinutes = 0) {
  const cfg = s.weekly.find((w) => w.day === weekday(date)) || { openTime: '11:00', closeTime: '22:00' }
  const closed = isClosed(s, date)
  const now = Date.now()
  const earliest = now + Math.max(s.leadTimeMinutes, extraLeadMinutes) * 60000
  const slots = []
  let firstBookable = null

  if (!closed) {
    const open = toMin(cfg.openTime)
    const close = toMin(cfg.closeTime)
    for (let m = open; m + s.slotMinutes <= close; m += s.slotMinutes) {
      const start = toHHmm(m)
      const end = toHHmm(m + s.slotMinutes)
      const startAt = instant(date, start)
      const endAt = instant(date, end)
      const booked = slotCounts[start] || 0
      const blocked = s.blockedSlots.some((b) => b.date === date && b.start === start)

      let status = 'open'
      if (endAt <= now) status = 'past'
      else if (blocked) status = 'blocked'
      else if (startAt < earliest) status = 'too_soon'
      else if (booked >= s.capacityPerSlot) status = 'full'

      if (!firstBookable && startAt >= earliest) firstBookable = fmtTime(m)

      slots.push({
        start,
        end,
        label: slotLabel(start, end),
        booked,
        capacity: s.capacityPerSlot,
        status,
        disabled: SLOT_UI[status].disabled, // NEW: true for full / blocked / too_soon / past
        statusLabel: SLOT_UI[status].label, // NEW: "Slot filled", "Unavailable", ...
      })
    }
  }
  return { closed, openTime: cfg.openTime, closeTime: cfg.closeTime, slots, firstBookable }
}

// NEW: summary of a whole day for the customer app
const dayState = (day) => {
  if (day.closed) {
    return { openSlots: 0, status: 'closed', message: 'We are closed on this day.' }
  }
  const openSlots = day.slots.filter((x) => !x.disabled).length
  if (openSlots > 0) return { openSlots, status: 'available', message: '' }

  const filled = day.slots.some((x) => x.status === 'full' || x.status === 'blocked')
  return filled
    ? {
        openSlots: 0,
        status: 'full',
        message: 'All slots are filled for this day. Please choose another date.',
      }
    : { openSlots: 0, status: 'unavailable', message: 'No slots available for this day.' }
}

// NEW
const prepMinutes = (hours) => {
  const h = Number(hours)
  return Number.isFinite(h) && h > 0 ? Math.min(h, 168) * 60 : 0
}

/**
 * Used by orderController.validateAndCreateOrder before saving a pre-order.
 * Checks closed day, exact slot, lead time, blocked slot and slot capacity.
 * Throws an error with .status, .code and .message.
 * Call it INSIDE withDayLock so two customers cannot take the last seat together.
 *
 * REMOVED: the daily / per-slot Hundi capacity check. The { hasHundi } option is still
 * accepted so existing callers keep working, but it no longer changes the result:
 * a Hundi order is checked exactly like any other order (slot full => SLOT_FULL).
 */
exports.assertSlotAvailable = async (requestedAt, _options = {}) => {
  const s = await PreorderSettings.get()

  const { date, mins } = istOf(requestedAt)

  const c = await countsFor([date], s)
  const day = buildDay(date, s, c.slot[date])

  if (day.closed) {
    throw httpError(409, 'We are closed on that day', 'DAY_CLOSED')
  }

  const start = slotStartFor(s, date, mins)

  // Only accept the exact start time of a generated slot (11:00 ok, 11:15 not ok)
  if (mins !== toMin(start)) {
    throw httpError(400, 'Please select a valid pre-order slot', 'INVALID_SLOT')
  }

  const slot = day.slots.find((item) => item.start === start)

  if (!slot) {
    throw httpError(400, 'That time is outside our pre-order hours', 'INVALID_SLOT')
  }

  const reasons = {
    past: { message: 'That slot has already passed', code: 'SLOT_PAST' },
    blocked: { message: 'This slot is unavailable. Please choose another slot.', code: 'SLOT_BLOCKED' },
    too_soon: {
      message: `Pre-orders need at least ${s.leadTimeMinutes} minutes notice`,
      code: 'SLOT_TOO_SOON',
    },
    full: { message: 'This slot is filled. Please choose another slot.', code: 'SLOT_FULL' },
  }

  if (slot.status !== 'open') {
    const r = reasons[slot.status] || { message: 'That slot is unavailable', code: 'SLOT_UNAVAILABLE' }
    throw httpError(409, r.message, r.code)
  }
}

// NEW: runs fn() while holding a short lock for that pre-order day,
// so two customers cannot both take the last seat of a slot.
exports.withDayLock = async (requestedAt, fn) => {
  const { date } = istOf(requestedAt)
  const key = `preorder:${date}`
  const token = crypto.randomUUID()
  const LOCK_MS = 15000
  let locked = false

  for (let i = 0; i < 20 && !locked; i++) {
    const now = new Date()
    try {
      await SlotLock.findOneAndUpdate(
        { key, expiresAt: { $lt: now } },
        { $set: { token, expiresAt: new Date(now.getTime() + LOCK_MS) } },
        { upsert: true }
      )
      locked = true
    } catch (e) {
      if (e.code !== 11000) throw e // 11000 = another request holds the lock
      await new Promise((r) => setTimeout(r, 150))
    }
  }

  if (!locked) {
    throw httpError(503, 'Too many bookings at once. Please try again.', 'SLOT_BUSY')
  }

  try {
    return await fn()
  } finally {
    await SlotLock.deleteOne({ key, token })
  }
}

/* --------------------------------- handlers --------------------------------- */
exports.getWeek = wrap(async (req, res) => {
  const today = todayIST()
  const from = req.query.from ? needDate(req.query.from) : today
  const dates = Array.from({ length: 7 }, (_, i) => addDays(from, i))
  const s = await PreorderSettings.get()
  const c = await countsFor(dates, s)

  ok(res, {
    today,
    days: dates.map((date) => ({
      date,
      tabLabel: tabLabel(date),
      dayNumber: Number(date.slice(8)),
      closed: isClosed(s, date),
      booked: c.total[date] || 0,
    })),
  })
})

exports.getDay = wrap(async (req, res) => {
  const date = needDate(req.query.date)
  const s = await PreorderSettings.get()
  const c = await countsFor([date], s)
  const day = buildDay(date, s, c.slot[date])

  const [from, to] = dayRange(date)
  const orders = await Order.find(rangeFilter(from, to))
    .populate('customer_id', 'name mobile')
    .sort({ requested_at: 1, createdAt: 1 })
    .lean()
  const itemsMap = await loadItems(orders.map((o) => o._id))

  const isToday = date === todayIST()
  ok(res, {
    date,
    label: dayLabel(date),
    isToday,
    closed: day.closed,
    openTime: day.openTime,
    closeTime: day.closeTime,
    capacityPerSlot: s.capacityPerSlot,
    // CHANGED: the Hundi limit is no longer enforced. "used" is the number of Hundi
    // pre-orders booked that day (information only); "full" is always false.
    hundi: {
      used: c.hundi[date] || 0,
      capacity: s.hundiCapacityPerDay,
      mode: 'per_day',
      capacity_per_slot: 0,
      limit_enforced: false,
      full: false,
    },
    sameDayFrom: isToday ? day.firstBookable : null,
    slots: day.slots.map((x) => ({ ...x, hundi_booked: (c.hundiSlot[date] || {})[x.start] || 0 })),
    bookings: orders.map((o) => mapBooking(o, itemsMap[String(o._id)], s)),
  })
})

exports.blockSlot = wrap(async (req, res) => {
  const date = needDate(req.body.date)
  const start = needTime(req.body.start)
  const s = await PreorderSettings.get()
  if (!s.blockedSlots.some((b) => b.date === date && b.start === start)) {
    s.blockedSlots.push({ date, start })
    await s.save()
  }
  ok(res, { date, start, blocked: true })
})

exports.unblockSlot = wrap(async (req, res) => {
  const date = needDate(req.body.date)
  const start = needTime(req.body.start)
  const s = await PreorderSettings.get()
  s.blockedSlots = s.blockedSlots.filter((b) => !(b.date === date && b.start === start))
  await s.save()
  ok(res, { date, start, blocked: false })
})

exports.setDayClosed = wrap(async (req, res) => {
  const date = needDate(req.body.date)
  if (typeof req.body.closed !== 'boolean') throw httpError(400, 'closed must be true or false')
  const s = await PreorderSettings.get()
  s.dayOverrides = s.dayOverrides.filter((o) => o.date !== date)
  s.dayOverrides.push({ date, closed: req.body.closed })
  await s.save()
  ok(res, { date, closed: req.body.closed })
})

exports.getSettings = wrap(async (req, res) => {
  ok(res, await PreorderSettings.get())
})

exports.updateSettings = wrap(async (req, res) => {
  const b = req.body
  const s = await PreorderSettings.get()
  const int = (v, min, max, name) => {
    if (!Number.isInteger(v) || v < min || v > max) throw httpError(400, `${name} must be ${min}-${max}`)
    return v
  }
  if (b.leadTimeMinutes !== undefined) s.leadTimeMinutes = int(b.leadTimeMinutes, 0, 10080, 'leadTimeMinutes')
  if (b.slotMinutes !== undefined) s.slotMinutes = int(b.slotMinutes, 15, 480, 'slotMinutes')
  if (b.capacityPerSlot !== undefined) s.capacityPerSlot = int(b.capacityPerSlot, 1, 500, 'capacityPerSlot')
  // NOTE: the two Hundi capacity settings are still stored, but they no longer limit orders.
  if (b.hundiCapacityPerDay !== undefined) s.hundiCapacityPerDay = int(b.hundiCapacityPerDay, 0, 500, 'hundiCapacityPerDay')
  if (b.hundiCapacityPerSlot !== undefined) s.hundiCapacityPerSlot = int(b.hundiCapacityPerSlot, 0, 500, 'hundiCapacityPerSlot')
  if (b.weekly !== undefined) {
    if (!Array.isArray(b.weekly) || b.weekly.length !== 7) throw httpError(400, 'weekly needs 7 entries')
    s.weekly = b.weekly.map((w) => {
      if (!TIME_RE.test(w.openTime) || !TIME_RE.test(w.closeTime) || toMin(w.openTime) >= toMin(w.closeTime)) {
        throw httpError(400, 'Invalid open/close time')
      }
      return { day: int(w.day, 0, 6, 'day'), open: !!w.open, openTime: w.openTime, closeTime: w.closeTime }
    })
  }
  await s.save()
  ok(res, s)
})

/* ---------------------------- order drawer actions ---------------------------- */
const loadOrder = async (id) => {
  const o = await Order.findById(id).populate('customer_id', 'name mobile')
  if (!o) throw httpError(404, 'Order not found')
  return o
}
const detailOf = async (o) => {
  const s = await PreorderSettings.get()
  const items = (await loadItems([o._id]))[String(o._id)] || []
  const payment = await loadPayment(o._id)
  return mapOrderDetail(o, items, payment, s)
}

exports.getOrder = wrap(async (req, res) => {
  ok(res, await detailOf(await loadOrder(req.params.id)))
})

exports.startOrder = wrap(async (req, res) => {
  if (!ST.preparing) throw httpError(500, 'ORDER_STATUS has no PROCESSING value; set it in utils/constants.js')
  const o = await loadOrder(req.params.id)
  if (!canMove(o.status, ST.preparing)) {
    throw httpError(409, `Cannot start preparing: order is ${cap(o.status)}. Confirm it first.`)
  }
  o.status = ST.preparing
  await o.save()
  emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
  ok(res, await detailOf(o))
})

exports.cancelOrder = wrap(async (req, res) => {
  if (!ST.cancelled) throw httpError(500, 'ORDER_STATUS has no CANCELLED value; set it in utils/constants.js')
  const o = await loadOrder(req.params.id)
  if (!canMove(o.status, ST.cancelled)) {
    throw httpError(409, `Cannot cancel an order that is ${cap(o.status)}.`)
  }
  o.status = ST.cancelled
  o.cancelled_at = new Date()
  o.cancel_reason = (req.body.reason || 'Cancelled by admin').toString().slice(0, 200)
  o.refund_status = PAID && o.payment_status === PAID ? 'pending' : 'none'
  // TODO: call your payment gateway refund here, then set o.refund_status = 'refunded'
  await o.save()
  emitToAdmins('order_status_changed', { order_id: o._id, order_number: o.order_number, status: o.status })
  ok(res, await detailOf(o))
})

exports.printKot = wrap(async (req, res) => {
  const o = await loadOrder(req.params.id)
  if (!o.kot_printed_at) {
    o.kot_printed_at = new Date()
    await o.save()
  }
  const d = await detailOf(o)
  ok(res, {
    orderNumber: d.orderNumber,
    when: d.when,
    type: d.type,
    customer: d.customer.name,
    items: d.items.map((i) => ({ name: i.name, sizeLabel: i.sizeLabel, qty: i.qty })),
  })
})

/* ------------------------------- customer app ------------------------------- */
// CHANGED: the optional ?has_hundi=true query is still accepted but ignored.
// A Hundi in the cart no longer closes any date or slot.

// NEW: GET /api/customer/orders/slot-days?from=YYYY-MM-DD&days=7&prep_hours=3
// Date chips: a day whose slots are all filled comes back with available=false and a message.
exports.getCustomerDays = wrap(async (req, res) => {
  const today = todayIST()
  let from = req.query.from ? needDate(req.query.from) : today
  if (from < today) from = today
  const count = Math.min(14, Math.max(1, Number(req.query.days) || 7))
  const extra = prepMinutes(req.query.prep_hours)

  const dates = Array.from({ length: count }, (_, i) => addDays(from, i))
  const s = await PreorderSettings.get()
  const c = await countsFor(dates, s)

  ok(res, {
    today,
    days: dates.map((date) => {
      const day = buildDay(date, s, c.slot[date], extra)
      const st = dayState(day)
      return {
        date,
        tabLabel: tabLabel(date),
        dayNumber: Number(date.slice(8)),
        label: dayLabel(date),
        status: st.status, // available | full | closed | unavailable
        available: st.openSlots > 0,
        open_slots: st.openSlots,
        message: st.message,
      }
    }),
  })
})
// GET /api/customer/orders/slots?date=YYYY-MM-DD&prep_hours=3  (customer app: which slots can I pick?)
// Full / blocked slots come back with disabled=true and a message.
exports.getCustomerSlots = wrap(async (req, res) => {
  const date = needDate(req.query.date)
  if (date < todayIST()) throw httpError(400, 'Date cannot be in the past')
  const extra = prepMinutes(req.query.prep_hours)

  const s = await PreorderSettings.get()
  const c = await countsFor([date], s)
  const day = buildDay(date, s, c.slot[date], extra)
  const st = dayState(day)

  ok(res, {
    date,
    label: dayLabel(date),
    closed: day.closed,
    openTime: day.openTime,
    closeTime: day.closeTime,
    available: st.openSlots > 0,
    all_full: st.status === 'full',
    hundi_full: false, // kept so older app versions do not break; always false now
    message: st.message, // e.g. "All slots are filled for this day. Please choose another date."
    slots: day.slots.map((x) => ({
      start: x.start,
      end: x.end,
      label: x.label,
      available: !x.disabled,
      disabled: x.disabled, // true => grey out and block the tap
      status: SLOT_UI[x.status].customerStatus, // available | full | unavailable | too_soon | past
      message: x.disabled ? SLOT_UI[x.status].label : '', // "Slot filled", "Unavailable", ...
      requested_at: `${date}T${x.start}:00+05:30`, // send this value as requested_at when ordering
    })),
  })
})

// CHANGED: GET /api/customer/orders/hundi-availability?from=YYYY-MM-DD&days=14
// The Hundi daily limit is removed, so this no longer reports a Hundi limit.
// It is kept (not deleted) so an app that still calls it does not break:
// a day is "available" when it has at least one open slot, same as any other order.
// full is always false; capacity / remaining are null (unlimited).
exports.getHundiAvailability = wrap(async (req, res) => {
  const today = todayIST()
  let from = req.query.from ? needDate(req.query.from) : today
  if (from < today) from = today
  const count = Math.min(31, Math.max(1, Number(req.query.days) || 14))

  const dates = Array.from({ length: count }, (_, i) => addDays(from, i))
  const s = await PreorderSettings.get()
  const c = await countsFor(dates, s)

  ok(res, {
    today,
    mode: 'unlimited',
    limit_enforced: false,
    capacity_per_day: null,
    capacity_per_slot: 0,
    days: dates.map((date) => {
      const closed = isClosed(s, date)
      const day = buildDay(date, s, c.slot[date])
      const st = dayState(day)
      return {
        date,
        label: dayLabel(date),
        closed,
        used: c.hundi[date] || 0, // Hundi pre-orders already booked (information only)
        capacity: null,
        remaining: null,
        open_slots: st.openSlots,
        full: false,
        available: !closed && st.openSlots > 0,
        message: st.message,
      }
    }),
  })
})

// NEW: used by utils/orderingGate.js (normal orders):
// allFull is true when every slot of TODAY that is not already past is full or blocked.
// exports.getTodayDayState = async () => {
//   const date = todayIST()
//   const s = await PreorderSettings.get()
//   const c = await countsFor([date], s)
//   const day = buildDay(date, s, c.slot[date])

//   const remaining = day.slots.filter((x) => x.status !== 'past')
//   const allFull =
//     !day.closed &&
//     remaining.length > 0 &&
//     remaining.every((x) => x.status === 'full' || x.status === 'blocked')

//   return { date, closed: day.closed, allFull }
// }
// Used by utils/orderingGate.js (normal orders):
// allFull is true when every slot of TODAY that is not already past is booked-full or blocked.
// (lead-time "too_soon" is ignored here: normal orders are not bound by the 2 hour lead time)
exports.getTodayDayState = async () => {
  const date = todayIST()
  const s = await PreorderSettings.get()
  const c = await countsFor([date], s)
  const day = buildDay(date, s, c.slot[date])

  const remaining = day.slots.filter((x) => x.status !== 'past')
  const allFull =
    !day.closed &&
    remaining.length > 0 &&
    remaining.every((x) => x.status === 'blocked' || x.booked >= x.capacity)

  return { date, closed: day.closed, allFull }
}
// Describe the requested pre-order time for the Orders page.
const describeWhen = (requestedAt, settings) => {
  if (!requestedAt || !settings) return null

  const { date, mins } = istOf(requestedAt)
  const start = slotStartFor(settings, date, mins)
  const end = toHHmm(toMin(start) + settings.slotMinutes)
  return {
    date,
    startAt: instant(date, start),
    label: `${dayLabel(date)} · ${slotLabel(start, end)}`,
  }
}
exports.describeWhen = describeWhen