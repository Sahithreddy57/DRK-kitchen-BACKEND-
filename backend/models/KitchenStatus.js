const mongoose = require("mongoose");

const kitchenStatusSchema = new mongoose.Schema(
  {
    key: { type: String, default: "kitchen", unique: true },
    paused: { type: Boolean, default: false },
    paused_until: { type: Date, default: null }, // null + paused=true => "Until I resume"
    pause_reason: { type: String, default: null },
    paused_at: { type: Date, default: null },
    paused_by: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

// single document, auto-created
kitchenStatusSchema.statics.get = async function () {
  return this.findOneAndUpdate(
    { key: "kitchen" },
    { $setOnInsert: { key: "kitchen" } },
    { upsert: true, returnDocument: "after" }
  );
};

// paused_until దాటితే auto-resume (cron అవసరం లేదు)
kitchenStatusSchema.statics.isPaused = function (doc, at = new Date()) {
  if (!doc || !doc.paused) return false;
  if (!doc.paused_until) return true;
  return new Date(doc.paused_until) > at;
};

module.exports = mongoose.model("KitchenStatus", kitchenStatusSchema);