
const mongoose = require('mongoose')
const BusinessHours = require('./BusinessHours')
const BusinessSetting = require('./BusinessSetting')
const { MIN_PREORDER_HOURS } = require('../utils/constants')

const weeklySchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    open: { type: Boolean, default: true },
    openTime: { type: String, default: '11:00' },
    closeTime: { type: String, default: '22:00' },
  },
  { _id: false }
)

const overrideSchema = new mongoose.Schema(
  { date: { type: String, required: true }, closed: { type: Boolean, required: true } },
  { _id: false }
)

const blockedSchema = new mongoose.Schema(
  { date: { type: String, required: true }, start: { type: String, required: true } },
  { _id: false }
)

const preorderSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'preorder', unique: true },
    leadTimeMinutes: { type: Number, default: 120 },
    slotMinutes: { type: Number, default: 60 },
    capacityPerSlot: { type: Number, default: 2 },
    hundiCapacityPerDay: { type: Number, default: 3 },
    weekly: {
      type: [weeklySchema],
      default: () => [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: day !== 1 })), // Monday closed
    },
    dayOverrides: { type: [overrideSchema], default: [] },
    blockedSlots: { type: [blockedSchema], default: [] },
  },
  { timestamps: true }
)

/* -------- Settings -> Business Hours / Order Config are the source of truth -------- */

// Business Hours page stores day names; schedule uses 0 = Sunday
const DAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const toMin = (t) => {
  const [h, m] = String(t).split(':').map(Number)
  return h * 60 + m
}

async function applyBusinessSettings(doc) {
  if (!doc) return doc

  const [hours, minHoursSetting] = await Promise.all([
    BusinessHours.find({}).lean(),
    BusinessSetting.findOne({ key: 'min_preorder_hours' }).lean(),
  ])

  // Settings -> Business Hours (open / closed day, opening time, closing time)
  const byDay = {}
  for (const h of hours) {
    const idx = DAY_INDEX[String(h.day || '').trim().toLowerCase()]
    if (idx !== undefined) byDay[idx] = h
  }

  doc.weekly = [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const stored = doc.weekly.find((w) => w.day === day)
    const base = {
      day,
      open: stored ? stored.open : true,
      openTime: stored ? stored.openTime : '11:00',
      closeTime: stored ? stored.closeTime : '22:00',
    }

    const h = byDay[day]
    if (!h) return base // no Business Hours saved for this day: keep the schedule default

    const openOk = TIME_RE.test(h.open_time || '')
    const closeOk = TIME_RE.test(h.close_time || '')
    const openTime = openOk ? h.open_time : base.openTime
    const closeTime = closeOk ? h.close_time : base.closeTime
    const rangeOk = toMin(openTime) < toMin(closeTime)

    return {
      day,
      open: !!h.is_open,
      openTime: rangeOk ? openTime : base.openTime,
      closeTime: rangeOk ? closeTime : base.closeTime,
    }
  })

  // Settings -> Order Config -> "Min Pre-Order Hours" (same rule the order check uses)
  const minHours = Number(minHoursSetting && minHoursSetting.value)
  if (Number.isFinite(minHours) && minHours >= 0) {
    doc.leadTimeMinutes = Math.round(Math.max(MIN_PREORDER_HOURS, minHours) * 60)
  }

  return doc
}

preorderSettingsSchema.statics.get = async function () {
  let doc = await this.findOne({ key: 'preorder' })

  if (!doc) {
    try {
      doc = await this.create({ key: 'preorder' })
    } catch {
      doc = await this.findOne({ key: 'preorder' })
    }
  }

  try {
    await applyBusinessSettings(doc)
  } catch (e) {
    // never break the schedule if Business Hours cannot be read
    console.error('[PREORDER SETTINGS] could not apply business settings:', e.message)
  }

  return doc
}

module.exports = mongoose.model('PreorderSettings', preorderSettingsSchema)