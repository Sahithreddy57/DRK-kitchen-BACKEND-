const mongoose = require("mongoose");

const verifiedMobileSchema = new mongoose.Schema(
  {

    mobile: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{10}$/,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    verified_at: { type: Date, default: Date.now },
    deactivated_at: { type: Date, default: null },
  },
  { timestamps: true }
);

verifiedMobileSchema.pre(
  ["deleteOne", "deleteMany", "findOneAndDelete"],
  { query: true, document: false },
  async function () {
    throw new Error("Verified mobile history cannot be deleted.");
  }
);

module.exports = mongoose.model("VerifiedMobile", verifiedMobileSchema);