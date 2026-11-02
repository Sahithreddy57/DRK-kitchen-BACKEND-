

const mongoose = require("mongoose");

const ALLOWED_MEMBER_COUNTS = [5, 10, 15, 25];

const hundiPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    package_type: {
      type: String,
      enum: ["HUNDI", "WEEKLY_HUNDI"],
      default: "HUNDI",
      required: true,
    },

    member_count: {
      type: Number,
      required: true,
      enum: {
        values: ALLOWED_MEMBER_COUNTS,
        message: "Member count must be 5, 10, 15, or 25.",
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image_url: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    display_order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

hundiPackageSchema.index({
  status: 1,
  package_type: 1,
  display_order: 1,
  member_count: 1,
});

module.exports = mongoose.model("HundiPackage", hundiPackageSchema);
