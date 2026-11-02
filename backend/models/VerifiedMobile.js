const mongoose = require("mongoose");

const verifiedMobileSchema = new mongoose.Schema(
  {
    // 10 అంకెల normalized number. unique index = DB స్థాయి రక్షణ.
    // ACTIVE మరియు INACTIVE రెండూ "USED".
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

// History ఎప్పుడూ delete కాకూడదు (query స్థాయి delete లు block)
verifiedMobileSchema.pre(
  ["deleteOne", "deleteMany", "findOneAndDelete"],
  { query: true, document: false },
  async function () {
    throw new Error("Verified mobile history cannot be deleted.");
  }
);

module.exports = mongoose.model("VerifiedMobile", verifiedMobileSchema);