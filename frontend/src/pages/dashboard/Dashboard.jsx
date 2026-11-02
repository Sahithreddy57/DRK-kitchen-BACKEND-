// import { useEffect, useState } from 'react'
// import {
//   ShoppingBag, CheckCircle, Clock, Loader, XCircle,
//   TrendingUp, Calendar, IndianRupee, RefreshCw
// } from 'lucide-react'
// import { getDashboard, getRecentOrders } from '../../services/authService'
// import toast from 'react-hot-toast'

// const statusBadge = {
//   NEW: 'badge--blue',
//   PAYMENT_PENDING: 'badge--yellow',
//   CONFIRMED: 'badge--green',
//   PROCESSING: 'badge--purple',
//   COMPLETED: 'badge--teal',
//   CANCELLED: 'badge--red',
//   PAYMENT_FAILED: 'badge--red',
//   PAYMENT_EXPIRED: 'badge--gray',
// }

// export default function Dashboard() {
//   const [stats, setStats] = useState(null)
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [refreshing, setRefreshing] = useState(false)

//   const fetchData = async (isRefresh = false) => {
//     if (isRefresh) setRefreshing(true)
//     try {
//       const [statsRes, ordersRes] = await Promise.all([getDashboard(), getRecentOrders()])
//       setStats(statsRes.data.data)
//       setOrders(ordersRes.data.data)
//     } catch {
//       toast.error('Failed to load dashboard data.')
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }

//   useEffect(() => { fetchData() }, [])

//   const cards = stats ? [
//     { icon: ShoppingBag, value: stats.today_orders, color: 'card--blue', label: "Today's Orders" },
//     { icon: CheckCircle, value: stats.confirmed, color: 'card--green', label: 'Confirmed' },
//     { icon: Clock, value: stats.pending_payment, color: 'card--yellow', label: 'Pending Payment' },
//     { icon: Loader, value: stats.processing, color: 'card--purple', label: 'Processing' },
//     { icon: TrendingUp, value: stats.completed, color: 'card--teal', label: 'Completed' },
//     { icon: XCircle, value: stats.cancelled, color: 'card--red', label: 'Cancelled' },
//     { icon: Calendar, value: stats.pre_orders, color: 'card--indigo', label: 'Pre-Orders' },
//     { icon: IndianRupee, value: `₹${stats.today_sales?.toLocaleString('en-IN') || 0}`, color: 'card--orange', label: "Today's Sales" },
//   ] : []

//   if (loading) return <div className="page-loader"><span className="spinner" /></div>

//   return (
//     <div className="page">
//       <div className="page__header">
//         <div>
//           <h2 className="page__title">Good {getGreeting()}, Admin 👋</h2>
//           <p className="page__subtitle">Here's what's happening today.</p>
//         </div>
//         <button className="btn btn--outline" onClick={() => fetchData(true)} disabled={refreshing}>
//           <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
//           Refresh
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="stats-grid">
//         {cards.map(({ icon: Icon, value, color, label }) => (
//           <div key={label} className={`stat-card ${color}`}>
//             <div className="stat-card__icon"><Icon size={24} /></div>
//             <div className="stat-card__body">
//               <p className="stat-card__value">{value}</p>
//               <p className="stat-card__label">{label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Recent Orders */}
//       <div className="section-card">
//         <div className="section-card__header">
//           <h3 className="section-card__title">Recent Orders</h3>
//         </div>
//         {orders.length === 0 ? (
//           <div className="empty-state">
//             <ShoppingBag size={40} />
//             <p>No orders yet today.</p>
//           </div>
//         ) : (
//           <div className="table-wrap">
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Order No</th>
//                   <th>Customer</th>
//                   <th>Type</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((o) => (
//                   <tr key={o._id}>
//                     <td><span className="order-num">{o.order_number}</span></td>
//                     <td>{o.customer_id?.name || '—'}</td>
//                     <td><span className="badge badge--gray">{o.order_type}</span></td>
//                     <td>₹{o.total_amount?.toLocaleString('en-IN')}</td>
//                     <td><span className={`badge ${statusBadge[o.status] || 'badge--gray'}`}>{o.status}</span></td>
//                     <td>{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// function getGreeting() {
//   const h = new Date().getHours()
//   if (h < 12) return 'Morning'
//   if (h < 17) return 'Afternoon'
//   return 'Evening'
// }
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, RefreshCw, Bell, X } from 'lucide-react'
import { getDashboard, getRecentOrders, pauseOrders, resumeOrders } from '../../services/authService'
import toast from 'react-hot-toast'
import '../../components/styles/Dashboard.css'

const statusBadge = {
  NEW: 'badge--blue',
  PAYMENT_PENDING: 'badge--yellow',
  CONFIRMED: 'badge--green',
  PROCESSING: 'badge--purple',
  COMPLETED: 'badge--teal',
  CANCELLED: 'badge--red',
  PAYMENT_FAILED: 'badge--red',
  PAYMENT_EXPIRED: 'badge--gray',
}

// ---- Config: మీ Sidebar routes తో match చేశాను ----
const ROUTES = {
  orders: '/orders',
  payments: '/payments',
  menu: '/menu',
  schedule: '/preorder-schedule', // Needs attention -> "Schedule" button
  preOrders: '/orders?group=scheduled', // Upcoming pre-orders -> "Open schedule" link
}
const NEEDS_ACTION_STATUSES = ['NEW', 'PAYMENT_PENDING']
const KITCHEN_STATUSES = ['CONFIRMED', 'PROCESSING']
const READY_STATUSES = ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY']
const ACCEPT_SLA_MIN = 5 // ఇన్ని నిమిషాలు దాటితే "waiting over"
const URGENT_MIN = 45 // ఇన్ని నిమిషాలు దాటితే red

const PAUSE_DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: 'Until I resume', minutes: null },
]
const PAUSE_REASONS = ['Too many orders', 'Ingredient shortage', 'Staff break', 'Other']
// ---------------------------------------------------------

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState(new Date())

  // Pause popup state
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseMinutes, setPauseMinutes] = useState(30)
  const [pauseReason, setPauseReason] = useState('Too many orders')
  const [pauseBusy, setPauseBusy] = useState(false)
  const [pauseState, setPauseState] = useState(null) // { paused, until, reason }

  const fetchData = async (isRefresh = false, silent = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [statsRes, ordersRes] = await Promise.all([getDashboard(), getRecentOrders()])
      const data = statsRes.data.data
      setStats(data)
      setOrders(ordersRes.data.data || [])
      // backend pause status ఇస్తే అదే నమ్ముతాం
      if (data && data.accepting_orders !== undefined) setPauseState(null)
    } catch {
      if (!silent) toast.error('Failed to load dashboard data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // clock tick (30s) + silent auto refresh (60s)
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 30000)
    const poll = setInterval(() => fetchData(false, true), 60000)
    return () => { clearInterval(clock); clearInterval(poll) }
  }, [])

  // Esc నొక్కితే popup close
  useEffect(() => {
    if (!pauseOpen) return
    const onKey = (e) => { if (e.key === 'Escape' && !pauseBusy) setPauseOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pauseOpen, pauseBusy])

  // ---------- Accepting / paused status ----------
  const effPaused = pauseState ? pauseState.paused : stats?.accepting_orders === false
  const effUntil = pauseState ? pauseState.until : stats?.paused_until
  const pauseExpired = effPaused && effUntil && new Date(effUntil) <= now
  const acceptingOrders = !(effPaused && !pauseExpired)
  const pauseLeftMin = effUntil ? Math.max(Math.ceil((new Date(effUntil) - now) / 60000), 0) : null

  const openPausePopup = () => {
    setPauseMinutes(30)
    setPauseReason('Too many orders')
    setPauseOpen(true)
  }

  const handleChipClick = async () => {
    if (pauseBusy) return
    if (acceptingOrders) {
      openPausePopup()
      return
    }
    // already paused -> resume
    setPauseBusy(true)
    try {
      await resumeOrders()
      setPauseState({ paused: false, until: null, reason: null })
      toast.success('Kitchen resumed. Taking orders again.')
      fetchData(false, true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resume orders.')
    } finally {
      setPauseBusy(false)
    }
  }

  const handlePause = async () => {
    setPauseBusy(true)
    try {
      await pauseOrders({ duration_minutes: pauseMinutes, reason: pauseReason })
      const until = pauseMinutes ? new Date(Date.now() + pauseMinutes * 60000).toISOString() : null
      setPauseState({ paused: true, until, reason: pauseReason })
      setPauseOpen(false)
      toast.success('Kitchen paused. New "order now" orders are blocked.')
      fetchData(false, true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to pause orders.')
    } finally {
      setPauseBusy(false)
    }
  }

  // ---------- Queue columns ----------
  const queue = useMemo(() => {
    const q = stats?.queue
    if (q) {
      return {
        needsAction: q.needs_action || [],
        kitchen: q.kitchen || [],
        ready: q.ready || [],
        counts: q.counts || {},
      }
    }
    // fallback: backend queue ఇవ్వకపోతే recent orders నుండి
    const byAge = (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    const scheduled = (o) =>
      isPreOrder(o) && ['NEW', 'CONFIRMED'].includes(o.status) && /paid|success/i.test(o.payment_status || '')
    const pool = orders.filter((o) => !scheduled(o))
    return {
      needsAction: pool.filter((o) => NEEDS_ACTION_STATUSES.includes(o.status)).sort(byAge),
      kitchen: pool.filter((o) => KITCHEN_STATUSES.includes(o.status)).sort(byAge),
      ready: pool.filter((o) => READY_STATUSES.includes(o.status)).slice(0, 8),
      counts: {},
    }
  }, [orders, stats])

  // ---------- KPI cards ----------
  let cards = []
  if (stats) {
    const todayOrders = stats.today_orders || 0
    const cancelledOrFailed =
      stats.cancelled_today ?? ((stats.cancelled || 0) + (stats.payment_failed || 0))
    const netRevenue = stats.net_revenue ?? stats.today_sales ?? 0
    const validOrders = Math.max(todayOrders - cancelledOrFailed, 0)
    const avgOrderValue =
      stats.avg_order_value ?? (validOrders > 0 ? Math.round(netRevenue / validOrders) : 0)
    const inKitchen = stats.in_kitchen ?? queue.kitchen.length
    const waitingOnYou = stats.waiting_on_you ?? queue.needsAction.length

    cards = [
      { label: 'Orders today', value: todayOrders, sub: `${cancelledOrFailed} cancelled or failed` },
      { label: 'Net revenue today', value: formatINR(netRevenue), sub: 'After refunds' },
      { label: 'Avg order value', value: formatINR(avgOrderValue), sub: 'Placed today' },
      { label: 'Waiting on you', value: waitingOnYou, sub: `${inKitchen} in the kitchen` },
    ]
  }

  // ---------- Needs attention ----------
  const attention = useMemo(() => {
    if (!stats) return []
    const items = []

    const waitingOver =
      stats.waiting_over_5_min ??
      orders.filter(
        (o) => o.status === 'NEW' && minutesAgo(o.createdAt, now) >= ACCEPT_SLA_MIN
      ).length
    if (waitingOver > 0) {
      items.push({
        key: 'waiting', tone: 'warn', count: waitingOver,
        text: `${waitingOver} order${waitingOver > 1 ? 's' : ''} waiting over ${ACCEPT_SLA_MIN} min to be accepted`,
        action: 'Review', to: ROUTES.orders,
      })
    }

    const pendingPay = stats.pending_payment ?? orders.filter((o) => o.status === 'PAYMENT_PENDING').length
    if (pendingPay > 0) {
      items.push({
        key: 'payments', tone: 'warn', count: pendingPay,
        text: `${pendingPay} payment${pendingPay > 1 ? 's' : ''} pending — don't cook until verified`,
        action: 'Verify', to: ROUTES.payments,
      })
    }

    const soldOut = (stats.sold_out_items || [])
      .map((i) => (typeof i === 'string' ? i : i?.name))
      .filter(Boolean)
    if (soldOut.length > 0) {
      items.push({
        key: 'soldout', tone: 'info', count: soldOut.length,
        text: `${soldOut.length} dish${soldOut.length > 1 ? 'es' : ''} sold out: ${soldOut.join(', ')}`,
        action: 'Menu', to: ROUTES.menu,
      })
    }

    const fullSlots = (stats.full_slots || [])
      .map((s) => (typeof s === 'string' ? s : s?.label))
      .filter(Boolean)
    if (fullSlots.length > 0) {
      items.push({
        key: 'slots', tone: 'info', count: fullSlots.length,
        text: `Full slots: ${fullSlots.join(', ')}`,
        action: 'Schedule', to: ROUTES.schedule,
      })
    }
    return items
  }, [stats, orders, now])

  const bellCount = stats?.unread_notifications ?? attention.reduce((s, i) => s + i.count, 0)

  // ---------- Upcoming pre-orders ----------
  const upcomingPreOrders = useMemo(() => {
    const fromApi = stats?.upcoming_pre_orders
    const source = Array.isArray(fromApi) ? fromApi : orders.filter(isPreOrder)
    return source
      .filter((o) => {
        const t = getScheduled(o)
        return t && new Date(t) >= new Date(now.getTime() - 30 * 60000) &&
          !['CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED'].includes(o.status)
      })
      .sort((a, b) => new Date(getScheduled(a)) - new Date(getScheduled(b)))
      .slice(0, 5)
  }, [stats, orders, now])

  if (loading) return <div className="page-loader"><span className="spinner" /></div>

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Good {getGreeting()}, Admin 👋</h2>
          <p className="page__subtitle">Here's what's happening today.</p>
          <p className="page__date">{formatNow(now)}</p>
        </div>
        <div className="page__actions">
          <button
            type="button"
            className={`status-chip status-chip--btn ${acceptingOrders ? 'status-chip--on' : 'status-chip--off'}`}
            onClick={handleChipClick}
            disabled={pauseBusy}
            title={acceptingOrders ? 'Click to pause new orders' : 'Click to resume orders'}
          >
            <span className="status-chip__dot" />
            {acceptingOrders
              ? 'Taking orders'
              : pauseLeftMin !== null
                ? `Paused · ${pauseLeftMin} min left`
                : 'Paused · until resumed'}
          </button>
          <button className="bell-btn" onClick={() => navigate(ROUTES.orders)} title="Notifications">
            <Bell size={18} />
            {bellCount > 0 && <span className="bell-btn__badge">{bellCount}</span>}
          </button>
          <button className="btn btn--outline" onClick={() => fetchData(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {cards.map(({ label, value, sub }) => (
          <div key={label} className="kpi-card">
            <p className="kpi-card__label">{label}</p>
            <p className="kpi-card__value">{value}</p>
            <p className="kpi-card__sub">{sub}</p>
          </div>
        ))}
      </div>

      {/* Needs attention + Upcoming pre-orders */}
      <div className="dash-two-col">
        <div className="panel">
          <h3 className="panel__title">Needs attention</h3>
          {attention.length === 0 ? (
            <div className="attn-empty">All clear — nothing needs your attention right now.</div>
          ) : (
            <div className="attn-list">
              {attention.map((a) => (
                <div key={a.key} className={`attn-row attn-row--${a.tone}`}>
                  <span className="attn-row__text">{a.text}</span>
                  <button className="attn-row__btn" onClick={() => navigate(a.to)}>{a.action}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel__head">
            <h3 className="panel__title">Upcoming pre-orders</h3>
            <button className="link-btn" onClick={() => navigate(ROUTES.preOrders)}>Open schedule</button>
          </div>
          {upcomingPreOrders.length === 0 ? (
            <div className="attn-empty">No upcoming pre-orders.</div>
          ) : (
            <div className="pre-list">
              {upcomingPreOrders.map((o) => (
                <div key={o._id} className="pre-row">
                  <div className="pre-row__when">{whenLabel(getScheduled(o), now)}</div>
                  <div className="pre-row__main">
                    <p className="pre-row__item">{itemSummary(o)}</p>
                    <p className="pre-row__meta">#{o.order_number} · {o.customer_id?.name || '—'}</p>
                  </div>
                  <div className="pre-row__amt">{formatINR(o.total_amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live queue */}
      <div className="panel panel--queue">
        <h3 className="panel__title">Live queue</h3>
        <div className="queue-grid">
          <QueueColumn title="Needs action" orders={queue.needsAction} count={queue.counts.needs_action} now={now} urgentCheck />
          <QueueColumn title="In the kitchen" orders={queue.kitchen} count={queue.counts.kitchen} now={now} />
          <QueueColumn title="Ready / out" orders={queue.ready} count={queue.counts.ready} now={now} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="section-card">
        <div className="section-card__header">
          <h3 className="section-card__title">Recent Orders</h3>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} />
            <p>No orders yet today.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td><span className="order-num">{o.order_number}</span></td>
                    <td>{o.customer_id?.name || '—'}</td>
                    <td><span className="badge badge--gray">{o.order_type}</span></td>
                    <td>{formatINR(o.total_amount)}</td>
                    <td><span className={`badge ${statusBadge[o.status] || 'badge--gray'}`}>{o.status}</span></td>
                    <td>{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pause new orders popup */}
      {pauseOpen && (
        <div className="modal-overlay" onClick={() => !pauseBusy && setPauseOpen(false)}>
          <div
            className="pause-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pause-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="pause-modal__close"
              onClick={() => setPauseOpen(false)}
              disabled={pauseBusy}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <h3 id="pause-title" className="pause-modal__title">Pause new orders?</h3>
            <p className="pause-modal__desc">
              Customers can't place “order now” orders while paused. Pre-orders stay open, and
              orders already placed are not affected.
            </p>

            <p className="pause-modal__label">For how long</p>
            <div className="pill-group">
              {PAUSE_DURATIONS.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  className={`pill ${pauseMinutes === d.minutes ? 'pill--active' : ''}`}
                  onClick={() => setPauseMinutes(d.minutes)}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <p className="pause-modal__label">Reason (internal)</p>
            <div className="pill-group">
              {PAUSE_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`pill ${pauseReason === r ? 'pill--active' : ''}`}
                  onClick={() => setPauseReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="pause-modal__actions">
              <button
                type="button"
                className="pill pill--cancel"
                onClick={() => setPauseOpen(false)}
                disabled={pauseBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pause-modal__submit"
                onClick={handlePause}
                disabled={pauseBusy}
              >
                {pauseBusy ? 'Pausing…' : 'Pause kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QueueColumn({ title, orders, count, now, urgentCheck = false }) {
  return (
    <div className="queue-col">
      <div className="queue-col__head">
        <span>{title}</span>
        <span className="queue-col__count">{count ?? orders.length}</span>
      </div>
      <div className="queue-col__list">
        {orders.length === 0 && <p className="queue-col__empty">Nothing here</p>}
        {orders.map((o) => {
          const mins = minutesAgo(o.createdAt, now)
          const scheduled = isPreOrder(o) ? getScheduled(o) : null
          const urgent = urgentCheck && mins >= URGENT_MIN
          return (
            <div key={o._id} className={`queue-card ${urgent ? 'queue-card--urgent' : ''}`}>
              <div className="queue-card__top">
                <span className="queue-card__num">#{o.order_number}</span>
                <span className={`queue-card__time ${urgent ? 'is-urgent' : ''}`}>
                  {scheduled ? formatClock(scheduled) : timeAgo(mins, o.createdAt)}
                </span>
              </div>
              <p className="queue-card__meta">
                {o.customer_id?.name || '—'}
                {getMode(o) ? ` · ${getMode(o)}` : ''}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

function getScheduled(o) {
  return o.requested_at || o.scheduled_for || o.scheduled_at || o.pre_order_date || o.slot_start || null
}

function isPreOrder(o) {
  return o.order_type === 'PRE_ORDER' || o.is_pre_order === true
}

function getMode(o) {
  const m = o.fulfillment_type || o.delivery_type || o.service_type || o.order_mode || ''
  const s = String(m)
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
}

function minutesAgo(date, now) {
  return Math.max(Math.floor((now - new Date(date)) / 60000), 0)
}

function timeAgo(mins, date) {
  if (mins < 1) return 'just now'
  if (mins < 120) return `${mins} min ago`
  return formatClock(date)
}

function formatClock(date) {
  const d = new Date(date)
  let h = d.getHours()
  const m = d.getMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return m === 0 ? `${h} ${ap}` : `${h}:${String(m).padStart(2, '0')} ${ap}`
}

function formatNow(d) {
  const day = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
  const t = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
  return `${day} · ${t}`
}

function whenLabel(date, now) {
  const d = new Date(date)
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate())
  const diffDays = Math.round((startOf(d) - startOf(now)) / 86400000)
  let day
  if (diffDays === 0) day = 'Today'
  else if (diffDays === 1) day = 'Tomorrow'
  else day = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${day} · ${formatClock(d)}`
}

function itemSummary(o) {
  const items = o.items || o.order_items || []
  if (!items.length) return o.items_summary || o.order_type || 'Pre-order'
  const first = items[0]
  const name = first.name || first.product_name || first.product_id?.name || 'Item'
  const qty = first.quantity || first.qty || 1
  const more = items.length > 1 ? ` +${items.length - 1} more` : ''
  return `${name} ×${qty}${more}`
}